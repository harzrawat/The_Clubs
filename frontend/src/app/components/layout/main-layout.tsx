// Main Layout Component

import { Outlet } from 'react-router';
import { TopNav } from './top-nav';
import { SidebarNav } from './sidebar-nav';
import { Footer } from './footer';
import { useAuth } from '../../lib/auth-context';
import { useState } from 'react';
import { cn } from '../ui/utils';
import { BreadcrumbsBar } from './breadcrumbs-bar';

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        {isAuthenticated && (
          <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <div
              className={cn(
                'fixed left-0 top-16 z-40 md:sticky md:top-16 md:block',
                sidebarOpen ? 'block' : 'hidden md:block'
              )}
            >
              <SidebarNav onLinkClick={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className="flex-1 bg-background">
          <BreadcrumbsBar />
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
