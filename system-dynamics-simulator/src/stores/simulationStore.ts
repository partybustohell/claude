import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  SimulationConfig,
  SimulationState,
  SimulationMode,
  SimulationResult,
  SimulationAnalysis,
  ScenarioConfig,
} from '../types';

interface SimulationStoreState {
  state: SimulationState;
  config: SimulationConfig;
  results: SimulationResult[];
  analysis: SimulationAnalysis | null;
  currentIteration: number;
  elapsedTime: number;
  lastUpdateTime: number | null;

  // Simulation control
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  step: () => void;
  reset: () => void;

  // Configuration
  setConfig: (config: Partial<SimulationConfig>) => void;
  setMode: (mode: SimulationMode) => void;
  setTimeStep: (timeStep: number) => void;

  // Results
  addResult: (result: SimulationResult) => void;
  clearResults: () => void;
  setAnalysis: (analysis: SimulationAnalysis) => void;

  // Scenarios
  addScenario: (scenario: Omit<ScenarioConfig, 'id'>) => string;
  updateScenario: (id: string, updates: Partial<ScenarioConfig>) => void;
  deleteScenario: (id: string) => void;

  // State management
  setState: (state: SimulationState) => void;
  incrementIteration: () => void;
  updateElapsedTime: () => void;
  setLastUpdateTime: (time: number | null) => void;

  // Getters
  getLatestResult: () => SimulationResult | undefined;
  getResultsForVariable: (variableId: string) => { iteration: number; value: number }[];
}

const DEFAULT_CONFIG: SimulationConfig = {
  mode: 'realtime',
  timeStep: 100,
  maxIterations: 10000,
  convergenceThreshold: 0.0001,
  batchScenarios: [],
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  state: 'idle',
  config: DEFAULT_CONFIG,
  results: [],
  analysis: null,
  currentIteration: 0,
  elapsedTime: 0,
  lastUpdateTime: null,

  start: () => {
    set({
      state: 'running',
      currentIteration: 0,
      elapsedTime: 0,
      lastUpdateTime: Date.now(),
      results: [],
      analysis: null,
    });
  },

  stop: () => {
    set({
      state: 'idle',
      lastUpdateTime: null,
    });
  },

  pause: () => {
    set({
      state: 'paused',
      lastUpdateTime: null,
    });
  },

  resume: () => {
    set({
      state: 'running',
      lastUpdateTime: Date.now(),
    });
  },

  step: () => {
    const { state, currentIteration } = get();
    if (state !== 'idle' && state !== 'paused') return;

    set({
      state: 'paused',
      currentIteration: currentIteration + 1,
    });
  },

  reset: () => {
    set({
      state: 'idle',
      currentIteration: 0,
      elapsedTime: 0,
      lastUpdateTime: null,
      results: [],
      analysis: null,
    });
  },

  setConfig: (configUpdates) => {
    set((state) => ({
      config: { ...state.config, ...configUpdates },
    }));
  },

  setMode: (mode) => {
    set((state) => ({
      config: { ...state.config, mode },
    }));
  },

  setTimeStep: (timeStep) => {
    set((state) => ({
      config: { ...state.config, timeStep },
    }));
  },

  addResult: (result) => {
    set((state) => {
      // Keep only last 1000 results for memory efficiency
      const newResults = [...state.results, result];
      if (newResults.length > 1000) {
        newResults.shift();
      }
      return { results: newResults };
    });
  },

  clearResults: () => {
    set({ results: [], analysis: null });
  },

  setAnalysis: (analysis) => {
    set({ analysis });
  },

  addScenario: (scenarioData) => {
    const id = uuidv4();
    const scenario: ScenarioConfig = { ...scenarioData, id };

    set((state) => ({
      config: {
        ...state.config,
        batchScenarios: [...(state.config.batchScenarios || []), scenario],
      },
    }));

    return id;
  },

  updateScenario: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        batchScenarios: state.config.batchScenarios?.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    }));
  },

  deleteScenario: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        batchScenarios: state.config.batchScenarios?.filter((s) => s.id !== id),
      },
    }));
  },

  setState: (newState) => {
    set({ state: newState });
  },

  incrementIteration: () => {
    set((state) => ({
      currentIteration: state.currentIteration + 1,
    }));
  },

  updateElapsedTime: () => {
    const { lastUpdateTime } = get();
    if (lastUpdateTime) {
      const now = Date.now();
      set((state) => ({
        elapsedTime: state.elapsedTime + (now - lastUpdateTime),
        lastUpdateTime: now,
      }));
    }
  },

  setLastUpdateTime: (time) => {
    set({ lastUpdateTime: time });
  },

  getLatestResult: () => {
    const results = get().results;
    return results[results.length - 1];
  },

  getResultsForVariable: (variableId) => {
    return get().results.map((r) => ({
      iteration: r.iteration,
      value: r.variables[variableId] ?? 0,
    }));
  },
}));
