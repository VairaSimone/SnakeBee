import React from 'react';
import NavBar from './Navbar';
import Footer from './Footer';

const ProtectedLayout = ({ children }) => {
  return (
    <>
      <main className="min-h-screen bg-[#FAF3E0] pt-16">{children}</main>
    </>
  );
};

export default ProtectedLayout;
