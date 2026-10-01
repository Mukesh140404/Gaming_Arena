export class ApiResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;

  constructor(statusCode: number, data: T, message = "Success") {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}