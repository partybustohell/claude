import { useEffect, useRef, useCallback } from 'react';
import { useVariableStore, useRelationshipStore, useSimulationStore } from '../../stores';
import { Button, Select, Slider } from '../common/FormControls';
import {
  runSimulationStep,
  DelayBuffer,
  detectSystemState,
  checkEquilibrium,
  generateAnalysis,
} from '../../utils/simulationEngine';
import type { SimulationMode } from '../../types';

const SIMULATION_MODES: { value: SimulationMode; label: string; description: string }[] = [
  { value: 'realtime', label: 'Real-Time', description: 'Continuous updates' },
  { value: 'step', label: 'Step-by-Step', description: 'Manual progression' },
  { value: 'batch', label: 'Batch Mode', description: 'Run multiple scenarios' },
];

export function SimulationPanel() {
  const { variables, setVariableValue, recordHistory } = useVariableStore();
  const { relationships, getActiveRelationships } = useRelationshipStore();
  const {
    state: simState,
    config,
    results,
    currentIteration,
    elapsedTime,
    start,
    stop,
    pause,
    resume,
    step,
    reset,
    setConfig,
    setMode,
    setTimeStep,
    addResult,
    clearResults,
    setAnalysis,
    incrementIteration,
  } = useSimulationStore();

  const delayBufferRef = useRef(new DelayBuffer());
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const historyRef = useRef<Map<string, number[]>>(new Map());

  // Run simulation step
  const runStep = useCallback(() => {
    const activeRelationships = getActiveRelationships();

    if (variables.length === 0 || activeRelationships.length === 0) {
      return;
    }

    const { newValues, deltas } = runSimulationStep(
      variables,
      activeRelationships,
      delayBufferRef.current
    );

    // Update variable values
    newValues.forEach((value, id) => {
      setVariableValue(id, value);
    });

    // Record history
    recordHistory();

    // Update history for analysis
    newValues.forEach((value, id) => {
      if (!historyRef.current.has(id)) {
        historyRef.current.set(id, []);
      }
      const h = historyRef.current.get(id)!;
      h.push(value);
      if (h.length > 100) h.shift();
    });

    // Detect system state
    const systemState = detectSystemState(historyRef.current);
    const isEquilibrium = checkEquilibrium(deltas, config.convergenceThreshold);

    // Record result
    addResult({
      timestamp: Date.now(),
      iteration: currentIteration,
      variables: Object.fromEntries(newValues),
      deltas: Object.fromEntries(deltas),
      systemState,
    });

    incrementIteration();

    // Check for equilibrium or max iterations
    if (isEquilibrium || currentIteration >= config.maxIterations) {
      stop();
      setAnalysis(generateAnalysis(results, variables, activeRelationships));
    }
  }, [variables, getActiveRelationships, setVariableValue, recordHistory, config, currentIteration, addResult, incrementIteration, stop, setAnalysis, results]);

  // Animation loop for real-time mode
  useEffect(() => {
    if (simState !== 'running' || config.mode !== 'realtime') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= config.timeStep) {
        runStep();
        lastTickRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simState, config.mode, config.timeStep, runStep]);

  const handleStart = () => {
    delayBufferRef.current.clear();
    historyRef.current.clear();
    clearResults();
    start();
  };

  const handleStep = () => {
    if (simState === 'idle') {
      delayBufferRef.current.clear();
      historyRef.current.clear();
      clearResults();
    }
    step();
    runStep();
  };

  const handleReset = () => {
    delayBufferRef.current.clear();
    historyRef.current.clear();
    reset();
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const canStart = variables.length > 0 && relationships.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Controls</h3>

      {/* Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              simState === 'running'
                ? 'bg-green-100 text-green-700'
                : simState === 'paused'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {simState.charAt(0).toUpperCase() + simState.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Iteration:</span>
            <span className="ml-2 font-mono text-gray-900">{currentIteration}</span>
          </div>
          <div>
            <span className="text-gray-500">Time:</span>
            <span className="ml-2 font-mono text-gray-900">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex gap-2 mb-4">
        {simState === 'idle' && (
          <>
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start
            </Button>
            <Button
              variant="secondary"
              onClick={handleStep}
              disabled={!canStart}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Step
            </Button>
          </>
        )}

        {simState === 'running' && (
          <>
            <Button variant="secondary" onClick={pause} className="flex-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
              Pause
            </Button>
            <Button variant="danger" onClick={stop}>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop
            </Button>
          </>
        )}

        {simState === 'paused' && (
          <>
            <Button onClick={resume} className="flex-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Resume
            </Button>
            <Button variant="secondary" onClick={handleStep}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Step
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <Select
          label="Simulation Mode"
          value={config.mode}
          onChange={(e) => setMode(e.target.value as SimulationMode)}
          options={SIMULATION_MODES.map((m) => ({ value: m.value, label: m.label }))}
          disabled={simState === 'running'}
        />

        {config.mode === 'realtime' && (
          <Slider
            label="Update Speed"
            value={config.timeStep}
            onChange={setTimeStep}
            min={50}
            max={1000}
            step={50}
            formatValue={(v) => `${v}ms`}
          />
        )}

        <Slider
          label="Max Iterations"
          value={config.maxIterations}
          onChange={(v) => setConfig({ maxIterations: v })}
          min={100}
          max={100000}
          step={100}
          formatValue={(v) => v.toLocaleString()}
        />

        <Slider
          label="Convergence Threshold"
          value={config.convergenceThreshold}
          onChange={(v) => setConfig({ convergenceThreshold: v })}
          min={0.00001}
          max={0.01}
          step={0.00001}
          formatValue={(v) => v.toExponential(2)}
        />
      </div>

      {/* Warnings */}
      {!canStart && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {variables.length === 0 && <p>Add variables to run simulation</p>}
          {variables.length > 0 && relationships.length === 0 && (
            <p>Add relationships between variables</p>
          )}
        </div>
      )}
    </div>
  );
}
