
# MongoDB and Google Cloud Integration Documentation

This document provides an overview of the MongoDB and Google Cloud integration implemented in the Vikas Fabrication Works application.

## Architecture Overview

The application now follows a client-server architecture with the following components:

1. **Frontend (React)** - The user interface remains unchanged, providing the same experience to users.

2. **Backend (Node.js/Express)** - A new server component that handles API requests and communicates with the database.

3. **Database (MongoDB)** - Stores all application data including workers, attendance records, and payments.

4. **Hosting (Google Cloud)** - Both the frontend and backend are hosted on Google Cloud Platform services.

## Data Collections

The MongoDB database is organized into three main collections:

1. **workers** - Stores worker profile information
   - Fields: name, profilePicture, joiningDate, dailyWage

2. **attendance** - Stores attendance records
   - Fields: workerId, date, status

3. **payments** - Stores payment records
   - Fields: workerId, date, amount, type

## Implementation Details

### Frontend Changes

The frontend application maintains the same user interface and experience. The key changes are in the data service layer, which now communicates with the backend API instead of directly with Firebase.

### Backend API

The backend API provides the following endpoints:

- **Workers**
  - GET /api/workers - Retrieve all workers
  - POST /api/workers - Add a new worker
  - PUT /api/workers/:id - Update a worker
  - DELETE /api/workers/:id - Delete a worker

- **Attendance**
  - GET /api/attendance - Retrieve all attendance records
  - POST /api/attendance - Mark or update attendance

- **Payments**
  - GET /api/payments - Retrieve all payment records
  - POST /api/payments - Add a new payment
  - DELETE /api/payments/:id - Delete a payment

### Data Migration

The application automatically checks if data exists in MongoDB. If no data is found, it seeds sample data on the first run. This ensures a smooth transition from the previous storage solution.

### Error Handling

All API operations include error handling to ensure the application remains stable even when network issues occur. Errors are logged to the console and displayed to users via toast notifications.

## Deployment

### Frontend Deployment (Google Cloud Storage + Cloud CDN)

The frontend is deployed as a static website using Google Cloud Storage and served through Cloud CDN.

### Backend Deployment (Google Cloud Run)

The backend is containerized and deployed on Google Cloud Run, a fully managed platform that automatically scales to handle incoming requests.

### MongoDB Setup

MongoDB is deployed using MongoDB Atlas (MongoDB's cloud service) with a connection to our Google Cloud environment.

## Configuration

The backend requires the following environment variables:

- `PORT` - The port on which the server will run
- `MONGODB_URI` - The connection string for the MongoDB database

## Maintenance and Troubleshooting

### Common Issues

1. **Data not loading**: Check the browser console for error messages. Ensure that the backend server is running and that MongoDB is accessible.

2. **Performance issues**: If the application becomes slow, consider implementing pagination for large collections or optimizing database queries.

### MongoDB Atlas Console

The MongoDB Atlas console can be accessed to manage the database, monitor usage, and configure security settings.

## Security Considerations

1. The frontend communicates with the backend API using HTTPS to ensure secure data transmission.

2. MongoDB Atlas provides built-in security features including network isolation, VPC peering, and encryption at rest.

3. For production deployments, ensure that proper authentication and authorization mechanisms are in place.

4. Consider implementing API rate limiting to prevent abuse.

