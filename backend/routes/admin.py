from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
from enum import Enum

from auth import get_current_user
from database import db

router = APIRouter(prefix="/admin", tags=["admin"])

class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    DEALER = "dealer"
    BUYER = "buyer"

class AdminStats(BaseModel):
    total_users: int
    total_dealers: int
    total_vehicles: int
    total_transactions: int
    total_leads: int
    revenue_today: float
    revenue_month: float
    active_users_today: int
    new_users_today: int
    top_dealers: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

class UserManagement(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    total_orders: int
    total_spent: float

def verify_admin_access(current_user: dict = Depends(get_current_user)):
    """Проверить права администратора"""
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user

@router.get("/dashboard", response_model=AdminStats)
async def get_admin_dashboard(admin: dict = Depends(verify_admin_access)):
    """Получить данные для админ дашборда"""
    try:
        # Подсчитываем основные статистики
        total_users = await db.db.users.count_documents({})
        total_dealers = await db.db.dealers.count_documents({})
        total_vehicles = await db.db.vehicles.count_documents({})
        total_transactions = await db.db.payment_transactions.count_documents({})
        total_leads = await db.db.leads.count_documents({})
        
        # Доходы (mock данные)
        revenue_today = 125000.0
        revenue_month = 2850000.0
        
        # Активные пользователи сегодня (mock)
        today = datetime.utcnow().date()
        active_users_today = await db.db.users.count_documents({
            "last_login": {"$gte": datetime.combine(today, datetime.min.time())}
        }) if await db.db.users.find_one({"last_login": {"$exists": True}}) else 25
        
        new_users_today = await db.db.users.count_documents({
            "created_at": {"$gte": datetime.combine(today, datetime.min.time())}
        })
        
        # Топ дилеры
        top_dealers = []
        async for dealer in db.db.dealers.find({}).sort("rating", -1).limit(5):
            user = await db.db.users.find_one({"id": dealer["user_id"]})
            top_dealers.append({
                "id": dealer["id"],
                "company_name": dealer["company_name"],
                "rating": dealer.get("rating", 0),
                "reviews_count": dealer.get("reviews_count", 0),
                "vehicles_count": await db.db.vehicles.count_documents({"dealer_id": dealer["id"]}),
                "owner_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() if user else "Unknown"
            })
        
        # Последняя активность
        recent_activity = [
            {
                "type": "new_user",
                "message": "Новый пользователь зарегистрировался",
                "time": datetime.utcnow() - timedelta(minutes=5),
                "details": "user@example.com"
            },
            {
                "type": "payment",
                "message": "Завершена покупка автомобиля",
                "time": datetime.utcnow() - timedelta(minutes=15),
                "details": "BMW X5 2023 - 4,500,000 ₽"
            },
            {
                "type": "review",
                "message": "Новый отзыв о дилере",
                "time": datetime.utcnow() - timedelta(minutes=22),
                "details": "5 звезд для BMW Центр Москва"
            },
            {
                "type": "vehicle",
                "message": "Добавлен новый автомобиль",
                "time": datetime.utcnow() - timedelta(hours=1),
                "details": "Mercedes E-Class 2024"
            },
            {
                "type": "verification",
                "message": "Завершена верификация автомобиля",
                "time": datetime.utcnow() - timedelta(hours=2),
                "details": "Audi A4 2023 - Оценка: 92/100"
            }
        ]
        
        return AdminStats(
            total_users=total_users,
            total_dealers=total_dealers,
            total_vehicles=total_vehicles,
            total_transactions=total_transactions,
            total_leads=total_leads,
            revenue_today=revenue_today,
            revenue_month=revenue_month,
            active_users_today=active_users_today,
            new_users_today=new_users_today,
            top_dealers=top_dealers,
            recent_activity=recent_activity
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения статистики: {str(e)}")

@router.get("/users", response_model=List[UserManagement])
async def get_users_management(
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    skip: int = Query(0, ge=0),
    admin: dict = Depends(verify_admin_access)
):
    """Получить список пользователей для управления"""
    try:
        # Строим запрос
        query = {}
        if role:
            query["role"] = role.value
        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"first_name": {"$regex": search, "$options": "i"}},
                {"last_name": {"$regex": search, "$options": "i"}}
            ]
        
        users = []
        async for user in db.db.users.find(query).skip(skip).limit(limit):
            # Подсчитываем статистики пользователя
            total_orders = await db.db.payment_transactions.count_documents({"user_id": user["id"]})
            
            # Подсчитываем потраченную сумму
            total_spent = 0
            async for transaction in db.db.payment_transactions.find({
                "user_id": user["id"],
                "payment_status": "paid"
            }):
                total_spent += transaction.get("amount", 0)
            
            users.append(UserManagement(
                id=user["id"],
                email=user["email"],
                first_name=user.get("first_name", ""),
                last_name=user.get("last_name", ""),
                role=user["role"],
                is_active=user.get("is_active", True),
                is_verified=user.get("is_verified", False),
                created_at=user["created_at"],
                last_login=user.get("last_login"),
                total_orders=total_orders,
                total_spent=total_spent
            ))
        
        return users
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения пользователей: {str(e)}")

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    admin: dict = Depends(verify_admin_access)
):
    """Изменить роль пользователя"""
    try:
        # Проверяем что пользователь существует
        user = await db.db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Не позволяем менять роль самому себе
        if user_id == admin.id:
            raise HTTPException(status_code=400, detail="Нельзя менять свою роль")
        
        # Обновляем роль
        await db.db.users.update_one(
            {"id": user_id},
            {"$set": {"role": new_role.value, "updated_at": datetime.utcnow()}}
        )
        
        return {"success": True, "message": f"Роль пользователя изменена на {new_role.value}"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка изменения роли: {str(e)}")

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    admin: dict = Depends(verify_admin_access)
):
    """Активировать/деактивировать пользователя"""
    try:
        # Проверяем что пользователь существует
        user = await db.db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Не позволяем деактивировать самого себя
        if user_id == admin.id and not is_active:
            raise HTTPException(status_code=400, detail="Нельзя деактивировать самого себя")
        
        # Обновляем статус
        await db.db.users.update_one(
            {"id": user_id},
            {"$set": {"is_active": is_active, "updated_at": datetime.utcnow()}}
        )
        
        status_text = "активирован" if is_active else "деактивирован"
        return {"success": True, "message": f"Пользователь {status_text}"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка изменения статуса: {str(e)}")

@router.get("/vehicles/pending")
async def get_pending_vehicles(
    limit: int = Query(50, le=200),
    admin: dict = Depends(verify_admin_access)
):
    """Получить автомобили, ожидающие модерации"""
    try:
        vehicles = []
        async for vehicle in db.db.vehicles.find({
            "status": {"$in": ["pending", "under_review"]}
        }).limit(limit):
            # Получаем данные дилера
            dealer = await db.db.dealers.find_one({"id": vehicle["dealer_id"]})
            dealer_info = {
                "company_name": dealer.get("company_name", "Unknown") if dealer else "Unknown",
                "rating": dealer.get("rating", 0) if dealer else 0
            }
            
            vehicles.append({
                **vehicle,
                "dealer_info": dealer_info
            })
        
        return vehicles
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения автомобилей: {str(e)}")

@router.put("/vehicles/{vehicle_id}/approve")
async def approve_vehicle(
    vehicle_id: str,
    admin: dict = Depends(verify_admin_access)
):
    """Одобрить автомобиль"""
    try:
        result = await db.db.vehicles.update_one(
            {"id": vehicle_id},
            {
                "$set": {
                    "status": "active",
                    "approved_by": admin.id,
                    "approved_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Автомобиль не найден")
        
        return {"success": True, "message": "Автомобиль одобрен и опубликован"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка одобрения автомобиля: {str(e)}")

@router.put("/vehicles/{vehicle_id}/reject")
async def reject_vehicle(
    vehicle_id: str,
    reason: str,
    admin: dict = Depends(verify_admin_access)
):
    """Отклонить автомобиль"""
    try:
        result = await db.db.vehicles.update_one(
            {"id": vehicle_id},
            {
                "$set": {
                    "status": "rejected",
                    "rejection_reason": reason,
                    "rejected_by": admin.id,
                    "rejected_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Автомобиль не найден")
        
        return {"success": True, "message": "Автомобиль отклонен"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка отклонения автомобиля: {str(e)}")

@router.get("/reports/revenue")
async def get_revenue_report(
    start_date: datetime,
    end_date: datetime,
    admin: dict = Depends(verify_admin_access)
):
    """Получить отчет по доходам"""
    try:
        # Подсчитываем доходы за период
        pipeline = [
            {
                "$match": {
                    "payment_status": "paid",
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day": {"$dayOfMonth": "$created_at"}
                    },
                    "total_amount": {"$sum": "$amount"},
                    "total_transactions": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        daily_revenue = []
        total_revenue = 0
        total_transactions = 0
        
        async for day_data in db.db.payment_transactions.aggregate(pipeline):
            daily_revenue.append({
                "date": f"{day_data['_id']['year']}-{day_data['_id']['month']:02d}-{day_data['_id']['day']:02d}",
                "revenue": day_data["total_amount"],
                "transactions": day_data["total_transactions"]
            })
            total_revenue += day_data["total_amount"]
            total_transactions += day_data["total_transactions"]
        
        return {
            "period": {
                "start": start_date,
                "end": end_date
            },
            "summary": {
                "total_revenue": total_revenue,
                "total_transactions": total_transactions,
                "average_transaction": total_revenue / total_transactions if total_transactions > 0 else 0
            },
            "daily_data": daily_revenue
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения отчета: {str(e)}")

@router.get("/system/health")
async def get_system_health(admin: dict = Depends(verify_admin_access)):
    """Получить статус здоровья системы"""
    try:
        # Проверяем подключения к базе данных
        db_status = "healthy"
        try:
            await db.db.users.find_one({})
        except Exception:
            db_status = "error"
        
        # Mock данные для других проверок
        system_health = {
            "database": {
                "status": db_status,
                "response_time": "12ms",
                "connections": 15
            },
            "redis_cache": {
                "status": "healthy",
                "response_time": "3ms",
                "memory_usage": "45%"
            },
            "external_apis": {
                "stripe": {"status": "healthy", "response_time": "150ms"},
                "sendgrid": {"status": "healthy", "response_time": "89ms"},
                "maps_api": {"status": "healthy", "response_time": "234ms"}
            },
            "server": {
                "cpu_usage": "35%",
                "memory_usage": "62%",
                "disk_usage": "78%",
                "uptime": "5d 12h 34m"
            }
        }
        
        return system_health
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка проверки здоровья системы: {str(e)}")