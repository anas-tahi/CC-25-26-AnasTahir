# 🛒 CC-25-26 Backend — Hito 2

##  English Version

This is the backend for my CC-25-26 project. It includes two services: **product-service** for comparing product prices, and **auth-service** for user registration and login. All routes are fully tested and secured.

---

### 🚀 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Jest + Supertest for testing

---

### 📦 Services

#### 🔍 Product Service

| Route                          | Description                                      |
|--------------------------------|--------------------------------------------------|
| `GET /products/:name`          | Returns all entries for a product               |
| `GET /products/compare/:name`  | Returns cheapest + all matches                  |
| `GET /products/compare-all`    | Returns cheapest for every product              |

#### 🔐 Auth Service

| Route               | Description                          |
|---------------------|--------------------------------------|
| `POST /auth/register` | Registers a new user with hashed password |
| `POST /auth/login`    | Logs in and returns JWT token       |

---

### 🧪 Testing

- All routes tested with Jest and Supertest
- Models mocked for isolated logic testing
- Edge cases covered (missing fields, duplicates, invalid credentials)

---

### 🔐 Security

- Passwords hashed with bcryptjs
- JWT tokens 

---

### ⚙️ Setup

1. Clone the repo
2. Run `npm install` in both `product-service` and `auth-service`
3. Create `.env` files with:
   ```env
   MONGO_URI=your_mongodb_connection
   JWT_SECRET=your_jwt_secret


----------------------------------------------------------------------------------------------------

# 🛒 CC-25-26 Backend — Hito 2

##  Spanish Version

Este archivo README documenta el backend de mi proyecto CC-25-26. Incluye dos servicios: **product-service** para comparar precios de productos, y **auth-service** para el registro e inicio de sesión de usuarios. Todas las rutas están completamente probadas y aseguradas.

---

## 🚀 Tecnologías Utilizadas

- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para encriptar contraseñas
- Jest + Supertest para pruebas

---

## 📦 Servicios

### 🔍 Servicio de Productos

| Ruta                            | Descripción                                      |
|----------------------------------|--------------------------------------------------|
| `GET /products/:name`            | Devuelve todas las entradas de un producto       |
| `GET /products/compare/:name`    | Devuelve el más barato + todas las coincidencias |
| `GET /products/compare-all`      | Devuelve el más barato de cada producto          |

### 🔐 Servicio de Autenticación

| Ruta                 | Descripción                                |
|----------------------|--------------------------------------------|
| `POST /auth/register` | Registra un nuevo usuario con contraseña encriptada |
| `POST /auth/login`    | Inicia sesión y devuelve un token JWT      |

---

## 🧪 Pruebas

- Todas las rutas probadas con Jest y Supertest
- Modelos simulados para pruebas aisladas
- Casos límite cubiertos (campos faltantes, duplicados, credenciales inválidas)

---

## 🔐 Seguridad

- Contraseñas encriptadas con bcryptjs
- Tokens JWT 

---

## ⚙️ Configuración

1. Clona el repositorio
2. Ejecuta `npm install` en `product-service` y `auth-service`
3. Crea archivos `.env` con:
   ```env
   MONGO_URI=tu_conexión_mongodb
   JWT_SECRET=tu_clave_secreta
