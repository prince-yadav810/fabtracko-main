
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Calendar, 
  IndianRupee, 
  Clock, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  ArrowRight,
  X,
  Check
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth } from "date-fns";
import { toast } from "sonner";

const WorkerDetail: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { 
    workers, 
    getWorkerAttendance, 
    getWorkerPayments, 
    calculateNetWages,
    attendanceRecords,
    deleteWorker
  } = useAppContext();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "payments">("overview");
  
  // Get worker details
  const worker = workers.find(w => w.id === workerId);
  
  if (!worker) {
    return (
      <div className="text-center p-8">
        <p>Worker not found</p>
        <button 
          onClick={() => navigate('/workers')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Workers List
        </button>
      </div>
    );
  }
  
  // Get current month and year
  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();
  
  // Get attendance records for the month
  const monthAttendance = getWorkerAttendance(worker.id, currentMonthIndex, currentYear);
  
  // Get payment records for the month
  const monthPayments = getWorkerPayments(worker.id, currentMonthIndex, currentYear);
  
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
  
  // Calculate totals for payments
  const totalAdvance = monthPayments
    .filter(payment => payment.type === "advance")
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
  
  // Handle delete worker
  const handleDeleteWorker = () => {
    if (confirm(`Are you sure you want to delete ${worker.name}?`)) {
      deleteWorker(worker.id);
      toast.success(`Worker ${worker.name} deleted successfully`);
      navigate('/workers');
    }
  };
  
  // Get attendance status for a specific date
  const getDateAttendance = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.find(
      record => record.workerId === worker.id && record.date === dateStr
    )?.status || null;
  };

  return (
    <div className="animate-fade-in">
      {/* Worker profile header */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {worker.profilePicture ? (
              <img
                src={worker.profilePicture}
                alt={worker.name}
                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-sm mr-5"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl mr-5">
                {worker.name.charAt(0)}
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-semibold">{worker.name}</h2>
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
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/workers/edit/${worker.id}`)}
              className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteWorker}
              className="flex items-center justify-center rounded-full p-2 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
              activeTab === "overview" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
              activeTab === "attendance" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
              activeTab === "payments" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Payments
          </button>
        </div>
        
        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <h3 className="text-lg font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className={`flex items-center text-sm ${
                isSameMonth(addMonths(currentMonth, 1), new Date()) || addMonths(currentMonth, 1) > new Date()
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }`}
              disabled={isSameMonth(addMonths(currentMonth, 1), new Date()) || addMonths(currentMonth, 1) > new Date()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {/* Overview Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Present Days</div>
                  <div className="text-2xl font-semibold">{presentDays}</div>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Absent Days</div>
                  <div className="text-2xl font-semibold">{absentDays}</div>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Half Days</div>
                  <div className="text-2xl font-semibold">{halfDays}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/20 rounded-lg p-4 border border-border md:col-span-1">
                  <div className="text-sm text-muted-foreground mb-1">Advance Taken</div>
                  <div className="text-xl font-semibold flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {totalAdvance}
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
              
              <div className="bg-white rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium mb-3">Attendance Calendar</h4>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-xs text-center font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the first of the month */}
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="aspect-square"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {daysInMonth.map(day => {
                    const status = getDateAttendance(day);
                    const dayClass = status ? `calendar-day ${status}` : "calendar-day";
                    
                    return (
                      <div 
                        key={day.toString()} 
                        className="aspect-square flex items-center justify-center"
                      >
                        <div className={dayClass}>
                          {format(day, "d")}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty cells for days after the end of the month */}
                  {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                    <div key={`empty-end-${index}`} className="aspect-square"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Attendance Tab Content */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-status-present"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-status-absent"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-4 w-4 rounded-full bg-status-halfday"></div>
                  <span>Half-day</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-7 gap-1 p-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-xs text-center font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 p-4 pt-0">
                  {/* Empty cells for days before the first of the month */}
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="aspect-square"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {daysInMonth.map(day => {
                    const status = getDateAttendance(day);
                    const statusClass = status ? status : "";
                    
                    return (
                      <div 
                        key={day.toString()} 
                        className="aspect-square flex items-center justify-center relative"
                      >
                        <div 
                          className={`calendar-day ${statusClass === "present" ? "present" : 
                          statusClass === "absent" ? "absent" : 
                          statusClass === "halfday" ? "halfday" : "bg-muted"}`}
                        >
                          {format(day, "d")}
                        </div>
                        
                        {status && (
                          <div className="absolute bottom-0 right-0">
                            {status === "present" && <Check className="h-3 w-3 text-status-present" />}
                            {status === "absent" && <X className="h-3 w-3 text-status-absent" />}
                            {status === "halfday" && <Clock className="h-3 w-3 text-status-halfday" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Empty cells for days after the end of the month */}
                  {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                    <div key={`empty-end-${index}`} className="aspect-square"></div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-medium">Attendance Details</h4>
                
                {monthAttendance.length > 0 ? (
                  monthAttendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(record => (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                      >
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                            record.status === "present" ? "bg-status-present text-white" :
                            record.status === "absent" ? "bg-status-absent text-white" :
                            "bg-status-halfday text-white"
                          }`}>
                            {record.status === "present" && <Check className="h-4 w-4" />}
                            {record.status === "absent" && <X className="h-4 w-4" />}
                            {record.status === "halfday" && <Clock className="h-4 w-4" />}
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
                      </div>
                    ))
                ) : (
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No attendance records for this month</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Payments Tab Content */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Total Advance</div>
                <div className="text-xl font-semibold flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalAdvance}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Payment History</h4>
                
                {monthPayments.length > 0 ? (
                  monthPayments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(payment => (
                      <div 
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3 bg-status-absent text-white">
                            <IndianRupee className="h-4 w-4" />
                          </div>
                          
                          <div>
                            <div className="font-medium capitalize">
                              Advance Payment
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(payment.date), "EEEE, dd MMM yyyy")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-lg font-semibold">
                          ₹{payment.amount}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No payment records for this month</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDetail;
