from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import random

from auth import get_current_user
from database import db
from services.email_service import email_service

router = APIRouter(prefix="/verification", tags=["verification"])

class VehicleVerificationRequest(BaseModel):
    vehicle_id: str
    verification_type: str = "basic"  # basic, premium, full
    documents: List[str] = []  # Document URLs
    notes: Optional[str] = ""

class VerificationReport(BaseModel):
    id: str
    vehicle_id: str
    verification_type: str
    status: str  # pending, in_progress, completed, failed
    score: Optional[int] = None  # 1-100
    report_data: Dict[str, Any]
    documents: List[str]
    inspector_notes: str
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]

class VINCheckResult(BaseModel):
    vin: str
    is_valid: bool
    manufacturer: Optional[str]
    model: Optional[str]
    year: Optional[int]
    engine: Optional[str]
    issues: List[str] = []
    history: Dict[str, Any] = {}

@router.post("/vin-check", response_model=VINCheckResult)
async def check_vin_number(
    vin: str,
    current_user: dict = Depends(get_current_user)
):
    """Проверить VIN номер автомобиля"""
    try:
        # Базовая валидация VIN
        if len(vin) != 17:
            raise HTTPException(status_code=400, detail="VIN номер должен содержать 17 символов")
        
        # Mock VIN check (в реальности интеграция с внешними сервисами)
        mock_data = {
            "vin": vin.upper(),
            "is_valid": True,
            "manufacturer": random.choice(["BMW", "Mercedes-Benz", "Audi", "Toyota", "Volkswagen"]),
            "model": random.choice(["X5", "C-Class", "A4", "Camry", "Golf"]),
            "year": random.randint(2015, 2024),
            "engine": random.choice(["2.0L Turbo", "3.0L V6", "2.5L Hybrid", "1.8L"]),
            "issues": [],
            "history": {
                "accidents": random.randint(0, 2),
                "owners": random.randint(1, 3),
                "service_records": random.randint(5, 20),
                "mileage_consistent": True,
                "title_issues": False
            }
        }
        
        # Добавляем случайные проблемы для реалистичности
        potential_issues = [
            "Найдены записи о мелких ДТП",
            "Нерегулярное обслуживание в период 2019-2020",
            "Замена двигателя в 2021 году",
            "Перекраска правого крыла"
        ]
        
        if random.random() < 0.3:  # 30% шанс наличия проблем
            mock_data["issues"] = random.sample(potential_issues, random.randint(1, 2))
        
        # Запись в историю проверок
        check_record = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "vin": vin.upper(),
            "result": mock_data,
            "created_at": datetime.utcnow()
        }
        await db.db.vin_checks.insert_one(check_record)
        
        return VINCheckResult(**mock_data)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка проверки VIN: {str(e)}")

@router.post("/request", response_model=dict)
async def request_vehicle_verification(
    request: VehicleVerificationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Запросить верификацию автомобиля"""
    try:
        # Проверяем что автомобиль существует
        vehicle = await db.db.vehicles.find_one({"id": request.vehicle_id})
        if not vehicle:
            raise HTTPException(status_code=404, detail="Автомобиль не найден")
        
        # Проверяем права доступа (только владелец или дилер)
        if current_user.role == "dealer":
            dealer = await db.db.dealers.find_one({"user_id": current_user.id})
            if not dealer or vehicle["dealer_id"] != dealer["id"]:
                raise HTTPException(status_code=403, detail="Доступ запрещен")
        else:
            raise HTTPException(status_code=403, detail="Только дилеры могут запрашивать верификацию")
        
        # Создаем запрос на верификацию
        verification_id = str(uuid.uuid4())
        verification_doc = {
            "id": verification_id,
            "vehicle_id": request.vehicle_id,
            "dealer_id": vehicle["dealer_id"],
            "verification_type": request.verification_type,
            "status": "pending",
            "score": None,
            "report_data": {},
            "documents": request.documents,
            "inspector_notes": "",
            "notes": request.notes,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=365)  # Действует год
        }
        
        await db.db.vehicle_verifications.insert_one(verification_doc)
        
        # Определяем стоимость верификации
        verification_prices = {
            "basic": 2500,
            "premium": 5000,
            "full": 10000
        }
        
        price = verification_prices.get(request.verification_type, 2500)
        
        return {
            "success": True,
            "verification_id": verification_id,
            "price": price,
            "estimated_completion": "2-3 рабочих дня",
            "message": "Запрос на верификацию создан. Наш инспектор свяжется с вами для осмотра."
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка создания запроса: {str(e)}")

@router.get("/vehicle/{vehicle_id}", response_model=Optional[VerificationReport])
async def get_vehicle_verification(vehicle_id: str):
    """Получить отчет о верификации автомобиля"""
    try:
        verification = await db.db.vehicle_verifications.find_one({"vehicle_id": vehicle_id})
        if not verification:
            return None
        
        return VerificationReport(
            id=verification["id"],
            vehicle_id=verification["vehicle_id"],
            verification_type=verification["verification_type"],
            status=verification["status"],
            score=verification.get("score"),
            report_data=verification.get("report_data", {}),
            documents=verification.get("documents", []),
            inspector_notes=verification.get("inspector_notes", ""),
            created_at=verification["created_at"],
            updated_at=verification["updated_at"],
            expires_at=verification.get("expires_at")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения верификации: {str(e)}")

@router.get("/pricing", response_model=Dict[str, Any])
async def get_verification_pricing():
    """Получить цены на верификацию"""
    return {
        "packages": {
            "basic": {
                "name": "Базовая проверка",
                "price": 2500,
                "duration": "1-2 дня",
                "features": [
                    "Проверка документов",
                    "Внешний осмотр",
                    "Проверка VIN",
                    "Базовый технический осмотр",
                    "Фотоотчет"
                ]
            },
            "premium": {
                "name": "Расширенная проверка",
                "price": 5000,
                "duration": "2-3 дня",
                "features": [
                    "Все из базовой проверки",
                    "Диагностика двигателя",
                    "Проверка ходовой части",
                    "Тест-драйв с инспектором",
                    "Оценка рыночной стоимости",
                    "История обслуживания"
                ]
            },
            "full": {
                "name": "Полная экспертиза",
                "price": 10000,
                "duration": "3-5 дней",
                "features": [
                    "Все из расширенной проверки",
                    "Компьютерная диагностика",
                    "Проверка всех систем",
                    "Лакокрасочное покрытие",
                    "Экспертное заключение",
                    "Гарантийное письмо",
                    "Рекомендации по обслуживанию"
                ]
            }
        }
    }

@router.put("/{verification_id}/complete", response_model=dict)
async def complete_verification(
    verification_id: str,
    score: int,
    report_data: Dict[str, Any],
    inspector_notes: str,
    current_user: dict = Depends(get_current_user)
):
    """Завершить верификацию (только для инспекторов/админов)"""
    try:
        # Проверка прав доступа (в реальности только инспекторы)
        if current_user.role not in ["admin", "inspector"]:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        
        # Обновляем верификацию
        result = await db.db.vehicle_verifications.update_one(
            {"id": verification_id},
            {
                "$set": {
                    "status": "completed",
                    "score": min(100, max(0, score)),
                    "report_data": report_data,
                    "inspector_notes": inspector_notes,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Верификация не найдена")
        
        # Обновляем автомобиль
        verification_status = "verified" if score >= 70 else "needs_attention"
        await db.db.vehicles.update_one(
            {"id": verification_id},
            {
                "$set": {
                    "verification_status": verification_status,
                    "verification_score": score,
                    "verified_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Верификация завершена",
            "score": score,
            "status": verification_status
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка завершения верификации: {str(e)}")

@router.get("/history", response_model=List[dict])
async def get_user_verification_history(current_user: dict = Depends(get_current_user)):
    """Получить историю верификаций пользователя"""
    try:
        history = []
        
        if current_user.role == "dealer":
            # Для дилеров - их верификации
            dealer = await db.db.dealers.find_one({"user_id": current_user.id})
            if dealer:
                async for verification in db.db.vehicle_verifications.find(
                    {"dealer_id": dealer["id"]}
                ).sort("created_at", -1):
                    vehicle = await db.db.vehicles.find_one({"id": verification["vehicle_id"]})
                    history.append({
                        "id": verification["id"],
                        "vehicle_info": f"{vehicle.get('make', '')} {vehicle.get('model', '')} {vehicle.get('year', '')}" if vehicle else "Неизвестно",
                        "type": verification["verification_type"],
                        "status": verification["status"],
                        "score": verification.get("score"),
                        "created_at": verification["created_at"],
                        "expires_at": verification.get("expires_at")
                    })
        else:
            # For buyers - VIN checks
            async for check in db.db.vin_checks.find(
                {"user_id": current_user.id}
            ).sort("created_at", -1):
                history.append({
                    "id": check["id"],
                    "vin": check["vin"],
                    "type": "vin_check",
                    "result": check["result"],
                    "created_at": check["created_at"]
                })
        
        return history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения истории: {str(e)}")