import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert waste classification AI. Analyze waste images and classify them accurately.

Categories:
- plastic: Bottles, bags, containers, films (recyclable or single-use)
- organic: Food waste, plant material, compost-eligible items
- metal: Aluminum, steel, tin cans, metal scraps
- electronic: E-waste, batteries, circuit boards, devices
- mixed: Multiple incompatible materials bonded/mixed
- hazardous: Chemical waste, medical waste, contaminated items

For biodegradability:
- biodegradable: Naturally decomposes (organic matter, paper, cardboard, untreated wood)
- non-biodegradable: Does not biodegrade (plastic, metals, glass, synthetic materials)

For severity (environmental impact):
- low: Easily recyclable, minimal toxicity
- medium: Recyclable with effort or moderate toxicity
- high: Not easily recyclable, moderate toxicity
- critical: Hazardous, toxic, or difficult to process

Provide accurate classification based on the image.`;

    const userPrompt = `Classify this waste image. Respond with ONLY a valid JSON object with these exact fields:
{
  "wasteType": "plastic|organic|metal|electronic|mixed|hazardous",
  "biodegradable": "biodegradable|non-biodegradable",
  "severity": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "description": "brief description of what you see"
}

Return ONLY the JSON object, no markdown formatting, no explanation.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const responseText = response.choices[0].message.content || '';

    // Parse JSON response
    let result;
    try {
      // Try parsing directly
      result = JSON.parse(responseText);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from AI');
      }
    }

    // Validate required fields
    if (!result.wasteType || !result.biodegradable || !result.severity) {
      throw new Error('Missing required classification fields');
    }

    // Ensure valid values
    const validWasteTypes = ['plastic', 'organic', 'metal', 'electronic', 'mixed', 'hazardous'];
    const validBiodegradable = ['biodegradable', 'non-biodegradable'];
    const validSeverity = ['low', 'medium', 'high', 'critical'];

    if (!validWasteTypes.includes(result.wasteType)) {
      result.wasteType = 'mixed';
    }
    if (!validBiodegradable.includes(result.biodegradable)) {
      result.biodegradable = 'non-biodegradable';
    }
    if (!validSeverity.includes(result.severity)) {
      result.severity = 'medium';
    }

    return NextResponse.json({
      success: true,
      classification: result,
      model: 'gpt-4o',
      tokensUsed: response.usage,
    });

  } catch (error: any) {
    console.error('Classification error:', error);

    // Return fallback classification for graceful degradation
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Classification failed',
        fallback: {
          wasteType: 'mixed',
          biodegradable: 'non-biodegradable',
          severity: 'medium',
          confidence: 0.3,
          description: 'Unable to classify - manual review recommended',
        }
      },
      { status: 500 }
    );
  }
}
