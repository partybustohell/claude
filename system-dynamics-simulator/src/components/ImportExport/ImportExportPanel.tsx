import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Textarea } from '../common/FormControls';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';
import {
  parseCSV,
  csvToVariables,
  parseSystemJSON,
  validateSystemExport,
  exportToJSON,
  exportToCSV,
  readFileAsText,
  generateTemplateCSV,
} from '../../utils/dataImporter';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { addVariables, importVariables } = useVariableStore();
  const { importRelationships } = useRelationshipStore();
  const { addNotification } = useUIStore();

  const [importType, setImportType] = useState<'csv' | 'json'>('json');
  const [fileContent, setFileContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrors([]);

    try {
      const content = await readFileAsText(file);
      setFileContent(content);

      // Auto-detect type
      if (file.name.endsWith('.csv')) {
        setImportType('csv');
      } else if (file.name.endsWith('.json')) {
        setImportType('json');
      }
    } catch (error) {
      setErrors(['Failed to read file']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    setErrors([]);

    if (!fileContent.trim()) {
      setErrors(['No content to import']);
      return;
    }

    try {
      if (importType === 'csv') {
        const { data, errors: parseErrors } = parseCSV(fileContent);

        if (parseErrors.length > 0) {
          setErrors(parseErrors);
          return;
        }

        const { variables: newVariables, errors: conversionErrors } = csvToVariables(data);

        if (conversionErrors.length > 0) {
          setErrors(conversionErrors);
          return;
        }

        addVariables(newVariables);
        addNotification('success', `Imported ${newVariables.length} variables`);
      } else {
        const { data, errors: parseErrors } = parseSystemJSON(fileContent);

        if (parseErrors.length > 0 || !data) {
          setErrors(parseErrors.length > 0 ? parseErrors : ['Invalid JSON format']);
          return;
        }

        const validation = validateSystemExport(data);

        if (!validation.isValid) {
          setErrors(validation.errors.map((e) => `${e.field}: ${e.message}`));
          return;
        }

        if (validation.warnings.length > 0) {
          validation.warnings.forEach((w) => {
            addNotification('warning', `${w.field}: ${w.message}`);
          });
        }

        importVariables(data.variables, data.categories);
        importRelationships(data.relationships);
        addNotification('success', `Imported ${data.variables.length} variables and ${data.relationships.length} relationships`);
      }

      onClose();
    } catch (error) {
      setErrors([`Import failed: ${(error as Error).message}`]);
    }
  };

  const handleDownloadTemplate = () => {
    const content = generateTemplateCSV();
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'variables-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Data" size="lg">
      <div className="space-y-6">
        {/* Import Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setImportType('json')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              importType === 'json'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            JSON (Full System)
          </button>
          <button
            onClick={() => setImportType('csv')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              importType === 'csv'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            CSV (Variables Only)
          </button>
        </div>

        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={importType === 'csv' ? '.csv' : '.json'}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-400">
              {importType === 'csv' ? 'CSV files' : 'JSON files'}
            </p>
          </div>
        </div>

        {/* Content Preview */}
        {fileContent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Preview
            </label>
            <Textarea
              value={fileContent.slice(0, 2000) + (fileContent.length > 2000 ? '\n...' : '')}
              onChange={(e) => setFileContent(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Import Errors</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CSV Template Download */}
        {importType === 'csv' && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              Need a template? Download a sample CSV file
            </span>
            <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
              Download Template
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!fileContent || isLoading}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { variables, categories } = useVariableStore();
  const { relationships } = useRelationshipStore();
  const { addNotification } = useUIStore();

  const [exportType, setExportType] = useState<'json' | 'csv'>('json');
  const [systemName, setSystemName] = useState('My System');
  const [description, setDescription] = useState('');

  const handleExport = () => {
    try {
      if (exportType === 'json') {
        exportToJSON(systemName, variables, relationships, categories, description || undefined);
        addNotification('success', 'System exported as JSON');
      } else {
        exportToCSV(variables);
        addNotification('success', 'Variables exported as CSV');
      }
      onClose();
    } catch (error) {
      addNotification('error', `Export failed: ${(error as Error).message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export System" size="md">
      <div className="space-y-6">
        {/* Export Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setExportType('json')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportType === 'json'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            JSON (Full System)
          </button>
          <button
            onClick={() => setExportType('csv')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportType === 'csv'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            CSV (Variables Only)
          </button>
        </div>

        {/* Export Details */}
        {exportType === 'json' && (
          <>
            <Input
              label="System Name"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="Enter a name for your system"
            />
            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your system..."
              rows={3}
            />
          </>
        )}

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Variables:</span>
              <span className="ml-2 font-medium text-gray-900">{variables.length}</span>
            </div>
            {exportType === 'json' && (
              <>
                <div>
                  <span className="text-gray-500">Relationships:</span>
                  <span className="ml-2 font-medium text-gray-900">{relationships.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Categories:</span>
                  <span className="ml-2 font-medium text-gray-900">{categories.length}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={variables.length === 0}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
}
