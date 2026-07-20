'use client';

import { useState, Suspense } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/newcomponents/Sidebar';
import Navbar, { DesktopTopBar } from '@/components/newcomponents/Navbar';
import { employeeNavItems } from '@/components/newcomponents/nav-configs';
import { useAuth } from '@/contexts/auth-context';
import { NavigationProgress } from '@/components/newcomponents/NavigationProgress';
import { NavigationGuardProvider } from '@/contexts/navigation-guard-context';

export default function EmployeeModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navUser = user
    ? { first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role }
    : undefined;

  return (
    <NavigationGuardProvider>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Navbar user={navUser} items={employeeNavItems} />
      <Sidebar
        items={employeeNavItems}
        user={navUser}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <div
        className={cn(
          'transition-[padding-left] duration-200 ease-in-out',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-56'
        )}
      >
        <DesktopTopBar user={navUser} />
        <main className="min-h-[calc(100vh-60px)]">
          {children}
        </main>
        <div className="py-1.5 text-center text-[10px] text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          AI-generated content may contain errors. Review carefully before relying on it.
        </div>
      </div>
    </div>
    </NavigationGuardProvider>
  );
}
