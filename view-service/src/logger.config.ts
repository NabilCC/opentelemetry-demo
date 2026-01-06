import {format, Logform, LoggerOptions, transports} from 'winston';

const serviceName = process.env.SERVICE_NAME || 'view-service';

const productionFormat: Logform.Format = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format((info) => {
      info.application = "otel-demo";
      info.service = serviceName;
      return info;
    })(),
    format.json(),
);

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