import React, { useState, useEffect } from 'react';
import { fetchDepartmentsList } from '../services/auth';
import AddDepartmentModal from '../components/Modals/AddDepartmentModal';
import { 
  Network, 
  Plus, 
  Building, 
  Hash, 
  Database,
  Building2
} from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDepartments = async () => {
    try {
      const data = await fetchDepartmentsList();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Departments</h2>
          <p className="text-xs text-slate-500 mt-1">Create and audit structural organization units</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
        >
          <Plus size={14} />
          Add Department
        </button>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Loading organization charts...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5">
            <Network size={40} strokeWidth={1.2} />
            <p className="text-xs">No departments have been initialized.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Department ID</th>
                  <th className="py-3.5 px-5">Department Title</th>
                  <th className="py-3.5 px-5">S3 Partition Key Prefix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-5 font-semibold text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Hash size={12} className="text-slate-450" />
                        <span>{dept.id}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-5 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Building2 size={16} className="text-brand-500" />
                        <span>{dept.name}</span>
                      </div>
                    </td>

                    {/* S3 Partition Key */}
                    <td className="py-4 px-5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Database size={12} />
                        <span>uploads/{dept.id}/*</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal create department dialog */}
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={loadDepartments}
      />
    </div>
  );
};

export default Departments;
