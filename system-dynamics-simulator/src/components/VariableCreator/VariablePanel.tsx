import { useMemo, useState } from 'react';
import { useVariableStore, useUIStore } from '../../stores';
import { VariableCard } from './VariableCard';
import { VariableModal } from './VariableModal';

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="card-industrial mb-4">
        <div className="p-4 border-b border-[#e5e2dd]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-[#1a1a1a]">Variables</h2>
              <p className="text-xs text-[#6b6b6b] mt-0.5">{variables.length} total</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetAllVariables}
                className="btn-industrial btn-ghost text-xs"
                title="Reset all variables to default values"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Reset
              </button>
              <button onClick={() => openVariableModal()} className="btn-industrial btn-primary text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Variable
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 flex gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-industrial pl-9"
            />
          </div>
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="input-industrial w-auto"
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
      <div className="flex-1 overflow-y-auto">
        {filteredVariables.length === 0 ? (
          <div className="card-industrial p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#f7f5f2] border border-[#e5e2dd] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#8a8a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.745 3A23.933 23.933 0 003 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 011.105.402l2.402 7.206a.75.75 0 001.104.401l1.445-.889m-8.25.75l.213.09a1.687 1.687 0 002.062-.617l4.45-6.676a1.688 1.688 0 012.062-.618l.213.09" />
              </svg>
            </div>
            <h3 className="font-medium text-[#1a1a1a] mb-1">No variables yet</h3>
            <p className="text-sm text-[#6b6b6b] mb-4">
              {searchQuery
                ? 'No variables match your search'
                : 'Create your first variable to get started'}
            </p>
            {!searchQuery && (
              <button onClick={() => openVariableModal()} className="btn-industrial btn-primary text-xs">
                Create Variable
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedVariables).map(([categoryId, categoryVariables]) => {
              const category = categories.find((c) => c.id === categoryId);
              const isCollapsed = collapsedCategories.has(categoryId);

              return (
                <div key={categoryId} className="card-industrial">
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="flex items-center gap-2 w-full p-3 hover:bg-[#f7f5f2] transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    />
                    <span className="font-medium text-sm text-[#1a1a1a]">
                      {category?.name || categoryId}
                    </span>
                    <span className="text-xs text-[#8a8a8a]">({categoryVariables.length})</span>
                    <svg
                      className={`w-4 h-4 text-[#8a8a8a] ml-auto transition-transform ${
                        isCollapsed ? '' : 'rotate-90'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>

                  {!isCollapsed && (
                    <div className="border-t border-[#e5e2dd]">
                      {categoryVariables.map((variable, idx) => (
                        <div
                          key={variable.id}
                          className={idx !== categoryVariables.length - 1 ? 'border-b border-[#e5e2dd]' : ''}
                        >
                          <VariableCard variable={variable} />
                        </div>
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
