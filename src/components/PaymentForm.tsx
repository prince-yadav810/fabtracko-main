
import React, { useState } from "react";
import { IndianRupee, Calendar } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";

const PaymentForm: React.FC = () => {
  const { workers, addPayment, payments } = useAppContext();
  const [selectedWorker, setSelectedWorker] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorker) {
      toast.error("Please select a worker");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    addPayment({
      workerId: selectedWorker,
      amount: Number(amount),
      type: "advance",
      date,
    });
    
    // Reset form
    setAmount("");
    toast.success("Advance payment added successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <h3 className="text-lg font-semibold mb-4">Add New Payment</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="worker" className="block text-sm font-medium text-muted-foreground mb-1">
                Select Worker
              </label>
              <select
                id="worker"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                required
              >
                <option value="">Select a worker</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="number"
                  id="amount"
                  className="pl-10 w-full p-2 border border-input rounded-md"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-muted-foreground mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="date"
                  id="date"
                  className="pl-10 w-full p-2 border border-input rounded-md"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Add Advance Payment
            </button>
          </form>
        </div>
        
        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          
          <div className="space-y-3">
            {recentPayments.length > 0 ? (
              recentPayments.map(payment => {
                const worker = workers.find(w => w.id === payment.workerId);
                return (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div>
                      <div className="font-medium">{worker?.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(payment.date).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center font-semibold">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {payment.amount}
                      </div>
                      <div className="status-chip mt-1 status-absent">
                        Advance
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No recent payments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
