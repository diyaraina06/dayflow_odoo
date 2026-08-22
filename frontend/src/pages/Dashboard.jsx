import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Calendar, Briefcase, Bell, ArrowRight, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    attendanceStatus: 'Loading...',
    pendingLeaves: 0,
    unreadNotifications: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let leavesData = [];
        let myLeavesData = [];
        let notificationsData = [];
        let attendanceData = [];

        try {
          const leavesRes = await apiClient.get(user.role === 'hr' ? '/leaves/all' : '/leaves/my');
          leavesData = leavesRes.data;
          
          if (user.role === 'hr') {
            const myLeavesRes = await apiClient.get('/leaves/my');
            myLeavesData = myLeavesRes.data;
          } else {
            myLeavesData = leavesData;
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error('Failed to fetch leaves', err);
          }
        }

        try {
          // Always fetch 'my' attendance for today's status, even for HR
          const attendanceRes = await apiClient.get('/attendance/my');
          attendanceData = attendanceRes.data;
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error('Failed to fetch attendance', err);
          }
        }

        try {
          const notificationsRes = await apiClient.get('/notifications');
          notificationsData = notificationsRes.data;
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        }
        
        const pendingLeaves = leavesData.filter(l => l.status === 'pending' || l.status === 'Pending').length;
        const unreadNotifs = notificationsData.filter(n => !n.isRead).length;

        let todayStatus = 'Not Checked In';
        if (attendanceData.length > 0) {
          const latest = attendanceData[0];
          const today = new Date();
          const latestDate = new Date(latest.date);
          if (latestDate.toDateString() === today.toDateString()) {
            if (latest.checkIn && !latest.checkOut) {
              todayStatus = 'Checked In';
            } else if (latest.checkIn && latest.checkOut) {
              todayStatus = 'Checked Out';
            }
          }
        }

        let activities = [];

        attendanceData.forEach(record => {
            if (record.checkIn) {
                activities.push({
                    id: `att-in-${record._id}`,
                    title: 'Checked In',
                    time: new Date(record.checkIn),
                    icon: Calendar,
                    color: 'text-brand-600 dark:text-brand-400',
                    bg: 'bg-brand-100 dark:bg-brand-900/30'
                });
            }
            if (record.checkOut) {
                activities.push({
                    id: `att-out-${record._id}`,
                    title: 'Checked Out',
                    time: new Date(record.checkOut),
                    icon: Calendar,
                    color: 'text-slate-600 dark:text-slate-400',
                    bg: 'bg-slate-100 dark:bg-slate-900/30'
                });
            }
        });

        myLeavesData.forEach(record => {
            const statusLower = (record.status || '').toLowerCase();
            activities.push({
                id: `leave-${record._id}`,
                title: `Leave application ${statusLower}`,
                time: new Date(record.updatedAt || record.createdAt),
                icon: Briefcase,
                color: statusLower === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 
                       statusLower === 'rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400',
                bg: statusLower === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
                    statusLower === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
            });
        });

        activities.sort((a, b) => b.time - a.time);
        const recentActivity = activities.slice(0, 3);

        setStats({
          attendanceStatus: todayStatus,
          pendingLeaves,
          unreadNotifications: unreadNotifs,
          recentActivity
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        toast.error('Failed to load dashboard statistics');
      }
    };

    fetchDashboardData();
  }, [user.role]);

  const statCards = [
    {
      title: "Today's Status",
      value: stats.attendanceStatus,
      icon: Clock,
      color: "from-blue-500 to-blue-400",
      bg: "bg-blue-50 text-blue-600"
    },
    {
      title: user.role === 'hr' ? 'Pending Leave Approvals' : 'My Pending Leaves',
      value: stats.pendingLeaves,
      icon: Briefcase,
      color: "from-amber-500 to-amber-400",
      bg: "bg-amber-50 text-amber-600"
    },
    {
      title: 'Unread Notifications',
      value: stats.unreadNotifications,
      icon: Bell,
      color: "from-rose-500 to-rose-400",
      bg: "bg-rose-50 text-rose-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Here's what's happening today.</p>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {/* Avatar stack decoration */}
          {[1,2,3,4].map(i => (
             <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={`https://i.pravatar.cc/100?img=${i}`} alt=""/>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card-glass p-6 group hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} dark:bg-zinc-800/50 dark:text-brand-400 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mt-1">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 card-glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Recent Activity</h3>
            <button 
              className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1 transition-colors"
              onClick={() => navigate('/attendance')}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => {
                const Icon = activity.icon;
                const isToday = activity.time.toDateString() === new Date().toDateString();
                const timeString = activity.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateString = isToday ? `Today at ${timeString}` : `${activity.time.toLocaleDateString()} ${timeString}`;

                return (
                  <div key={activity.id} className="flex gap-4 items-start p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-800/30 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-700">
                    <div className={`h-10 w-10 rounded-full ${activity.bg} ${activity.color} flex items-center justify-center shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-zinc-100 font-medium capitalize">{activity.title}</p>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm mt-0.5">{dateString}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-700 rounded-xl">
                No recent activity found.
              </div>
            )}
          </div>
        </div>

        <div className="card-glass p-6 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-brand-900 dark:to-brand-800 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full mix-blend-overlay filter blur-xl transform translate-x-10 -translate-y-10"></div>
           <h3 className="text-lg font-bold mb-2 text-white">Quick Actions</h3>
           <p className="text-slate-400 dark:text-brand-200 text-sm mb-6">Access your most used tools quickly.</p>
           
           <div className="space-y-3">
             <button 
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-sm"
                onClick={() => navigate('/attendance')}
             >
               <div className="flex items-center gap-3">
                 <Clock size={18} className="text-brand-300" />
                 <span className="font-medium text-sm">Mark Attendance</span>
               </div>
               <ArrowRight size={16} className="text-slate-400" />
             </button>
             <button 
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-sm"
                onClick={() => navigate('/leaves')}
             >
               <div className="flex items-center gap-3">
                 <Briefcase size={18} className="text-purple-300" />
                 <span className="font-medium text-sm">Apply for Leave</span>
               </div>
               <ArrowRight size={16} className="text-slate-400" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
