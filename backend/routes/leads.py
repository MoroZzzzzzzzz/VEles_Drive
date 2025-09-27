from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid

from auth import get_current_user
from database import db
from services.email_service import email_service

router = APIRouter(prefix="/leads", tags=["leads"])

class TestDriveRequest(BaseModel):
    vehicle_id: str
    preferred_date: str
    preferred_time: str
    message: Optional[str] = ""
    phone: Optional[str] = ""

class PriceInquiryRequest(BaseModel):
    vehicle_id: str
    message: Optional[str] = ""
    phone: Optional[str] = ""

class CallbackRequest(BaseModel):
    dealer_id: str
    vehicle_id: Optional[str] = None
    message: Optional[str] = ""
    phone: str
    preferred_time: str

class LeadResponse(BaseModel):
    id: str
    type: str  # test_drive, price_inquiry, callback
    status: str  # new, contacted, completed, cancelled
    vehicle_id: Optional[str]
    dealer_id: str
    customer_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    message: str
    preferred_date: Optional[str]
    preferred_time: Optional[str]
    created_at: datetime
    updated_at: datetime

@router.post("/test-drive", response_model=dict)
async def request_test_drive(
    request: TestDriveRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Запросить тест-драйв"""
    try:
        # Получаем данные автомобиля
        vehicle = await db.db.vehicles.find_one({"id": request.vehicle_id})
        if not vehicle:
            raise HTTPException(status_code=404, detail="Автомобиль не найден")
        
        # Получаем данные дилера
        dealer = await db.db.dealers.find_one({"id": vehicle["dealer_id"]})
        if not dealer:
            raise HTTPException(status_code=404, detail="Дилер не найден")
        
        # Создаем заявку на тест-драйв
        lead_id = str(uuid.uuid4())
        lead_doc = {
            "id": lead_id,
            "type": "test_drive",
            "status": "new",
            "vehicle_id": request.vehicle_id,
            "dealer_id": vehicle["dealer_id"],
            "customer_id": current_user.id,
            "customer_name": f"{current_user.first_name} {current_user.last_name}".strip(),
            "customer_email": current_user.email,
            "customer_phone": request.phone or current_user.phone,
            "message": request.message,
            "preferred_date": request.preferred_date,
            "preferred_time": request.preferred_time,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.leads.insert_one(lead_doc)
        
        # Отправляем уведомление дилеру
        dealer_user = await db.db.users.find_one({"id": dealer["user_id"]})
        if dealer_user and dealer_user.get("email"):
            vehicle_info = {
                "make": vehicle.get("make", ""),
                "model": vehicle.get("model", ""),
                "year": vehicle.get("year", ""),
                "price_formatted": f"{vehicle.get('price', 0):,} ₽"
            }
            
            background_tasks.add_task(
                email_service.send_vehicle_inquiry_notification,
                dealer_user["email"],
                dealer.get("company_name", "Дилер"),
                lead_doc["customer_name"],
                lead_doc["customer_email"],
                lead_doc["customer_phone"],
                vehicle_info,
                f"Запрос тест-драйва на {request.preferred_date} в {request.preferred_time}. {request.message}"
            )
        
        return {
            "success": True,
            "lead_id": lead_id,
            "message": "Заявка на тест-драйв отправлена"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка создания заявки: {str(e)}")

@router.post("/price-inquiry", response_model=dict)
async def request_price_inquiry(
    request: PriceInquiryRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Запросить цену"""
    try:
        # Получаем данные автомобиля
        vehicle = await db.db.vehicles.find_one({"id": request.vehicle_id})
        if not vehicle:
            raise HTTPException(status_code=404, detail="Автомобиль не найден")
        
        # Получаем данные дилера
        dealer = await db.db.dealers.find_one({"id": vehicle["dealer_id"]})
        if not dealer:
            raise HTTPException(status_code=404, detail="Дилер не найден")
        
        # Создаем заявку на цену
        lead_id = str(uuid.uuid4())
        lead_doc = {
            "id": lead_id,
            "type": "price_inquiry",
            "status": "new",
            "vehicle_id": request.vehicle_id,
            "dealer_id": vehicle["dealer_id"],
            "customer_id": current_user.id,
            "customer_name": f"{current_user.first_name} {current_user.last_name}".strip(),
            "customer_email": current_user.email,
            "customer_phone": request.phone or current_user.phone,
            "message": request.message,
            "preferred_date": None,
            "preferred_time": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.leads.insert_one(lead_doc)
        
        # Отправляем уведомление дилеру
        dealer_user = await db.db.users.find_one({"id": dealer["user_id"]})
        if dealer_user and dealer_user.get("email"):
            vehicle_info = {
                "make": vehicle.get("make", ""),
                "model": vehicle.get("model", ""),
                "year": vehicle.get("year", ""),
                "price_formatted": f"{vehicle.get('price', 0):,} ₽"
            }
            
            background_tasks.add_task(
                email_service.send_vehicle_inquiry_notification,
                dealer_user["email"],
                dealer.get("company_name", "Дилер"),
                lead_doc["customer_name"],
                lead_doc["customer_email"],
                lead_doc["customer_phone"],
                vehicle_info,
                f"Запрос цены. {request.message}"
            )
        
        return {
            "success": True,
            "lead_id": lead_id,
            "message": "Запрос цены отправлен"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка создания запроса: {str(e)}")

@router.post("/callback", response_model=dict)
async def request_callback(
    request: CallbackRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Запросить обратный звонок"""
    try:
        # Получаем данные дилера
        dealer = await db.db.dealers.find_one({"id": request.dealer_id})
        if not dealer:
            raise HTTPException(status_code=404, detail="Дилер не найден")
        
        # Создаем заявку на обратный звонок
        lead_id = str(uuid.uuid4())
        lead_doc = {
            "id": lead_id,
            "type": "callback",
            "status": "new",
            "vehicle_id": request.vehicle_id,
            "dealer_id": request.dealer_id,
            "customer_id": current_user.id,
            "customer_name": f"{current_user.first_name} {current_user.last_name}".strip(),
            "customer_email": current_user.email,
            "customer_phone": request.phone,
            "message": request.message,
            "preferred_date": None,
            "preferred_time": request.preferred_time,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.leads.insert_one(lead_doc)
        
        # Отправляем уведомление дилеру
        dealer_user = await db.db.users.find_one({"id": dealer["user_id"]})
        if dealer_user and dealer_user.get("email"):
            vehicle_info = {}
            if request.vehicle_id:
                vehicle = await db.db.vehicles.find_one({"id": request.vehicle_id})
                if vehicle:
                    vehicle_info = {
                        "make": vehicle.get("make", ""),
                        "model": vehicle.get("model", ""),
                        "year": vehicle.get("year", ""),
                        "price_formatted": f"{vehicle.get('price', 0):,} ₽"
                    }
            
            background_tasks.add_task(
                email_service.send_vehicle_inquiry_notification,
                dealer_user["email"],
                dealer.get("company_name", "Дилер"),
                lead_doc["customer_name"],
                lead_doc["customer_email"],
                lead_doc["customer_phone"],
                vehicle_info,
                f"Запрос обратного звонка в {request.preferred_time}. {request.message}"
            )
        
        return {
            "success": True,
            "lead_id": lead_id,
            "message": "Запрос обратного звонка отправлен"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка создания запроса: {str(e)}")

@router.get("/dealer/{dealer_id}", response_model=List[LeadResponse])
async def get_dealer_leads(
    dealer_id: str,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Получить заявки дилера"""
    try:
        # Проверяем что пользователь - владелец этого дилера
        dealer = await db.db.dealers.find_one({"id": dealer_id})
        if not dealer or dealer["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        
        # Фильтр по статусу
        filter_query = {"dealer_id": dealer_id}
        if status:
            filter_query["status"] = status
        
        leads = []
        async for lead in db.db.leads.find(filter_query).sort("created_at", -1):
            leads.append(LeadResponse(
                id=lead["id"],
                type=lead["type"],
                status=lead["status"],
                vehicle_id=lead.get("vehicle_id"),
                dealer_id=lead["dealer_id"],
                customer_id=lead["customer_id"],
                customer_name=lead["customer_name"],
                customer_email=lead["customer_email"],
                customer_phone=lead["customer_phone"],
                message=lead["message"],
                preferred_date=lead.get("preferred_date"),
                preferred_time=lead.get("preferred_time"),
                created_at=lead["created_at"],
                updated_at=lead["updated_at"]
            ))
        
        return leads
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка получения заявок: {str(e)}")

@router.put("/{lead_id}/status", response_model=dict)
async def update_lead_status(
    lead_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Обновить статус заявки"""
    try:
        # Проверяем что заявка существует
        lead = await db.db.leads.find_one({"id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Заявка не найдена")
        
        # Проверяем права доступа
        dealer = await db.db.dealers.find_one({"id": lead["dealer_id"]})
        if not dealer or dealer["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        
        # Обновляем статус
        valid_statuses = ["new", "contacted", "completed", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Некорректный статус")
        
        await db.db.leads.update_one(
            {"id": lead_id},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": f"Статус заявки обновлен на '{status}'"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка обновления статуса: {str(e)}")

@router.get("/user", response_model=List[LeadResponse])
async def get_user_leads(current_user: dict = Depends(get_current_user)):
    """Получить заявки пользователя"""
    try:
        leads = []
        async for lead in db.db.leads.find({"customer_id": current_user.id}).sort("created_at", -1):
            leads.append(LeadResponse(
                id=lead["id"],
                type=lead["type"],
                status=lead["status"],
                vehicle_id=lead.get("vehicle_id"),
                dealer_id=lead["dealer_id"],
                customer_id=lead["customer_id"],
                customer_name=lead["customer_name"],
                customer_email=lead["customer_email"],
                customer_phone=lead["customer_phone"],
                message=lead["message"],
                preferred_date=lead.get("preferred_date"),
                preferred_time=lead.get("preferred_time"),
                created_at=lead["created_at"],
                updated_at=lead["updated_at"]
            ))
        
        return leads
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения заявок: {str(e)}")

@router.get("/stats/{dealer_id}", response_model=Dict[str, Any])
async def get_dealer_lead_stats(
    dealer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получить статистику заявок дилера"""
    try:
        # Проверяем права доступа
        dealer = await db.db.dealers.find_one({"id": dealer_id})
        if not dealer or dealer["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        
        # Подсчитываем статистику
        stats = {
            "total_leads": 0,
            "leads_by_status": {"new": 0, "contacted": 0, "completed": 0, "cancelled": 0},
            "leads_by_type": {"test_drive": 0, "price_inquiry": 0, "callback": 0},
            "conversion_rate": 0
        }
        
        async for lead in db.db.leads.find({"dealer_id": dealer_id}):
            stats["total_leads"] += 1
            stats["leads_by_status"][lead["status"]] += 1
            stats["leads_by_type"][lead["type"]] += 1
        
        # Расчет конверсии
        if stats["total_leads"] > 0:
            completed = stats["leads_by_status"]["completed"]
            stats["conversion_rate"] = round((completed / stats["total_leads"]) * 100, 1)
        
        return stats
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка получения статистики: {str(e)}")