# TableGen - League Table Generator

A full-stack web application for automating football league standings generation.

## Quick Start

### Backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5002

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

## Admin Login

- Username: `admin`
- Password: `tablegen2026`

## Features

- Create tournaments and register teams with logos
- Enter match results with automatic standings calculation
- Export standings as PNG, JPG, and PDF
- Share to WhatsApp, Facebook, and Instagram
- Theme switching (Green, Blue, Red, Gold) with dark mode

## API Endpoints

- `GET/POST /api/tournaments` - Tournament CRUD
- `GET/POST /api/teams` - Team CRUD (supports logo upload)
- `GET/POST /api/matches` - Match CRUD
- `GET /api/standings/<tournament_id>` - Dynamic standings calculation
- `GET /api/stats` - Dashboard statistics
