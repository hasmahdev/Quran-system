Agent Instructions for Backend Migration
This document outlines the steps to migrate the existing Next.js application to a new architecture featuring a Go backend.
1. Project Restructuring
The first step is to organize the codebase into frontend and backend directories.
Create a new directory namedfrontend.Move all existing files and directories (includingsrc,public,package.json,.next, etc.) into thefrontenddirectory.Create a new directory namedbackend.
The final structure should look like this:
/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ... (all other Next.js files)
└── backend/

2. Backend Scaffolding (Go & Fiber)
Next, set up the foundation for the Go backend within the backend directory.
Navigate into thebackenddirectory.Create amain.gofile.Initialize a Go module:go mod init <module_name>(e.g.,go mod init backend).Add the Fiber dependency:go get github.com/gofiber/fiber/v2.Inmain.go, set up a basic Fiber application that starts a server.Define placeholder environment variables for the database connection string and a JWT secret. The application should be configured to read these from the environment.
3. Backend API Implementation
Implement the API endpoints required by the frontend. The backend will connect directly to the Supabase database.
Authentication
Create aPOST /loginendpoint.This endpoint will receive ausernameandpasswordin the request body.It should connect to the Supabase database, query theuserstable for the given username, and usebcryptto compare the provided password with the stored hash.On successful authentication, it should generate and return a JWT (JSON Web Token). The JWT payload should contain the user's ID and role, similar to the existingnext-authimplementation.
Data Endpoints
Create RESTful API endpoints to replace the functions currently in frontend/src/lib/api.ts. All endpoints that modify data should be protected and require a valid JWT.
User Management:
GET /users?role=:rolePOST /usersPUT /users/:userIdDELETE /users/:userId
Class Management:
GET /classesGET /teachers/:teacherId/classesPOST /classesPUT /classes/:classIdDELETE /classes/:classId
Class Member Management:
GET /classes/:classId/studentsPOST /classes/:classId/studentsDELETE /classes/:classId/students/:studentId
Progress Management:
GET /classes/:classId/progressPUT /progress/:progressId
4. Frontend Adaptation
Modify the frontend application to communicate with the new Go backend.
Authentication:
Removenext-authas a dependency.Updatefrontend/src/pages/login.tsxto send a request to the new backend's/loginendpoint (https://qu.ghars.site/login).Upon successful login, store the received JWT in a secure manner (e.g., an HttpOnly cookie or local storage).Create a React context or similar state management solution to hold the user's session information (decoded from the JWT).
API Calls:
Update all the functions infrontend/src/lib/api.tsto make requests to the new Go backend endpoints (e.g.,https://qu.ghars.site/users).For protected endpoints, ensure that the stored JWT is included in theAuthorizationheader of each request (e.g.,Authorization: Bearer <token>).The frontend URL will bequran.ghars.site.
5. Verification
Before submitting the final changes, perform the following checks:
Frontend Build:Ensure the Next.js application builds successfully by runningnpm run buildfrom within thefrontenddirectory.Backend Server:Ensure the Go backend server can be started without errors by runninggo run main.gofrom within thebackenddirectory.

6. Docker Deployment
The backend can be deployed using Docker.

Build the Docker image:
docker build -t go-backend ./backend

Run the Docker container:
docker run -p 3001:3001 --env-file .env go-backend