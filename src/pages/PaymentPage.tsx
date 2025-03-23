
import React from "react";
import Header from "../components/Header";
import PaymentForm from "../components/PaymentForm";

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Update Payments" showBackButton />
      <main className="container mx-auto px-4 py-6">
        <PaymentForm />
      </main>
    </div>
  );
};

export default PaymentPage;
