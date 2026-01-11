import { useState } from 'react';
import type { ChangeEvent } from 'react';
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

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      className={`p-4 transition-all ${
        isConnectionTarget
          ? 'bg-[#e8f5ec] cursor-pointer'
          : variable.isLocked
          ? 'bg-[#f7f5f2]'
          : 'hover:bg-[#f7f5f2]'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: variable.categoryColor }}
          />
          <div>
            <h3 className="font-medium text-sm text-[#1a1a1a]">{variable.name}</h3>
            {variable.description && (
              <p className="text-xs text-[#8a8a8a] mt-0.5 line-clamp-1">
                {variable.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className={`flex items-center gap-0.5 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => lockVariable(variable.id, !variable.isLocked)}
            className="p-1.5 text-[#8a8a8a] hover:text-[#1a1a1a] hover:bg-[#e5e2dd] rounded"
            title={variable.isLocked ? 'Unlock variable' : 'Lock variable'}
          >
            {variable.isLocked ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => startCreatingRelationship(variable.id)}
            className="p-1.5 text-[#8a8a8a] hover:text-[#2d8a4e] hover:bg-[#e8f5ec] rounded"
            title="Create relationship"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </button>

          <button
            onClick={() => openVariableModal(variable.id)}
            className="p-1.5 text-[#8a8a8a] hover:text-[#1a1a1a] hover:bg-[#e5e2dd] rounded"
            title="Edit variable"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>

          <button
            onClick={handleDuplicate}
            className="p-1.5 text-[#8a8a8a] hover:text-[#1a1a1a] hover:bg-[#e5e2dd] rounded"
            title="Duplicate variable"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 text-[#8a8a8a] hover:text-[#b91c1c] hover:bg-[#fde8e8] rounded"
            title="Delete variable"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Value Display */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-semibold text-[#1a1a1a]">
            {formatValue(variable.currentValue)}
          </span>
          {variable.units && (
            <span className="text-xs text-[#8a8a8a]">{variable.units}</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-2">
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
        <div className="flex justify-between text-[10px] text-[#a3a3a3] mt-1">
          <span>{formatValue(variable.min)}</span>
          <span>{formatValue(variable.max)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
        <div className="flex items-center gap-2">
          {totalConnections > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              {totalConnections}
            </span>
          )}
        </div>

        {variable.currentValue !== variable.defaultValue && (
          <button
            onClick={() => resetVariable(variable.id)}
            className="text-[#525252] hover:text-[#1a1a1a]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
