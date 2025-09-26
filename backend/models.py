from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UserRole(str, Enum):
    BUYER = "buyer"
    DEALER = "dealer"  
    ADMIN = "admin"

class VehicleCategory(str, Enum):
    CAR = "car"
    MOTORCYCLE = "motorcycle" 
    BOAT = "boat"
    HELICOPTER = "helicopter"
    PLANE = "plane"

class VehicleCondition(str, Enum):
    NEW = "new"
    USED = "used"

class DealStatus(str, Enum):
    LEAD = "lead"
    NEGOTIATION = "negotiation"
    CLOSED = "closed"
    CANCELLED = "cancelled"

# Base Models
class BaseDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# User Models
class User(BaseDocument):
    email: EmailStr
    phone: Optional[str] = None
    first_name: str
    last_name: str
    role: UserRole = UserRole.BUYER
    password_hash: str
    is_active: bool = True
    is_verified: bool = False
    
class UserProfile(BaseDocument):
    user_id: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    preferences: Dict[str, Any] = {}
    notifications_settings: Dict[str, bool] = {
        "email_notifications": True,
        "push_notifications": True,
        "sms_notifications": False
    }

# Vehicle Models
class VehicleImage(BaseModel):
    url: str
    is_primary: bool = False
    order: int = 0

class Vehicle(BaseDocument):
    dealer_id: str
    category: VehicleCategory
    make: str
    model: str
    year: int
    price: float
    currency: str = "RUB"
    condition: VehicleCondition
    mileage: Optional[int] = None
    color: Optional[str] = None
    engine: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    power: Optional[int] = None  # л.с.
    body_type: Optional[str] = None
    drive_type: Optional[str] = None
    images: List[VehicleImage] = []
    description: Optional[str] = None
    features: List[str] = []
    location: Optional[str] = None
    is_available: bool = True
    is_featured: bool = False
    views_count: int = 0
    favorites_count: int = 0
    
# Dealer Models  
class Dealer(BaseDocument):
    user_id: str
    company_name: str
    legal_name: Optional[str] = None
    description: Optional[str] = None
    specialization: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: str = "Russia"
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    working_hours: Optional[str] = None
    established_year: Optional[int] = None
    verification_status: str = "pending"  # pending/verified/rejected
    rating: float = 0.0
    reviews_count: int = 0
    logo: Optional[str] = None
    gallery_images: List[str] = []

class DealerReview(BaseDocument):
    dealer_id: str
    user_id: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    pros: List[str] = []
    cons: List[str] = []
    is_verified: bool = False

# User Interactions
class Favorite(BaseDocument):
    user_id: str
    vehicle_id: str

class Comparison(BaseDocument):
    user_id: str
    vehicle_ids: List[str] = []

class ViewHistory(BaseDocument):
    user_id: str
    vehicle_id: str
    viewed_at: datetime = Field(default_factory=datetime.utcnow)

# ERP Models
class Customer(BaseDocument):
    dealer_id: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    source: Optional[str] = None  # website/phone/referral
    preferences: Dict[str, Any] = {}
    notes: Optional[str] = None

class Deal(BaseDocument):
    dealer_id: str
    vehicle_id: str
    customer_id: Optional[str] = None
    status: DealStatus = DealStatus.LEAD
    price: Optional[float] = None
    commission: Optional[float] = None
    profit: Optional[float] = None
    stages: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    documents: List[str] = []

# Request/Response Models
class UserCreate(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    first_name: str
    last_name: str
    password: str
    role: UserRole = UserRole.BUYER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

class VehicleCreate(BaseModel):
    category: VehicleCategory
    make: str
    model: str
    year: int
    price: float
    condition: VehicleCondition
    mileage: Optional[int] = None
    color: Optional[str] = None
    engine: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    power: Optional[int] = None
    body_type: Optional[str] = None
    drive_type: Optional[str] = None
    description: Optional[str] = None
    features: List[str] = []
    location: Optional[str] = None
    is_featured: bool = False

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    price: Optional[float] = None
    condition: Optional[VehicleCondition] = None
    mileage: Optional[int] = None
    color: Optional[str] = None
    engine: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    power: Optional[int] = None
    body_type: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    location: Optional[str] = None
    is_available: Optional[bool] = None
    is_featured: Optional[bool] = None

class VehicleSearch(BaseModel):
    category: Optional[VehicleCategory] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    price_from: Optional[float] = None
    price_to: Optional[float] = None
    condition: Optional[VehicleCondition] = None
    body_type: Optional[str] = None
    mileage_max: Optional[int] = None
    location: Optional[str] = None
    is_featured: Optional[bool] = None
    page: int = 1
    limit: int = 20
    sort_by: Optional[str] = None  # price_asc/price_desc/date_desc/views_desc

class DealerCreate(BaseModel):
    company_name: str
    description: Optional[str] = None
    specialization: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    working_hours: Optional[str] = None
    established_year: Optional[int] = None

class DealerUpdate(BaseModel):
    company_name: Optional[str] = None
    description: Optional[str] = None
    specialization: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    working_hours: Optional[str] = None

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    pros: List[str] = []
    cons: List[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse