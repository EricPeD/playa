import { stripe } from '@/lib/stripe';
import { savePaymentIntent } from '@/lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, currency } = body ?? {};

    if (
      typeof orderId !== 'number' ||
      !Number.isInteger(orderId) ||
      orderId <= 0 ||
      typeof amount !== 'number' ||
      amount <= 0
    ) {
      return jsonResponse({ error: 'Invalid request body' }, 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: typeof currency === 'string' && currency.trim() !== '' ? currency : 'eur',
      metadata: {
        orderId: String(orderId),
      },
      automatic_payment_methods: { enabled: true },
    });

    if (!paymentIntent.client_secret) {
      return jsonResponse({ error: 'Unable to create payment intent' }, 500);
    }

    const saved = await savePaymentIntent(orderId, paymentIntent.id);
    if (!saved) {
      return jsonResponse({ error: 'Failed to save payment intent' }, 500);
    }

    return jsonResponse({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('[create-intent] Error:', error);
    const message = error instanceof Error ? error.message : 'Stripe create intent failed';
    return jsonResponse({ error: message }, 500);
  }
}
