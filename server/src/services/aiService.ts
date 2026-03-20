import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

export type EnrichType = 'topic' | 'problem' | 'question'

const prompts: Record<EnrichType, (text: string, book: string, page: number) => string> = {
  topic: (text, book, page) =>
    `You are a study assistant. Extract a structured topic note from this passage.
Book: "${book}", Page: ${page}
"""${text}"""
Respond with ONLY valid JSON (no markdown, no code fences):
{"title":"short concept name (max 8 words)","subject":"academic field","summary":"one sentence summary","notes":"detailed explanation in markdown, use LaTeX for math e.g. $f(x)$","examples":"1-2 illustrative examples in markdown"}`,

  problem: (text, book, page) =>
    `You are a study assistant. Extract or formulate a practice problem from this passage.
Book: "${book}", Page: ${page}
"""${text}"""
Respond with ONLY valid JSON (no markdown, no code fences):
{"title":"short problem title (max 8 words)","problemStatement":"full problem statement in markdown with LaTeX for math","difficulty":"medium","tags":["tag1"]}
The difficulty field must be exactly one of: easy, medium, hard.`,

  question: (text, book, page) =>
    `You are a study assistant. Formulate a clarifying open question a student would ask about this passage.
Book: "${book}", Page: ${page}
"""${text}"""
Respond with ONLY valid JSON (no markdown, no code fences):
{"text":"the question a student would ask"}`,
}

export async function enrich(
  type: EnrichType,
  selectedText: string,
  bookTitle: string,
  pageNumber: number,
) {
  const result = await model.generateContent(prompts[type](selectedText, bookTitle, pageNumber))
  const raw = result.response.text().trim()
  // Strip markdown code fences in case Gemini adds them despite instructions
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(json)
}
