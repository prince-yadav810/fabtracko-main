import React from "react";
import Header from "../components/Header";
import HomeScreen from "../components/HomeScreen";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Vikas Fabrication Works" />
      <main className="container mx-auto px-4 py-6">
        <HomeScreen />
      </main>
    </div>
  );
};

export default Index;