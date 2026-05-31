import React, { useState, useEffect } from 'react';
import { fetchAuditLogs, fetchUsersList } from '../services/admin';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Calendar,
  User,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter criteria states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const loadFilterOptions = async () => {
    try {
      const usersData = await fetchUsersList();
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users filter options:', err);
    }
  };

  const loadLogs = async (userId = '', action = '') => {
    setLoading(true);
    try {
      const logsData = await fetchAuditLogs(userId, action);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load logs:', err);
      setError('Failed to retrieve system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
    loadLogs();
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadLogs(selectedUser, selectedAction);
  };

  const handleResetFilters = () => {
    setSelectedUser('');
    setSelectedAction('');
    loadLogs('', '');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">System Audits</h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor login sessions, AWS S3 resource access, and sharing configurations across all departments
        </p>
      </div>

      {/* Filters Form Panel */}
      <form onSubmit={handleApplyFilters} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
          <Filter size={14} className="text-slate-400" />
          <span>Audit Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Filter by User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Action selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Filter by Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="Login">Login</option>
              <option value="Register">Register</option>
              <option value="Upload">Upload</option>
              <option value="Download">Download</option>
              <option value="Share">Share</option>
              <option value="Delete">Delete</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-3.5">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Filter Logs
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={loading}
              className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-semibold transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Loading audit history...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5">
            <FileSpreadsheet size={40} strokeWidth={1.2} />
            <p className="text-xs">No audit logs matching selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Subject File</th>
                  <th className="py-3.5 px-5">Log Entry Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {logs.map((log) => {
                  let actionColor = 'bg-slate-100 text-slate-700';
                  if (log.action === 'Upload') actionColor = 'bg-blue-50 text-blue-700';
                  if (log.action === 'Download') actionColor = 'bg-amber-50 text-amber-700';
                  if (log.action === 'Delete') actionColor = 'bg-red-50 text-red-700';
                  if (log.action === 'Share') actionColor = 'bg-purple-50 text-purple-700';
                  if (log.action === 'Login') actionColor = 'bg-emerald-50 text-emerald-700';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Timestamp */}
                      <td className="py-4 px-5 whitespace-nowrap text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-4 font-medium text-slate-800">
                        {log.user_name || 'Unregistered'}
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{log.user_email}</div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                          {log.role || 'Employee'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* File subject */}
                      <td className="py-4 px-4 text-slate-600 max-w-[150px] truncate">
                        {log.filename || <span className="text-slate-400 italic">None</span>}
                      </td>

                      {/* Log details */}
                      <td className="py-4 px-5 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Info size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="leading-relaxed">{log.details}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
