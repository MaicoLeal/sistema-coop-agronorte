import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  VoiceAssistantService,
  VoiceAssistantResponse
} from '../services/voiceAssistantService';
import { requestLocalFarmerAnswer } from '../services/localAiService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Sparkles,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DonMateo3DAvatar, AvatarState } from './DonMateo3D/DonMateo3DAvatar';
import { DonMateoThreeScene } from './DonMateo3D/DonMateoThreeScene';

interface ProducerAvatarProps {
  lang: Language;
  onOpenHarvest?: () => void;
  onOpenPestDiagnosis?: () => void;
  onOpenGreenhouses?: () => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'mateo' | 'user';
  text: string;
  time: string;
  speakText?: string;
  actionType?: 'open_harvest' | 'open_pest_diagnosis' | 'show_greenhouses' | 'none';
}

export const ProducerAvatar: React.FC<ProducerAvatarProps> = ({
  lang,
  onOpenHarvest,
  onOpenPestDiagnosis,
  onOpenGreenhouses,
  isOpenExternal = false,
  onCloseExternal
}) => {
  const t = translations[lang];
  const isPt = lang === 'pt-BR';

  // Modal open state
  const [isOpen, setIsOpen] = useState<boolean>(isOpenExternal);
  const [hasProactiveTip, setHasProactiveTip] = useState<boolean>(true);

  // Sync external open state if passed
  useEffect(() => {
    if (isOpenExternal) {
      setIsOpen(true);
    }
  }, [isOpenExternal]);

  // Avatar Animation States
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [view3DMode, setView3DMode] = useState<'photo3d' | 'webgl3d'>('photo3d');
  const [showStudioStage, setShowStudioStage] = useState<boolean>(true);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void; isSupported: boolean } | null>(null);

  // Initialize welcoming message
  useEffect(() => {
    const initialGreeting = isPt
      ? 'Olá, companheiro! Sou o Don Mateo, seu assistente técnico aqui da Coop Agronorte. Estou de olho nas suas estufas e pronto para te ajudar. O que você gostaria de saber ou fazer agora?'
      : '¡Hola, amigo productor! Soy Don Mateo, tu asistente técnico de la Coop Agronorte. Estoy cuidando tus invernaderos y listo para ayudarte. ¿Qué te gustaría consultar o hacer hoy?';

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'mateo',
        text: initialGreeting,
        speakText: initialGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [lang]);

  // Lip-sync handled inside DonMateo3DAvatar / DonMateoThreeScene

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Setup speech recognition
  useEffect(() => {
    const rec = VoiceAssistantService.createSpeechRecognition(
      lang,
      (transcript) => {
        setIsListening(false);
        setAvatarState('thinking');
        handleSendMessage(transcript);
      },
      () => {
        setIsListening(false);
        setAvatarState('idle');
      },
      () => {
        setIsListening(false);
      }
    );

    recognitionRef.current = rec;
    setSpeechSupported(rec.isSupported);

    return () => {
      rec.stop();
      VoiceAssistantService.stop();
    };
  }, [lang]);

  const speakText = (text: string) => {
    setAvatarState('speaking');
    VoiceAssistantService.speak(
      text,
      lang,
      () => setAvatarState('speaking'),
      () => setAvatarState('idle')
    );
  };

  const handleStopSpeaking = () => {
    VoiceAssistantService.stop();
    setAvatarState('idle');
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      handleStopSpeaking();
      setIsListening(true);
      setAvatarState('listening');
      recognitionRef.current?.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setAvatarState('thinking');

    let response: VoiceAssistantResponse;

    try {
      response = await requestLocalFarmerAnswer({
        query: text,
        language: lang,
      });
    } catch (error) {
      console.warn('Ollama indisponível; usando respostas locais básicas.', error);
      response = VoiceAssistantService.answerFarmerQuery(text, lang);
    }

    const mateoMsg: ChatMessage = {
      id: `mateo-${Date.now()}`,
      sender: 'mateo',
      text: response.answerText,
      speakText: response.speakText,
      actionType: response.actionType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, mateoMsg]);
    speakText(response.speakText);

    // Trigger visual action callbacks if requested
    if (response.actionType === 'open_harvest' && onOpenHarvest) {
      setTimeout(() => onOpenHarvest(), 2200);
    } else if (response.actionType === 'open_pest_diagnosis' && onOpenPestDiagnosis) {
      setTimeout(() => onOpenPestDiagnosis(), 2200);
    } else if (response.actionType === 'show_greenhouses' && onOpenGreenhouses) {
      setTimeout(() => onOpenGreenhouses(), 2200);
    }
  };

  const handleClose = () => {
    handleStopSpeaking();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const quickQuestions = isPt
    ? [
        '🌿 Como estão as estufas agora?',
        '📦 Como registro a colheita?',
        '🍂 Folhas com manchas brancas',
        '🌡️ O que é o tal de VPD?'
      ]
    : [
        '🌿 ¿Cómo están los invernaderos?',
        '📦 ¿Cómo registro la cosecha?',
        '🍂 Hojas con manchas o polvo blanco',
        '🌡️ ¿Qué significa el VPD?'
      ];

  return (
    <>
      {/* 🟢 FLOATING 3D AVATAR BUBBLE (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-end gap-3 select-none">
          {/* Proactive Speech Bubble / Tip */}
          {hasProactiveTip && (
            <div className="hidden sm:flex flex-col bg-surface-container-lowest text-on-surface p-3.5 rounded-2xl shadow-2xl border-2 border-emerald-500/40 max-w-xs animate-bounce mb-2 relative backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Don Mateo (Assistente 3D)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasProactiveTip(false);
                  }}
                  className="text-on-surface-variant hover:text-on-surface text-xs p-0.5 rounded-full hover:bg-black/5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-on-surface leading-snug font-medium">
                {isPt
                  ? 'Olá, amigo produtor! Estufas monitoradas em tempo real. Toque aqui para tirar dúvidas com voz ou texto!'
                  : '¡Hola amigo! Invernaderos activos en tiempo real. ¡Tócame aquí para cualquier consulta!'}
              </p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-surface-container-lowest border-r-2 border-b-2 border-emerald-500/40 rotate-45" />
            </div>
          )}

          {/* 3D Realistic Avatar Floating Button */}
          <button
            id="btn-don-mateo-floating"
            type="button"
            onClick={() => {
              setIsOpen(true);
              setHasProactiveTip(false);
              speakText(
                isPt
                  ? 'Olá companheiro! Sou o Don Mateo, seu assistente técnico em 3D. Como posso te ajudar hoje?'
                  : '¡Hola amigo! Soy Don Mateo, tu asistente técnico en 3D. ¿En qué te puedo ajudar hoy?'
              );
            }}
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-hidden bg-transparent border-0 p-0"
            title={t.askMateo}
            aria-label={t.askMateo}
          >
            <DonMateo3DAvatar
              size="md"
              state={avatarState}
              showBadge={true}
              interactive={true}
            />
          </button>
        </div>
      )}

      {/* 💬 EXPANDED 3D ASSISTANT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-stone-950 p-3.5 text-white flex items-center justify-between shrink-0 shadow-md border-b border-emerald-700/40">
              <div className="flex items-center gap-3">
                <DonMateo3DAvatar size="sm" state={avatarState} showBadge={false} interactive={false} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold leading-tight">Don Mateo</h3>
                    <span className="bg-emerald-600/50 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                      {isPt ? 'Eng. Agrônomo 3D' : 'Ing. Agrónomo 3D'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {avatarState === 'speaking'
                      ? isPt ? 'Falando com voz masculina...' : 'Hablando con voz masculina...'
                      : avatarState === 'listening'
                      ? isPt ? 'Ouvindo sua voz...' : 'Escuchando tu voz...'
                      : avatarState === 'thinking'
                      ? isPt ? 'Analisando estufas e dados...' : 'Analizando tu consulta...'
                      : isPt ? 'Assistente 3D pronto' : 'Asistente 3D listo'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 3D Mode Toggle Switch */}
                <div className="flex items-center bg-black/50 rounded-full p-0.5 border border-emerald-500/30 text-xs">
                  <button
                    onClick={() => setView3DMode('photo3d')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      view3DMode === 'photo3d'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                    title="Modo Digital Human 3D Realista"
                  >
                    Digital 3D
                  </button>
                  <button
                    onClick={() => setView3DMode('webgl3d')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      view3DMode === 'webgl3d'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                    title="Modo Estúdio WebGL Three.js"
                  >
                    WebGL 3D
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 text-white transition-colors cursor-pointer"
                  title={t.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3D Interactive Stage / Viewport */}
            {showStudioStage && (
              <div className="relative bg-stone-950 p-4 shrink-0 flex flex-col items-center justify-center border-b border-emerald-900/50">
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-radial from-emerald-900/30 via-transparent to-transparent pointer-events-none" />

                {view3DMode === 'photo3d' ? (
                  <div className="flex flex-col items-center py-1">
                    <DonMateo3DAvatar
                      size="lg"
                      state={avatarState}
                      showBadge={true}
                      interactive={true}
                      onClick={() => {
                        if (avatarState === 'speaking') {
                          handleStopSpeaking();
                        } else {
                          toggleListening();
                        }
                      }}
                    />
                    <div className="mt-3.5 flex items-center gap-2 text-[11px] text-emerald-400/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{isPt ? 'Mova o mouse para explorar a perspectiva 3D do Don Mateo' : 'Mueve el cursor para explorar perspectiva 3D'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <DonMateoThreeScene state={avatarState} className="w-full h-44 sm:h-48" />
                  </div>
                )}

                {/* Quick Action Shortcuts inside 3D Studio */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap w-full z-10">
                  {onOpenGreenhouses && (
                    <button
                      onClick={() => {
                        onOpenGreenhouses();
                        handleClose();
                      }}
                      className="px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-medium border border-emerald-700/40 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      🌿 {isPt ? 'Monitorar Estufas' : 'Invernaderos'}
                    </button>
                  )}
                  {onOpenHarvest && (
                    <button
                      onClick={() => {
                        onOpenHarvest();
                        handleClose();
                      }}
                      className="px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-medium border border-emerald-700/40 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      📦 {isPt ? 'Registrar Colheita' : 'Registrar Cosecha'}
                    </button>
                  )}
                  {onOpenPestDiagnosis && (
                    <button
                      onClick={() => {
                        onOpenPestDiagnosis();
                        handleClose();
                      }}
                      className="px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-medium border border-emerald-700/40 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      🔬 {isPt ? 'Diagnóstico IA' : 'Diagnóstico IA'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Audio Playback Controls Banner */}
            {avatarState === 'speaking' && (
              <div className="bg-emerald-950/80 border-b border-emerald-700/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-semibold">
                    {isPt ? 'Don Mateo respondendo em voz...' : 'Don Mateo hablando en audio...'}
                  </span>
                </div>
                <button
                  onClick={handleStopSpeaking}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-full font-bold cursor-pointer transition-colors"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{isPt ? 'Pausar Áudio' : 'Detener'}</span>
                </button>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface/50 text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-xs'
                        : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-current/10 text-[10px] opacity-70">
                      <span>{msg.time}</span>
                      {msg.sender === 'mateo' && (
                        <button
                          onClick={() => speakText(msg.speakText || msg.text)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{t.audioListenResponse}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Question Chips for Farmers */}
            <div className="px-4 py-2.5 bg-surface-container-low border-t border-outline-variant/20 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1.5 bg-surface-container-lowest hover:bg-primary-container hover:text-on-primary-container text-on-surface text-xs font-medium rounded-full border border-outline-variant/40 shrink-0 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Footer Input & Mic Bar */}
            <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center gap-2 shrink-0">
              {/* Mic / Voice Input Button (Large for farmers) */}
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-full transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center ${
                    isListening
                      ? 'bg-error text-on-error animate-pulse ring-4 ring-error/30'
                      : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                  }`}
                  title={isListening ? 'Parar gravação' : t.tapToSpeak}
                  aria-label={t.tapToSpeak}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={isListening ? t.listeningVoice : t.typeYourQuestion}
                disabled={isListening}
                className="flex-1 bg-surface-container-high border border-outline-variant/40 rounded-full px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-3 rounded-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-md shrink-0"
                title={t.confirm}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
