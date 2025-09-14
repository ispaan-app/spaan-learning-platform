#!/bin/bash

# iSpaan Backup Script
# This script creates backups of the database and application data

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="ispaan_backup_${DATE}"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: ${BACKUP_DIR}/${BACKUP_NAME}"
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
}

# Backup Firestore database
backup_firestore() {
    log "Starting Firestore backup..."
    
    if command -v gcloud &> /dev/null; then
        gcloud firestore export gs://${FIREBASE_PROJECT_ID}-backups/firestore/${BACKUP_NAME} \
            --project=${FIREBASE_PROJECT_ID}
        log "Firestore backup completed successfully"
    else
        error "gcloud CLI not found. Please install Google Cloud SDK"
        exit 1
    fi
}

# Backup Firebase Storage
backup_storage() {
    log "Starting Firebase Storage backup..."
    
    if command -v gsutil &> /dev/null; then
        gsutil -m cp -r gs://${FIREBASE_PROJECT_ID}.appspot.com \
            gs://${FIREBASE_PROJECT_ID}-backups/storage/${BACKUP_NAME}
        log "Firebase Storage backup completed successfully"
    else
        error "gsutil not found. Please install Google Cloud SDK"
        exit 1
    fi
}

# Backup application data
backup_app_data() {
    log "Starting application data backup..."
    
    # Backup environment configuration
    if [ -f ".env.local" ]; then
        cp .env.local "${BACKUP_DIR}/${BACKUP_NAME}/env.local"
        log "Environment configuration backed up"
    fi
    
    # Backup logs
    if [ -d "./logs" ]; then
        cp -r ./logs "${BACKUP_DIR}/${BACKUP_NAME}/"
        log "Application logs backed up"
    fi
    
    # Backup uploads
    if [ -d "./uploads" ]; then
        cp -r ./uploads "${BACKUP_DIR}/${BACKUP_NAME}/"
        log "Uploaded files backed up"
    fi
    
    # Backup configuration files
    cp -r ./config "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || true
    cp -r ./k8s "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || true
    cp -r ./monitoring "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || true
    cp docker-compose.yml "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || true
    cp Dockerfile "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || true
    
    log "Application data backup completed"
}

# Create backup archive
create_archive() {
    log "Creating backup archive..."
    
    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    rm -rf "${BACKUP_NAME}"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    log "Backup archive created: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})"
    
    cd - > /dev/null
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    find "${BACKUP_DIR}" -name "ispaan_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    local deleted_count=$(find "${BACKUP_DIR}" -name "ispaan_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)
    if [ $deleted_count -gt 0 ]; then
        log "Deleted ${deleted_count} old backup(s)"
    else
        log "No old backups to delete"
    fi
}

# Verify backup
verify_backup() {
    log "Verifying backup integrity..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    if [ -f "${backup_file}" ]; then
        if tar -tzf "${backup_file}" > /dev/null 2>&1; then
            log "Backup verification successful"
            return 0
        else
            error "Backup verification failed - archive is corrupted"
            return 1
        fi
    else
        error "Backup file not found: ${backup_file}"
        return 1
    fi
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Email notification (if configured)
    if [ ! -z "${SMTP_USER}" ] && [ ! -z "${SMTP_PASS}" ]; then
        echo "${message}" | mail -s "iSpaan Backup ${status}" "${ADMIN_EMAIL:-admin@ispaan.co.za}"
    fi
    
    # Log notification
    log "Notification sent: ${message}"
}

# Main backup function
main() {
    log "Starting iSpaan backup process..."
    
    # Check required environment variables
    if [ -z "${FIREBASE_PROJECT_ID}" ]; then
        error "FIREBASE_PROJECT_ID environment variable is required"
        exit 1
    fi
    
    # Create backup directory
    create_backup_dir
    
    # Perform backups
    backup_firestore
    backup_storage
    backup_app_data
    
    # Create archive
    create_archive
    
    # Verify backup
    if verify_backup; then
        log "Backup completed successfully"
        send_notification "SUCCESS" "iSpaan backup completed successfully: ${BACKUP_NAME}.tar.gz"
    else
        error "Backup verification failed"
        send_notification "FAILED" "iSpaan backup verification failed: ${BACKUP_NAME}.tar.gz"
        exit 1
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    log "Backup process completed"
}

# Handle script arguments
case "${1:-}" in
    "firestore")
        create_backup_dir
        backup_firestore
        ;;
    "storage")
        create_backup_dir
        backup_storage
        ;;
    "app")
        create_backup_dir
        backup_app_data
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "verify")
        verify_backup
        ;;
    *)
        main
        ;;
esac

