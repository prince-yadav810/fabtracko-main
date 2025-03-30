
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-primary mr-4 rounded-full hover:bg-gray-50 transition-colors py-1"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
        
        {location.pathname === "/" && (
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
