/**
 * CLI utility exports
 */

export {
  copyTemplates,
  copySubdirectory,
  writePackageJson,
  type CopyOptions,
  type CopyResult,
} from './copyTemplates.js';

export {
  mergePackageJson,
  createPackageJson,
  hasPackageJson,
  MAO_DEPENDENCIES,
  MAO_DEV_DEPENDENCIES,
  MAO_SCRIPTS,
  type MergeResult,
} from './mergePackageJson.js';

export {
  slugify,
  isValidProjectName,
  getProjectNameError,
  getCurrentTimestamp,
  capitalize,
  slugToDisplayName,
} from './prompts.js';
