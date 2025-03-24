
# FabTracko Backend API

This is the backend API service for the Vikas Fabrication Works application.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the `.env.example` template and add your MongoDB connection string.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production, the server can be started with:
   ```bash
   npm start
   ```

## API Documentation

### Workers API

- `GET /api/workers` - Get all workers
- `POST /api/workers` - Add a new worker
- `PUT /api/workers/:id` - Update a worker
- `DELETE /api/workers/:id` - Delete a worker

### Attendance API

- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Mark or update attendance

### Payments API

- `GET /api/payments` - Get all payment records
- `POST /api/payments` - Add a new payment
- `DELETE /api/payments/:id` - Delete a payment

## Deployment to Google Cloud Run

1. Build the Docker image:
   ```bash
   docker build -t fabtracko-backend .
   ```

2. Tag the image for Google Container Registry:
   ```bash
   docker tag fabtracko-backend gcr.io/[PROJECT-ID]/fabtracko-backend
   ```

3. Push the image to Google Container Registry:
   ```bash
   docker push gcr.io/[PROJECT-ID]/fabtracko-backend
   ```

4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy fabtracko-backend \
     --image gcr.io/[PROJECT-ID]/fabtracko-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "MONGODB_URI=[YOUR_MONGODB_URI]"
   ```
