import { useMemo, useState } from 'react';
import { useVariableStore, useUIStore } from '../../stores';
import { VariableCard } from './VariableCard';
import { VariableModal } from './VariableModal';
import { Button } from '../common/FormControls';

export function VariablePanel() {
  const { variables, categories, resetAllVariables } = useVariableStore();
  const {
    isVariableModalOpen,
    selectedVariableId,
    openVariableModal,
    closeVariableModal,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
  } = useUIStore();

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Filter and group variables
  const filteredVariables = useMemo(() => {
    return variables.filter((v) => {
      const matchesSearch =
        !searchQuery ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || v.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [variables, searchQuery, filterCategory]);

  const groupedVariables = useMemo(() => {
    const groups: Record<string, typeof variables> = {};
    filteredVariables.forEach((v) => {
      if (!groups[v.category]) {
        groups[v.category] = [];
      }
      groups[v.category].push(v);
    });
    return groups;
  }, [filteredVariables]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Variables</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllVariables}
              title="Reset all variables to default values"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </Button>
            <Button size="sm" onClick={() => openVariableModal()}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Variable
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredVariables.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No variables yet</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'No variables match your search'
                : 'Create your first variable to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => openVariableModal()}>Create Variable</Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedVariables).map(([categoryId, categoryVariables]) => {
              const category = categories.find((c) => c.id === categoryId);
              const isCollapsed = collapsedCategories.has(categoryId);

              return (
                <div key={categoryId}>
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="flex items-center gap-2 w-full mb-3 group"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      {category?.name || categoryId}
                    </span>
                    <span className="text-sm text-gray-400">({categoryVariables.length})</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isCollapsed ? '' : 'rotate-90'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {!isCollapsed && (
                    <div className="grid gap-3">
                      {categoryVariables.map((variable) => (
                        <VariableCard key={variable.id} variable={variable} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Variable Modal */}
      <VariableModal
        isOpen={isVariableModalOpen}
        onClose={closeVariableModal}
        variableId={selectedVariableId}
      />
    </div>
  );
}
