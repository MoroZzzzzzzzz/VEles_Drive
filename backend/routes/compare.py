from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid

from auth import get_current_user
from database import db

router = APIRouter(prefix="/compare", tags=["compare"])

class CompareVehicle(BaseModel):
    id: str
    make: str
    model: str
    year: int
    price: float
    currency: str
    condition: str
    mileage: Optional[int]
    engine: Optional[str]
    transmission: Optional[str]
    fuel_type: Optional[str]
    power: Optional[int]
    body_type: Optional[str]
    drive_type: Optional[str]
    color: Optional[str]
    images: List[str]
    dealer_name: str
    dealer_rating: Optional[float]

class ComparisonResponse(BaseModel):
    id: str
    user_id: str
    vehicle_ids: List[str]
    vehicles: List[CompareVehicle]
    created_at: datetime
    updated_at: datetime

@router.post("/", response_model=dict)
async def create_comparison(
    vehicle_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Создать сравнение автомобилей"""
    try:
        if len(vehicle_ids) < 2:
            raise HTTPException(status_code=400, detail="Для сравнения нужно минимум 2 автомобиля")
        
        if len(vehicle_ids) > 4:
            raise HTTPException(status_code=400, detail="Максимум 4 автомобиля для сравнения")
        
        # Проверяем что все автомобили существуют
        vehicles = []
        for vehicle_id in vehicle_ids:
            vehicle = await db.db.vehicles.find_one({"id": vehicle_id})
            if not vehicle:
                raise HTTPException(status_code=404, detail=f"Автомобиль {vehicle_id} не найден")
            vehicles.append(vehicle)
        
        # Удаляем предыдущие сравнения пользователя (оставляем только одно активное)
        await db.db.comparisons.delete_many({"user_id": current_user.id})
        
        # Создаем новое сравнение
        comparison_id = str(uuid.uuid4())
        comparison_doc = {
            "id": comparison_id,
            "user_id": current_user.id,
            "vehicle_ids": vehicle_ids,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.comparisons.insert_one(comparison_doc)
        
        return {
            "success": True,
            "comparison_id": comparison_id,
            "message": "Сравнение создано"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка создания сравнения: {str(e)}")

@router.get("/", response_model=Optional[ComparisonResponse])
async def get_comparison(current_user: dict = Depends(get_current_user)):
    """Получить текущее сравнение пользователя"""
    try:
        comparison = await db.db.comparisons.find_one({"user_id": current_user.id})
        if not comparison:
            return None
        
        # Получаем данные автомобилей
        vehicles = []
        for vehicle_id in comparison["vehicle_ids"]:
            vehicle = await db.db.vehicles.find_one({"id": vehicle_id})
            if vehicle:
                # Получаем данные дилера
                dealer = await db.db.dealers.find_one({"id": vehicle["dealer_id"]})
                dealer_name = dealer.get("company_name", "Неизвестный дилер") if dealer else "Неизвестный дилер"
                dealer_rating = dealer.get("rating", 0) if dealer else 0
                
                vehicles.append(CompareVehicle(
                    id=vehicle["id"],
                    make=vehicle["make"],
                    model=vehicle["model"],
                    year=vehicle["year"],
                    price=vehicle["price"],
                    currency=vehicle.get("currency", "RUB"),
                    condition=vehicle.get("condition", "used"),
                    mileage=vehicle.get("mileage"),
                    engine=vehicle.get("engine"),
                    transmission=vehicle.get("transmission"),
                    fuel_type=vehicle.get("fuel_type"),
                    power=vehicle.get("power"),
                    body_type=vehicle.get("body_type"),
                    drive_type=vehicle.get("drive_type"),
                    color=vehicle.get("color"),
                    images=vehicle.get("images", []),
                    dealer_name=dealer_name,
                    dealer_rating=dealer_rating
                ))
        
        return ComparisonResponse(
            id=comparison["id"],
            user_id=comparison["user_id"],
            vehicle_ids=comparison["vehicle_ids"],
            vehicles=vehicles,
            created_at=comparison["created_at"],
            updated_at=comparison["updated_at"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения сравнения: {str(e)}")

@router.put("/", response_model=dict)
async def update_comparison(
    vehicle_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Обновить сравнение автомобилей"""
    try:
        if len(vehicle_ids) < 2:
            raise HTTPException(status_code=400, detail="Для сравнения нужно минимум 2 автомобиля")
        
        if len(vehicle_ids) > 4:
            raise HTTPException(status_code=400, detail="Максимум 4 автомобиля для сравнения")
        
        # Проверяем что все автомобили существуют
        for vehicle_id in vehicle_ids:
            vehicle = await db.db.vehicles.find_one({"id": vehicle_id})
            if not vehicle:
                raise HTTPException(status_code=404, detail=f"Автомобиль {vehicle_id} не найден")
        
        # Обновляем существующее сравнение или создаем новое
        result = await db.db.comparisons.update_one(
            {"user_id": current_user.id},
            {
                "$set": {
                    "vehicle_ids": vehicle_ids,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Сравнение обновлено"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка обновления сравнения: {str(e)}")

@router.delete("/", response_model=dict)
async def clear_comparison(current_user: dict = Depends(get_current_user)):
    """Очистить сравнение"""
    try:
        await db.db.comparisons.delete_many({"user_id": current_user.id})
        
        return {
            "success": True,
            "message": "Сравнение очищено"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка очистки сравнения: {str(e)}")

@router.delete("/{vehicle_id}", response_model=dict)
async def remove_from_comparison(
    vehicle_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Удалить автомобиль из сравнения"""
    try:
        comparison = await db.db.comparisons.find_one({"user_id": current_user.id})
        if not comparison:
            raise HTTPException(status_code=404, detail="Сравнение не найдено")
        
        vehicle_ids = comparison["vehicle_ids"]
        if vehicle_id not in vehicle_ids:
            raise HTTPException(status_code=404, detail="Автомобиль не найден в сравнении")
        
        # Удаляем автомобиль из списка
        vehicle_ids.remove(vehicle_id)
        
        if len(vehicle_ids) < 2:
            # Если остался только один автомобиль, удаляем все сравнение
            await db.db.comparisons.delete_one({"user_id": current_user.id})
            return {
                "success": True,
                "message": "Сравнение удалено (осталось менее 2 автомобилей)"
            }
        else:
            # Обновляем сравнение
            await db.db.comparisons.update_one(
                {"user_id": current_user.id},
                {
                    "$set": {
                        "vehicle_ids": vehicle_ids,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return {
                "success": True,
                "message": "Автомобиль удален из сравнения"
            }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка удаления из сравнения: {str(e)}")

@router.get("/features", response_model=Dict[str, Any])
async def get_comparison_features():
    """Получить список характеристик для сравнения"""
    try:
        features = {
            "basic": {
                "name": "Основные характеристики",
                "fields": [
                    {"key": "make", "name": "Марка"},
                    {"key": "model", "name": "Модель"},
                    {"key": "year", "name": "Год выпуска"},
                    {"key": "price", "name": "Цена"},
                    {"key": "condition", "name": "Состояние"},
                    {"key": "mileage", "name": "Пробег", "unit": "км"},
                ]
            },
            "technical": {
                "name": "Технические характеристики",
                "fields": [
                    {"key": "engine", "name": "Двигатель"},
                    {"key": "power", "name": "Мощность", "unit": "л.с."},
                    {"key": "transmission", "name": "Коробка передач"},
                    {"key": "fuel_type", "name": "Тип топлива"},
                    {"key": "drive_type", "name": "Привод"},
                ]
            },
            "design": {
                "name": "Дизайн",
                "fields": [
                    {"key": "body_type", "name": "Тип кузова"},
                    {"key": "color", "name": "Цвет"},
                ]
            },
            "dealer": {
                "name": "Дилер",
                "fields": [
                    {"key": "dealer_name", "name": "Название"},
                    {"key": "dealer_rating", "name": "Рейтинг", "unit": "★"},
                ]
            }
        }
        
        return features
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения характеристик: {str(e)}")