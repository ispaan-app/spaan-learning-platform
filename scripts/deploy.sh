#!/bin/bash

# iSpaan Deployment Script
# This script handles deployment to various environments

set -e

# Configuration
ENVIRONMENT=${1:-development}
VERSION=${2:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-your-registry.com}
IMAGE_NAME=${IMAGE_NAME:-ispaan}
NAMESPACE=${NAMESPACE:-ispaan}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if [ "${ENVIRONMENT}" = "production" ] && ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    # Check if required environment variables are set
    if [ -z "${FIREBASE_PROJECT_ID}" ]; then
        error "FIREBASE_PROJECT_ID environment variable is required"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    
    local image_tag="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    
    docker build -t "${image_tag}" .
    
    if [ $? -eq 0 ]; then
        log "Docker image built successfully: ${image_tag}"
    else
        error "Docker image build failed"
        exit 1
    fi
}

# Push Docker image
push_image() {
    log "Pushing Docker image to registry..."
    
    local image_tag="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    
    docker push "${image_tag}"
    
    if [ $? -eq 0 ]; then
        log "Docker image pushed successfully: ${image_tag}"
    else
        error "Docker image push failed"
        exit 1
    fi
}

# Deploy to Docker Compose
deploy_docker_compose() {
    log "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down
    
    # Pull latest images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    wait_for_health
    
    log "Docker Compose deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log "Deploying to Kubernetes..."
    
    # Update image tag in deployment
    sed -i "s|image: ${IMAGE_NAME}:.*|image: ${IMAGE_NAME}:${VERSION}|g" k8s/deployment.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/deployment.yaml
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/ispaan-app -n ${NAMESPACE} --timeout=300s
    
    log "Kubernetes deployment completed"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI is not installed. Install it with: npm i -g vercel"
        exit 1
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    log "Vercel deployment completed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Run unit tests
    npm run test:ci
    
    # Run integration tests
    npm run test:integration
    
    # Run E2E tests (if not in CI)
    if [ "${CI}" != "true" ]; then
        npm run test:e2e
    fi
    
    log "All tests passed"
}

# Wait for health check
wait_for_health() {
    log "Waiting for application to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log "Application is healthy"
            return 0
        fi
        
        info "Health check attempt ${attempt}/${max_attempts} failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Application failed to become healthy after ${max_attempts} attempts"
    exit 1
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # This would run your database migration scripts
    # npm run db:migrate
    
    log "Database migrations completed"
}

# Update secrets
update_secrets() {
    log "Updating secrets..."
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        # Update Kubernetes secrets
        kubectl create secret generic ispaan-secrets \
            --from-literal=firebase-project-id="${FIREBASE_PROJECT_ID}" \
            --from-literal=jwt-secret="${JWT_SECRET}" \
            --from-literal=nextauth-secret="${NEXTAUTH_SECRET}" \
            --dry-run=client -o yaml | kubectl apply -f -
        
        log "Secrets updated"
    fi
}

# Rollback deployment
rollback() {
    log "Rolling back deployment..."
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        kubectl rollout undo deployment/ispaan-app -n ${NAMESPACE}
        kubectl rollout status deployment/ispaan-app -n ${NAMESPACE}
    else
        docker-compose down
        docker-compose up -d
    fi
    
    log "Rollback completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old versions (keep last 3)
    docker images "${DOCKER_REGISTRY}/${IMAGE_NAME}" --format "table {{.Tag}}\t{{.ID}}" | \
        tail -n +2 | \
        sort -V | \
        head -n -3 | \
        awk '{print $2}' | \
        xargs -r docker rmi
    
    log "Cleanup completed"
}

# Show deployment status
show_status() {
    log "Deployment status:"
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        kubectl get pods -n ${NAMESPACE}
        kubectl get services -n ${NAMESPACE}
        kubectl get ingress -n ${NAMESPACE}
    else
        docker-compose ps
    fi
}

# Main deployment function
main() {
    log "Starting deployment to ${ENVIRONMENT} environment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests
    run_tests
    
    # Build and push image
    build_image
    push_image
    
    # Update secrets
    update_secrets
    
    # Run migrations
    run_migrations
    
    # Deploy based on environment
    case "${ENVIRONMENT}" in
        "development")
            deploy_docker_compose
            ;;
        "staging")
            deploy_docker_compose
            ;;
        "production")
            deploy_kubernetes
            ;;
        "vercel")
            deploy_vercel
            ;;
        *)
            error "Unknown environment: ${ENVIRONMENT}"
            exit 1
            ;;
    esac
    
    # Show status
    show_status
    
    # Cleanup
    cleanup
    
    log "Deployment completed successfully"
}

# Handle script arguments
case "${1:-}" in
    "build")
        check_prerequisites
        build_image
        ;;
    "push")
        check_prerequisites
        push_image
        ;;
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    "test")
        run_tests
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|push|deploy|rollback|status|test|cleanup} [environment] [version]"
        echo "Environments: development, staging, production, vercel"
        echo "Example: $0 deploy production v1.0.0"
        exit 1
        ;;
esac

