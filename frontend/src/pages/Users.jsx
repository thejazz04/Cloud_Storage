import React, { useState, useEffect } from 'react';
import { fetchUsersList, updateUserRoleAndDept, deleteUser } from '../services/admin';
import { fetchDepartmentsList } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { 
  UserCog, 
  Trash2, 
  Save, 
  ShieldAlert, 
  UserCheck,
  Building,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states maps
  const [rolesState, setRolesState] = useState({}); // { [userId]: role }
  const [deptsState, setDeptsState] = useState({}); // { [userId]: deptId }

  const loadData = async () => {
    try {
      const [usersList, deptsList] = await Promise.all([
        fetchUsersList(),
        fetchDepartmentsList()
      ]);
      setUsers(usersList);
      setDepartments(deptsList);

      // Initialize form mappings
      const initialRoles = {};
      const initialDepts = {};
      usersList.forEach(u => {
        initialRoles[u.id] = u.role;
        initialDepts[u.id] = u.department_id ? u.department_id.toString() : '';
      });
      setRolesState(initialRoles);
      setDeptsState(initialDepts);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user list or departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (userId, value) => {
    setRolesState(prev => ({ ...prev, [userId]: value }));
  };

  const handleDeptChange = (userId, value) => {
    setDeptsState(prev => ({ ...prev, [userId]: value }));
  };

  const handleUpdate = async (userId) => {
    const updatedRole = rolesState[userId];
    const updatedDept = deptsState[userId];

    setSavingId(userId);
    setError('');
    setSuccess('');

    try {
      const deptIdValue = updatedDept === '' ? null : parseInt(updatedDept, 10);
      await updateUserRoleAndDept(userId, updatedRole, deptIdValue);
      setSuccess('User privileges updated successfully.');
      setTimeout(() => setSuccess(''), 2500);
      
      // Update local state list to show new labels
      setUsers(users.map(u => {
        if (u.id === userId) {
          const matchedDept = departments.find(d => d.id.toString() === updatedDept);
          return {
            ...u,
            role: updatedRole,
            department_id: deptIdValue,
            department_name: matchedDept ? matchedDept.name : 'None'
          };
        }
        return u;
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update user config.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (userId === currentUser?.id) {
      setError('Self-deletion is prohibited.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"? This action deletes all their files cascade-style.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await deleteUser(userId);
      setSuccess(`User "${name}" deleted from system.`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Management</h2>
        <p className="text-xs text-slate-500 mt-1">Manage user roles, modify department bounds, or remove accounts</p>
      </div>

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

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Fetching active personnel directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5">
            <UserCheck size={40} strokeWidth={1.2} />
            <p className="text-xs">No registered users in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Name & Email</th>
                  <th className="py-3.5 px-4">Register Date</th>
                  <th className="py-3.5 px-4">Current Department</th>
                  <th className="py-3.5 px-4">Change Department</th>
                  <th className="py-3.5 px-4">Change Role</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map((item) => {
                  const isCurrent = item.id === currentUser?.id;
                  const isSaving = savingId === item.id;
                  const selectedRole = rolesState[item.id] || item.role;
                  const selectedDept = deptsState[item.id] !== undefined ? deptsState[item.id] : '';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name and Email */}
                      <td className="py-4 px-5 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center text-xs font-bold uppercase">
                            {item.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="flex items-center gap-1.5">
                              {item.name}
                              {isCurrent && (
                                <span className="bg-slate-900 text-white text-[9px] px-1 py-0.2 rounded font-bold uppercase scale-90">
                                  You
                                </span>
                              )}
                            </span>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Reg Date */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>

                      {/* Department Display Label */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {item.department_name || 'None'}
                        </span>
                      </td>

                      {/* Department Modify Selector */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Building size={12} className="text-slate-400" />
                          <select
                            value={selectedDept}
                            onChange={(e) => handleDeptChange(item.id, e.target.value)}
                            className="bg-transparent border border-slate-200 rounded px-1.5 py-1 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer font-medium"
                          >
                            <option value="">No Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Role Modify Selector */}
                      <td className="py-4 px-4">
                        <select
                          value={selectedRole}
                          onChange={(e) => handleRoleChange(item.id, e.target.value)}
                          className="bg-transparent border border-slate-200 rounded px-1.5 py-1 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer font-medium"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                        {/* Save Button */}
                        <button
                          onClick={() => handleUpdate(item.id)}
                          disabled={isSaving}
                          title="Save modifications"
                          className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Save size={14} className={isSaving ? 'animate-pulse' : ''} />
                        </button>

                        {/* Delete User Button */}
                        <button
                          onClick={() => handleDeleteUser(item.id, item.name)}
                          disabled={isCurrent}
                          title={isCurrent ? 'Self-deletion prohibited' : 'Delete user'}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center ${
                            isCurrent 
                              ? 'opacity-30 cursor-not-allowed text-slate-450' 
                              : 'hover:bg-red-50 hover:text-red-600 text-slate-500'
                          }`}
                        >
                          <Trash2 size={14} />
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

export default Users;
