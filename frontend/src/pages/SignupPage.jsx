/**
 * SignupPage — Admin Company Registration
 * Collects: company name, company location, admin full name, email, password.
 * Sends welcome email via backend SMTP on success.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1 = company info, 2 = admin credentials
  const [formData, setFormData] = useState({
    company_name: '',
    company_location: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength
  const [strength, setStrength] = useState(0);

  const getStrengthText = () => ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const getStrengthColor = () => ['', 'text-error', 'text-on-tertiary-container', 'text-secondary', 'text-primary dark:text-primary-fixed'][strength];
  const getBarColor = (i) => {
    if (i >= strength) return 'bg-outline-variant';
    return ['', 'bg-error', 'bg-tertiary-container', 'bg-secondary', 'bg-primary'][strength];
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (field === 'password') {
      const v = e.target.value;
      let s = 0;
      if (v.length > 0) s = 1;
      if (v.length >= 6) s = 2;
      if (v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v)) s = 3;
      if (v.length >= 10 && /[^A-Za-z0-9]/.test(v)) s = 4;
      setStrength(s);
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) { setError('Company name is required'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!acceptTerms) { setError('You must accept the Terms of Service'); return; }
    if (strength < 2) { setError('Please choose a stronger password'); return; }

    setLoading(true);
    try {
      const response = await authService.register({
        company_name: formData.company_name,
        company_location: formData.company_location,
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });
      login(response.access_token, response.user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-background text-on-background font-body-md min-h-screen flex antialiased items-center justify-center p-margin-mobile md:p-margin-desktop transition-colors duration-300"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 247, 249, 0.65), rgba(255, 247, 249, 0.65)), url('https://lh3.googleusercontent.com/aida/AP1WRLuluIJZoLT6U2110zqbfQsXckIP-YWFmF1iMNtkgSSCc_mh6hF1EaAQvAXANOwGtEFopizn_8-_JTmoj5xeNWtJ4aP737aMEUMCvOaK-xKJGTuM8Qj-cLbuAQQMRWyQioCjLL3F6THOFEPlzKX13AiR3ZFXGIuhch4Fi30Y8f8KedL0X1LfzBVIbI9K4G4zs6IlW8CP3guc_FsaFQ2MmXTPOclw1kVXfyZq3EUUAQielez8gL4slmqhkT0')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>local_shipping</span>
          </div>
          <span className="font-title-sm text-title-sm text-primary font-bold tracking-tight">TransitOps</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="w-full max-w-md rounded-[16px] border border-outline-variant shadow-md hover:shadow-lg transition-all duration-300 p-8 bg-surface-container-lowest/80 backdrop-blur-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">business</span>
          </div>
          <h1 className="font-title-lg text-title-lg text-on-surface mb-1 font-bold">
            {step === 1 ? 'Register your Company' : 'Create Admin Account'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium">
            {step === 1 ? 'Set up your TransitOps workspace.' : 'Your account gets admin access.'}
          </p>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-primary' : s < step ? 'w-4 bg-primary/50' : 'w-4 bg-outline-variant'}`} />
            ))}
          </div>
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-secondary-container/20 text-on-secondary-container border border-secondary/20 rounded-lg text-sm flex gap-2 items-center">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              <span className="font-semibold">Company registered! Redirecting to dashboard...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error alert */}
        <AnimatePresence>
          {error && !success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm flex gap-2 items-start">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1 — Company Info */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" onSubmit={handleStep1}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md mb-1 text-on-surface font-semibold" htmlFor="company_name">
                  Company Name <span className="text-error">*</span>
                </label>
                <div className="relative input-ring-focus rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">apartment</span>
                  </div>
                  <input id="company_name" type="text" required value={formData.company_name}
                    onChange={handleChange('company_name')} placeholder="Acme Corporation"
                    className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/65" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md mb-1 text-on-surface font-semibold" htmlFor="company_location">
                  Company Location <span className="text-on-surface-variant text-xs font-normal">(optional)</span>
                </label>
                <div className="relative input-ring-focus rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">location_on</span>
                  </div>
                  <input id="company_location" type="text" value={formData.company_location}
                    onChange={handleChange('company_location')} placeholder="San Francisco, CA"
                    className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/65" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit"
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:opacity-90 hover:shadow-md hover:scale-[1.01] transition-all font-semibold">
                  Continue <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Step 2 — Admin credentials */}
          {step === 2 && !success && (
            <motion.form key="step2" onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block font-label-md text-label-md mb-1 text-on-surface font-semibold" htmlFor="full_name">Full Name</label>
                <div className="relative input-ring-focus rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">person</span>
                  </div>
                  <input id="full_name" type="text" required value={formData.full_name}
                    onChange={handleChange('full_name')} placeholder="Jane Doe"
                    className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/65" />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block font-label-md text-label-md mb-1 text-on-surface font-semibold" htmlFor="reg-email">Work Email</label>
                <div className="relative input-ring-focus rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                  </div>
                  <input id="reg-email" type="email" required value={formData.email}
                    onChange={handleChange('email')} placeholder="jane@acme.com"
                    className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/65" />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block font-label-md text-label-md mb-1 text-on-surface font-semibold" htmlFor="reg-password">Password</label>
                <div className="relative input-ring-focus rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                  </div>
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} required value={formData.password}
                    onChange={handleChange('password')} placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 border-none bg-transparent rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/65" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-surface-container-high">
                    {[0, 1, 2, 3].map(i => <div key={i} className={`h-full w-1/4 transition-colors duration-300 ${getBarColor(i)}`} />)}
                  </div>
                  {strength > 0 && <p className={`mt-1 font-caption text-caption text-right transition-colors duration-300 ${getStrengthColor()}`}>{getStrengthText()}</p>}
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label className="block font-label-md text-label-md mb-1 text-on-surface font-semibold" htmlFor="confirm_password">Confirm Password</label>
                <div className="relative input-ring-focus rounded-lg border border-outline-variant bg-surface-container-lowest">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">lock_reset</span>
                  </div>
                  <input id="confirm_password" type="password" required value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')} placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/65" />
                </div>
              </div>
              {/* Terms */}
              <div className="flex items-start pt-1">
                <input id="terms" type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-outline-variant text-secondary cursor-pointer" />
                <label htmlFor="terms" className="ml-3 font-body-md text-body-md text-on-surface-variant cursor-pointer text-sm">
                  I agree to the <a className="font-label-md text-secondary font-bold" href="#">Terms of Service</a> and <a className="font-label-md text-secondary font-bold" href="#">Privacy Policy</a>.
                </label>
              </div>
              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-container transition-all font-semibold">
                  Back
                </button>
                <button type="submit" disabled={loading || success}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:opacity-90 hover:shadow-md hover:scale-[1.01] transition-all font-semibold disabled:opacity-50">
                  {loading ? <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : 'Create Workspace'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-6 font-body-md text-body-md text-on-surface-variant text-center">
          Already have an account?{' '}
          <Link className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors font-bold" to="/login">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
