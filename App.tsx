import React, { useState, useEffect } from 'react';
import { Audit, User, EEM } from './types';
import { getAudits, saveAudit } from './services/auditService';
import { loginAs, checkPermission } from './services/authService';
import Dashboard from './components/Dashboard';
import PortfolioDashboard from './components/PortfolioDashboard';
import AuditForm from './components/AuditForm';
import AIAnalysisModal from './components/AIAnalysisModal';
import { LayoutDashboard, FileText, Settings, PlusCircle, Activity, Sparkles, LogOut, User as UserIcon, PieChart, Zap, Building, Award, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // App State
  const [view, setView] = useState<'portfolio' | 'list' | 'dashboard' | 'edit'>('list');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    getAudits().then(setAudits);
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = async (role: any) => {
    setLoadingAuth(true);
    const user = await loginAs(role);
    setCurrentUser(user);
    // Managers default to portfolio, Auditors to list
    if (user.role === 'Manager' || user.role === 'Administrator') {
      setView('portfolio');
    } else {
      setView('list');
    }
    setLoadingAuth(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedAudit(null);
  };

  const handleAuditSelect = (audit: Audit) => {
    setSelectedAudit(audit);
    setView('dashboard');
  };

  const handleCreateNew = () => {
    setSelectedAudit(null);
    setView('edit');
  };

  const handleEdit = () => {
    setView('edit');
  };

  const handleSaveAudit = async (updatedAudit: Audit) => {
    if (!currentUser) return;
    
    // Simulate Data Pipeline ingestion
    const result = await saveAudit(updatedAudit);
    
    if (result.success && result.data) {
      const processedAudit = result.data;
      const exists = audits.find(a => a.id === processedAudit.id);
      if (exists) {
        setAudits(audits.map(a => a.id === processedAudit.id ? processedAudit : a));
      } else {
        setAudits([...audits, processedAudit]);
      }
      setSelectedAudit(processedAudit);
      // Only switch view if not already in edit/dashboard context logic, usually explicit
      // For add EEM, we might want to stay on current view or just update data
    } else {
      alert(`Validation Failed:\n${JSON.stringify(result.errors, null, 2)}`);
    }
  };

  const handleAddEEM = (eem: EEM) => {
    if (!selectedAudit) return;
    const updatedAudit = {
      ...selectedAudit,
      eems: [...selectedAudit.eems, eem]
    };
    handleSaveAudit(updatedAudit);
  };

  // Helper for Rating Colors
  const getRatingBadge = (rating?: string) => {
    if (!rating) return null;
    let colorClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    if (rating === 'Super ECBC') colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    else if (rating === 'ECBC+') colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    else if (rating === 'ECBC Compliant') colorClass = "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800";
    else colorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${colorClass}`}>
        <Award className="w-3 h-3" />
        {rating}
      </span>
    );
  };

  // --- Login Screen ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
         <div className="absolute top-4 right-4">
             <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-600 dark:text-slate-300">
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
         </div>
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="bg-slate-900 dark:bg-black p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Energy & Sustainability Audit</h1>
          </div>
          <div className="p-8 space-y-4">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">Select a role to simulate login:</p>
            
            <button 
              onClick={() => handleLogin('Auditor')}
              disabled={loadingAuth}
              className="w-full flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800">
                <UserIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-green-700 dark:group-hover:text-green-300" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">Auditor</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Data collection & field entry</div>
              </div>
            </button>

            <button 
              onClick={() => handleLogin('Manager')}
              disabled={loadingAuth}
              className="w-full flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
            >
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800">
                <PieChart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">Manager</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Review, approve & portfolio view</div>
              </div>
            </button>

            <button 
              onClick={() => handleLogin('Administrator')}
              disabled={loadingAuth}
              className="w-full flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">Administrator</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Full system access</div>
              </div>
            </button>
            
            {loadingAuth && <div className="text-center text-sm text-green-600 animate-pulse">Logging in...</div>}
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-black text-white flex-shrink-0 hidden md:flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <Zap className="w-6 h-6 text-blue-500" />
            <span>Energy Audit</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Role: {currentUser.role}</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {checkPermission(currentUser, 'view_all') && (
            <button 
              onClick={() => { setSelectedAudit(null); setView('portfolio'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${view === 'portfolio' ? 'bg-green-600' : 'hover:bg-slate-800'}`}
            >
              <PieChart className="w-5 h-5" />
              <span>Portfolio Dashboard</span>
            </button>
          )}

          <button 
            onClick={() => { setSelectedAudit(null); setView('list'); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${view === 'list' ? 'bg-green-600' : 'hover:bg-slate-800'}`}
          >
            <FileText className="w-5 h-5" />
            <span>All Audits</span>
          </button>
          
          {selectedAudit && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Project
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${view === 'dashboard' ? 'bg-green-600' : 'hover:bg-slate-800'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Building Dashboard</span>
              </button>
              <button 
                onClick={handleEdit}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${view === 'edit' ? 'bg-green-600' : 'hover:bg-slate-800'}`}
              >
                <Settings className="w-5 h-5" />
                <span>{checkPermission(currentUser, 'edit') ? 'Data Collection' : 'View Data'}</span>
              </button>
              <button 
                onClick={() => setIsAIModalOpen(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors text-purple-300 hover:bg-slate-800 hover:text-purple-200"
              >
                <Sparkles className="w-5 h-5" />
                <span>AI Assistant</span>
              </button>
            </>
          )}

          {/* Sidebar Toggle */}
          <div className="mt-8 px-4">
             <button onClick={toggleTheme} className="w-full flex items-center justify-center space-x-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
               {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
             </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-sm">
                {currentUser.avatarInitials}
              </div>
              <div className="text-sm overflow-hidden">
                <div className="font-medium truncate">{currentUser.name}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 p-4 md:hidden flex items-center justify-between transition-colors">
          <div className="font-bold text-lg flex items-center space-x-2 text-slate-900 dark:text-white">
            <Zap className="w-6 h-6 text-blue-600" />
            <span>Energy Audit</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setView('list')} className="p-2">
              <FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {view === 'portfolio' && (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Portfolio Overview</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Aggregate performance across all facilities</p>
              <PortfolioDashboard audits={audits} />
            </div>
          )}

          {view === 'list' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Commercial Energy Audits</h1>
                  <p className="text-slate-500 dark:text-slate-400">Manage your ASHRAE Level 1 & 2 assessments</p>
                </div>
                {checkPermission(currentUser, 'edit') && (
                  <button 
                    onClick={handleCreateNew}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>New Audit</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audits.map(audit => (
                  <div 
                    key={audit.id}
                    onClick={() => handleAuditSelect(audit)}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    {/* Card Image Header */}
                    <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                      {audit.imageUrl ? (
                        <img 
                          src={audit.imageUrl} 
                          alt={audit.name} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800">
                          <Building className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-xs uppercase font-medium tracking-wide">No Image</span>
                        </div>
                      )}
                      
                      {/* Status Overlay */}
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/70 ${
                          audit.status === 'Published' ? 'text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {audit.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] uppercase font-bold text-white bg-slate-900/70 dark:bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
                          {audit.auditLevel.split('-')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-2">
                         <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-1 truncate">{audit.name}</h3>
                         {getRatingBadge(audit.complianceRating)}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">{audit.address}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-medium">EPI</div>
                          <div className="font-semibold text-slate-700 dark:text-slate-300">{audit.epi}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-medium">Potential Savings</div>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            ₹{audit.eems.reduce((acc, curr) => acc + curr.estimatedSavings, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'dashboard' && selectedAudit && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAudit.name}</h1>
                  <p className="text-slate-500 dark:text-slate-400">Facility Dashboard</p>
                </div>
                <div className="space-x-3">
                  <button 
                    onClick={() => setIsAIModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow transition-colors inline-flex"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Insights</span>
                  </button>
                  <button 
                    onClick={handleEdit}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    {checkPermission(currentUser, 'edit') ? 'Edit Data' : 'View Data'}
                  </button>
                </div>
              </div>
              <Dashboard audit={selectedAudit} />
            </div>
          )}

          {view === 'edit' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button 
                  onClick={() => setView('list')}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 mb-2"
                >
                  &larr; Back to Audits
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedAudit ? (checkPermission(currentUser, 'edit') ? `Edit Audit: ${selectedAudit.name}` : `View Audit: ${selectedAudit.name}`) : 'New Energy Audit'}
                </h1>
              </div>
              <AuditForm 
                initialData={selectedAudit || undefined} 
                onSave={handleSaveAudit}
                readOnly={!checkPermission(currentUser, 'edit')}
                canPublish={checkPermission(currentUser, 'publish')}
              />
            </div>
          )}
        </div>
      </main>

      {selectedAudit && (
        <AIAnalysisModal 
          audit={selectedAudit} 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
          onAddEEM={handleAddEEM}
        />
      )}
    </div>
  );
};

export default App;