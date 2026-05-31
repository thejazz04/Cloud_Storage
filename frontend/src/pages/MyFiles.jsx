import React, { useState, useEffect, useRef } from 'react';
import { fetchFiles, uploadFile, deleteFile, downloadFileLink } from '../services/files';
import { useAuth } from '../context/AuthContext';
import ShareFileModal from '../components/Modals/ShareFileModal';
import { 
  Folder, 
  Upload, 
  Trash2, 
  Share2, 
  Download, 
  Search, 
  FileText, 
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const MyFiles = () => {
  const { user } = useAuth();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // S3 Presigned Config expiry selections: 300s (5m), 600s (10m), 900s (15m)
  const [expirySelection, setExpirySelection] = useState({}); // { [fileId]: 300 }

  // Sharing state
  const [selectedShareFile, setSelectedShareFile] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const loadFiles = async () => {
    try {
      const list = await fetchFiles();
      setFiles(list);
      
      // Initialize default expiry choices
      const defaultExpiries = {};
      list.forEach(f => {
        defaultExpiries[f.id] = 300;
      });
      setExpirySelection(prev => ({ ...defaultExpiries, ...prev }));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch files from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileSelectChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      await uploadFile(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });
      setSuccess(`File "${file.name}" uploaded successfully.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadFiles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload file to S3.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId, filename) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${filename}"?`)) {
      return;
    }

    try {
      await deleteFile(fileId);
      setSuccess(`File "${filename}" deleted successfully.`);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete file.');
    }
  };

  const handleDownload = async (fileId, filename, expiry) => {
    try {
      const data = await downloadFileLink(fileId, expiry);
      
      // Trigger download using an anchor element
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = filename; // S3 response header will force this, but good fallback
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setSuccess(`Temporary download link obtained (expires in ${expiry / 60} mins).`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate S3 presigned URL.');
    }
  };

  const handleExpiryChange = (fileId, value) => {
    setExpirySelection(prev => ({
      ...prev,
      [fileId]: parseInt(value, 10)
    }));
  };

  const openShareModal = (file) => {
    setSelectedShareFile(file);
    setIsShareModalOpen(true);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Department Storage</h2>
          <p className="text-xs text-slate-500 mt-1">Upload and access files assigned to your department</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Upload Drag/Select Area */}
      <div className="p-8 border-2 border-dashed border-slate-250 hover:border-brand-400 bg-white rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center mb-3">
          <Upload size={22} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Upload new assets to AWS S3</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
          Select files under 15MB. Files are locked to your department and inaccessible by employees in other departments unless shared.
        </p>

        {/* Input file and upload progress */}
        <div className="mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelectChange}
            disabled={uploading}
            className="hidden"
            id="file-selector-input"
          />
          <label
            htmlFor="file-selector-input"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm hover:shadow transition-all inline-block"
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </label>
        </div>

        {uploading && (
          <div className="w-full max-w-xs mt-4 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-brand-600 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Uploading: {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Notifications */}
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

      {/* Files List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Retrieving folder contents...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5">
            <Folder size={40} strokeWidth={1.2} />
            <p className="text-xs">No files matching your search query or department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">File Name</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">S3 Credential Exp.</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredFiles.map((file) => {
                  const isOwner = file.owner_id === user?.id;
                  const canModify = isOwner || user?.role === 'Admin';
                  const expiryVal = expirySelection[file.id] || 300;

                  return (
                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Icon */}
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
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {formatBytes(file.file_size)}
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                        {isOwner ? 'Me' : file.owner_name}
                      </td>

                      {/* Uploaded date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                          {file.department_name}
                        </span>
                      </td>

                      {/* Configurable signed URL expiry selection */}
                      <td className="py-4 px-4 whitespace-nowrap">
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
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-1">
                        {/* Download link button */}
                        <button
                          onClick={() => handleDownload(file.id, file.filename, expiryVal)}
                          title="Generate pre-signed S3 link and download"
                          className="p-1.5 hover:bg-slate-100 hover:text-slate-900 text-slate-500 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Download size={15} />
                        </button>

                        {/* Share button (Only owner/admin can share) */}
                        <button
                          onClick={() => openShareModal(file)}
                          disabled={!canModify}
                          title={canModify ? 'Share file' : 'Only uploader can manage permissions'}
                          className={`p-1.5 text-slate-500 rounded-lg transition-colors inline-flex items-center ${
                            canModify 
                              ? 'hover:bg-slate-100 hover:text-slate-900' 
                              : 'opacity-35 cursor-not-allowed'
                          }`}
                        >
                          <Share2 size={15} />
                        </button>

                        {/* Delete button (Only owner/admin can delete) */}
                        <button
                          onClick={() => handleDelete(file.id, file.filename)}
                          disabled={!canModify}
                          title={canModify ? 'Delete file permanently' : 'Only uploader or Admin can delete'}
                          className={`p-1.5 text-slate-500 rounded-lg transition-colors inline-flex items-center ${
                            canModify 
                              ? 'hover:bg-red-50 hover:text-red-600' 
                              : 'opacity-35 cursor-not-allowed'
                          }`}
                        >
                          <Trash2 size={15} />
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

      {/* Share Modal Dialog */}
      <ShareFileModal
        file={selectedShareFile}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedShareFile(null);
        }}
      />
    </div>
  );
};

export default MyFiles;
