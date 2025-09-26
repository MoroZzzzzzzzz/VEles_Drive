from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from ..models import Vehicle, User, Favorite
from ..auth import get_current_active_user
from ..database import db

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("/", response_model=List[Vehicle])
async def get_favorites(current_user: User = Depends(get_current_active_user)):
    """Get user's favorite vehicles"""
    favorites = await db.get_user_favorites(current_user.id)
    return favorites

@router.post("/{vehicle_id}", response_model=dict)
async def add_to_favorites(
    vehicle_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Add vehicle to favorites"""
    # Check if vehicle exists
    vehicle = await db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Add to favorites
    favorite = await db.add_favorite(current_user.id, vehicle_id)
    
    return {
        "message": "Vehicle added to favorites",
        "vehicle_id": vehicle_id,
        "added_at": favorite.created_at
    }

@router.delete("/{vehicle_id}")
async def remove_from_favorites(
    vehicle_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Remove vehicle from favorites"""
    success = await db.remove_favorite(current_user.id, vehicle_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found in favorites"
        )
    
    return {"message": "Vehicle removed from favorites"}

@router.get("/check/{vehicle_id}", response_model=dict)
async def check_favorite_status(
    vehicle_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Check if vehicle is in user's favorites"""
    favorites = await db.get_user_favorites(current_user.id)
    is_favorite = any(fav.id == vehicle_id for fav in favorites)
    
    return {
        "vehicle_id": vehicle_id,
        "is_favorite": is_favorite
    }