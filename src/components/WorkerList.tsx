import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, Calendar, IndianRupee, Users, TrendingUp, User } from "lucide-react";
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

  // Calculate stats
  const todayAttendance = attendanceRecords.filter(record => record.date === today);
  const presentToday = todayAttendance.filter(r => r.status === "present").length;
  const totalWorkers = workers.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Workers Management</h2>
            <p className="text-indigo-100 text-sm">Manage your team and track performance</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <div className="text-indigo-100 text-sm">Total Workers</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{presentToday}</div>
            <div className="text-indigo-100 text-xs">Present Today</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{totalWorkers - presentToday}</div>
            <div className="text-indigo-100 text-xs">Not Marked</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{payments.length}</div>
            <div className="text-indigo-100 text-xs">Total Payments</div>
          </div>
        </div>
      </div>

      {/* Search and Add Worker */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers by name..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link 
            to="/workers/add"
            className="flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            <span>Add Worker</span>
          </Link>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="space-y-4">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => {
            const attendanceStatus = getAttendanceStatus(worker.id);
            const recentPayment = getRecentPayment(worker.id);
            
            return (
              <Link
                key={worker.id}
                to={`/workers/${worker.id}`}
                className="block bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 transform hover:scale-[1.02]"
                onClick={() => setSelectedWorker(worker)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {/* Profile Image */}
                    <div className="mr-4 flex-shrink-0">
                      {worker.profilePicture ? (
                        <img
                          src={worker.profilePicture}
                          alt={worker.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100 shadow-md"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-100">
                          {worker.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Worker Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-2 md:mb-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{worker.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Joined {formatJoiningDate(worker.joiningDate)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-green-50 rounded-xl px-3 py-2 mr-4">
                            <div className="flex items-center text-green-700">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              <span className="font-bold">{worker.dailyWage}</span>
                              <span className="text-xs ml-1">per day</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status indicators */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {attendanceStatus && (
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            attendanceStatus === "present" ? "bg-green-100 text-green-700" :
                            attendanceStatus === "absent" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)} Today
                          </div>
                        )}
                        
                        {recentPayment && (
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Recent Advance: ₹{recentPayment.amount}
                          </div>
                        )}

                        {!attendanceStatus && (
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Not marked today
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="ml-4 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                      <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl shadow-md border border-gray-100">
            {searchQuery ? (
              <>
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-500 mb-4">No workers match your search "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first worker to the team</p>
                <Link
                  to="/workers/add"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Your First Worker
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {workers.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{workers.length}</div>
              <div className="text-sm text-gray-600">Total Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentToday}</div>
              <div className="text-sm text-gray-600">Present Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
              <div className="text-sm text-gray-600">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{Math.round(workers.reduce((sum, w) => sum + w.dailyWage, 0) / workers.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Daily Wage</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerList;