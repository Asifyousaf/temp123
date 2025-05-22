
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Dumbbell className="h-6 w-6 text-purple-600 mr-2" />
            <span className="text-lg font-bold text-gray-800">Fitness App</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/workouts" className="text-gray-600 hover:text-purple-600">
              Workouts
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="flex-grow">
        {children}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Fitness App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
