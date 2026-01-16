import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {ExpressLayerType} from '@opentelemetry/instrumentation-express';
import {PrismaInstrumentation} from "@prisma/instrumentation";
import {PrismaFilteringBatchSpanProcessor} from "./prisma-filtering-batch-span-processor";
import {Instrumentation} from "@opentelemetry/instrumentation";

const buildTraceExporter = () => (
    new OTLPTraceExporter({
      url: process.env.TRACING_URL
    })
);

const buildSdk = (traceExporter: OTLPTraceExporter) => {
  const instrumentations:(Instrumentation | Instrumentation[])[] = [];

  if (process.env.ENABLE_PRISMA_TRACING === 'true') {
    console.log(`Prisma application tracing is enabled.`);
    instrumentations.push(new PrismaInstrumentation());
  }

  instrumentations.push(getNodeAutoInstrumentations({
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
  }));

  return new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME ?? 'unknown-service'
    }),

    spanProcessors: [
      new PrismaFilteringBatchSpanProcessor(traceExporter)
    ],

    contextManager: new AsyncLocalStorageContextManager(),

    instrumentations
  })
}

const tracingUrl = process.env.TRACING_URL;
if (tracingUrl) {
  console.log(`Enabling application tracing using TRACING_URL: ${tracingUrl}.`);

  const traceExporter = buildTraceExporter();
  const sdk = buildSdk(traceExporter);
  sdk.start();

  process.on('SIGTERM', async () => {
    await sdk.shutdown();
  });
} else {
  console.log(`TRACING_URL environment variable is not set - won't enable application tracing.`)
}


