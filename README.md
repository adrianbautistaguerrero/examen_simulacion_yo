# 🛡️ Detector de SPAM con Machine Learning

Aplicación full-stack para detección de spam en emails usando Machine Learning (Regresión Logística + CountVectorizer) entrenado con el dataset TREC07p.

## 🎯 Características

- ✅ Análisis en tiempo real de emails
- 📊 Gráficos de probabilidad spam vs ham
- 🔍 Detección de palabras clave sospechosas
- 📈 Estadísticas y métricas de rendimiento
- 📁 Soporte para archivos de email
- 🎨 Interfaz moderna y responsive
- ⚡ API REST rápida y eficiente

## 🏗️ Arquitectura

- **Frontend**: Next.js 16 + React 19 + TailwindCSS + Recharts
- **Backend**: Django 4 + Django REST Framework + scikit-learn
- **ML Model**: Regresión Logística con CountVectorizer
- **Dataset**: TREC07p (75,000+ emails)

## 🚀 Deployment

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instrucciones completas de deployment en Vercel y Render.

### Quick Start - Deployment

1. **Backend en Render**:
   - Crea un Web Service
   - Root Directory: `backend`
   - Build Command: `./build.sh`
   - Start Command: `gunicorn django_spam_detector.wsgi:application`
   - Agrega variable `NEXT_PUBLIC_API_URL`

2. **Frontend en Vercel**:
   - Importa el repositorio
   - Agrega variable de entorno: `NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com`
   - Deploy

## 💻 Desarrollo Local

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

La API estará disponible en: `http://localhost:8000`

### Frontend (Next.js)

```bash
npm install
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### Variables de Entorno

Crea un archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### POST `/api/analyze/`
Analiza texto de email

```json
{
  "email_text": "Your email content here..."
}
```

**Response:**
```json
{
  "prediction": "spam",
  "confidence": 95.23,
  "spam_probability": 95.23,
  "ham_probability": 4.77,
  "spam_keywords": ["free", "winner", "click", "money"],
  "latency": 12.45,
  "cleaned_text": "..."
}
```

### POST `/api/analyze-file/`
Analiza archivo de email (multipart/form-data)

### GET `/api/statistics/`
Obtiene estadísticas generales

### GET `/api/history/`
Obtiene historial de análisis

## 🎨 Screenshots

- Análisis de texto en tiempo real
- Gráficos de probabilidad
- Lista de palabras clave sospechosas
- Estadísticas y métricas
- Historial de análisis

## 🔒 Seguridad

- CORS configurado
- Rate limiting (recomendado en producción)
- Variables de entorno para secretos
- Validación de entrada
- Sanitización de datos

## 📊 Rendimiento

- Latencia promedio: ~10-50ms
- Precisión del modelo: >95% (depende del dataset)
- Capacidad de procesamiento: 1000+ emails/minuto

## 🛠️ Stack Tecnológico

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS 4
- Recharts (gráficos)
- shadcn/ui (componentes)

### Backend
- Python 3.11
- Django 4.2
- Django REST Framework
- scikit-learn
- joblib
- gunicorn

### Deployment
- Vercel (Frontend)
- Render (Backend)

## 📝 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios.

## 📧 Contacto

Para preguntas y soporte, abre un issue en el repositorio.

---

Desarrollado con ❤️ usando Next.js y Django
