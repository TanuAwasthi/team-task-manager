# Team Task Manager - Full Stack MERN Application

A full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) that helps teams manage projects, assign tasks, and track progress efficiently with role-based access control

##  Features

- User Authentication: Signup/Login with JWT tokens
- Project Management: Create, update, and manage projects
- Task Management: Create tasks, assign to team members, track status
- Team Collaboration: Add/remove team members, assign roles (Admin/Member)
- Dashboard: View all projects and tasks with status overview
- Task Tracking: Track task status (Todo, In Progress, Completed)
- Overdue Detection: Automatically detect and highlight overdue tasks
- Statistics: View project statistics (total, completed, in progress, overdue tasks)
- Role-Based Access: Different access levels for Admin and Member roles

##  Tech Stack

### Backend (Server)
- Node.js & Express.js - REST API server
- MongoDB- NoSQL database
- JWT - Authentication tokens
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing

### Frontend (Client)
- React 18 - UI library
- React Router v6- Client-side routing
- Axios - HTTP client
- Context API - State management

## Project Structure

```
TeamTaskManager/
│── client/        # React frontend
│── server/        # Node.js backend
│── README.md

```

### Installation

1. Clone and Setup Backend

2. Setup Frontend

3. Running Locally
   Terminal 1 - Start Backend Server
   Terminal 2 - Start React App


## API Endpoints

### Authentication
- POST /api/auth/signup - User signup
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user (requires auth)

### Projects
- GET /api/projects - Get all user projects
- POST /api/projects - Create new project
- GET /api/projects/:projectId - Get project details
- PUT /api/projects/:projectId - Update project
- DELETE /api/projects/:projectId - Delete project
- POST /api/projects/:projectId/members - Add team member
- DELETE /api/projects/:projectId/members/:userId - Remove team member

### Tasks
- GET /api/tasks/:projectId/tasks - Get project tasks
- POST /api/tasks/:projectId/tasks - Create task
- PUT /api/tasks/tasks/:taskId - Update task
- DELETE /api/tasks/tasks/:taskId - Delete task
- GET /api/tasks/:projectId/tasks/stats - Get task statistics


## Usage Guide

### Admin
1. Sign up to become an admin
2. Create a new project
3. Add/Remove team members to the project
4. Create and assign tasks

### As Team Member
1. Sign up
2. Wait for admin to add you to a project
3. View assigned tasks in the project
4. Update task status
5. Track project progress

## Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected API routes

## Data Models

### User
- firstName, lastName, email, password, role (admin/member)

### Project
- name, description, owner, members

### Task
- title, description, project, createdBy, status, priority, dueDate, isOverdue

##  Support

If you found this project useful, consider giving it a ⭐ on GitHub!
