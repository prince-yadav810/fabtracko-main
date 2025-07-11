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

  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 Starting to load data...");
      setIsLoading(true);
      
      try {
        console.log("📡 Fetching workers...");
        const loadedWorkers = await fetchWorkers();
        console.log("👥 Workers fetched:", loadedWorkers);
        
        console.log("📡 Fetching attendance...");
        const loadedAttendance = await fetchAttendance();
        console.log("📋 Attendance fetched:", loadedAttendance);
        
        console.log("📡 Fetching payments...");
        const loadedPayments = await fetchPayments();
        console.log("💰 Payments fetched:", loadedPayments);

        // Always set the data, even if empty
        setWorkers(loadedWorkers);
        setAttendanceRecords(loadedAttendance);
        setPayments(loadedPayments);

        // Only seed if no workers exist
        if (loadedWorkers.length === 0) {
          console.log("🌱 No workers found, seeding sample data...");
          await seedSampleData();
        } else {
          console.log(`✅ Found ${loadedWorkers.length} workers, no seeding needed`);
        }
        
      } catch (error) {
        console.error("❌ Error loading data:", error);
        
        // More specific error handling
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        
        toast({
          title: "Error Loading Data",
          description: `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        console.log("✅ Data loading completed");
      }
    };

    loadData();
  }, []);

  const seedSampleData = async () => {
    const sampleWorkers: Worker[] = [
      {
        id: "temp1", // Using temp IDs that will be replaced by MongoDB IDs
        name: "Rajesh Kumar",
        joiningDate: "2023-01-15",
        dailyWage: 500,
        profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        id: "temp2",
        name: "Sunil Verma", 
        joiningDate: "2023-02-10",
        dailyWage: 450,
        profilePicture: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        id: "temp3",
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
        id: "tempa1",
        workerId: "temp1",
        date: today.toISOString().split('T')[0],
        status: "present"
      },
      {
        id: "tempa2",
        workerId: "temp2",
        date: today.toISOString().split('T')[0],
        status: "absent"
      },
      {
        id: "tempa3",
        workerId: "temp3",
        date: today.toISOString().split('T')[0],
        status: "halfday"
      },
    ];

    const samplePayments: Payment[] = [
      {
        id: "tempp1",
        workerId: "temp1",
        date: yesterday.toISOString().split('T')[0],
        amount: 1000,
        type: "advance"
      },
    ];

    try {
      console.log("🌱 Seeding initial data...");
      await seedInitialData(sampleWorkers, sampleAttendance, samplePayments);
      
      // After seeding, reload the data from API
      console.log("🔄 Reloading data after seeding...");
      const newWorkers = await fetchWorkers();
      const newAttendance = await fetchAttendance();
      const newPayments = await fetchPayments();
      
      setWorkers(newWorkers);
      setAttendanceRecords(newAttendance);
      setPayments(newPayments);
      
      console.log("✅ Sample data seeded and reloaded successfully");
      toast({
        title: "Welcome!",
        description: "Sample data has been created for you to get started.",
      });
    } catch (error) {
      console.error("❌ Error seeding sample data:", error);
      toast({
        title: "Warning",
        description: "Failed to create sample data, but you can still add workers manually.",
        variant: "destructive",
      });
    }
  };

  const addWorker = async (worker: Omit<Worker, "id">): Promise<string> => {
    try {
      console.log("➕ Adding worker:", worker);
      const newWorkerId = await addWorkerToApi(worker);
      console.log("✅ Worker added with ID:", newWorkerId);
      
      const newWorker: Worker = {
        ...worker,
        id: newWorkerId,
      };
      setWorkers((prev) => [...prev, newWorker]);
      
      toast({
        title: "Success",
        description: `Worker ${worker.name} added successfully!`,
      });
      
      return newWorkerId;
    } catch (error) {
      console.error("❌ Error adding worker:", error);
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
      
      toast({
        title: "Success",
        description: `Worker ${updatedWorker.name} updated successfully!`,
      });
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
      
      toast({
        title: "Success",
        description: "Worker deleted successfully!",
      });
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
      
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      });
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
      
      toast({
        title: "Success",
        description: "Payment added successfully!",
      });
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
      
      toast({
        title: "Success",
        description: "Payment deleted successfully!",
      });
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
      if (record.status === "overtime") return total + 1;
      return total;
    }, 0);

    const baseWages = totalDaysPresent * worker.dailyWage;

    const overtimePayments = monthPayments
      .filter((payment) => payment.type === "overtime")
      .reduce((total, payment) => total + payment.amount, 0);

    const advancePayments = monthPayments
      .filter((payment) => payment.type === "advance")
      .reduce((total, payment) => total + payment.amount, 0);

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

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};