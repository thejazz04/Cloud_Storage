import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  FileSpreadsheet, 
  UserCog, 
  Network, 
  LogOut, 
  Menu, 
  X,
  User,
  Shield,
  Building
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Employee']
    },
    {
      name: 'My Files',
      path: '/files',
      icon: FolderOpen,
      roles: ['Admin', 'Employee']
    },
    {
      name: 'Shared Files',
      path: '/shared',
      icon: Users,
      roles: ['Admin', 'Employee']
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      icon: FileSpreadsheet,
      roles: ['Admin']
    },
    {
      name: 'Users',
      path: '/users-admin',
      icon: UserCog,
      roles: ['Admin']
    },
    {
      name: 'Departments',
      path: '/departments-admin',
      icon: Network,
      roles: ['Admin']
    }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } relative hidden md:flex`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 font-semibold text-white overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md shadow-brand-500/20">
              LE
            </div>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              LeaveEase Cloud
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User Quick Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-sm font-semibold uppercase">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className={`${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer Overlay */}
      <div className="md:hidden">
        {/* Toggle button */}
        <div className="absolute top-3 left-4 z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Drawer Menu */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <aside className="relative flex flex-col w-64 bg-slate-900 text-slate-300 h-full max-w-xs shadow-2xl">
              <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <span className="font-semibold text-white text-lg">LeaveEase Cloud</span>
              </div>
              <div className="p-4 border-b border-slate-800">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {visibleMenuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive 
                          ? 'bg-brand-600 text-white shadow-md' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            {/* spacer for mobile toggle button */}
            <div className="w-10 md:hidden"></div>
            <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {visibleMenuItems.find(item => item.path === location.pathname)?.name || 'Application'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Department Badge */}
            {user?.departmentId && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                <Building size={12} className="text-slate-500" />
                <span>Dept: {user.departmentName || 'Assigned'}</span>
              </div>
            )}

            {/* Role Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
              <Shield size={12} className="text-brand-500" />
              <span>Role: {user?.role}</span>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold uppercase text-xs">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden lg:block">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
