import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDepartmentsList } from '../services/auth';
import { Shield, User, Mail, Lock, Building2, UserCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [departmentId, setDepartmentId] = useState('');
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDepts, setFetchingDepts] = useState(true);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch departments list for dropdown
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const list = await fetchDepartmentsList();
        setDepartments(list);
        if (list.length > 0) {
          setDepartmentId(list[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
        setError('Could not connect to backend to retrieve departments list.');
      } finally {
        setFetchingDepts(false);
      }
    };
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role || !departmentId) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password, role, parseInt(departmentId, 10));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Verify connection settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-600/20 mb-3">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Register user credentials to join organization</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-600"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-600"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-600"
                  required
                />
              </div>
            </div>

            {/* Role & Department Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Select Role
                </label>
                <div className="relative">
                  <UserCircle2 size={16} className="absolute left-3 top-3 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                  >
                    <option value="Employee" className="bg-slate-800">Employee</option>
                    <option value="Admin" className="bg-slate-800">Admin</option>
                  </select>
                </div>
              </div>

              {/* Department Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Department
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-500" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={loading || fetchingDepts}
                    className="w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {fetchingDepts ? (
                      <option className="bg-slate-800">Loading...</option>
                    ) : (
                      departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-slate-800">
                          {dept.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || fetchingDepts}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/10 hover:shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
