from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from auth import get_current_user
from database import db

router = APIRouter(prefix="/reviews", tags=["reviews"])

class ReviewCreate(BaseModel):
    dealer_id: str
    rating: int  # 1-5
    title: str
    comment: str
    pros: List[str] = []
    cons: List[str] = []

class ReviewResponse(BaseModel):
    id: str
    dealer_id: str
    user_id: str
    user_name: str
    rating: int
    title: str
    comment: str
    pros: List[str]
    cons: List[str]
    is_verified: bool
    created_at: datetime

class DealerRatingStats(BaseModel):
    dealer_id: str
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {5: count, 4: count, ...}

@router.post("/", response_model=dict)
async def create_review(
    review: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Создать отзыв о дилере"""
    try:
        # Проверяем что дилер существует
        dealer = await db.db.dealers.find_one({"id": review.dealer_id})
        if not dealer:
            raise HTTPException(status_code=404, detail="Дилер не найден")
        
        # Проверяем что пользователь не может оставить отзыв себе
        if current_user["role"] == "dealer" and dealer["user_id"] == current_user["id"]:
            raise HTTPException(status_code=400, detail="Нельзя оставить отзыв себе")
        
        # Проверяем что пользователь еще не оставлял отзыв этому дилеру
        existing_review = await db.db.reviews.find_one({
            "dealer_id": review.dealer_id,
            "user_id": current_user["id"]
        })
        if existing_review:
            raise HTTPException(status_code=400, detail="Вы уже оставили отзыв этому дилеру")
        
        # Валидация рейтинга
        if not 1 <= review.rating <= 5:
            raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")
        
        # Создаем отзыв
        review_id = str(uuid.uuid4())
        review_doc = {
            "id": review_id,
            "dealer_id": review.dealer_id,
            "user_id": current_user["id"],
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "pros": review.pros,
            "cons": review.cons,
            "is_verified": False,  # Можно добавить верификацию позже
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.reviews.insert_one(review_doc)
        
        # Обновляем рейтинг дилера
        await update_dealer_rating(review.dealer_id)
        
        return {
            "success": True,
            "review_id": review_id,
            "message": "Отзыв добавлен успешно"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка создания отзыва: {str(e)}")

@router.get("/dealer/{dealer_id}", response_model=List[ReviewResponse])
async def get_dealer_reviews(
    dealer_id: str,
    skip: int = 0,
    limit: int = 20
):
    """Получить отзывы о дилере"""
    try:
        reviews = []
        async for review in db.db.reviews.find({"dealer_id": dealer_id}).sort("created_at", -1).skip(skip).limit(limit):
            # Получаем данные пользователя
            user = await db.db.users.find_one({"id": review["user_id"]})
            user_name = "Анонимный пользователь"
            if user:
                user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                if not user_name:
                    user_name = user.get('email', 'Пользователь')
            
            reviews.append(ReviewResponse(
                id=review["id"],
                dealer_id=review["dealer_id"],
                user_id=review["user_id"],
                user_name=user_name,
                rating=review["rating"],
                title=review["title"],
                comment=review["comment"],
                pros=review.get("pros", []),
                cons=review.get("cons", []),
                is_verified=review.get("is_verified", False),
                created_at=review["created_at"]
            ))
        
        return reviews
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения отзывов: {str(e)}")

@router.get("/dealer/{dealer_id}/stats", response_model=DealerRatingStats)
async def get_dealer_rating_stats(dealer_id: str):
    """Получить статистику рейтинга дилера"""
    try:
        # Подсчитываем статистику
        pipeline = [
            {"$match": {"dealer_id": dealer_id}},
            {"$group": {
                "_id": "$rating",
                "count": {"$sum": 1}
            }}
        ]
        
        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        total_reviews = 0
        total_rating = 0
        
        async for item in db.reviews.aggregate(pipeline):
            rating = item["_id"]
            count = item["count"]
            rating_distribution[rating] = count
            total_reviews += count
            total_rating += rating * count
        
        average_rating = total_rating / total_reviews if total_reviews > 0 else 0
        
        return DealerRatingStats(
            dealer_id=dealer_id,
            average_rating=round(average_rating, 1),
            total_reviews=total_reviews,
            rating_distribution=rating_distribution
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения статистики: {str(e)}")

@router.get("/user", response_model=List[ReviewResponse])
async def get_user_reviews(current_user: dict = Depends(get_current_user)):
    """Получить отзывы текущего пользователя"""
    try:
        reviews = []
        async for review in db.reviews.find({"user_id": current_user["id"]}).sort("created_at", -1):
            # Получаем данные дилера
            dealer = await db.dealers.find_one({"id": review["dealer_id"]})
            dealer_name = dealer.get("company_name", "Неизвестный дилер") if dealer else "Неизвестный дилер"
            
            reviews.append(ReviewResponse(
                id=review["id"],
                dealer_id=review["dealer_id"],
                user_id=review["user_id"],
                user_name=f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip(),
                rating=review["rating"],
                title=review["title"],
                comment=review["comment"],
                pros=review.get("pros", []),
                cons=review.get("cons", []),
                is_verified=review.get("is_verified", False),
                created_at=review["created_at"]
            ))
        
        return reviews
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения отзывов: {str(e)}")

@router.delete("/{review_id}", response_model=dict)
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Удалить отзыв (только свой)"""
    try:
        review = await db.reviews.find_one({"id": review_id})
        if not review:
            raise HTTPException(status_code=404, detail="Отзыв не найден")
        
        # Проверяем права доступа
        if review["user_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        
        dealer_id = review["dealer_id"]
        
        # Удаляем отзыв
        await db.reviews.delete_one({"id": review_id})
        
        # Обновляем рейтинг дилера
        await update_dealer_rating(dealer_id)
        
        return {"success": True, "message": "Отзыв удален"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Ошибка удаления отзыва: {str(e)}")

async def update_dealer_rating(dealer_id: str):
    """Обновить средний рейтинг дилера"""
    try:
        # Подсчитываем новый средний рейтинг
        pipeline = [
            {"$match": {"dealer_id": dealer_id}},
            {"$group": {
                "_id": None,
                "avg_rating": {"$avg": "$rating"},
                "total_reviews": {"$sum": 1}
            }}
        ]
        
        result = None
        async for item in db.reviews.aggregate(pipeline):
            result = item
            break
        
        if result:
            avg_rating = round(result["avg_rating"], 1)
            total_reviews = result["total_reviews"]
        else:
            avg_rating = 0
            total_reviews = 0
        
        # Обновляем данные дилера
        await db.dealers.update_one(
            {"id": dealer_id},
            {
                "$set": {
                    "rating": avg_rating,
                    "reviews_count": total_reviews,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
    except Exception as e:
        print(f"Error updating dealer rating: {e}")