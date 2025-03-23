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
  addWorker: (worker: Omit<Worker, "id">) => string;
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

  useEffect(() => {
    const loadSampleData = () => {
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

    setTimeout(loadSampleData, 1000);
  }, []);

  const addWorker = (worker: Omit<Worker, "id">) => {
    const newWorkerId = Date.now().toString();
    const newWorker: Worker = {
      ...worker,
      id: newWorkerId,
    };
    setWorkers((prev) => [...prev, newWorker]);
    return newWorkerId;
  };

  const updateWorker = (updatedWorker: Worker) => {
    setWorkers((prev) => 
      prev.map((worker) => (worker.id === updatedWorker.id ? updatedWorker : worker))
    );
  };

  const deleteWorker = (id: string) => {
    setWorkers((prev) => prev.filter((worker) => worker.id !== id));
    setAttendanceRecords((prev) => 
      prev.filter((record) => record.workerId !== id)
    );
    setPayments((prev) => prev.filter((payment) => payment.workerId !== id));
  };

  const markAttendance = (workerId: string, date: string, status: AttendanceStatus) => {
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
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        workerId,
        date,
        status,
      };
      setAttendanceRecords((prev) => [...prev, newRecord]);
    }
  };

  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
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
