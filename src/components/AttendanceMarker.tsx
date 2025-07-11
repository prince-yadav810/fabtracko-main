import React, { useState } from "react";
import { Check, X, Clock, CalendarIcon, Users } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const AttendanceMarker: React.FC = () => {
  const { workers, attendanceRecords, markAttendance } = useAppContext();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Get attendance for the selected date
  const getAttendanceForDate = (workerId: string) => {
    return attendanceRecords.find(
      record => record.workerId === workerId && record.date === date
    )?.status || null;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle attendance status change
  const handleStatusChange = (workerId: string, status: "present" | "absent" | "halfday") => {
    markAttendance(workerId, date, status);
  };

  // Get today's attendance summary
  const todayAttendance = attendanceRecords.filter(record => record.date === date);
  const presentCount = todayAttendance.filter(r => r.status === "present").length;
  const absentCount = todayAttendance.filter(r => r.status === "absent").length;
  const halfdayCount = todayAttendance.filter(r => r.status === "halfday").length;
  const totalMarked = todayAttendance.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date selector with summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-blue-600 text-sm font-medium">{formatDate(date)}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalMarked}/{workers.length}</div>
            <div className="text-blue-500 text-sm">Workers Marked</div>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              id="date"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-green-600">Present</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-red-500">{absentCount}</div>
            <div className="text-xs text-red-500">Absent</div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-yellow-500">{halfdayCount}</div>
            <div className="text-xs text-yellow-500">Half Day</div>
          </div>
        </div>
      </div>

      {/* Workers list */}
      <div className="space-y-4">
        {workers.length > 0 ? (
          workers.map(worker => {
            const currentStatus = getAttendanceForDate(worker.id);
            return (
              <SwipeAttendanceCard
                key={worker.id}
                worker={worker}
                currentStatus={currentStatus}
                onStatusChange={(status) => handleStatusChange(worker.id, status)}
              />
            );
          })
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-2xl">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Workers Found</h3>
            <p className="text-gray-500">Add workers to start marking attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Swipe Attendance Card Component
const SwipeAttendanceCard: React.FC<{
  worker: any;
  currentStatus: string | null;
  onStatusChange: (status: "present" | "absent" | "halfday") => void;
}> = ({ worker, currentStatus, onStatusChange }) => {
  const [swipeAction, setSwipeAction] = useState<string | null>(null);

  const handleSwipe = (status: "present" | "absent" | "halfday") => {
    setSwipeAction(status);
    onStatusChange(status);
    // Reset swipe action after animation
    setTimeout(() => setSwipeAction(null), 300);
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border border-gray-100 transition-all duration-300 ${
      swipeAction ? 'scale-105 shadow-lg' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {worker.profilePicture ? (
            <img
              src={worker.profilePicture}
              alt={worker.name}
              className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg mr-4">
              {worker.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{worker.name}</h3>
            <p className="text-sm text-gray-500">₹{worker.dailyWage}/day</p>
          </div>
        </div>
        
        {/* Current status indicator */}
        {currentStatus && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentStatus === "present" ? "bg-green-100 text-green-700" :
            currentStatus === "absent" ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </div>
        )}
      </div>

      {/* Swipe Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Present - Swipe Right */}
        <button
          onClick={() => handleSwipe("present")}
          className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
            currentStatus === "present" 
              ? "bg-green-500 text-white shadow-lg" 
              : "bg-green-50 hover:bg-green-100 text-green-600"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full mb-2 transition-transform duration-300 group-active:scale-110 ${
              currentStatus === "present" ? "bg-white/20" : "bg-green-100"
            }`}>
              <Check className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Present</span>
          </div>
          
          {/* Swipe indicator */}
          <div className={`absolute inset-y-0 left-0 bg-green-400 transition-all duration-300 ${
            swipeAction === "present" ? "w-full opacity-30" : "w-0 opacity-0"
          }`}></div>
        </button>

        {/* Half Day - Swipe */}
        <button
          onClick={() => handleSwipe("halfday")}
          className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
            currentStatus === "halfday" 
              ? "bg-yellow-500 text-white shadow-lg" 
              : "bg-yellow-50 hover:bg-yellow-100 text-yellow-600"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full mb-2 transition-transform duration-300 group-active:scale-110 ${
              currentStatus === "halfday" ? "bg-white/20" : "bg-yellow-100"
            }`}>
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Half Day</span>
          </div>
          
          {/* Swipe indicator */}
          <div className={`absolute inset-y-0 left-0 bg-yellow-400 transition-all duration-300 ${
            swipeAction === "halfday" ? "w-full opacity-30" : "w-0 opacity-0"
          }`}></div>
        </button>

        {/* Absent - Swipe Left */}
        <button
          onClick={() => handleSwipe("absent")}
          className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
            currentStatus === "absent" 
              ? "bg-red-500 text-white shadow-lg" 
              : "bg-red-50 hover:bg-red-100 text-red-600"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full mb-2 transition-transform duration-300 group-active:scale-110 ${
              currentStatus === "absent" ? "bg-white/20" : "bg-red-100"
            }`}>
              <X className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Absent</span>
          </div>
          
          {/* Swipe indicator */}
          <div className={`absolute inset-y-0 left-0 bg-red-400 transition-all duration-300 ${
            swipeAction === "absent" ? "w-full opacity-30" : "w-0 opacity-0"
          }`}></div>
        </button>
      </div>
    </div>
  );
};

export default AttendanceMarker;