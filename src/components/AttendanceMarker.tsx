
import React, { useState } from "react";
import { Check, X, Clock, Clock3 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { format } from "date-fns";

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
  const handleStatusChange = (workerId: string, status: "present" | "absent" | "halfday" | "overtime") => {
    markAttendance(workerId, date, status);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Date selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-muted-foreground mb-2">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          className="w-full p-2 border border-input rounded-md"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // Can't select future dates
        />
        <div className="mt-2 text-sm font-medium">
          {formatDate(date)}
        </div>
      </div>

      {/* Attendance list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Mark Attendance</h3>
        
        {workers.map(worker => {
          const currentStatus = getAttendanceForDate(worker.id);
          return (
            <div key={worker.id} className="bg-white rounded-lg shadow-sm p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {worker.profilePicture ? (
                    <img
                      src={worker.profilePicture}
                      alt={worker.name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      {worker.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{worker.name}</h4>
                    <div className="text-sm text-muted-foreground">₹{worker.dailyWage}/day</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStatus === "present" 
                        ? "bg-status-present text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => handleStatusChange(worker.id, "present")}
                    title="Present"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  
                  <button
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStatus === "absent" 
                        ? "bg-status-absent text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => handleStatusChange(worker.id, "absent")}
                    title="Absent"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  <button
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStatus === "halfday" 
                        ? "bg-status-halfday text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => handleStatusChange(worker.id, "halfday")}
                    title="Half Day"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
                  
                  <button
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStatus === "overtime" 
                        ? "bg-status-overtime text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => handleStatusChange(worker.id, "overtime")}
                    title="Overtime"
                  >
                    <Clock3 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {currentStatus && (
                <div className="mt-3 text-sm">
                  <span className="text-muted-foreground">Status:</span> 
                  <span className={`ml-2 status-chip status-${currentStatus}`}>
                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        
        {workers.length === 0 && (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No workers found. Add workers to mark attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarker;
