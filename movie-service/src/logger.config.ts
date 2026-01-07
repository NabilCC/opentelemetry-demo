import { format, Logform, LoggerOptions, transports } from 'winston';
import LokiTransport from 'winston-loki';

const serviceName = process.env.SERVICE_NAME || 'movie-service';

enum ProductionFormatImplementation {
  FULL_JSON,
  PARTIAL_JSON
}

// PRODUCTION FORMAT: Produces a full structured JSON log line which can be split in Loki using the | json operator
// example: {"context":"MovieService","level":"info","message":"{\"level\":\"info\",\"message\":\"Fetch actor 1 from actor-service using url: http://actor-service:4001/actor/1\",\"timestamp\":\"2026-01-06T21:12:08.855Z\",\"context\":\"MovieService\"}","timestamp":"2026-01-06T21:12:08.855Z"}
const productionFormatFullJson: Logform.Format = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format((info) => {
      if (Array.isArray(info.stack)) {
        info.stack = info.stack.join('\n');
      }
      const { level, message, timestamp, ...etc } = info;
      info.message = JSON.stringify({
        level,
        message,
        timestamp,
        ...etc,
      });
      console.log(`DEBUG: ${JSON.stringify(info)}`);

      // remove any additional fields like stack, context etc as they have been encoded into the "message" field itself
      Object.keys(info).forEach((key) => {
        if (key !== 'message' && key !== 'level') {
          delete info[key];
        }
      });

      return info;
    })(),
    format.json(),
);

// PRODUCTION FORMAT: Produces a log line with other attributes encoded as JSON
const productionFormatLogLineAndJson: Logform.Format = format.combine(
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

export function createJsonOutputWinstonOptions(): LoggerOptions {
  if (process.env.NODE_ENV === 'production') {
    const loggingHost = process.env.LOG_HOST || 'http://localhost:3100';
    console.log(`Using production logging format to push to log host: ${loggingHost}`);
    return {
      level: 'info',
      format: productionFormatFullJson,
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