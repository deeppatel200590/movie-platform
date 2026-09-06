# Varenya Films Website

## Overview
This project is a production-style website developed for showcasing film/media content and company information in a modern and responsive way.

The project was built as a practical real-world application rather than a tutorial-based clone project, with a focus on usability, responsiveness, and deployment.

## System Overview
- Authentication with JWT + Google OAuth
- Role-based access (Admin/User)
- Secure media upload using Cloudflare R2
- Payment integration for movie access

## Features
- Responsive user interface
- Dynamic content sections
- Media/image handling
- Contact and inquiry forms
- Mobile-friendly design
- Backend integration

## Tech Stack
- React
- Vite
- JavaScript
- CSS
- Express.js
- Node.js
- MongoDB
- Cloudflare R2 Storage

## Project Goals
The main goal of this project was to gain hands-on experience building and deploying a real-world full-stack website while focusing on maintainability, responsiveness, and scalability.

## Challenges & Solutions

### 1. Authentication Complexity (JWT + Google OAuth)
Managing both JWT-based authentication and Google OAuth in the same system was challenging.

**Solution:**  
I separated authentication flows and used Passport.js only for OAuth, while JWT handled session-based API access for normal login.


### 2. Secure File Uploads (Large Media Files)
Handling large movie files and images efficiently without blocking server performance was difficult.

**Solution:**  
I used Cloudflare R2 with direct upload and pre-signed URLs to offload file handling from the backend.

---

### 3. Payment Verification Reliability
Ensuring correct payment status before granting access to content required secure validation.

**Solution:**  
I implemented server-side verification using Cashfree API before confirming purchase and updating database records.

---

### 4. Backend & Frontend Integration
Keeping API communication clean between React frontend and Express backend required proper structuring.

**Solution:**  
I used RESTful API design and centralized auth middleware for consistency across routes.

## Challenges Faced
- Managing frontend/backend integration
- Optimizing media assets
- Responsive layout handling
- Deployment and hosting configuration
- Structuring reusable frontend components

## What I Learned
- Real-world deployment workflow
- Structuring scalable frontend components
- Backend communication and API integration
- Debugging production issues
- Managing full-stack application flow

## Live Demo
https://murlidharmotionpictures.in/

## Author
Deep
