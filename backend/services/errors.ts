export class ConfigError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ConfigError';
    this.code = code;
  }
}

export class UpstreamError extends Error {
  public readonly service: string;
  public readonly status?: number;
  constructor(service: string, message: string, status?: number) {
    super(message);
    this.name = 'UpstreamError';
    this.service = service;
    this.status = status;
  }
}

