# Installing ProjectFlow

## 1. Prerequisites

- **Python 3.11 or later**
- **Node.js** (required for the React frontend; install a recent LTS version)

## 2. Get the Code

Clone the repository:

```bash
git clone <repository-url>
cd projectflow
```

## 3. Environment Configuration

Copy the template and set the required values:

```bash
cp .env.example .env
```

Edit `.env` and provide:

- `JWT_SECRET` – a random string (e.g., `openssl rand -hex 32`)
- `DATABASE_URL` – `sqlite:///./projectflow.db` (default) or a path to the SQLite file
- `ROOT` – absolute path to the project directory (e.g., `/home/user/projectflow`)

`BACKEND_PID` and `FRONTEND_PID` are used internally by the start script; you can leave them as default file paths.

## 4. Install Dependencies

Run the provided setup script, which installs Python and Node packages:

```bash
./install.sh
```

To do it manually:

**Backend**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend**
```bash
cd frontend
npm install
```

## 5. Database Setup

The application uses SQLite and will automatically create tables and seed demo data on the first run (via the FastAPI lifespan handler). No manual migrations are required for development. For production, you can run Alembic:

```bash
cd backend
alembic upgrade head
```

## 6. Running the Application

**Start the backend** (from the project root):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Start the frontend** (in a separate terminal, from `frontend/`):

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`. It proxies API requests to `http://localhost:8000`.

Alternatively, use the start script (if available in `install.sh`).

## 7. Production Build

**Frontend**

```bash
cd frontend
npm run build
```

This generates static files in `frontend/dist/`. Serve them with any HTTP server (e.g., nginx) and point the API proxy to your backend.

**Backend**

Run uvicorn without `--reload`:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## 8. Troubleshooting

- **CORS errors** – The backend’s CORS middleware allows only `http://localhost:5173` and `http://127.0.0.1:5173`. If your frontend runs on a different port, update `allow_origins` in `backend/main.py`.
- **Database locked** – SQLite does not handle heavy concurrent writes well. Avoid starting multiple backend processes that access the same `projectflow.db`.
- **Python version** – Ensure you are using Python 3.11 or later; async SQLAlchemy features require it.
- **Missing dependencies** – If `pip install` fails, try upgrading pip (`pip install --upgrade pip`) and install build tools (`pip install wheel`).