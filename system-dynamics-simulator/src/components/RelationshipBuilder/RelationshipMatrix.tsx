import { useMemo } from 'react';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';
import { buildRelationshipMatrix } from '../../utils/relationshipCalculator';

export function RelationshipMatrix() {
  const { variables } = useVariableStore();
  const { relationships, addRelationship, getRelationshipBetween } = useRelationshipStore();
  const { openRelationshipModal } = useUIStore();

  const { matrix, ids } = useMemo(() => {
    return buildRelationshipMatrix(variables, relationships);
  }, [variables, relationships]);

  const handleCellClick = (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) return;

    const sourceId = ids[sourceIdx];
    const targetId = ids[targetIdx];
    const existing = getRelationshipBetween(sourceId, targetId);

    if (existing) {
      openRelationshipModal(existing.id);
    } else {
      // Quick create a positive relationship
      const id = addRelationship({
        sourceId,
        targetId,
        relationshipType: 'positive',
        influenceStrength: 0.5,
        delay: 0,
        curveType: 'linear',
        threshold: 0,
        saturation: 1,
        isActive: true,
      });
      openRelationshipModal(id);
    }
  };

  const getCellColor = (value: number | null): string => {
    if (value === null) return 'bg-gray-100';
    if (value === 0) return 'bg-gray-50';

    const absValue = Math.abs(value);
    const intensity = Math.min(absValue, 1);

    if (value > 0) {
      // Green gradient
      const green = Math.round(200 + intensity * 55);
      const other = Math.round(255 - intensity * 155);
      return `bg-[rgb(${other},${green},${other})]`;
    } else {
      // Red gradient
      const red = Math.round(200 + intensity * 55);
      const other = Math.round(255 - intensity * 155);
      return `bg-[rgb(${red},${other},${other})]`;
    }
  };

  if (variables.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Add variables to see the relationship matrix
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 bg-gray-100 p-2 text-xs font-medium text-gray-500 border border-gray-200">
              Source → Target
            </th>
            {variables.map((v) => (
              <th
                key={v.id}
                className="sticky top-0 z-10 bg-gray-100 p-2 text-xs font-medium text-gray-700 border border-gray-200 min-w-[80px] max-w-[120px]"
              >
                <div className="flex items-center gap-1 justify-center">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: v.categoryColor }}
                  />
                  <span className="truncate">{v.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variables.map((sourceVar, sourceIdx) => (
            <tr key={sourceVar.id}>
              <td className="sticky left-0 z-10 bg-gray-100 p-2 text-xs font-medium text-gray-700 border border-gray-200">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sourceVar.categoryColor }}
                  />
                  <span className="truncate max-w-[100px]">{sourceVar.name}</span>
                </div>
              </td>
              {variables.map((targetVar, targetIdx) => {
                const value = matrix[sourceIdx][targetIdx];
                const isDiagonal = sourceIdx === targetIdx;

                return (
                  <td
                    key={targetVar.id}
                    className={`p-2 text-center text-xs border border-gray-200 transition-colors ${
                      isDiagonal
                        ? 'bg-gray-200 cursor-not-allowed'
                        : `${getCellColor(value)} cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset`
                    }`}
                    onClick={() => !isDiagonal && handleCellClick(sourceIdx, targetIdx)}
                    title={
                      isDiagonal
                        ? 'Self-relationship not allowed'
                        : value !== null
                        ? `${sourceVar.name} → ${targetVar.name}: ${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`
                        : `Click to create: ${sourceVar.name} → ${targetVar.name}`
                    }
                  >
                    {isDiagonal ? (
                      <span className="text-gray-400">-</span>
                    ) : value !== null ? (
                      <span
                        className={`font-medium ${
                          value > 0 ? 'text-green-800' : value < 0 ? 'text-red-800' : 'text-gray-500'
                        }`}
                      >
                        {value > 0 ? '+' : ''}
                        {(value * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-gray-300">+</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-300 border border-green-400" />
          <span>Positive influence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-300 border border-red-400" />
          <span>Negative influence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <span>No relationship</span>
        </div>
      </div>
    </div>
  );
}
