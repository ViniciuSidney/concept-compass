export class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = new.target.name;
    this.code = options.code ?? 'APP_ERROR';
  }
}

export class RouteError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? 'ROUTE_ERROR' });
  }
}
