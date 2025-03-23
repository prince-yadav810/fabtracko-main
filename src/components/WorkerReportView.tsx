
import React, { useState } from "react";
import { 
  Calendar, 
  Download, 
  Printer, 
  IndianRupee, 
  ArrowLeft, 
  ArrowRight,
  Check,
  X,
  Clock,
  Clock3
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { 
  format, 
  addMonths, 
  isSameMonth, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isWeekend
} from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkerReportViewProps {
  workerId: string;
}

const WorkerReportView: React.FC<WorkerReportViewProps> = ({ workerId }) => {
  const { 
    workers, 
    attendanceRecords, 
    payments, 
    calculateNetWages 
  } = useAppContext();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get worker details
  const worker = workers.find(w => w.id === workerId);
  
  if (!worker) {
    return <div className="text-center p-8">Worker not found</div>;
  }
  
  // Get current month and year
  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();
  
  // Get worker attendance for the month
  const monthAttendance = attendanceRecords.filter(record => 
    record.workerId === worker.id && 
    new Date(record.date).getMonth() === currentMonthIndex && 
    new Date(record.date).getFullYear() === currentYear
  );
  
  // Get worker payments for the month
  const monthPayments = payments.filter(payment => 
    payment.workerId === worker.id && 
    new Date(payment.date).getMonth() === currentMonthIndex && 
    new Date(payment.date).getFullYear() === currentYear
  );
  
  // Calculate net wages for the month
  const netWages = calculateNetWages(worker.id, currentMonthIndex, currentYear);
  
  // Days in month for calendar view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate statistics
  const presentDays = monthAttendance.filter(record => record.status === "present").length;
  const absentDays = monthAttendance.filter(record => record.status === "absent").length;
  const halfDays = monthAttendance.filter(record => record.status === "halfday").length;
  const overtimeDays = monthAttendance.filter(record => record.status === "overtime").length;
  
  // Calculate payment totals
  const totalAdvance = monthPayments
    .filter(payment => payment.type === "advance")
    .reduce((sum, payment) => sum + payment.amount, 0);
    
  const totalOvertime = monthPayments
    .filter(payment => payment.type === "overtime")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
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
  
  // Get attendance status for a specific date
  const getDateAttendance = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.find(
      record => record.workerId === worker.id && record.date === dateStr
    )?.status || null;
  };
  
  // Handle download/print report
  const handleDownloadReport = () => {
    toast.success(`${worker.name}'s report downloaded successfully`);
    // In a real app, this would generate a PDF or Excel file for the worker
  };
  
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Worker profile header */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            {worker.profilePicture ? (
              <img
                src={worker.profilePicture}
                alt={worker.name}
                className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-sm mr-5"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl mr-5">
                {worker.name.charAt(0)}
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold">{worker.name}</h2>
              <div className="flex items-center mt-1 text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {format(new Date(worker.joiningDate), "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center mt-1 text-muted-foreground">
                <IndianRupee className="h-4 w-4 mr-1" />
                <span>Daily Wage: ₹{worker.dailyWage}</span>
              </div>
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
          <h3 className="text-lg font-semibold">Monthly Summary</h3>
          <div className="text-sm text-muted-foreground">
            Worker's wage summary for {format(currentMonth, "MMMM yyyy")}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Present Days</div>
              <div className="text-2xl font-semibold flex items-center">
                <div className="h-4 w-4 rounded-full bg-[#F2FCE2] mr-2 border border-[#68B545]"></div>
                {presentDays + overtimeDays}
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Absent Days</div>
              <div className="text-2xl font-semibold flex items-center">
                <div className="h-4 w-4 rounded-full bg-[#ea384c] mr-2"></div>
                {absentDays}
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Half Days</div>
              <div className="text-2xl font-semibold flex items-center">
                <div className="h-4 w-4 rounded-full bg-[#FEF7CD] mr-2 border border-[#F8DC68]"></div>
                {halfDays}
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Overtime Days</div>
              <div className="text-2xl font-semibold flex items-center">
                <div className="h-4 w-4 rounded-full bg-status-overtime mr-2"></div>
                {overtimeDays}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 rounded-lg p-4 border border-border md:col-span-1">
              <div className="text-sm text-muted-foreground mb-1">Advance Taken</div>
              <div className="text-xl font-semibold flex items-center text-[#ea384c]">
                <IndianRupee className="h-4 w-4 mr-1" />
                {totalAdvance}
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 border border-border md:col-span-1">
              <div className="text-sm text-muted-foreground mb-1">Overtime Pay</div>
              <div className="text-xl font-semibold flex items-center text-status-overtime">
                <IndianRupee className="h-4 w-4 mr-1" />
                {totalOvertime}
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/30 md:col-span-1">
              <div className="text-sm font-medium mb-1">Net Wages</div>
              <div className="text-xl font-semibold flex items-center text-primary">
                <IndianRupee className="h-4 w-4 mr-1" />
                {netWages}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Calendar Section */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Attendance Calendar</h3>
          <div className="text-sm text-muted-foreground">
            Daily attendance record for {format(currentMonth, "MMMM yyyy")}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-xs text-center font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-6">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-start-${index}`} className="aspect-square"></div>
            ))}
            
            {/* Days of the month */}
            {daysInMonth.map(day => {
              const status = getDateAttendance(day);
              const isWeekendDay = isWeekend(day);
              let bgColor = "";
              let textColor = "";
              let borderColor = "";
              
              if (status === "present") {
                bgColor = "bg-[#F2FCE2]";
                borderColor = "border-[#68B545]";
              } else if (status === "absent") {
                bgColor = "bg-[#ea384c]/10";
                borderColor = "border-[#ea384c]";
                textColor = "text-[#ea384c]";
              } else if (status === "halfday") {
                bgColor = "bg-[#FEF7CD]";
                borderColor = "border-[#F8DC68]";
              } else if (status === "overtime") {
                bgColor = "bg-status-overtime/10";
                borderColor = "border-status-overtime";
                textColor = "text-status-overtime";
              }
              
              const dayClass = isWeekendDay && !status
                ? "bg-muted/20 border-muted"
                : `${bgColor} ${textColor} border-${borderColor}`;
              
              return (
                <div 
                  key={day.toString()} 
                  className="aspect-square flex items-center justify-center p-1"
                >
                  <div 
                    className={`h-full w-full flex flex-col items-center justify-center rounded-md border ${
                      status ? borderColor || "border-transparent" : isWeekendDay ? "border-muted" : "border-transparent"
                    } ${bgColor} ${textColor} text-sm relative`}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    
                    {status && (
                      <div className="absolute bottom-1 right-1">
                        {status === "present" && <Check className="h-3 w-3 text-[#68B545]" />}
                        {status === "absent" && <X className="h-3 w-3 text-[#ea384c]" />}
                        {status === "halfday" && <Clock className="h-3 w-3 text-[#F8DC68]" />}
                        {status === "overtime" && <Clock3 className="h-3 w-3 text-status-overtime" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Empty cells for days after the end of the month */}
            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
              <div key={`empty-end-${index}`} className="aspect-square"></div>
            ))}
          </div>
          
          <div className="flex items-center space-x-6 justify-center text-sm mb-3">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-[#F2FCE2] border border-[#68B545] mr-1.5"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-[#ea384c]/10 border border-[#ea384c] mr-1.5"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-[#FEF7CD] border border-[#F8DC68] mr-1.5"></div>
              <span>Half-day</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-status-overtime/10 border border-status-overtime mr-1.5"></div>
              <span>Overtime</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Details Section */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Payment Details</h3>
          <div className="text-sm text-muted-foreground">
            Payment records for {format(currentMonth, "MMMM yyyy")}
          </div>
        </div>
        
        <div className="p-6">
          {monthPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthPayments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {format(new Date(payment.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.type === 'advance' 
                            ? 'bg-[#ea384c]/10 text-[#ea384c]'
                            : 'bg-status-overtime/10 text-status-overtime'
                        }`}>
                          {payment.type === 'advance' ? 'Advance' : 'Overtime'}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {payment.amount}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.type === 'advance' 
                          ? 'Advance payment requested by worker'
                          : 'Overtime payment for extra work'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No payment records for this month</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Attendance Details Section */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Attendance Details</h3>
          <div className="text-sm text-muted-foreground">
            Daily attendance log for {format(currentMonth, "MMMM yyyy")}
          </div>
        </div>
        
        <div className="p-6">
          {monthAttendance.length > 0 ? (
            <div className="space-y-3">
              {monthAttendance
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(record => (
                  <div 
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        record.status === "present" ? "bg-[#68B545] text-white" :
                        record.status === "absent" ? "bg-[#ea384c] text-white" :
                        record.status === "halfday" ? "bg-[#F8DC68] text-white" :
                        "bg-status-overtime text-white"
                      }`}>
                        {record.status === "present" && <Check className="h-4 w-4" />}
                        {record.status === "absent" && <X className="h-4 w-4" />}
                        {record.status === "halfday" && <Clock className="h-4 w-4" />}
                        {record.status === "overtime" && <Clock3 className="h-4 w-4" />}
                      </div>
                      
                      <div>
                        <div className="font-medium capitalize">
                          {record.status}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(record.date), "EEEE, dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      {record.status === "present" && "Full day present"}
                      {record.status === "absent" && "Marked as absent"}
                      {record.status === "halfday" && "Half day worked"}
                      {record.status === "overtime" && "Worked overtime"}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No attendance records for this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerReportView;
