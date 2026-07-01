import { supabase } from '@/lib/supabase';

function logGroupStart(name: string, ...args: unknown[]) {
  console.group(`[${name}]`);
  console.log(...args);
}

function logGroupEnd() {
  console.groupEnd();
}

export async function savePaymentIntent(
  orderId: number,
  intentId: string,
): Promise<boolean> {
  logGroupStart('savePaymentIntent', { orderId, intentId });

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: intentId,
        stripe_status: 'pending',
      })
      .eq('id', orderId);

    if (error) {
      console.error('[savePaymentIntent] Error:', error.message);
      return false;
    }

    console.log('[savePaymentIntent] Actualizado pedido:', orderId);
    return true;
  } catch (error) {
    console.error('[savePaymentIntent] Exception:', error);
    return false;
  } finally {
    logGroupEnd();
  }
}

export async function insertPayment({
  orderId,
  stripePaymentIntentId,
  stripeChargeId,
  amount,
  currency,
  status,
  failureCode,
  failureMessage,
}: {
  orderId: number;
  stripePaymentIntentId: string;
  stripeChargeId: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded' | 'pending';
  failureCode?: string | null;
  failureMessage?: string | null;
}): Promise<boolean> {
  logGroupStart('insertPayment', {
    orderId,
    stripePaymentIntentId,
    stripeChargeId,
    amount,
    currency,
    status,
  });

  try {
    const { error } = await supabase.from('payments').insert({
      order_id: orderId,
      stripe_payment_intent_id: stripePaymentIntentId,
      stripe_charge_id: stripeChargeId,
      amount,
      currency,
      status,
      failure_code: failureCode ?? null,
      failure_message: failureMessage ?? null,
    });

    if (error) {
      console.error('[insertPayment] Error:', error.message);
      return false;
    }

    console.log('[insertPayment] Pago insertado:', status);
    return true;
  } catch (error) {
    console.error('[insertPayment] Exception:', error);
    return false;
  } finally {
    logGroupEnd();
  }
}

export async function markOrderPaid(
  stripePaymentIntentId: string,
  orderId?: number,
): Promise<boolean> {
  logGroupStart('markOrderPaid', { stripePaymentIntentId, orderId });

  try {
    let query = supabase
      .from('orders')
      .update({
        status: 'confirmed',
        stripe_status: 'succeeded',
        paid_at: new Date().toISOString(),
        payment_method: 'stripe',
      });

    if (typeof orderId === 'number' && Number.isFinite(orderId) && orderId > 0) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('stripe_payment_intent_id', stripePaymentIntentId);
    }

    const { data, error } = await query.select('id');

    if (error) {
      console.error('[markOrderPaid] Error:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.error('[markOrderPaid] No order found for intent:', stripePaymentIntentId);
      return false;
    }

    console.log('[markOrderPaid] Pedido marcado como pagado:', stripePaymentIntentId);
    return true;
  } catch (error) {
    console.error('[markOrderPaid] Exception:', error);
    return false;
  } finally {
    logGroupEnd();
  }
}

export async function markOrderFailed(
  stripePaymentIntentId: string,
  failureCode: string,
  failureMessage: string,
  orderId?: number,
): Promise<boolean> {
  logGroupStart('markOrderFailed', { stripePaymentIntentId, failureCode, failureMessage, orderId });

  try {
    let query = supabase
      .from('orders')
      .update({
        status: 'decline',
        stripe_status: 'failed',
        payment_method: 'stripe',
      });

    if (typeof orderId === 'number' && Number.isFinite(orderId) && orderId > 0) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('stripe_payment_intent_id', stripePaymentIntentId);
    }

    const { data, error } = await query.select('id');

    if (error) {
      console.error('[markOrderFailed] Error:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.error('[markOrderFailed] No order found for intent:', stripePaymentIntentId);
      return false;
    }

    console.log('[markOrderFailed] Pedido marcado como decline:', stripePaymentIntentId);
    return true;
  } catch (error) {
    console.error('[markOrderFailed] Exception:', error);
    return false;
  } finally {
    logGroupEnd();
  }
}

export async function markPaymentRefunded(
  stripeChargeId: string,
): Promise<boolean> {
  logGroupStart('markPaymentRefunded', { stripeChargeId });

  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
      })
      .eq('stripe_charge_id', stripeChargeId);

    if (error) {
      console.error('[markPaymentRefunded] Error:', error.message);
      return false;
    }

    console.log('[markPaymentRefunded] Pago marcado como reembolsado:', stripeChargeId);
    return true;
  } catch (error) {
    console.error('[markPaymentRefunded] Exception:', error);
    return false;
  } finally {
    logGroupEnd();
  }
}

export async function isWebhookEventProcessed(
  stripeEventId: string,
): Promise<boolean> {
  logGroupStart('isWebhookEventProcessed', { stripeEventId });

  try {
    const { data, error } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('stripe_event_id', stripeEventId)
      .maybeSingle();

    if (error) {
      console.error('[isWebhookEventProcessed] Error:', error.message);
      return false;
    }

    const processed = Boolean(data);
    console.log('[isWebhookEventProcessed] Procesado:', processed);
    return processed;
  } catch (error) {
    console.error('[isWebhookEventProcessed] Exception:', error);
    return false;
  } finally {
    logGroupEnd();
  }
}

export async function saveWebhookEvent(
  stripeEventId: string,
  type: string,
  payload: object,
): Promise<'inserted' | 'duplicate'> {
  logGroupStart('saveWebhookEvent', { stripeEventId, type });

  try {
    const { data, error } = await supabase
      .from('stripe_webhook_events')
      .upsert(
        {
          stripe_event_id: stripeEventId,
          type,
          payload,
          processed_at: new Date().toISOString(),
        },
        { onConflict: 'stripe_event_id', ignore: true },
      )
      .select('id');

    if (error) {
      console.error('[saveWebhookEvent] Error:', error.message);
      return 'duplicate';
    }

    const inserted = Boolean(data && data.length > 0);
    console.log(
      inserted
        ? '[saveWebhookEvent] Evento guardado:'
        : '[saveWebhookEvent] Evento ya existente:',
      stripeEventId,
    );
    return inserted ? 'inserted' : 'duplicate';
  } catch (error) {
    console.error('[saveWebhookEvent] Exception:', error);
    return 'duplicate';
  } finally {
    logGroupEnd();
  }
}
