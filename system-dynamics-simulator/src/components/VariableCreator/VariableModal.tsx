import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, Textarea, ColorPicker, Toggle } from '../common/FormControls';
import { useVariableStore, createVariableDefaults } from '../../stores';
import type { VariableType } from '../../types';

interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableId?: string | null;
}

const VARIABLE_TYPES: { value: VariableType; label: string }[] = [
  { value: 'continuous', label: 'Continuous' },
  { value: 'discrete', label: 'Discrete (Integer)' },
  { value: 'percentage', label: 'Percentage (0-100%)' },
];

export function VariableModal({ isOpen, onClose, variableId }: VariableModalProps) {
  const { variables, categories, addVariable, updateVariable, getVariable } = useVariableStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    categoryColor: '#6b7280',
    units: '',
    min: 0,
    max: 100,
    defaultValue: 50,
    variableType: 'continuous' as VariableType,
    decimalPlaces: 2,
    prefix: '',
    suffix: '',
    useThousandsSeparator: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (variableId) {
      const variable = getVariable(variableId);
      if (variable) {
        setFormData({
          name: variable.name,
          description: variable.description,
          category: variable.category,
          categoryColor: variable.categoryColor,
          units: variable.units,
          min: variable.min,
          max: variable.max,
          defaultValue: variable.defaultValue,
          variableType: variable.variableType,
          decimalPlaces: variable.displayFormat.decimalPlaces,
          prefix: variable.displayFormat.prefix || '',
          suffix: variable.displayFormat.suffix || '',
          useThousandsSeparator: variable.displayFormat.useThousandsSeparator || false,
        });
      }
    } else {
      const defaults = createVariableDefaults('', 'custom');
      setFormData({
        name: '',
        description: '',
        category: defaults.category,
        categoryColor: defaults.categoryColor,
        units: '',
        min: defaults.min,
        max: defaults.max,
        defaultValue: defaults.defaultValue,
        variableType: defaults.variableType,
        decimalPlaces: defaults.displayFormat.decimalPlaces,
        prefix: defaults.displayFormat.prefix || '',
        suffix: defaults.displayFormat.suffix || '',
        useThousandsSeparator: defaults.displayFormat.useThousandsSeparator || false,
      });
    }
    setErrors({});
  }, [variableId, getVariable, isOpen]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      categoryColor: category?.color || prev.categoryColor,
    }));
  };

  const handleVariableTypeChange = (type: VariableType) => {
    let updates: Partial<typeof formData> = { variableType: type };

    if (type === 'percentage') {
      updates = {
        ...updates,
        min: 0,
        max: 100,
        suffix: '%',
        decimalPlaces: 1,
      };
    } else if (type === 'discrete') {
      updates = {
        ...updates,
        decimalPlaces: 0,
      };
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (
      variables.some(
        (v) => v.name.toLowerCase() === formData.name.toLowerCase() && v.id !== variableId
      )
    ) {
      newErrors.name = 'A variable with this name already exists';
    }

    if (formData.min >= formData.max) {
      newErrors.min = 'Min must be less than max';
    }

    if (formData.defaultValue < formData.min || formData.defaultValue > formData.max) {
      newErrors.defaultValue = 'Default value must be between min and max';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const variableData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      categoryColor: formData.categoryColor,
      units: formData.units.trim(),
      min: formData.min,
      max: formData.max,
      defaultValue: formData.defaultValue,
      variableType: formData.variableType,
      displayFormat: {
        decimalPlaces: formData.decimalPlaces,
        prefix: formData.prefix || undefined,
        suffix: formData.suffix || undefined,
        useThousandsSeparator: formData.useThousandsSeparator,
      },
      isLocked: false,
    };

    if (variableId) {
      updateVariable(variableId, variableData);
    } else {
      addVariable(variableData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={variableId ? 'Edit Variable' : 'Create Variable'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Basic Information
          </h3>

          <Input
            label="Variable Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Customer Satisfaction"
            error={errors.name}
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="What does this variable represent?"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <ColorPicker
              label="Category Color"
              value={formData.categoryColor}
              onChange={(color) => setFormData((prev) => ({ ...prev, categoryColor: color }))}
            />
          </div>
        </div>

        {/* Value Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Value Configuration
          </h3>

          <Select
            label="Variable Type"
            value={formData.variableType}
            onChange={(e) => handleVariableTypeChange(e.target.value as VariableType)}
            options={VARIABLE_TYPES}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Minimum"
              type="number"
              value={formData.min}
              onChange={(e) => setFormData((prev) => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
              error={errors.min}
            />

            <Input
              label="Maximum"
              type="number"
              value={formData.max}
              onChange={(e) => setFormData((prev) => ({ ...prev, max: parseFloat(e.target.value) || 100 }))}
            />

            <Input
              label="Default Value"
              type="number"
              value={formData.defaultValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, defaultValue: parseFloat(e.target.value) || 0 }))}
              error={errors.defaultValue}
            />
          </div>

          <Input
            label="Units"
            value={formData.units}
            onChange={(e) => setFormData((prev) => ({ ...prev, units: e.target.value }))}
            placeholder="e.g., %, $, users, hours"
          />
        </div>

        {/* Display Format */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Display Format
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Decimal Places"
              type="number"
              value={formData.decimalPlaces}
              onChange={(e) => setFormData((prev) => ({ ...prev, decimalPlaces: parseInt(e.target.value) || 0 }))}
              min={0}
              max={10}
            />

            <Input
              label="Prefix"
              value={formData.prefix}
              onChange={(e) => setFormData((prev) => ({ ...prev, prefix: e.target.value }))}
              placeholder="e.g., $"
            />

            <Input
              label="Suffix"
              value={formData.suffix}
              onChange={(e) => setFormData((prev) => ({ ...prev, suffix: e.target.value }))}
              placeholder="e.g., %"
            />
          </div>

          <Toggle
            label="Use thousands separator"
            description="Format large numbers with commas"
            checked={formData.useThousandsSeparator}
            onChange={(checked) => setFormData((prev) => ({ ...prev, useThousandsSeparator: checked }))}
          />

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Preview</p>
            <p className="text-lg font-mono">
              {formData.prefix}
              {formData.useThousandsSeparator
                ? formData.defaultValue.toLocaleString(undefined, {
                    minimumFractionDigits: formData.decimalPlaces,
                    maximumFractionDigits: formData.decimalPlaces,
                  })
                : formData.defaultValue.toFixed(formData.decimalPlaces)}
              {formData.suffix}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {variableId ? 'Save Changes' : 'Create Variable'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
