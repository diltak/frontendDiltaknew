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
import { Users, Eye, EyeOff, Info, ArrowLeft, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

export default function EmployeeLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${ServerAddress}/auth/login`, { email, password });
      const { access_token, refresh_token, user } = response.data;

      if (!user || !['employee', 'manager', 'hr'].includes(user.role)) {
        setError('This login portal is for employees only. Please use the employer login portal.');
        return;
      }

      localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_profile', JSON.stringify(user));

      toast.success(`Welcome back, ${user.first_name || user.firstName || 'there'}!`);
      router.push('/employee/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
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
                <Link href="/auth/login"><ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Back</span></Link>
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
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="text-center mb-6">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Users className="h-7 w-7 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Employee Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in with your company-provided credentials</p>
          </div>

          <div className="flex items-start space-x-3 bg-card border border-border rounded-xl p-4 mb-6">
            <Info className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Use the login credentials provided by your employer. If you don't have an account, contact your HR department.
            </p>
          </div>

          <Card className="bg-card border border-border shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-foreground text-center">Welcome back</CardTitle>
              <p className="text-sm text-muted-foreground text-center">Enter your company email and password to continue</p>
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
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Company Email</Label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} className={`pl-10 ${focusedField === 'email' ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : ''}`} disabled={loading} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} className={`pl-10 pr-10 ${focusedField === 'password' ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : ''}`} disabled={loading} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 shadow-lg transition-all duration-300" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Signing In...</span>
                    ) : (
                      <span className="flex items-center justify-center">Sign In to Employee Portal<ArrowRight className="ml-2 h-5 w-5" /></span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Are you an employer? </span>
                <Link href="/auth/employer/login" className="text-green-600 dark:text-green-400 hover:underline font-semibold">Employer Portal</Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Need Help?</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Contact your HR department for login credentials</p>
              <p>• Your employer creates and manages employee accounts</p>
              <p>• Use the email address provided by your company</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
