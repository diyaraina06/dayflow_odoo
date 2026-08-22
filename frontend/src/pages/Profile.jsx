import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Building, Briefcase, Camera, Users, UserPlus, UserMinus, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    department: '',
    designation: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'team'
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/employees/profile');
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (user.role !== 'hr') return;
    setLoadingEmployees(true);
    try {
      const res = await apiClient.get('/employees/all');
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employee list');
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'team') {
      fetchEmployees();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/employees/profile', profile);
      toast.success('Profile updated successfully');
    } catch (err) {
      try {
        await apiClient.post('/employees/profile', profile);
        toast.success('Profile created successfully');
      } catch (error) {
        toast.error('Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClaim = async (empId) => {
    try {
      await apiClient.put(`/employees/${empId}/assign-hr`);
      toast.success('Employee successfully added to your team!');
      fetchEmployees();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to claim employee';
      toast.error(errMsg, { duration: 6000 });
    }
  };

  const handleDrop = async (empId) => {
    try {
      await apiClient.put(`/employees/${empId}/drop-hr`);
      toast.success('Employee dropped from your team');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to drop employee');
    }
  };

  const showHRContactInfo = (assignedHRProfile) => {
    if (!assignedHRProfile) return;
    const name = `${assignedHRProfile.firstName} ${assignedHRProfile.lastName}`;
    const email = assignedHRProfile.email;
    const phone = assignedHRProfile.phone || 'N/A';
    toast(
      (t) => (
        <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-zinc-200">
          <p className="font-semibold text-slate-800 dark:text-zinc-100">HR Assignment Details:</p>
          <p><span className="font-medium">Manager:</span> {name}</p>
          <p><span className="font-medium">Email:</span> <a href={`mailto:${email}`} className="text-brand-600 underline">{email}</a></p>
          <p><span className="font-medium">Phone:</span> {phone}</p>
        </div>
      ),
      { icon: 'ℹ️', duration: 8000 }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const myEmployeeRecord = employees.find(emp => emp.userId?._id === user.id);
  const myManagerId = myEmployeeRecord?.assignedHR?._id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Profile Settings</h2>
          <p className="text-slate-500 dark:text-zinc-400">Manage your profile and teams.</p>
        </div>
        
        {user?.role === 'hr' && (
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'profile' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:text-zinc-200'}`}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'team' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:text-zinc-200'}`}
              onClick={() => setActiveTab('team')}
            >
              Team Management
            </button>
          </div>
        )}
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="card-glass p-6 text-center animate-slide-in relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-32 z-0 ${user?.role === 'hr' ? 'bg-gradient-to-r from-rose-500 to-orange-400' : 'bg-gradient-to-r from-brand-500 to-purple-500'}`}></div>
            
            <div className="relative z-10 pt-16">
              <div className="mx-auto h-24 w-24 rounded-full bg-white p-1 shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                <div className="h-full w-full rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                  {/* Mock Avatar */}
                  <span className="text-3xl font-bold text-brand-600">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <button className="absolute bottom-0 w-full h-1/3 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={14} className="text-white" />
                  </button>
                </div>
              </div>
              
              <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-zinc-100 flex items-center justify-center gap-2">
                {(profile.firstName || profile.lastName) 
                  ? `${profile.firstName} ${profile.lastName}` 
                  : (user?.name || 'Employee Name')}
              </h3>
              {user?.role === 'hr' && (
                <div className="mt-2">
                  <span className="bg-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border border-rose-200">
                    HR Administrator
                  </span>
                </div>
              )}
              <p className="text-brand-600 font-medium text-sm">{profile.designation || 'Add Designation'}</p>
              
              <div className="mt-6 border-t border-slate-100 dark:border-zinc-700 pt-6 space-y-3">
                <div className="flex items-center text-sm text-slate-600 dark:text-zinc-300">
                  <User size={16} className="mr-3 text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-zinc-100 mr-2">Role:</span> 
                  <span className="capitalize">{user?.role || 'Employee'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-zinc-300">
                  <Building size={16} className="mr-3 text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-zinc-100 mr-2">Dept:</span> 
                  {profile.department || 'Not Set'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="card-glass p-6 sm:p-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6 border-b border-slate-100 dark:border-zinc-700 pb-4">Personal Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="firstName">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      className="input-field pl-10" 
                      placeholder="e.g. John"
                      value={profile.firstName || ''} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="lastName">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      className="input-field pl-10" 
                      placeholder="e.g. Doe"
                      value={profile.lastName || ''} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="department">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      id="department" 
                      name="department" 
                      className="input-field pl-10" 
                      placeholder="e.g. Engineering"
                      value={profile.department || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="designation">Designation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      id="designation" 
                      name="designation" 
                      className="input-field pl-10" 
                      placeholder="e.g. Senior Developer"
                      value={profile.designation || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    id="phone" 
                    name="phone" 
                    className="input-field pl-10" 
                    placeholder="+1 (555) 000-0000"
                    value={profile.phone || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2" htmlFor="address">Address</label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <MapPin size={16} className="text-slate-400" />
                  </div>
                  <textarea 
                    id="address" 
                    name="address" 
                    className="input-field pl-10 resize-none" 
                    rows={4} 
                    placeholder="Enter your full address"
                    value={profile.address || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-700">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      ) : (
        <div className="card-glass p-6 sm:p-8 animate-slide-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-zinc-700">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Employee Assignments</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Claim employees for your team (Max 5 recommended). One employee can only be managed by one HR.</p>
            </div>
            <span className="bg-brand-50 text-brand-700 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 border border-brand-100">
              <Users size={14} />
              Your Team: {employees.filter(emp => emp.assignedHR?._id === user.id).length} Managed
            </span>
          </div>

          {loadingEmployees ? (
            <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
              <p>Loading employees...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Designation</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Assignment Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.filter(emp => emp.userId?._id !== user.id).map((emp) => {
                    const isAssignedToMe = emp.assignedHR?._id === user.id;
                    const isAssignedToOther = emp.assignedHR && emp.assignedHR?._id !== user.id;
                    const isMyManager = myManagerId && emp.userId?._id === myManagerId;

                    return (
                      <tr key={emp._id} className="hover:bg-slate-50 dark:bg-zinc-800/50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800 dark:text-zinc-100">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{emp.userId?.employeeId || 'No ID'}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 text-sm">{emp.department || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 text-sm">{emp.designation || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {isAssignedToMe ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Assigned to You
                            </span>
                          ) : isAssignedToOther ? (
                            <button 
                              onClick={() => showHRContactInfo(emp.assignedHRProfile)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100/50 transition-colors cursor-pointer"
                              title="Click to view HR contact info"
                            >
                              <ShieldAlert size={12} />
                              Taken by {emp.assignedHRProfile?.firstName || 'another HR'}
                            </button>
                          ) : isMyManager ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                              Your Manager
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isAssignedToMe ? (
                            <button 
                              onClick={() => handleDrop(emp._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all duration-200"
                            >
                              <UserMinus size={14} /> Drop Employee
                            </button>
                          ) : isAssignedToOther ? (
                            <button 
                              onClick={() => showHRContactInfo(emp.assignedHRProfile)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:bg-zinc-800 transition-all"
                            >
                              Details
                            </button>
                          ) : isMyManager ? (
                            <button 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl cursor-not-allowed opacity-70"
                              disabled
                            >
                              Manager
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleClaim(emp._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all duration-200"
                            >
                              <UserPlus size={14} /> Claim Employee
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {employees.filter(emp => emp.userId?._id !== user.id).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-zinc-400">No other employees found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
