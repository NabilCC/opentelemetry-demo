import winston, {format, transports} from 'winston';
import LokiTransport from 'winston-loki';
import { context, trace } from '@opentelemetry/api';

const loggingHost = process.env.LOGGING_HOST || 'http://localhost:3100';
const serviceName = process.env.SERVICE_NAME || 'actor-service';
const isProduction = process.env.NODE_ENV === 'production';

// Ensures that stack traces can be parsed into Loki fields
const stackFlatteningFormat = format((info) => {
  if (Array.isArray(info.stack)) {
    info.stack = info.stack.join('\n');
  }
  return info;
})();

// NB format.json() must come last in the chain
const lokiTransportFormat = winston.format.combine(
    stackFlatteningFormat,
    winston.format.json()
);

const tracingFormat = format((info) => {
  const span = trace.getSpan(context.active());

  if (span) {
    const spanContext = span.spanContext();
    info.trace_id = spanContext.traceId;
    info.span_id = spanContext.spanId;
  }

  return info;
});


const productionWinstonOptions: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.combine(
      tracingFormat(),
      winston.format.timestamp(),
      winston.format.errors({stack: true})
  ),
  transports: [
    new LokiTransport({
      host: loggingHost,
      format: lokiTransportFormat,
      interval: 5,
      labels: {
        app: 'otel-demo', service: serviceName, "service.name": serviceName
      },
      onConnectionError: (err) => {
        console.error('Error connecting logger to Loki', err);
      }
    })
  ]
};

const developmentWinstonOptions: winston.LoggerOptions = {
  level: 'debug',
  format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }), // ensures error objects have stack
      format.colorize(),
      format.printf(({ timestamp, level, message, stack }) => {
        // if there is a stack, print it; otherwise, print the message
        return `${timestamp} [${level}] ${stack || message}`;
      }),
  ),
  transports: [new transports.Console()],
};

export const winstonOptions = ():winston.LoggerOptions => {
  if (isProduction) {
    console.log(`Using production logging with logging host=${loggingHost}`);
    return productionWinstonOptions;
  }
  return developmentWinstonOptions;
}