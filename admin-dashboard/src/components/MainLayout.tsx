import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen flex bg-surface-bg text-text-primary">
      {/* Fixed 240px Dark Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
