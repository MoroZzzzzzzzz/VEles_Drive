from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import re
import random

from auth import get_current_user
from database import db

router = APIRouter(prefix="/search", tags=["advanced_search"])

class SmartSearchQuery(BaseModel):
    query: str
    max_results: int = 20
    filters: Dict[str, Any] = {}
    sort_by: str = "relevance"  # relevance, price, year, mileage
    sort_order: str = "desc"

class SearchSuggestion(BaseModel):
    text: str
    type: str  # make, model, category, feature
    count: int

class SavedSearch(BaseModel):
    name: str
    query: SmartSearchQuery
    notifications: bool = True

class SearchResult(BaseModel):
    vehicles: List[Dict[str, Any]]
    total_count: int
    search_time: float
    suggestions: List[SearchSuggestion]
    filters_applied: Dict[str, Any]
    similar_searches: List[str]

@router.post("/smart", response_model=SearchResult)
async def smart_search(
    search_query: SmartSearchQuery,
    current_user: dict = Depends(get_current_user)
):
    """Умный поиск с обработкой естественного языка"""
    try:
        start_time = datetime.now()
        
        # Парсим естественный язык
        parsed_query = parse_natural_language_query(search_query.query)
        
        # Строим MongoDB query
        mongo_query = build_mongo_query(parsed_query, search_query.filters)
        
        # Выполняем поиск
        vehicles = []
        total_count = await db.db.vehicles.count_documents(mongo_query)
        
        # Определяем сортировку
        sort_field, sort_direction = get_sort_params(search_query.sort_by, search_query.sort_order)
        
        async for vehicle in db.db.vehicles.find(mongo_query).sort(sort_field, sort_direction).limit(search_query.max_results):
            # Получаем данные дилера
            dealer = await db.db.dealers.find_one({"id": vehicle["dealer_id"]})
            dealer_info = {
                "name": dealer.get("company_name", "Неизвестный дилер") if dealer else "Неизвестный дилер",
                "rating": dealer.get("rating", 0) if dealer else 0
            }
            
            # Добавляем релевантность (mock)
            relevance_score = calculate_relevance_score(vehicle, parsed_query)
            
            vehicle_data = {
                **vehicle,
                "dealer_info": dealer_info,
                "relevance_score": relevance_score,
                "match_reasons": get_match_reasons(vehicle, parsed_query)
            }
            vehicles.append(vehicle_data)
        
        # Генерируем предложения
        suggestions = await generate_search_suggestions(search_query.query)
        
        # Похожие поисковые запросы
        similar_searches = get_similar_searches(search_query.query)
        
        search_time = (datetime.now() - start_time).total_seconds()
        
        # Сохраняем в историю поиска
        await save_search_to_history(current_user.id, search_query, total_count)
        
        return SearchResult(
            vehicles=vehicles,
            total_count=total_count,
            search_time=search_time,
            suggestions=suggestions,
            filters_applied=search_query.filters,
            similar_searches=similar_searches
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка поиска: {str(e)}")

@router.get("/suggestions", response_model=List[SearchSuggestion])
async def get_search_suggestions(
    query: str = Query(..., min_length=2),
    limit: int = 10
):
    """Получить автодополнение для поиска"""
    try:
        suggestions = []
        
        # Поиск по маркам
        makes_pipeline = [
            {"$match": {"make": {"$regex": query, "$options": "i"}}},
            {"$group": {"_id": "$make", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit // 2}
        ]
        
        async for make in db.db.vehicles.aggregate(makes_pipeline):
            suggestions.append(SearchSuggestion(
                text=make["_id"],
                type="make",
                count=make["count"]
            ))
        
        # Поиск по моделям
        models_pipeline = [
            {"$match": {"model": {"$regex": query, "$options": "i"}}},
            {"$group": {"_id": "$model", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit // 2}
        ]
        
        async for model in db.db.vehicles.aggregate(models_pipeline):
            suggestions.append(SearchSuggestion(
                text=model["_id"],
                type="model",
                count=model["count"]
            ))
        
        # Добавляем популярные запросы если мало результатов
        if len(suggestions) < limit:
            popular_queries = [
                "BMW седан до 3 миллионов",
                "Mercedes кроссовер новый",
                "Audi купе спорткар",
                "Toyota гибрид экономичный",
                "Внедорожник полный привод"
            ]
            
            for popular in popular_queries[:limit - len(suggestions)]:
                if query.lower() in popular.lower():
                    suggestions.append(SearchSuggestion(
                        text=popular,
                        type="popular",
                        count=random.randint(10, 50)
                    ))
        
        return sorted(suggestions, key=lambda x: x.count, reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения подсказок: {str(e)}")

@router.post("/save", response_model=dict)
async def save_search(
    saved_search: SavedSearch,
    current_user: dict = Depends(get_current_user)
):
    """Сохранить поисковый запрос"""
    try:
        search_id = str(uuid.uuid4())
        search_doc = {
            "id": search_id,
            "user_id": current_user.id,
            "name": saved_search.name,
            "query": saved_search.query.dict(),
            "notifications": saved_search.notifications,
            "created_at": datetime.utcnow(),
            "last_executed": datetime.utcnow()
        }
        
        await db.db.saved_searches.insert_one(search_doc)
        
        return {
            "success": True,
            "search_id": search_id,
            "message": "Поиск сохранен"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения поиска: {str(e)}")

@router.get("/saved", response_model=List[dict])
async def get_saved_searches(current_user: dict = Depends(get_current_user)):
    """Получить сохраненные поиски пользователя"""
    try:
        searches = []
        async for search in db.db.saved_searches.find({"user_id": current_user.id}).sort("created_at", -1):
            searches.append({
                "id": search["id"],
                "name": search["name"],
                "query": search["query"],
                "notifications": search["notifications"],
                "created_at": search["created_at"],
                "last_executed": search.get("last_executed")
            })
        
        return searches
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения сохраненных поисков: {str(e)}")

@router.get("/history", response_model=List[dict])
async def get_search_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Получить историю поиска пользователя"""
    try:
        history = []
        async for search in db.db.search_history.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).limit(limit):
            history.append({
                "query": search["query"],
                "results_count": search["results_count"],
                "created_at": search["created_at"]
            })
        
        return history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения истории: {str(e)}")

@router.get("/trending", response_model=List[dict])
async def get_trending_searches():
    """Получить популярные поисковые запросы"""
    try:
        # Mock трендовых запросов (в реальности агрегация из БД)
        trending = [
            {"query": "BMW X5 2023", "growth": 45, "count": 1247},
            {"query": "Mercedes E-Class новый", "growth": 32, "count": 892},
            {"query": "Электромобили Tesla", "growth": 78, "count": 634},
            {"query": "Спорткары Porsche", "growth": 23, "count": 445},
            {"query": "Внедорожники до 5 млн", "growth": 56, "count": 823},
            {"query": "Гибриды Toyota Prius", "growth": 67, "count": 356},
            {"query": "Audi купе красный", "growth": 12, "count": 278}
        ]
        
        return sorted(trending, key=lambda x: x["growth"], reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения трендов: {str(e)}")

def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """Парсинг естественного языка в параметры поиска"""
    parsed = {
        "make": None,
        "model": None,
        "price_range": None,
        "year_range": None,
        "body_type": None,
        "fuel_type": None,
        "condition": None,
        "features": []
    }
    
    query_lower = query.lower()
    
    # Марки автомобилей
    brands = ["bmw", "mercedes", "audi", "toyota", "volkswagen", "porsche", "lexus", "volvo"]
    for brand in brands:
        if brand in query_lower:
            parsed["make"] = brand.upper()
            break
    
    # Цена
    price_patterns = [
        r"до (\d+)\s*(?:млн|миллион)",
        r"от (\d+)\s*до\s*(\d+)\s*(?:млн|миллион)",
        r"(\d+)\s*(?:млн|миллион)"
    ]
    
    for pattern in price_patterns:
        match = re.search(pattern, query_lower)
        if match:
            if len(match.groups()) == 1:
                parsed["price_range"] = {"max": int(match.group(1)) * 1000000}
            else:
                parsed["price_range"] = {
                    "min": int(match.group(1)) * 1000000,
                    "max": int(match.group(2)) * 1000000
                }
            break
    
    # Тип кузова
    body_types = {
        "седан": "sedan",
        "кроссовер": "crossover",
        "внедорожник": "suv",
        "купе": "coupe",
        "кабриолет": "convertible",
        "хэтчбек": "hatchback"
    }
    
    for russian, english in body_types.items():
        if russian in query_lower:
            parsed["body_type"] = english
            break
    
    # Состояние
    if "новый" in query_lower or "новая" in query_lower:
        parsed["condition"] = "new"
    elif "б/у" in query_lower or "подержанный" in query_lower:
        parsed["condition"] = "used"
    
    # Тип топлива
    fuel_types = {
        "бензин": "gasoline",
        "дизель": "diesel", 
        "гибрид": "hybrid",
        "электро": "electric"
    }
    
    for russian, english in fuel_types.items():
        if russian in query_lower:
            parsed["fuel_type"] = english
            break
    
    return parsed

def build_mongo_query(parsed_query: Dict[str, Any], additional_filters: Dict[str, Any]) -> Dict[str, Any]:
    """Построение MongoDB запроса"""
    query = {}
    
    if parsed_query.get("make"):
        query["make"] = {"$regex": parsed_query["make"], "$options": "i"}
    
    if parsed_query.get("model"):
        query["model"] = {"$regex": parsed_query["model"], "$options": "i"}
    
    if parsed_query.get("price_range"):
        price_query = {}
        if "min" in parsed_query["price_range"]:
            price_query["$gte"] = parsed_query["price_range"]["min"]
        if "max" in parsed_query["price_range"]:
            price_query["$lte"] = parsed_query["price_range"]["max"]
        query["price"] = price_query
    
    if parsed_query.get("body_type"):
        query["body_type"] = parsed_query["body_type"]
    
    if parsed_query.get("fuel_type"):
        query["fuel_type"] = parsed_query["fuel_type"]
    
    if parsed_query.get("condition"):
        query["condition"] = parsed_query["condition"]
    
    # Добавляем дополнительные фильтры
    query.update(additional_filters)
    
    return query

def get_sort_params(sort_by: str, sort_order: str) -> tuple:
    """Получить параметры сортировки"""
    sort_fields = {
        "price": "price",
        "year": "year", 
        "mileage": "mileage",
        "relevance": "created_at"  # По умолчанию по дате
    }
    
    field = sort_fields.get(sort_by, "created_at")
    direction = -1 if sort_order == "desc" else 1
    
    return field, direction

def calculate_relevance_score(vehicle: Dict[str, Any], parsed_query: Dict[str, Any]) -> float:
    """Расчет релевантности (упрощенный)"""
    score = 50.0  # Базовая релевантность
    
    # Бонусы за совпадения
    if parsed_query.get("make") and vehicle.get("make", "").lower() == parsed_query["make"].lower():
        score += 20
    
    if parsed_query.get("body_type") and vehicle.get("body_type") == parsed_query["body_type"]:
        score += 15
    
    if parsed_query.get("fuel_type") and vehicle.get("fuel_type") == parsed_query["fuel_type"]:
        score += 10
    
    # Штрафы
    if vehicle.get("condition") == "used" and parsed_query.get("condition") == "new":
        score -= 25
    
    return min(100, max(0, score))

def get_match_reasons(vehicle: Dict[str, Any], parsed_query: Dict[str, Any]) -> List[str]:
    """Получить причины соответствия запросу"""
    reasons = []
    
    if parsed_query.get("make") and vehicle.get("make", "").lower() == parsed_query["make"].lower():
        reasons.append(f"Марка: {vehicle['make']}")
    
    if parsed_query.get("price_range"):
        price = vehicle.get("price", 0)
        if "min" in parsed_query["price_range"] and price >= parsed_query["price_range"]["min"]:
            reasons.append("Цена в указанном диапазоне")
    
    return reasons

async def generate_search_suggestions(query: str) -> List[SearchSuggestion]:
    """Генерация предложений по поиску"""
    suggestions = []
    
    # Mock suggestions
    common_suggestions = [
        SearchSuggestion(text="Добавить фильтр по году", type="filter", count=0),
        SearchSuggestion(text="Поиск похожих автомобилей", type="similar", count=0),
        SearchSuggestion(text="Сохранить этот поиск", type="save", count=0)
    ]
    
    return common_suggestions

def get_similar_searches(query: str) -> List[str]:
    """Получить похожие поисковые запросы"""
    similar = [
        "BMW седан премиум",
        "Немецкие автомобили люкс",
        "Спортивные седаны",
        "Автомобили бизнес класса"
    ]
    
    return similar[:3]

async def save_search_to_history(user_id: str, search_query: SmartSearchQuery, results_count: int):
    """Сохранить поиск в историю"""
    try:
        history_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "query": search_query.query,
            "filters": search_query.filters,
            "results_count": results_count,
            "created_at": datetime.utcnow()
        }
        
        await db.db.search_history.insert_one(history_doc)
    except Exception as e:
        print(f"Error saving search history: {e}")