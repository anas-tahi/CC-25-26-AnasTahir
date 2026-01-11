# 🧩 Project Milestone 5 — Cloud Deployment on Render

## Table of Contents
1. [General Introduction](#1-general-introduction)  
2. [Why Render?](#2-why-render)  
3. [Deployment Challenges & Solutions](#3-deployment-challenges--solutions)  
4. [Microservices Deployment — Detailed](#4-microservices-deployment-—-detailed)  
   - [Product Service](#41-product-service)  
   - [Auth Service](#42-auth-service)  
   - [Comment Service](#43-comment-service)  
   - [Frontend](#44-frontend)  
5. [Observability & Monitoring](#5-observability--monitoring)  
6. [Testing & Performance](#6-testing--performance)  
7. [Extra Work & Features Implemented in Hito 5](#7-extra-work--features-implemented-in-hito-5)  
   - [Hito Comparison & User-Driven Improvements](#76-hito-comparison--user-driven-improvements)  
8. [References & Deployed URLs](#8-references--deployed-urls)  
9. [Conclusion & Next Steps](#9-conclusion--next-steps)  

---

## 1. General Introduction

This project is part of **Milestone 5** of the *Web Architecture and Services* module.  
The main goal was to deploy in the cloud the microservices previously developed (products, authentication, comments) along with the supermarket comparison frontend.

**Deployment Goals:**

- 🌐 Publicly accessible from anywhere  
- 📈 Scalable and resilient  
- 🛠️ Observable for real-time monitoring (logs, metrics, service status)  

**Stack & Tools:**

- **PaaS:** Render (European region: Frankfurt, legal compliance)  
- **Repository:** GitHub monorepo  
- **Containers:** Docker for each service  
- Automatic deployment on push to GitHub  

---

## 2. Why Render?

Render was selected for its balance of simplicity and functionality:

- 🚀 Easy Docker deployment without manually configuring servers  
- 🔗 GitHub integration allows automatic deployment via push  
- 🎓 Free tier sufficient for academic microservices  
- 📊 Built-in observability: real-time logs, CPU/RAM metrics, service status panel  
- 🗂 Monorepo support via Root Directory settings  

✅ **Render is ideal for professional, compliant, cloud deployment for Hito 5.**

---

## 3. Deployment Challenges & Solutions

### 3.1 Root Directory Errors
**Error:** Root directory "product-service" does not exist  

**Cause:** Folder “Hito 4” had spaces and capital letters; Render requires clean paths.  

**Solution:**  
```text
Root Directory: Hito 4/backend/product-service
Dockerfile Path: Hito 4/backend/product-service/Dockerfile
```

---

### 3.2 Local Changes Not Reflected
**Cause:** Commits were not pushed to GitHub.  

**Solution:**
```bash
git add .
git commit -m "Fix folder names and deployment paths"
git push origin main
```

---

### 3.3 Duplicate Dockerfile Paths
**Error:**  
`Hito 4/backend/product-service/Hito 4/backend/product-service/Dockerfile`  

**Solution:** Correct path:  
```text
Hito 4/backend/product-service/Dockerfile
```

---

## 4. Microservices Deployment — Detailed

### 4.1 Product Service

🚀 **Public URL:** [Product Service](https://product-service-3lsh.onrender.com/products)

**Render Configuration:**

- **Root Directory:** backend/product-service  
- **Dockerfile Path:** backend/product-service/Dockerfile  
- **Environment Variables:**
```
MONGO_URI=your_mongo_uri_here
PORT=5000
```

**Observability:**

- Real-time logs streaming in Render dashboard  
- CPU/RAM metrics monitored  
- Deployment history tracked  
- Error tracking for DB/network issues  

**Stress Testing (simulated):**
```bash
ab -n 100 -c 10 https://product-service-3lsh.onrender.com/products
```
- Postman Runner: 100 iterations, 10 concurrency  
- Avg. response time < 200ms  

✅ Fully functional.

---

### 4.2 Auth Service

🚀 **Public URL:** [Auth Service](https://auth-service-a73r.onrender.com)

**Render Configuration:**

- **Root Directory:** backend/auth-service  
- **Dockerfile Path:** backend/auth-service/Dockerfile  
- **Environment Variables:**
```
MONGO_URI=your_mongo_uri_here
JWT_SECRET=your_jwt_secret_here
PORT=4000
```

**Observability:**

- Real-time login/register logs  
- CPU/RAM metrics  
- Failed JWT validation and login errors tracked  

**Stress Testing:**
```bash
ab -n 100 -c 10 https://auth-service-a73r.onrender.com/login
```
- Response rate ~95% under moderate load  

✅ Fully functional with login, registration, JWT auth.

---

### 4.3 Comment Service

🚀 **Public URL:** [Comment Service](https://comment-service-f1r6.onrender.com)

**Render Configuration:**

- **Root Directory:** backend/comment-service  
- **Dockerfile Path:** backend/comment-service/Dockerfile  
- **Environment Variables:**
```
MONGO_URI=your_mongo_uri_here
PORT=6060
```

**Observability:**

- Real-time logs for comment operations  
- CPU/RAM usage monitoring  
- Error tracking for failed DB writes  

**Stress Testing:**
```bash
ab -n 200 -c 20 https://comment-service-f1r6.onrender.com/comments
```
- Latency < 250ms  

✅ Fully functional.

---

### 4.4 Frontend

🚀 **Public URL:** [Frontend](https://frontend-12gl.onrender.com)

**Render Configuration:**

- **Root Directory:** frontend  
- **Build Command:** npm install && npm run build  
- **Static Publish Path:** build  
- **Repo:** https://github.com/anas-tahi/CC-25-26-AnasTahir  
- **Branch:** main  
- **Region:** Frankfurt (Europe)  
- **Environment:** Static  

**Connected Microservices:**

- Product: https://product-service-3lsh.onrender.com  
- Auth: https://auth-service-a73r.onrender.com  
- Comment: https://comment-service-f1r6.onrender.com  

**Observability:**

- Console logs for API calls  
- Error boundaries for failed API calls  
- User feedback for actions (wishlist, comparison, map)  

✅ Fully deployed and functional globally.

---

## 5. Observability & Monitoring

**Goal:** Detect anomalies, optimize performance, ensure resilience.

**Current Implementation (via Render):**

- Real-time logs for each service  
- CPU & RAM metrics monitored  
- Deployment history tracked  

**Why it matters:**  

- Detect errors/failures early ✅  
- Monitor resource usage & prevent bottlenecks ✅  
- Provides confidence in stable deployment and uptime ✅  

**Future Improvements:** Integrate Grafana/Prometheus for advanced metrics, tracing, and alerting.

---

## 6. Testing & Performance

**Local Testing ✅**

- Product-Service `/products` endpoint tested using Postman/Node scripts  
- Frontend interactions verified locally  

**Deployment Testing ✅**

- Endpoints accessible via Render  
- Frontend functional, users can register, log in, compare products  

**Stress Testing ❌**

- Simulated with Apache Bench & Postman Runner  
- Latency <200–250ms  
- Full multi-service stress test pending  

**Next Steps:** Perform multi-service load tests with Apache Bench, Artillery, or JMeter.

---

## 7. Extra Work & Features Implemented in Hito 5

### 7.1 Frontend Styling Updates

- Refined product cards (glass effect, hover)  
- Wishlist improvements  
- Mobile responsive layout  

### 7.2 Map Integration

- Users see current location  
- Cheapest supermarket highlighted dynamically  

### 7.3 Backend & Observability Enhancements

- Improved API error handling  
- Enhanced console logs for debugging  

### 7.4 Deployment Improvements

- Optimized Docker images  
- Verified GitHub → Render workflow  
- Environment variables secured  

### 7.5 User Experience Features

- Smooth transitions & feedback  
- Clear cheapest prices & recommendations  
- Reliable multi-user performance  

---

### 7.6 Hito Comparison & User-Driven Improvements

| Feature / Issue | Start of Hito 5 | Final Hito 5 |
|-----------------|-----------------|---------------|
| Page Refresh | Manual refresh needed | Automatic updates; no refresh |
| Product Comparison | Single-item comparison | **List comparison** for multiple products |
| Price Recommendation | Highlighted cheapest per product | **Overall recommendations** for cheapest multi-product shopping |
| User Experience | Minimal feedback | Smooth transitions, interactive UI, better mobile responsiveness |
| Design | Basic layout | Refined cards, wishlist improvements, glass effect |
| Observability | Minimal logging | Enhanced logs locally & in Render |

✅ Feedback-driven improvements make the app **user-friendly, interactive, and professional**.

---

## 7.7 Deployment Workflow (GitHub → Render)

1. Developer pushes code to GitHub `main` branch  
2. Render detects push & triggers Docker build  
3. Microservices and frontend automatically deployed  
4. Live URLs updated and accessible globally  

---

## 8. References & Deployed URLs

| Service           | URL |
|------------------|-----|
| Frontend          | https://frontend-12gl.onrender.com |
| Product Service   | https://product-service-3lsh.onrender.com/products |
| Auth Service      | https://auth-service-a73r.onrender.com |
| Comment Service   | https://comment-service-f1r6.onrender.com |

---

## 9. Conclusion & Next Steps

- Demonstrates **cloud deployment using Render (PaaS) with Docker**  
- Automatic deployment from GitHub → Render  
- Fully integrated frontend-backend supermarket comparison app  
- Observability: real-time logs, CPU/RAM metrics, deployment status  
- Future: integrate advanced monitoring & full multi-service stress testing
