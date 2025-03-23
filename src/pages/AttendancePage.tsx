
import React from "react";
import Header from "../components/Header";
import AttendanceMarker from "../components/AttendanceMarker";

const AttendancePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Mark Attendance" showBackButton />
      <main className="container mx-auto px-4 py-6">
        <AttendanceMarker />
      </main>
    </div>
  );
};

export default AttendancePage;
