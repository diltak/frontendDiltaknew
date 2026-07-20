'use client';

import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── 1. Full-page loader ──────────────────────────────────────────────────────
// Used when an entire page is loading (replaces min-h-screen loading returns)

export interface PageLoaderProps {
  message?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export function PageLoader({
  message = 'Loading...',
  icon: Icon = Loader2,
  iconColor = 'text-violet-600 dark:text-violet-400',
}: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className={cn('h-20 w-20 mx-auto mb-4 animate-spin', iconColor)}>
          <Icon className="h-full w-full" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// ─── 2. Section loader ────────────────────────────────────────────────────────
// Used inside cards/panels (replaces min-h-[400px] or h-64 loading blocks)

export interface SectionLoaderProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function SectionLoader({
  message,
  className,
  size = 'md',
  color = 'text-violet-600',
}: SectionLoaderProps) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3', className)}>
      <Loader2 className={cn('animate-spin', sizeMap[size], color)} />
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}

// ─── 3. Inline button loader ──────────────────────────────────────────────────
// Used inside buttons while an action is in progress

export interface ButtonLoaderProps {
  message?: string;
  size?: 'sm' | 'md';
}

export function ButtonLoader({ message, size = 'sm' }: ButtonLoaderProps) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-5 w-5' };
  return (
    <>
      <Loader2 className={cn('animate-spin mr-2 flex-shrink-0', sizeMap[size])} />
      {message && <span>{message}</span>}
    </>
  );
}

// ─── 4. Spinner (border style) ────────────────────────────────────────────────
// Classic CSS border spinner — matches legacy `animate-spin rounded-full border-b-2`

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color = 'border-violet-600', className }: SpinnerProps) {
  const sizeMap = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
    xl: 'h-32 w-32',
  };
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2',
        sizeMap[size],
        color,
        className
      )}
    />
  );
}

// ─── 5. Dot pulse ─────────────────────────────────────────────────────────────
// Small animated dot for status indicators (recording, speaking, etc.)

export interface DotPulseProps {
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function DotPulse({ color = 'bg-violet-500', size = 'sm', className }: DotPulseProps) {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-3 h-3' };
  return (
    <span className={cn('rounded-full animate-pulse inline-block', sizeMap[size], color, className)} />
  );
}

// ─── 6. Overlay loader ────────────────────────────────────────────────────────
// Centered overlay inside a relative container (e.g. avatar loading)

export interface OverlayLoaderProps {
  message?: string;
  subMessage?: string;
  color?: string;
}

export function OverlayLoader({
  message = 'Loading...',
  subMessage,
  color = 'text-violet-600',
}: OverlayLoaderProps) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 text-center pointer-events-none z-10">
      <Loader2 className={cn('h-10 w-10 animate-spin mx-auto mb-3', color)} />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>
      {subMessage && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subMessage}</p>
      )}
    </div>
  );
}

// ─── 7. Brand loader (D logo + bouncing dots) ─────────────────────────────────
// Used as the primary page-level loader across employee/manager/employer pages

export interface BrandLoaderProps {
  color?: string; // dot color, e.g. 'bg-violet-400' or 'bg-emerald-400'
}

export function BrandLoader({ color = 'bg-violet-400' }: BrandLoaderProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 150, 300].map(d => (
            <span
              key={d}
              className={cn('w-2 h-2 rounded-full animate-bounce', color)}
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 8. Suspense fallback spinner ─────────────────────────────────────────────
// Minimal spinner for use in Suspense fallback props

export interface SuspenseFallbackProps {
  color?: string;
  fullScreen?: boolean;
}

export function SuspenseFallback({ color = 'border-green-600', fullScreen = false }: SuspenseFallbackProps) {
  return (
    <div className={cn('flex items-center justify-center', fullScreen ? 'min-h-screen bg-background' : 'h-16')}>
      <Spinner size="sm" color={color} />
    </div>
  );
}

// ─── 9. Chat / inline processing loader ───────────────────────────────────────
// Small inline spinner + text for chat bubbles and processing states

export interface InlineLoaderProps {
  message?: string;
  size?: 'xs' | 'sm';
  color?: string;
}

export function InlineLoader({ message, size = 'sm', color = 'text-blue-500' }: InlineLoaderProps) {
  const sizeMap = { xs: 'w-3 h-3', sm: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-1.5">
      <Loader2 className={cn('animate-spin flex-shrink-0', sizeMap[size], color)} />
      {message && <span className="text-xs text-gray-500">{message}</span>}
    </div>
  );
}

// ─── 10. Full-screen center loader ────────────────────────────────────────────
// Used for full h-screen centered loading (e.g. chat page initial load)

export interface FullScreenLoaderProps {
  color?: string;
  size?: 'md' | 'lg' | 'xl';
}

export function FullScreenLoader({ color = 'text-blue-600', size = 'lg' }: FullScreenLoaderProps) {
  const sizeMap = { md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className={cn('animate-spin', sizeMap[size], color)} />
    </div>
  );
}
