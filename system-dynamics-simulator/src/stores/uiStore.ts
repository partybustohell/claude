import { create } from 'zustand';
import type { UIState, NetworkLayout } from '../types';

interface UIStoreState extends UIState {
  // Variable modal
  setSelectedVariableId: (id: string | null) => void;
  openVariableModal: (variableId?: string) => void;
  closeVariableModal: () => void;

  // Relationship modal
  setSelectedRelationshipId: (id: string | null) => void;
  openRelationshipModal: (relationshipId?: string) => void;
  closeRelationshipModal: () => void;

  // Template library
  openTemplateLibrary: () => void;
  closeTemplateLibrary: () => void;

  // Import/Export modals
  openImportModal: () => void;
  closeImportModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;

  // Panel management
  setActivePanel: (panel: UIState['activePanel']) => void;
  setViewMode: (mode: UIState['viewMode']) => void;

  // Search and filter
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;

  // Visualization controls
  setZoomLevel: (level: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetView: () => void;

  // Network layout
  networkLayout: NetworkLayout;
  setNetworkLayout: (layout: NetworkLayout) => void;

  // Relationship creation mode
  isCreatingRelationship: boolean;
  relationshipSource: string | null;
  startCreatingRelationship: (sourceId: string) => void;
  cancelCreatingRelationship: () => void;

  // Notifications
  notifications: { id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }[];
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  selectedVariableId: null,
  selectedRelationshipId: null,
  isVariableModalOpen: false,
  isRelationshipModalOpen: false,
  isTemplateLibraryOpen: false,
  isImportModalOpen: false,
  isExportModalOpen: false,
  activePanel: 'variables',
  viewMode: 'network',
  searchQuery: '',
  filterCategory: null,
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
  networkLayout: 'force',
  isCreatingRelationship: false,
  relationshipSource: null,
  notifications: [],

  setSelectedVariableId: (id) => set({ selectedVariableId: id }),

  openVariableModal: (variableId) =>
    set({
      isVariableModalOpen: true,
      selectedVariableId: variableId ?? null,
    }),

  closeVariableModal: () =>
    set({
      isVariableModalOpen: false,
      selectedVariableId: null,
    }),

  setSelectedRelationshipId: (id) => set({ selectedRelationshipId: id }),

  openRelationshipModal: (relationshipId) =>
    set({
      isRelationshipModalOpen: true,
      selectedRelationshipId: relationshipId ?? null,
    }),

  closeRelationshipModal: () =>
    set({
      isRelationshipModalOpen: false,
      selectedRelationshipId: null,
    }),

  openTemplateLibrary: () => set({ isTemplateLibraryOpen: true }),
  closeTemplateLibrary: () => set({ isTemplateLibraryOpen: false }),

  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),

  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),

  setActivePanel: (panel) => set({ activePanel: panel }),
  setViewMode: (mode) => set({ viewMode: mode }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCategory: (category) => set({ filterCategory: category }),

  setZoomLevel: (level) => set({ zoomLevel: Math.max(0.1, Math.min(3, level)) }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  resetView: () => set({ zoomLevel: 1, panOffset: { x: 0, y: 0 } }),

  setNetworkLayout: (layout) => set({ networkLayout: layout }),

  startCreatingRelationship: (sourceId) =>
    set({
      isCreatingRelationship: true,
      relationshipSource: sourceId,
    }),

  cancelCreatingRelationship: () =>
    set({
      isCreatingRelationship: false,
      relationshipSource: null,
    }),

  addNotification: (type, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: `${Date.now()}-${Math.random()}`, type, message },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
