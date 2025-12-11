.PHONY: help up down restart logs build clean dev dev-frontend dev-backend

help:
	@echo "Available commands:"
	@echo "  make up          - Start the application (backend + frontend)"
	@echo "  make down        - Stop and remove all containers"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make build       - Build/rebuild Docker images"
	@echo "  make clean       - Stop containers and remove volumes"
	@echo "  make dev         - Start both backend and frontend in development mode"
	@echo "  make dev-backend - Start only backend in development mode"
	@echo "  make dev-frontend- Start only frontend in development mode"

up:
	docker-compose up -d
	@echo "Application started!"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend API: http://localhost:8000"

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

build:
	docker-compose build

clean:
	docker-compose down -v
	@echo "All containers and volumes removed"

dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:3000"
	@echo "Frontend will run on http://localhost:5173"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill 0' EXIT; \
	(cd backend && npm run dev) & \
	(cd frontend && npm run dev) & \
	wait

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev
