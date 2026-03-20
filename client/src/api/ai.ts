import { apiFetch } from './client'

export type EnrichType = 'topic' | 'problem' | 'question'

export interface TopicEnrichment {
  title: string
  subject: string
  summary: string
  notes: string
  examples: string
}

export interface ProblemEnrichment {
  title: string
  problemStatement: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

export interface QuestionEnrichment {
  text: string
}

export type EnrichResult = TopicEnrichment | ProblemEnrichment | QuestionEnrichment

export const enrich = (data: {
  type: EnrichType
  selectedText: string
  bookTitle: string
  pageNumber: number
}) =>
  apiFetch<EnrichResult>('/ai/enrich', {
    method: 'POST',
    body: JSON.stringify(data),
  })
