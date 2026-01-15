#!/bin/bash

# Resource Management Environment Setup Script

show_help() {
    echo "Usage: $0 [local|docker|help]"
    echo ""
    echo "Commands:"
    echo "  local   - Set up local development environment"
    echo "  docker  - Set up Docker environment"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local    # Set up for local development"
    echo "  $0 docker   # Set up for Docker development"
}

setup_local() {
    echo "Setting up local development environment..."
    cp .env.local .env
    echo "Copied .env.local to .env"
    echo "Make sure you have PostgreSQL running locally"
    echo "You can now run: npm run dev"
}

setup_docker() {
    echo "Setting up Docker environment..."
    docker-compose up --build
}

case "$1" in
    local)
        setup_local
        ;;
    docker)
        setup_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Invalid option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
