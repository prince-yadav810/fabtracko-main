
import React from "react";
import Header from "../components/Header";
import WorkerList from "../components/WorkerList";
import WorkerDetail from "../components/WorkerDetail";
import { useParams } from "react-router-dom";

const WorkerPage = () => {
  const { workerId } = useParams<{ workerId?: string }>();
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={workerId ? "Worker Details" : "Workers"} 
        showBackButton={!!workerId}
      />
      <main className="container mx-auto px-4 py-6">
        {workerId ? <WorkerDetail /> : <WorkerList />}
      </main>
    </div>
  );
};

export default WorkerPage;
