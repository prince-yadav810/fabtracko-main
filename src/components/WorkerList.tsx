
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, Calendar, IndianRupee } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { format } from "date-fns";

const WorkerList: React.FC = () => {
  const { workers, attendanceRecords, payments, setSelectedWorker } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Get today's date in ISO format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter workers based on search query
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format joining date
  const formatJoiningDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy");
  };

  // Get attendance status for today
  const getAttendanceStatus = (workerId: string) => {
    const record = attendanceRecords.find(
      record => record.workerId === workerId && record.date === today
    );
    return record ? record.status : null;
  };

  // Get recent payment
  const getRecentPayment = (workerId: string) => {
    const workerPayments = payments
      .filter(payment => payment.workerId === workerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return workerPayments.length > 0 ? workerPayments[0] : null;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and Add Worker */}
      <div className="flex space-x-2 items-center mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search workers..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link 
          to="/workers/add"
          className="flex items-center justify-center h-10 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          <span>Add</span>
        </Link>
      </div>

      {/* Workers List */}
      <div className="space-y-3">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => {
            const attendanceStatus = getAttendanceStatus(worker.id);
            const recentPayment = getRecentPayment(worker.id);
            
            return (
              <Link
                key={worker.id}
                to={`/workers/${worker.id}`}
                className="flex items-center p-4 rounded-xl bg-white shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden"
                onClick={() => setSelectedWorker(worker)}
              >
                {/* Worker profile image */}
                <div className="mr-4 flex-shrink-0">
                  {worker.profilePicture ? (
                    <img
                      src={worker.profilePicture}
                      alt={worker.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {worker.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Worker details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold truncate mb-0.5">{worker.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Joined {formatJoiningDate(worker.joiningDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="font-medium">{worker.dailyWage}/day</span>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex mt-2 space-x-2">
                    {attendanceStatus && (
                      <div className={`status-chip status-${attendanceStatus}`}>
                        {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                      </div>
                    )}
                    
                    {recentPayment && (
                      <div className={`status-chip ${recentPayment.type === 'advance' ? 'status-absent' : 'status-overtime'}`}>
                        {recentPayment.type === 'advance' ? 'Advance' : 'Overtime'}: ₹{recentPayment.amount}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No workers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerList;
