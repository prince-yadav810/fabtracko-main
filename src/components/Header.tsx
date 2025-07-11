import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Home, LogOut } from "lucide-react";
import authService from "@/services/authService";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    // Smart back navigation
    if (location.pathname.includes('/workers/') && location.pathname !== '/workers') {
      // If on worker detail page, go to workers list
      navigate('/workers');
    } else {
      // Otherwise go to home
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 mr-4 rounded-full hover:bg-gray-100 transition-colors py-1 px-2"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Home button - always show except on home page */}
          {location.pathname !== "/" && (
            <button
              onClick={handleHomeClick}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              aria-label="Go to home"
            >
              <Home className="h-5 w-5" />
            </button>
          )}
          
          {/* Date on home page */}
          {location.pathname === "/" && (
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </div>
          )}
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;