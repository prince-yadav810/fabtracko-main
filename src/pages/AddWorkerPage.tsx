
import React from "react";
import Header from "../components/Header";
import AddWorkerForm from "../components/AddWorkerForm";

const AddWorkerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Add New Worker" showBackButton />
      <main className="container mx-auto px-4 py-6">
        <AddWorkerForm />
      </main>
    </div>
  );
};

export default AddWorkerPage;
