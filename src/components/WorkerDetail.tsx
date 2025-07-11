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
  Check,
  User,
  TrendingUp,
  BarChart3,
  DollarSign
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isBefore, isAfter } from "date-fns";
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
      <div className="text-center p-8 bg-white rounded-2xl shadow-md">
        <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Worker not found</h2>
        <p className="text-gray-500 mb-4">The worker you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/workers')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
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
  
  // Get payment records for the month (only advance now)
  const monthPayments = getWorkerPayments(worker.id, currentMonthIndex, currentYear);
  
  // Calculate net wages for the month
  const netWages = calculateNetWages(worker.id, currentMonthIndex, currentYear);
  
  // Days in month for calendar view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate statistics (remove overtime)
  const presentDays = monthAttendance.filter(record => record.status === "present").length;
  const absentDays = monthAttendance.filter(record => record.status === "absent").length;
  const halfDays = monthAttendance.filter(record => record.status === "halfday").length;
  
  // Calculate totals for payments (only advance now)
  const totalAdvance = monthPayments
    .filter(payment => payment.type === "advance")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Handle month navigation - FIXED BUG
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
  
  // Check if next button should be disabled - FIXED
  const isNextDisabled = () => {
    const nextMonth = addMonths(currentMonth, 1);
    const today = new Date();
    return isAfter(nextMonth, today);
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
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {worker.profilePicture ? (
              <img
                src={worker.profilePicture}
                alt={worker.name}
                className="h-20 w-20 rounded-full object-cover border-4 border-white/20 shadow-lg mr-6"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl mr-6">
                {worker.name.charAt(0)}
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold">{worker.name}</h2>
              <div className="flex items-center mt-2 text-purple-100">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Joined {format(new Date(worker.joiningDate), "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center mt-1 text-purple-100">
                <IndianRupee className="h-4 w-4 mr-2" />
                <span>Daily Wage: ₹{worker.dailyWage}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/workers/edit/${worker.id}`)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteWorker}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigation Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous Month
          </button>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <p className="text-sm text-gray-500">Monthly Report</p>
          </div>
          
          <button
            onClick={handleNextMonth}
            disabled={isNextDisabled()}
            className={`flex items-center px-4 py-2 rounded-xl transition-colors ${
              isNextDisabled()
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Next Month
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-xl p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{presentDays}</div>
          <div className="text-sm text-gray-500">Present Days</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 rounded-xl p-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <BarChart3 className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{absentDays}</div>
          <div className="text-sm text-gray-500">Absent Days</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 rounded-xl p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <BarChart3 className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{halfDays}</div>
          <div className="text-sm text-gray-500">Half Days</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <IndianRupee className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">₹{netWages}</div>
          <div className="text-sm text-gray-500">Net Wages</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === "overview" 
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === "attendance" 
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === "payments" 
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payments
          </button>
        </div>
        
        <div className="p-6">
          {/* Overview Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
                    Monthly Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Working Days:</span>
                      <span className="font-semibold">{presentDays + halfDays * 0.5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advance Taken:</span>
                      <span className="font-semibold">₹{totalAdvance}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="text-gray-900 font-semibold">Net Wages:</span>
                      <span className="font-bold text-lg text-green-600">₹{netWages}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                    Attendance Calendar
                  </h4>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-xs text-center font-medium text-gray-500 p-1">
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
                      return (
                        <div 
                          key={day.toString()} 
                          className="aspect-square flex items-center justify-center"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                            status === "present" ? "bg-green-500 text-white" :
                            status === "absent" ? "bg-red-500 text-white" :
                            status === "halfday" ? "bg-yellow-500 text-white" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {format(day, "d")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Attendance Tab Content */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3 bg-green-50 rounded-xl p-4">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  <span className="text-green-700 font-medium">Present</span>
                </div>
                <div className="flex items-center space-x-3 bg-red-50 rounded-xl p-4">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                  <span className="text-red-700 font-medium">Absent</span>
                </div>
                <div className="flex items-center space-x-3 bg-yellow-50 rounded-xl p-4">
                  <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                  <span className="text-yellow-700 font-medium">Half Day</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Attendance Details</h4>
                
                {monthAttendance.length > 0 ? (
                  monthAttendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(record => (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                            record.status === "present" ? "bg-green-500 text-white" :
                            record.status === "absent" ? "bg-red-500 text-white" :
                            "bg-yellow-500 text-white"
                          }`}>
                            {record.status === "present" && <Check className="h-5 w-5" />}
                            {record.status === "absent" && <X className="h-5 w-5" />}
                            {record.status === "halfday" && <Clock className="h-5 w-5" />}
                          </div>
                          
                          <div>
                            <div className="font-semibold capitalize text-gray-900">
                              {record.status}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(record.date), "EEEE, dd MMM yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center p-12 bg-gray-50 rounded-xl">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No attendance records for this month</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Payments Tab Content */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-red-100 rounded-xl p-3 mr-4">
                      <DollarSign className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-red-900">Total Advance</h4>
                      <p className="text-red-700 text-sm">Money given in advance</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-red-600">₹{totalAdvance}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Payment History</h4>
                
                {monthPayments.length > 0 ? (
                  monthPayments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(payment => (
                      <div 
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4 bg-red-500 text-white">
                            <IndianRupee className="h-5 w-5" />
                          </div>
                          
                          <div>
                            <div className="font-semibold text-gray-900">
                              Advance Payment
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(payment.date), "EEEE, dd MMM yyyy")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xl font-bold text-red-600">
                          ₹{payment.amount}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center p-12 bg-gray-50 rounded-xl">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No payment records for this month</p>
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