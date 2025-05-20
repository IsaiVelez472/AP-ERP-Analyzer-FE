import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { reinitPreline } from '../utils/preline';

function Layout() {
  // Re-initialize Preline components when the layout renders
  useEffect(() => {
    reinitPreline();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="lg:ps-72 flex flex-col min-h-screen">
        <div className="pt-10 px-4 sm:px-6 md:px-8">
          <Navbar />
        </div>
        <main className="flex-grow px-4 sm:px-6 md:px-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
