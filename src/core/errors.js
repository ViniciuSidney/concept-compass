export class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = new.target.name;
    this.code = options.code ?? 'APP_ERROR';
    this.details = options.details ?? null;
  }
}

export class RouteError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'ROUTE_ERROR' });
  }
}

export class ValidationError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'VALIDATION_ERROR' });
    this.issues = Object.freeze([...(options.issues ?? [])]);
  }
}

export class StorageError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'STORAGE_ERROR' });
    this.operation = options.operation ?? null;
    this.key = options.key ?? null;
  }
}

export class MigrationError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'MIGRATION_ERROR' });
  }
}

export class ImportError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'IMPORT_ERROR' });
  }
}

export class NotFoundError extends AppError {
  constructor(entityName, entityId, options = {}) {
    super(`${entityName} não encontrado.`, {
      ...options,
      code: options.code ?? 'NOT_FOUND_ERROR',
      details: {
        entityName,
        entityId,
        ...(options.details ?? {}),
      },
    });
  }
}

export class InvariantError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'INVARIANT_ERROR' });
  }
}
