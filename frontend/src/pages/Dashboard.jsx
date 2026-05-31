import React, { useState, useEffect } from 'react';
import { fetchFiles, fetchSharedFiles } from '../services/files';
import { fetchAuditLogs } from '../services/admin';
import { useAuth } from '../context/AuthContext';
import { 
  Folder, 
  Users, 
  Download, 
  Activity, 
  FileText, 
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [filesList, sharedList] = await Promise.all([
          fetchFiles(),
          fetchSharedFiles()
        ]);
        setFiles(filesList);
        setSharedFiles(sharedList);

        // Fetch logs (if Admin, fetch system logs. If Employee, filter by user)
        const logRes = await fetchAuditLogs(user?.role !== 'Admin' ? user?.id : '');
        setLogs(logRes);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Compute stat totals
  const totalFilesCount = files.length;
  const sharedFilesCount = sharedFiles.length;
  
  // Count downloads from local logs data
  const downloadLogs = logs.filter(log => log.action === 'Download');
  const userDownloadsCount = downloadLogs.length;
  
  const recentFiles = files.slice(0, 5);
  const recentLogs = logs.slice(0, 5);

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Assembling dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hello, {user?.name}!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access, upload, and securely distribute file assets inside the <span className="font-semibold text-slate-700">{user?.departmentName || 'Organization'}</span> department.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold self-start md:self-auto">
          <ShieldCheck size={16} />
          <span>Security Protocol Active</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Files */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Department Files</span>
            <span className="text-2xl font-bold text-slate-900">{totalFilesCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Folder size={22} />
          </div>
        </div>

        {/* Card 2: Shared Files */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Shared With Me</span>
            <span className="text-2xl font-bold text-slate-900">{sharedFilesCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Card 3: Download Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">File Downloads</span>
            <span className="text-2xl font-bold text-slate-900">{userDownloadsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Download size={22} />
          </div>
        </div>

        {/* Card 4: Action logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Activity Logs</span>
            <span className="text-2xl font-bold text-slate-900">{logs.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* Grid: Recent Files & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Folder size={18} className="text-slate-400" />
              Recent Files
            </h3>
            <Link to="/files" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Browse all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-5 flex-1 space-y-4">
            {recentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center gap-2">
                <FileText size={32} strokeWidth={1.5} />
                <p className="text-xs">No files uploaded in your department yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentFiles.map((file) => (
                  <div key={file.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 truncate">{file.filename}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Size: {formatBytes(file.file_size)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 whitespace-nowrap">
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Audit Logs Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Recent Activity
            </h3>
            {user?.role === 'Admin' && (
              <Link to="/audit-logs" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                Full audits <ArrowRight size={12} />
              </Link>
            )}
          </div>

          <div className="p-5 flex-1 space-y-4">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center gap-2">
                <Activity size={32} strokeWidth={1.5} />
                <p className="text-xs">No activity records logged.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => {
                  let actionColor = 'bg-slate-100 text-slate-700';
                  if (log.action === 'Upload') actionColor = 'bg-blue-50 text-blue-700';
                  if (log.action === 'Download') actionColor = 'bg-amber-50 text-amber-700';
                  if (log.action === 'Delete') actionColor = 'bg-red-50 text-red-700';
                  if (log.action === 'Share') actionColor = 'bg-purple-50 text-purple-700';

                  return (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${actionColor}`}>
                            {log.action}
                          </span>
                          <span className="font-medium text-slate-700">{log.user_name || 'System'}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{log.details}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap pt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
