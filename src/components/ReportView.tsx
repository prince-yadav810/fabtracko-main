import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  IndianRupee,
  Printer,
  FileText,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Download,
  User
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Worker, AttendanceRecord, Payment } from "../context/AppContext";
import { format, addMonths, isSameMonth, isAfter } from "date-fns";
import { toast } from "sonner";
import { ReportGenerator, openPrintWindow } from "../utils/reportUtils";
import MonthlyReportTemplate from "../components/reports/MonthlyReportTemplate";
import WorkerReportTemplate from "../components/reports/WorkerReportTemplate";
import { createRoot } from 'react-dom/client';

const ReportView: React.FC = () => {
  const appContext = useAppContext();
  const { 
    workers, 
    payments, 
    calculateNetWages 
  } = appContext;
  const attendanceRecords = appContext.attendanceRecords;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showWorkerReportDropdown, setShowWorkerReportDropdown] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showWorkerReportDropdown) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowWorkerReportDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkerReportDropdown]);
  
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
      
    const totalOvertime = workerPayments
      .filter(payment => payment.type === "overtime")
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate net wages
    const netWages = calculateNetWages(worker.id, currentMonthIndex, currentYear);
    
    return {
      worker,
      presentDays,
      absentDays,
      halfDays,
      totalAdvance,
      totalOvertime,
      netWages
    };
  });
  
  // Sort summaries by net wages (highest first)
  workerSummaries.sort((a, b) => b.netWages - a.netWages);
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };
  
  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    const today = new Date();
    
    // Fix: Allow navigation until we reach current month
    if (isAfter(nextMonth, today)) {
      return; // Don't allow navigation to future months
    }
    
    setCurrentMonth(nextMonth);
  };
  
  // Calculate totals across all workers (remove overtime)
  const totalNetWages = workerSummaries.reduce((sum, summary) => sum + summary.netWages, 0);
  const totalAdvances = workerSummaries.reduce((sum, summary) => sum + summary.totalAdvance, 0);
  const totalWorkingDays = workerSummaries.reduce((sum, summary) => sum + summary.presentDays, 0);
  
  // Check if next button should be disabled - FIXED
  const isNextDisabled = () => {
    const nextMonth = addMonths(currentMonth, 1);
    const today = new Date();
    return isAfter(nextMonth, today);
  };

  // Handle print report
  const handlePrintReport = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  // Generate and download monthly report
  const handleMonthlyReport = async () => {
    setIsGeneratingReport(true);
    try {
      const reportGenerator = new ReportGenerator(workers, attendanceRecords, payments);
      const reportData = reportGenerator.generateMonthlyReport(currentMonth);
      
      // Create a temporary container for the report
      const tempDiv = document.createElement('div');
      const root = createRoot(tempDiv);
      
      // Render the report template
      root.render(<MonthlyReportTemplate reportData={reportData} />);
      
      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the HTML content
      const htmlContent = tempDiv.innerHTML;
      
      // Open print window
      openPrintWindow(
        htmlContent, 
        `Monthly Report - ${reportData.month} - Vikas Fabrication Works`
      );
      
      toast.success("Monthly report generated successfully! 📊");
    } catch (error) {
      console.error('Error generating monthly report:', error);
      toast.error("Failed to generate monthly report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Generate individual worker report
  const handleWorkerReport = async (workerId: string) => {
    setIsGeneratingReport(true);
    setShowWorkerReportDropdown(false);
    
    try {
      const reportGenerator = new ReportGenerator(workers, attendanceRecords, payments);
      const workerSummary = reportGenerator.generateWorkerMonthlySummary(
        workers.find(w => w.id === workerId)!,
        currentMonth.getMonth(),
        currentMonth.getFullYear()
      );
      
      // Get monthly payments for this worker
      const monthlyPayments = payments.filter(payment => 
        payment.workerId === workerId &&
        new Date(payment.date).getMonth() === currentMonth.getMonth() &&
        new Date(payment.date).getFullYear() === currentMonth.getFullYear()
      );
      
      // Create a temporary container for the report
      const tempDiv = document.createElement('div');
      const root = createRoot(tempDiv);
      
      // Render the worker report template
      root.render(
        <WorkerReportTemplate 
          workerSummary={workerSummary}
          month={format(currentMonth, "MMMM yyyy")}
          reportGeneratedAt={format(new Date(), "dd MMM yyyy 'at' HH:mm")}
          monthlyPayments={monthlyPayments}
        />
      );
      
      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the HTML content
      const htmlContent = tempDiv.innerHTML;
      
      // Open print window
      openPrintWindow(
        htmlContent, 
        `${workerSummary.worker.name} Report - ${format(currentMonth, "MMMM yyyy")} - Vikas Fabrication Works`
      );
      
      toast.success(`Report generated for ${workerSummary.worker.name}! 📋`);
    } catch (error) {
      console.error('Error generating worker report:', error);
      toast.error("Failed to generate worker report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Month Navigation */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Monthly Reports</h2>
            <div className="flex items-center text-orange-100">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(currentMonth, "MMMM yyyy")}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Month Navigation */}
            <div className="flex items-center bg-white/20 rounded-xl p-1">
              <button
                onClick={handlePreviousMonth}
                className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <span className="px-4 py-2 text-sm font-medium min-w-[100px] text-center">
                {format(currentMonth, "MMM yyyy")}
              </span>
              
              <button
                onClick={handleNextMonth}
                className={`flex items-center justify-center h-10 w-10 rounded-lg transition-colors ${
                  isNextDisabled()
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/20"
                }`}
                disabled={isNextDisabled()}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Monthly Report Button */}
              <button
                onClick={handleMonthlyReport}
                disabled={isGeneratingReport}
                className="flex items-center h-10 px-4 bg-white text-orange-500 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm font-medium hidden lg:inline">
                  {isGeneratingReport ? "Generating..." : "Monthly Report"}
                </span>
              </button>

              {/* Individual Worker Report Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowWorkerReportDropdown(!showWorkerReportDropdown)}
                  disabled={isGeneratingReport || workers.length === 0}
                  className="flex items-center h-10 px-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium hidden lg:inline">Worker Report</span>
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showWorkerReportDropdown && workers.length > 0 && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b">
                        Select Worker for Individual Report
                      </div>
                      {workers
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(worker => (
                          <button
                            key={worker.id}
                            onClick={() => handleWorkerReport(worker.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
                          >
                            {worker.profilePicture ? (
                              <img
                                src={worker.profilePicture}
                                alt={worker.name}
                                className="h-6 w-6 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium mr-3">
                                {worker.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                              <div className="text-xs text-gray-500">₹{worker.dailyWage}/day</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePrintReport}
                className="flex items-center h-10 px-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium hidden md:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-xl p-3">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ₹{totalNetWages.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Net Wages</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 rounded-xl p-3">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ₹{totalAdvances.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Advances</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {totalWorkingDays}
          </div>
          <div className="text-sm text-gray-500">Working Days</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-xl p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {workers.length}
          </div>
          <div className="text-sm text-gray-500">Total Workers</div>
        </div>
      </div>
      
      {/* Detailed Report */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-xl p-3 mr-4">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Detailed Worker Report</h3>
              <p className="text-gray-500 text-sm">Individual worker performance and wages</p>
            </div>
          </div>
        </div>
        
        {/* Mobile-friendly cards for small screens */}
        <div className="md:hidden p-4 space-y-4">
          {workerSummaries.map((summary) => (
            <div key={summary.worker.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center mb-4">
                {summary.worker.profilePicture ? (
                  <img
                    src={summary.worker.profilePicture}
                    alt={summary.worker.name}
                    className="h-12 w-12 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold mr-3">
                    {summary.worker.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold">{summary.worker.name}</div>
                  <div className="text-sm text-gray-500">₹{summary.worker.dailyWage}/day</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{summary.presentDays}</div>
                  <div className="text-xs text-gray-500">Present</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-red-500">{summary.absentDays}</div>
                  <div className="text-xs text-gray-500">Absent</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Net Wages:</span>
                <span className="font-bold text-lg flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {summary.netWages.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Days</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advances</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Wages</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workerSummaries.map((summary, index) => (
                <tr key={summary.worker.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {summary.worker.profilePicture ? (
                        <img
                          src={summary.worker.profilePicture}
                          alt={summary.worker.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold mr-3">
                          {summary.worker.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{summary.worker.name}</div>
                        <div className="text-sm text-gray-500">₹{summary.worker.dailyWage}/day</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="font-medium">{summary.presentDays}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="font-medium">{summary.absentDays}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="font-medium">{summary.halfDays}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-red-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-medium">{summary.totalAdvance.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center font-bold text-lg">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{summary.netWages.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {workerSummaries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No data available</p>
                      <p className="text-gray-400 text-sm">Add workers and mark attendance to see reports</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
        <h3 className="font-semibold text-indigo-900 mb-2">📋 Report Information:</h3>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Net wages = (Present days × Daily wage) - Advance payments</li>
          <li>• Half days count as 0.5 working days</li>
          <li>• All amounts are calculated automatically based on attendance and payments</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportView;