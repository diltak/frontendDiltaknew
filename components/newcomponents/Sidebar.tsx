'use client';

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationGuard } from '@/contexts/navigation-guard-context';

export interface NavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  badge?: number;
  exact?: boolean;
  section?: string; // optional section header label
}

export interface SidebarProps {
  items: NavItem[];
  brandName?: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  /** User info shown at the bottom */
  user?: { first_name?: string; last_name?: string; email: string; role?: string };
}

function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { checkGuard } = useNavigationGuard();
  const isActive = item.exact
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(item.path + '/');
  const Icon = item.icon;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If a guard is registered and blocks navigation, prevent the link
      if (!checkGuard(item.path)) {
        e.preventDefault();
        return;
      }
      onNavigate?.();
    },
    [checkGuard, item.path, onNavigate]
  );

  return (
    <Link
      href={item.path}
      onClick={handleClick}
      prefetch={true}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1',
        collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
        isActive
          ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-500" />
      )}
      {Icon && (
        <Icon
          className={cn(
            'flex-shrink-0 h-5 w-5',
            isActive
              ? 'text-violet-600 dark:text-violet-400'
              : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
          )}
        />
      )}
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && item.badge != null && item.badge > 0 && (
        <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  );
}

function Sidebar({
  items,
  brandName = 'Diltak.ai',
  onNavigate,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className,
  user,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapsed = useCallback(() => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [isCollapsed, onCollapsedChange]);

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : user?.email ?? '';

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-100 dark:border-gray-800',
        'transition-[width] duration-300 ease-in-out will-change-[width]',
        isCollapsed ? 'w-[72px]' : 'w-56',
        className
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-gray-100 dark:border-gray-800 min-h-[60px]',
        isCollapsed ? 'justify-center px-3 py-4' : 'justify-between px-4 py-4'
      )}>
        {isCollapsed ? (
          /* Collapsed logo: shows "D", on hover reveals expand icon */
          <button
            onClick={toggleCollapsed}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            aria-label="Expand sidebar"
            className="relative w-8 h-8 flex-shrink-0 rounded-xl focus-visible:ring-2 focus-visible:ring-violet-400 outline-none"
          >
            {/* D logo */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm transition-opacity duration-200',
              logoHovered ? 'opacity-0' : 'opacity-100'
            )}>
              <span className="text-black font-bold text-sm leading-none">D</span>
            </div>
            {/* Expand icon overlay on hover */}
            <div className={cn(
              'absolute inset-0 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center transition-opacity duration-200',
              logoHovered ? 'opacity-100' : 'opacity-0'
            )}>
              <ChevronRight className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
          </button>
        ) : (
          <>
            <Link href={items[0]?.path ?? '/'} onClick={onNavigate} aria-label={brandName} className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm leading-none">D</span>
              </div>
              <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate">
                Diltak.ai
              </span>
            </Link>
            <button
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 scrollbar-hide">
        <ul className="flex flex-col gap-0.5" role="list">
          {items.map((item) => (
            <li key={item.path}>
              {item.section && !isCollapsed && (
                <p className="px-3 pt-4 pb-1 text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.15em]">
                  {item.section}
                </p>
              )}
              {item.section && isCollapsed && (
                <div className="my-2 mx-auto w-6 h-px bg-gray-200 dark:bg-gray-700" />
              )}
              <SidebarItem item={item} collapsed={isCollapsed} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: user info */}
      <div className={cn(
        'border-t border-gray-100 dark:border-gray-800',
        isCollapsed ? 'p-2 flex flex-col items-center' : 'p-3'
      )}>
        {isCollapsed ? (
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center" title={displayName}>
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">{initials}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{displayName}</p>
              {user?.role && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{user.role}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
