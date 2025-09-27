#!/bin/bash

# VELES DRIVE - Database Backup Script
echo "🚗 VELES DRIVE Database Backup Script"

# Configuration
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="veles_backup_${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Check if MongoDB container is running
if ! docker ps | grep -q "veles_mongodb"; then
    echo "❌ MongoDB container is not running. Please start the application first."
    exit 1
fi

echo "📦 Creating database backup..."

# Create MongoDB backup
docker exec veles_mongodb mongodump \
    --username admin \
    --password password123 \
    --authenticationDatabase admin \
    --db velesdrive \
    --out /tmp/backup

# Copy backup from container to host
docker cp veles_mongodb:/tmp/backup/velesdrive $BACKUP_DIR/$BACKUP_NAME

# Compress backup
cd $BACKUP_DIR
tar -czf ${BACKUP_NAME}.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

echo "✅ Backup created successfully: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "📊 Backup size: $(du -h $BACKUP_DIR/${BACKUP_NAME}.tar.gz | cut -f1)"

# Clean up old backups (keep only last 7 days)
find $BACKUP_DIR -name "veles_backup_*.tar.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up (kept last 7 days)"