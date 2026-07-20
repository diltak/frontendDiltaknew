"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Menu, X, Heart, BarChart2, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getMobileToggleAriaLabel } from "@/lib/landing/helpers";

const products = [
  {
    href: "/products/saathi",
    name: "Saathi",
    desc: "AI personal wellness companion",
    icon: Heart,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    nameColor: "text-violet-700 dark:text-violet-300",
  },
  {
    href: "/products/umang",
    name: "Umang",
    desc: "Enterprise mental health analytics",
    icon: BarChart2,
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    nameColor: "text-amber-700 dark:text-amber-300",
  },
];

const linkCls =
  "px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 whitespace-nowrap";

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /* shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close menus on navigation */
  useEffect(() => {
    setMobileOpen(false);
    setDesktopProductsOpen(false);
  }, [pathname]);

  /* close desktop dropdown on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDesktopProductsOpen(false);
      }
    };
    if (desktopProductsOpen) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [desktopProductsOpen]);

  const closeAll = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
    setDesktopProductsOpen(false);
  };

  return (
    <>
    <header
      className={`p-6 fixed top-0 left-0 right-0 z-[100] w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-black/8 dark:shadow-black/30" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────── */}
          <Link href="/" onClick={closeAll} className="flex items-center gap-2.5 flex-shrink-0">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="text-white w-5 h-5" />
            </motion.div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
              Diltak.ai
            </span>
          </Link>

          {/* ── Desktop centre nav ────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5">

            <Link href="/" className={linkCls}>Home</Link>

            {/* Products dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDesktopProductsOpen(!desktopProductsOpen)}
                className={`${linkCls} flex items-center gap-1`}
              >
                Products
                <motion.span animate={{ rotate: desktopProductsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {desktopProductsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }}
                    className="w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/12 dark:shadow-black/40 z-[200] overflow-visible"
                  >
                    {/* Arrow tip */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45" />

                    <div className="p-1.5 pt-4">
                      <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Our Products
                      </p>
                      {products.map(({ href, name, desc, icon: Icon, iconBg, iconColor, nameColor }) => (
                        <Link
                          key={name}
                          href={href}
                          onClick={closeAll}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group"
                        >
                          <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${nameColor}`}>{name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
                        </Link>
                      ))}
                    </div>

                    <div className="mx-3 mb-3 mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        href="/contact"
                        onClick={closeAll}
                        className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-150"
                      >
                        Schedule a Demo <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/#how-it-works" className={linkCls}>How It Works</Link>
            <Link href="/#audience" className={linkCls}>For You</Link>
            <Link href="/#advantage" className={linkCls}>About</Link>
            <Link href="/#faq" className={linkCls}>FAQ</Link>
            <Link href="/contact" className={linkCls}>Contact</Link>
          </nav>

          {/* ── Desktop right: Login + Theme ─────────── */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Login
            </Link>
            <ThemeToggle />
          </div>

          {/* ── Mobile: Theme + Hamburger ─────────────── */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={getMobileToggleAriaLabel(mobileOpen)}
              aria-expanded={mobileOpen}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
            data-testid="mobile-menu"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-0.5">

              <Link href="/" onClick={closeAll}
                className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200">
                Home
              </Link>

              {/* Products accordion */}
              <div>
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200"
                >
                  <span>Products</span>
                  <motion.span animate={{ rotate: mobileProductsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {mobileProductsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden ml-3 mt-1 mb-1 space-y-0.5 border-l-2 border-violet-100 dark:border-violet-900/50 pl-3"
                    >
                      {products.map(({ href, name, desc, icon: Icon, iconBg, iconColor, nameColor }) => (
                        <Link
                          key={name}
                          href={href}
                          onClick={closeAll}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-150 group"
                        >
                          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${nameColor}`}>{name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                { label: "How It Works", href: "/#how-it-works" },
                { label: "For You", href: "/#audience" },
                { label: "About", href: "/#advantage" },
                { label: "FAQ", href: "/#faq" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} onClick={closeAll}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200">
                  {label}
                </Link>
              ))}

              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/auth/login"
                  onClick={closeAll}
                  className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-md transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

      {/* Spacer to offset fixed navbar height so page content is not hidden behind it */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
