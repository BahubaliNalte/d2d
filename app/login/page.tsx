'use client';

import { useState } from 'react';
import { auth, database, provider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set, update } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaArrowLeft, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again or reset your password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please check or sign up.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later or reset your password.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const updates: any = {
        name: user.displayName,
        email: user.email,
      };
      if (user.phoneNumber) {
        updates.phone = user.phoneNumber;
      }
      await update(ref(database, 'Users/' + user.uid), updates);
      router.push('/');
    } catch (err: any) {
      setError('Google login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: any) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail) {
      setResetMsg("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("✅ Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setResetMsg("Failed to send reset email. Please check your email.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      {/* Back Navigation */}
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
          id="login-back"
        >
          <FaArrowLeft className="text-xs" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <img src="/Web Images/d2d-logo1.png" alt="D2D" className="h-10 w-auto mx-auto" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 mt-2">Sign in to your Diploma2Degree account</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field !pl-10"
                    id="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field !pl-10 !pr-10"
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  onClick={() => setShowReset(!showReset)}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                id="login-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            {/* Forgot Password Form */}
            <AnimatePresence>
              {showReset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        className="input-field text-sm"
                        required
                      />
                      <button type="submit" className="py-2.5 px-4 text-sm font-semibold text-white bg-slate-700 rounded-xl hover:bg-slate-800 transition">
                        Send Reset Link
                      </button>
                    </form>
                    {resetMsg && (
                      <p className={`mt-2 text-xs font-medium ${resetMsg.includes('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                        {resetMsg}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs font-medium text-slate-400">or continue with</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full py-3 px-4 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-3 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              id="login-google"
            >
              <img src="/Web Images/goolge-logo.png" alt="Google" className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
