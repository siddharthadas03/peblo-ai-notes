const cleanJson = (value) => {
  const trimmed = value.trim();
  const withoutFence = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const first = withoutFence.indexOf('{');
  const last = withoutFence.lastIndexOf('}');
  return first >= 0 && last >= 0 ? withoutFence.slice(first, last + 1) : withoutFence;
};

const fallbackSummary = (content) => ({
  summary: content ? content.slice(0, 280) : 'No note content was available to summarize.',
  actionItems: [],
  suggestedTitle: 'Untitled note'
});

const createAiConfigError = (message) => {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
};

const generateNoteInsights = async ({ title, content }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw createAiConfigError('AI summaries are not configured yet.');
  }

  const prompt = `You are an assistant for a productivity notes app.
Return valid JSON only, with exactly these keys:
{
  "summary": "2-4 sentence concise summary",
  "actionItems": ["clear action item", "another action item"],
  "suggestedTitle": "short improved title"
}

Rules:
- No markdown.
- No commentary outside JSON.
- actionItems must be an array of strings.
- If there are no action items, return an empty array.

Note title: ${title || 'Untitled note'}
Note content:
${content || ''}`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            actionItems: { type: 'array', items: { type: 'string' } },
            suggestedTitle: { type: 'string' }
          },
          required: ['summary', 'actionItems', 'suggestedTitle']
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    let providerMessage = '';

    try {
      providerMessage = JSON.parse(body)?.error?.message || '';
    } catch {
      providerMessage = '';
    }

    if (response.status === 403 && providerMessage.toLowerCase().includes('api key')) {
      throw createAiConfigError('AI summaries are temporarily unavailable because the Gemini API key needs to be replaced.');
    }

    throw createAiConfigError('AI summaries are temporarily unavailable. Please try again later.');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return fallbackSummary(content);

  const parsed = JSON.parse(cleanJson(text));
  return {
    summary: String(parsed.summary || ''),
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.map(String) : [],
    suggestedTitle: String(parsed.suggestedTitle || title || 'Untitled note')
  };
};

module.exports = { generateNoteInsights };
