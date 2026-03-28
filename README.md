# Travel Plan Booking Management System (TravelMind)

A full-stack Travel Plan Booking Management System with AI trip planning, built with FastAPI + MySQL on the backend and React 18 on the frontend.

## Project Overview

TravelMind helps users:
- Register and authenticate securely with JWT
- Create and manage trips
- Add flights, hotels, and activities to trips
- Confirm bookings and process payments
- Chat with an AI assistant for travel guidance
- Auto-generate full trip itineraries using AI
- Manage profile and booking history

## Folder Structure

```text
travel-booking-system/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── bookings.py
│   │   ├── flights.py
│   │   ├── hotels.py
│   │   ├── trips.py
│   │   └── ai_agent.py
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── booking_service.py
│   │   └── email_service.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
```

## Tech Stack

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy ORM
- MySQL (PyMySQL)
- Pydantic v2
- JWT (`python-jose`)
- Password hashing (`passlib` + `bcrypt`)
- AI integration (`openai`)
- Alembic for migrations

### Frontend
- React 18
- React Router v6
- Axios
- Context API
- React Icons
- Pure CSS Modules

## Backend Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE travel_booking_db;
```

### 2. Create Backend Environment

From `travel-booking-system/backend`:

```bash
python -m venv .venv
```

Activate venv:

- Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update values.

Required variables:
- `DATABASE_URL`:
  - Example: `mysql+pymysql://root:password@localhost:3306/travel_booking_db`
- `SECRET_KEY`:
  - Use a long random secret string
- `OPENAI_API_KEY`:
  - OpenAI API key for AI endpoints
- `ALGORITHM`:
  - JWT algorithm, default `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`:
  - Token expiry in minutes

### 4. Run Migrations

From `travel-booking-system/backend`:

```bash
alembic upgrade head
```

### 5. Run Backend Server

From `travel-booking-system/backend`:

```bash
uvicorn main:app --reload
```

Backend URL: `http://localhost:8000`

## Frontend Setup

From `travel-booking-system/frontend`:

```bash
npm install
npm start
```

Frontend URL: `http://localhost:3000`

## Auth and Security

- JWT token is returned on login and stored in `localStorage`
- Axios request interceptor attaches `Authorization: Bearer <token>`
- Axios response interceptor handles `401` and redirects to `/login`
- Protected routes are wrapped with `PrivateRoute`
- Backend protects all trip, booking, payment, and AI endpoints via JWT dependency

## CORS

Backend CORS allows:
- `http://localhost:3000`

## API Endpoint Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login user and get JWT | No |
| GET | `/api/auth/me` | Current user profile | Yes |
| PUT | `/api/auth/me` | Update current user profile | Yes |
| GET | `/api/trips` | List current user trips | Yes |
| POST | `/api/trips` | Create trip | Yes |
| GET | `/api/trips/{id}` | Get trip by id | Yes |
| PUT | `/api/trips/{id}` | Update trip | Yes |
| DELETE | `/api/trips/{id}` | Delete trip | Yes |
| GET | `/api/trips/{trip_id}/flights` | List flights for trip | Yes |
| POST | `/api/trips/{trip_id}/flights` | Add flight to trip | Yes |
| DELETE | `/api/flights/{id}` | Delete flight | Yes |
| GET | `/api/trips/{trip_id}/hotels` | List hotels for trip | Yes |
| POST | `/api/trips/{trip_id}/hotels` | Add hotel to trip | Yes |
| DELETE | `/api/hotels/{id}` | Delete hotel | Yes |
| GET | `/api/trips/{trip_id}/activities` | List activities for trip | Yes |
| POST | `/api/trips/{trip_id}/activities` | Add activity to trip | Yes |
| DELETE | `/api/activities/{id}` | Delete activity | Yes |
| POST | `/api/bookings/confirm` | Confirm booking for trip | Yes |
| GET | `/api/bookings/history` | Booking history | Yes |
| POST | `/api/payments/process` | Process payment | Yes |
| POST | `/api/ai/chat` | Chat with TravelMind AI | Yes |
| GET | `/api/ai/history/{session_id}` | Conversation history by session | Yes |
| POST | `/api/ai/plan-trip` | Generate structured itinerary | Yes |
| POST | `/api/ai/suggest-hotels` | Suggest hotels by destination | Yes |
| POST | `/api/ai/suggest-flights` | Suggest flights by destination | Yes |

## AI Service Behavior

The AI service (`backend/services/ai_service.py`) uses a TravelMind system prompt and supports:
- Contextual chat
- Conversation persistence per `session_id` in `ai_conversations`
- Structured trip planning output with:
  - `itinerary`
  - `suggested_flights`
  - `suggested_hotels`
  - `estimated_cost`
  - `tips`

If `OPENAI_API_KEY` is missing, a safe fallback mode returns deterministic sample planning responses.

## Notes

- The backend startup event creates tables if they do not exist.
- Alembic configuration and an initial migration are included.
- Frontend uses pure CSS modules and responsive layouts.
- Booking payment UI is mock-card style and does not connect to a real payment gateway.

## Run Quick Start

Open two terminals.

Terminal 1 (backend):

```bash
cd travel-booking-system/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 2 (frontend):

```bash
cd travel-booking-system/frontend
npm install
npm start
```
