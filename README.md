# MarketNest eCommerce Platform

MarketNest is a full-stack, multi-vendor eCommerce marketplace built with **Java (Spring Boot)** and **React (Vite + TypeScript)**. It features user authentication, vendor management, product cataloging, a shopping cart, payment integration via Razorpay, and comprehensive admin/seller dashboards.

## 🚀 Tech Stack

### Backend
*   **Java 17**
*   **Spring Boot 3.4**
*   **Spring Security & JWT** for robust authentication.
*   **Spring Data JPA & Hibernate** for ORM.
*   **PostgreSQL 16** as the primary relational database.
*   **Flyway** for automated database migrations.
*   **Razorpay** for payment processing.
*   **Swagger/OpenAPI** for API documentation.

### Frontend
*   **React 18** (Vite bundler)
*   **TypeScript**
*   **Tailwind CSS** & **shadcn/ui** for styling and components.
*   **Zustand** for lightweight global state management.
*   **React Query (TanStack)** for data fetching and caching.
*   **React Hook Form & Zod** for form validation.

## 🛠️ Local Development Setup

To run this application locally, you will need Java 17+, Node.js 20+, and PostgreSQL installed on your machine.

### 1. Database Setup
1.  Install PostgreSQL and ensure it's running.
2.  Create a database named `markethub_db`.
3.  Ensure your default Postgres credentials match the application properties (`postgres` / `your_db_password`), or update them in `marketplace-backend/src/main/resources/application.yml`. Flyway will automatically run all schema scripts on startup.

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd marketplace-backend
```

Run the Spring Boot application using Maven:
```bash
mvn spring-boot:run
```
The backend API will start on `http://localhost:8080`.
*   **API Documentation**: You can view the full interactive API spec at `http://localhost:8080/swagger-ui/index.html`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd marketplace-frontend
```

Install dependencies and start the development server:
```bash
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🐳 Docker Deployment

The application includes a completely automated Docker Compose configuration for easy testing and deployment.

### Prerequisites
*   Docker & Docker Desktop installed.

### Running with Docker Compose
From the root of the repository, simply run:
```bash
docker-compose up -d --build
```

This command will automatically:
1.  Spin up a PostgreSQL 16 container.
2.  Build the backend Spring Boot JAR and deploy it into an Alpine Linux container.
3.  Build the React frontend using Vite and host the static files on an NGINX container.

**Access Points:**
*   **Frontend UI**: `http://localhost:5173`
*   **Backend API**: `http://localhost:8080`
*   **Swagger API Docs**: `http://localhost:8080/swagger-ui/index.html`

To stop the containers, use:
```bash
docker-compose down
```

## ⚙️ Environment Variables

For local development, the configuration relies on default values in `application.yml` and hardcoded environments. For production deployments, you should override these via standard environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_PASSWORD` | Postgres database password | `your_db_password` |
| `JWT_SECRET` | Secure 256-bit key for signing tokens | (Must be generated securely and added to `.env`) |
| `RAZORPAY_KEY_ID` | Your Razorpay API Key | `mock_key_id` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Secret | `mock_key_secret` |
