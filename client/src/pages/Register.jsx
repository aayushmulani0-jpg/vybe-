import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  
  const register = useAuthStore(state => state.register);
  const googleLogin = useAuthStore(state => state.googleLogin);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate(from);
    } catch {
      // Error is handled by store
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate(from);
    } catch {
      // Error handled
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 flex items-center justify-center bg-primary relative overflow-hidden">
      <div className="gradient-orb gradient-orb-accent w-[300px] h-[300px] top-10 -right-20 animate-float" />
      <div className="gradient-orb gradient-orb-blue w-[250px] h-[250px] bottom-10 -left-20 animate-float" style={{ animationDelay: '2s' }} />
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md glass-card shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-secondary tracking-wider uppercase mb-2">Create Account</h2>
          <p className="text-gray-400 font-body">Join VYBE for exclusive access</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-500" />
              </div>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-md bg-neutral-950 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="John Doe"
              />
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-500" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-md bg-neutral-950 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-md bg-neutral-950 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
                minLength="6"
              />
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Button type="submit" variant="accent" className="w-full py-3 mt-4 hover:scale-[1.02] transition-transform" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </motion.div>
        </motion.form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-900 text-gray-400">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              theme="filled_black"
              shape="pill"
              text="signup_with"
            />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-white transition-colors font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
