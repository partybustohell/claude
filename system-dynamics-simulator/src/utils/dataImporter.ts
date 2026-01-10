import Papa from 'papaparse';
import type {
  Variable,
  Relationship,
  Category,
  SystemExport,
  CSVImportRow,
  ValidationResult,
  VariableType,
} from '../types';

/**
 * Parse CSV data into variable definitions
 */
export function parseCSV(csvContent: string): {
  data: CSVImportRow[];
  errors: string[];
} {
  const result = Papa.parse<CSVImportRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, ''),
  });

  const errors: string[] = [];

  if (result.errors.length > 0) {
    result.errors.forEach((error) => {
      errors.push(`Row ${error.row}: ${error.message}`);
    });
  }

  return {
    data: result.data,
    errors,
  };
}

/**
 * Convert CSV rows to Variable objects
 */
export function csvToVariables(
  rows: CSVImportRow[],
  defaultCategory: string = 'custom'
): { variables: Omit<Variable, 'id' | 'currentValue' | 'createdAt' | 'updatedAt'>[]; errors: string[] } {
  const variables: Omit<Variable, 'id' | 'currentValue' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    if (!row.name || row.name.trim() === '') {
      errors.push(`Row ${index + 1}: Missing variable name`);
      return;
    }

    const min = parseFloat(String(row.min ?? 0));
    const max = parseFloat(String(row.max ?? 100));
    const defaultValue = parseFloat(String(row.defaultValue ?? (min + max) / 2));

    if (isNaN(min) || isNaN(max) || isNaN(defaultValue)) {
      errors.push(`Row ${index + 1}: Invalid numeric values`);
      return;
    }

    if (min >= max) {
      errors.push(`Row ${index + 1}: Min must be less than max`);
      return;
    }

    if (defaultValue < min || defaultValue > max) {
      errors.push(`Row ${index + 1}: Default value must be between min and max`);
      return;
    }

    const variableType = validateVariableType(row.variableType) || 'continuous';

    variables.push({
      name: row.name.trim(),
      description: row.description?.trim() || '',
      category: row.category?.trim() || defaultCategory,
      categoryColor: '#6b7280',
      units: row.units?.trim() || '',
      min,
      max,
      defaultValue,
      variableType,
      displayFormat: {
        decimalPlaces: variableType === 'discrete' ? 0 : 2,
        useThousandsSeparator: false,
      },
      isLocked: false,
    });
  });

  return { variables, errors };
}

function validateVariableType(type: string | undefined): VariableType | null {
  if (!type) return null;
  const normalized = type.toLowerCase().trim();
  if (['continuous', 'discrete', 'percentage'].includes(normalized)) {
    return normalized as VariableType;
  }
  return null;
}

/**
 * Parse JSON system export
 */
export function parseSystemJSON(jsonContent: string): {
  data: SystemExport | null;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(jsonContent);

    // Validate structure
    if (!parsed.version || !Array.isArray(parsed.variables)) {
      errors.push('Invalid system export format');
      return { data: null, errors };
    }

    return { data: parsed as SystemExport, errors: [] };
  } catch (e) {
    errors.push(`Invalid JSON: ${(e as Error).message}`);
    return { data: null, errors };
  }
}

/**
 * Validate system export data
 */
export function validateSystemExport(data: SystemExport): ValidationResult {
  const errors: { field: string; message: string }[] = [];
  const warnings: { field: string; message: string }[] = [];

  // Check version
  if (!data.version) {
    errors.push({ field: 'version', message: 'Missing version field' });
  }

  // Validate variables
  if (!Array.isArray(data.variables)) {
    errors.push({ field: 'variables', message: 'Variables must be an array' });
  } else {
    const variableIds = new Set<string>();

    data.variables.forEach((v, index) => {
      if (!v.id) {
        errors.push({ field: `variables[${index}].id`, message: 'Missing variable ID' });
      } else if (variableIds.has(v.id)) {
        errors.push({ field: `variables[${index}].id`, message: 'Duplicate variable ID' });
      } else {
        variableIds.add(v.id);
      }

      if (!v.name) {
        errors.push({ field: `variables[${index}].name`, message: 'Missing variable name' });
      }

      if (v.min >= v.max) {
        errors.push({ field: `variables[${index}]`, message: 'Min must be less than max' });
      }
    });

    // Validate relationships reference valid variables
    if (Array.isArray(data.relationships)) {
      data.relationships.forEach((r, index) => {
        if (!variableIds.has(r.sourceId)) {
          warnings.push({
            field: `relationships[${index}].sourceId`,
            message: `References non-existent variable: ${r.sourceId}`,
          });
        }
        if (!variableIds.has(r.targetId)) {
          warnings.push({
            field: `relationships[${index}].targetId`,
            message: `References non-existent variable: ${r.targetId}`,
          });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create system export object
 */
export function createSystemExport(
  name: string,
  variables: Variable[],
  relationships: Relationship[],
  categories: Category[],
  description?: string
): SystemExport {
  return {
    version: '1.0.0',
    exportedAt: Date.now(),
    name,
    description,
    variables,
    relationships,
    categories,
  };
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string, type: string): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export system to JSON
 */
export function exportToJSON(
  name: string,
  variables: Variable[],
  relationships: Relationship[],
  categories: Category[],
  description?: string
): void {
  const exportData = createSystemExport(name, variables, relationships, categories, description);
  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, `${name.replace(/\s+/g, '-').toLowerCase()}.json`, 'application/json');
}

/**
 * Export variables to CSV
 */
export function exportToCSV(variables: Variable[]): void {
  const headers = ['name', 'description', 'category', 'units', 'min', 'max', 'defaultValue', 'variableType'];

  const rows = variables.map((v) => [
    v.name,
    v.description,
    v.category,
    v.units,
    v.min,
    v.max,
    v.defaultValue,
    v.variableType,
  ]);

  const csv = [headers.join(','), ...rows.map((row) =>
    row.map((cell) => {
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  )].join('\n');

  downloadFile(csv, 'variables.csv', 'text/csv');
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Generate template CSV content
 */
export function generateTemplateCSV(): string {
  const headers = ['name', 'description', 'category', 'units', 'min', 'max', 'defaultValue', 'variableType'];
  const exampleRow = ['Customer Satisfaction', 'Overall customer satisfaction score', 'business', '%', '0', '100', '50', 'percentage'];

  return [headers.join(','), exampleRow.join(',')].join('\n');
}
