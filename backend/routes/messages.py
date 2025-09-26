from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from auth import get_current_user
from database import db

router = APIRouter(prefix="/messages", tags=["messages"])

class MessageCreate(BaseModel):
    recipient_id: str
    vehicle_id: Optional[str] = None
    content: str
    message_type: str = "text"  # text, system, offer

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    vehicle_id: Optional[str]
    content: str
    message_type: str
    is_read: bool
    created_at: datetime
    sender_name: str
    sender_role: str

class ConversationResponse(BaseModel):
    user_id: str
    user_name: str
    user_role: str
    last_message: str
    last_message_time: datetime
    unread_count: int
    vehicle_id: Optional[str]
    vehicle_title: Optional[str]

@router.post("/", response_model=dict)
async def send_message(
    message: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Отправить сообщение"""
    try:
        # Проверяем, что получатель существует
        recipient = await db.db.users.find_one({"id": message.recipient_id})
        if not recipient:
            raise HTTPException(status_code=404, detail="Получатель не найден")
        
        # Создаем сообщение
        message_id = str(uuid.uuid4())
        message_doc = {
            "id": message_id,
            "sender_id": current_user["id"],
            "recipient_id": message.recipient_id,
            "vehicle_id": message.vehicle_id,
            "content": message.content,
            "message_type": message.message_type,
            "is_read": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.messages.insert_one(message_doc)
        
        return {
            "success": True,
            "message_id": message_id,
            "message": "Сообщение отправлено"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка отправки сообщения: {str(e)}")

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Получить список всех разговоров пользователя"""
    try:
        user_id = current_user["id"]
        
        # Агрегация для получения разговоров
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"sender_id": user_id},
                        {"recipient_id": user_id}
                    ]
                }
            },
            {
                "$sort": {"created_at": -1}
            },
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$sender_id", user_id]},
                            "$recipient_id",
                            "$sender_id"
                        ]
                    },
                    "last_message": {"$first": "$content"},
                    "last_message_time": {"$first": "$created_at"},
                    "vehicle_id": {"$first": "$vehicle_id"},
                    "messages": {"$push": "$$ROOT"}
                }
            }
        ]
        
        conversations = []
        async for conv in db.db.messages.aggregate(pipeline):
            other_user_id = conv["_id"]
            
            # Получаем данные собеседника
            other_user = await db.db.users.find_one({"id": other_user_id})
            if not other_user:
                continue
            
            # Считаем непрочитанные сообщения
            unread_count = await db.db.messages.count_documents({
                "sender_id": other_user_id,
                "recipient_id": user_id,
                "is_read": False
            })
            
            # Получаем информацию об автомобиле если есть
            vehicle_title = None
            if conv.get("vehicle_id"):
                vehicle = await db.db.vehicles.find_one({"id": conv["vehicle_id"]})
                if vehicle:
                    vehicle_title = f"{vehicle.get('make', '')} {vehicle.get('model', '')}"
            
            conversations.append({
                "user_id": other_user_id,
                "user_name": f"{other_user.get('first_name', '')} {other_user.get('last_name', '')}".strip(),
                "user_role": other_user.get("role", "buyer"),
                "last_message": conv["last_message"],
                "last_message_time": conv["last_message_time"],
                "unread_count": unread_count,
                "vehicle_id": conv.get("vehicle_id"),
                "vehicle_title": vehicle_title
            })
        
        return sorted(conversations, key=lambda x: x["last_message_time"], reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения разговоров: {str(e)}")

@router.get("/{user_id}", response_model=List[MessageResponse])
async def get_messages_with_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получить все сообщения с конкретным пользователем"""
    try:
        current_user_id = current_user["id"]
        
        # Получаем все сообщения между пользователями
        messages = []
        async for message in db.db.messages.find({
            "$or": [
                {"sender_id": current_user_id, "recipient_id": user_id},
                {"sender_id": user_id, "recipient_id": current_user_id}
            ]
        }).sort("created_at", 1):
            
            # Получаем данные отправителя
            sender = await db.db.users.find_one({"id": message["sender_id"]})
            sender_name = f"{sender.get('first_name', '')} {sender.get('last_name', '')}".strip() if sender else "Unknown"
            sender_role = sender.get("role", "buyer") if sender else "buyer"
            
            messages.append({
                "id": message["id"],
                "sender_id": message["sender_id"],
                "recipient_id": message["recipient_id"],
                "vehicle_id": message.get("vehicle_id"),
                "content": message["content"],
                "message_type": message["message_type"],
                "is_read": message["is_read"],
                "created_at": message["created_at"],
                "sender_name": sender_name,
                "sender_role": sender_role
            })
        
        # Отмечаем сообщения как прочитанные
        await db.messages.update_many(
            {
                "sender_id": user_id,
                "recipient_id": current_user_id,
                "is_read": False
            },
            {"$set": {"is_read": True}}
        )
        
        return messages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения сообщений: {str(e)}")

@router.put("/{message_id}/read", response_model=dict)
async def mark_message_as_read(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Отметить сообщение как прочитанное"""
    try:
        result = await db.messages.update_one(
            {
                "id": message_id,
                "recipient_id": current_user["id"]
            },
            {"$set": {"is_read": True}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Сообщение не найдено")
        
        return {"success": True, "message": "Сообщение отмечено как прочитанное"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления сообщения: {str(e)}")

@router.get("/unread/count", response_model=dict)
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Получить количество непрочитанных сообщений"""
    try:
        count = await db.messages.count_documents({
            "recipient_id": current_user["id"],
            "is_read": False
        })
        
        return {"unread_count": count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения количества: {str(e)}")