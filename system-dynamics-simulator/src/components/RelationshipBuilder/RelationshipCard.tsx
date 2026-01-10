import { useState } from 'react';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';
import type { Relationship } from '../../types';

interface RelationshipCardProps {
  relationship: Relationship;
}

const CURVE_TYPE_LABELS: Record<string, string> = {
  linear: 'Linear',
  exponential: 'Exponential',
  logarithmic: 'Logarithmic',
  sigmoid: 'Sigmoid',
  step: 'Step',
  custom: 'Custom',
};

export function RelationshipCard({ relationship }: RelationshipCardProps) {
  const { getVariable } = useVariableStore();
  const { deleteRelationship, toggleRelationshipActive } = useRelationshipStore();
  const { openRelationshipModal } = useUIStore();

  const [showDetails, setShowDetails] = useState(false);

  const source = getVariable(relationship.sourceId);
  const target = getVariable(relationship.targetId);

  if (!source || !target) return null;

  const handleDelete = () => {
    if (confirm(`Delete relationship between "${source.name}" and "${target.name}"?`)) {
      deleteRelationship(relationship.id);
    }
  };

  const strengthPercent = Math.abs(relationship.influenceStrength) * 100;

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm transition-all ${
        relationship.isActive
          ? 'border-gray-200'
          : 'border-gray-200 opacity-60'
      }`}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Source -> Target */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: source.categoryColor }}
              />
              <span className="font-medium text-gray-900">{source.name}</span>
            </div>

            <div className="flex items-center">
              <div
                className={`w-8 h-0.5 ${
                  relationship.relationshipType === 'positive'
                    ? 'bg-green-500'
                    : relationship.relationshipType === 'negative'
                    ? 'bg-red-500'
                    : 'bg-purple-500'
                }`}
              />
              <svg
                className={`w-3 h-3 -ml-0.5 ${
                  relationship.relationshipType === 'positive'
                    ? 'text-green-500'
                    : relationship.relationshipType === 'negative'
                    ? 'text-red-500'
                    : 'text-purple-500'
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 17l5-5-5-5v10z" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: target.categoryColor }}
              />
              <span className="font-medium text-gray-900">{target.name}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleRelationshipActive(relationship.id)}
              className={`p-1.5 rounded transition-colors ${
                relationship.isActive
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={relationship.isActive ? 'Deactivate' : 'Activate'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {relationship.isActive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Show details"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={() => openRelationshipModal(relationship.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span
            className={`px-2 py-0.5 rounded ${
              relationship.relationshipType === 'positive'
                ? 'bg-green-100 text-green-700'
                : relationship.relationshipType === 'negative'
                ? 'bg-red-100 text-red-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {relationship.relationshipType === 'positive' ? '+' : relationship.relationshipType === 'negative' ? '-' : '~'}
            {strengthPercent.toFixed(0)}%
          </span>

          <span>{CURVE_TYPE_LABELS[relationship.curveType]}</span>

          {relationship.delay > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {relationship.delay} delay
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Strength:</span>
              <div className="mt-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      relationship.relationshipType === 'positive'
                        ? 'bg-green-500'
                        : relationship.relationshipType === 'negative'
                        ? 'bg-red-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="text-gray-500">Curve Type:</span>
              <p className="font-medium text-gray-900">{CURVE_TYPE_LABELS[relationship.curveType]}</p>
            </div>

            <div>
              <span className="text-gray-500">Delay:</span>
              <p className="font-medium text-gray-900">{relationship.delay} time units</p>
            </div>

            <div>
              <span className="text-gray-500">Threshold:</span>
              <p className="font-medium text-gray-900">{(relationship.threshold * 100).toFixed(0)}%</p>
            </div>

            <div>
              <span className="text-gray-500">Saturation:</span>
              <p className="font-medium text-gray-900">{(relationship.saturation * 100).toFixed(0)}%</p>
            </div>

            {relationship.customFormula && (
              <div className="col-span-2">
                <span className="text-gray-500">Formula:</span>
                <p className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded mt-1">
                  {relationship.customFormula}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
