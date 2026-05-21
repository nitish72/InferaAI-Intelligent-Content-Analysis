import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Brain, Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff, User as UserIcon } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, forgotPassword, resetPassword } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signup(email, password, fullName);
        onClose();
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email);
        setSuccess(res.message);
        if (res.simulated_email_link) {
          // For demo purposes, we automatically navigate to the reset link
          window.location.href = res.simulated_email_link;
        }
      } else if (mode === 'reset') {
        await resetPassword(resetToken, password);
        setSuccess('Password has been reset successfully. You can now login.');
        setMode('login');
        // Clear URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-page transition-colors duration-500 overflow-hidden">
      {/* Background Aesthetics for Dedicated Page Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 glass-panel w-full max-w-md p-8 shadow-2xl border-white/5">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-main mb-2">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : mode === 'forgot' ? 'Reset Password' : 'New Password'}
          </h2>
          <p className="text-sm text-muted">
            {mode === 'login' && 'Login to save your profile history across devices'}
            {mode === 'signup' && 'Sign up to save your analysis history across devices'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link'}
            {mode === 'reset' && 'Enter your new password below'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-page border border-main rounded-xl pl-10 pr-4 py-2.5 text-sm text-main placeholder-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-page border border-main rounded-xl pl-10 pr-4 py-2.5 text-sm text-main placeholder-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                    className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-page border border-main rounded-xl pl-10 pr-10 py-2.5 text-sm text-main placeholder-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' && (
            <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="text-primary-400 hover:text-primary-300 font-medium">Sign up</button></>
          )}
          {(mode === 'signup' || mode === 'forgot' || mode === 'reset') && (
            <>Back to <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-primary-400 hover:text-primary-300 font-medium">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
