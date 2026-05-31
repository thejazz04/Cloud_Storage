import React, { useState, useEffect } from 'react';
import { fetchSharedFiles, downloadFileLink } from '../services/files';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Download, 
  FileText, 
  AlertCircle, 
  Lock, 
  Unlock,
  Building,
  Clock
} from 'lucide-react';

const SharedFiles = () => {
  const { user } = useAuth();
  
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Custom S3 url expiry selections: default 300s (5m)
  const [expirySelection, setExpirySelection] = useState({});

  const loadSharedFiles = async () => {
    try {
      const data = await fetchSharedFiles();
      setSharedFiles(data);
      
      const defaultExpiries = {};
      data.forEach(f => {
        defaultExpiries[f.id] = 300;
      });
      setExpirySelection(prev => ({ ...defaultExpiries, ...prev }));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch shared files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const handleDownload = async (fileId, filename, expiry) => {
    try {
      const data = await downloadFileLink(fileId, expiry);
      
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccess(`Download link retrieved successfully (expires in ${expiry / 60} mins).`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to download the shared file.');
    }
  };

  const handleExpiryChange = (fileId, value) => {
    setExpirySelection(prev => ({
      ...prev,
      [fileId]: parseInt(value, 10)
    }));
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Shared Files</h2>
        <p className="text-xs text-slate-500 mt-1">Files shared with you from other departments or users</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Retrieving shared database entries...</p>
          </div>
        ) : sharedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5">
            <Users size={40} strokeWidth={1.2} />
            <p className="text-xs">No files have been shared with you yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">File Name</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Uploader / Owner</th>
                  <th className="py-3.5 px-4">Dept Source</th>
                  <th className="py-3.5 px-4">Permission</th>
                  <th className="py-3.5 px-4">S3 Link Expiry</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {sharedFiles.map((file) => {
                  const permission = file.permission_type;
                  const canDownload = permission === 'Download' || permission === 'Edit';
                  const expiryVal = expirySelection[file.id] || 300;

                  return (
                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-5 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} />
                          </div>
                          <span className="truncate max-w-[200px]" title={file.filename}>
                            {file.filename}
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-4 px-4 text-slate-500">
                        {formatBytes(file.file_size)}
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-4 text-slate-600">
                        {file.owner_name}
                      </td>

                      {/* Source Department */}
                      <td className="py-4 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Building size={12} className="text-slate-400" />
                          <span>{file.department_name}</span>
                        </div>
                      </td>

                      {/* Permission Level Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          permission === 'Edit' 
                            ? 'bg-blue-50 text-blue-700' 
                            : permission === 'Download' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-amber-50 text-amber-700'
                        }`}>
                          {permission === 'Edit' ? <Unlock size={10} /> : <Lock size={10} />}
                          {permission}
                        </span>
                      </td>

                      {/* Expiry selection (Disabled if only view access) */}
                      <td className="py-4 px-4">
                        {canDownload ? (
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            <select
                              value={expiryVal}
                              onChange={(e) => handleExpiryChange(file.id, e.target.value)}
                              className="bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 text-xs py-0.5 pr-6 cursor-pointer font-medium"
                            >
                              <option value="300">5 Mins</option>
                              <option value="600">10 Mins</option>
                              <option value="900">15 Mins</option>
                            </select>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No download rights</span>
                        )}
                      </td>

                      {/* Download link trigger (Disabled for View permission) */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDownload(file.id, file.filename, expiryVal)}
                          disabled={!canDownload}
                          title={canDownload ? 'Generate download link' : 'View only permission restricts download'}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center ${
                            canDownload 
                              ? 'hover:bg-slate-100 hover:text-slate-900 text-slate-500' 
                              : 'opacity-30 cursor-not-allowed text-slate-400'
                          }`}
                        >
                          <Download size={15} />
                        </button>
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

export default SharedFiles;
