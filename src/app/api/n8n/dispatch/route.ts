import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, apiKey, payload } = await req.json();

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Missing webhookUrl' }, { status: 400 });
    }

    // Server-side fetch to n8n (bypasses browser CORS restrictions completely!)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n responded with status ${response.status}`, details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, n8nResponse: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
