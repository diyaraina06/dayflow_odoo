import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { UserPlus, Mail, Lock, User, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/auth/register', formData);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-800/50 relative overflow-hidden py-12">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md z-10 px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Dayflow
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 font-medium">Create your workspace account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="employeeId">Employee ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP123"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-800 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-800 dark:text-zinc-100"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-800 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="role">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={18} className="text-slate-400" />
                </div>
                <select 
                  id="role" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-800 dark:text-zinc-100 appearance-none cursor-pointer"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR Admin</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all duration-300 transform hover:-translate-y-0.5 mt-2" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={20} /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 dark:text-zinc-400 text-sm font-medium">
            Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-700 hover:underline transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
