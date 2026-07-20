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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building, Mail, User as UserIcon, Phone, MapPin, Eye, EyeOff, Shield, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';


const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Real Estate', 'Media & Entertainment',
  'Transportation', 'Energy', 'Government', 'Non-Profit', 'Other'
];

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees'
];

export default function EmployerRegisterPage() {
  const [formData, setFormData] = useState({
    companyName: '', industry: '', companySize: '',
    firstName: '', lastName: '', businessEmail: '',
    phone: '', address: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateBusinessEmail = (email: string) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'live.com', 'msn.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !personalDomains.includes(domain);
  };

  const { refreshUser } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.companyName || !formData.businessEmail || !formData.firstName || !formData.lastName || !formData.password || !formData.industry) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!validateBusinessEmail(formData.businessEmail)) {
      setError('Please use a business email address, not a personal email');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${ServerAddress}/auth/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.businessEmail,
        password: formData.password,
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        phone: formData.phone || null,
        address: formData.address || null,
      });

      // Register endpoint returns only tokens, not a user object
      const access_token: string = response.data.access_token;
      const refresh_token: string | undefined = response.data.refresh_token;
      if (!access_token) throw new Error('No access token received');

      localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

      // Fetch the real profile from /auth/me
      const { data: meData } = await axios.get(`${ServerAddress}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const rawRole: string = meData?.role ?? '';
      const normalizedProfile = {
        ...meData,
        id:           meData?.id           ?? meData?.uid          ?? '',
        uid:          meData?.uid           ?? '',
        role:         rawRole,
        email:        meData?.email         ?? formData.businessEmail,
        company_id:   meData?.company_id    ?? meData?.companyId   ?? '',
        company_name: meData?.company_name  ?? meData?.companyName ?? formData.companyName,
        first_name:   meData?.first_name    ?? formData.firstName,
        last_name:    meData?.last_name     ?? formData.lastName,
        is_active:    meData?.is_active     ?? true,
        created_at:   meData?.created_at    ?? new Date().toISOString(),
        updated_at:   meData?.updated_at    ?? new Date().toISOString(),
      };
      localStorage.setItem('user_profile', JSON.stringify(normalizedProfile));

      await refreshUser();
      toast.success('Employer account created successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/employer/dashboard');
    } catch (err: any) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'An unexpected error occurred. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600">Diltak.ai</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider">
                <Link href="/auth/employer/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-4 py-12">
        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Employer Registration</h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 opacity-80">Setup your corporate wellness portal in minutes</p>
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-start space-x-3 bg-secondary/30 border border-border rounded-lg p-4 mb-8">
          <Shield className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tight">
            Exclusive registration for employers and business owners.
          </p>
        </div>

        <Card className="bg-card dark:bg-gray-950/20 border border-border shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-border bg-secondary/5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-indigo-500 rounded-full" />
              <CardTitle className="text-base font-bold tracking-tight text-foreground uppercase">Identity & Verification</CardTitle>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Please provide accurate corporate information</p>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Alert variant="destructive" className="rounded-md border-red-500/50 bg-red-500/5">
                      <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                  <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Company Information</h3>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Company Name *</Label>
                  <Input 
                    id="companyName" 
                    placeholder="e.g. Acme Corp" 
                    value={formData.companyName} 
                    onChange={(e) => handleInputChange('companyName', e.target.value)} 
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger className="h-10 bg-transparent border-border rounded-md font-medium text-sm">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(i => <SelectItem key={i} value={i} className="text-sm font-medium">{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="companySize" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger className="h-10 bg-transparent border-border rounded-md font-medium text-sm">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map(s => <SelectItem key={s} value={s} className="text-sm font-medium">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">First Name *</Label>
                    <Input id="firstName" placeholder="John" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessEmail" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Business Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 opacity-50" />
                    <Input id="businessEmail" type="email" placeholder="you@company.com" value={formData.businessEmail} onChange={(e) => handleInputChange('businessEmail', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm pl-10" required />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1 opacity-60">Company email domains only</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 opacity-50" />
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm pl-10" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 opacity-50" />
                      <Input id="address" placeholder="123 Business St, City" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm pl-10" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Security */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-red-500 rounded-full" />
                  <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Security Credentials</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Password *</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-red-500/20 focus:border-red-500" required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Confirm Password *</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-red-500/20 focus:border-red-500" required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tight">
                  <span className={formData.password.length >= 8 ? 'text-emerald-600' : 'text-muted-foreground/50'}>• Length &ge; 8</span>
                  <span className={formData.password === formData.confirmPassword && formData.password.length > 0 ? 'text-emerald-600' : 'text-muted-foreground/50'}>• Match</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Finalize Registration
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Already registered?{' '}
            <Link href="/auth/employer/login" className="text-emerald-600 hover:text-emerald-700 hover:underline">Sign In</Link>
          </p>
          <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Employee? <Link href="/auth/employee/login" className="hover:text-foreground transition-colors">Portal Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
