# Guía de Deployment - Detector de SPAM

Este proyecto consta de dos partes:
1. **Frontend**: Next.js (deployar en Vercel)
2. **Backend**: Django API (deployar en Render)

## 📋 Pre-requisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Render](https://render.com)
- El archivo `modelo_spam_final.joblib` debe estar en la carpeta `backend/`

---

## 🚀 Deployment del Backend (Django en Render)

### Paso 1: Preparar el repositorio

Asegúrate de que tu proyecto esté en GitHub/GitLab con todos los archivos.

### Paso 2: Crear Web Service en Render

1. Ve a [render.com](https://render.com) y haz clic en "New +" → "Web Service"
2. Conecta tu repositorio
3. Configura el servicio:
   - **Name**: `spam-detector-api` (o el nombre que prefieras)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn django_spam_detector.wsgi:application`

### Paso 3: Variables de Entorno en Render

Agrega estas variables de entorno en Render (Environment → Add Environment Variable):

```
SECRET_KEY=genera-una-clave-secreta-muy-larga-y-aleatoria-aqui
DEBUG=0
PYTHON_VERSION=3.11.0
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=https://tu-proyecto.vercel.app
```

**IMPORTANTE**: 
- Para `SECRET_KEY`, usa un generador de claves secretas o una cadena aleatoria de al menos 50 caracteres
- Para `FRONTEND_URL`, primero usa `http://localhost:3000` y actualízala después del deployment del frontend

### Paso 4: Hacer el Build.sh ejecutable

Antes de hacer deploy, asegúrate de que el archivo `build.sh` tenga permisos de ejecución:

```bash
chmod +x backend/build.sh
git add backend/build.sh
git commit -m "Make build.sh executable"
git push
```

### Paso 5: Subir el modelo

El archivo `modelo_spam_final.joblib` debe estar en la carpeta `backend/` de tu repositorio. Si es muy grande para Git:

1. Usa Git LFS: `git lfs track "*.joblib"`
2. O súbelo manualmente al servidor después del deployment

### Paso 6: Deploy

Haz clic en "Create Web Service" y espera a que termine el build (puede tomar 5-10 minutos).

Tu API estará disponible en: `https://spam-detector-api.onrender.com`

---

## 🎨 Deployment del Frontend (Next.js en Vercel)

### Paso 1: Preparar Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New..." → "Project"
3. Importa tu repositorio de GitHub

### Paso 2: Configurar el proyecto

- **Framework Preset**: Next.js
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Paso 3: Variables de Entorno

Agrega esta variable de entorno en Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_API_URL=https://spam-detector-api.onrender.com
```

**IMPORTANTE**: Reemplaza `spam-detector-api.onrender.com` con la URL real de tu backend en Render.

### Paso 4: Deploy

Haz clic en "Deploy" y espera a que termine (2-3 minutos).

Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`

---

## 🔧 Configuración Post-Deployment

### Actualizar FRONTEND_URL en Render

Una vez que tengas la URL de Vercel:

1. Ve a tu servicio en Render
2. Ve a "Environment" → Edita la variable `FRONTEND_URL`
3. Cambia el valor a: `https://tu-proyecto.vercel.app`
4. Guarda y Render hará redeploy automáticamente

### Verificar CORS

Django ya está configurado para usar la variable `FRONTEND_URL` automáticamente en `CORS_ALLOWED_ORIGINS`, así que no necesitas editar código.

---

## ✅ Verificar el Deployment

### Backend API

Visita: `https://tu-api.onrender.com/api/analyze/`

Deberías poder hacer una petición POST.

### Frontend

1. Visita: `https://tu-proyecto.vercel.app`
2. Deberías ver la interfaz del detector de spam
3. Prueba analizar un texto de ejemplo
4. Verifica que se muestren los gráficos cuando detecta spam

---

## 🐛 Troubleshooting

### Error: "Modelo no cargado"

- Verifica que `modelo_spam_final.joblib` esté en `backend/`
- Revisa los logs en Render para ver errores de carga
- El modelo debe tener el mismo formato que el usado en desarrollo

### Error: CORS / Network Error

- Asegúrate de que `FRONTEND_URL` en Render tenga la URL correcta de Vercel
- Verifica que `NEXT_PUBLIC_API_URL` en Vercel tenga la URL correcta de Render
- NO incluyas "/" al final de las URLs
- Espera a que Render termine el redeploy después de cambiar variables

### Error: 502 Bad Gateway

- El backend puede estar iniciando (Render Free Tier se duerme después de inactividad)
- Primera carga puede tomar 30-60 segundos
- Verifica los logs en Render Dashboard

### Error: build.sh permission denied

- Ejecuta `chmod +x backend/build.sh` localmente
- Haz commit y push de nuevo
- En Render, cambia el Build Command a: `chmod +x ./build.sh && ./build.sh`

### Frontend no conecta con Backend

- Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente en Vercel
- Abre DevTools (F12) → Network para ver el error exacto
- Verifica que la URL del backend esté accesible desde el navegador
- Redeploya el frontend después de cambiar variables de entorno

### Gráficos no se muestran

- Abre la consola del navegador para ver errores
- Verifica que el backend esté retornando `spam_keywords`, `spam_probability` y `ham_probability`
- Prueba la API directamente con Postman o curl

---

## 📊 Monitoreo

- **Logs del Backend**: Render Dashboard → tu servicio → "Logs"
- **Logs del Frontend**: Vercel Dashboard → tu proyecto → "Deployments" → selecciona uno → "View Function Logs"
- **Métricas**: Ambas plataformas ofrecen métricas de uso gratuitas

---

## 🔄 Actualizaciones

Ambos servicios se redesplegan automáticamente cuando haces push a tu repositorio:

- **Render**: Redeploy automático del backend en cada push
- **Vercel**: Redeploy automático del frontend en cada push

Para forzar un redeploy manual:
- **Render**: Dashboard → "Manual Deploy" → "Deploy latest commit"
- **Vercel**: Dashboard → "Deployments" → tres puntos → "Redeploy"

---

## 💰 Costos

- **Render Free Tier**: 
  - 750 horas/mes de servicio
  - El servicio se duerme después de 15 minutos de inactividad
  - Primera petición después de dormir toma 30-60 segundos
  
- **Vercel Hobby**: 
  - Completamente gratis para proyectos personales
  - 100 GB de ancho de banda por mes
  - Despliegues ilimitados

---

## 🎯 Próximos Pasos

1. Configura un dominio personalizado (opcional)
2. Agrega Vercel Analytics para monitorear uso
3. Implementa rate limiting para la API con Django REST Framework
4. Configura PostgreSQL en Render para datos persistentes
5. Agrega autenticación de usuarios
6. Implementa caché con Redis para mejorar rendimiento

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs**: Render y Vercel tienen logs detallados
2. **Verifica las variables**: Asegúrate de que todas las variables de entorno estén configuradas
3. **Prueba localmente**: Usa las mismas variables de producción localmente
4. **Revisa las URLs**: NO uses "/" al final, verifica que coincidan

**Checklist de Variables:**
- ✅ `SECRET_KEY` en Render (generada)
- ✅ `DEBUG=0` en Render
- ✅ `FRONTEND_URL` en Render (URL de Vercel)
- ✅ `NEXT_PUBLIC_API_URL` en Vercel (URL de Render)

¡Tu detector de spam está listo para producción! 🎉
