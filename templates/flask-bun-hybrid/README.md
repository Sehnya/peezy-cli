# **APP_NAME**

A full-stack application with Flask backend and React frontend built with Bun.

## Features

### Backend (Flask)

- 🐍 **Flask** - Lightweight WSGI web application framework
- 🌐 **CORS Support** - Cross-Origin Resource Sharing enabled
- 📡 **API Endpoints** - RESTful API structure
- 🔧 **Environment Variables** - Configuration via .env files

### Frontend (React + Bun)

- ⚡ **Bun** - Fast JavaScript runtime and package manager
- ⚛️ **React 18** - Latest React with concurrent features
- 🏗️ **Vite** - Lightning fast build tool
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **TypeScript** - Type safety and better DX

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Bun (latest version)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   ```bash
   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

### Development

#### Start Backend (Terminal 1)

```bash
cd backend
python app.py
```

Backend will be available at [http://localhost:5000](http://localhost:5000).

#### Start Frontend (Terminal 2)

```bash
cd frontend
bun run dev
```

Frontend will be available at [http://localhost:5173](http://localhost:5173).

### Production Build

#### Build Frontend

```bash
cd frontend
bun run build
```

#### Run Production Server

```bash
cd backend
python app.py
```

The Flask server will serve both the API and the built React app at [http://localhost:5000](http://localhost:5000).

## Project Structure

```
__PKG_NAME__/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── main.tsx        # App entry point
│   │   └── index.css       # Global styles with Tailwind
│   ├── index.html          # HTML template
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind configuration
│   └── package.json        # Frontend dependencies
└── README.md              # This file
```

## API Endpoints

- `GET /` - Serves the React app
- `GET /api/health` - Health check endpoint
- `GET /api/env` - Environment configuration for frontend
- `GET /api/data` - Sample API endpoint

## Environment Variables

### Backend (.env)

- `FLASK_ENV` - Set to 'development' for debug mode
- `PORT` - Port number (default: 5000)
- `API_URL` - API URL for frontend (default: http://localhost:5000)

## Deployment

### Docker Compose (Recommended)

Create a `docker-compose.yml`:

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./frontend/dist:/app/static

  frontend:
    build: ./frontend
    volumes:
      - ./frontend/dist:/app/dist
```

### Manual Deployment

1. Build the frontend:

   ```bash
   cd frontend && bun run build
   ```

2. Deploy the Flask app with the built frontend files.

## Learn More

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Bun Documentation](https://bun.sh)

---

_Scaffolded with [peezy](https://github.com/Sehnya/peezy-cli)_
