import React, { useState } from 'react';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';
import type { Variable } from '../../types';

interface VariableCardProps {
  variable: Variable;
}

export function VariableCard({ variable }: VariableCardProps) {
  const { setVariableValue, lockVariable, resetVariable, deleteVariable, duplicateVariable } = useVariableStore();
  const { deleteRelationshipsForVariable, getRelationshipsForVariable } = useRelationshipStore();
  const { openVariableModal, startCreatingRelationship, isCreatingRelationship, relationshipSource } = useUIStore();

  const [showActions, setShowActions] = useState(false);

  const formatValue = (value: number): string => {
    const { displayFormat } = variable;
    let formatted = displayFormat.useThousandsSeparator
      ? value.toLocaleString(undefined, {
          minimumFractionDigits: displayFormat.decimalPlaces,
          maximumFractionDigits: displayFormat.decimalPlaces,
        })
      : value.toFixed(displayFormat.decimalPlaces);

    return `${displayFormat.prefix || ''}${formatted}${displayFormat.suffix || ''}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVariableValue(variable.id, value);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${variable.name}"? This will also remove all its relationships.`)) {
      deleteRelationshipsForVariable(variable.id);
      deleteVariable(variable.id);
    }
  };

  const handleDuplicate = () => {
    duplicateVariable(variable.id);
  };

  const relationships = getRelationshipsForVariable(variable.id);
  const totalConnections = relationships.incoming.length + relationships.outgoing.length;

  const isConnectionTarget = isCreatingRelationship && relationshipSource !== variable.id;

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm p-4 transition-all ${
        isConnectionTarget
          ? 'border-blue-500 ring-2 ring-blue-200 cursor-pointer'
          : variable.isLocked
          ? 'border-gray-300 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: variable.categoryColor }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{variable.name}</h3>
            {variable.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {variable.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => lockVariable(variable.id, !variable.isLocked)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title={variable.isLocked ? 'Unlock variable' : 'Lock variable'}
          >
            {variable.isLocked ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => startCreatingRelationship(variable.id)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Create relationship"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          <button
            onClick={() => openVariableModal(variable.id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Edit variable"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={handleDuplicate}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Duplicate variable"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete variable"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Value Display */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-gray-900">
            {formatValue(variable.currentValue)}
          </span>
          {variable.units && (
            <span className="text-sm text-gray-500">{variable.units}</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <input
          type="range"
          min={variable.min}
          max={variable.max}
          step={variable.variableType === 'discrete' ? 1 : (variable.max - variable.min) / 100}
          value={variable.currentValue}
          onChange={handleSliderChange}
          disabled={variable.isLocked}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatValue(variable.min)}</span>
          <span>{formatValue(variable.max)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {totalConnections > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {totalConnections}
            </span>
          )}
        </div>

        {variable.currentValue !== variable.defaultValue && (
          <button
            onClick={() => resetVariable(variable.id)}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
