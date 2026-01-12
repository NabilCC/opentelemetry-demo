import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {resourceFromAttributes} from '@opentelemetry/resources';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME ?? 'unknown-service'
  }),

  traceExporter: new OTLPTraceExporter({
    url:
        process.env.TEMPO_TRACES_URL ??
        'http://tempo:4318/v1/traces',
  }),

  contextManager: new AsyncLocalStorageContextManager(),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) =>
            req.url?.includes('/health')
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', async () => {
  await sdk.shutdown();
});
