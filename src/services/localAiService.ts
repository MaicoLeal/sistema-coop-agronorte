import type { Language } from '../types';
import type { VoiceAssistantResponse } from './voiceAssistantService';

interface LocalFarmerQuestion {
  query: string;
  language: Language;
  context?: Record<string, unknown>;
}

const VALID_ACTIONS = new Set([
  'open_harvest',
  'open_pest_diagnosis',
  'show_greenhouses',
  'none',
]);

export async function requestLocalFarmerAnswer(
  question: LocalFarmerQuestion,
  fetchImpl: typeof fetch = fetch,
): Promise<VoiceAssistantResponse> {
  const response = await fetchImpl('/api/assistant/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(question),
  });

  if (!response.ok) {
    throw new Error(`IA local indisponível (${response.status}).`);
  }

  const payload = (await response.json()) as Partial<VoiceAssistantResponse>;

  if (
    typeof payload.answerText !== 'string' ||
    typeof payload.speakText !== 'string' ||
    !VALID_ACTIONS.has(payload.actionType ?? 'none')
  ) {
    throw new Error('A API local devolveu uma resposta inválida.');
  }

  return {
    answerText: payload.answerText,
    speakText: payload.speakText,
    actionType: payload.actionType ?? 'none',
  };
}
