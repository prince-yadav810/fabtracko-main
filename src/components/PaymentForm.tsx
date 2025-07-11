import React, { useState } from "react";
import { IndianRupee, Calendar, ArrowRight, CreditCard, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";

const PaymentForm: React.FC = () => {
  const { workers, addPayment, payments } = useAppContext();
  const [selectedWorker, setSelectedWorker] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"advance">("advance");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate today's payments summary
  const todayPayments = payments.filter(p => p.date === new Date().toISOString().split('T')[0]);
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorker) {
      toast.error("Please select a worker");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addPayment({
        workerId: selectedWorker,
        amount: Number(amount),
        type: "advance",
        date,
      });
      
      // Reset form
      setAmount("");
      
      const worker = workers.find(w => w.id === selectedWorker);
      toast.success(`Advance payment of ₹${amount} added for ${worker?.name}! 💰`);
    } catch (error) {
      toast.error("Failed to add payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Payment Management</h2>
            <p className="text-blue-100 text-sm">Record advance and overtime payments</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">₹{todayTotal.toLocaleString()}</div>
            <div className="text-blue-100 text-sm">Today's Total</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{todayPayments.length}</div>
            <div className="text-blue-100 text-xs">Payments Today</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{workers.length}</div>
            <div className="text-blue-100 text-xs">Total Workers</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-xl p-3 mr-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Add Advance Payment</h3>
              <p className="text-gray-500 text-sm">Record advance payment for worker</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Worker Selection */}
            <div>
              <label htmlFor="worker" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Select Worker
              </label>
              <select
                id="worker"
                className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 text-lg"
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                required
              >
                <option value="">Choose a worker</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - ₹{worker.dailyWage}/day
                  </option>
                ))}
              </select>
            </div>
            
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <IndianRupee className="h-4 w-4 mr-2" />
                Payment Amount
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="amount"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 text-lg"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
            </div>
            
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Payment Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 text-lg"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding Payment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Add Payment
                </div>
              )}
            </button>
          </form>
        </div>
        
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 rounded-xl p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recent Payments</h3>
              <p className="text-gray-500 text-sm">Latest payment transactions</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentPayments.length > 0 ? (
              recentPayments.map(payment => {
                const worker = workers.find(w => w.id === payment.workerId);
                return (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      {worker?.profilePicture ? (
                        <img
                          src={worker.profilePicture}
                          alt={worker.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                          {worker?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{worker?.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(payment.date).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center font-bold text-lg">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {payment.amount.toLocaleString()}
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Advance
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-xl">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">No payments recorded yet</p>
                <p className="text-gray-400 text-sm">Start by adding your first payment above</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-2">💡 Payment Tips:</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• <strong>Advance:</strong> Money given to workers before work is completed</li>
          <li>• Advance payments are automatically deducted from wage calculations</li>
          <li>• All payments are tracked and included in monthly reports</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentForm;