import crypto from "crypto";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export type StripeCheckoutMode = "payment";

export interface CreateCheckoutSessionParams {
  amountCents: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  description: string;
  metadata?: Record<string, string>;
}

function getStripeSecretKey(): string {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required");
  }
  return process.env.STRIPE_SECRET_KEY;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ id: string; url: string | null; payment_intent: string | null; metadata: Record<string, string> | null; }> {
  const secretKey = getStripeSecretKey();
  const form = new URLSearchParams();

  form.append("mode", "payment");
  form.append("success_url", params.successUrl);
  form.append("cancel_url", params.cancelUrl);
  form.append("line_items[0][price_data][currency]", params.currency ?? "cad");
  form.append("line_items[0][price_data][product_data][name]", params.description);
  form.append("line_items[0][price_data][unit_amount]", String(params.amountCents));
  form.append("line_items[0][quantity]", "1");

  if (params.metadata) {
    for (const [key, value] of Object.entries(params.metadata)) {
      form.append(`metadata[${key}]`, value);
      form.append(`payment_intent_data[metadata][${key}]`, value);
    }
  }

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to create Stripe checkout session");
  }

  return {
    id: data.id,
    url: data.url ?? null,
    payment_intent: data.payment_intent ?? null,
    metadata: data.metadata ?? null,
  };
}

export function verifyStripeWebhookSignature(rawBody: Buffer, signatureHeader: string): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required");
  }

  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signaturePart = parts.find((part) => part.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.slice(2);
  const signature = signaturePart.slice(3);

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
