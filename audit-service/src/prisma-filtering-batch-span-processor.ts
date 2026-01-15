import {
  BatchSpanProcessor,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';

const SUPPRESSED_SPANS = new Set([
  'prisma:client:serialize',
  'prisma:engine:response_json_serialization',
  'prisma:engine:serialize',
  'prisma:engine:connection'
]);

export class PrismaFilteringBatchSpanProcessor extends BatchSpanProcessor {
  override onEnd(span: ReadableSpan): void {
    if (SUPPRESSED_SPANS.has(span.name)) {
      return; // drop span
    }
    super.onEnd(span);
  }
}