import React from 'react';
import { Link } from 'react-router-dom';

const MainLayout = ({ onLogout, children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/routes" className="text-blue-600 hover:underline">Routes</Link>
            </li>
            <li>
              <Link to="/locations" className="text-blue-600 hover:underline">Locations</Link>
            </li>
            <li>
              <Link to="/transportations" className="text-blue-600 hover:underline">Transportations</Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Ana İçerik */}
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Flight Routes</h1>
          {onLogout && (
            <button 
              onClick={onLogout} 
              className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded"
            >
              Logout
            </button>
          )}
        </header>
        <div className="p-6 flex-1">
            {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;