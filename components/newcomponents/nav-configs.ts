/**
 * Navigation item configurations for each module.
 * Import the relevant config and pass it to AppLayout / Sidebar / Navbar.
 */

import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Heart,
  Users,
  HelpCircle,
  Sparkles,
  Trophy,
  BarChart3,
  UserCheck,
  Building2,
  GitBranch,
  ShieldCheck,
  Settings,
  Bell,
  Activity,
  Database,
  Lock,
  Star,
  Home,
  User,
  Dumbbell,
  Brain,
} from 'lucide-react';
import type { NavItem } from './Sidebar';

export const employeeNavItems: NavItem[] = [
  { path: '/employee/dashboard',       label: 'Wellness Dashboard', icon: LayoutDashboard, exact: true },
  // { path: '/employee/chat',            label: 'Saathi- Mental Wellness', icon: MessageSquare },
  { path: '/employee/new-saathi',      label: 'Saathi- Mental Wellness',         icon: Brain },
  { path: '/employee/physical-health', label: 'Umang- Physical Wellness',icon: Dumbbell },
  { path: '/employee/reports',         label: 'My Reports',         icon: FileText },
  { path: '/employee/recommendations', label: 'Recommendations',    icon: Sparkles },
  { path: '/employee/community',       label: 'Community',          icon: Users },
  // { path: '/employee/challenges',      label: 'Challenges',         icon: Star },
  { path: '/employee/gamification',    label: 'Gamification',       icon: Trophy },
  { path: '/employee/support',         label: 'Support',            icon: HelpCircle },
  { path: '/employee/profile',         label: 'My Profile',         icon: User },
];

export const managerNavItems: NavItem[] = [
  { path: '/manager/personal/dashboard',       label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { path: '/manager/personal/chat',            label: 'AI Chat',         icon: MessageSquare },
  { path: '/manager/personal/reports',         label: 'Reports',         icon: FileText },
  { path: '/manager/personal/wellness-hub',    label: 'Wellness',        icon: Heart },
  { path: '/manager/personal/community',       label: 'Community',       icon: Users },
  { path: '/manager/personal/recommendations', label: 'Recommendations', icon: Sparkles },
  { path: '/manager/personal/gamification',    label: 'Gamification',    icon: Trophy },
  { path: '/manager/personal/support',         label: 'Support',         icon: HelpCircle },
  { path: '/manager/dashboard',                label: 'Team Overview',   icon: BarChart3 },
  { path: '/manager/manage-team',              label: 'Manage Team',     icon: UserCheck },
  { path: '/manager/org-chart',                label: 'Org Chart',       icon: GitBranch },
];

export const employerNavItems: NavItem[] = [
  { path: '/employer/dashboard',   label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { path: '/employer/teamDashboard',   label: 'Team Dashboard',  icon: Users, exact: true },
  { path: '/employer/employees',   label: 'Employees',  icon: Users },
  { path: '/employer/departments',   label: 'Department',  icon: Home  },
  { path: '/employer/positions',   label: 'Positions',  icon: User },
  // { path: '/employer/reports',     label: 'Reports',    icon: FileText },
  // { path: '/employer/analytics',   label: 'Analytics',  icon: BarChart3 },
  // { path: '/employer/wellness-hub',label: 'Wellness',   icon: Heart },
  { path: '/employer/profile',      label: 'My Profile',      icon: User },
];

export const adminNavItems: NavItem[] = [
  // Platform
  { path: '/admin/dashboard',                  label: 'Overview',          icon: LayoutDashboard, exact: true, section: 'Platform' },
  { path: '/admin/companies',                  label: 'Companies',         icon: Building2 },
  { path: '/admin/users',                      label: 'Users',             icon: Users },
  // Analytics
  { path: '/admin/analytics',                  label: 'Usage Logs',        icon: BarChart3, section: 'Analytics' },
  { path: '/admin/credits',                    label: 'Credits',           icon: Database },
  { path: '/admin/activity',                   label: 'Audit Log',         icon: Activity },
  // // Gamification
  // { path: '/admin/gamification',               label: 'Gam. Overview',     icon: Trophy, section: 'Gamification' },
  // { path: '/admin/gamification/challenges',    label: 'Challenges',        icon: Star },
  // // Employer View
  // { path: '/admin/employer/team-engagement',   label: 'Team Engagement',   icon: BarChart3, section: 'Employer View' },
  // { path: '/admin/employer/team-gamification', label: 'Team Gamification', icon: Trophy },
  // Other
  { path: '/admin/profile',                    label: 'My Profile',        icon: User, section: 'Account' },
];
