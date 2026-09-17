import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VoiceAssistantService,
  FEMALE_VOICE_KEYWORDS,
  PT_MALE_KEYWORDS,
  ES_MALE_KEYWORDS,
  ES_LATAM_LOCALES
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
    createMockVoice('pt-br-x-afy-network', 'pt-BR'),
    createMockVoice('es-us-x-sfb-network', 'es-US')
  ];

  for (const voice of femaleVoices) {
    const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => voice.name.toLowerCase().includes(kw));
    assert.ok(isFemale, `A voz ${voice.name} deve ser identificada na lista de exclusão feminina`);
  }
});

test('prioriza es-419 e vozes em espanhol latino sobre espanhol da Espanha', () => {
  const candidateVoices = [
    createMockVoice('Microsoft Jorge - Spanish (Spain)', 'es-ES'),
    createMockVoice('Microsoft Alonso Online (Natural) - Spanish (United States)', 'es-US'),
    createMockVoice('Google español latino (es-419)', 'es-419')
  ];

  const result = VoiceAssistantService.selectMaleVoice('es-419', candidateVoices);
  assert.ok(result.voice, 'Deve encontrar uma voz');
  assert.equal(
    result.voice?.name,
    'Google español latino (es-419)',
    'Deve priorizar voz explicitamente es-419'
  );
  assert.equal(result.isExplicitMale, true);
  assert.equal(result.isFemaleFallback, false);
});

test('prioriza vozes masculinas Google/Natural/Microsoft em espanhol latino', () => {
  const candidateVoices = [
    createMockVoice('Microsoft Sabina - Spanish (Mexico)', 'es-MX'), // Feminina descartada
    createMockVoice('Microsoft Helena - Spanish (Spain)', 'es-ES'), // Feminina descartada
    createMockVoice('Microsoft Jorge - Spanish (Spain)', 'es-ES'), // Espanha masculino
    createMockVoice('Google español de Estados Unidos (es-us-x-sfg#male_1)', 'es-US'), // LatAm Google male
    createMockVoice('Microsoft Carlos Online (Natural) - Spanish (Colombia)', 'es-CO') // LatAm Natural
  ];

  const result = VoiceAssistantService.selectMaleVoice('es-419', candidateVoices);
  assert.ok(result.voice, 'Deve selecionar voz');
  // Ambas as opções LatAm Natural/Google superam Jorge da Espanha
  const isTopLatam =
    result.voice?.name === 'Microsoft Carlos Online (Natural) - Spanish (Colombia)' ||
    result.voice?.name === 'Google español de Estados Unidos (es-us-x-sfg#male_1)';
  assert.ok(isTopLatam, 'Deve priorizar voz masculina em espanhol latino');
  assert.equal(result.isExplicitMale, true);
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

test('seleciona Mateo / Alonso / Jorge em espanhol latino para Don Mateo', () => {
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
  const candidateVoices = [
    createMockVoice('Microsoft Maria - Portuguese (Brazil)', 'pt-BR'),
    createMockVoice('Microsoft Alonso Online (Natural) - Spanish (United States)', 'es-US')
  ];

  const result = VoiceAssistantService.selectMaleVoice('pt-BR', candidateVoices);
  assert.ok(result.voice, 'Deve encontrar uma voz');
  assert.equal(result.voice?.name, 'Microsoft Alonso Online (Natural) - Spanish (United States)');
  assert.equal(result.isExplicitMale, true);
  assert.equal(result.isFemaleFallback, false);
});

test('sinaliza fallback feminino para modulação barítona (0.65) quando não há voz masculina instalada', () => {
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

test('ES_LATAM_LOCALES inclui es-419 e os principais países da América Latina', () => {
  assert.ok(ES_LATAM_LOCALES.includes('es-419'));
  assert.ok(ES_LATAM_LOCALES.includes('es-us'));
  assert.ok(ES_LATAM_LOCALES.includes('es-py'));
  assert.ok(ES_LATAM_LOCALES.includes('es-mx'));
  assert.ok(ES_LATAM_LOCALES.includes('es-ar'));
  assert.ok(ES_LATAM_LOCALES.includes('es-co'));
});
