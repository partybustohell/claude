import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Slider, Toggle } from '../common/FormControls';
import { useVariableStore, useRelationshipStore, createRelationshipDefaults } from '../../stores';
import type { RelationshipType, CurveType } from '../../types';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationshipId?: string | null;
  initialSourceId?: string | null;
  initialTargetId?: string | null;
}

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string; description: string }[] = [
  { value: 'positive', label: 'Positive (+)', description: 'Increase in source increases target' },
  { value: 'negative', label: 'Negative (-)', description: 'Increase in source decreases target' },
  { value: 'custom', label: 'Custom', description: 'Define custom formula' },
];

const CURVE_TYPES: { value: CurveType; label: string; description: string }[] = [
  { value: 'linear', label: 'Linear', description: 'Proportional relationship' },
  { value: 'exponential', label: 'Exponential', description: 'Accelerating effect' },
  { value: 'logarithmic', label: 'Logarithmic', description: 'Diminishing returns' },
  { value: 'sigmoid', label: 'Sigmoid (S-curve)', description: 'Slow start, fast middle, slow end' },
  { value: 'step', label: 'Step', description: 'Binary on/off effect' },
];

export function RelationshipModal({
  isOpen,
  onClose,
  relationshipId,
  initialSourceId,
  initialTargetId,
}: RelationshipModalProps) {
  const { variables } = useVariableStore();
  const { relationships, addRelationship, updateRelationship, getRelationship } = useRelationshipStore();

  const [formData, setFormData] = useState({
    sourceId: '',
    targetId: '',
    relationshipType: 'positive' as RelationshipType,
    influenceStrength: 0.5,
    delay: 0,
    curveType: 'linear' as CurveType,
    threshold: 0,
    saturation: 1,
    customFormula: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (relationshipId) {
      const relationship = getRelationship(relationshipId);
      if (relationship) {
        setFormData({
          sourceId: relationship.sourceId,
          targetId: relationship.targetId,
          relationshipType: relationship.relationshipType,
          influenceStrength: Math.abs(relationship.influenceStrength),
          delay: relationship.delay,
          curveType: relationship.curveType,
          threshold: relationship.threshold,
          saturation: relationship.saturation,
          customFormula: relationship.customFormula || '',
          isActive: relationship.isActive,
        });
      }
    } else {
      const defaults = createRelationshipDefaults(
        initialSourceId || '',
        initialTargetId || '',
        'positive'
      );
      setFormData({
        sourceId: initialSourceId || '',
        targetId: initialTargetId || '',
        relationshipType: defaults.relationshipType,
        influenceStrength: Math.abs(defaults.influenceStrength),
        delay: defaults.delay,
        curveType: defaults.curveType,
        threshold: defaults.threshold,
        saturation: defaults.saturation,
        customFormula: '',
        isActive: defaults.isActive,
      });
    }
    setErrors({});
  }, [relationshipId, initialSourceId, initialTargetId, getRelationship, isOpen]);

  const variableOptions = variables.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sourceId) {
      newErrors.sourceId = 'Source variable is required';
    }

    if (!formData.targetId) {
      newErrors.targetId = 'Target variable is required';
    }

    if (formData.sourceId === formData.targetId) {
      newErrors.targetId = 'Source and target must be different';
    }

    // Check for duplicate relationship
    const existing = relationships.find(
      (r) =>
        r.sourceId === formData.sourceId &&
        r.targetId === formData.targetId &&
        r.id !== relationshipId
    );
    if (existing) {
      newErrors.targetId = 'This relationship already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const relationshipData = {
      sourceId: formData.sourceId,
      targetId: formData.targetId,
      relationshipType: formData.relationshipType,
      influenceStrength: formData.relationshipType === 'negative'
        ? -Math.abs(formData.influenceStrength)
        : Math.abs(formData.influenceStrength),
      delay: formData.delay,
      curveType: formData.curveType,
      threshold: formData.threshold,
      saturation: formData.saturation,
      customFormula: formData.relationshipType === 'custom' ? formData.customFormula : undefined,
      isActive: formData.isActive,
    };

    if (relationshipId) {
      updateRelationship(relationshipId, relationshipData);
    } else {
      addRelationship(relationshipData);
    }

    onClose();
  };

  const sourceVariable = variables.find((v) => v.id === formData.sourceId);
  const targetVariable = variables.find((v) => v.id === formData.targetId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={relationshipId ? 'Edit Relationship' : 'Create Relationship'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Variables Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Connected Variables
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Source Variable"
                value={formData.sourceId}
                onChange={(e) => setFormData((prev) => ({ ...prev, sourceId: e.target.value }))}
                options={[{ value: '', label: 'Select source...' }, ...variableOptions]}
                error={errors.sourceId}
              />
              {sourceVariable && (
                <p className="text-xs text-gray-500 mt-1">
                  Current: {sourceVariable.currentValue.toFixed(2)} {sourceVariable.units}
                </p>
              )}
            </div>

            <div>
              <Select
                label="Target Variable"
                value={formData.targetId}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetId: e.target.value }))}
                options={[{ value: '', label: 'Select target...' }, ...variableOptions]}
                error={errors.targetId}
              />
              {targetVariable && (
                <p className="text-xs text-gray-500 mt-1">
                  Current: {targetVariable.currentValue.toFixed(2)} {targetVariable.units}
                </p>
              )}
            </div>
          </div>

          {/* Visual Arrow */}
          {sourceVariable && targetVariable && (
            <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: sourceVariable.categoryColor }}
                />
                <span className="text-sm font-medium">{sourceVariable.name}</span>
              </div>

              <div className="flex items-center">
                <div
                  className={`w-16 h-1 ${
                    formData.relationshipType === 'positive'
                      ? 'bg-green-500'
                      : formData.relationshipType === 'negative'
                      ? 'bg-red-500'
                      : 'bg-purple-500'
                  }`}
                />
                <svg
                  className={`w-4 h-4 -ml-1 ${
                    formData.relationshipType === 'positive'
                      ? 'text-green-500'
                      : formData.relationshipType === 'negative'
                      ? 'text-red-500'
                      : 'text-purple-500'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 17l5-5-5-5v10z" />
                </svg>
              </div>

              <div className="text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: targetVariable.categoryColor }}
                />
                <span className="text-sm font-medium">{targetVariable.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Relationship Type */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Relationship Type
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {RELATIONSHIP_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, relationshipType: type.value }))}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  formData.relationshipType === type.value
                    ? type.value === 'positive'
                      ? 'border-green-500 bg-green-50'
                      : type.value === 'negative'
                      ? 'border-red-500 bg-red-50'
                      : 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">{type.label}</span>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Influence Strength */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Influence Settings
          </h3>

          <Slider
            label="Influence Strength"
            value={formData.influenceStrength}
            onChange={(value) => setFormData((prev) => ({ ...prev, influenceStrength: value }))}
            min={0}
            max={1}
            step={0.05}
            formatValue={(v) => `${(v * 100).toFixed(0)}%`}
          />

          <Select
            label="Curve Type"
            value={formData.curveType}
            onChange={(e) => setFormData((prev) => ({ ...prev, curveType: e.target.value as CurveType }))}
            options={CURVE_TYPES.map((c) => ({ value: c.value, label: `${c.label} - ${c.description}` }))}
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Slider
                label="Delay (time units)"
                value={formData.delay}
                onChange={(value) => setFormData((prev) => ({ ...prev, delay: value }))}
                min={0}
                max={20}
                step={1}
                formatValue={(v) => v.toString()}
              />
            </div>

            <div>
              <Slider
                label="Threshold"
                value={formData.threshold}
                onChange={(value) => setFormData((prev) => ({ ...prev, threshold: value }))}
                min={0}
                max={1}
                step={0.05}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>

            <div>
              <Slider
                label="Saturation"
                value={formData.saturation}
                onChange={(value) => setFormData((prev) => ({ ...prev, saturation: value }))}
                min={0}
                max={1}
                step={0.05}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
          </div>
        </div>

        {/* Custom Formula */}
        {formData.relationshipType === 'custom' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Custom Formula
            </h3>

            <Input
              label="Formula"
              value={formData.customFormula}
              onChange={(e) => setFormData((prev) => ({ ...prev, customFormula: e.target.value }))}
              placeholder="e.g., source * 0.5 + 10"
              helperText="Use 'source' to reference the source variable value"
            />
          </div>
        )}

        {/* Active Toggle */}
        <Toggle
          label="Relationship Active"
          description="Inactive relationships are ignored in simulation"
          checked={formData.isActive}
          onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {relationshipId ? 'Save Changes' : 'Create Relationship'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
