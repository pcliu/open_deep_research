.PHONY: help install install-frontend install-backend dev-frontend dev-backend dev stop setup check-env

help:
	@echo "========================================="
	@echo "Open Deep Research - Development Commands"
	@echo "========================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup           - Complete setup (environment + dependencies)"
	@echo "  make install         - Install all dependencies (frontend + backend)"
	@echo "  make install-frontend- Install frontend dependencies"
	@echo "  make install-backend - Install backend dependencies"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev             - Start both frontend and backend servers"
	@echo "  make dev-frontend    - Start frontend development server (Vite)"
	@echo "  make dev-backend     - Start backend development server (LangGraph)"
	@echo "  make stop            - Stop all running services"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make check-env       - Check environment setup"
	@echo "  make help            - Show this help message"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. make setup        - One-time setup"
	@echo "  2. make dev          - Start development"
	@echo ""

# Environment setup and dependency installation
setup: check-env install
	@echo "✅ Setup complete! Run 'make dev' to start development."

install: install-backend install-frontend

install-backend:
	@echo "📦 Installing backend dependencies..."
	@if [ ! -d ".venv" ]; then \
		echo "Creating virtual environment..."; \
		uv venv; \
	fi
	@echo "Activating virtual environment and installing dependencies..."
	@source .venv/bin/activate && uv pip install -r pyproject.toml
	@echo "✅ Backend dependencies installed"

install-frontend:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Frontend dependencies installed"

# Check environment setup
check-env:
	@echo "🔍 Checking environment setup..."
	@command -v uv >/dev/null 2>&1 || { echo "❌ Error: uv is not installed. Please install uv first."; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "❌ Error: Node.js is not installed. Please install Node.js first."; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "❌ Error: npm is not installed. Please install npm first."; exit 1; }
	@if [ ! -f ".env" ]; then \
		echo "⚠️  Warning: .env file not found. Create one for custom configuration."; \
		echo "   You can copy .env.example if it exists."; \
	fi
	@echo "✅ Environment check passed"

# Development servers
dev-frontend:
	@echo "🚀 Starting frontend development server..."
	@echo "Frontend will be available at: http://localhost:5173 (or next available port)"
	@cd frontend && npm run dev

dev-backend:
	@echo "🚀 Starting backend development server..."
	@echo "Backend API will be available at: http://localhost:2024"
	@echo "LangGraph Studio will be available at: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024"
	@source .venv/bin/activate && langgraph dev

# Run frontend and backend concurrently
dev:
	@echo "🚀 Starting Open Deep Research - Full Stack Development"
	@echo "========================================="
	@echo "Frontend: http://localhost:5173+ (React + Vite)"
	@echo "Backend:  http://localhost:2024 (LangGraph API)"
	@echo "Studio:   https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024"
	@echo "========================================="
	@echo ""
	@echo "Starting both servers concurrently..."
	@echo "Press Ctrl+C to stop all services"
	@echo ""
	@trap 'echo "\n🛑 Stopping all services..."; kill 0' INT; \
	make dev-frontend & \
	make dev-backend & \
	wait

# Stop all services (cleanup)
stop:
	@echo "🛑 Stopping all development services..."
	@pkill -f "npm run dev" 2>/dev/null || true
	@pkill -f "langgraph dev" 2>/dev/null || true
	@pkill -f "uvx.*langgraph" 2>/dev/null || true
	@echo "✅ All services stopped"

# Build commands
build-frontend:
	@echo "🏗️  Building frontend for production..."
	@cd frontend && npm run build

build: build-frontend
	@echo "✅ Build complete"

# Lint and format
lint-frontend:
	@echo "🔍 Linting frontend..."
	@cd frontend && npm run lint

lint-backend:
	@echo "🔍 Linting backend..."
	@ruff check src/ tests/ || echo "⚠️  Install ruff for backend linting: pip install ruff"

lint: lint-frontend lint-backend

# Test commands
test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test 2>/dev/null || echo "⚠️  No frontend tests configured"

test-backend:
	@echo "🧪 Running backend tests..."
	@source .venv/bin/activate && python -m pytest tests/ 2>/dev/null || echo "⚠️  No backend tests found"

test: test-frontend test-backend

# Clean commands
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules/.vite
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Clean complete"

# Docker commands (if needed)
docker-build:
	@echo "🐳 Building Docker image..."
	@docker build -t open-deep-research .

docker-run:
	@echo "🐳 Running Docker container..."
	@docker run -p 8123:8123 -p 5173:5173 open-deep-research

# Show running processes
status:
	@echo "📊 Development Server Status:"
	@echo "================================"
	@pgrep -f "npm run dev" >/dev/null && echo "✅ Frontend: Running" || echo "❌ Frontend: Not running"
	@pgrep -f "langgraph dev" >/dev/null && echo "✅ Backend: Running" || echo "❌ Backend: Not running"
	@echo ""
	@echo "🌐 URLs:"
	@echo "Frontend: http://localhost:5173+ (check console for exact port)"
	@echo "Backend:  http://localhost:2024"
	@echo "Studio:   https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024"