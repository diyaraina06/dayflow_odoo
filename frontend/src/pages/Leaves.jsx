import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  
  // For HR editing balances
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({ sick: 0, casual: 0, earned: 0 });
  
  // Apply leave state
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'Sick'
  });

  const [profileMissing, setProfileMissing] = useState(false);

  const fetchLeaves = async () => {
    try {
      const endpoint = user.role === 'hr' ? '/leaves/all' : '/leaves/my';
      const res = await apiClient.get(endpoint);
      setLeaves(res.data);
      if (user.role === 'hr') {
        try {
          const empRes = await apiClient.get('/employees/all');
          // Filter to only show employees assigned to this HR
          const managedEmployees = empRes.data.filter(emp => 
            emp.assignedHR && emp.assignedHR._id === user.id
          );
          setEmployees(managedEmployees);
        } catch (err) {
          console.error("Failed to fetch employees", err);
        }
      }
      setProfileMissing(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 && user.role === 'employee') {
        setProfileMissing(true);
      } else {
        toast.error('Failed to load leave records');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user.role]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await apiClient.post('/leaves', newLeave);
      toast.success('Leave application submitted successfully');
      setShowApply(false);
      setNewLeave({ startDate: '', endDate: '', reason: '', leaveType: 'Sick' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setApplying(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error('Failed to update leave status');
    }
  };

  const openBalanceEdit = (emp) => {
    setEditingBalance(emp);
    setBalanceForm({
      sick: emp.leaveBalance?.sick || 0,
      casual: emp.leaveBalance?.casual || 0,
      earned: emp.leaveBalance?.earned || 0
    });
  };

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/employees/${editingBalance._id}/leave-balance`, balanceForm);
      toast.success('Leave balance updated successfully');
      setEditingBalance(null);
      fetchLeaves();
    } catch (err) {
      toast.error('Failed to update leave balance');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle size={12}/> Approved</span>;
      case 'Rejected': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700"><XCircle size={12}/> Rejected</span>;
      default: 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Leave Management</h2>
          <p className="text-slate-500 dark:text-zinc-400">View and manage leave applications.</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'hr' && (
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'applications' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:text-zinc-200'}`}
                onClick={() => setActiveTab('applications')}
              >
                Applications
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'balances' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:text-zinc-200'}`}
                onClick={() => setActiveTab('balances')}
              >
                Leave Balances
              </button>
            </div>
          )}
          
          {user.role === 'employee' && (
            <button 
              className={`btn-primary ${showApply ? 'bg-slate-600 hover:bg-slate-700 from-slate-600 to-slate-500' : ''}`}
              onClick={() => setShowApply(!showApply)}
            >
              {showApply ? 'Cancel Application' : 'Apply for Leave'}
            </button>
          )}
        </div>
      </div>

      {showApply && (
        <div className="card-glass p-6 animate-slide-in border-l-4 border-l-brand-500">
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <Briefcase className="text-brand-500" size={20} />
            New Leave Application
          </h3>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Leave Type</label>
                <select 
                  className="input-field"
                  value={newLeave.leaveType} 
                  onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="Other">Other Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  required 
                  value={newLeave.startDate} 
                  onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">End Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  required 
                  value={newLeave.endDate} 
                  onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Reason</label>
              <textarea 
                className="input-field resize-none" 
                required 
                rows={3} 
                placeholder="Please provide a brief reason for your leave..."
                value={newLeave.reason} 
                onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="card-glass overflow-hidden">
          {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
            <p>Loading leave records...</p>
          </div>
        ) : profileMissing ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-4">
              <Briefcase size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">Profile Configuration Required</p>
            <p className="text-sm max-w-sm mt-1">Please complete your professional details on the Profile page before applying for leaves.</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center">
            <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full mb-4 text-slate-400">
              <Briefcase size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">No leave records found.</p>
            <p className="text-sm">Leave applications will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
                  {user.role === 'hr' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Employee</th>}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  {user.role === 'hr' && <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50 dark:bg-zinc-800/50/50 transition-colors">
                    {user.role === 'hr' && (
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-zinc-100">
                        {leave.employeeId 
                          ? `${leave.employeeId.firstName || ''} ${leave.employeeId.lastName || ''} (${leave.employeeId.userId?.employeeId || 'No ID'})`
                          : 'Unknown Employee'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 capitalize">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${leave.leaveType === 'Sick' ? 'bg-rose-500' : leave.leaveType === 'Earned' ? 'bg-brand-500' : 'bg-purple-500'}`}></span>
                        {leave.leaveType}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 text-sm whitespace-nowrap">
                      {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - 
                      {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 text-sm max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    {user.role === 'hr' && (
                      <td className="px-6 py-4 text-right">
                        {leave.status === 'Pending' ? (
                          leave.employeeId?.userId?._id === user.id || leave.employeeId?.userId === user.id ? (
                            <span className="text-slate-400 text-sm italic">Self</span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => updateStatus(leave._id, 'Approved')} 
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button 
                                onClick={() => updateStatus(leave._id, 'Rejected')} 
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle size={20} />
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {activeTab === 'balances' && user.role === 'hr' && (
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Sick Leave</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Casual Leave</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Earned Leave</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 dark:bg-zinc-800/50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-zinc-100">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{emp.userId?.employeeId || 'No ID'}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-rose-600">{emp.leaveBalance?.sick || 0}</td>
                    <td className="px-6 py-4 text-center font-semibold text-purple-600">{emp.leaveBalance?.casual || 0}</td>
                    <td className="px-6 py-4 text-center font-semibold text-brand-600">{emp.leaveBalance?.earned || 0}</td>
                    <td className="px-6 py-4 text-right">
                      {emp.userId?._id !== user.id ? (
                        <button 
                          onClick={() => openBalanceEdit(emp)}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                        >
                          Edit Balance
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-slate-400 cursor-not-allowed">
                          (Your Profile)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-zinc-400">No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {editingBalance && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-700 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg">Edit Leave Balance</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">For {editingBalance.firstName} {editingBalance.lastName}</p>
              </div>
              <button 
                onClick={() => setEditingBalance(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-300 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBalance} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Sick Leave</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  value={balanceForm.sick}
                  onChange={(e) => setBalanceForm({...balanceForm, sick: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Casual Leave</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  value={balanceForm.casual}
                  onChange={(e) => setBalanceForm({...balanceForm, casual: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Earned Leave</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  value={balanceForm.earned}
                  onChange={(e) => setBalanceForm({...balanceForm, earned: Number(e.target.value)})}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingBalance(null)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
