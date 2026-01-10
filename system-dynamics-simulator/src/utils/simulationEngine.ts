import type {
  Variable,
  Relationship,
  CurveType,
  SimulationResult,
  SimulationAnalysis,
  ConditionalRule,
} from '../types';

/**
 * Calculate the influence curve based on curve type
 */
export function calculateCurveValue(
  normalizedInput: number,
  curveType: CurveType,
  strength: number
): number {
  const input = Math.max(0, Math.min(1, normalizedInput));

  switch (curveType) {
    case 'linear':
      return input * strength;

    case 'exponential':
      return (Math.pow(input, 2) * strength);

    case 'logarithmic':
      if (input <= 0) return 0;
      return (Math.log(input + 1) / Math.log(2)) * strength;

    case 'sigmoid':
      const k = 10; // steepness
      const sigmoid = 1 / (1 + Math.exp(-k * (input - 0.5)));
      return sigmoid * strength;

    case 'step':
      return input >= 0.5 ? strength : 0;

    case 'custom':
      return input * strength;

    default:
      return input * strength;
  }
}

/**
 * Evaluate conditional rules for a relationship
 */
export function evaluateConditionalRules(
  rules: ConditionalRule[] | undefined,
  variables: Map<string, number>,
  baseMultiplier: number
): { multiplier: number; isActive: boolean } {
  if (!rules || rules.length === 0) {
    return { multiplier: baseMultiplier, isActive: true };
  }

  let multiplier = baseMultiplier;
  let isActive = true;

  for (const rule of rules) {
    const value = variables.get(rule.variableId);
    if (value === undefined) continue;

    let conditionMet = false;
    switch (rule.operator) {
      case 'gt':
        conditionMet = value > rule.value;
        break;
      case 'lt':
        conditionMet = value < rule.value;
        break;
      case 'eq':
        conditionMet = Math.abs(value - rule.value) < 0.0001;
        break;
      case 'gte':
        conditionMet = value >= rule.value;
        break;
      case 'lte':
        conditionMet = value <= rule.value;
        break;
      case 'neq':
        conditionMet = Math.abs(value - rule.value) >= 0.0001;
        break;
    }

    if (conditionMet) {
      switch (rule.action) {
        case 'multiply':
          multiplier *= rule.actionValue;
          break;
        case 'add':
          multiplier += rule.actionValue;
          break;
        case 'set':
          multiplier = rule.actionValue;
          break;
        case 'disable':
          isActive = false;
          break;
      }
    }
  }

  return { multiplier, isActive };
}

/**
 * Calculate influence from source to target
 */
export function calculateInfluence(
  source: Variable,
  target: Variable,
  relationship: Relationship,
  allVariables: Map<string, number>
): number {
  if (!relationship.isActive) return 0;

  // Evaluate conditional rules
  const { multiplier, isActive } = evaluateConditionalRules(
    relationship.conditionalLogic,
    allVariables,
    1
  );

  if (!isActive) return 0;

  // Normalize source value to 0-1 range
  const sourceRange = source.max - source.min;
  const normalizedSource = sourceRange > 0
    ? (source.currentValue - source.min) / sourceRange
    : 0;

  // Calculate base influence
  const curveValue = calculateCurveValue(
    normalizedSource,
    relationship.curveType,
    Math.abs(relationship.influenceStrength)
  );

  // Apply relationship type
  const sign = relationship.relationshipType === 'negative' ? -1 : 1;
  const influence = curveValue * sign * multiplier;

  // Apply threshold
  if (Math.abs(influence) < relationship.threshold) {
    return 0;
  }

  // Apply saturation
  const saturatedInfluence = Math.max(
    -relationship.saturation,
    Math.min(relationship.saturation, influence)
  );

  // Scale to target range
  const targetRange = target.max - target.min;
  return saturatedInfluence * targetRange;
}

/**
 * Delayed influence buffer for time-delayed effects
 */
export class DelayBuffer {
  private buffer: Map<string, { value: number; delay: number }[]> = new Map();

  push(relationshipId: string, value: number, delay: number): void {
    if (!this.buffer.has(relationshipId)) {
      this.buffer.set(relationshipId, []);
    }
    this.buffer.get(relationshipId)!.push({ value, delay });
  }

  tick(): Map<string, number> {
    const activeInfluences = new Map<string, number>();

    this.buffer.forEach((items, relationshipId) => {
      const newItems: { value: number; delay: number }[] = [];

      for (const item of items) {
        if (item.delay <= 0) {
          const current = activeInfluences.get(relationshipId) || 0;
          activeInfluences.set(relationshipId, current + item.value);
        } else {
          newItems.push({ value: item.value, delay: item.delay - 1 });
        }
      }

      this.buffer.set(relationshipId, newItems);
    });

    return activeInfluences;
  }

  clear(): void {
    this.buffer.clear();
  }
}

/**
 * Run a single simulation step
 */
export function runSimulationStep(
  variables: Variable[],
  relationships: Relationship[],
  delayBuffer: DelayBuffer
): { newValues: Map<string, number>; deltas: Map<string, number> } {
  const currentValues = new Map<string, number>();
  const newValues = new Map<string, number>();
  const deltas = new Map<string, number>();

  // Initialize with current values
  variables.forEach((v) => {
    currentValues.set(v.id, v.currentValue);
    newValues.set(v.id, v.currentValue);
    deltas.set(v.id, 0);
  });

  // Process delayed influences
  const delayedInfluences = delayBuffer.tick();
  delayedInfluences.forEach((influence, relationshipId) => {
    const relationship = relationships.find((r) => r.id === relationshipId);
    if (relationship) {
      const current = newValues.get(relationship.targetId) || 0;
      newValues.set(relationship.targetId, current + influence);

      const delta = deltas.get(relationship.targetId) || 0;
      deltas.set(relationship.targetId, delta + influence);
    }
  });

  // Calculate immediate influences
  relationships.forEach((relationship) => {
    if (!relationship.isActive) return;

    const source = variables.find((v) => v.id === relationship.sourceId);
    const target = variables.find((v) => v.id === relationship.targetId);

    if (!source || !target || target.isLocked) return;

    const influence = calculateInfluence(source, target, relationship, currentValues);

    if (relationship.delay > 0) {
      // Add to delay buffer
      delayBuffer.push(relationship.id, influence, relationship.delay);
    } else {
      // Apply immediately
      const current = newValues.get(target.id) || 0;
      newValues.set(target.id, current + influence);

      const delta = deltas.get(target.id) || 0;
      deltas.set(target.id, delta + influence);
    }
  });

  // Clamp values to variable ranges
  variables.forEach((v) => {
    if (v.isLocked) return;

    const value = newValues.get(v.id) || v.currentValue;
    const clampedValue = Math.max(v.min, Math.min(v.max, value));
    newValues.set(v.id, clampedValue);
  });

  return { newValues, deltas };
}

/**
 * Detect system state (stable, oscillating, diverging, chaotic)
 */
export function detectSystemState(
  history: Map<string, number[]>,
  windowSize: number = 50
): 'stable' | 'oscillating' | 'diverging' | 'chaotic' {
  if (history.size === 0) return 'stable';

  let hasOscillation = false;
  let hasDivergence = false;
  let totalVariance = 0;

  history.forEach((values) => {
    if (values.length < windowSize) return;

    const recent = values.slice(-windowSize);

    // Calculate variance
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length;
    totalVariance += variance;

    // Check for oscillation (sign changes in differences)
    let signChanges = 0;
    for (let i = 2; i < recent.length; i++) {
      const diff1 = recent[i - 1] - recent[i - 2];
      const diff2 = recent[i] - recent[i - 1];
      if (diff1 * diff2 < 0) signChanges++;
    }
    if (signChanges > windowSize / 3) hasOscillation = true;

    // Check for divergence (consistent growth/shrink)
    const firstHalf = recent.slice(0, windowSize / 2);
    const secondHalf = recent.slice(windowSize / 2);
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (Math.abs(secondMean - firstMean) > Math.abs(firstMean) * 0.5) {
      hasDivergence = true;
    }
  });

  const avgVariance = totalVariance / history.size;

  if (hasDivergence) return 'diverging';
  if (hasOscillation) return 'oscillating';
  if (avgVariance > 1000) return 'chaotic';
  return 'stable';
}

/**
 * Check if system has reached equilibrium
 */
export function checkEquilibrium(
  deltas: Map<string, number>,
  threshold: number = 0.0001
): boolean {
  let maxDelta = 0;

  deltas.forEach((delta) => {
    maxDelta = Math.max(maxDelta, Math.abs(delta));
  });

  return maxDelta < threshold;
}

/**
 * Calculate correlation between two value arrays
 */
export function calculateCorrelation(values1: number[], values2: number[]): number {
  if (values1.length !== values2.length || values1.length < 2) return 0;

  const n = values1.length;
  const mean1 = values1.reduce((a, b) => a + b, 0) / n;
  const mean2 = values2.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sum1 = 0;
  let sum2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    sum1 += diff1 * diff1;
    sum2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1 * sum2);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Identify most influential variables
 */
export function findInfluentialVariables(
  relationships: Relationship[],
  variables: Variable[]
): string[] {
  const influenceScores = new Map<string, number>();

  // Initialize scores
  variables.forEach((v) => influenceScores.set(v.id, 0));

  // Calculate outgoing influence
  relationships.forEach((r) => {
    if (!r.isActive) return;
    const score = influenceScores.get(r.sourceId) || 0;
    influenceScores.set(r.sourceId, score + Math.abs(r.influenceStrength));
  });

  // Sort by influence
  return [...influenceScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
}

/**
 * Generate simulation analysis
 */
export function generateAnalysis(
  results: SimulationResult[],
  variables: Variable[],
  relationships: Relationship[]
): SimulationAnalysis {
  const equilibriumReached = results.length > 0 &&
    results[results.length - 1].systemState === 'stable';

  let equilibriumIteration: number | undefined;
  for (let i = 0; i < results.length; i++) {
    if (results[i].systemState === 'stable') {
      equilibriumIteration = results[i].iteration;
      break;
    }
  }

  const hasOscillation = results.some((r) => r.systemState === 'oscillating');
  const hasChaos = results.some((r) => r.systemState === 'chaotic');

  return {
    equilibriumReached,
    equilibriumIteration,
    oscillationDetected: hasOscillation,
    chaosDetected: hasChaos,
    mostInfluentialVariables: findInfluentialVariables(relationships, variables),
    criticalRelationships: relationships
      .filter((r) => Math.abs(r.influenceStrength) > 0.7)
      .slice(0, 5)
      .map((r) => r.id),
  };
}
