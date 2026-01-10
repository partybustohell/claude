import { useState, useMemo } from 'react';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';
import { RelationshipModal } from './RelationshipModal';
import { RelationshipCard } from './RelationshipCard';
import { RelationshipMatrix } from './RelationshipMatrix';
import { Button } from '../common/FormControls';
import { suggestRelationships, detectConflicts } from '../../utils/relationshipCalculator';

type ViewMode = 'list' | 'matrix';

export function RelationshipPanel() {
  const { variables } = useVariableStore();
  const {
    relationships,
    applySuggestion,
  } = useRelationshipStore();
  const {
    isRelationshipModalOpen,
    selectedRelationshipId,
    openRelationshipModal,
    closeRelationshipModal,
    isCreatingRelationship,
    relationshipSource,
    cancelCreatingRelationship,
  } = useUIStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  // Generate suggestions
  const generatedSuggestions = useMemo(() => {
    return suggestRelationships(variables, relationships);
  }, [variables, relationships]);

  // Detect conflicts
  const conflicts = useMemo(() => {
    return detectConflicts(relationships);
  }, [relationships]);

  const handleCreateRelationship = () => {
    if (isCreatingRelationship && relationshipSource) {
      setSelectedSourceId(relationshipSource);
      cancelCreatingRelationship();
    }
    openRelationshipModal();
  };

  const handleApplySuggestion = (sourceId: string, targetId: string) => {
    applySuggestion(sourceId, targetId);
  };

  const handleApplyAllSuggestions = () => {
    generatedSuggestions.forEach((s) => {
      applySuggestion(s.sourceId, s.targetId);
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Relationships</h2>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'matrix'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Matrix
              </button>
            </div>

            <Button size="sm" onClick={handleCreateRelationship}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </Button>
          </div>
        </div>

        {/* Creating Relationship Banner */}
        {isCreatingRelationship && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Creating relationship</p>
                <p className="text-xs text-blue-700">
                  Click on a target variable in the Variables panel
                </p>
              </div>
            </div>
            <button
              onClick={cancelCreatingRelationship}
              className="text-blue-600 hover:text-blue-800"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Conflicts Warning */}
        {conflicts.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                {conflicts.length} potential conflict{conflicts.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {generatedSuggestions.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {generatedSuggestions.length} relationship suggestion{generatedSuggestions.length !== 1 ? 's' : ''}
            </button>

            {showSuggestions && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-blue-900">Suggested Relationships</span>
                  <Button size="sm" variant="ghost" onClick={handleApplyAllSuggestions}>
                    Apply All
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generatedSuggestions.slice(0, 10).map((suggestion) => {
                    const source = variables.find((v) => v.id === suggestion.sourceId);
                    const target = variables.find((v) => v.id === suggestion.targetId);
                    if (!source || !target) return null;

                    return (
                      <div
                        key={`${suggestion.sourceId}-${suggestion.targetId}`}
                        className="flex items-center justify-between p-2 bg-white rounded border border-blue-100"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{source.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              suggestion.suggestedType === 'positive'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {suggestion.suggestedType === 'positive' ? '+' : '-'}
                          </span>
                          <span className="font-medium">{target.name}</span>
                        </div>
                        <button
                          onClick={() => handleApplySuggestion(suggestion.sourceId, suggestion.targetId)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Apply
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{relationships.length} relationship{relationships.length !== 1 ? 's' : ''}</span>
          <span>{relationships.filter((r) => r.isActive).length} active</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'list' ? (
          relationships.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No relationships yet</h3>
              <p className="text-gray-500 mb-4">
                Connect variables to define how they influence each other
              </p>
              <Button onClick={() => openRelationshipModal()}>Create Relationship</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {relationships.map((relationship) => (
                <RelationshipCard key={relationship.id} relationship={relationship} />
              ))}
            </div>
          )
        ) : (
          <RelationshipMatrix />
        )}
      </div>

      {/* Relationship Modal */}
      <RelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => {
          closeRelationshipModal();
          setSelectedSourceId(null);
          setSelectedTargetId(null);
        }}
        relationshipId={selectedRelationshipId}
        initialSourceId={selectedSourceId || relationshipSource}
        initialTargetId={selectedTargetId}
      />
    </div>
  );
}
