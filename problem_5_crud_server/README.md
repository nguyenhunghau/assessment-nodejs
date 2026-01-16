# Employee & Task Management API

A comprehensive backend server built with ExpressJS and TypeScript that provides a complete management system for employees and tasks with JWT authentication. This API enables user registration, employee profile management, and task assignment tracking with secure authentication and authorization.

## Features

### 🔐 Authentication & Authorization
- ✅ **User Registration** - Create new user accounts with email/password (employee role only)
- ✅ **User Login** - JWT-based authentication
- ✅ **Role Management** - Admin and employee roles (admin accounts created via database)
- ✅ **Protected Routes** - Secure endpoints with JWT middleware
- ✅ **Password Security** - Bcrypt password hashing

### 👥 Employee Management
- ✅ **Create Employee** - Add employee profiles linked to user accounts
- ✅ **List Employees** - View all employees in the company
- ✅ **Get Employee Details** - Fetch specific employee information
- ✅ **Update Employee** - Modify employee data (name, department, position)
- ✅ **Delete Employee** - Remove employee records

### 📋 Task Management
- ✅ **Create Task** - Create tasks with title, description, priority, and due dates
- ✅ **Assign Tasks** - Assign tasks to specific users
- ✅ **List Tasks** - View tasks assigned to current user
- ✅ **Update Task Status** - Track progress (todo, in_progress, done)
- ✅ **Task Ownership** - Users can only access their own tasks
- ✅ **Filter Tasks** - Filter by status with pagination support

### 🛠️ Advanced Features
- 📄 **Pagination Support** - Efficient data retrieval for large datasets
- 🛡️ **Input Validation** - Zod-based schema validation with detailed error messages
- 🗄️ **Database Persistence** - PostgreSQL with Knex.js ORM
- 🧪 **Comprehensive Testing** - 47+ unit and integration tests
- 📚 **OpenAPI Documentation** - Interactive Swagger UI documentation
- 🏗️ **Clean Architecture** - Controller → Service → Query layer separation

## Technology Stack

- **Backend Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Knex.js for database operations and migrations
- **Authentication**: JWT (jsonwebtoken) with bcrypt for password hashing
- **Validation**: Zod v3 for schema validation and type safety
- **Testing**: Jest with Supertest (47+ tests)
- **Documentation**: OpenAPI 3.0.3 with Swagger UI
- **Development**: Nodemon for hot reload
- **Architecture**: Controller → Service → Query layer pattern

## Project Structure

```
ResourceManagement/
├── src/
│   ├── app.ts                    # Application entry point
│   ├── controllers/              # Request/response handlers  
│   │   ├── authController.ts    # Authentication endpoints
│   │   ├── employeeController.ts # Employee CRUD
│   │   ├── taskController.ts    # Task CRUD with ownership
│   ├── db/
│   │   ├── database.ts          # Database connection
│   │   ├── knexFile.ts          # Knex configuration
│   │   ├── migrations/          # Database migrations
│   │   │   ├── 20260114_01_create_users_table.ts
│   │   │   ├── 20260114_02_create_employees_table.ts
│   │   │   └── 20260114_03_create_tasks_table.ts
│   │   │   └── 20260114_04_add_composite_indexes.ts
│   │   └── seeds/               # Seed data
│   │       └── 20260114_seed_company_data.ts
│   ├── middleware/
│   │   ├── validationMiddleware.ts # Zod validation middleware
│   │   └── errorHandler.ts      # Error handling middleware
│   ├── validators/              # Zod validation schemas
│   │   ├── authValidators.ts    # Auth validation rules
│   │   ├── employeeValidators.ts # Employee validation rules
│   │   └── taskValidators.ts    # Task validation rules
│   │   └── errorHandler.ts      # Error handling middleware
│   ├── queries/                 # Database operations layer
│   │   ├── userQueries.ts       # User DB operations  
│   │   ├── employeeQueries.ts   # Employee DB operations  
│   │   ├── taskQueries.ts       # Task DB operations  
│   ├── routes/
│   │   ├── index.ts             # Main router  
│   │   ├── authRoutes.ts        # Auth endpoints  
│   │   ├── employeeRoutes.ts    # Employee endpoints  
│   │   ├── taskRoutes.ts        # Task endpoints 
│   ├── service/                 # Business logic layer
│   │   ├── authService.ts       # Auth logic  
│   │   ├── employeeService.ts   # Employee logic  
│   │   ├── taskService.ts       # Task logic
│   ├── tests/                   # Comprehensive test suite
│   │   ├── authRoutes.test.ts   # Auth endpoint tests  
│   │   ├── authService.test.ts  # Auth service tests  
│   │   ├── employeeRoutes.test.ts # Employee tests  
│   │   ├── employeeService.test.ts # Employee service tests  
│   │   ├── taskRoutes.test.ts   # Task endpoint tests  
│   │   ├── taskService.test.ts  # Task service tests  
│   │   └── testUtils.ts
│   ├── types/
│   │   ├── index.ts             # TypeScript interfaces (expanded)
│   │   └── express.d.ts         # Express Request extensions  
│   └── util/
│       └── CustomError.ts       # Custom error handling
├── .env.local                   # Local environment variables
├── .env.docker                  # Docker environment variables
├── openapi.yml                  # OpenAPI 3.0.3 specification (updated)
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
├── docker-compose.yml          # Docker configuration
├── Dockerfile                  # Docker image definition
├── README.md                   # This file
```

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user account |
| POST | `/auth/login` | Login and receive JWT token |

### Employee Management (Protected)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/employees` | List all employees | ✅ | ❌ |
| POST | `/employees` | Create new employee | ✅ | ✅ |
| GET | `/employees/:id` | Get employee by ID | ✅ | ❌ |
| PUT | `/employees/:id` | Update employee | ✅ | ❌ |
| DELETE | `/employees/:id` | Delete employee | ✅ | ❌ |

### Task Management (Protected)
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/tasks` | List user's tasks (with filters) | ✅ | ❌ |
| POST | `/tasks` | Create new task | ✅ | ❌ |
| GET | `/tasks/:id` | Get task by ID | ✅ | ❌ |
| PUT | `/tasks/:id` | Update task | ✅ | ❌ |
| DELETE | `/tasks/:id` | Delete task | ✅ | ❌ |

> **Note:** All employee and task endpoints require JWT authentication via `Authorization: Bearer <token>` header.
> 
> **Admin Permissions:** Only users with `admin` role can create new employees. Other operations are accessible to all authenticated users.

## API Documentation

### Interactive Documentation
The API comes with comprehensive OpenAPI 3.0.3 documentation accessible via Swagger UI:

- **Swagger UI**: `http://localhost:8080/api-docs`
- **OpenAPI Spec**: Available at `/openapi.yml`
- **API Info**: `http://localhost:8080/` (shows basic API information)

### Documentation Features
- 📚 **Complete API Reference** - All endpoints, parameters, and responses documented
- � **Authentication Support** - Test protected endpoints with JWT tokens
- 🔧 **Interactive Testing** - Test API endpoints directly from the browser
- 📝 **Request/Response Examples** - Real examples for all operations
- 🏷️ **Schema Definitions** - Detailed data models and validation rules
- 🎯 **Error Handling** - Comprehensive error response documentation

### Using the Documentation
1. Start the application (locally or via Docker)
2. Open your browser to `http://localhost:8080/api-docs`
3. Register/Login to get a JWT token
4. Click "Authorize" button and enter your token as `Bearer <token>`
5. Test protected endpoints directly from the Swagger interface

## Quick Start Examples

### 1. Register a New User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@company.com",
      "role": "employee"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> **Note:** All registered users are automatically assigned the 'employee' role. Admin accounts must be created through database seeding or manual insertion.

### 2. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@company.com",
    "password": "EmployeePassword123"
  }'
```

### 3. Create an Employee Profile
```bash
curl -X POST http://localhost:8080/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "department": "Engineering",
    "position": "Software Engineer"
  }'
```

### 4. Create a Task
```bash
curl -X POST http://localhost:8080/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete onboarding",
    "description": "Read company handbook and setup accounts",
    "status": "todo",
    "priority": "high",
    "due_date": "2026-01-21"
  }'
```

### 5. List Your Tasks
```bash
curl -X GET "http://localhost:8080/tasks?status=todo&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Task Status
```bash
curl -X PUT http://localhost:8080/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```
5. View request/response schemas and examples

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

#### Option 1: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ResourceManagement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   Make sure you have PostgreSQL installed and running locally. Create a database 'resource'

4. **Configure environment variables**
   
   **Option A: Use setup script (Recommended)**
   ```bash
   # For Linux/Mac
   ./setup-env.sh local
   
   # For Windows
   setup-env.bat local
   ```

   **Option B: Manual setup**
   ```bash
   cp .env.local .env
   ```
   
   This will configure:
   - `DB_HOST=localhost`
   - `DB_USER=resource`
   - `DB_PASSWORD=resource`
   - `DB_NAME=resource`
   - `DB_PORT=5432`
   - `PORT=8080`

5. **Run database migrations and seed data**
   ```bash
   npm run migrate:local
   ```

6. **Start the development server**
   ```bash
   # Start with default log level (INFO)
   npm run dev

   # Or with specific log level
   LOG_LEVEL=DEBUG npm run dev    # Show all logs
   LOG_LEVEL=WARN npm run dev     # Show only warnings and errors
   LOG_LEVEL=ERROR npm run dev    # Show only errors
   ```

The server will start on `http://localhost:8080`

---

#### Option 2: Docker Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ResourceManagement
   ```

2. **Verify Docker environment file**
   
   The `.env.docker` file should already exist with proper configuration:
   - `DB_HOST=postgres` (Docker service name)
   - `DB_USER=resource`
   - `DB_PASSWORD=resource`
   - `DB_NAME=resource`
   - `DB_PORT=5432`
   - `PORT=8080`

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   
   This will:
   - Start PostgreSQL database container
   - Build and start the application container
   - Run migrations and seed data automatically
   - Expose the API on port 8080

4. **Access the application**
   
   The server will be available at `http://localhost:8080`

5. **Useful Docker commands**
   ```bash
   # Stop containers
   docker-compose down
   
   # View logs
   docker-compose logs -f app
   
   # Rebuild and restart
   docker-compose up --build
   
   # Clean up everything (including database)
   docker-compose down -v
   ```

## Logging

The application includes comprehensive logging across all layers (controllers, services, middleware). 

**Quick Start:**
- Default log level: `INFO` (shows successful operations and errors)
- Enable debug logs: `LOG_LEVEL=DEBUG npm run dev`
- Production mode: `LOG_LEVEL=WARN npm start`

**Log Levels:**
- `DEBUG`: Detailed flow tracing (request details, filters, etc.)
- `INFO`: Successful operations (user registered, task created, etc.)
- `WARN`: Validation failures, authentication issues
- `ERROR`: Exceptions and operation failures

**Example logs:**
```
[2026-01-14T10:03:19.064Z] [INFO] Task created successfully {"taskId":1,"title":"Complete onboarding"}
[2026-01-14T10:03:19.084Z] [WARN] Task creation failed: Title is required
[2026-01-14T10:03:19.232Z] [ERROR] Failed to create task {"message":"DB error","stack":"..."}
```

📚 **Full documentation:** See [LOGGING.md](LOGGING.md) for complete logging guide, best practices, and implementation details.

### Using Docker

1. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

This will start both the PostgreSQL database and the application.

## API Usage Examples

### Create a Resource

```bash
curl -X POST http://localhost:8080/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Server",
    "description": "Main application server",
    "type": "server",
    "status": "active",
    "metadata": {
      "cpu": "4 cores",
      "memory": "8GB",
      "os": "Ubuntu 20.04"
    }
  }'
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm start           # Start production server

# Database
npm run migrate     # Run database migrations
npm run seed        # Seed database with sample data
npm run migrate:rollback  # Rollback last migration
npm run db:reset    # Reset database (rollback, migrate, seed)

# Testing
npm test           # Run all tests

# Build
npm run build      # Compile TypeScript to JavaScript
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

TheValidation

The API uses **Zod v3** for comprehensive request validation with detailed error messages.

### Validation Flow
All requests pass through validation middleware before reaching controllers:

```
Request → Authentication → Validation → Controller → Response
```

### Validation Features
- ✅ **Required Field Validation** - Ensures all required fields are present
- ✅ **Type Validation** - Numbers, strings, enums, dates
- ✅ **Format Validation** - Email format, date format (YYYY-MM-DD)
- ✅ **Range Validation** - Min/max length, positive numbers
- ✅ **Enum Validation** - Status (todo, in_progress, done), Priority (low, medium, high)
- ✅ **Custom Rules** - At least one field required for updates
- ✅ **Auto Type Transformation** - String IDs converted to numbers

### Validation Error Response
When validation fails, the API returns structured error messages:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "first_name",
      "message": "First name cannot be empty"
    }
  ]
}
```

### Validation Examples

**Employee Creation:**
```json
{
  "user_id": 1,              // Required: positive integer
  "first_name": "John",      // Required: 1-100 chars
  "last_name": "Doe",        // Required: 1-100 chars
  "department": "Engineering", // Optional: max 100 chars
  "position": "Developer"    // Optional: max 100 chars
}
```

**Task Creation:**
```json
{
  "title": "Task title",     // Required: 1-255 chars
  "description": "Details",  // Optional: max 1000 chars
  "status": "todo",          // Optional: [todo, in_progress, done], default: todo
  "priority": "high",        // Optional: [low, medium, high], default: medium
  "due_date": "2026-01-20",  // Optional: YYYY-MM-DD format
  "assigned_to_user_id": 2   // Optional: positive integer
}
```

**Update Operations:**
- At least one field must be provided
- Only provided fields are validated and updated
- Strict mode prevents extra fields

📚 **Full documentation:** See [VALIDATION_README.md](VALIDATION_README.md) for complete validation guide, schemas, and implementation details.

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data, missing required fields, or validation errors
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions for the operatio
The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data or missing required fields
- **401 Not Found**: Unauthorized
- **403 Not Found**: Forbiden
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors
