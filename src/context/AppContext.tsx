
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for our data models
export type AttendanceStatus = "present" | "absent" | "halfday" | "overtime";

export interface Worker {
  id: string;
  name: string;
  profilePicture?: string;
  joiningDate: string;
  dailyWage: number;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Payment {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  type: "advance" | "overtime";
}

interface AppContextType {
  workers: Worker[];
  attendanceRecords: AttendanceRecord[];
  payments: Payment[];
  addWorker: (worker: Omit<Worker, "id">) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  markAttendance: (workerId: string, date: string, status: AttendanceStatus) => void;
  addPayment: (payment: Omit<Payment, "id">) => void;
  deletePayment: (id: string) => void;
  getWorkerAttendance: (workerId: string, month: number, year: number) => AttendanceRecord[];
  getWorkerPayments: (workerId: string, month: number, year: number) => Payment[];
  calculateNetWages: (workerId: string, month: number, year: number) => number;
  selectedWorker: Worker | null;
  setSelectedWorker: (worker: Worker | null) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data from local storage
  useEffect(() => {
    // In a real app, you would load from local storage or a database
    const loadSampleData = () => {
      // Set some sample data
      setWorkers([
        {
          id: "1",
          name: "Rajesh Kumar",
          joiningDate: "2023-01-15",
          dailyWage: 500,
          profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          id: "2",
          name: "Sunil Verma",
          joiningDate: "2023-02-10",
          dailyWage: 450,
          profilePicture: "https://randomuser.me/api/portraits/men/2.jpg",
        },
        {
          id: "3",
          name: "Amit Singh",
          joiningDate: "2023-03-05",
          dailyWage: 550,
          profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
        },
      ]);

      // Sample attendance records
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);

      setAttendanceRecords([
        {
          id: "a1",
          workerId: "1",
          date: today.toISOString().split('T')[0],
          status: "present"
        },
        {
          id: "a2",
          workerId: "2",
          date: today.toISOString().split('T')[0],
          status: "absent"
        },
        {
          id: "a3",
          workerId: "3",
          date: today.toISOString().split('T')[0],
          status: "halfday"
        },
        {
          id: "a4",
          workerId: "1",
          date: yesterday.toISOString().split('T')[0],
          status: "present"
        },
        {
          id: "a5",
          workerId: "2",
          date: yesterday.toISOString().split('T')[0],
          status: "present"
        },
        {
          id: "a6",
          workerId: "3",
          date: yesterday.toISOString().split('T')[0],
          status: "overtime"
        },
        {
          id: "a7",
          workerId: "1",
          date: dayBefore.toISOString().split('T')[0],
          status: "present"
        },
        {
          id: "a8",
          workerId: "2",
          date: dayBefore.toISOString().split('T')[0],
          status: "present"
        },
        {
          id: "a9",
          workerId: "3",
          date: dayBefore.toISOString().split('T')[0],
          status: "present"
        },
      ]);

      // Sample payments
      setPayments([
        {
          id: "p1",
          workerId: "1",
          date: yesterday.toISOString().split('T')[0],
          amount: 1000,
          type: "advance"
        },
        {
          id: "p2",
          workerId: "3",
          date: yesterday.toISOString().split('T')[0],
          amount: 500,
          type: "overtime"
        },
      ]);

      setIsLoading(false);
    };

    // Simulate a small delay for loading
    setTimeout(loadSampleData, 1000);
  }, []);

  // Add a new worker
  const addWorker = (worker: Omit<Worker, "id">) => {
    const newWorker: Worker = {
      ...worker,
      id: Date.now().toString(), // Simple ID generation
    };
    setWorkers((prev) => [...prev, newWorker]);
  };

  // Update an existing worker
  const updateWorker = (updatedWorker: Worker) => {
    setWorkers((prev) => 
      prev.map((worker) => (worker.id === updatedWorker.id ? updatedWorker : worker))
    );
  };

  // Delete a worker
  const deleteWorker = (id: string) => {
    setWorkers((prev) => prev.filter((worker) => worker.id !== id));
    // Also clean up related records
    setAttendanceRecords((prev) => 
      prev.filter((record) => record.workerId !== id)
    );
    setPayments((prev) => prev.filter((payment) => payment.workerId !== id));
  };

  // Mark attendance for a worker
  const markAttendance = (workerId: string, date: string, status: AttendanceStatus) => {
    // Check if there's already a record for this worker and date
    const existingRecord = attendanceRecords.find(
      (record) => record.workerId === workerId && record.date === date
    );

    if (existingRecord) {
      // Update existing record
      setAttendanceRecords((prev) =>
        prev.map((record) =>
          record.id === existingRecord.id ? { ...record, status } : record
        )
      );
    } else {
      // Add new record
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        workerId,
        date,
        status,
      };
      setAttendanceRecords((prev) => [...prev, newRecord]);
    }
  };

  // Add a payment record
  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  // Delete a payment record
  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
  };

  // Get attendance records for a worker in a specific month
  const getWorkerAttendance = (workerId: string, month: number, year: number) => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        record.workerId === workerId &&
        recordDate.getMonth() === month &&
        recordDate.getFullYear() === year
      );
    });
  };

  // Get payment records for a worker in a specific month
  const getWorkerPayments = (workerId: string, month: number, year: number) => {
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.date);
      return (
        payment.workerId === workerId &&
        paymentDate.getMonth() === month &&
        paymentDate.getFullYear() === year
      );
    });
  };

  // Calculate net wages for a worker in a specific month
  const calculateNetWages = (workerId: string, month: number, year: number) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return 0;

    const monthAttendance = getWorkerAttendance(workerId, month, year);
    const monthPayments = getWorkerPayments(workerId, month, year);

    // Calculate total days present (full day = 1, half day = 0.5)
    const totalDaysPresent = monthAttendance.reduce((total, record) => {
      if (record.status === "present") return total + 1;
      if (record.status === "halfday") return total + 0.5;
      if (record.status === "overtime") return total + 1; // Overtime also counts as present
      return total;
    }, 0);

    // Calculate base wages
    const baseWages = totalDaysPresent * worker.dailyWage;

    // Calculate overtime pay
    const overtimePayments = monthPayments
      .filter((payment) => payment.type === "overtime")
      .reduce((total, payment) => total + payment.amount, 0);

    // Calculate advance payments
    const advancePayments = monthPayments
      .filter((payment) => payment.type === "advance")
      .reduce((total, payment) => total + payment.amount, 0);

    // Net wages = base + overtime - advances
    return baseWages + overtimePayments - advancePayments;
  };

  return (
    <AppContext.Provider
      value={{
        workers,
        attendanceRecords,
        payments,
        addWorker,
        updateWorker,
        deleteWorker,
        markAttendance,
        addPayment,
        deletePayment,
        getWorkerAttendance,
        getWorkerPayments,
        calculateNetWages,
        selectedWorker,
        setSelectedWorker,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
