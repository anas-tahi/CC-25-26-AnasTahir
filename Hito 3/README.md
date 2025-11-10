# Hito 3

# Fullstack Microservices Project 

This project implements a **microservices architecture** with separate backend services for authentication, products, and comments, and a React frontend. Each backend service is independently deployable, containerized, and logs its activity using Winston. The frontend communicates with these microservices via REST APIs.

---

## Project Structure

project-root/
│
├─ docker-compose.yml
├─ generate-compose.js
├─ README.md
├─ READMEEXTRA.md
│
├─ backend/
│ │
│ │─ README.md 
│ │
│ ├─ github/workflows
│ │ └─ CI.yml/ 
│ │
│ ├─ auth-service/
│ │ ├─ logs/
│ │ ├─ middleware/
│ │ ├─ models/
│ │ │── node_modules/
│ │ ├─ routes/
│ │ ├─ tests/
│ │ ├─ .env
│ │ ├─ Dockerfile
│ │ ├─ logger.js
│ │ ├─ package.json
│ │ ├─ package-lock.json
│ │ └─ server.js
│ │
│ ├─ product-service/
│ │ ├─ logs/
│ │ ├─ middleware/
│ │ ├─ models/
│ │ │── node_modules/
│ │ ├─ routes/
│ │ ├─ services/
│ │ ├─ tests/
│ │ ├─ utils/
│ │ ├─ .env
│ │ ├─ Dockerfile
│ │ ├─ logger.js
│ │ ├─ package.json
│ │ ├─ package-lock.json
│ │ ├─ seedProducts.js
│ │ └─ server.js
│ │
│ └─ comment-service/
│ │ ├─ logs/
│ │ ├─ models/
│ │ │── node_modules/
│ │ ├─ routes/
│ │ ├─ .env
│ │ ├─ Dockerfile
│ │ ├─ logger.js
│ │ ├─ package.json
│ │ ├─ package-lock.json
│ │ └─ server.js
│
├─ frontend/
│ ├─ node_modules/
│ ├─ public/
│ ├─ src/
│ ├─ .gitignore
│ ├─ Dockerfile
│ ├─ package.json
│ ├─ package-lock.json
│ └─ README.md


---

## Backend Microservices Overview

### Services and API Routes

| Service          | Port | Description                           | Example Routes                                               |
|----------------- |------|-------------------------------------  |--------------------------------------------------------------
| auth-service     | 4000 | Handles user authentication & profile | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/update`  |

| product-service  | 5000 | Manages products, wishlist,..         | `/products/`,`/products/compare/:name`, `/wishlist`          |
                                                                      
| comment-service  | 6000 | Manages product comments              | `/comments/`, `/comments/:id`                                |    

---

### Framework Justification (Express.js)

As you know, and as declared in my previous hitos, this project is built as a collection of React.js + Node.js + MongoDB technologies. To go deeper into backend development and meet the requirements of Hito 3, I used Express.js, which is a lightweight and flexible framework for Node.js.

Express.js makes it easier to build RESTful APIs, manage routes, and organize backend code in a clean and modular way. It provides all the tools needed to handle HTTP requests, connect with databases, and integrate middleware such as authentication, validation, and logging — all essential parts of a scalable microservices architecture.

🔹 How Express.js Works?

Express.js works by creating a server that listens for HTTP requests (like GET, POST, PUT, or DELETE) on specific routes (URLs).
Each route defines what the server should do when a request arrives — for example, return a list of products, create a user, or delete a comment.
Middleware functions are used in between these steps to handle things like authentication, error handling, or logging.
This makes Express ideal for building REST APIs, where the frontend communicates with the backend through structured endpoints.

🔹 So I used Express.js because:

It offers a simple and clean structure for creating REST API routes such as /auth/login, /products/, and /comments/.
It allows the use of middleware to handle errors, authentication, and logging efficiently.
It integrates perfectly with MongoDB (via Mongoose) and Winston for data handling and logging.
It fits naturally inside Docker containers and supports CI pipelines for automated testing and deployment.
It supports a modular folder organization, which matches the microservices design used in this project.

🔹 Example of using Express.js from the project

const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// REGISTER
 router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

### Logging

Centralized logging with **Winston** for all backend services:

- Logs HTTP requests, server start, database connection, and errors
- Stored in `logs/api.log` inside each service
- Example logs:

2025-11-07T04:09:16.796Z [INFO]: [GET] /auth/me
2025-11-07T04:10:27.555Z [INFO]: [GET] /products/compare/At%C3%BAn
2025-11-07T04:11:31.535Z [INFO]: [GET] /wishlist



2025-11-07T04:08:15.000Z [INFO]: 🚀 Auth service running on port 4000
2025-11-07T04:08:48.086Z [INFO]: ✅ Connected to MongoDB


---

### Tests

#### Overview

Testing in this project is powered by **Jest** and **Supertest**, chosen for their simplicity and strong integration with Node.js and Express.  
Each microservice has (or will have) its own independent testing setup, ensuring isolated validation of features and business logic.  

**Key testing principles used:**
- ✅ Separation of concerns — business logic tested independently of Express routes.  
- ✅ Integration tests simulate real API calls using Supertest.  
- ✅ Fast feedback — tests run locally or via CI to ensure stability before deployment.

---

🔹 Auth Service

- Frameworks used: Jest + Supertest  
- Test location: `/auth-service/tests/`
- Command to run tests:

  ```bash
  cd auth-service
  npm test

Coverage:

- User registration and login
- JWT authentication validation
- Protected routes (e.g., /auth/me, /auth/update)

🔹 Product Service

- Frameworks used: Jest + Supertest
- Test location: /product-service/tests/
- Command to run tests:

cd product-service
npm test

Coverage:

- Product retrieval and comparison endpoints (/products, /compare/:name)
- Wishlist CRUD operations
- Middleware authentication (JWT token validation)

🔹 Comment Service

- Status: 🕐 Testing not yet implemented.

Currently, npm test outputs a placeholder message:

      --> Error: no test specified

---

### Docker & CI

- Each service has its own Dockerfile.
- `docker-compose.yml` orchestrates backend + frontend.
- `generate-compose.js` helps dynamically generate Docker configs.
-  CI workflow in `.github/workflows/CI.yml`:
                                            - Builds all services
                                            - Runs tests automatically
                                            - Uses containerized environment for reproducibility

---

## Frontend Integration

- **React** application consuming backend microservices.
- Dockerized for deployment and live development.
- Port: **3000**
- Volume mounts `./frontend` for hot reload.

### Example Frontend Features and API Usage

| Feature                  | API Route Consumed                                        |
|--------------------------|---------------------------------------------------------- |
| User Login/Register      | POST `/auth/login`, POST `/auth/register`                 |
| User Profile             | GET `/auth/username`, PUT `/auth/update`                  |
| Product Listing          | GET `/products/`, GET `/products/names/productname`       |
| Product Comparison       | GET `/products/compare/:name`                             |
| Wishlist Management      | POST `/wishlist`, GET `/wishlist`, DELETE `/wishlist/:id` |
| Comments                 | GET `/comments/`, POST `/comments/`                       |
|--------------------------|-----------------------------------------------------------|       
                                     
---

## System Diagram

```Diagram :
                        +----------------+
                        |    Frontend    |
                        |   (React App)  |
                        +-------+--------+
                                |
                                | REST API calls
                                |
          ---------------------------------------------
          v                     v                     v

   +----------------+   +----------------+   +----------------+
   | auth-service   |   | product-service|   | comment-service|
   | (Port 4000)    |   | (Port 5000)    |   | (Port 6000)    |
   +----------------+   +----------------+   +----------------+
          |                     |                     |
          | MongoDB             | MongoDB             | MongoDB
          v                     v                     v
       authDB                productDB            commentDB


🧩 How It Works ?  Architecture Overview !

Each microservice in this project operates independently and communicates with others through REST APIs.
This design allows services to scale individually — for example, the Product Service can handle heavy traffic without affecting the Auth or Comment Services.
Updates or fixes in one microservice do not disrupt the others, ensuring flexibility, scalability, and maintainability across the entire system.


🧩 Running with Docker : Build and start all services .

     docker compose up --build

  --> Frontend: http://localhost:3000

  --> Auth Service: 4000

  --> Product Service: 5000

  --> Comment Service: 6000

🧩 Development Insights :

Hot Reload with Volumes:
    📝 Docker volumes link your local code with the container, so any file change updates the app instantly without rebuilding.

Centralized Logging:
    📝 Each service stores its Winston logs in a local logs/ directory. These logs include HTTP requests, errors, and startup messages, making debugging and monitoring easier.

REST-based Communication:
    📝 Microservices interact through REST APIs, ensuring they stay decoupled and can be developed or deployed independently.

Independent Scalability:
    📝 Each microservice can be scaled or restarted separately depending on demand — for example, if product searches increase, only the product-service needs more resources.

------------------------------------------------## Backend Microservices Documentation----------------------------------------------------

Below is the detailed documentation of each backend microservice that forms the system — describing their purpose, main API routes, data models, middleware, and logging setup. Each service runs independently but works together through RESTful communication to support the frontend and ensure modular scalability.

🧩 Auth Service 

-- Purpose: 
Manages user registration, login, authentication, and profile updates. 

-- Main Routes: 

Method    Endpoint                       Description 
POST     /auth/register                  Register a new user 
POST     /auth/login                     Authenticate user and return a JWT 
GET      /auth/me                        Retrieve logged-in user profile (requires token) 
PUT      /auth/update                    Update name or email 
PUT      /auth/change-password           Update password 
DELETE   /auth/delete                    Delete user account

-- Model: 
User → { name, email, password } (password is hashed using bcryptjs) 

-- Middleware: 
auth.js → verifies JWT token and attaches user to request. 

-- Logging: 
Uses Winston (logger.js) to log requests and errors to logs/api.log.  

🧩 Product Service 

-- Purpose: 
Responsible for managing product data, providing comparison features, and allowing users to maintain a personalized wishlist. Communicates with MongoDB and integrates with the Auth Service for secure access. 

-- Main Routes:  

/products

Method     Endpoint          Description 
GET       /                 Returns all available products 
GET       /names            Returns all unique product names (autocomplete)
GET       /names/:prefix    Returns product names starting with a prefix 
GET       /compare/:name    Compares products by name (accent-insensitive) and highlights cheapest o option 

/wishlist 

Method  Endpoint        Description 
POST    /               Add product to authenticated user’s wishlist 
GET     /               Retrieve user’s wishlist with product details 
DELETE  /:productId     Remove product from user’s wishlist 

-- Models: 

Product: 
{ "name": "String", "supermarket": "String", "price": "Number" } 

Wishlist: 
{ "userId": "ObjectId (User)", "productId": "ObjectId (Product)" } 

-- Services: 
CompareAllProducts.js– Normalizes names, groups products, and identifies the cheapest per product across supermarkets. Moves business logic out of routes. 

-- Middleware: 
auth.js – Validates JWT tokens to secure protected actions. 

-- Logging: 
logger.js – Winston-based logging for console and file outputs (logs/api.log). 

 
🧩 Comment Service 

-- Purpose: 

Handles creation and management of user comments. Provides a REST API to submit and store comments while remaining independent from Auth and Product Services. 

-- API Routes: 

Method   Endpoint     Description 
POST     /comments    Creates a new comment with name and message 

Example Request: 
{ "name": "ANAs TAHIR", "message": "Hi! Love the app." } 

-- Example Response: 
{ "message": "Comment saved successfully." } 

-- Model Structure: 
{ "name": "String", "message": "String", "createdAt": "Date" } 

-- Logging: 
logger.js – Winston logs all API events to console and file (logs/api.log). 

-- Architecture Role: 

Independent microservice responsible for user feedback. Interacts directly with frontend via REST while remaining isolated from Auth and Product Services for loose coupling and easier maintenance.

🧩🧩  Next Steps

The current setup already includes testing capabilities with Jest and Supertest for the auth-service and product-service, while the comment-service tests are planned for future updates.
Each service contains (or will contain) a dedicated tests/ folder for both unit and integration testing.
Tests can be run locally with npm test or automatically through the CI workflow.

🔹 Backend Improvements

- Add testing to Comment Service:
Implement Jest + Supertest tests to validate comment creation and MongoDB persistence.

- Expand coverage in Product Service:
Add more detailed comparison and wishlist tests (including edge cases).

- Mock database operations:
Use mongodb-memory-server for testing without a live database.

- Continuous Integration enhancement:
Extend GitHub Actions to include test coverage reports and lint checks.

- Product data sourcing:

Currently, product data is manually created for testing. The next step is to either:
Build a small scraper or API connector to fetch real product data from supermarkets, or maintain a manual product database that can be updated through the admin panel.

- Add admin functionality:
Implement an Admin Role with elevated permissions (e.g., editing products, approving comments, managing content).
This requires backend role-based access control (RBAC) and protected routes.

🔹 Frontend Enhancements

- Map functionality in Compare Page:
Fix and complete the map integration so that when a user compares a product,
results are displayed on an embedded map and generate a dynamic Google Maps link.

- Admin Dashboard UI:
Create a separate dashboard for admin users after login, giving them the ability to manage products, comments, and general content.

- Comment Section Implementation:
Finalize the comments feature — displaying user feedback, admin-approved comments, and real-time updates.

- Website Guide PDF:
Add a downloadable guide (PDF) explaining how to use the website, its main features, and admin tools.

- Navbar Improvements:
Fix and polish the language toggle and theme switcher to ensure full functionality and persistence across pages.

🧩🧩 Main Goal

The final objective of this project is to deploy the entire microservices system to the cloud, making all backend services and the frontend accessible online.
Each service will run in its own container (via Docker) and be hosted on a cloud platform such as Render, Railway, or AWS, ensuring scalability, reliability, and real-world cloud integration — the core purpose of this Cloud Computing project.