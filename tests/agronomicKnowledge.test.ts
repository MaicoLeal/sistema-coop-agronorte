import assert from 'node:assert/strict';
import test from 'node:test';

import { VoiceAssistantService } from '../src/services/voiceAssistantService';
import {
  AGRONOMIC_KNOWLEDGE_BASE,
  findAgronomicAnswer,
  normalizeAgronomicText,
} from '../src/data/agronomicKnowledgeBase';

test('base de conhecimento possui itens para todas as categorias essenciais', () => {
  const categories = new Set(AGRONOMIC_KNOWLEDGE_BASE.map((item) => item.category));
  assert.ok(categories.has('hidroponia'), 'Deve conter categoria hidroponia');
  assert.ok(categories.has('tomate'), 'Deve conter categoria tomate');
  assert.ok(categories.has('pimentao'), 'Deve conter categoria pimentão (locote)');
  assert.ok(categories.has('agricultura_estufas'), 'Deve conter categoria agricultura_estufas');
  assert.ok(categories.has('colheita_operacao'), 'Deve conter categoria colheita_operacao');
});

test('normalização de texto remove acentos e caracteres especiais', () => {
  const normalized = normalizeAgronomicText('🍅 Como podar o pimentão verde & tomateiro?');
  assert.equal(normalized, 'como podar o pimentao verde tomateiro');
});

test('responde dúvidas sobre hidroponia com parâmetros de pH e condutividade (EC)', () => {
  const resPh = VoiceAssistantService.answerFarmerQuery('Qual o pH ideal na hidroponia?', 'pt-BR');
  assert.ok(resPh.answerText.includes('5.8 e 6.2'), 'Deve orientar a faixa de pH 5.8 a 6.2');
  assert.ok(resPh.answerText.includes('ácido'), 'Deve mencionar correção com ácidos');

  const resEc = VoiceAssistantService.answerFarmerQuery('Como controlar a condutividade elétrica EC?', 'pt-BR');
  assert.ok(resEc.answerText.includes('condutividade') || resEc.answerText.includes('EC'), 'Deve explicar EC');
});

test('responde sobre cultivo e desbrota do tomate sem repetir mensagem genérica', () => {
  const resTomato = VoiceAssistantService.answerFarmerQuery('Como fazer a desbrota do tomate?', 'pt-BR');
  assert.ok(resTomato.answerText.includes('axilares') || resTomato.answerText.includes('ladrões'), 'Deve mencionar brotos ladrões/axilares');
  assert.ok(!resTomato.answerText.includes('Sou o Don Mateo, seu assistente da Coop Agronorte. Posso te ajudar a conferir a água'), 'Não deve retornar a saudação repetitiva');
});

test('responde sobre podridão apical / fundo preto indicando deficiência de cálcio', () => {
  const resBlossom = VoiceAssistantService.answerFarmerQuery('O que fazer com o fundo preto no tomate?', 'pt-BR');
  assert.ok(resBlossom.answerText.includes('Cálcio') || resBlossom.answerText.includes('calcio'), 'Deve associar ao cálcio');
  assert.equal(resBlossom.actionType, 'open_pest_diagnosis');
});

test('responde sobre pimentão verde e retirada obrigatória da flor rei', () => {
  const resPepper = VoiceAssistantService.answerFarmerQuery('Preciso tirar a primeira flor do pimentão?', 'pt-BR');
  assert.ok(resPepper.answerText.includes('flor rei') || resPepper.answerText.includes('primeira bifurcação'), 'Deve explicar a flor rei');
  assert.ok(resPepper.speakText.includes('flor rei') || resPepper.speakText.includes('flor'), 'O áudio deve mencionar a flor');
});

test('responde sobre colheita do pimentão verde (locote)', () => {
  const resHarvest = VoiceAssistantService.answerFarmerQuery('Qual o ponto de colheita do locote verde?', 'pt-BR');
  assert.ok(resHarvest.answerText.includes('verde') && (resHarvest.answerText.includes('pedúnculo') || resHarvest.answerText.includes('brilhante')), 'Deve descrever frutos verdes e pedúnculo');
  assert.equal(resHarvest.actionType, 'open_harvest');
});

test('suporta consultas em Espanhol do Paraguai para locote e tomate', () => {
  const resLocoteEs = VoiceAssistantService.answerFarmerQuery('¿Cómo podar la flor rey del locote?', 'es-PY');
  assert.ok(resLocoteEs.answerText.includes('flor rey') || resLocoteEs.answerText.includes('locote'), 'Deve responder em espanhol sobre flor rey do locote');

  const resTomateEs = VoiceAssistantService.answerFarmerQuery('¿Cómo cultivar tomate en invernadero?', 'es-PY');
  assert.ok(resTomateEs.answerText.includes('tomate') && resTomateEs.answerText.includes('sustrato'), 'Deve responder em espanhol sobre tomate');
});

test('perguntas distintas produzem respostas distintas (evita efeito de repetição)', () => {
  const r1 = VoiceAssistantService.answerFarmerQuery('Como cultivar tomate?', 'pt-BR');
  const r2 = VoiceAssistantService.answerFarmerQuery('Como podar o pimentão verde?', 'pt-BR');
  const r3 = VoiceAssistantService.answerFarmerQuery('O que é hidroponia NFT?', 'pt-BR');
  const r4 = VoiceAssistantService.answerFarmerQuery('O que é VPD?', 'pt-BR');

  assert.notEqual(r1.answerText, r2.answerText, 'Tomate e pimentão devem ter respostas diferentes');
  assert.notEqual(r2.answerText, r3.answerText, 'Pimentão e hidroponia devem ter respostas diferentes');
  assert.notEqual(r3.answerText, r4.answerText, 'Hidroponia e VPD devem ter respostas diferentes');
});

test('fallback contextual não repete a saudação inicial e oferece os tópicos disponíveis', () => {
  const resUnknown = VoiceAssistantService.answerFarmerQuery('qual a receita do bolo de cenoura', 'pt-BR');
  assert.ok(!resUnknown.answerText.includes('Olá, produtor! Sou o Don Mateo, seu assistente da Coop Agronorte. Posso te ajudar a conferir a água'), 'Não deve repetir a saudação padrão');
  assert.ok(resUnknown.answerText.includes('Cultivo de Tomate') && resUnknown.answerText.includes('Cultivo de Pimentão Verde'), 'Deve apresentar as opções temáticas da cooperativa');
});
