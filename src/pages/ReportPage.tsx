
import React from "react";
import Header from "../components/Header";
import ReportView from "../components/ReportView";

const ReportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Net Wages & Reports" showBackButton />
      <main className="container mx-auto px-4 py-6">
        <ReportView />
      </main>
    </div>
  );
};

export default ReportPage;
