from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
import os
from models import *
from datetime import datetime

class Database:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'veles_drive')
        
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()

    # User operations
    async def create_user(self, user: User) -> User:
        """Create a new user"""
        user_dict = user.dict()
        await self.db.users.insert_one(user_dict)
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        user_data = await self.db.users.find_one({"email": email})
        if user_data:
            return User(**user_data)
        return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        user_data = await self.db.users.find_one({"id": user_id})
        if user_data:
            return User(**user_data)
        return None

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.users.update_one(
            {"id": user_id}, 
            {"$set": update_data}
        )
        return result.modified_count > 0

    # Vehicle operations
    async def create_vehicle(self, vehicle: Vehicle) -> Vehicle:
        """Create a new vehicle"""
        vehicle_dict = vehicle.dict()
        await self.db.vehicles.insert_one(vehicle_dict)
        return vehicle

    async def get_vehicles(
        self, 
        search_params: VehicleSearch
    ) -> tuple[List[Vehicle], int]:
        """Get vehicles with search and pagination"""
        
        # Build filter
        filter_dict = {"is_available": True}
        
        if search_params.category:
            filter_dict["category"] = search_params.category
        if search_params.make:
            filter_dict["make"] = {"$regex": search_params.make, "$options": "i"}
        if search_params.model:
            filter_dict["model"] = {"$regex": search_params.model, "$options": "i"}
        if search_params.year_from:
            filter_dict["year"] = {"$gte": search_params.year_from}
        if search_params.year_to:
            if "year" in filter_dict:
                filter_dict["year"]["$lte"] = search_params.year_to
            else:
                filter_dict["year"] = {"$lte": search_params.year_to}
        if search_params.price_from:
            filter_dict["price"] = {"$gte": search_params.price_from}
        if search_params.price_to:
            if "price" in filter_dict:
                filter_dict["price"]["$lte"] = search_params.price_to
            else:
                filter_dict["price"] = {"$lte": search_params.price_to}
        if search_params.condition:
            filter_dict["condition"] = search_params.condition
        if search_params.body_type:
            filter_dict["body_type"] = search_params.body_type
        if search_params.mileage_max:
            filter_dict["mileage"] = {"$lte": search_params.mileage_max}
        if search_params.location:
            filter_dict["location"] = {"$regex": search_params.location, "$options": "i"}
        if search_params.is_featured is not None:
            filter_dict["is_featured"] = search_params.is_featured

        # Sorting
        sort_dict = []
        if search_params.sort_by == "price_asc":
            sort_dict = [("price", 1)]
        elif search_params.sort_by == "price_desc":
            sort_dict = [("price", -1)]
        elif search_params.sort_by == "date_desc":
            sort_dict = [("created_at", -1)]
        elif search_params.sort_by == "views_desc":
            sort_dict = [("views_count", -1)]
        else:
            sort_dict = [("created_at", -1)]  # Default sort

        # Count total documents
        total_count = await self.db.vehicles.count_documents(filter_dict)

        # Get paginated results
        skip = (search_params.page - 1) * search_params.limit
        cursor = self.db.vehicles.find(filter_dict).sort(sort_dict).skip(skip).limit(search_params.limit)
        
        vehicles_data = await cursor.to_list(length=search_params.limit)
        vehicles = [Vehicle(**vehicle_data) for vehicle_data in vehicles_data]

        return vehicles, total_count

    async def get_vehicle_by_id(self, vehicle_id: str) -> Optional[Vehicle]:
        """Get vehicle by ID"""
        vehicle_data = await self.db.vehicles.find_one({"id": vehicle_id})
        if vehicle_data:
            return Vehicle(**vehicle_data)
        return None

    async def update_vehicle(self, vehicle_id: str, update_data: Dict[str, Any]) -> bool:
        """Update vehicle"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.vehicles.update_one(
            {"id": vehicle_id}, 
            {"$set": update_data}
        )
        return result.modified_count > 0

    async def delete_vehicle(self, vehicle_id: str) -> bool:
        """Delete vehicle"""
        result = await self.db.vehicles.delete_one({"id": vehicle_id})
        return result.deleted_count > 0

    async def increment_vehicle_views(self, vehicle_id: str):
        """Increment vehicle views count"""
        await self.db.vehicles.update_one(
            {"id": vehicle_id},
            {"$inc": {"views_count": 1}}
        )

    # Dealer operations
    async def create_dealer(self, dealer: Dealer) -> Dealer:
        """Create a new dealer"""
        dealer_dict = dealer.dict()
        await self.db.dealers.insert_one(dealer_dict)
        return dealer

    async def get_dealers(self, page: int = 1, limit: int = 20) -> tuple[List[Dealer], int]:
        """Get dealers with pagination"""
        total_count = await self.db.dealers.count_documents({"verification_status": "verified"})
        
        skip = (page - 1) * limit
        cursor = self.db.dealers.find({"verification_status": "verified"}).sort([("rating", -1)]).skip(skip).limit(limit)
        
        dealers_data = await cursor.to_list(length=limit)
        dealers = [Dealer(**dealer_data) for dealer_data in dealers_data]

        return dealers, total_count

    async def get_dealer_by_id(self, dealer_id: str) -> Optional[Dealer]:
        """Get dealer by ID"""
        dealer_data = await self.db.dealers.find_one({"id": dealer_id})
        if dealer_data:
            return Dealer(**dealer_data)
        return None

    async def get_dealer_by_user_id(self, user_id: str) -> Optional[Dealer]:
        """Get dealer by user ID"""
        dealer_data = await self.db.dealers.find_one({"user_id": user_id})
        if dealer_data:
            return Dealer(**dealer_data)
        return None

    async def update_dealer(self, dealer_id: str, update_data: Dict[str, Any]) -> bool:
        """Update dealer"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.dealers.update_one(
            {"id": dealer_id}, 
            {"$set": update_data}
        )
        return result.modified_count > 0

    # Favorite operations
    async def add_favorite(self, user_id: str, vehicle_id: str) -> Favorite:
        """Add vehicle to favorites"""
        # Check if already exists
        existing = await self.db.favorites.find_one({
            "user_id": user_id,
            "vehicle_id": vehicle_id
        })
        if existing:
            return Favorite(**existing)
        
        favorite = Favorite(user_id=user_id, vehicle_id=vehicle_id)
        await self.db.favorites.insert_one(favorite.dict())
        
        # Increment vehicle favorites count
        await self.db.vehicles.update_one(
            {"id": vehicle_id},
            {"$inc": {"favorites_count": 1}}
        )
        
        return favorite

    async def remove_favorite(self, user_id: str, vehicle_id: str) -> bool:
        """Remove vehicle from favorites"""
        result = await self.db.favorites.delete_one({
            "user_id": user_id,
            "vehicle_id": vehicle_id
        })
        
        if result.deleted_count > 0:
            # Decrement vehicle favorites count
            await self.db.vehicles.update_one(
                {"id": vehicle_id},
                {"$inc": {"favorites_count": -1}}
            )
        
        return result.deleted_count > 0

    async def get_user_favorites(self, user_id: str) -> List[Vehicle]:
        """Get user's favorite vehicles"""
        # Get favorite vehicle IDs
        favorites_cursor = self.db.favorites.find({"user_id": user_id})
        favorites_data = await favorites_cursor.to_list(length=1000)
        vehicle_ids = [fav["vehicle_id"] for fav in favorites_data]
        
        # Get vehicles
        if not vehicle_ids:
            return []
            
        vehicles_cursor = self.db.vehicles.find({"id": {"$in": vehicle_ids}})
        vehicles_data = await vehicles_cursor.to_list(length=1000)
        vehicles = [Vehicle(**vehicle_data) for vehicle_data in vehicles_data]
        
        return vehicles

# Global database instance
db = Database()