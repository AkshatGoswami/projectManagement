# Project Management System

Project Management System Backend is a RESTful backend API for a collaborative project management system. It supports user authentication, project management, team member roles, task and subtask handling, notes, and health checks.

## Overview

This API enables teams to:
- create and manage projects
- invite members and assign roles
- create tasks and subtasks
- assign tasks to team members
- track task status
- add notes to projects
- manage authentication and authorization securely

## Features

### Authentication & Authorization
- User registration
- User login
- JWT-based authentication
- Password change, forgot password, and reset password flow
- Email verification support
- Role-based access control with:
  - admin
  - project_admin
  - member

### Project Management
- Create, view, update, and delete projects
- List projects accessible to the current user
- Manage project members

### Task Management
- Create, list, view, update, and delete tasks
- Assign tasks to users
- Track task status
- Attach files to tasks

### Subtask Management
- Create, update, and delete subtasks
- Mark subtasks as complete

### Notes
- Create, view, update, and delete project notes

### Health Check
- Basic API health monitoring endpoint

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation
- Multer for file uploads
- Nodemailer for email-related flows
- CORS and cookie-parser for web security

## Project Structure

```bash
src/
  controllers/
  db/
  middlewares/
  models/
  routes/
  utils/
  validators/

## Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file and configure the required environment variables

## Running the Project

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```
## API Routes

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/current-user
- POST /api/v1/auth/change-password
- POST /api/v1/auth/refresh-token
- GET /api/v1/auth/verify-email/:verificationToken
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password/:resetToken

### Projects
- GET /api/v1/projects
- POST /api/v1/projects
- GET /api/v1/projects/:projectId
- PUT /api/v1/projects/:projectId
- DELETE /api/v1/projects/:projectId
- GET /api/v1/projects/:projectId/members
- POST /api/v1/projects/:projectId/members

### Tasks
- GET /api/v1/projects/:projectId/tasks
- POST /api/v1/projects/:projectId/tasks
- GET /api/v1/projects/:projectId/tasks/:taskId
- PUT /api/v1/projects/:projectId/tasks/:taskId
- DELETE /api/v1/projects/:projectId/tasks/:taskId
- POST /api/v1/projects/:projectId/tasks/:taskId/subtasks

### Health Check
- GET /api/v1/healthcheck

## Notes

This project is a backend-only API and is intended to be consumed by a frontend client or API testing tool such as Postman or Thunder Client.

## License

ISC
