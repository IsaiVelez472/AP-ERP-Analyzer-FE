import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { reinitPreline } from '../utils/preline';

function Layout() {
  // Re-initialize Preline components when the layout renders
  useEffect(() => {
    reinitPreline();
  }, []);

  return (
    <div className="bg-gray-50">
      <Sidebar />
      
      <div className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-72">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
