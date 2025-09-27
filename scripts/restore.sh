#!/bin/bash

# VELES DRIVE - Database Restore Script
echo "🚗 VELES DRIVE Database Restore Script"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Please provide backup file path"
    echo "Usage: ./restore.sh /path/to/backup.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if MongoDB container is running
if ! docker ps | grep -q "veles_mongodb"; then
    echo "❌ MongoDB container is not running. Please start the application first."
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

echo "📥 Restoring database from: $BACKUP_FILE"

# Extract backup
TEMP_DIR="/tmp/veles_restore_$$"
mkdir -p $TEMP_DIR
tar -xzf "$BACKUP_FILE" -C $TEMP_DIR

# Copy backup to container
docker cp $TEMP_DIR veles_mongodb:/tmp/restore

# Restore database
docker exec veles_mongodb mongorestore \
    --username admin \
    --password password123 \
    --authenticationDatabase admin \
    --db velesdrive \
    --drop \
    /tmp/restore

# Clean up
rm -rf $TEMP_DIR
docker exec veles_mongodb rm -rf /tmp/restore

echo "✅ Database restored successfully from: $BACKUP_FILE"