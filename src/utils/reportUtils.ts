import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export interface ReportWorker {
  id: string;
  name: string;
  profilePicture?: string;
  joiningDate: string;
  dailyWage: number;
}

export interface ReportAttendance {
  id: string;
  workerId: string;
  date: string;
  status: "present" | "absent" | "halfday";
}

export interface ReportPayment {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  type: "advance";
}

export interface WorkerMonthlySummary {
  worker: ReportWorker;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  totalWorkingDays: number;
  attendancePercentage: number;
  totalAdvance: number;
  grossWages: number;
  netWages: number;
  dailyAttendance: DailyAttendance[];
}

export interface DailyAttendance {
  date: string;
  day: number;
  status: "present" | "absent" | "halfday" | null;
}

export interface MonthlyReportData {
  month: string;
  year: number;
  totalWorkers: number;
  totalWorkingDays: number;
  totalGrossWages: number;
  totalAdvances: number;
  totalNetWages: number;
  overallAttendancePercentage: number;
  workerSummaries: WorkerMonthlySummary[];
  reportGeneratedAt: string;
}

export class ReportGenerator {
  private workers: ReportWorker[];
  private attendanceRecords: ReportAttendance[];
  private payments: ReportPayment[];

  constructor(workers: ReportWorker[], attendanceRecords: ReportAttendance[], payments: ReportPayment[]) {
    this.workers = workers;
    this.attendanceRecords = attendanceRecords;
    this.payments = payments;
  }

  generateMonthlyReport(month: Date): MonthlyReportData {
    const monthIndex = month.getMonth();
    const year = month.getFullYear();
    const monthName = format(month, "MMMM yyyy");

    // Generate worker summaries and sort alphabetically by name
    const workerSummaries = this.workers
      .map(worker => this.generateWorkerMonthlySummary(worker, monthIndex, year))
      .sort((a, b) => a.worker.name.localeCompare(b.worker.name));

    // Calculate totals
    const totalWorkingDays = workerSummaries.reduce((sum, summary) => sum + summary.totalWorkingDays, 0);
    const totalGrossWages = workerSummaries.reduce((sum, summary) => sum + summary.grossWages, 0);
    const totalAdvances = workerSummaries.reduce((sum, summary) => sum + summary.totalAdvance, 0);
    const totalNetWages = workerSummaries.reduce((sum, summary) => sum + summary.netWages, 0);

    // Calculate overall attendance percentage
    const totalPossibleDays = this.workers.length * this.getDaysInMonth(month);
    const totalPresentDays = workerSummaries.reduce((sum, summary) => sum + summary.totalWorkingDays, 0);
    const overallAttendancePercentage = totalPossibleDays > 0 ? (totalPresentDays / totalPossibleDays) * 100 : 0;

    return {
      month: monthName,
      year,
      totalWorkers: this.workers.length,
      totalWorkingDays,
      totalGrossWages,
      totalAdvances,
      totalNetWages,
      overallAttendancePercentage,
      workerSummaries,
      reportGeneratedAt: format(new Date(), "dd MMM yyyy 'at' HH:mm")
    };
  }

  generateWorkerMonthlySummary(worker: ReportWorker, monthIndex: number, year: number): WorkerMonthlySummary {
    // Get worker's attendance for the month
    const workerAttendance = this.attendanceRecords.filter(record => 
      record.workerId === worker.id && 
      new Date(record.date).getMonth() === monthIndex && 
      new Date(record.date).getFullYear() === year
    );

    // Get worker's payments for the month
    const workerPayments = this.payments.filter(payment => 
      payment.workerId === worker.id && 
      new Date(payment.date).getMonth() === monthIndex && 
      new Date(payment.date).getFullYear() === year
    );

    // Calculate attendance statistics
    const presentDays = workerAttendance.filter(record => record.status === "present").length;
    const absentDays = workerAttendance.filter(record => record.status === "absent").length;
    const halfDays = workerAttendance.filter(record => record.status === "halfday").length;
    
    // Calculate total working days (half days count as 0.5)
    const totalWorkingDays = presentDays + (halfDays * 0.5);

    // Calculate attendance percentage
    const month = new Date(year, monthIndex, 1);
    const daysInMonth = this.getDaysInMonth(month);
    const attendancePercentage = daysInMonth > 0 ? ((presentDays + halfDays) / daysInMonth) * 100 : 0;

    // Calculate financial data
    const totalAdvance = workerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const grossWages = totalWorkingDays * worker.dailyWage;
    const netWages = grossWages - totalAdvance;

    // Generate daily attendance data
    const dailyAttendance = this.generateDailyAttendance(worker.id, month);

    return {
      worker,
      presentDays,
      absentDays,
      halfDays,
      totalWorkingDays,
      attendancePercentage,
      totalAdvance,
      grossWages,
      netWages,
      dailyAttendance
    };
  }

  private generateDailyAttendance(workerId: string, month: Date): DailyAttendance[] {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const attendance = this.attendanceRecords.find(
        record => record.workerId === workerId && record.date === dateStr
      );

      return {
        date: dateStr,
        day: day.getDate(),
        status: attendance ? attendance.status : null
      };
    });
  }

  private getDaysInMonth(month: Date): number {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
  }
}

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 0) {
    return `₹${amount.toLocaleString('en-IN')}`;
  } else {
    return `-₹${Math.abs(amount).toLocaleString('en-IN')}`;
  }
};

export const formatPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

export const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'present':
      return 'Present';
    case 'absent':
      return 'Absent';
    case 'halfday':
      return 'Half Day';
    default:
      return status;
  }
};

export const getStatusClassName = (status: string): string => {
  switch (status) {
    case 'present':
      return 'present';
    case 'absent':
      return 'absent';
    case 'halfday':
      return 'halfday';
    default:
      return '';
  }
};

// Print utility functions
export const openPrintWindow = (htmlContent: string, title: string = 'Report'): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate reports');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body class="print-container">
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            // Uncomment the line below if you want to auto-close after printing
            // window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Get print styles as string (we'll import the CSS content)
const getPrintStyles = (): string => {
  // This would normally import the CSS file content
  // For now, return basic print styles
  return `
    @media print {
      @page { size: A4; margin: 0.75in 0.5in; }
      body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; }
      .no-print { display: none !important; }
      .print-page-break { page-break-before: always; }
      .print-no-break { page-break-inside: avoid; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1pt solid #333; padding: 6pt; text-align: left; }
      th { background: #f0f0f0; font-weight: bold; }
    }
    
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 20px;
      background: white;
    }
    
    .print-header { 
      text-align: center; 
      margin-bottom: 30px; 
      border-bottom: 2px solid #333; 
      padding-bottom: 15px; 
    }
    
    .print-header h1 { 
      font-size: 24px; 
      margin: 0 0 10px 0; 
      color: #333; 
    }
    
    .print-header h2 { 
      font-size: 18px; 
      margin: 0; 
      color: #666; 
    }
    
    .print-summary { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 15px; 
      margin-bottom: 25px; 
    }
    
    .print-summary-card { 
      border: 1px solid #ddd; 
      padding: 15px; 
      text-align: center; 
      background: #f9f9f9; 
    }
    
    .print-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px; 
    }
    
    .print-table th { 
      background: #f0f0f0; 
      border: 1px solid #333; 
      padding: 8px; 
      font-weight: bold; 
    }
    
    .print-table td { 
      border: 1px solid #ddd; 
      padding: 8px; 
    }
    
    .print-currency.positive { color: #155724; }
    .print-currency.negative { color: #721c24; }
    
    .print-worker-profile { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
    }
    
    .print-worker-avatar { 
      width: 30px; 
      height: 30px; 
      border-radius: 50%; 
      object-fit: cover; 
    }
    
    .print-worker-avatar-placeholder { 
      width: 30px; 
      height: 30px; 
      border-radius: 50%; 
      background: #f0f0f0; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: bold; 
    }
  `;
};