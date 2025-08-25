# **APP_NAME**

A modern FastAPI application with automatic API documentation and high performance.

## Features

- ⚡ **FastAPI** - Modern, fast web framework for building APIs
- 📚 **Auto Documentation** - Interactive API docs with Swagger UI and ReDoc
- 🔧 **Type Hints** - Full type safety with Python type hints
- 🌐 **CORS Support** - Cross-Origin Resource Sharing enabled
- 🚀 **High Performance** - Built on Starlette and Pydantic
- 🔄 **Hot Reload** - Automatic reload during development

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**

   ```bash
   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The application will be available at [http://localhost:8000](http://localhost:8000).

### API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### API Endpoints

- `GET /` - Main application page
- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Sample API endpoint
- `GET /api/items/{item_id}` - Sample parameterized endpoint

## Project Structure

```
__PKG_NAME__/
├── main.py            # Main FastAPI application
├── requirements.txt   # Python dependencies
├── .env.example      # Environment variables template
└── README.md         # This file
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - Port number (default: 8000)

## Adding Features

### Database Integration

```bash
pip install sqlalchemy databases[postgresql]
```

### Authentication

```bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
```

### Background Tasks

```bash
pip install celery redis
```

## Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production with Gunicorn

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

---

_Scaffolded with [peezy](https://github.com/Sehnya/peezy-cli)_
