'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Step 1 — get tokens (login endpoint does NOT return a user object)
      const { data: loginData } = await axios.post(`${ServerAddress}/auth/login`, { email, password });
      const access_token: string = loginData.access_token;
      const refresh_token: string | undefined = loginData.refresh_token;
      if (!access_token) throw new Error('No access token received');

      localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

      // Step 2 — fetch the real profile
      const { data: meData } = await axios.get(`${ServerAddress}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Step 3 — normalize and persist profile
      const rawRole: string = meData?.role ?? '';
      const normalizedProfile = {
        ...meData,
        id:           meData?.id           ?? meData?.uid          ?? '',
        uid:          meData?.uid           ?? '',
        role:         rawRole,
        email:        meData?.email         ?? email,
        company_id:   meData?.company_id    ?? meData?.companyId   ?? '',
        company_name: meData?.company_name  ?? meData?.companyName ?? '',
        first_name:   meData?.first_name    ?? (meData?.displayName?.split(' ')?.[0]            ?? ''),
        last_name:    meData?.last_name     ?? (meData?.displayName?.split(' ')?.slice(1).join(' ') ?? ''),
        is_active:    meData?.is_active     ?? true,
        created_at:   meData?.created_at    ?? new Date().toISOString(),
        updated_at:   meData?.updated_at    ?? new Date().toISOString(),
      };
      localStorage.setItem('user_profile', JSON.stringify(normalizedProfile));

      toast.success('Successfully signed in!');
      if (rawRole === 'employer') {
        router.push('/employer/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err: any) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'An unexpected error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <motion.header
        className="border-b border-border bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600">Diltak.ai</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Button asChild variant="ghost" size="sm" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                <Link href="/"><ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Home</span></Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">D</span>
              </div>
            </Link>
          </div>

          <Card className="bg-card border border-border shadow-xl rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Welcome back</CardTitle>
              <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <form onSubmit={handleSignIn} className="space-y-5">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Alert variant="destructive">
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className={`pl-10 ${focusedField === 'email' ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className={`pl-10 pr-10 ${focusedField === 'password' ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : ''}`}
                      required
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="space-y-3 text-center text-sm">
                <div>
                  <span className="text-muted-foreground">Don&apos;t have an account? </span>
                  <Link href="/auth/signup" className="text-green-600 dark:text-green-400 hover:underline font-semibold">Sign up</Link>
                </div>
                <div>
                  <Link href="/auth/reset-password" className="text-green-600 dark:text-green-400 hover:underline">Forgot your password?</Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <div className="mt-4 bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Demo Accounts</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Employee: employee@demo.com / password123</p>
              <p>Employer: employer@demo.com / password123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
