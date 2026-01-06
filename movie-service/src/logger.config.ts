import { format, Logform, LoggerOptions, transports } from 'winston';
import LokiTransport from 'winston-loki';

const serviceName = process.env.SERVICE_NAME || 'movie-service';

// PRODUCTION FORMAT: JSON, service labels
const productionFormat: Logform.Format = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format((info) => {
      return info;
    })(),
    format.json(),
);

// DEVELOPMENT FORMAT: Pretty, colored
const developmentFormat: Logform.Format = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`;
    }),
);

export function createWinstonOptions(): LoggerOptions {
  if (process.env.NODE_ENV === 'production') {
    return {
      level: 'info',
      format: productionFormat,
      transports: [
        new transports.Console(),
        new LokiTransport({
          host: process.env.LOKI_URL || 'http://localhost:3100/loki/api/v1/push',
          labels: { application: 'otel-demo', service: serviceName },
          json: true,
        }),
      ],
    };
  } else {
    return {
      level: 'debug',
      format: developmentFormat,
      transports: [new transports.Console()],
    };
  }
}