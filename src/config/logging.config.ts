import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export const createLoggingConfig = (configService: ConfigService): WinstonModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const logLevel = configService.get<string>('LOG_LEVEL') || (isProduction ? 'info' : 'debug');

  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        context,
        ...(trace && { trace }),
        ...meta,
      });
    }),
  );

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: isProduction
        ? logFormat
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${context}] ${level}: ${message} ${metaStr}`;
            }),
          ),
    }),
  ];

  // Add file transports in production
  if (isProduction) {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );
  }

  return {
    level: logLevel,
    format: logFormat,
    transports,
    exceptionHandlers: [
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: 'logs/rejections.log',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ],
  };
};

export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/audit.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

export interface AuditLogEntry {
  userId?: number;
  action: string;
  resource: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export const logAuditEvent = (entry: Omit<AuditLogEntry, 'timestamp'>) => {
  auditLogger.info({
    ...entry,
    timestamp: new Date().toISOString(),
  });
};
