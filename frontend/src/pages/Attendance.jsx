import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { Clock, LogIn, LogOut, Calendar, Users, Briefcase } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [activeTab, setActiveTab] = useState('my-attendance'); // 'my-attendance' or 'team-attendance'

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      if (user.role === 'hr') {
        if (activeTab === 'my-attendance') {
          try {
            const res = await apiClient.get('/attendance/my');
            setAttendance(res.data);
            setProfileMissing(false);
          } catch (err) {
            if (err.response?.status === 404) {
              setProfileMissing(true);
            } else {
              throw err;
            }
          }
        } else {
          // Team attendance tab
          const [attRes, empRes, leavesRes] = await Promise.all([
            apiClient.get('/attendance/all'),
            apiClient.get('/employees/all'),
            apiClient.get('/leaves/all')
          ]);
          setTeamAttendance(attRes.data);
          setEmployees(empRes.data);
          setLeaves(leavesRes.data);
          setProfileMissing(false);
        }
      } else {
        try {
          const res = await apiClient.get('/attendance/my');
          setAttendance(res.data);
          setProfileMissing(false);
        } catch (err) {
          if (err.response?.status === 404) {
            setProfileMissing(true);
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user.role, activeTab]);

  const handleAction = async (type) => {
    if (profileMissing) {
      toast.error('Please complete your profile first');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.post(`/attendance/${type}`);
      toast.success(`Successfully ${type === 'check-in' ? 'checked in' : 'checked out'}`);
      fetchAttendance(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${type}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Attendance Log</h2>
          <p className="text-slate-500 dark:text-zinc-400">Track and manage attendance records.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user.role === 'hr' && (
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg mr-2">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'my-attendance' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:text-zinc-200'}`}
                onClick={() => setActiveTab('my-attendance')}
              >
                My Attendance
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'team-attendance' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:text-zinc-200'}`}
                onClick={() => setActiveTab('team-attendance')}
              >
                Team Attendance
              </button>
            </div>
          )}

          {(user.role === 'employee' || (user.role === 'hr' && activeTab === 'my-attendance')) && (
            <div className="flex gap-3">
              <button 
                className="btn-primary flex items-center gap-2 animate-slide-in" 
                onClick={() => handleAction('check-in')}
                disabled={actionLoading || profileMissing}
              >
                <LogIn size={18} /> Check In
              </button>
              <button 
                className="btn-secondary flex items-center gap-2 animate-slide-in" 
                onClick={() => handleAction('check-out')}
                disabled={actionLoading || profileMissing}
              >
                <LogOut size={18} /> Check Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
            <p>Loading records...</p>
          </div>
        ) : (user.role === 'employee' || activeTab === 'my-attendance') && profileMissing ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-4">
              <Clock size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">Profile Configuration Required</p>
            <p className="text-sm max-w-sm mt-1">Please complete your professional details on the Profile page before logging attendance.</p>
          </div>
        ) : (user.role === 'employee' || activeTab === 'my-attendance') ? (
          attendance.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center">
              <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full mb-4 text-slate-400">
                <Calendar size={32} />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">No attendance records found.</p>
              <p className="text-sm">When you check in, your records will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50 dark:bg-zinc-800/50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-zinc-200">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {record.checkIn ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-sm font-medium">
                            <Clock size={14} />
                            {new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {record.checkOut ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-sm font-medium">
                            <Clock size={14} />
                            {new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {record.checkIn && record.checkOut ? (
                          <span className="text-emerald-500 font-medium text-sm flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed</span>
                        ) : (
                          <span className="text-amber-500 font-medium text-sm flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Team Attendance Tab */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Check In Today</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Check Out Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(emp => emp.assignedHR?._id === user.id).map((emp) => {
                  // 1. Calculate leave status
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const isOnLeave = leaves.some(l => {
                    if (l.employeeId?._id !== emp._id || l.status !== 'Approved') return false;
                    const start = new Date(l.startDate);
                    start.setHours(0,0,0,0);
                    const end = new Date(l.endDate);
                    end.setHours(0,0,0,0);
                    return today >= start && today <= end;
                  });

                  // 2. Calculate attendance today
                  const startOfDay = new Date();
                  startOfDay.setHours(0,0,0,0);
                  const endOfDay = new Date();
                  endOfDay.setHours(23,59,59,999);

                  const todayRecord = teamAttendance.find(att => {
                    const empId = att.employeeId?._id || att.employeeId;
                    if (empId !== emp._id) return false;
                    const d = new Date(att.date);
                    return d >= startOfDay && d <= endOfDay;
                  });

                  let statusText = 'Absent';
                  let statusColor = 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
                  
                  if (isOnLeave) {
                    statusText = 'On Leave';
                    statusColor = 'bg-purple-50 text-purple-700 border-purple-100';
                  } else if (todayRecord) {
                    if (todayRecord.checkOut) {
                      statusText = 'Checked Out';
                      statusColor = 'bg-blue-50 text-blue-700 border-blue-100';
                    } else {
                      statusText = 'Checked In';
                      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    }
                  }

                  return (
                    <tr key={emp._id} className="hover:bg-slate-50 dark:bg-zinc-800/50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 dark:text-zinc-100">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{emp.userId?.employeeId || 'No ID'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 text-sm">
                        {todayRecord?.checkIn ? (
                          <span className="font-medium text-slate-800 dark:text-zinc-100">
                            {new Date(todayRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 text-sm">
                        {todayRecord?.checkOut ? (
                          <span className="font-medium text-slate-800 dark:text-zinc-100">
                            {new Date(todayRecord.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {employees.filter(emp => emp.assignedHR?._id === user.id).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-zinc-400">
                      No employees are currently assigned to your team. Claim them under Profile settings first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
