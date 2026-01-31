import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, verify the Firebase token here
    // For now, we'll extract email from the token payload
    const token = authHeader.split('Bearer ')[1];

    // Decode JWT to get email (simplified - in production use firebase-admin)
    let email: string | null = null;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      email = payload.email;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ subscription: { status: 'inactive' } });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return NextResponse.json({ subscription: { status: 'inactive' } });
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for past_due or canceled
      const allSubs = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        limit: 1,
      });

      if (allSubs.data.length > 0) {
        const sub = allSubs.data[0];
        return NextResponse.json({
          subscription: {
            status: sub.status,
            currentPeriodEnd: sub.items.data[0]?.price?.recurring
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Fallback: 30 days from now
              : null,
          },
        });
      }

      return NextResponse.json({ subscription: { status: 'inactive' } });
    }

    const sub = subscriptions.data[0];
    return NextResponse.json({
      subscription: {
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as fallback
      },
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
