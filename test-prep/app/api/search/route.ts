import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { query: string };
  try {
    body = (await request.json()) as { query: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  try {
    // Use Claude with web search tool to gather topic materials
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Search for educational content about: "${body.query}"

Gather key facts, concepts, definitions, and important details that would be useful for creating a quiz on this topic. Summarize the most important learning points in clear, factual prose. Focus on accuracy and educational value. Aim for 500-1000 words of well-organized material.`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No text content returned from search' }, { status: 500 });
    }

    return NextResponse.json({ material: textContent.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
