# Event Management System — production-style structure

This version keeps MySQL, removes Sequelize and email notifications, and reorganizes the project into a clean production-style architecture:

- `src/config` — centralized configuration and Swagger
- `src/db` — MySQL pools and database initialization
- `src/repositories` — only SQL and persistence logic
- `src/services` — business rules
- `src/controllers` — HTTP layer
- `src/routes` — route composition for web and API
- `src/middleware` — auth, logging, error handling
- `src/jobs` — scheduler jobs
- `src/sockets` — socket.io chat gateway
- `src/lib` — shared helpers like logger and AppError
- `src/validators` — payload validation
- `src/views` / `src/public` — UI

## One-command start

1. Copy `.env.example` to `.env`
2. Fill in MySQL credentials
3. Run:

```bash
npm run start:one
```

This command installs dependencies and starts the server. On boot the application:
- creates the database if needed
- creates tables if needed
- seeds default categories and locations
- creates the admin user if missing
- starts the HTTP server
- starts socket.io chat
- starts the scheduler

## Default admin

- Email: `admin@example.com`
- Password: `Admin123!`

## Main URLs

- `http://localhost:3000`
- `http://localhost:3000/health`
- `http://localhost:3000/api-docs`

## Notes

- MySQL server must already be installed and running
- The configured MySQL user must be allowed to create databases and tables
- Sessions are stored in memory for simplicity; for a real production deployment, move sessions to Redis or MySQL-backed storage
