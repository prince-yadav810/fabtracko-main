
import React from "react";
import { Link } from "react-router-dom";
import { 
  UserCheck, 
  IndianRupee, 
  Users, 
  FileText, 
  ChevronRight 
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const HomeScreen: React.FC = () => {
  const { workers, attendanceRecords, payments } = useAppContext();
  
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // Count today's attendance
  const todayAttendance = attendanceRecords.filter(
    record => record.date === today
  );
  
  const presentCount = todayAttendance.filter(
    record => record.status === "present" || record.status === "overtime"
  ).length;
  
  const absentCount = todayAttendance.filter(
    record => record.status === "absent"
  ).length;
  
  const halfdayCount = todayAttendance.filter(
    record => record.status === "halfday"
  ).length;
  
  const overtimeCount = todayAttendance.filter(
    record => record.status === "overtime"
  ).length;
  
  // Calculate total marked vs total workers
  const totalMarked = todayAttendance.length;
  const totalWorkers = workers.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Tile */}
        <Link to="/attendance" className="tile">
          <UserCheck className="tile-icon" />
          <h2 className="text-lg font-semibold mb-2">Mark Today's Attendance</h2>
          <p className="text-muted-foreground mb-4">Record daily worker attendance</p>
          
          <div className="mt-auto">
            <div className="text-sm text-muted-foreground mb-2">
              {totalMarked} of {totalWorkers} workers marked today
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center">
                <div className="status-chip status-present mx-auto mb-1">
                  {presentCount}
                </div>
                <span className="text-xs">Present</span>
              </div>
              
              <div className="text-center">
                <div className="status-chip status-absent mx-auto mb-1">
                  {absentCount}
                </div>
                <span className="text-xs">Absent</span>
              </div>
              
              <div className="text-center">
                <div className="status-chip status-halfday mx-auto mb-1">
                  {halfdayCount}
                </div>
                <span className="text-xs">Half-day</span>
              </div>
              
              <div className="text-center">
                <div className="status-chip status-overtime mx-auto mb-1">
                  {overtimeCount}
                </div>
                <span className="text-xs">Overtime</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end text-sm text-primary font-medium">
              <span>Mark Attendance</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>
        
        {/* Payments Tile */}
        <Link to="/payment" className="tile">
          <IndianRupee className="tile-icon" />
          <h2 className="text-lg font-semibold mb-2">Update Payment</h2>
          <p className="text-muted-foreground mb-4">Record advance and overtime payments</p>
          
          <div className="mt-auto">
            <div className="text-sm text-muted-foreground mb-2">
              Recent payments
            </div>
            
            <div className="space-y-2 mb-3">
              {payments.length > 0 ? (
                payments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 2)
                  .map(payment => {
                    const worker = workers.find(w => w.id === payment.workerId);
                    return (
                      <div key={payment.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{worker?.name}</span>
                        <div className="flex items-center">
                          <span className="mr-2">₹{payment.amount}</span>
                          <span className={`status-chip ${payment.type === 'advance' ? 'status-absent' : 'status-overtime'}`}>
                            {payment.type === 'advance' ? 'Advance' : 'Overtime'}
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-sm text-muted-foreground">No recent payments</div>
              )}
            </div>
            
            <div className="flex items-center justify-end text-sm text-primary font-medium">
              <span>Update Payments</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>
        
        {/* Workers Tile */}
        <Link to="/workers" className="tile">
          <Users className="tile-icon" />
          <h2 className="text-lg font-semibold mb-2">Workers</h2>
          <p className="text-muted-foreground mb-4">Manage worker profiles and records</p>
          
          <div className="mt-auto">
            <div className="text-sm text-muted-foreground mb-2">
              {workers.length} workers registered
            </div>
            
            <div className="space-y-2 mb-3">
              {workers.slice(0, 2).map(worker => (
                <div key={worker.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{worker.name}</span>
                  <span className="text-muted-foreground">₹{worker.dailyWage}/day</span>
                </div>
              ))}
              
              {workers.length > 2 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{workers.length - 2} more
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end text-sm text-primary font-medium">
              <span>View All Workers</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>
        
        {/* Reports Tile */}
        <Link to="/reports" className="tile">
          <FileText className="tile-icon" />
          <h2 className="text-lg font-semibold mb-2">Net Wages & Reports</h2>
          <p className="text-muted-foreground mb-4">Calculate wages and generate reports</p>
          
          <div className="mt-auto">
            <div className="text-sm text-muted-foreground mb-2">
              Monthly summaries and wages
            </div>
            
            <div className="rounded-lg border p-3 mb-3 bg-secondary/50">
              <div className="text-sm font-medium mb-1">Current Month Summary</div>
              <div className="flex justify-between text-sm">
                <span>Total Days Worked</span>
                <span className="font-medium">{attendanceRecords.filter(record => 
                  new Date(record.date).getMonth() === new Date().getMonth() && 
                  (record.status === "present" || record.status === "overtime")
                ).length} days</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end text-sm text-primary font-medium">
              <span>View Reports</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomeScreen;
