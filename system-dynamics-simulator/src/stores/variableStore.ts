import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Variable, Category, VariableType, DisplayFormat, VariableHistory } from '../types';

interface VariableState {
  variables: Variable[];
  categories: Category[];
  history: VariableHistory[];
  maxHistoryLength: number;

  // Variable CRUD
  addVariable: (variable: Omit<Variable, 'id' | 'currentValue' | 'createdAt' | 'updatedAt'>) => string;
  updateVariable: (id: string, updates: Partial<Variable>) => void;
  deleteVariable: (id: string) => void;
  duplicateVariable: (id: string) => string | null;
  setVariableValue: (id: string, value: number) => void;
  lockVariable: (id: string, locked: boolean) => void;
  resetVariable: (id: string) => void;
  resetAllVariables: () => void;

  // Bulk operations
  addVariables: (variables: Omit<Variable, 'id' | 'currentValue' | 'createdAt' | 'updatedAt'>[]) => string[];
  deleteVariables: (ids: string[]) => void;

  // Category operations
  addCategory: (category: Omit<Category, 'id'>) => string;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Position updates
  updateVariablePosition: (id: string, position: { x: number; y: number }) => void;

  // History
  recordHistory: () => void;
  clearHistory: () => void;

  // Getters
  getVariable: (id: string) => Variable | undefined;
  getVariablesByCategory: (categoryId: string) => Variable[];
  getCategory: (id: string) => Category | undefined;

  // Import/Export
  importVariables: (variables: Variable[], categories: Category[]) => void;
  clearAll: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'business', name: 'Business', color: '#3b82f6', description: 'Business metrics and KPIs' },
  { id: 'technical', name: 'Technical', color: '#8b5cf6', description: 'Technical and system metrics' },
  { id: 'hr', name: 'Human Resources', color: '#f59e0b', description: 'People and team metrics' },
  { id: 'financial', name: 'Financial', color: '#10b981', description: 'Financial metrics' },
  { id: 'environmental', name: 'Environmental', color: '#06b6d4', description: 'Environmental factors' },
  { id: 'custom', name: 'Custom', color: '#6b7280', description: 'Custom variables' },
];

export const useVariableStore = create<VariableState>()(
  persist(
    (set, get) => ({
      variables: [],
      categories: DEFAULT_CATEGORIES,
      history: [],
      maxHistoryLength: 1000,

      addVariable: (variableData) => {
        const id = uuidv4();
        const now = Date.now();
        const newVariable: Variable = {
          ...variableData,
          id,
          currentValue: variableData.defaultValue,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          variables: [...state.variables, newVariable],
          history: [...state.history, { variableId: id, values: [] }],
        }));

        return id;
      },

      updateVariable: (id, updates) => {
        set((state) => ({
          variables: state.variables.map((v) =>
            v.id === id ? { ...v, ...updates, updatedAt: Date.now() } : v
          ),
        }));
      },

      deleteVariable: (id) => {
        set((state) => ({
          variables: state.variables.filter((v) => v.id !== id),
          history: state.history.filter((h) => h.variableId !== id),
        }));
      },

      duplicateVariable: (id) => {
        const variable = get().variables.find((v) => v.id === id);
        if (!variable) return null;

        const newId = uuidv4();
        const now = Date.now();
        const duplicated: Variable = {
          ...variable,
          id: newId,
          name: `${variable.name} (Copy)`,
          currentValue: variable.defaultValue,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          variables: [...state.variables, duplicated],
          history: [...state.history, { variableId: newId, values: [] }],
        }));

        return newId;
      },

      setVariableValue: (id, value) => {
        set((state) => ({
          variables: state.variables.map((v) => {
            if (v.id === id && !v.isLocked) {
              const clampedValue = Math.max(v.min, Math.min(v.max, value));
              return { ...v, currentValue: clampedValue, updatedAt: Date.now() };
            }
            return v;
          }),
        }));
      },

      lockVariable: (id, locked) => {
        set((state) => ({
          variables: state.variables.map((v) =>
            v.id === id ? { ...v, isLocked: locked, updatedAt: Date.now() } : v
          ),
        }));
      },

      resetVariable: (id) => {
        set((state) => ({
          variables: state.variables.map((v) =>
            v.id === id ? { ...v, currentValue: v.defaultValue, updatedAt: Date.now() } : v
          ),
        }));
      },

      resetAllVariables: () => {
        set((state) => ({
          variables: state.variables.map((v) => ({
            ...v,
            currentValue: v.defaultValue,
            updatedAt: Date.now(),
          })),
        }));
      },

      addVariables: (variablesData) => {
        const now = Date.now();
        const newVariables: Variable[] = variablesData.map((v, index) => ({
          ...v,
          id: uuidv4(),
          currentValue: v.defaultValue,
          createdAt: now + index,
          updatedAt: now + index,
        }));

        const newHistory: VariableHistory[] = newVariables.map((v) => ({
          variableId: v.id,
          values: [],
        }));

        set((state) => ({
          variables: [...state.variables, ...newVariables],
          history: [...state.history, ...newHistory],
        }));

        return newVariables.map((v) => v.id);
      },

      deleteVariables: (ids) => {
        set((state) => ({
          variables: state.variables.filter((v) => !ids.includes(v.id)),
          history: state.history.filter((h) => !ids.includes(h.variableId)),
        }));
      },

      addCategory: (categoryData) => {
        const id = uuidv4();
        const newCategory: Category = { ...categoryData, id };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));

        return id;
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        // Move variables in this category to 'custom'
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          variables: state.variables.map((v) =>
            v.category === id ? { ...v, category: 'custom', updatedAt: Date.now() } : v
          ),
        }));
      },

      updateVariablePosition: (id, position) => {
        set((state) => ({
          variables: state.variables.map((v) =>
            v.id === id ? { ...v, position } : v
          ),
        }));
      },

      recordHistory: () => {
        const now = Date.now();
        const { variables, maxHistoryLength } = get();

        set((state) => ({
          history: state.history.map((h) => {
            const variable = variables.find((v) => v.id === h.variableId);
            if (!variable) return h;

            const newValues = [...h.values, { timestamp: now, value: variable.currentValue }];
            // Trim if exceeds max length
            if (newValues.length > maxHistoryLength) {
              newValues.splice(0, newValues.length - maxHistoryLength);
            }
            return { ...h, values: newValues };
          }),
        }));
      },

      clearHistory: () => {
        set((state) => ({
          history: state.history.map((h) => ({ ...h, values: [] })),
        }));
      },

      getVariable: (id) => {
        return get().variables.find((v) => v.id === id);
      },

      getVariablesByCategory: (categoryId) => {
        return get().variables.filter((v) => v.category === categoryId);
      },

      getCategory: (id) => {
        return get().categories.find((c) => c.id === id);
      },

      importVariables: (variables, categories) => {
        const newHistory: VariableHistory[] = variables.map((v) => ({
          variableId: v.id,
          values: [],
        }));

        set({
          variables,
          categories: [...DEFAULT_CATEGORIES, ...categories.filter(
            (c) => !DEFAULT_CATEGORIES.some((dc) => dc.id === c.id)
          )],
          history: newHistory,
        });
      },

      clearAll: () => {
        set({
          variables: [],
          categories: DEFAULT_CATEGORIES,
          history: [],
        });
      },
    }),
    {
      name: 'system-dynamics-variables',
      partialize: (state) => ({
        variables: state.variables,
        categories: state.categories,
      }),
    }
  )
);

// Helper function to create a new variable with defaults
export function createVariableDefaults(
  name: string,
  category: string = 'custom'
): Omit<Variable, 'id' | 'currentValue' | 'createdAt' | 'updatedAt'> {
  const defaultCategory = DEFAULT_CATEGORIES.find((c) => c.id === category) || DEFAULT_CATEGORIES[5];

  return {
    name,
    description: '',
    category,
    categoryColor: defaultCategory.color,
    units: '',
    min: 0,
    max: 100,
    defaultValue: 50,
    variableType: 'continuous' as VariableType,
    displayFormat: {
      decimalPlaces: 2,
      useThousandsSeparator: false,
    } as DisplayFormat,
    isLocked: false,
  };
}
