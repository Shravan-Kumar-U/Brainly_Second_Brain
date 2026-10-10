export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = never reached the server
    this.details = details;
  }

  // Turns the server's [{ field, message }] list into { field: message }
  get fieldErrors() {
    if (!Array.isArray(this.details)) return {};

    return this.details.reduce((result, detail) => {
      if (detail && typeof detail === 'object' && detail.field && !result[detail.field]) {
        result[detail.field] = detail.message;
      }
      return result;
    }, {});
  }
}