const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function suggestIntent({ url, title, metaDescription }) {
  try {
    const prompt = `A user just opened a browser tab. URL: ${url}. Page title: ${title}. ${metaDescription ? `Meta description: ${metaDescription}.` : ''} In 5 words or less, what was their most likely reason for opening this? Reply with ONLY the short intent phrase. No punctuation. Lowercase only. Examples: 'research for assignment', 'check email notifications', 'buy laptop charger'`;

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0.3,
    });

    const suggestion = response.choices[0]?.message?.content?.trim().toLowerCase() || null;
    return suggestion;
  } catch (error) {
    console.error('Groq intent suggestion failed:', error.message);
    return null;
  }
}

module.exports = { suggestIntent };
