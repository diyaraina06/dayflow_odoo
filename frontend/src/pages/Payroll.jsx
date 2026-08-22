import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { DollarSign, FileText, Download } from 'lucide-react';

const Payroll = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);

  // For HR to create payroll
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPayroll, setNewPayroll] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear().toString(),
    basicSalary: '',
    allowances: '',
    deductions: ''
  });

  const fetchPayroll = async () => {
    try {
      const endpoint = user.role === 'hr' ? '/payroll/all' : '/payroll/my';
      const res = await apiClient.get(endpoint);
      setPayrolls(res.data);
      setProfileMissing(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 && user.role === 'employee') {
        setProfileMissing(true);
      } else {
        toast.error('Failed to load payroll records');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [user.role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiClient.post('/payroll', {
        employeeId: newPayroll.employeeId,
        month: Number(newPayroll.month),
        year: Number(newPayroll.year),
        basicSalary: Number(newPayroll.basicSalary),
        allowances: Number(newPayroll.allowances),
        deductions: Number(newPayroll.deductions)
      });
      toast.success('Payroll generated successfully');
      setShowCreate(false);
      setNewPayroll({ employeeId: '', month: '', year: new Date().getFullYear().toString(), basicSalary: '', allowances: '', deductions: '' });
      fetchPayroll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payroll');
    } finally {
      setCreating(false);
    }
  };

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Payroll</h2>
          <p className="text-slate-500 dark:text-zinc-400">Manage salaries and payslips.</p>
        </div>
        {user.role === 'hr' && (
          <button 
            className={`btn-primary ${showCreate ? 'bg-slate-600 hover:bg-slate-700 from-slate-600 to-slate-500' : ''}`}
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? 'Cancel' : 'Generate Payroll'}
          </button>
        )}
      </div>

      {showCreate && (
        <div className="card-glass p-6 animate-slide-in border-l-4 border-l-brand-500">
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <DollarSign className="text-brand-500" size={20} />
            Generate New Payroll
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Employee ID</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="e.g. 64b..."
                  value={newPayroll.employeeId} 
                  onChange={(e) => setNewPayroll({...newPayroll, employeeId: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Month</label>
                <select 
                  className="input-field" 
                  value={newPayroll.month} 
                  onChange={(e) => setNewPayroll({...newPayroll, month: e.target.value})} 
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Year</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={newPayroll.year} 
                  onChange={(e) => setNewPayroll({...newPayroll, year: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-800/50/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-700">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Basic Salary ($)</label>
                <input 
                  type="number" 
                  className="input-field bg-white" 
                  required 
                  min="0"
                  value={newPayroll.basicSalary} 
                  onChange={(e) => setNewPayroll({...newPayroll, basicSalary: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Allowances ($)</label>
                <input 
                  type="number" 
                  className="input-field bg-white" 
                  required 
                  min="0"
                  value={newPayroll.allowances} 
                  onChange={(e) => setNewPayroll({...newPayroll, allowances: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">Deductions ($)</label>
                <input 
                  type="number" 
                  className="input-field bg-white" 
                  required 
                  min="0"
                  value={newPayroll.deductions} 
                  onChange={(e) => setNewPayroll({...newPayroll, deductions: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="text-slate-500 dark:text-zinc-400 text-sm">
                Net Salary: <span className="font-bold text-slate-800 dark:text-zinc-100">
                  ${(Number(newPayroll.basicSalary) + Number(newPayroll.allowances) - Number(newPayroll.deductions)) || 0}
                </span>
              </div>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Generating...' : 'Generate Payroll'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500 dark:text-zinc-400 card-glass">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
            <p>Loading payroll records...</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center card-glass">
            <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full mb-4 text-slate-400">
              <FileText size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">No payroll records found.</p>
            <p className="text-sm">Payslips will appear here when generated.</p>
          </div>
        ) : profileMissing ? (
          <div className="col-span-full p-12 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center card-glass">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-4">
              <FileText size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">Profile Configuration Required</p>
            <p className="text-sm max-w-sm mt-1">Please complete your professional details on the Profile page to access your payslips.</p>
          </div>
        ) : (
          payrolls.map((payroll) => (
            <div key={payroll._id} className="card-glass p-0 overflow-hidden group">
              <div className="p-5 border-b border-slate-100 dark:border-zinc-700 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg">{months.find(m => m.value === payroll.month)?.label || payroll.month} {payroll.year}</h3>
                  <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Paid</span>
                </div>
                {user.role === 'hr' && (
                  <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Employee: {payroll.employeeId?.userId?.employeeId || payroll.employeeId}</p>
                )}
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Basic Salary</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200">${payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Allowances</span>
                  <span className="font-medium text-emerald-600">+${payroll.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Deductions</span>
                  <span className="font-medium text-rose-500">-${payroll.deductions.toLocaleString()}</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-700 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">Net Salary</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                    ${payroll.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/50/50 border-t border-slate-100 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  className="w-full flex items-center justify-center gap-2 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors"
                  onClick={() => toast('Payslip downloading...', { icon: '📥' })}
                >
                  <Download size={16} /> Download Payslip
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Payroll;
