// MongoDB initialization script for VELES DRIVE
db = db.getSiblingDB('velesdrive');

// Create collections
db.createCollection('users');
db.createCollection('vehicles');
db.createCollection('dealers');
db.createCollection('leads');
db.createCollection('messages');
db.createCollection('reviews');
db.createCollection('favorites');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 });
db.users.createIndex({ "role": 1 });

db.vehicles.createIndex({ "dealer_id": 1 });
db.vehicles.createIndex({ "make": 1 });
db.vehicles.createIndex({ "model": 1 });
db.vehicles.createIndex({ "year": 1 });
db.vehicles.createIndex({ "price": 1 });
db.vehicles.createIndex({ "status": 1 });
db.vehicles.createIndex({ "created_at": -1 });

db.dealers.createIndex({ "user_id": 1 }, { unique: true });
db.dealers.createIndex({ "company_name": 1 });
db.dealers.createIndex({ "status": 1 });

db.leads.createIndex({ "dealer_id": 1 });
db.leads.createIndex({ "buyer_id": 1 });
db.leads.createIndex({ "vehicle_id": 1 });
db.leads.createIndex({ "status": 1 });
db.leads.createIndex({ "created_at": -1 });

db.messages.createIndex({ "sender_id": 1 });
db.messages.createIndex({ "recipient_id": 1 });
db.messages.createIndex({ "conversation_id": 1 });
db.messages.createIndex({ "created_at": -1 });

db.reviews.createIndex({ "dealer_id": 1 });
db.reviews.createIndex({ "user_id": 1 });
db.reviews.createIndex({ "rating": 1 });

db.favorites.createIndex({ "user_id": 1 });
db.favorites.createIndex({ "vehicle_id": 1 });

print('VELES DRIVE database initialized successfully!');