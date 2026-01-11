import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { VariablePanel } from './components/VariableCreator';
import { RelationshipPanel } from './components/RelationshipBuilder';
import { NetworkGraph } from './components/NetworkVisualization';
import { SimulationPanel } from './components/SimulationControls';
import { TemplateLibrary } from './components/TemplateLibrary';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ImportModal, ExportModal } from './components/ImportExport';
import { useUIStore, useVariableStore, useRelationshipStore, useSimulationStore } from './stores';

type ActiveView = 'dashboard' | 'variables' | 'relationships' | 'network' | 'simulation' | 'analytics';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const {
    isTemplateLibraryOpen,
    openTemplateLibrary,
    closeTemplateLibrary,
    isImportModalOpen,
    openImportModal,
    closeImportModal,
    isExportModalOpen,
    openExportModal,
    closeExportModal,
    notifications,
    removeNotification,
    resetView,
  } = useUIStore();

  const { variables, clearAll: clearVariables } = useVariableStore();
  const { relationships, clearAll: clearRelationships } = useRelationshipStore();
  const { state: simState, reset: resetSimulation, currentIteration } = useSimulationStore();

  // Auto-remove notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  const handleClearAll = () => {
    if (confirm('Clear all variables and relationships? This cannot be undone.')) {
      clearVariables();
      clearRelationships();
      resetSimulation();
      resetView();
    }
  };

  // Calculate system metrics
  const activeRelationships = relationships.filter(r => r.isActive).length;
  const feedbackLoops = relationships.filter(r => {
    const reverse = relationships.find(
      rev => rev.sourceId === r.targetId && rev.targetId === r.sourceId
    );
    return reverse !== undefined;
  }).length / 2;

  const renderContent = () => {
    switch (activeView) {
      case 'variables':
        return (
          <div className="max-w-4xl">
            <VariablePanel />
          </div>
        );
      case 'relationships':
        return (
          <div className="max-w-4xl">
            <RelationshipPanel />
          </div>
        );
      case 'network':
        return (
          <div className="h-[600px] card-industrial p-4">
            <NetworkGraph />
          </div>
        );
      case 'simulation':
        return (
          <div className="max-w-2xl">
            <SimulationPanel />
          </div>
        );
      case 'analytics':
        return (
          <div className="max-w-5xl">
            <AnalyticsPanel />
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="flex items-stretch gap-0 card-industrial p-0 overflow-hidden">
        <div className="flex-1 p-5">
          <div className="kpi-label mb-2">Total Variables</div>
          <div className="kpi-value">{variables.length}</div>
          <div className="kpi-delta positive mt-1">Active system</div>
        </div>
        <div className="divider-vertical" />
        <div className="flex-1 p-5">
          <div className="kpi-label mb-2">Relationships</div>
          <div className="kpi-value">{relationships.length}</div>
          <div className="kpi-delta mt-1">{activeRelationships} active</div>
        </div>
        <div className="divider-vertical" />
        <div className="flex-1 p-5">
          <div className="kpi-label mb-2">Feedback Loops</div>
          <div className="kpi-value">{Math.floor(feedbackLoops)}</div>
          <div className="kpi-delta mt-1">Detected</div>
        </div>
        <div className="divider-vertical" />
        <div className="flex-1 p-5">
          <div className="kpi-label mb-2">Simulation</div>
          <div className="kpi-value capitalize">{simState}</div>
          <div className="kpi-delta mt-1">Iteration {currentIteration}</div>
        </div>
      </div>

      {/* Alert Cards */}
      {variables.length === 0 && (
        <div className="alert-card warning">
          <div className="w-8 h-8 rounded-full bg-[#b45309]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#b45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-[#1a1a1a] text-sm">No Variables Configured</div>
            <div className="text-xs text-[#525252] mt-0.5">Add variables to start modeling your system dynamics</div>
          </div>
          <button
            onClick={() => setActiveView('variables')}
            className="btn-industrial btn-secondary text-xs"
          >
            Add Variable
          </button>
        </div>
      )}

      {variables.length > 0 && relationships.length === 0 && (
        <div className="alert-card warning">
          <div className="w-8 h-8 rounded-full bg-[#b45309]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#b45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-[#1a1a1a] text-sm">No Relationships Defined</div>
            <div className="text-xs text-[#525252] mt-0.5">Connect variables to create system dynamics</div>
          </div>
          <button
            onClick={() => setActiveView('relationships')}
            className="btn-industrial btn-secondary text-xs"
          >
            Add Relationship
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Visualization - Takes 2 columns */}
        <div className="lg:col-span-2 card-industrial">
          <div className="p-4 border-b border-[#e5e2dd] flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[#1a1a1a] text-sm">System Network</h3>
              <p className="text-xs text-[#6b6b6b] mt-0.5">Interactive visualization of system relationships</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-[#059669]">
                <span className="status-dot online" />
                ONLINE
              </span>
              <button
                onClick={resetView}
                className="btn-industrial btn-ghost text-xs p-1.5"
                title="Reset view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[400px] relative">
            <NetworkGraph />
          </div>
        </div>

        {/* System Status - Right Column */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="card-industrial p-4">
            <h3 className="label-industrial mb-3">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#525252]">Positive Links</span>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {relationships.filter(r => r.relationshipType === 'positive').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#525252]">Negative Links</span>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {relationships.filter(r => r.relationshipType === 'negative').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#525252]">Custom Links</span>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {relationships.filter(r => r.relationshipType === 'custom').length}
                </span>
              </div>
              <div className="divider-horizontal my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#525252]">Avg. Influence</span>
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {relationships.length > 0
                    ? (relationships.reduce((sum, r) => sum + Math.abs(r.influenceStrength), 0) / relationships.length).toFixed(2)
                    : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="card-industrial p-4">
            <h3 className="label-industrial mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={openTemplateLibrary}
                className="p-3 border border-[#e5e2dd] rounded text-center hover:bg-[#f7f5f2] transition-colors"
              >
                <svg className="w-5 h-5 mx-auto mb-1.5 text-[#525252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-xs text-[#525252]">Templates</span>
              </button>
              <button
                onClick={openImportModal}
                className="p-3 border border-[#e5e2dd] rounded text-center hover:bg-[#f7f5f2] transition-colors"
              >
                <svg className="w-5 h-5 mx-auto mb-1.5 text-[#525252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-[#525252]">Import</span>
              </button>
              <button
                onClick={openExportModal}
                className="p-3 border border-[#e5e2dd] rounded text-center hover:bg-[#f7f5f2] transition-colors"
              >
                <svg className="w-5 h-5 mx-auto mb-1.5 text-[#525252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-xs text-[#525252]">Export</span>
              </button>
              <button
                onClick={handleClearAll}
                className="p-3 border border-[#e5e2dd] rounded text-center hover:bg-[#fde8e8] hover:border-[#b91c1c]/20 transition-colors"
              >
                <svg className="w-5 h-5 mx-auto mb-1.5 text-[#525252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span className="text-xs text-[#525252]">Clear</span>
              </button>
            </div>
          </div>

          {/* Variables Table Preview */}
          {variables.length > 0 && (
            <div className="card-industrial">
              <div className="p-3 border-b border-[#e5e2dd] flex items-center justify-between">
                <h3 className="label-industrial">Recent Variables</h3>
                <button
                  onClick={() => setActiveView('variables')}
                  className="text-xs text-[#525252] hover:text-[#1a1a1a]"
                >
                  View all
                </button>
              </div>
              <table className="w-full table-industrial">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {variables.slice(0, 4).map((v) => (
                    <tr key={v.id}>
                      <td>
                        <span className="font-medium text-sm">{v.name}</span>
                      </td>
                      <td className="text-right font-medium text-sm">
                        {v.currentValue.toFixed(1)}
                        {v.units && <span className="text-[#8a8a8a] ml-1">{v.units}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view as ActiveView)}
        onOpenTemplates={openTemplateLibrary}
        onOpenImport={openImportModal}
        onOpenExport={openExportModal}
      />

      {/* Main Content */}
      <main className="ml-56 min-h-screen">
        {/* Header */}
        <header className="bg-[#faf9f7] border-b border-[#e5e2dd] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1a1a1a] tracking-tight">
                {activeView === 'dashboard' ? 'Command Center' :
                 activeView === 'variables' ? 'Variable Configuration' :
                 activeView === 'relationships' ? 'Relationship Builder' :
                 activeView === 'network' ? 'Network Visualization' :
                 activeView === 'simulation' ? 'Simulation Control' :
                 'System Analytics'}
              </h1>
              <p className="text-sm text-[#6b6b6b] mt-1">
                {activeView === 'dashboard' ? 'System dynamics overview and monitoring' :
                 activeView === 'variables' ? 'Configure and manage system variables' :
                 activeView === 'relationships' ? 'Define relationships between variables' :
                 activeView === 'network' ? 'Visual representation of system structure' :
                 activeView === 'simulation' ? 'Run and control system simulations' :
                 'Analyze simulation results and system behavior'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="input-industrial pl-9 w-48"
                />
              </div>
              {/* Primary Action */}
              <button
                onClick={() => activeView === 'dashboard' ? openTemplateLibrary() : setActiveView('dashboard')}
                className="btn-industrial btn-primary"
              >
                {activeView === 'dashboard' ? 'Load Template' : 'Dashboard'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <TemplateLibrary isOpen={isTemplateLibraryOpen} onClose={closeTemplateLibrary} />
      <ImportModal isOpen={isImportModalOpen} onClose={closeImportModal} />
      <ExportModal isOpen={isExportModalOpen} onClose={closeExportModal} />

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded shadow-card flex items-center gap-3 animate-slide-in ${
              notification.type === 'success'
                ? 'bg-[#e8f5ec] text-[#2d8a4e] border border-[#2d8a4e]/20'
                : notification.type === 'error'
                ? 'bg-[#fde8e8] text-[#b91c1c] border border-[#b91c1c]/20'
                : notification.type === 'warning'
                ? 'bg-[#fef3e2] text-[#b45309] border border-[#b45309]/20'
                : 'bg-[#faf9f7] text-[#1a1a1a] border border-[#e5e2dd]'
            }`}
          >
            {notification.type === 'success' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.type === 'warning' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="text-sm">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
