
import React, { useState } from "react";
import Header from "../components/Header";
import ReportView from "../components/ReportView";
import { useAppContext } from "../context/AppContext";
import WorkerReportView from "../components/WorkerReportView";
import { useParams, useNavigate } from "react-router-dom";

const ReportPage = () => {
  const { workerId } = useParams<{ workerId?: string }>();
  const { workers } = useAppContext();
  const navigate = useNavigate();
  
  // Find selected worker if workerId is provided
  const selectedWorker = workerId ? workers.find(w => w.id === workerId) : null;
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={selectedWorker ? `${selectedWorker.name}'s Report` : "Net Wages & Reports"} 
        showBackButton={true} 
      />
      <main className="container mx-auto px-4 py-6">
        {selectedWorker ? (
          <WorkerReportView workerId={selectedWorker.id} />
        ) : (
          <ReportView />
        )}
      </main>
    </div>
  );
};

export default ReportPage;
