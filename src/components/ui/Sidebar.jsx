import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/generate', icon: FileText, label: 'Generate Post' },
    { path: '/dashboard/github', icon: GitBranch, label: 'GitHub Repos' },
    { path: '/dashboard/history', icon: History, label: 'History' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-full w-72 flex-col bg-surface border-r border-border px-3 py-5">
      <div className="flex h-20 items-center px-4">
        <h1 className="text-2xl font-bold text-primary-500 leading-tight">
          AI Career Assistant
        </h1>
      </div>
      <nav className="flex-1 space-y-2 px-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-3xl transition-all duration-150',
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2">
        <button
          className="flex w-full items-center gap-3 rounded-3xl bg-slate-950/60 px-4 py-3 text-sm font-medium text-text-secondary transition-all duration-150 hover:bg-slate-900 hover:text-white"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;