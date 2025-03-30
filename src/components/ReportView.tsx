
import React, { useState } from "react";
import { 
  Download, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  IndianRupee,
  Printer,
  FileText
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { format, addMonths, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";

const ReportView: React.FC = () => {
  const { 
    workers, 
    attendanceRecords, 
    payments, 
    calculateNetWages 
  } = useAppContext();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get current month and year
  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();
  
  // Generate worker summary for the month
  const workerSummaries = workers.map(worker => {
    // Get worker attendance for the month
    const workerAttendance = attendanceRecords.filter(record => 
      record.workerId === worker.id && 
      new Date(record.date).getMonth() === currentMonthIndex && 
      new Date(record.date).getFullYear() === currentYear
    );
    
    // Get worker payments for the month
    const workerPayments = payments.filter(payment => 
      payment.workerId === worker.id && 
      new Date(payment.date).getMonth() === currentMonthIndex && 
      new Date(payment.date).getFullYear() === currentYear
    );
    
    // Calculate statistics
    const presentDays = workerAttendance.filter(record => record.status === "present").length;
    const absentDays = workerAttendance.filter(record => record.status === "absent").length;
    const halfDays = workerAttendance.filter(record => record.status === "halfday").length;
    
    // Calculate payment totals
    const totalAdvance = workerPayments
      .filter(payment => payment.type === "advance")
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate net wages
    const netWages = calculateNetWages(worker.id, currentMonthIndex, currentYear);
    
    return {
      worker,
      presentDays,
      absentDays,
      halfDays,
      totalAdvance,
      netWages
    };
  });
  
  // Sort summaries by worker name
  workerSummaries.sort((a, b) => a.worker.name.localeCompare(b.worker.name));
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };
  
  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (!isSameMonth(nextMonth, new Date()) && nextMonth > new Date()) {
      return; // Don't allow navigation to future months
    }
    setCurrentMonth(nextMonth);
  };
  
  // Calculate totals across all workers
  const totalNetWages = workerSummaries.reduce((sum, summary) => sum + summary.netWages, 0);
  const totalAdvances = workerSummaries.reduce((sum, summary) => sum + summary.totalAdvance, 0);

  // Handle download/print report
  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully");
    // In a real app, this would generate a PDF or Excel file
  };
  
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Monthly Wage Report</h2>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(currentMonth, "MMMM yyyy")}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="flex items-center justify-center h-9 w-9 rounded hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <h3 className="text-sm font-medium px-2">
                {format(currentMonth, "MMM yyyy")}
              </h3>
              
              <button
                onClick={handleNextMonth}
                className={`flex items-center justify-center h-9 w-9 rounded ${
                  isSameMonth(addMonths(currentMonth, 1), new Date()) || addMonths(currentMonth, 1) > new Date()
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "hover:bg-muted transition-colors"
                }`}
                disabled={isSameMonth(addMonths(currentMonth, 1), new Date()) || addMonths(currentMonth, 1) > new Date()}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={handlePrintReport}
              className="flex items-center justify-center h-9 px-4 rounded bg-muted hover:bg-muted/70 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Print</span>
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="flex items-center justify-center h-9 px-4 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Download</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Summary</h3>
          <div className="text-sm text-muted-foreground">
            Monthly wage summary for all workers
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Net Wages</div>
              <div className="text-2xl font-semibold flex items-center">
                <IndianRupee className="h-5 w-5 mr-1" />
                {totalNetWages.toLocaleString('en-IN')}
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Advances</div>
              <div className="text-2xl font-semibold flex items-center">
                <IndianRupee className="h-5 w-5 mr-1" />
                {totalAdvances.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Report */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Detailed Report</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Present Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Half Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Advances</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">Net Wages</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {workerSummaries.map((summary, index) => (
                <tr key={summary.worker.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {summary.worker.profilePicture ? (
                        <img
                          src={summary.worker.profilePicture}
                          alt={summary.worker.name}
                          className="h-8 w-8 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                          {summary.worker.name.charAt(0)}
                        </div>
                      )}
                      <div className="font-medium">{summary.worker.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 rounded-full bg-status-present"></div>
                      <span>{summary.presentDays}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 rounded-full bg-status-absent"></div>
                      <span>{summary.absentDays}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 rounded-full bg-status-halfday"></div>
                      <span>{summary.halfDays}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IndianRupee className="h-3 w-3 mr-1 text-status-absent" />
                      <span>{summary.totalAdvance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center font-semibold">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      <span>{summary.netWages}</span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {workerSummaries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No data available for the selected month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
