import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {ExpressLayerType} from '@opentelemetry/instrumentation-express';
import {PrismaInstrumentation} from "@prisma/instrumentation";
import {PrismaFilteringBatchSpanProcessor} from "./prisma-filtering-batch-span-processor";

const traceExporter = new OTLPTraceExporter({
  url:
      process.env.TRACING_URL ??
      'http://tempo:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME ?? 'unknown-service'
  }),

  spanProcessors: [
    new PrismaFilteringBatchSpanProcessor(traceExporter)
  ],

  contextManager: new AsyncLocalStorageContextManager(),

  instrumentations: [
    new PrismaInstrumentation(),
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) =>
            // ignore healthchecks
            req.url?.includes('/health')
        ,
        ignoreOutgoingRequestHook: (req) =>
            // ignore healthchecks
            req.path.includes('api/v1/push')
        ,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },

      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },

      '@opentelemetry/instrumentation-express': {
        ignoreLayersType: [
          ExpressLayerType.MIDDLEWARE,
        ],
      },
    }),
  ],
});

console.log(`Starting Node OTEL instrumentation.`)
sdk.start();

process.on('SIGTERM', async () => {
  await sdk.shutdown();
});
