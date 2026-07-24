import { PREFERENCES_SCHEMA_VERSION, THEME_VALUES, VIEW_MODES } from '../constants.js';
import { isPlainObject } from '../../utils/object.js';
import { issue, throwIfIssues, validateEnum } from './validation-utils.js';

export function validatePreferences(value) {
  const issues = [];
  const source = isPlainObject(value) ? value : {};

  if (source.schemaVersion !== PREFERENCES_SCHEMA_VERSION) {
    issues.push(issue('schemaVersion', 'A versão das preferências não é suportada.', 'schema'));
  }

  const normalized = {
    theme: validateEnum(source.theme, THEME_VALUES, 'theme', issues),
    viewMode: validateEnum(source.viewMode, [VIEW_MODES.CARDS], 'viewMode', issues),
    schemaVersion: source.schemaVersion,
  };

  throwIfIssues(issues, 'As preferências armazenadas são inválidas.');
  return normalized;
}
