import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  fetchWorkers, 
  fetchAttendance, 
  fetchPayments,
  addWorkerToApi,
  updateWorkerInApi,
  deleteWorkerFromApi,
  markAttendanceInApi,
  addPaymentToApi,
  deletePaymentFromApi,
  seedInitialData
} from "../services/apiService";
import { toast } from "../hooks/use-toast";

// Define types for our data models
export type AttendanceStatus = "present" | "absent" | "halfday";

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
  type: "advance";
}

interface AppContextType {
  workers: Worker[];
  attendanceRecords: AttendanceRecord[];
  payments: Payment[];
  addWorker: (worker: Omit<Worker, "id">) => Promise<string>;
  updateWorker: (worker: Worker) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  markAttendance: (workerId: string, date: string, status: AttendanceStatus) => Promise<void>;
  addPayment: (payment: Omit<Payment, "id">) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
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
  const [isDataSeeded, setIsDataSeeded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedWorkers = await fetchWorkers();
        const loadedAttendance = await fetchAttendance();
        const loadedPayments = await fetchPayments();

        if (loadedWorkers.length === 0 && !isDataSeeded) {
          await seedSampleData();
          setIsDataSeeded(true);
        } else {
          setWorkers(loadedWorkers);
          setAttendanceRecords(loadedAttendance);
          setPayments(loadedPayments);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isDataSeeded]);

  const seedSampleData = async () => {
    const sampleWorkers: Worker[] = [
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
    ];

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    const sampleAttendance: AttendanceRecord[] = [
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
        status: "present"
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
    ];

    const samplePayments: Payment[] = [
      {
        id: "p1",
        workerId: "1",
        date: yesterday.toISOString().split('T')[0],
        amount: 1000,
        type: "advance"
      }
    ];

    try {
      await seedInitialData(sampleWorkers, sampleAttendance, samplePayments);
      setWorkers(sampleWorkers);
      setAttendanceRecords(sampleAttendance);
      setPayments(samplePayments);
    } catch (error) {
      console.error("Error seeding sample data:", error);
      toast({
        title: "Error",
        description: "Failed to initialize sample data.",
        variant: "destructive",
      });
    }
  };

  const addWorker = async (worker: Omit<Worker, "id">): Promise<string> => {
    try {
      const newWorkerId = await addWorkerToApi(worker);
      const newWorker: Worker = {
        ...worker,
        id: newWorkerId,
      };
      setWorkers((prev) => [...prev, newWorker]);
      return newWorkerId;
    } catch (error) {
      console.error("Error adding worker:", error);
      toast({
        title: "Error",
        description: "Failed to add worker.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateWorker = async (updatedWorker: Worker): Promise<void> => {
    try {
      await updateWorkerInApi(updatedWorker);
      setWorkers((prev) => 
        prev.map((worker) => (worker.id === updatedWorker.id ? updatedWorker : worker))
      );
    } catch (error) {
      console.error("Error updating worker:", error);
      toast({
        title: "Error",
        description: "Failed to update worker.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteWorker = async (id: string): Promise<void> => {
    try {
      await deleteWorkerFromApi(id);
      setWorkers((prev) => prev.filter((worker) => worker.id !== id));
      setAttendanceRecords((prev) => 
        prev.filter((record) => record.workerId !== id)
      );
      setPayments((prev) => prev.filter((payment) => payment.workerId !== id));
    } catch (error) {
      console.error("Error deleting worker:", error);
      toast({
        title: "Error",
        description: "Failed to delete worker.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markAttendance = async (workerId: string, date: string, status: AttendanceStatus): Promise<void> => {
    try {
      await markAttendanceInApi(workerId, date, status);
      
      const existingRecord = attendanceRecords.find(
        (record) => record.workerId === workerId && record.date === date
      );

      if (existingRecord) {
        setAttendanceRecords((prev) =>
          prev.map((record) =>
            record.id === existingRecord.id ? { ...record, status } : record
          )
        );
      } else {
        const tempId = Date.now().toString();
        const newRecord: AttendanceRecord = {
          id: tempId,
          workerId,
          date,
          status,
        };
        setAttendanceRecords((prev) => [...prev, newRecord]);
        
        const updatedRecords = await fetchAttendance();
        setAttendanceRecords(updatedRecords);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        title: "Error",
        description: "Failed to mark attendance.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addPayment = async (payment: Omit<Payment, "id">): Promise<void> => {
    try {
      const newPaymentId = await addPaymentToApi(payment);
      const newPayment: Payment = {
        ...payment,
        id: newPaymentId,
      };
      setPayments((prev) => [...prev, newPayment]);
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error",
        description: "Failed to add payment.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePayment = async (id: string): Promise<void> => {
    try {
      await deletePaymentFromApi(id);
      setPayments((prev) => prev.filter((payment) => payment.id !== id));
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment.",
        variant: "destructive",
      });
      throw error;
    }
  };

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

  const calculateNetWages = (workerId: string, month: number, year: number) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return 0;

    const monthAttendance = getWorkerAttendance(workerId, month, year);
    const monthPayments = getWorkerPayments(workerId, month, year);

    const totalDaysPresent = monthAttendance.reduce((total, record) => {
      if (record.status === "present") return total + 1;
      if (record.status === "halfday") return total + 0.5;
      return total;
    }, 0);

    const baseWages = totalDaysPresent * worker.dailyWage;

    const advancePayments = monthPayments
      .filter((payment) => payment.type === "advance")
      .reduce((total, payment) => total + payment.amount, 0);

    return baseWages - advancePayments;
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

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
