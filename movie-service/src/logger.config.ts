import { format, Logform, LoggerOptions, transports } from 'winston';
import LokiTransport from 'winston-loki';

const serviceName = process.env.SERVICE_NAME || 'movie-service';

// PRODUCTION FORMAT: JSON, service labels
const productionFormat: Logform.Format = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format((info) => {
      const { level, message, timestamp, ...etc } = info;
      info.message = JSON.stringify({
        level,
        message,
        timestamp,
        ...etc,
      });
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
    const loggingHost = process.env.LOG_HOST || 'http://localhost:3100';
    console.log(`Using production logging format to push to log host: ${loggingHost}`);
    return {
      level: 'info',
      format: productionFormat,
      transports: [
        new transports.Console(),
        new LokiTransport({
          host: loggingHost,
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