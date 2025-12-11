# Donation Platform for Influencers

A platform where fans donate to creators and track campaigns.

## Quick Start

### Prerequisites
- Docker (for production deployment)
- Node.js 18+ (for development)

### Production Deployment (Docker)

**Option 1: Simple Scripts (Recommended)**

```bash
./start.sh    # Start the application
./stop.sh     # Stop the application
```

**Option 2: Using Make**

```bash
make up       # Start the application
make down     # Stop the application
make logs     # View logs
make clean    # Stop and remove all data
make help     # Show all commands
```

**Option 3: Direct Docker Compose**

```bash
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose logs -f    # View logs
```

**Access the Application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

### Development Setup

**Option 1: Start Both Services**

```bash
make dev    # Start both backend and frontend in dev mode
```

**Option 2: Start Individually**

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run seed    # Create sample data (first time only)
   npm run dev     # Start server on http://localhost:3000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev     # Start on http://localhost:5173
   ```

**Access the Application in Development:**
- Landing Page: http://localhost:5173
- Admin Dashboard: http://localhost:5173/admin
- Influencer Portal: http://localhost:5173/influencer
- Donor Portal: http://localhost:5173/donor

## Features

### Create
- Campaigns
- Donations
- Influencer profiles

### Read
- Donation history
- Statistics

### Update
- Campaign goals

### Delete
- Donations
- Campaigns

## User Roles

- **Admin** - Monitors platform, views all donations/campaigns/influencers, can delete any entity
- **Influencer** - Creates campaigns, views stats, manages their campaigns
- **Donor** - Browses campaigns, makes donations, creates donor account

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript + React Router v6 + TailwindCSS v4 |
| Backend | Node.js + Express.js + Sequelize ORM + TypeScript |
| Database | SQLite |
| Containerization | Docker |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/influencers` | List/create influencers |
| GET/PUT/DELETE | `/api/influencers/:id` | Get/update/delete influencer |
| GET/POST | `/api/campaigns` | List/create campaigns |
| GET/PUT/DELETE | `/api/campaigns/:id` | Get/update/delete campaign |
| GET/POST | `/api/donors` | List/create donors |
| GET/POST | `/api/donations` | List/create donations |
| DELETE | `/api/donations/:id` | Delete donation |
| GET | `/api/stats` | Platform statistics for admin |

## Workflow

1. Influencer creates campaign
2. Donor contributes
3. System logs donation
4. Influencer views stats
5. Admin monitors platform
