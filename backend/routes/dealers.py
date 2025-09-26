from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models import (
    Dealer, DealerCreate, DealerUpdate, DealerReview, 
    ReviewCreate, User, Vehicle
)
from auth import get_current_active_user, get_dealer_user
from database import db

router = APIRouter(prefix="/dealers", tags=["Dealers"])

@router.get("/", response_model=dict)
async def get_dealers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get list of verified dealers"""
    dealers, total_count = await db.get_dealers(page, limit)
    
    return {
        "dealers": dealers,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

@router.get("/{dealer_id}", response_model=Dealer)
async def get_dealer(dealer_id: str):
    """Get dealer by ID"""
    dealer = await db.get_dealer_by_id(dealer_id)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    return dealer

@router.post("/", response_model=Dealer)
async def create_dealer_profile(
    dealer_data: DealerCreate,
    current_user: User = Depends(get_dealer_user)
):
    """Create dealer profile (dealers only)"""
    # Check if dealer profile already exists
    existing_dealer = await db.get_dealer_by_user_id(current_user.id)
    if existing_dealer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dealer profile already exists"
        )
    
    dealer = Dealer(
        user_id=current_user.id,
        company_name=dealer_data.company_name,
        description=dealer_data.description,
        specialization=dealer_data.specialization,
        address=dealer_data.address,
        city=dealer_data.city,
        phone=dealer_data.phone,
        email=dealer_data.email,
        website=dealer_data.website,
        working_hours=dealer_data.working_hours,
        established_year=dealer_data.established_year,
        verification_status="pending"
    )
    
    created_dealer = await db.create_dealer(dealer)
    return created_dealer

@router.put("/{dealer_id}", response_model=Dealer)
async def update_dealer_profile(
    dealer_id: str,
    update_data: DealerUpdate,
    current_user: User = Depends(get_dealer_user)
):
    """Update dealer profile (owner or admin only)"""
    # Get dealer
    dealer = await db.get_dealer_by_id(dealer_id)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    
    # Check ownership (unless admin)
    if current_user.role != "admin" and dealer.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this dealer profile"
        )
    
    # Update dealer
    update_dict = update_data.dict(exclude_unset=True)
    if update_dict:
        success = await db.update_dealer(dealer_id, update_dict)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update dealer profile"
            )
    
    # Return updated dealer
    updated_dealer = await db.get_dealer_by_id(dealer_id)
    return updated_dealer

@router.get("/{dealer_id}/vehicles", response_model=dict)
async def get_dealer_vehicles(
    dealer_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get vehicles from a specific dealer"""
    # Verify dealer exists
    dealer = await db.get_dealer_by_id(dealer_id)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    
    # Get dealer's vehicles using new method
    vehicles, total_count = await db.get_vehicles_by_dealer(dealer_id, page, limit)
    
    return {
        "vehicles": vehicles,
        "total": total_count,
        "page": page,
        "limit": limit,
        "dealer": {
            "id": dealer.id,
            "company_name": dealer.company_name,
            "rating": dealer.rating
        }
    }

@router.get("/{dealer_id}/reviews", response_model=List[DealerReview])
async def get_dealer_reviews(dealer_id: str):
    """Get reviews for a dealer"""
    # Verify dealer exists
    dealer = await db.get_dealer_by_id(dealer_id)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    
    # For now, return empty list - reviews functionality would be implemented here
    return []

@router.post("/{dealer_id}/reviews", response_model=DealerReview)
async def create_dealer_review(
    dealer_id: str,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a review for a dealer"""
    # Verify dealer exists
    dealer = await db.get_dealer_by_id(dealer_id)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    
    # Don't allow dealers to review themselves
    if dealer.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review your own dealership"
        )
    
    # Create review
    review = DealerReview(
        dealer_id=dealer_id,
        user_id=current_user.id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
        pros=review_data.pros,
        cons=review_data.cons
    )
    
    # This would be implemented with proper database operations
    # For now, just return the review object
    return review