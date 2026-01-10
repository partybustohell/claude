import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useVariableStore, useRelationshipStore, useSimulationStore } from '../../stores';
import { calculateImpact } from '../../utils/relationshipCalculator';

type ChartType = 'line' | 'area' | 'bar' | 'radar';

export function AnalyticsPanel() {
  const { variables, history } = useVariableStore();
  const { relationships } = useRelationshipStore();
  const { analysis } = useSimulationStore();

  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Prepare chart data from history
  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const maxLength = Math.max(...history.map((h) => h.values.length));
    const data: Record<string, any>[] = [];

    for (let i = 0; i < maxLength; i++) {
      const point: Record<string, any> = { index: i };

      history.forEach((h) => {
        const variable = variables.find((v) => v.id === h.variableId);
        if (variable && h.values[i]) {
          point[variable.name] = h.values[i].value;
        }
      });

      data.push(point);
    }

    return data;
  }, [history, variables]);

  // Impact analysis data
  const impactData = useMemo(() => {
    return variables.map((v) => {
      const impact = calculateImpact(v.id, variables, relationships);
      return {
        name: v.name,
        id: v.id,
        color: v.categoryColor,
        directInfluence: impact.directInfluence,
        indirectInfluence: impact.indirectInfluence,
        totalInfluence: impact.totalInfluence,
        affectedCount: impact.affectedVariables.length,
      };
    }).sort((a, b) => b.totalInfluence - a.totalInfluence);
  }, [variables, relationships]);

  // Radar chart data for variable values
  const radarData = useMemo(() => {
    return variables.map((v) => {
      const range = v.max - v.min;
      const normalized = range > 0 ? ((v.currentValue - v.min) / range) * 100 : 50;
      return {
        name: v.name,
        value: normalized,
        fullMark: 100,
      };
    });
  }, [variables]);

  const displayVariables = selectedVariables.length > 0
    ? variables.filter((v) => selectedVariables.includes(v.id))
    : variables.slice(0, 5);

  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  ];

  const toggleVariable = (id: string) => {
    setSelectedVariables((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  if (variables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No data to analyze</p>
          <p className="text-sm">Add variables and run a simulation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Variable Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Variables to Display</h3>
        <div className="flex flex-wrap gap-2">
          {variables.map((v, idx) => (
            <button
              key={v.id}
              onClick={() => toggleVariable(v.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedVariables.includes(v.id) || (selectedVariables.length === 0 && idx < 5)
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.categoryColor }} />
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Chart Type:</span>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['line', 'area', 'bar'] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                chartType === type
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Variable History</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="index" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {displayVariables.map((v, idx) => (
                  <Line
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="index" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {displayVariables.map((v, idx) => (
                  <Area
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.3}
                  />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={chartData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="index" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {displayVariables.map((v, idx) => (
                  <Bar
                    key={v.id}
                    dataKey={v.name}
                    fill={colors[idx % colors.length]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Run simulation to see history data
          </div>
        )}
      </div>

      {/* Current Values Radar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Values (Normalized)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData.slice(0, 8)}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Radar
              name="Value"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Variable Influence Ranking</h3>
        <div className="space-y-3">
          {impactData.slice(0, 10).map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-6">#{idx + 1}</span>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                {item.name}
              </span>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span title="Direct influence">
                  D: {item.directInfluence.toFixed(2)}
                </span>
                <span title="Indirect influence">
                  I: {item.indirectInfluence.toFixed(2)}
                </span>
                <span title="Affected variables">
                  → {item.affectedCount}
                </span>
              </div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min(100, item.totalInfluence * 50)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Simulation Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Equilibrium</span>
              <p className="font-medium text-gray-900">
                {analysis.equilibriumReached
                  ? `Reached at iteration ${analysis.equilibriumIteration}`
                  : 'Not reached'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Oscillation</span>
              <p className="font-medium text-gray-900">
                {analysis.oscillationDetected ? 'Detected' : 'Not detected'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Chaos</span>
              <p className="font-medium text-gray-900">
                {analysis.chaosDetected ? 'Detected' : 'Not detected'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Most Influential</span>
              <p className="font-medium text-gray-900 text-sm">
                {analysis.mostInfluentialVariables
                  .slice(0, 3)
                  .map((id) => variables.find((v) => v.id === id)?.name)
                  .filter(Boolean)
                  .join(', ') || 'None'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
