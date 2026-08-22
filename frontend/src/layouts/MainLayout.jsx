import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Briefcase, DollarSign, Bell, LogOut, User, Menu, Check, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchNotifsAndProfile = async () => {
      try {
        const notifRes = await apiClient.get('/notifications');
        setNotifications(notifRes.data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
      try {
        const profRes = await apiClient.get('/employees/profile');
        setProfile(profRes.data);
      } catch (err) {
        // Expected if user hasn't created a profile yet
      }
    };
    if (user) fetchNotifsAndProfile();
  }, [user]);

  const displayName = profile?.firstName 
    ? `${profile.firstName} ${profile.lastName || ''}`.trim() 
    : user?.name || 'User';
  
  const displayInitials = profile?.firstName
    ? profile.firstName.charAt(0).toUpperCase()
    : (user?.name ? user.name.charAt(0).toUpperCase() : 'U');

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Leaves', path: '/leaves', icon: Briefcase },
    { name: 'Payroll', path: '/payroll', icon: DollarSign },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden text-slate-900 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className={`bg-slate-900 dark:bg-zinc-900 text-white w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full z-20 shadow-2xl'} lg:relative lg:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 bg-slate-950/50 dark:bg-zinc-950/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
            Dayflow
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-500/20 text-brand-300' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-white transition-colors'} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 shrink-0 border-t border-white/10 bg-slate-950/30 dark:bg-zinc-950/30">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            <LogOut size={18} /> 
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 hidden sm:block">
              Welcome back, <span className="text-brand-600 dark:text-brand-400">{displayName}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-5 relative">
            <button
              className="text-slate-400 dark:text-zinc-400 hover:text-brand-500 transition-colors"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <button 
              className="relative text-slate-400 dark:text-zinc-400 hover:text-brand-500 transition-colors"
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {notifOpen && (
              <div className="absolute top-full right-12 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-50 animate-slide-in">
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-950">
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-zinc-400 text-sm">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`p-4 border-b border-slate-50 dark:border-zinc-800/50 transition-colors ${!notif.isRead ? 'bg-brand-50/30 dark:bg-brand-900/10' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-medium ${!notif.isRead ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-800 dark:text-zinc-300'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-xs ${!notif.isRead ? 'text-slate-600 dark:text-zinc-400' : 'text-slate-500 dark:text-zinc-500'}`}>
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {unreadCount > 0 && (
                  <div 
                    className="p-3 text-center border-t border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors flex items-center justify-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700"
                    onClick={markAllAsRead}
                  >
                    <Check size={14} />
                    <span className="text-sm font-medium">Mark All as Read</span>
                  </div>
                )}
              </div>
            )}

            <div 
              className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            >
              {displayInitials}
            </div>

            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-50 animate-slide-in">
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                  <p className="font-bold text-slate-800 dark:text-zinc-100 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 capitalize">{user?.role || 'Employee'}</p>
                </div>
                <div className="py-2">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" onClick={() => setProfileOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative" onClick={() => { setProfileOpen(false); setNotifOpen(false); }}>
          <div className="max-w-6xl mx-auto animate-slide-in">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
