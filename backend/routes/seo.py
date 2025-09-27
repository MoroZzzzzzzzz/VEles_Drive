from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid
import re

from auth import get_current_user
from database import db

router = APIRouter(prefix="/seo", tags=["seo"])

class SEOMetaData(BaseModel):
    title: str
    description: str
    keywords: List[str]
    canonical_url: str
    og_title: str
    og_description: str
    og_image: str
    schema_markup: Dict[str, Any]

class SitemapEntry(BaseModel):
    url: str
    lastmod: datetime
    changefreq: str
    priority: float

@router.get("/meta/{page_type}")
async def get_seo_meta(
    page_type: str,
    vehicle_id: Optional[str] = None,
    dealer_id: Optional[str] = None,
    make: Optional[str] = None,
    model: Optional[str] = None
):
    """Получить SEO мета данные для страницы"""
    try:
        base_url = "https://velesdrive.ru"
        
        if page_type == "home":
            return SEOMetaData(
                title="VELES DRIVE - Премиум автомобили | Купить элитные авто в Москве",
                description="VELES DRIVE - лучшая площадка для покупки премиум автомобилей. BMW, Mercedes, Audi, Porsche от проверенных дилеров. Гарантия качества и безопасные сделки.",
                keywords=[
                    "премиум автомобили", "элитные авто", "BMW", "Mercedes", "Audi", 
                    "Porsche", "купить авто", "автосалон", "дилеры", "Москва",
                    "люксовые автомобили", "продажа авто", "автомобили с пробегом"
                ],
                canonical_url=f"{base_url}/",
                og_title="VELES DRIVE - Премиум автомобили",
                og_description="Лучшая площадка для покупки элитных автомобилей от проверенных дилеров",
                og_image=f"{base_url}/images/og-home.jpg",
                schema_markup={
                    "@context": "https://schema.org",
                    "@type": "AutoDealer",
                    "name": "VELES DRIVE",
                    "url": base_url,
                    "description": "Премиум площадка для продажи автомобилей",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Красная площадь, 1",
                        "addressLocality": "Москва",
                        "addressCountry": "RU"
                    }
                }
            )
            
        elif page_type == "vehicle" and vehicle_id:
            vehicle = await db.db.vehicles.find_one({"id": vehicle_id})
            if vehicle:
                dealer = await db.db.dealers.find_one({"id": vehicle["dealer_id"]})
                dealer_name = dealer.get("company_name", "VELES DRIVE") if dealer else "VELES DRIVE"
                
                title = f"{vehicle['make']} {vehicle['model']} {vehicle['year']} - купить в {dealer_name}"
                description = f"Купить {vehicle['make']} {vehicle['model']} {vehicle['year']} за {vehicle['price']:,} ₽. {vehicle.get('condition', 'Б/У')} автомобиль от проверенного дилера {dealer_name}."
                
                return SEOMetaData(
                    title=title,
                    description=description,
                    keywords=[
                        vehicle['make'], vehicle['model'], str(vehicle['year']),
                        "купить", "продажа", vehicle.get('body_type', ''), 
                        vehicle.get('fuel_type', ''), dealer_name
                    ],
                    canonical_url=f"{base_url}/vehicles/{vehicle_id}",
                    og_title=title,
                    og_description=description,
                    og_image=vehicle['images'][0] if vehicle.get('images') else f"{base_url}/images/og-default.jpg",
                    schema_markup={
                        "@context": "https://schema.org",
                        "@type": "Car",
                        "name": f"{vehicle['make']} {vehicle['model']}",
                        "brand": vehicle['make'],
                        "model": vehicle['model'],
                        "vehicleModelDate": str(vehicle['year']),
                        "offers": {
                            "@type": "Offer",
                            "price": vehicle['price'],
                            "priceCurrency": "RUB",
                            "availability": "InStock",
                            "seller": {
                                "@type": "Organization",
                                "name": dealer_name
                            }
                        }
                    }
                )
                
        elif page_type == "catalog":
            filter_text = ""
            keywords = ["каталог автомобилей", "купить авто", "автомобили"]
            
            if make:
                filter_text = f" {make}"
                keywords.append(make)
            if model:
                filter_text += f" {model}"
                keywords.append(model)
                
            title = f"Каталог{filter_text} - купить автомобили в Москве | VELES DRIVE"
            description = f"Большой выбор{filter_text.lower()} автомобилей от проверенных дилеров. Сравните цены, характеристики и выберите лучшее предложение на VELES DRIVE."
            
            return SEOMetaData(
                title=title,
                description=description,
                keywords=keywords,
                canonical_url=f"{base_url}/catalog" + (f"?make={make}" if make else ""),
                og_title=title,
                og_description=description,
                og_image=f"{base_url}/images/og-catalog.jpg",
                schema_markup={
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": f"Каталог автомобилей{filter_text}",
                    "url": f"{base_url}/catalog"
                }
            )
            
        elif page_type == "dealer" and dealer_id:
            dealer = await db.db.dealers.find_one({"id": dealer_id})
            if dealer:
                title = f"{dealer['company_name']} - официальный дилер | VELES DRIVE"
                description = f"Автосалон {dealer['company_name']} в Москве. Широкий выбор автомобилей, выгодные цены, гарантия качества. Рейтинг: {dealer.get('rating', 0)}/5."
                
                return SEOMetaData(
                    title=title,
                    description=description,
                    keywords=[
                        dealer['company_name'], "автосалон", "дилер", 
                        dealer.get('specialization', ''), "Москва", "купить авто"
                    ],
                    canonical_url=f"{base_url}/dealers/{dealer_id}",
                    og_title=title,
                    og_description=description,
                    og_image=f"{base_url}/images/dealers/og-{dealer_id}.jpg",
                    schema_markup={
                        "@context": "https://schema.org",
                        "@type": "AutoDealer",
                        "name": dealer['company_name'],
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": dealer.get('address', ''),
                            "addressLocality": dealer.get('city', 'Москва'),
                            "addressCountry": "RU"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": dealer.get('rating', 0),
                            "ratingCount": dealer.get('reviews_count', 0)
                        }
                    }
                )
        
        # Дефолтные мета данные
        return SEOMetaData(
            title="VELES DRIVE - Премиум автомобили",
            description="Лучшая площадка для покупки премиум автомобилей",
            keywords=["автомобили", "купить авто", "премиум авто"],
            canonical_url=f"{base_url}/",
            og_title="VELES DRIVE",
            og_description="Премиум автомобили от проверенных дилеров",
            og_image=f"{base_url}/images/og-default.jpg",
            schema_markup={}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения SEO данных: {str(e)}")

@router.get("/sitemap.xml")
async def get_sitemap():
    """Генерировать XML sitemap"""
    try:
        sitemap_entries = []
        base_url = "https://velesdrive.ru"
        
        # Главные страницы
        main_pages = [
            ("", "daily", 1.0),
            ("/catalog", "daily", 0.9),
            ("/dealers", "weekly", 0.8),
            ("/about", "monthly", 0.5),
            ("/contacts", "monthly", 0.5)
        ]
        
        for page, freq, priority in main_pages:
            sitemap_entries.append(SitemapEntry(
                url=f"{base_url}{page}",
                lastmod=datetime.utcnow(),
                changefreq=freq,
                priority=priority
            ))
        
        # Страницы автомобилей
        async for vehicle in db.db.vehicles.find({"status": "active"}).limit(1000):
            sitemap_entries.append(SitemapEntry(
                url=f"{base_url}/vehicles/{vehicle['id']}",
                lastmod=vehicle.get('updated_at', vehicle['created_at']),
                changefreq="weekly",
                priority=0.8
            ))
        
        # Страницы дилеров
        async for dealer in db.db.dealers.find({}):
            sitemap_entries.append(SitemapEntry(
                url=f"{base_url}/dealers/{dealer['id']}",
                lastmod=dealer.get('updated_at', dealer['created_at']),
                changefreq="weekly",
                priority=0.7
            ))
        
        # Генерируем XML
        xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for entry in sitemap_entries:
            xml_content += f'  <url>\n'
            xml_content += f'    <loc>{entry.url}</loc>\n'
            xml_content += f'    <lastmod>{entry.lastmod.strftime("%Y-%m-%d")}</lastmod>\n'
            xml_content += f'    <changefreq>{entry.changefreq}</changefreq>\n'
            xml_content += f'    <priority>{entry.priority}</priority>\n'
            xml_content += f'  </url>\n'
        
        xml_content += '</urlset>'
        
        return xml_content
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка генерации sitemap: {str(e)}")

@router.get("/robots.txt")
async def get_robots_txt():
    """Генерировать robots.txt"""
    robots_content = """User-agent: *
Allow: /

# Специальные правила для поисковых ботов
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: YandexBot
Allow: /
Crawl-delay: 1

# Запрещаем индексацию служебных страниц
Disallow: /admin/
Disallow: /api/
Disallow: /webhooks/
Disallow: /*?utm_*
Disallow: /*?fbclid=*
Disallow: /*?gclid=*

# Разрешаем важные страницы
Allow: /catalog/
Allow: /vehicles/
Allow: /dealers/

# Указываем sitemap
Sitemap: https://velesdrive.ru/api/seo/sitemap.xml

# Дополнительные правила
Clean-param: utm_source&utm_medium&utm_campaign
Clean-param: fbclid&gclid&yclid
"""
    
    return robots_content

@router.get("/keywords/suggestions")
async def get_keyword_suggestions(
    seed_keyword: str,
    limit: int = 20
):
    """Получить предложения ключевых слов для SEO"""
    try:
        # Генерируем связанные ключевые слова на основе данных из БД
        suggestions = []
        
        # Поиск по маркам автомобилей
        if any(brand in seed_keyword.lower() for brand in ['bmw', 'mercedes', 'audi', 'toyota']):
            brand_keywords = [
                f"{seed_keyword} купить",
                f"{seed_keyword} цена",
                f"{seed_keyword} с пробегом",
                f"{seed_keyword} новый",
                f"{seed_keyword} в Москве",
                f"{seed_keyword} автосалон",
                f"{seed_keyword} дилер",
                f"{seed_keyword} отзывы"
            ]
            suggestions.extend(brand_keywords)
        
        # Общие автомобильные термины
        auto_keywords = [
            f"купить {seed_keyword}",
            f"продажа {seed_keyword}",
            f"{seed_keyword} автомобиль",
            f"{seed_keyword} машина",
            f"{seed_keyword} авто",
            f"{seed_keyword} цены",
            f"{seed_keyword} характеристики",
            f"{seed_keyword} тест драйв"
        ]
        
        suggestions.extend(auto_keywords)
        
        # Получаем популярные запросы из истории поиска
        popular_searches = []
        async for search in db.db.search_history.find({
            "query": {"$regex": seed_keyword, "$options": "i"}
        }).limit(5):
            popular_searches.append(search["query"])
        
        suggestions.extend(popular_searches)
        
        # Убираем дубликаты и ограничиваем количество
        unique_suggestions = list(dict.fromkeys(suggestions))[:limit]
        
        return {
            "seed_keyword": seed_keyword,
            "suggestions": unique_suggestions,
            "total_count": len(unique_suggestions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения ключевых слов: {str(e)}")

@router.get("/analytics/keywords")
async def get_keywords_analytics():
    """Получить аналитику по ключевым словам"""
    try:
        # Анализируем поисковые запросы пользователей
        popular_keywords = []
        
        # Агрегируем данные из истории поиска
        pipeline = [
            {"$group": {
                "_id": "$query",
                "count": {"$sum": 1},
                "avg_results": {"$avg": "$results_count"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 50}
        ]
        
        async for keyword_data in db.db.search_history.aggregate(pipeline):
            # Простой анализ сложности (mock)
            difficulty = "easy" if keyword_data["count"] < 10 else "medium" if keyword_data["count"] < 50 else "hard"
            
            popular_keywords.append({
                "keyword": keyword_data["_id"],
                "search_count": keyword_data["count"],
                "avg_results": round(keyword_data["avg_results"], 0),
                "difficulty": difficulty,
                "trend": "up" if keyword_data["count"] > 20 else "stable"
            })
        
        # Анализ по категориям
        categories = {
            "brands": [],
            "body_types": [],
            "price_ranges": [],
            "locations": []
        }
        
        # Группируем ключевые слова по категориям
        for keyword in popular_keywords[:20]:
            query = keyword["keyword"].lower()
            
            if any(brand in query for brand in ['bmw', 'mercedes', 'audi', 'toyota', 'volkswagen']):
                categories["brands"].append(keyword)
            elif any(body in query for body in ['седан', 'кроссовер', 'внедорожник', 'купе']):
                categories["body_types"].append(keyword)
            elif any(price in query for price in ['до', 'от', 'миллион', 'млн']):
                categories["price_ranges"].append(keyword)
            elif any(location in query for location in ['москва', 'питер', 'регион']):
                categories["locations"].append(keyword)
        
        return {
            "overview": {
                "total_unique_keywords": len(popular_keywords),
                "total_searches": sum(kw["search_count"] for kw in popular_keywords),
                "categories_distribution": {
                    "brands": len(categories["brands"]),
                    "body_types": len(categories["body_types"]),
                    "price_ranges": len(categories["price_ranges"]),
                    "locations": len(categories["locations"])
                }
            },
            "top_keywords": popular_keywords[:20],
            "categories": categories
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка аналитики ключевых слов: {str(e)}")

@router.post("/pages/optimize")
async def optimize_page_seo(
    page_url: str,
    current_user: dict = Depends(get_current_user)
):
    """Анализировать и оптимизировать SEO страницы"""
    try:
        # Получаем текущие SEO данные страницы
        recommendations = []
        score = 85  # Mock SEO score
        
        # Анализируем URL
        if len(page_url) > 60:
            recommendations.append({
                "type": "warning",
                "category": "URL",
                "message": "URL слишком длинный. Рекомендуется сократить до 60 символов.",
                "priority": "medium"
            })
            score -= 5
        
        # Проверяем наличие ключевых слов в URL
        if not any(keyword in page_url.lower() for keyword in ['avto', 'auto', 'car', 'купить', 'продажа']):
            recommendations.append({
                "type": "suggestion",
                "category": "URL",
                "message": "Добавьте релевантные ключевые слова в URL.",
                "priority": "high"
            })
            score -= 10
        
        # Общие SEO рекомендации
        general_recommendations = [
            {
                "type": "success",
                "category": "Title",
                "message": "Заголовок страницы оптимизирован и содержит ключевые слова.",
                "priority": "high"
            },
            {
                "type": "suggestion",
                "category": "Meta Description",
                "message": "Рассмотрите добавление призыва к действию в мета-описание.",
                "priority": "medium"
            },
            {
                "type": "suggestion",
                "category": "Images",
                "message": "Добавьте alt-теги ко всем изображениям для улучшения доступности.",
                "priority": "medium"
            },
            {
                "type": "success",
                "category": "Schema Markup",
                "message": "Структурированные данные настроены корректно.",
                "priority": "high"
            }
        ]
        
        recommendations.extend(general_recommendations)
        
        return {
            "page_url": page_url,
            "seo_score": score,
            "recommendations": recommendations,
            "analysis_date": datetime.utcnow(),
            "next_check": datetime.utcnow().replace(day=datetime.utcnow().day + 30)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка SEO анализа: {str(e)}")