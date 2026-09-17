import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VoiceAssistantService,
  FEMALE_VOICE_KEYWORDS,
  PT_MALE_KEYWORDS,
  ES_MALE_KEYWORDS
} from '../src/services/voiceAssistantService';

function createMockVoice(name: string, lang: string): SpeechSynthesisVoice {
  return {
    name,
    lang,
    default: false,
    localService: true,
    voiceURI: name
  };
}

test('rejeita vozes femininas conhecidas no filtro de seleção', () => {
  const femaleVoices = [
    createMockVoice('Microsoft Maria - Portuguese (Brazil)', 'pt-BR'),
    createMockVoice('Microsoft Francisca Online (Natural) - Portuguese (Brazil)', 'pt-BR'),
    createMockVoice('Google português do Brasil', 'pt-BR'),
    createMockVoice('Microsoft Sabina - Spanish (Mexico)', 'es-MX'),
    createMockVoice('Microsoft Helena - Spanish (Spain)', 'es-ES'),
    createMockVoice('Google español', 'es-ES'),
    createMockVoice('pt-br-x-afy-network', 'pt-BR')
  ];

  for (const voice of femaleVoices) {
    const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => voice.name.toLowerCase().includes(kw));
    assert.ok(isFemale, `A voz ${voice.name} deve ser identificada na lista de exclusão feminina`);
  }
});

test('seleciona com prioridade a voz masculina em português quando disponível', () => {
  const candidateVoices = [
    createMockVoice('Microsoft Maria - Portuguese (Brazil)', 'pt-BR'),
    createMockVoice('Google português do Brasil', 'pt-BR'),
    createMockVoice('Microsoft Antonio Online (Natural) - Portuguese (Brazil)', 'pt-BR'),
    createMockVoice('Microsoft Francisca Online (Natural) - Portuguese (Brazil)', 'pt-BR')
  ];

  const result = VoiceAssistantService.selectMaleVoice('pt-BR', candidateVoices);
  assert.ok(result.voice, 'Deve encontrar uma voz');
  assert.equal(
    result.voice?.name,
    'Microsoft Antonio Online (Natural) - Portuguese (Brazil)',
    'Deve priorizar Antonio (masculino natural)'
  );
  assert.equal(result.isExplicitMale, true);
  assert.equal(result.isFemaleFallback, false);
});

test('seleciona voz masculina em espanhol (Mateo / Jorge / Alvaro) para Don Mateo', () => {
  const candidateVoices = [
    createMockVoice('Microsoft Sabina - Spanish (Mexico)', 'es-MX'),
    createMockVoice('Microsoft Helena - Spanish (Spain)', 'es-ES'),
    createMockVoice('Microsoft Mateo Online (Natural) - Spanish (Paraguay)', 'es-PY'),
    createMockVoice('Microsoft Jorge - Spanish (Spain)', 'es-ES')
  ];

  const result = VoiceAssistantService.selectMaleVoice('es-PY', candidateVoices);
  assert.ok(result.voice, 'Deve encontrar uma voz');
  assert.equal(
    result.voice?.name,
    'Microsoft Mateo Online (Natural) - Spanish (Paraguay)',
    'Deve selecionar Mateo para espanhol'
  );
  assert.equal(result.isExplicitMale, true);
  assert.equal(result.isFemaleFallback, false);
});

test('prioriza voz masculina bilíngue de idioma irmão em vez de voz feminina local', () => {
  // Se no Windows só tiver Microsoft Maria para pt-BR, mas tiver Jorge ou Alvaro em espanhol,
  // Don Mateo deve usar a voz masculina em vez da feminina
  const candidateVoices = [
    createMockVoice('Microsoft Maria - Portuguese (Brazil)', 'pt-BR'),
    createMockVoice('Microsoft Jorge - Spanish (Spain)', 'es-ES')
  ];

  const result = VoiceAssistantService.selectMaleVoice('pt-BR', candidateVoices);
  assert.ok(result.voice, 'Deve encontrar uma voz');
  assert.equal(result.voice?.name, 'Microsoft Jorge - Spanish (Spain)');
  assert.equal(result.isExplicitMale, true);
  assert.equal(result.isFemaleFallback, false);
});

test('sinaliza fallback feminino para modulação barítona (0.68) quando não há voz masculina instalada', () => {
  // Cenário extremo: sistema operacional só possui Maria
  const candidateVoices = [
    createMockVoice('Microsoft Maria - Portuguese (Brazil)', 'pt-BR')
  ];

  const result = VoiceAssistantService.selectMaleVoice('pt-BR', candidateVoices);
  assert.ok(result.voice);
  assert.equal(result.voice?.name, 'Microsoft Maria - Portuguese (Brazil)');
  assert.equal(result.isExplicitMale, false);
  assert.equal(result.isFemaleFallback, true, 'Deve sinalizar fallback feminino para transposição de tom barítono');
});

test('base de conhecimento do assistente não contém referências a "3D" nas falas', () => {
  const qPt = VoiceAssistantService.answerFarmerQuery('como plantar tomate?', 'pt-BR');
  assert.ok(!qPt.speakText.toLowerCase().includes('3d'), 'speakText pt não deve conter 3d');
  assert.ok(!qPt.answerText.toLowerCase().includes('3d'), 'answerText pt não deve conter 3d');

  const qEs = VoiceAssistantService.answerFarmerQuery('como plantar locote?', 'es-PY');
  assert.ok(!qEs.speakText.toLowerCase().includes('3d'), 'speakText es não deve conter 3d');
  assert.ok(!qEs.answerText.toLowerCase().includes('3d'), 'answerText es não deve conter 3d');
});
