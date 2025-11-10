settings :
Add email confirmation for sensitive actions

Profile:

🖼️ Profile picture fallback + upload

👋 Personalized welcome message with animation and beautiful style in middle of page 

🕒 Member since date section

🚪 “Logout” button

frontend :
fix the comment section
fix the map ( for example user got mercadna is nthe nearest to buy cheaoest priduct , so it should search auto in the map "mercadona near me"....)
profile still need some work
language and themes 
login and register style 
admin section

backend :
add products
admin section


----------------------------------------------------------------------------------------------------

🛠️ Backend Logging Setup — Hito 3 Progress
✅ Overview
Today we implemented a centralized logging system across all backend microservices using Winston, a powerful and flexible logging library for Node.js.. This setup improves observability, helps with debugging, and prepares the backend for production-level monitoring.

📦 Microservices Updated
product-service

auth-service

comment-service

Each service now includes:

A reusable logger.js file

A logs/ folder with persistent log storage

Winston integration in server.js to log:

Server startup

MongoDB connection status

Incoming HTTP requests

Errors and exceptions

📁 File Structure Added
Code
product-service/
├── logger.js
├── logs/
│   └── api.log

auth-service/
├── logger.js
├── logs/
│   └── api.log

comment-service/
├── logger.js
├── logs/
│   └── api.log
🧠 Winston Features Used
Console and file logging

Timestamped log format

Log levels: info, error

Middleware to log every incoming request

🧪 How to Test
Run any service:

bash
node server.js
Trigger a route (e.g. via frontend or Postman):

GET /products

POST /wishlist

GET /comments

Check logs:

Terminal output shows timestamped logs

File logs saved in logs/api.log


===========================================================================================================================================================================================================================================================================================================================

🧩 Auth Service

Purpose:
Manages user registration, login, authentication, and profile updates.

Main Routes:

Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Authenticate user and return a JWT
GET	/auth/me	Retrieve logged-in user profile (requires token)
PUT	/auth/update	Update name or email
PUT	/auth/change-password	Update password
DELETE	/auth/delete	Delete user account

Model:
User → { name, email, password }
(password is hashed using bcryptjs)

Middleware:
auth.js → verifies JWT token and attaches user to request.

Logging:
Uses Winston (logger.js) to log requests and errors to logs/api.log.

---------------------------------------------------------------------------------------------------------

🧩 Product Service – API Documentation

The Product Service is responsible for managing product data, providing comparison features, and allowing users to maintain a personalized wishlist. It exposes a RESTful API that communicates with MongoDB and integrates with the authentication microservice for secure access.

🧭 Main Routes
/products

GET / → Returns all available products from the database.

GET /names → Returns all unique product names for autocomplete.

GET /names/:prefix → Returns all product names starting with the given prefix.

GET /compare/:name → Compares products by name (accent-insensitive), returning all matches and highlighting the cheapest option.

🔐 Protected route → Requires JWT token.

/wishlist

POST / → Adds a product to the authenticated user’s wishlist.

GET / → Retrieves the current user’s wishlist (with product details populated).

DELETE /:productId → Removes a product from the user’s wishlist.

🔐 All wishlist routes are protected and require authentication.

🧩 Models

Product

{
  name: String,        // Product name
  supermarket: String, // Source supermarket name
  price: Number        // Product price
}


Wishlist

{
  userId: ObjectId (User),
  productId: ObjectId (Product)
}


Each product is linked to a specific supermarket and can be referenced in a user’s wishlist via userId.

⚙️ Services

compareAllProducts.js
Implements logic to:

Normalize product names (removing accents, ensuring consistent comparison).

Group products by normalized name.

Identify and return the cheapest option per product name across all supermarkets.

This service improves API efficiency by abstracting core business logic outside route handlers.

🛡️ Middleware

auth.js
Validates JWT tokens received from the Auth Service.
Ensures only authenticated users can perform protected actions (e.g., wishlist, product comparison).

🪵 Logging

logger.js
Implements Winston-based structured logging for both console and file outputs:

Logs API activity, errors, and authentication checks.

Saved to logs/api.log for persistence.

🔹 Example Usage
GET /products/compare/leche
Authorization: Bearer <JWT_TOKEN>
→ Returns all "leche" products across supermarkets with the cheapest option.

---------------------------------------------------------------------------------------------------------

🗨️ Comment Service

This microservice handles the creation and management of user comments. It provides a simple REST API to submit and store comments, maintaining separation from the authentication and product domains.

🔹 API Routes
Method	Endpoint	Description
POST	/comments	Creates a new comment with name and message fields.
Example Request
POST /comments
{
  "name": "John Doe",
  "message": "Great app! Love the design."
}

Example Response
{
  "message": "Comment saved successfully."
}

🔹 Model Structure

File: models/Comment.js

{
  name: String,        // Name of the user posting the comment
  message: String,     // Comment content
  createdAt: Date      // Automatically added timestamp
}


Each comment is stored in MongoDB using this schema, ensuring data consistency and traceability.

🔹 Logging

File: logger.js
This service uses Winston to log all API events.
Logs are written both to the console and to a file at logs/api.log.

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/api.log' })
  ]
});

🔹 Architecture Role

The Comment Service is an independent microservice responsible for user feedback.
It interacts with the frontend directly via REST, while remaining fully isolated from the Auth and Product Services.
This ensures loose coupling and easier maintenance — changes here don’t affect user or product data.

===================================================================================================================================================================================================================================================================================

Backend Microservices Documentation

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