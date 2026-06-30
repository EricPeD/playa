import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import {
  insertPayment,
  isWebhookEventProcessed,
  markOrderFailed,
  markOrderPaid,
  markPaymentRefunded,
  saveWebhookEvent,
} from '@/lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature') ?? '';

    let event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
      console.error('[webhook] Invalid signature:', error);
      return jsonResponse({ error: 'Invalid signature' }, 400);
    }

    const alreadyProcessed = await isWebhookEventProcessed(event.id);
    if (alreadyProcessed) {
      return jsonResponse({ received: true, skipped: true });
    }

    const savedEvent = await saveWebhookEvent(event.id, event.type, event.data.object);
    if (!savedEvent) {
      return jsonResponse({ error: 'Failed to save webhook event' }, 500);
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const chargeId = typeof intent.latest_charge === 'string' ? intent.latest_charge : null;

      const paid = await markOrderPaid(intent.id);
      if (!paid) {
        return jsonResponse({ error: 'Failed to mark order paid' }, 500);
      }

      const inserted = await insertPayment({
        orderId: Number(intent.metadata.orderId),
        stripePaymentIntentId: intent.id,
        stripeChargeId: chargeId,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: 'succeeded',
      });

      if (!inserted) {
        return jsonResponse({ error: 'Failed to insert payment' }, 500);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const err = intent.last_payment_error;
      const failureCode = err?.code ?? 'unknown';
      const failureMessage = err?.message ?? 'unknown';

      const failed = await markOrderFailed(intent.id, failureCode, failureMessage);
      if (!failed) {
        return jsonResponse({ error: 'Failed to mark order failed' }, 500);
      }

      const inserted = await insertPayment({
        orderId: Number(intent.metadata.orderId),
        stripePaymentIntentId: intent.id,
        stripeChargeId: null,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: 'failed',
        failureCode: err?.code ?? null,
        failureMessage: err?.message ?? null,
      });

      if (!inserted) {
        return jsonResponse({ error: 'Failed to insert payment' }, 500);
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const refunded = await markPaymentRefunded(charge.id);
      if (!refunded) {
        return jsonResponse({ error: 'Failed to mark payment refunded' }, 500);
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error('[webhook] Error:', error);
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    return jsonResponse({ error: message }, 500);
  }
}
