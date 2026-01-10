import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../common/Modal';
import { Button } from '../common/FormControls';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';
import { systemTemplates, searchTemplates, getTemplatesByCategory } from '../../templates/systemTemplates';
import type { SystemTemplate, TemplateCategory } from '../../types';

const CATEGORY_INFO: Record<TemplateCategory, { label: string; color: string }> = {
  business: { label: 'Business', color: 'bg-blue-100 text-blue-700' },
  technical: { label: 'Technical', color: 'bg-purple-100 text-purple-700' },
  personal: { label: 'Personal', color: 'bg-green-100 text-green-700' },
  scientific: { label: 'Scientific', color: 'bg-yellow-100 text-yellow-700' },
  social: { label: 'Social', color: 'bg-pink-100 text-pink-700' },
  environmental: { label: 'Environmental', color: 'bg-teal-100 text-teal-700' },
  custom: { label: 'Custom', color: 'bg-gray-100 text-gray-700' },
};

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateLibrary({ isOpen, onClose }: TemplateLibraryProps) {
  const { importVariables, clearAll: clearVariables } = useVariableStore();
  const { addRelationships, clearAll: clearRelationships } = useRelationshipStore();
  const { addNotification } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SystemTemplate | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredTemplates = useMemo(() => {
    let templates = systemTemplates;

    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    } else if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    return templates;
  }, [searchQuery, selectedCategory]);

  const handleApplyTemplate = (template: SystemTemplate, clearExisting: boolean) => {
    if (clearExisting) {
      clearVariables();
      clearRelationships();
    }

    const now = Date.now();

    // Create ID mapping for variables
    const idMap = new Map<string, string>();

    // Add variables
    const newVariables = template.variables.map((v, index) => {
      const oldId = v.name.toLowerCase().replace(/\s+/g, '-');
      const newId = uuidv4();
      idMap.set(oldId, newId);

      return {
        ...v,
        id: newId,
        currentValue: v.defaultValue,
        createdAt: now + index,
        updatedAt: now + index,
      };
    });

    // Add relationships with mapped IDs
    const newRelationships = template.relationships.map((r, index) => {
      // Try to find the variable IDs based on the template's expected naming
      const sourceVar = newVariables.find(
        (v) => v.name.toLowerCase().replace(/\s+/g, '-') === r.sourceId
      );
      const targetVar = newVariables.find(
        (v) => v.name.toLowerCase().replace(/\s+/g, '-') === r.targetId
      );

      return {
        ...r,
        id: uuidv4(),
        sourceId: sourceVar?.id || r.sourceId,
        targetId: targetVar?.id || r.targetId,
        createdAt: now + index,
        updatedAt: now + index,
      };
    });

    // Import the data
    importVariables(newVariables, template.categories);
    addRelationships(
      newRelationships.map((r) => ({
        sourceId: r.sourceId,
        targetId: r.targetId,
        relationshipType: r.relationshipType,
        influenceStrength: r.influenceStrength,
        delay: r.delay,
        curveType: r.curveType,
        threshold: r.threshold,
        saturation: r.saturation,
        isActive: r.isActive,
      }))
    );

    addNotification('success', `Template "${template.name}" applied successfully`);
    onClose();
  };

  const handleSelectTemplate = (template: SystemTemplate) => {
    setSelectedTemplate(template);
    setConfirmClear(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Library" size="xl">
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="flex gap-4">
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
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as TemplateCategory)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{template.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${CATEGORY_INFO[template.category].color}`}>
                      {CATEGORY_INFO[template.category].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{template.variables.length} variables</span>
                    <span>{template.relationships.length} relationships</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No templates found matching your search
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        {confirmClear && selectedTemplate && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">
              Apply "{selectedTemplate.name}" Template
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              This template includes {selectedTemplate.variables.length} variables and{' '}
              {selectedTemplate.relationships.length} relationships.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleApplyTemplate(selectedTemplate, true)}
                className="flex-1"
              >
                Replace Current System
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleApplyTemplate(selectedTemplate, false)}
                className="flex-1"
              >
                Add to Current System
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirmClear(false);
                  setSelectedTemplate(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
