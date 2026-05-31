import React, { useState } from 'react';
import { shareFileWithUser } from '../../services/files';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';

const ShareFileModal = ({ file, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('View');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !file) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await shareFileWithUser(file.id, email.toLowerCase().trim(), permission);
      setSuccess(`Successfully shared "${file.filename}" with ${email}.`);
      setEmail('');
      setPermission('View');
      // Wait 1.5s then auto close
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to share the file. Please verify the email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-150">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Share File</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[280px]">
              Sharing: <span className="font-medium text-slate-700">{file.filename}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Recipient Email Address
            </label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              required
            />
          </div>

          {/* Permission Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Access Permission Level
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              <option value="View">View Only (Metadata only)</option>
              <option value="Download">Download (Metadata & download link)</option>
              <option value="Edit">Edit (Metadata, edit options, & download)</option>
            </select>
            <p className="text-[10px] text-slate-400 leading-normal mt-1">
              Note: Shared users cannot delete the file or change its sharing settings. Only the uploader and administrators hold deletion privileges.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-55"
            >
              {loading ? 'Sharing...' : 'Share'}
              {!loading && <Send size={14} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareFileModal;
