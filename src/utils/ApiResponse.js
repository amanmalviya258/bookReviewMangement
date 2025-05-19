export class ApiResponse {
  constructor({ statusCode,success, message, data = null, error = null, meta }) {
    this.statusCode=statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.meta = {
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

static send(res, instance) {
    return res.status(instance.statusCode).json(instance);
  }

}
