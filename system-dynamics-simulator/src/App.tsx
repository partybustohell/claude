import { useState, useEffect } from 'react';
import { VariablePanel } from './components/VariableCreator';
import { RelationshipPanel } from './components/RelationshipBuilder';
import { NetworkGraph } from './components/NetworkVisualization';
import { SimulationPanel } from './components/SimulationControls';
import { TemplateLibrary } from './components/TemplateLibrary';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ImportModal, ExportModal } from './components/ImportExport';
import { useUIStore, useVariableStore, useRelationshipStore, useSimulationStore } from './stores';

type LeftPanel = 'variables' | 'relationships';
type RightPanel = 'simulation' | 'analytics';

function App() {
  const [leftPanel, setLeftPanel] = useState<LeftPanel>('variables');
  const [rightPanel, setRightPanel] = useState<RightPanel>('simulation');

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
  const { reset: resetSimulation } = useSimulationStore();

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

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">System Dynamics Simulator</h1>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 border-l border-gray-200 pl-4 ml-2">
            <span>{variables.length} variables</span>
            <span>{relationships.length} relationships</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openTemplateLibrary}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            onClick={openImportModal}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={openExportModal}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200">
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setLeftPanel('variables')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                leftPanel === 'variables'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Variables
            </button>
            <button
              onClick={() => setLeftPanel('relationships')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                leftPanel === 'relationships'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Relationships
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {leftPanel === 'variables' ? <VariablePanel /> : <RelationshipPanel />}
          </div>
        </div>

        {/* Center - Network Visualization */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden relative">
            {/* View Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={resetView}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                title="Reset view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>

            <NetworkGraph />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-gray-200">
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setRightPanel('simulation')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanel === 'simulation'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Simulation
            </button>
            <button
              onClick={() => setRightPanel('analytics')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanel === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanel === 'simulation' ? <SimulationPanel /> : <AnalyticsPanel />}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TemplateLibrary isOpen={isTemplateLibraryOpen} onClose={closeTemplateLibrary} />
      <ImportModal isOpen={isImportModalOpen} onClose={closeImportModal} />
      <ExportModal isOpen={isExportModalOpen} onClose={closeExportModal} />

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
              notification.type === 'success'
                ? 'bg-green-600 text-white'
                : notification.type === 'error'
                ? 'bg-red-600 text-white'
                : notification.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {notification.type === 'success' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.type === 'warning' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
