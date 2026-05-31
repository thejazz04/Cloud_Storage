# Cloud Storage Access Management System

This is a full-stack secure file-sharing platform designed for organizations. It replicates a Google Drive-like experience with role-based access control (RBAC), department isolation, resource ownership validation, temporary S3 pre-signed downloads, and complete audit tracking.

---

## 1. System Architecture & Connection Flow

The application consists of a decoupled React.js frontend, an Express.js backend API, a Supabase PostgreSQL database, and AWS S3 storage.

```
       +------------------+
       |   React Client   | (Port 5173)
       +--------+---------+
                |
                | (HTTP Requests & Bearer JWT)
                v
       +------------------+      (SQL Queries)      +--------------------+
       |  Express Server  +------------------------->| Supabase Postgres  |
       +--------+---------+                         +--------------------+
                |
                | (S3 SDK PutObject, Delete, Presign)
                v
       +------------------+
       |   AWS S3 Bucket  | (Private storage)
       +------------------+
```

1. **Authentication**: Users register/log in via the frontend. The backend yields a JWT containing user IDs, roles, and departments. The frontend stores this token in `localStorage` and embeds it in the `Authorization` header of subsequent Axios requests.
2. **Access Middleware**: Every request targeting files or directories routes through `authMiddleware` and `permissionMiddleware` to verify role hierarchy (e.g. Admins skip limits) and department matching.
3. **AWS S3 Flow**:
   - **Upload**: The frontend transmits files as multipart/form-data. The backend receives it in-memory via `multer`, sends it to the private AWS S3 bucket, saves the S3 key and user reference in Postgres, and records the upload log.
   - **Download**: To download a file, the client requests a temporary link. The backend determines if the client's department matches or if they have sharing permission, generates a signed S3 URL with a designated expiration (5-15 mins), and returns the URL. The client downloads the file directly from S3 using the temporary URL.

---

## 2. Infrastructure Prerequisites & Setup

### A. Database Configuration (Supabase PostgreSQL)
1. Register/Login to your [Supabase Console](https://supabase.com/).
2. Create a new project. Once initialized, navigate to **Project Settings > Database**.
3. Under **Connection string**, select **URI** (or Transaction connection parameters) and copy the URL. It will look like:
   `postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`
4. Copy this string for the backend `.env` file under `DATABASE_URL`.
5. Execute the schema commands located in `backend/schema.sql` inside the Supabase SQL Editor.

### B. AWS S3 Storage Configuration
1. Sign in to the [AWS Management Console](https://aws.amazon.com/).
2. Open the **Amazon S3 Console** and click **Create bucket**.
3. Provide a name, choose your AWS Region, and ensure **Block all public access** is **checked** (highly secure).
4. Go to **AWS IAM (Identity and Access Management)**.
5. Create a new user with programmatic access. Attach an inline policy allowing the user access to your S3 bucket:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject"
               ],
               "Resource": "arn:aws:s3:::[YOUR_BUCKET_NAME]/*"
           }
       ]
   }
   ```
6. Copy the **Access Key ID** and **Secret Access Key** to place in the backend `.env`.

---

## 3. Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=supersecretjwtkeyforcloudsystem123!
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_BUCKET_NAME=my-secure-cloud-storage-bucket
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. How to Run Locally

### Step 1: Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database table structures using:
   ```bash
   node seed.js # (We will provide a script to run schema migrations and setup core seeds)
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Step 2: Start the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.
