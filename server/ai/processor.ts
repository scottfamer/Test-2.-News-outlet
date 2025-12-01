import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProcessedArticle {
  headline: string;
  summary: string;
  fullText: string;
  credibilityScore: number;
  isBreakingNews: boolean;
}

export async function processArticleWithAI(
  rawContent: string,
  sourceUrl: string
): Promise<ProcessedArticle | null> {
  try {
    const prompt = `You are a professional news editor for a breaking news outlet. Analyze the following content and determine if it qualifies as BREAKING NEWS.

CONTENT:
${rawContent.substring(0, 8000)}

SOURCE: ${sourceUrl}

Your task:
1. Determine if this is BREAKING NEWS (recent, significant, urgent, newsworthy)
2. If YES, create a professional news article with:
   - A compelling headline (max 100 characters)
   - A concise summary (2-3 sentences, max 200 characters)
   - A full article rewrite (400-600 words, professional journalism style)
   - A credibility score (0-100) based on source reliability and content quality

3. If NOT breaking news, respond with: NOT_BREAKING_NEWS

Respond ONLY in this JSON format:
{
  "isBreakingNews": true/false,
  "headline": "...",
  "summary": "...",
  "fullText": "...",
  "credibilityScore": 85
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional news editor. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content || content === 'NOT_BREAKING_NEWS') {
      return null;
    }

    // Parse JSON response
    const parsed = JSON.parse(content);

    if (!parsed.isBreakingNews) {
      return null;
    }

    return {
      headline: parsed.headline,
      summary: parsed.summary,
      fullText: parsed.fullText,
      credibilityScore: Math.min(100, Math.max(0, parsed.credibilityScore)),
      isBreakingNews: true,
    };
  } catch (error) {
    console.error('❌ AI processing error:', error);
    return null;
  }
}

export async function evaluateCredibility(content: string, sourceUrl: string): Promise<number> {
  try {
    const prompt = `Evaluate the credibility of this news content on a scale of 0-100.

Consider:
- Source reliability
- Factual accuracy indicators
- Writing quality
- Presence of citations/references
- Sensationalism vs objectivity

SOURCE: ${sourceUrl}
CONTENT: ${content.substring(0, 2000)}

Respond with ONLY a number between 0-100.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0]?.message?.content?.trim() || '50');
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('❌ Credibility evaluation error:', error);
    return 50; // Default moderate credibility
  }
}
