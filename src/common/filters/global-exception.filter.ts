import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.createErrorResponse(exception, request);

    // Log the error
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined;
    let details: any;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as any;
        message = response.message || response.error || exception.message;
        error = response.error;
        details = response.details;
      }
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      error = 'Query Error';
      details = this.sanitizeDatabaseError(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    return {
      statusCode,
      timestamp,
      path,
      method,
      message,
      ...(error && { error }),
      ...(details && { details }),
    };
  }

  private sanitizeDatabaseError(error: QueryFailedError): any {
    // Remove sensitive information from database errors
    const sensitiveFields = ['password', 'token', 'secret'];
    
    // Safely access driverError properties
    const driverError = (error as any).driverError;
    const detail = driverError?.detail || error.message || '';
    
    let sanitizedDetail = detail;
    sensitiveFields.forEach(field => {
      const regex = new RegExp(`${field}[^\\s]*`, 'gi');
      sanitizedDetail = sanitizedDetail.replace(regex, `${field}=***`);
    });

    return {
      code: driverError?.code,
      detail: sanitizedDetail,
      constraint: driverError?.constraint || driverError?.table,
      query: error.query ? '[QUERY HIDDEN]' : undefined,
    };
  }

  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const { statusCode, message, path, method } = errorResponse;
    const userAgent = request.get('User-Agent') || '';
    const userIp = request.ip || request.connection.remoteAddress;

    const logContext = {
      statusCode,
      method,
      path,
      userAgent,
      userIp,
      userId: (request as any).user?.id,
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `${method} ${path} - ${message}`,
        exception instanceof Error ? exception.stack : exception,
        logContext,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(`${method} ${path} - ${message}`, logContext);
    }
  }
}
