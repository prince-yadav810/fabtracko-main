import React from "react";
import { Link } from "react-router-dom";
import { 
  UserCheck, 
  IndianRupee, 
  Users, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Clock,
  Zap
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
  
  // Calculate this month's stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthAttendance = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });
  
  const thisMonthPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  
  const totalWorkingDays = thisMonthAttendance.filter(
    record => record.status === "present" || record.status === "overtime"
  ).length;
  
  const totalAdvanceAmount = thisMonthPayments
    .filter(payment => payment.type === "advance")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/attendance" 
          className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <UserCheck className="h-8 w-8" />
            <Zap className="h-5 w-5 opacity-70" />
          </div>
          <div className="font-semibold text-lg">Mark Attendance</div>
          <div className="text-green-100 text-sm">Quick & Easy</div>
        </Link>
        
        <Link 
          to="/payment" 
          className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <IndianRupee className="h-8 w-8" />
            <Zap className="h-5 w-5 opacity-70" />
          </div>
          <div className="font-semibold text-lg">Add Payment</div>
          <div className="text-blue-100 text-sm">Advance & Overtime</div>
        </Link>
      </div>

      {/* Main Action Cards */}
      <div className="space-y-4">
        {/* Attendance Card */}
        <Link to="/attendance" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-xl p-3 mr-4">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
                  <p className="text-gray-500 text-sm">Daily tracking</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Today's Status</span>
                <span className="text-sm text-gray-500">{totalMarked} of {totalWorkers} marked</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalWorkers > 0 ? (totalMarked / totalWorkers) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{presentCount}</div>
                  <div className="text-xs text-gray-500">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">{absentCount}</div>
                  <div className="text-xs text-gray-500">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-500">{halfdayCount}</div>
                  <div className="text-xs text-gray-500">Half Day</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">{overtimeCount}</div>
                  <div className="text-xs text-gray-500">Overtime</div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Workers Card */}
        <Link to="/workers" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-xl p-3 mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Workers</h3>
                  <p className="text-gray-500 text-sm">Manage team</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Total Workers</span>
                <span className="text-2xl font-bold text-purple-600">{workers.length}</span>
              </div>
              
              {workers.length > 0 ? (
                <div className="space-y-2">
                  {workers.slice(0, 2).map(worker => (
                    <div key={worker.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                      <div className="flex items-center">
                        {worker.profilePicture ? (
                          <img
                            src={worker.profilePicture}
                            alt={worker.name}
                            className="h-8 w-8 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm mr-3">
                            {worker.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-sm">{worker.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">₹{worker.dailyWage}/day</span>
                    </div>
                  ))}
                  {workers.length > 2 && (
                    <div className="text-center text-sm text-gray-500 py-1">
                      +{workers.length - 2} more workers
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No workers added yet</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Payments Card */}
        <Link to="/payment" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-xl p-3 mr-4">
                  <IndianRupee className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
                  <p className="text-gray-500 text-sm">Advance & overtime</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">₹{totalAdvanceAmount}</div>
                  <div className="text-xs text-gray-500">Advance This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">{thisMonthPayments.length}</div>
                  <div className="text-xs text-gray-500">Total Payments</div>
                </div>
              </div>
              
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 2)
                    .map(payment => {
                      const worker = workers.find(w => w.id === payment.workerId);
                      return (
                        <div key={payment.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                              payment.type === 'advance' ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                              ₹
                            </div>
                            <div>
                              <div className="font-medium text-sm">{worker?.name}</div>
                              <div className="text-xs text-gray-500 capitalize">{payment.type}</div>
                            </div>
                          </div>
                          <span className="font-bold text-sm">₹{payment.amount}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No payments recorded</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Reports Card */}
        <Link to="/reports" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-xl p-3 mr-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                  <p className="text-gray-500 text-sm">Wages & analytics</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">This Month</span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{totalWorkingDays}</div>
                  <div className="text-xs text-gray-500">Working Days</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{workers.length}</div>
                  <div className="text-xs text-gray-500">Active Workers</div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-center text-orange-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Generate detailed reports</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
        <h3 className="text-lg font-bold mb-2">Need Help?</h3>
        <p className="text-indigo-100 text-sm mb-4">
          Manage your workforce efficiently with our comprehensive tools
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/workers" 
            className="bg-white/20 rounded-xl py-3 px-4 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Manage Workers
          </Link>
          <Link 
            to="/payment" 
            className="bg-white/20 rounded-xl py-3 px-4 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Add Payment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;