#!/bin/bash

# VELES DRIVE - Production Environment Startup Script
echo "🚗 Starting VELES DRIVE Production Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old volumes if requested
if [[ "$1" == "--clean" ]]; then
    echo "🧹 Cleaning up old volumes..."
    docker-compose down -v
    docker system prune -f
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Build and start production environment
echo "🔨 Building and starting production environment..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ VELES DRIVE Production Environment is ready!"
echo ""
echo "🌐 Application: http://localhost:8001"
echo "📊 MongoDB: localhost:27017"
echo "🚀 Redis: localhost:6379"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"