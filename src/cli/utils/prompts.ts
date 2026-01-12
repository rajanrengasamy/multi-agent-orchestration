/**
 * CLI helper utilities for prompts and string manipulation
 */

/**
 * Convert a string to a URL-friendly slug
 * @param name - The name to convert
 * @returns A lowercase, hyphenated slug
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate that a project name is valid for npm packages
 * @param name - The name to validate
 * @returns true if the name is valid
 */
export function isValidProjectName(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }

  // Check for valid characters only
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return false;
  }

  // Cannot start with hyphen or underscore
  if (/^[-_]/.test(name)) {
    return false;
  }

  // Reasonable length limit (npm max is 214)
  if (name.length > 214) {
    return false;
  }

  return true;
}

/**
 * Get validation error message for an invalid project name
 * @param name - The name that failed validation
 * @returns Error message explaining why the name is invalid
 */
export function getProjectNameError(name: string): string {
  if (!name || name.length === 0) {
    return 'Project name cannot be empty';
  }

  if (/^[-_]/.test(name)) {
    return 'Project name cannot start with a hyphen or underscore';
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores';
  }

  if (name.length > 214) {
    return 'Project name cannot exceed 214 characters';
  }

  return 'Invalid project name';
}

/**
 * Format a timestamp for display
 * @returns ISO timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Capitalize the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a slug to a display name
 * @param slug - The slug to convert (e.g., "my-project")
 * @returns A display name (e.g., "My Project")
 */
export function slugToDisplayName(slug: string): string {
  return slug
    .split(/[-_]+/)
    .map((word) => capitalize(word))
    .join(' ');
}
