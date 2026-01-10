// Core Types for System Dynamics Simulator

// Variable Types
export type VariableType = 'continuous' | 'discrete' | 'percentage';

export type DisplayFormat = {
  decimalPlaces: number;
  prefix?: string;
  suffix?: string;
  useThousandsSeparator?: boolean;
};

export interface Variable {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryColor: string;
  units: string;
  min: number;
  max: number;
  defaultValue: number;
  currentValue: number;
  variableType: VariableType;
  displayFormat: DisplayFormat;
  isLocked: boolean;
  position?: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
}

// Relationship Types
export type RelationshipType = 'positive' | 'negative' | 'custom';

export type CurveType = 'linear' | 'exponential' | 'logarithmic' | 'sigmoid' | 'step' | 'custom';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  influenceStrength: number; // -1.0 to 1.0
  delay: number; // Time units (0-20)
  curveType: CurveType;
  threshold: number; // Minimum change to trigger
  saturation: number; // Maximum effect limit (0-1)
  customFormula?: string;
  conditionalLogic?: ConditionalRule[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ConditionalRule {
  id: string;
  variableId: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'neq';
  value: number;
  action: 'multiply' | 'add' | 'set' | 'disable';
  actionValue: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// Simulation Types
export type SimulationMode = 'realtime' | 'step' | 'batch' | 'montecarlo' | 'sensitivity';

export type SimulationState = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export interface SimulationConfig {
  mode: SimulationMode;
  timeStep: number; // ms between updates
  maxIterations: number;
  convergenceThreshold: number;
  randomSeed?: number;
  batchScenarios?: ScenarioConfig[];
  sensitivityVariable?: string;
  sensitivityRange?: { min: number; max: number; steps: number };
}

export interface ScenarioConfig {
  id: string;
  name: string;
  variableOverrides: Record<string, number>;
}

export interface SimulationResult {
  timestamp: number;
  iteration: number;
  variables: Record<string, number>;
  deltas: Record<string, number>;
  systemState: 'stable' | 'oscillating' | 'diverging' | 'chaotic';
}

export interface SimulationAnalysis {
  equilibriumReached: boolean;
  equilibriumIteration?: number;
  oscillationDetected: boolean;
  oscillationPeriod?: number;
  chaosDetected: boolean;
  lyapunovExponent?: number;
  mostInfluentialVariables: string[];
  criticalRelationships: string[];
}

// History for tracking changes over time
export interface VariableHistory {
  variableId: string;
  values: { timestamp: number; value: number }[];
}

// Template Types
export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  variables: Omit<Variable, 'id' | 'currentValue' | 'createdAt' | 'updatedAt'>[];
  relationships: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>[];
  categories: Category[];
  author?: string;
  tags: string[];
}

export type TemplateCategory =
  | 'business'
  | 'technical'
  | 'personal'
  | 'scientific'
  | 'social'
  | 'environmental'
  | 'custom';

// Import/Export Types
export interface SystemExport {
  version: string;
  exportedAt: number;
  name: string;
  description?: string;
  variables: Variable[];
  relationships: Relationship[];
  categories: Category[];
  simulationConfig?: SimulationConfig;
}

export interface CSVImportRow {
  name: string;
  description?: string;
  category?: string;
  units?: string;
  min?: string | number;
  max?: string | number;
  defaultValue?: string | number;
  variableType?: VariableType;
}

// Analytics Types
export interface CorrelationResult {
  variable1Id: string;
  variable2Id: string;
  correlation: number;
  significance: number;
}

export interface ImpactAnalysis {
  variableId: string;
  directInfluence: number;
  indirectInfluence: number;
  totalInfluence: number;
  affectedVariables: string[];
}

export interface StabilityAnalysis {
  isStable: boolean;
  eigenvalues?: number[];
  dampingRatio?: number;
  settlingTime?: number;
}

export interface ScenarioComparison {
  scenarios: {
    id: string;
    name: string;
    finalValues: Record<string, number>;
  }[];
  differences: Record<string, { min: number; max: number; variance: number }>;
}

// UI State Types
export interface UIState {
  selectedVariableId: string | null;
  selectedRelationshipId: string | null;
  isVariableModalOpen: boolean;
  isRelationshipModalOpen: boolean;
  isTemplateLibraryOpen: boolean;
  isImportModalOpen: boolean;
  isExportModalOpen: boolean;
  activePanel: 'variables' | 'relationships' | 'analytics' | 'templates';
  viewMode: 'network' | 'matrix' | 'list';
  searchQuery: string;
  filterCategory: string | null;
  zoomLevel: number;
  panOffset: { x: number; y: number };
}

// Network Visualization Types
export interface NetworkNode {
  id: string;
  name: string;
  value: number;
  normalizedValue: number;
  category: string;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkLink {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  strength: number;
  type: RelationshipType;
  curveType: CurveType;
}

export type NetworkLayout = 'force' | 'hierarchical' | 'circular' | 'grid';

// Auto-connection suggestion types
export interface RelationshipSuggestion {
  sourceId: string;
  targetId: string;
  suggestedType: RelationshipType;
  suggestedStrength: number;
  confidence: number;
  reason: string;
}

export type AutoConnectionMode = 'full' | 'guided' | 'manual' | 'hybrid';

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
}

// Event Types for Simulation
export interface SimulationEvent {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'step' | 'reset' | 'complete' | 'error';
  timestamp: number;
  data?: any;
}

// Formula Parser Types
export interface FormulaToken {
  type: 'variable' | 'operator' | 'number' | 'function' | 'parenthesis';
  value: string | number;
}

export interface ParsedFormula {
  tokens: FormulaToken[];
  variables: string[];
  isValid: boolean;
  error?: string;
}
