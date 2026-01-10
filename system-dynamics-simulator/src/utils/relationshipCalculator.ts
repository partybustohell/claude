import type {
  Variable,
  Relationship,
  RelationshipSuggestion,
  ImpactAnalysis,
  CorrelationResult,
} from '../types';

/**
 * Pattern keywords for relationship detection
 */
const POSITIVE_PATTERNS: Record<string, string[]> = {
  revenue: ['sales', 'customer', 'price', 'market'],
  satisfaction: ['quality', 'service', 'experience', 'support'],
  productivity: ['training', 'tools', 'motivation', 'efficiency'],
  performance: ['capacity', 'optimization', 'resources', 'speed'],
  growth: ['investment', 'marketing', 'innovation', 'expansion'],
  health: ['exercise', 'sleep', 'nutrition', 'rest'],
  skills: ['practice', 'learning', 'experience', 'training'],
  energy: ['sleep', 'nutrition', 'exercise', 'rest'],
  profit: ['revenue', 'efficiency', 'optimization'],
  quality: ['investment', 'training', 'resources', 'time'],
};

const NEGATIVE_PATTERNS: Record<string, string[]> = {
  cost: ['quality', 'speed', 'customization'],
  stress: ['productivity', 'satisfaction', 'health', 'performance'],
  errors: ['quality', 'reliability', 'satisfaction', 'reputation'],
  workload: ['satisfaction', 'quality', 'attention'],
  debt: ['investment', 'growth', 'flexibility'],
  delay: ['satisfaction', 'revenue', 'reputation'],
  fatigue: ['performance', 'productivity', 'accuracy'],
  churn: ['growth', 'revenue', 'stability'],
  turnover: ['productivity', 'knowledge', 'stability'],
  bugs: ['quality', 'reliability', 'satisfaction'],
};

/**
 * Calculate similarity between two strings
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Simple word overlap
  const words1 = s1.split(/[\s_-]+/);
  const words2 = s2.split(/[\s_-]+/);
  const common = words1.filter((w) => words2.some((w2) => w.includes(w2) || w2.includes(w)));

  return common.length / Math.max(words1.length, words2.length);
}

/**
 * Check if a pattern matches a variable name
 */
function matchesPattern(name: string, patterns: string[]): boolean {
  const lowerName = name.toLowerCase();
  return patterns.some((pattern) =>
    lowerName.includes(pattern) || stringSimilarity(lowerName, pattern) > 0.5
  );
}

/**
 * Suggest relationships based on variable names and categories
 */
export function suggestRelationships(
  variables: Variable[],
  existingRelationships: Relationship[]
): RelationshipSuggestion[] {
  const suggestions: RelationshipSuggestion[] = [];
  const existingPairs = new Set(
    existingRelationships.map((r) => `${r.sourceId}-${r.targetId}`)
  );

  for (const source of variables) {
    for (const target of variables) {
      if (source.id === target.id) continue;
      if (existingPairs.has(`${source.id}-${target.id}`)) continue;

      const sourceName = source.name.toLowerCase();
      const targetName = target.name.toLowerCase();

      // Check positive patterns
      for (const [key, patterns] of Object.entries(POSITIVE_PATTERNS)) {
        if (matchesPattern(sourceName, patterns) && targetName.includes(key)) {
          suggestions.push({
            sourceId: source.id,
            targetId: target.id,
            suggestedType: 'positive',
            suggestedStrength: 0.5,
            confidence: 0.7,
            reason: `"${source.name}" typically increases "${target.name}"`,
          });
          break;
        }
        if (sourceName.includes(key) && matchesPattern(targetName, patterns)) {
          suggestions.push({
            sourceId: target.id,
            targetId: source.id,
            suggestedType: 'positive',
            suggestedStrength: 0.5,
            confidence: 0.7,
            reason: `"${target.name}" typically increases "${source.name}"`,
          });
        }
      }

      // Check negative patterns
      for (const [key, patterns] of Object.entries(NEGATIVE_PATTERNS)) {
        if (sourceName.includes(key) && matchesPattern(targetName, patterns)) {
          suggestions.push({
            sourceId: source.id,
            targetId: target.id,
            suggestedType: 'negative',
            suggestedStrength: -0.5,
            confidence: 0.6,
            reason: `"${source.name}" typically decreases "${target.name}"`,
          });
          break;
        }
      }

      // Same category connections
      if (source.category === target.category && source.category !== 'custom') {
        const similarity = stringSimilarity(source.name, target.name);
        if (similarity > 0.3 && similarity < 0.8) {
          const existing = suggestions.find(
            (s) => s.sourceId === source.id && s.targetId === target.id
          );
          if (!existing) {
            suggestions.push({
              sourceId: source.id,
              targetId: target.id,
              suggestedType: 'positive',
              suggestedStrength: 0.3,
              confidence: 0.4,
              reason: `Same category: ${source.category}`,
            });
          }
        }
      }
    }
  }

  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 20);
}

/**
 * Detect conflicting relationships
 */
export function detectConflicts(
  relationships: Relationship[]
): { r1: string; r2: string; description: string }[] {
  const conflicts: { r1: string; r2: string; description: string }[] = [];

  for (let i = 0; i < relationships.length; i++) {
    for (let j = i + 1; j < relationships.length; j++) {
      const r1 = relationships[i];
      const r2 = relationships[j];

      // Check for opposite relationships between same variables
      if (r1.sourceId === r2.sourceId && r1.targetId === r2.targetId) {
        if (r1.relationshipType !== r2.relationshipType) {
          conflicts.push({
            r1: r1.id,
            r2: r2.id,
            description: 'Conflicting relationship types between same variables',
          });
        }
      }

      // Check for circular conflicts
      if (r1.sourceId === r2.targetId && r1.targetId === r2.sourceId) {
        if (r1.relationshipType === r2.relationshipType) {
          conflicts.push({
            r1: r1.id,
            r2: r2.id,
            description: 'Circular positive/negative feedback that may cause instability',
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Calculate impact analysis for a variable
 */
export function calculateImpact(
  variableId: string,
  _variables: Variable[],
  relationships: Relationship[],
  depth: number = 3
): ImpactAnalysis {
  const visited = new Set<string>();
  const directInfluence = new Map<string, number>();
  const indirectInfluence = new Map<string, number>();

  // Calculate direct influence
  const outgoing = relationships.filter((r) => r.sourceId === variableId && r.isActive);
  outgoing.forEach((r) => {
    directInfluence.set(r.targetId, Math.abs(r.influenceStrength));
  });

  // Calculate indirect influence using BFS
  const queue: { id: string; depth: number; multiplier: number }[] = [];
  outgoing.forEach((r) => {
    queue.push({ id: r.targetId, depth: 1, multiplier: Math.abs(r.influenceStrength) });
  });

  while (queue.length > 0) {
    const { id, depth: currentDepth, multiplier } = queue.shift()!;

    if (visited.has(id) || currentDepth > depth) continue;
    visited.add(id);

    const nextRelationships = relationships.filter((r) => r.sourceId === id && r.isActive);
    nextRelationships.forEach((r) => {
      const newMultiplier = multiplier * Math.abs(r.influenceStrength);
      const existing = indirectInfluence.get(r.targetId) || 0;
      indirectInfluence.set(r.targetId, existing + newMultiplier);

      queue.push({
        id: r.targetId,
        depth: currentDepth + 1,
        multiplier: newMultiplier,
      });
    });
  }

  const totalDirect = [...directInfluence.values()].reduce((a, b) => a + b, 0);
  const totalIndirect = [...indirectInfluence.values()].reduce((a, b) => a + b, 0);

  return {
    variableId,
    directInfluence: totalDirect,
    indirectInfluence: totalIndirect,
    totalInfluence: totalDirect + totalIndirect,
    affectedVariables: [...new Set([...directInfluence.keys(), ...indirectInfluence.keys()])],
  };
}

/**
 * Find all paths between two variables
 */
export function findPaths(
  sourceId: string,
  targetId: string,
  relationships: Relationship[],
  maxDepth: number = 5
): string[][] {
  const paths: string[][] = [];

  function dfs(current: string, path: string[], depth: number): void {
    if (depth > maxDepth) return;
    if (current === targetId) {
      paths.push([...path]);
      return;
    }

    const outgoing = relationships.filter(
      (r) => r.sourceId === current && r.isActive && !path.includes(r.targetId)
    );

    for (const r of outgoing) {
      path.push(r.targetId);
      dfs(r.targetId, path, depth + 1);
      path.pop();
    }
  }

  dfs(sourceId, [sourceId], 0);
  return paths;
}

/**
 * Calculate relationship matrix (for matrix view)
 */
export function buildRelationshipMatrix(
  variables: Variable[],
  relationships: Relationship[]
): { matrix: (number | null)[][]; ids: string[] } {
  const ids = variables.map((v) => v.id);
  const matrix: (number | null)[][] = [];

  for (let i = 0; i < ids.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < ids.length; j++) {
      if (i === j) {
        matrix[i][j] = null;
      } else {
        const relationship = relationships.find(
          (r) => r.sourceId === ids[i] && r.targetId === ids[j]
        );
        matrix[i][j] = relationship
          ? relationship.influenceStrength * (relationship.relationshipType === 'negative' ? -1 : 1)
          : null;
      }
    }
  }

  return { matrix, ids };
}

/**
 * Calculate correlations between variable histories
 */
export function calculateAllCorrelations(
  histories: Map<string, number[]>,
  minSamples: number = 10
): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  const ids = [...histories.keys()];

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const values1 = histories.get(ids[i]) || [];
      const values2 = histories.get(ids[j]) || [];

      if (values1.length < minSamples || values2.length < minSamples) continue;

      const minLen = Math.min(values1.length, values2.length);
      const v1 = values1.slice(-minLen);
      const v2 = values2.slice(-minLen);

      const correlation = calculatePearsonCorrelation(v1, v2);
      const significance = calculateSignificance(correlation, minLen);

      results.push({
        variable1Id: ids[i],
        variable2Id: ids[j],
        correlation,
        significance,
      });
    }
  }

  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateSignificance(r: number, n: number): number {
  if (n <= 2) return 0;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  // Simplified p-value approximation
  return Math.min(1, Math.exp(-Math.abs(t) * 0.5));
}
