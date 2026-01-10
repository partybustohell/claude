import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Relationship,
  RelationshipType,
  CurveType,
  ConditionalRule,
  RelationshipSuggestion,
  AutoConnectionMode,
} from '../types';

interface RelationshipState {
  relationships: Relationship[];
  suggestions: RelationshipSuggestion[];
  autoConnectionMode: AutoConnectionMode;

  // Relationship CRUD
  addRelationship: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  toggleRelationshipActive: (id: string) => void;

  // Bulk operations
  addRelationships: (relationships: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>[]) => string[];
  deleteRelationships: (ids: string[]) => void;
  deleteRelationshipsForVariable: (variableId: string) => void;

  // Conditional logic
  addConditionalRule: (relationshipId: string, rule: Omit<ConditionalRule, 'id'>) => void;
  updateConditionalRule: (relationshipId: string, ruleId: string, updates: Partial<ConditionalRule>) => void;
  deleteConditionalRule: (relationshipId: string, ruleId: string) => void;

  // Auto-connection
  setAutoConnectionMode: (mode: AutoConnectionMode) => void;
  addSuggestion: (suggestion: RelationshipSuggestion) => void;
  clearSuggestions: () => void;
  applySuggestion: (sourceId: string, targetId: string) => string | null;

  // Getters
  getRelationship: (id: string) => Relationship | undefined;
  getRelationshipsForVariable: (variableId: string) => {
    incoming: Relationship[];
    outgoing: Relationship[];
  };
  getRelationshipBetween: (sourceId: string, targetId: string) => Relationship | undefined;
  getActiveRelationships: () => Relationship[];

  // Analysis
  detectCycles: () => string[][];
  getInfluenceChain: (variableId: string, depth?: number) => string[];

  // Import/Export
  importRelationships: (relationships: Relationship[]) => void;
  clearAll: () => void;
}

export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set, get) => ({
      relationships: [],
      suggestions: [],
      autoConnectionMode: 'guided',

      addRelationship: (relationshipData) => {
        const id = uuidv4();
        const now = Date.now();

        // Check if relationship already exists
        const existing = get().getRelationshipBetween(
          relationshipData.sourceId,
          relationshipData.targetId
        );
        if (existing) {
          return existing.id;
        }

        const newRelationship: Relationship = {
          ...relationshipData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          relationships: [...state.relationships, newRelationship],
        }));

        return id;
      },

      updateRelationship: (id, updates) => {
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
          ),
        }));
      },

      deleteRelationship: (id) => {
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
        }));
      },

      toggleRelationshipActive: (id) => {
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive, updatedAt: Date.now() } : r
          ),
        }));
      },

      addRelationships: (relationshipsData) => {
        const now = Date.now();
        const existingPairs = new Set(
          get().relationships.map((r) => `${r.sourceId}-${r.targetId}`)
        );

        const newRelationships: Relationship[] = relationshipsData
          .filter((r) => !existingPairs.has(`${r.sourceId}-${r.targetId}`))
          .map((r, index) => ({
            ...r,
            id: uuidv4(),
            createdAt: now + index,
            updatedAt: now + index,
          }));

        set((state) => ({
          relationships: [...state.relationships, ...newRelationships],
        }));

        return newRelationships.map((r) => r.id);
      },

      deleteRelationships: (ids) => {
        set((state) => ({
          relationships: state.relationships.filter((r) => !ids.includes(r.id)),
        }));
      },

      deleteRelationshipsForVariable: (variableId) => {
        set((state) => ({
          relationships: state.relationships.filter(
            (r) => r.sourceId !== variableId && r.targetId !== variableId
          ),
        }));
      },

      addConditionalRule: (relationshipId, rule) => {
        const ruleWithId: ConditionalRule = { ...rule, id: uuidv4() };

        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === relationshipId
              ? {
                  ...r,
                  conditionalLogic: [...(r.conditionalLogic || []), ruleWithId],
                  updatedAt: Date.now(),
                }
              : r
          ),
        }));
      },

      updateConditionalRule: (relationshipId, ruleId, updates) => {
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === relationshipId
              ? {
                  ...r,
                  conditionalLogic: r.conditionalLogic?.map((rule) =>
                    rule.id === ruleId ? { ...rule, ...updates } : rule
                  ),
                  updatedAt: Date.now(),
                }
              : r
          ),
        }));
      },

      deleteConditionalRule: (relationshipId, ruleId) => {
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === relationshipId
              ? {
                  ...r,
                  conditionalLogic: r.conditionalLogic?.filter((rule) => rule.id !== ruleId),
                  updatedAt: Date.now(),
                }
              : r
          ),
        }));
      },

      setAutoConnectionMode: (mode) => {
        set({ autoConnectionMode: mode });
      },

      addSuggestion: (suggestion) => {
        set((state) => {
          // Avoid duplicates
          const exists = state.suggestions.some(
            (s) => s.sourceId === suggestion.sourceId && s.targetId === suggestion.targetId
          );
          if (exists) return state;

          return { suggestions: [...state.suggestions, suggestion] };
        });
      },

      clearSuggestions: () => {
        set({ suggestions: [] });
      },

      applySuggestion: (sourceId, targetId) => {
        const suggestion = get().suggestions.find(
          (s) => s.sourceId === sourceId && s.targetId === targetId
        );

        if (!suggestion) return null;

        const id = get().addRelationship({
          sourceId,
          targetId,
          relationshipType: suggestion.suggestedType,
          influenceStrength: suggestion.suggestedStrength,
          delay: 0,
          curveType: 'linear',
          threshold: 0,
          saturation: 1,
          isActive: true,
        });

        // Remove the suggestion
        set((state) => ({
          suggestions: state.suggestions.filter(
            (s) => !(s.sourceId === sourceId && s.targetId === targetId)
          ),
        }));

        return id;
      },

      getRelationship: (id) => {
        return get().relationships.find((r) => r.id === id);
      },

      getRelationshipsForVariable: (variableId) => {
        const relationships = get().relationships;
        return {
          incoming: relationships.filter((r) => r.targetId === variableId),
          outgoing: relationships.filter((r) => r.sourceId === variableId),
        };
      },

      getRelationshipBetween: (sourceId, targetId) => {
        return get().relationships.find(
          (r) => r.sourceId === sourceId && r.targetId === targetId
        );
      },

      getActiveRelationships: () => {
        return get().relationships.filter((r) => r.isActive);
      },

      detectCycles: () => {
        const relationships = get().relationships;
        const adjacencyList: Record<string, string[]> = {};

        // Build adjacency list
        relationships.forEach((r) => {
          if (!adjacencyList[r.sourceId]) {
            adjacencyList[r.sourceId] = [];
          }
          adjacencyList[r.sourceId].push(r.targetId);
        });

        const cycles: string[][] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        function dfs(node: string, path: string[]): void {
          visited.add(node);
          recursionStack.add(node);
          path.push(node);

          const neighbors = adjacencyList[node] || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              dfs(neighbor, [...path]);
            } else if (recursionStack.has(neighbor)) {
              // Found a cycle
              const cycleStart = path.indexOf(neighbor);
              if (cycleStart !== -1) {
                cycles.push(path.slice(cycleStart));
              }
            }
          }

          path.pop();
          recursionStack.delete(node);
        }

        const allNodes = new Set([
          ...relationships.map((r) => r.sourceId),
          ...relationships.map((r) => r.targetId),
        ]);

        allNodes.forEach((node) => {
          if (!visited.has(node)) {
            dfs(node, []);
          }
        });

        return cycles;
      },

      getInfluenceChain: (variableId, depth = 5) => {
        const relationships = get().relationships;
        const chain: string[] = [];
        const visited = new Set<string>();

        function traverse(nodeId: string, currentDepth: number): void {
          if (currentDepth >= depth || visited.has(nodeId)) return;

          visited.add(nodeId);
          const outgoing = relationships.filter((r) => r.sourceId === nodeId && r.isActive);

          outgoing.forEach((r) => {
            chain.push(r.targetId);
            traverse(r.targetId, currentDepth + 1);
          });
        }

        traverse(variableId, 0);
        return chain;
      },

      importRelationships: (relationships) => {
        set({ relationships });
      },

      clearAll: () => {
        set({
          relationships: [],
          suggestions: [],
        });
      },
    }),
    {
      name: 'system-dynamics-relationships',
      partialize: (state) => ({
        relationships: state.relationships,
        autoConnectionMode: state.autoConnectionMode,
      }),
    }
  )
);

// Helper function to create a relationship with defaults
export function createRelationshipDefaults(
  sourceId: string,
  targetId: string,
  type: RelationshipType = 'positive'
): Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    sourceId,
    targetId,
    relationshipType: type,
    influenceStrength: type === 'positive' ? 0.5 : -0.5,
    delay: 0,
    curveType: 'linear' as CurveType,
    threshold: 0,
    saturation: 1,
    isActive: true,
  };
}
