# 🧩 Proyecto Hito 5 — Despliegue en Render

## 1. Introducción General
Este proyecto forma parte del Hito 5 del módulo de Arquitectura y Servicios Web. El objetivo principal es desplegar en la nube los microservicios desarrollados previamente (productos, autenticación, comentarios) junto con el frontend del comparador de supermercados. El despliegue debía cumplir tres requisitos clave: ser públicamente accesible, ser escalable y permitir observabilidad (logs, métricas, estado del servicio). Para ello se utilizó un monorepo en GitHub, contenedores Docker y la plataforma de despliegue Render.

## 2. ¿Por qué elegimos Render?
Render fue seleccionado por varias razones prácticas y académicas: simplicidad para desplegar servicios Docker sin configurar servidores manualmente, integración con GitHub para despliegues automáticos con cada push, plan gratuito suficiente para microservicios académicos, observabilidad integrada con logs en tiempo real, métricas de CPU/RAM y panel de estado, y compatibilidad con monorepos que permite definir un Root Directory para cada servicio. En resumen, Render ofrece un equilibrio perfecto entre facilidad de uso y funcionalidades avanzadas, ideal para un proyecto académico basado en microservicios.

## 3. Problemas encontrados durante el despliegue (y soluciones)

### 3.1 Problema del Root Directory
Render fallaba con el error:

Root directory "product-service" does not exist.

less
Copy code

**Causa:** El proyecto estaba dentro de una carpeta llamada “Hito 4”, con espacio y mayúscula. Render es extremadamente estricto con los nombres de carpeta.

**Solución:** Ajustar el Root Directory a:

Hito 4/backend/product-service

y corregir el Dockerfile Path duplicado:

Hito 4/backend/product-service/Dockerfile

Después de esto, Render pudo construir la imagen correctamente.

### 3.2 Cambios locales no reflejados
Render seguía fallando incluso después de corregir rutas.

**Causa:** Los cambios estaban hechos localmente, pero no se habían hecho commit y push al repositorio.

**Solución:**

```bash
git add .
git commit -m "Fix folder names and deployment paths"
git push origin main
3.3 Dockerfile duplicado en la configuración
Render mostraba rutas como:

Hito 4/backend/product-service/Hito 4/backend/product-service/Dockerfile
Esto provocaba errores tipo:

lstat ... no such file or directory
Solución: Corregir el Dockerfile Path para que contuviera solo:

Hito 4/backend/product-service/Dockerfile

4. Estructura del trabajo

El README se organiza en cuatro secciones principales:

1- Introducción y despliegue general – motivación, elección de Render, problemas y soluciones.

2- Product-Service – despliegue, variables de entorno, logs, observabilidad, stress testing y URL pública.

3- Otros microservicios (auth-service, comment-service) – configuración, despliegue e integración.

4- Frontend – build, despliegue y conexión con los microservicios.

🛒 5. Product-Service — Despliegue Completo

🚀 URL pública del servicio

GET /products
https://product-service-3lsh.onrender.com/products

Este endpoint devuelve la lista completa de productos almacenados en MongoDB Atlas.

🛠️ Configuración de despliegue en Render
Root Directory:
Hito 4/backend/product-service

Dockerfile Path:
Hito 4/backend/product-service/Dockerfile

Variables de entorno:
PRODUCT_MONGO_URI=your_mongo_atlas_uri
PORT=5000
JWT_SECRET=supersecret123

📊 Observabilidad
Render proporciona: logs en tiempo real, métricas de CPU y RAM, estado del servicio e historial de despliegues.

Ejemplo de logs:

- Product service running on port 5000
- Connected to MongoDB Atlas

🧪 Stress Testing
Para simular carga sobre el endpoint /products:

Apache Bench:

ab -n 100 -c 10 https://product-service-3lsh.onrender.com/products
Postman Runner: 100 iteraciones, 10 concurrencias, verificar tiempos de respuesta.


🔐 6. Otros Microservicios (auth-service, comment-service)
(Esta sección se completará tras desplegar los otros servicios.)

🎨 7. Frontend
(Se añadirá tras desplegar el frontend y conectarlo con los microservicios.)

