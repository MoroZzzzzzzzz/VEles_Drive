from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from ..models import (
    Vehicle, VehicleCreate, VehicleUpdate, VehicleSearch, 
    VehicleCategory, VehicleCondition, User
)
from ..auth import get_current_active_user, get_dealer_user
from ..database import db

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("/", response_model=dict)
async def get_vehicles(
    category: Optional[VehicleCategory] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    price_from: Optional[float] = None,
    price_to: Optional[float] = None,
    condition: Optional[VehicleCondition] = None,
    body_type: Optional[str] = None,
    mileage_max: Optional[int] = None,
    location: Optional[str] = None,
    is_featured: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = None
):
    """Get vehicles with search and filtering"""
    search_params = VehicleSearch(
        category=category,
        make=make,
        model=model,
        year_from=year_from,
        year_to=year_to,
        price_from=price_from,
        price_to=price_to,
        condition=condition,
        body_type=body_type,
        mileage_max=mileage_max,
        location=location,
        is_featured=is_featured,
        page=page,
        limit=limit,
        sort_by=sort_by
    )
    
    vehicles, total_count = await db.get_vehicles(search_params)
    
    return {
        "vehicles": vehicles,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

@router.get("/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    """Get vehicle by ID"""
    vehicle = await db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Increment views count
    await db.increment_vehicle_views(vehicle_id)
    
    return vehicle

@router.post("/", response_model=Vehicle)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user: User = Depends(get_dealer_user)
):
    """Create a new vehicle (dealers only)"""
    # Get dealer profile
    dealer = await db.get_dealer_by_user_id(current_user.id)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dealer profile not found. Please complete your dealer registration."
        )
    
    vehicle = Vehicle(
        dealer_id=dealer.id,
        category=vehicle_data.category,
        make=vehicle_data.make,
        model=vehicle_data.model,
        year=vehicle_data.year,
        price=vehicle_data.price,
        condition=vehicle_data.condition,
        mileage=vehicle_data.mileage,
        color=vehicle_data.color,
        engine=vehicle_data.engine,
        transmission=vehicle_data.transmission,
        fuel_type=vehicle_data.fuel_type,
        power=vehicle_data.power,
        body_type=vehicle_data.body_type,
        drive_type=vehicle_data.drive_type,
        description=vehicle_data.description,
        features=vehicle_data.features,
        location=vehicle_data.location,
        is_featured=vehicle_data.is_featured
    )
    
    created_vehicle = await db.create_vehicle(vehicle)
    return created_vehicle

@router.put("/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(
    vehicle_id: str,
    update_data: VehicleUpdate,
    current_user: User = Depends(get_dealer_user)
):
    """Update vehicle (owner or admin only)"""
    # Get vehicle
    vehicle = await db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Check ownership (unless admin)
    if current_user.role != "admin":
        dealer = await db.get_dealer_by_user_id(current_user.id)
        if not dealer or vehicle.dealer_id != dealer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this vehicle"
            )
    
    # Update vehicle
    update_dict = update_data.dict(exclude_unset=True)
    if update_dict:
        success = await db.update_vehicle(vehicle_id, update_dict)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update vehicle"
            )
    
    # Return updated vehicle
    updated_vehicle = await db.get_vehicle_by_id(vehicle_id)
    return updated_vehicle

@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_dealer_user)
):
    """Delete vehicle (owner or admin only)"""
    # Get vehicle
    vehicle = await db.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Check ownership (unless admin)
    if current_user.role != "admin":
        dealer = await db.get_dealer_by_user_id(current_user.id)
        if not dealer or vehicle.dealer_id != dealer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this vehicle"
            )
    
    success = await db.delete_vehicle(vehicle_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete vehicle"
        )
    
    return {"message": "Vehicle deleted successfully"}

@router.get("/search/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=2)):
    """Get search suggestions for makes and models"""
    # This could be enhanced with proper text search indexes
    # For now, return some basic suggestions
    suggestions = {
        "makes": [
            "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", 
            "Ferrari", "Jaguar", "Lamborghini", "McLaren", 
            "Mercedes-Benz", "Porsche", "Rolls-Royce", "Tesla"
        ],
        "models": []
    }
    
    # Filter makes by query
    query_lower = q.lower()
    filtered_makes = [
        make for make in suggestions["makes"] 
        if query_lower in make.lower()
    ]
    
    return {
        "makes": filtered_makes[:10],
        "models": []
    }

@router.get("/categories", response_model=dict)
async def get_categories():
    """Get vehicle categories and their options"""
    return {
        "categories": [
            {"value": "car", "label": "Автомобили"},
            {"value": "motorcycle", "label": "Мотоциклы"},
            {"value": "boat", "label": "Лодки"},
            {"value": "helicopter", "label": "Вертолеты"},
            {"value": "plane", "label": "Самолеты"}
        ],
        "body_types": [
            "Седан", "Купе", "Кабриолет", "Хэтчбек", 
            "Универсал", "Кроссовер", "Внедорожник"
        ],
        "fuel_types": [
            "Бензин", "Дизель", "Гибрид", "Электро", "Газ"
        ],
        "transmissions": [
            "Механическая", "Автоматическая", "Робот", "Вариатор"
        ],
        "conditions": [
            {"value": "new", "label": "Новый"},
            {"value": "used", "label": "С пробегом"}
        ]
    }