import type { SystemTemplate } from '../types';

export const systemTemplates: SystemTemplate[] = [
  // Business Templates
  {
    id: 'startup-growth',
    name: 'Startup Growth Model',
    description: 'Model startup dynamics including revenue, customers, costs, team size, and market share',
    category: 'business',
    icon: '🚀',
    tags: ['startup', 'growth', 'revenue', 'customers'],
    variables: [
      { name: 'Revenue', description: 'Monthly recurring revenue', category: 'financial', categoryColor: '#10b981', units: '$', min: 0, max: 10000000, defaultValue: 100000, variableType: 'continuous', displayFormat: { decimalPlaces: 0, prefix: '$', useThousandsSeparator: true }, isLocked: false },
      { name: 'Customer Count', description: 'Total number of active customers', category: 'business', categoryColor: '#3b82f6', units: 'customers', min: 0, max: 100000, defaultValue: 1000, variableType: 'discrete', displayFormat: { decimalPlaces: 0, useThousandsSeparator: true }, isLocked: false },
      { name: 'Customer Acquisition Cost', description: 'Cost to acquire one customer', category: 'financial', categoryColor: '#10b981', units: '$', min: 0, max: 10000, defaultValue: 100, variableType: 'continuous', displayFormat: { decimalPlaces: 2, prefix: '$' }, isLocked: false },
      { name: 'Churn Rate', description: 'Monthly customer churn percentage', category: 'business', categoryColor: '#3b82f6', units: '%', min: 0, max: 100, defaultValue: 5, variableType: 'percentage', displayFormat: { decimalPlaces: 1, suffix: '%' }, isLocked: false },
      { name: 'Team Size', description: 'Number of employees', category: 'hr', categoryColor: '#f59e0b', units: 'people', min: 1, max: 1000, defaultValue: 20, variableType: 'discrete', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Marketing Spend', description: 'Monthly marketing budget', category: 'financial', categoryColor: '#10b981', units: '$', min: 0, max: 1000000, defaultValue: 10000, variableType: 'continuous', displayFormat: { decimalPlaces: 0, prefix: '$', useThousandsSeparator: true }, isLocked: false },
      { name: 'Market Share', description: 'Percentage of target market', category: 'business', categoryColor: '#3b82f6', units: '%', min: 0, max: 100, defaultValue: 1, variableType: 'percentage', displayFormat: { decimalPlaces: 2, suffix: '%' }, isLocked: false },
      { name: 'Customer Satisfaction', description: 'Overall satisfaction score', category: 'business', categoryColor: '#3b82f6', units: '', min: 0, max: 100, defaultValue: 75, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
    ],
    relationships: [
      { sourceId: 'marketing-spend', targetId: 'customer-count', relationshipType: 'positive', influenceStrength: 0.6, delay: 2, curveType: 'logarithmic', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'customer-count', targetId: 'revenue', relationshipType: 'positive', influenceStrength: 0.8, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'churn-rate', targetId: 'customer-count', relationshipType: 'negative', influenceStrength: 0.5, delay: 1, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'customer-satisfaction', targetId: 'churn-rate', relationshipType: 'negative', influenceStrength: 0.6, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'team-size', targetId: 'customer-satisfaction', relationshipType: 'positive', influenceStrength: 0.4, delay: 1, curveType: 'logarithmic', threshold: 0, saturation: 0.7, isActive: true },
      { sourceId: 'revenue', targetId: 'marketing-spend', relationshipType: 'positive', influenceStrength: 0.3, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.5, isActive: true },
      { sourceId: 'market-share', targetId: 'customer-acquisition-cost', relationshipType: 'negative', influenceStrength: 0.3, delay: 2, curveType: 'exponential', threshold: 0, saturation: 0.6, isActive: true },
    ],
    categories: [
      { id: 'financial', name: 'Financial', color: '#10b981' },
      { id: 'business', name: 'Business', color: '#3b82f6' },
      { id: 'hr', name: 'Human Resources', color: '#f59e0b' },
    ],
  },

  // Technical Templates
  {
    id: 'software-performance',
    name: 'Software Performance Model',
    description: 'Model system performance with CPU, memory, response time, and user load',
    category: 'technical',
    icon: '💻',
    tags: ['software', 'performance', 'server', 'optimization'],
    variables: [
      { name: 'CPU Usage', description: 'Server CPU utilization', category: 'technical', categoryColor: '#8b5cf6', units: '%', min: 0, max: 100, defaultValue: 30, variableType: 'percentage', displayFormat: { decimalPlaces: 1, suffix: '%' }, isLocked: false },
      { name: 'Memory Usage', description: 'RAM utilization', category: 'technical', categoryColor: '#8b5cf6', units: '%', min: 0, max: 100, defaultValue: 45, variableType: 'percentage', displayFormat: { decimalPlaces: 1, suffix: '%' }, isLocked: false },
      { name: 'Response Time', description: 'Average API response time', category: 'technical', categoryColor: '#8b5cf6', units: 'ms', min: 0, max: 10000, defaultValue: 200, variableType: 'continuous', displayFormat: { decimalPlaces: 0, suffix: 'ms' }, isLocked: false },
      { name: 'Active Users', description: 'Concurrent active users', category: 'business', categoryColor: '#3b82f6', units: 'users', min: 0, max: 1000000, defaultValue: 5000, variableType: 'discrete', displayFormat: { decimalPlaces: 0, useThousandsSeparator: true }, isLocked: false },
      { name: 'Error Rate', description: 'Percentage of failed requests', category: 'technical', categoryColor: '#8b5cf6', units: '%', min: 0, max: 100, defaultValue: 0.5, variableType: 'percentage', displayFormat: { decimalPlaces: 2, suffix: '%' }, isLocked: false },
      { name: 'Database Connections', description: 'Active DB connections', category: 'technical', categoryColor: '#8b5cf6', units: 'connections', min: 0, max: 1000, defaultValue: 50, variableType: 'discrete', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Cache Hit Rate', description: 'Percentage of cache hits', category: 'technical', categoryColor: '#8b5cf6', units: '%', min: 0, max: 100, defaultValue: 85, variableType: 'percentage', displayFormat: { decimalPlaces: 1, suffix: '%' }, isLocked: false },
      { name: 'User Satisfaction', description: 'User experience score', category: 'business', categoryColor: '#3b82f6', units: '', min: 0, max: 100, defaultValue: 80, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
    ],
    relationships: [
      { sourceId: 'active-users', targetId: 'cpu-usage', relationshipType: 'positive', influenceStrength: 0.7, delay: 0, curveType: 'exponential', threshold: 0, saturation: 0.95, isActive: true },
      { sourceId: 'active-users', targetId: 'memory-usage', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.9, isActive: true },
      { sourceId: 'cpu-usage', targetId: 'response-time', relationshipType: 'positive', influenceStrength: 0.8, delay: 0, curveType: 'exponential', threshold: 0.3, saturation: 1, isActive: true },
      { sourceId: 'memory-usage', targetId: 'response-time', relationshipType: 'positive', influenceStrength: 0.4, delay: 0, curveType: 'exponential', threshold: 0.5, saturation: 1, isActive: true },
      { sourceId: 'response-time', targetId: 'error-rate', relationshipType: 'positive', influenceStrength: 0.5, delay: 1, curveType: 'sigmoid', threshold: 0.2, saturation: 0.8, isActive: true },
      { sourceId: 'cache-hit-rate', targetId: 'response-time', relationshipType: 'negative', influenceStrength: 0.6, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'response-time', targetId: 'user-satisfaction', relationshipType: 'negative', influenceStrength: 0.7, delay: 0, curveType: 'sigmoid', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'error-rate', targetId: 'user-satisfaction', relationshipType: 'negative', influenceStrength: 0.8, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
    ],
    categories: [
      { id: 'technical', name: 'Technical', color: '#8b5cf6' },
      { id: 'business', name: 'Business', color: '#3b82f6' },
    ],
  },

  // Personal Templates
  {
    id: 'health-fitness',
    name: 'Health & Fitness Model',
    description: 'Model personal health factors including exercise, diet, sleep, stress, and energy',
    category: 'personal',
    icon: '💪',
    tags: ['health', 'fitness', 'wellness', 'lifestyle'],
    variables: [
      { name: 'Exercise Minutes', description: 'Daily exercise duration', category: 'fitness', categoryColor: '#ef4444', units: 'min', min: 0, max: 180, defaultValue: 30, variableType: 'discrete', displayFormat: { decimalPlaces: 0, suffix: ' min' }, isLocked: false },
      { name: 'Sleep Quality', description: 'Sleep quality score', category: 'health', categoryColor: '#6366f1', units: '', min: 0, max: 100, defaultValue: 70, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Sleep Hours', description: 'Hours of sleep per night', category: 'health', categoryColor: '#6366f1', units: 'hours', min: 0, max: 12, defaultValue: 7, variableType: 'continuous', displayFormat: { decimalPlaces: 1, suffix: 'h' }, isLocked: false },
      { name: 'Stress Level', description: 'Current stress level', category: 'mental', categoryColor: '#f59e0b', units: '', min: 0, max: 100, defaultValue: 40, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Energy Level', description: 'Daily energy level', category: 'health', categoryColor: '#6366f1', units: '', min: 0, max: 100, defaultValue: 65, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Diet Quality', description: 'Nutrition score', category: 'nutrition', categoryColor: '#22c55e', units: '', min: 0, max: 100, defaultValue: 60, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Weight', description: 'Current weight', category: 'fitness', categoryColor: '#ef4444', units: 'kg', min: 40, max: 200, defaultValue: 75, variableType: 'continuous', displayFormat: { decimalPlaces: 1, suffix: ' kg' }, isLocked: false },
      { name: 'Mood Score', description: 'Overall mood rating', category: 'mental', categoryColor: '#f59e0b', units: '', min: 0, max: 100, defaultValue: 70, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
    ],
    relationships: [
      { sourceId: 'exercise-minutes', targetId: 'energy-level', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'logarithmic', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'exercise-minutes', targetId: 'sleep-quality', relationshipType: 'positive', influenceStrength: 0.4, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.7, isActive: true },
      { sourceId: 'sleep-quality', targetId: 'energy-level', relationshipType: 'positive', influenceStrength: 0.7, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'sleep-hours', targetId: 'sleep-quality', relationshipType: 'positive', influenceStrength: 0.6, delay: 0, curveType: 'sigmoid', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'stress-level', targetId: 'sleep-quality', relationshipType: 'negative', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'stress-level', targetId: 'mood-score', relationshipType: 'negative', influenceStrength: 0.6, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'exercise-minutes', targetId: 'stress-level', relationshipType: 'negative', influenceStrength: 0.4, delay: 0, curveType: 'logarithmic', threshold: 0, saturation: 0.7, isActive: true },
      { sourceId: 'diet-quality', targetId: 'energy-level', relationshipType: 'positive', influenceStrength: 0.5, delay: 1, curveType: 'linear', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'diet-quality', targetId: 'weight', relationshipType: 'negative', influenceStrength: 0.3, delay: 5, curveType: 'linear', threshold: 0, saturation: 0.5, isActive: true },
      { sourceId: 'exercise-minutes', targetId: 'weight', relationshipType: 'negative', influenceStrength: 0.4, delay: 3, curveType: 'linear', threshold: 0, saturation: 0.6, isActive: true },
      { sourceId: 'energy-level', targetId: 'mood-score', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
    ],
    categories: [
      { id: 'fitness', name: 'Fitness', color: '#ef4444' },
      { id: 'health', name: 'Health', color: '#6366f1' },
      { id: 'nutrition', name: 'Nutrition', color: '#22c55e' },
      { id: 'mental', name: 'Mental', color: '#f59e0b' },
    ],
  },

  // Scientific Templates
  {
    id: 'ecosystem-model',
    name: 'Ecosystem Model',
    description: 'Model ecosystem dynamics with populations, resources, and environmental factors',
    category: 'scientific',
    icon: '🌿',
    tags: ['ecology', 'population', 'environment', 'science'],
    variables: [
      { name: 'Prey Population', description: 'Prey species population size', category: 'population', categoryColor: '#22c55e', units: 'individuals', min: 0, max: 100000, defaultValue: 5000, variableType: 'discrete', displayFormat: { decimalPlaces: 0, useThousandsSeparator: true }, isLocked: false },
      { name: 'Predator Population', description: 'Predator species population size', category: 'population', categoryColor: '#ef4444', units: 'individuals', min: 0, max: 10000, defaultValue: 500, variableType: 'discrete', displayFormat: { decimalPlaces: 0, useThousandsSeparator: true }, isLocked: false },
      { name: 'Vegetation', description: 'Available plant biomass', category: 'resources', categoryColor: '#84cc16', units: 'tons', min: 0, max: 100000, defaultValue: 20000, variableType: 'continuous', displayFormat: { decimalPlaces: 0, useThousandsSeparator: true }, isLocked: false },
      { name: 'Water Availability', description: 'Water resources level', category: 'resources', categoryColor: '#0ea5e9', units: '%', min: 0, max: 100, defaultValue: 70, variableType: 'percentage', displayFormat: { decimalPlaces: 0, suffix: '%' }, isLocked: false },
      { name: 'Temperature', description: 'Average ambient temperature', category: 'climate', categoryColor: '#f97316', units: '°C', min: -20, max: 50, defaultValue: 22, variableType: 'continuous', displayFormat: { decimalPlaces: 1, suffix: '°C' }, isLocked: false },
      { name: 'Habitat Quality', description: 'Overall habitat health score', category: 'environment', categoryColor: '#14b8a6', units: '', min: 0, max: 100, defaultValue: 75, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Biodiversity Index', description: 'Species diversity measure', category: 'environment', categoryColor: '#14b8a6', units: '', min: 0, max: 100, defaultValue: 60, variableType: 'continuous', displayFormat: { decimalPlaces: 1 }, isLocked: false },
    ],
    relationships: [
      { sourceId: 'vegetation', targetId: 'prey-population', relationshipType: 'positive', influenceStrength: 0.6, delay: 1, curveType: 'logarithmic', threshold: 0, saturation: 0.9, isActive: true },
      { sourceId: 'prey-population', targetId: 'predator-population', relationshipType: 'positive', influenceStrength: 0.5, delay: 2, curveType: 'linear', threshold: 0.1, saturation: 0.8, isActive: true },
      { sourceId: 'predator-population', targetId: 'prey-population', relationshipType: 'negative', influenceStrength: 0.7, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'prey-population', targetId: 'vegetation', relationshipType: 'negative', influenceStrength: 0.4, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.7, isActive: true },
      { sourceId: 'water-availability', targetId: 'vegetation', relationshipType: 'positive', influenceStrength: 0.7, delay: 1, curveType: 'sigmoid', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'temperature', targetId: 'vegetation', relationshipType: 'custom', influenceStrength: 0.5, delay: 2, curveType: 'sigmoid', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'habitat-quality', targetId: 'biodiversity-index', relationshipType: 'positive', influenceStrength: 0.6, delay: 3, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'prey-population', targetId: 'biodiversity-index', relationshipType: 'positive', influenceStrength: 0.3, delay: 0, curveType: 'logarithmic', threshold: 0, saturation: 0.5, isActive: true },
      { sourceId: 'predator-population', targetId: 'biodiversity-index', relationshipType: 'positive', influenceStrength: 0.3, delay: 0, curveType: 'logarithmic', threshold: 0, saturation: 0.5, isActive: true },
    ],
    categories: [
      { id: 'population', name: 'Population', color: '#22c55e' },
      { id: 'resources', name: 'Resources', color: '#0ea5e9' },
      { id: 'climate', name: 'Climate', color: '#f97316' },
      { id: 'environment', name: 'Environment', color: '#14b8a6' },
    ],
  },

  // Project Management Template
  {
    id: 'project-management',
    name: 'Project Management Model',
    description: 'Model project dynamics with team, budget, timeline, and stakeholder factors',
    category: 'business',
    icon: '📊',
    tags: ['project', 'management', 'team', 'deadline'],
    variables: [
      { name: 'Team Size', description: 'Number of team members', category: 'team', categoryColor: '#f59e0b', units: 'people', min: 1, max: 100, defaultValue: 10, variableType: 'discrete', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Budget Remaining', description: 'Remaining project budget', category: 'financial', categoryColor: '#10b981', units: '$', min: 0, max: 1000000, defaultValue: 500000, variableType: 'continuous', displayFormat: { decimalPlaces: 0, prefix: '$', useThousandsSeparator: true }, isLocked: false },
      { name: 'Progress', description: 'Project completion percentage', category: 'progress', categoryColor: '#3b82f6', units: '%', min: 0, max: 100, defaultValue: 20, variableType: 'percentage', displayFormat: { decimalPlaces: 1, suffix: '%' }, isLocked: false },
      { name: 'Scope Changes', description: 'Number of scope change requests', category: 'scope', categoryColor: '#ef4444', units: 'changes', min: 0, max: 50, defaultValue: 2, variableType: 'discrete', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Team Morale', description: 'Team motivation and satisfaction', category: 'team', categoryColor: '#f59e0b', units: '', min: 0, max: 100, defaultValue: 75, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Quality Score', description: 'Deliverable quality rating', category: 'quality', categoryColor: '#8b5cf6', units: '', min: 0, max: 100, defaultValue: 80, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Stakeholder Satisfaction', description: 'Stakeholder happiness level', category: 'stakeholders', categoryColor: '#06b6d4', units: '', min: 0, max: 100, defaultValue: 70, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Risk Level', description: 'Overall project risk assessment', category: 'risk', categoryColor: '#dc2626', units: '', min: 0, max: 100, defaultValue: 30, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
    ],
    relationships: [
      { sourceId: 'team-size', targetId: 'progress', relationshipType: 'positive', influenceStrength: 0.5, delay: 1, curveType: 'logarithmic', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'budget-remaining', targetId: 'team-size', relationshipType: 'positive', influenceStrength: 0.4, delay: 0, curveType: 'step', threshold: 0.2, saturation: 1, isActive: true },
      { sourceId: 'scope-changes', targetId: 'progress', relationshipType: 'negative', influenceStrength: 0.6, delay: 1, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'scope-changes', targetId: 'risk-level', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'team-morale', targetId: 'quality-score', relationshipType: 'positive', influenceStrength: 0.6, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'team-morale', targetId: 'progress', relationshipType: 'positive', influenceStrength: 0.4, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.9, isActive: true },
      { sourceId: 'progress', targetId: 'stakeholder-satisfaction', relationshipType: 'positive', influenceStrength: 0.7, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'quality-score', targetId: 'stakeholder-satisfaction', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'risk-level', targetId: 'team-morale', relationshipType: 'negative', influenceStrength: 0.4, delay: 1, curveType: 'linear', threshold: 0.3, saturation: 0.7, isActive: true },
      { sourceId: 'budget-remaining', targetId: 'risk-level', relationshipType: 'negative', influenceStrength: 0.3, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.6, isActive: true },
    ],
    categories: [
      { id: 'team', name: 'Team', color: '#f59e0b' },
      { id: 'financial', name: 'Financial', color: '#10b981' },
      { id: 'progress', name: 'Progress', color: '#3b82f6' },
      { id: 'scope', name: 'Scope', color: '#ef4444' },
      { id: 'quality', name: 'Quality', color: '#8b5cf6' },
      { id: 'stakeholders', name: 'Stakeholders', color: '#06b6d4' },
      { id: 'risk', name: 'Risk', color: '#dc2626' },
    ],
  },

  // Learning & Development Template
  {
    id: 'learning-development',
    name: 'Learning & Development Model',
    description: 'Model personal learning with study time, practice, knowledge, and motivation',
    category: 'personal',
    icon: '📚',
    tags: ['learning', 'education', 'skills', 'development'],
    variables: [
      { name: 'Study Time', description: 'Daily study hours', category: 'input', categoryColor: '#3b82f6', units: 'hours', min: 0, max: 12, defaultValue: 2, variableType: 'continuous', displayFormat: { decimalPlaces: 1, suffix: 'h' }, isLocked: false },
      { name: 'Practice Hours', description: 'Hands-on practice time', category: 'input', categoryColor: '#3b82f6', units: 'hours', min: 0, max: 8, defaultValue: 1, variableType: 'continuous', displayFormat: { decimalPlaces: 1, suffix: 'h' }, isLocked: false },
      { name: 'Knowledge Level', description: 'Theoretical understanding', category: 'output', categoryColor: '#22c55e', units: '', min: 0, max: 100, defaultValue: 30, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Skill Proficiency', description: 'Practical skill level', category: 'output', categoryColor: '#22c55e', units: '', min: 0, max: 100, defaultValue: 25, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Motivation', description: 'Learning motivation level', category: 'mental', categoryColor: '#f59e0b', units: '', min: 0, max: 100, defaultValue: 70, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Confidence', description: 'Self-confidence in abilities', category: 'mental', categoryColor: '#f59e0b', units: '', min: 0, max: 100, defaultValue: 50, variableType: 'continuous', displayFormat: { decimalPlaces: 0 }, isLocked: false },
      { name: 'Retention Rate', description: 'Information retention percentage', category: 'efficiency', categoryColor: '#8b5cf6', units: '%', min: 0, max: 100, defaultValue: 60, variableType: 'percentage', displayFormat: { decimalPlaces: 0, suffix: '%' }, isLocked: false },
      { name: 'Difficulty Level', description: 'Current material difficulty', category: 'input', categoryColor: '#3b82f6', units: '', min: 1, max: 10, defaultValue: 5, variableType: 'discrete', displayFormat: { decimalPlaces: 0 }, isLocked: false },
    ],
    relationships: [
      { sourceId: 'study-time', targetId: 'knowledge-level', relationshipType: 'positive', influenceStrength: 0.6, delay: 1, curveType: 'logarithmic', threshold: 0, saturation: 0.9, isActive: true },
      { sourceId: 'practice-hours', targetId: 'skill-proficiency', relationshipType: 'positive', influenceStrength: 0.7, delay: 1, curveType: 'logarithmic', threshold: 0, saturation: 0.9, isActive: true },
      { sourceId: 'knowledge-level', targetId: 'skill-proficiency', relationshipType: 'positive', influenceStrength: 0.4, delay: 2, curveType: 'linear', threshold: 0.2, saturation: 0.8, isActive: true },
      { sourceId: 'skill-proficiency', targetId: 'confidence', relationshipType: 'positive', influenceStrength: 0.6, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'confidence', targetId: 'motivation', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.9, isActive: true },
      { sourceId: 'motivation', targetId: 'study-time', relationshipType: 'positive', influenceStrength: 0.4, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.8, isActive: true },
      { sourceId: 'difficulty-level', targetId: 'motivation', relationshipType: 'negative', influenceStrength: 0.3, delay: 0, curveType: 'exponential', threshold: 0.5, saturation: 0.6, isActive: true },
      { sourceId: 'motivation', targetId: 'retention-rate', relationshipType: 'positive', influenceStrength: 0.5, delay: 0, curveType: 'linear', threshold: 0, saturation: 1, isActive: true },
      { sourceId: 'retention-rate', targetId: 'knowledge-level', relationshipType: 'positive', influenceStrength: 0.4, delay: 0, curveType: 'linear', threshold: 0, saturation: 0.8, isActive: true },
    ],
    categories: [
      { id: 'input', name: 'Input', color: '#3b82f6' },
      { id: 'output', name: 'Output', color: '#22c55e' },
      { id: 'mental', name: 'Mental', color: '#f59e0b' },
      { id: 'efficiency', name: 'Efficiency', color: '#8b5cf6' },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SystemTemplate | undefined {
  return systemTemplates.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): SystemTemplate[] {
  return systemTemplates.filter((t) => t.category === category);
}

/**
 * Search templates by name or tags
 */
export function searchTemplates(query: string): SystemTemplate[] {
  const lowerQuery = query.toLowerCase();
  return systemTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
