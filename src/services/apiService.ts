import axios from 'axios';
import { Worker, AttendanceRecord, Payment, AttendanceStatus } from "../context/AppContext";
import authService from '../services/authService';

// Base API URL - configured based on environment
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.googlegcloud.app/api'
  : 'http://localhost:5001/api';

// Setup request interceptor to always include the latest token
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Error handling helper
const handleApiError = (error: any, message: string) => {
  console.error(`${message}:`, error);
  throw error;
};

// =======================
// Worker Operations
// =======================

export const fetchWorkers = async (): Promise<Worker[]> => {
  try {
    const response = await axios.get(`${API_URL}/workers`);
    if (!response.data) throw new Error(`HTTP error ${response.status}`);
    
    const workers = response.data;
    return workers.map((worker: any) => ({
      ...worker,
      id: worker._id, // Map MongoDB _id to our id field
    }));
  } catch (error) {
    handleApiError(error, "Error fetching workers");
    return [];
  }
};

export const addWorkerToApi = async (worker: Omit<Worker, "id">): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/workers`, worker, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.data) throw new Error(`HTTP error ${response.status}`);
    return response.data._id; // Return the MongoDB _id
  } catch (error) {
    handleApiError(error, "Error adding worker");
    throw error;
  }
};

export const updateWorkerInApi = async (worker: Worker): Promise<void> => {
  try {
    const { id, ...workerData } = worker;
    const response = await axios.put(`${API_URL}/workers/${id}`, workerData, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status !== 200) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    handleApiError(error, "Error updating worker");
    throw error;
  }
};

export const deleteWorkerFromApi = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/workers/${id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    handleApiError(error, "Error deleting worker");
    throw error;
  }
};

// =======================
// Attendance Operations
// =======================

export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance`);
    if (!response.data) throw new Error(`HTTP error ${response.status}`);
    
    const attendance = response.data;
    return attendance.map((record: any) => ({
      ...record,
      id: record._id, // Map MongoDB _id to our id field
      workerId: record.workerId,
    }));
  } catch (error) {
    handleApiError(error, "Error fetching attendance");
    return [];
  }
};

export const markAttendanceInApi = async (
  workerId: string,
  date: string,
  status: AttendanceStatus
): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/attendance`, { workerId, date, status }, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    handleApiError(error, "Error marking attendance");
    throw error;
  }
};

// =======================
// Payment Operations
// =======================

export const fetchPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/payments`);
    if (!response.data) throw new Error(`HTTP error ${response.status}`);
    
    const payments = response.data;
    return payments.map((payment: any) => ({
      ...payment,
      id: payment._id, // Map MongoDB _id to our id field
      workerId: payment.workerId,
    }));
  } catch (error) {
    handleApiError(error, "Error fetching payments");
    return [];
  }
};

export const addPaymentToApi = async (payment: Omit<Payment, "id">): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/payments`, payment, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.data) throw new Error(`HTTP error ${response.status}`);
    return response.data._id; // Return the MongoDB _id
  } catch (error) {
    handleApiError(error, "Error adding payment");
    throw error;
  }
};

export const deletePaymentFromApi = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/payments/${id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    handleApiError(error, "Error deleting payment");
    throw error;
  }
};

// =======================
// Seed Initial Data
// =======================

export const seedInitialData = async (
  workers: Worker[],
  attendance: AttendanceRecord[],
  payments: Payment[]
): Promise<void> => {
  try {
    // Check if data already exists
    const existingWorkers = await fetchWorkers();
    if (existingWorkers.length === 0) {
      // Add workers without IDs
      for (const worker of workers) {
        const { id, ...workerData } = worker;
        await addWorkerToApi(workerData);
      }
      
      // Retrieve newly created workers to map their IDs
      const newWorkers = await fetchWorkers();
      const workerIdMap = new Map<string, string>();
      
      // Map old IDs to new IDs based on matching names
      workers.forEach((oldWorker) => {
        const newWorker = newWorkers.find(w => w.name === oldWorker.name);
        if (newWorker) {
          workerIdMap.set(oldWorker.id, newWorker.id);
        }
      });
      
      // Add attendance records with updated worker IDs
      for (const record of attendance) {
        const newWorkerId = workerIdMap.get(record.workerId);
        if (newWorkerId) {
          await markAttendanceInApi(newWorkerId, record.date, record.status);
        }
      }
      
      // Add payment records with updated worker IDs
      for (const payment of payments) {
        const newWorkerId = workerIdMap.get(payment.workerId);
        if (newWorkerId) {
          const { id, ...paymentData } = payment;
          await addPaymentToApi({ ...paymentData, workerId: newWorkerId });
        }
      }
      
      console.log("Initial data seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
    throw error;
  }
};
