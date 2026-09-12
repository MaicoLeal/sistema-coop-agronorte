import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  VoiceAssistantService,
  VoiceAssistantResponse
} from '../services/voiceAssistantService';
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
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [lipSyncFrame, setLipSyncFrame] = useState<number>(0);

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

  // Natural Blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4200);
    return () => clearInterval(blinkInterval);
  }, []);

  // Lip-sync oscillation when speaking
  useEffect(() => {
    if (avatarState === 'speaking') {
      const lipInterval = setInterval(() => {
        setLipSyncFrame((prev) => (prev + 1) % 4);
      }, 140);
      return () => clearInterval(lipInterval);
    } else {
      setLipSyncFrame(0);
    }
  }, [avatarState]);

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

  const handleSendMessage = (textToSend?: string) => {
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

    // Simulate thoughtful latency then respond
    setTimeout(() => {
      const response: VoiceAssistantResponse = VoiceAssistantService.answerFarmerQuery(text, lang);

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
    }, 600);
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

  // SVG Facial Rendering for Don Mateo
  const renderMateoFace = (size = 80) => {
    // Lip sync heights based on frame
    const mouthHeight = avatarState === 'speaking' ? [4, 10, 16, 8][lipSyncFrame] : 4;
    const mouthY = avatarState === 'speaking' ? [64, 62, 59, 62][lipSyncFrame] : 64;

    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="transition-transform duration-300"
      >
        <defs>
          <linearGradient id="mateoSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f7c89f" />
            <stop offset="100%" stopColor="#e3a776" />
          </linearGradient>
          <linearGradient id="mateoHat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eed08c" />
            <stop offset="100%" stopColor="#c49a45" />
          </linearGradient>
          <linearGradient id="mateoShirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1f6d24" />
            <stop offset="100%" stopColor="#005410" />
          </linearGradient>
        </defs>

        {/* Torso / Polo Shirt */}
        <path
          d="M 22 84 Q 50 78 78 84 L 88 100 L 12 100 Z"
          fill="url(#mateoShirt)"
        />
        {/* Polo Collar */}
        <polygon points="50,83 40,76 60,76" fill="#144d18" />
        <line x1="50" y1="83" x2="50" y2="98" stroke="#ffffff" strokeWidth="1.5" />

        {/* Neck */}
        <rect x="42" y="68" width="16" height="12" rx="4" fill="#d99966" />

        {/* Head / Face */}
        <ellipse cx="50" cy="54" rx="24" ry="26" fill="url(#mateoSkin)" />

        {/* Ears */}
        <circle cx="26" cy="54" r="5" fill="#d99966" />
        <circle cx="74" cy="54" r="5" fill="#d99966" />

        {/* Straw Hat - Crown */}
        <path
          d="M 30 38 Q 50 20 70 38 Z"
          fill="url(#mateoHat)"
        />
        {/* Hat Ribbon (Green Coop Ribbon) */}
        <path
          d="M 30 38 Q 50 34 70 38 L 71 42 Q 50 38 29 42 Z"
          fill="#005410"
        />
        {/* Hat Brim */}
        <ellipse cx="50" cy="40" rx="34" ry="7" fill="url(#mateoHat)" stroke="#a1782f" strokeWidth="1.2" />

        {/* Eyebrows */}
        <path
          d={avatarState === 'thinking' ? "M 36 46 Q 42 42 46 47" : "M 36 46 Q 42 44 46 46"}
          stroke="#5a3d1c"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={avatarState === 'listening' ? "M 54 47 Q 58 42 64 46" : "M 54 46 Q 58 44 64 46"}
          stroke="#5a3d1c"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes (With Blinking Animation) */}
        {isBlinking ? (
          <>
            <line x1="38" y1="51" x2="44" y2="51" stroke="#2c1a0e" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="56" y1="51" x2="62" y2="51" stroke="#2c1a0e" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="41" cy="51" r="3.2" fill="#2c1a0e" />
            <circle cx="42" cy="50" r="1.1" fill="#ffffff" />
            <circle cx="59" cy="51" r="3.2" fill="#2c1a0e" />
            <circle cx="60" cy="50" r="1.1" fill="#ffffff" />
          </>
        )}

        {/* Friendly Moustache */}
        <path
          d="M 39 61 Q 50 63 61 61 Q 50 58 39 61 Z"
          fill="#4a3118"
        />

        {/* Nose */}
        <path
          d="M 49 53 Q 50 57 47 58 Q 50 59 52 58"
          stroke="#ba7f52"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Animated Mouth */}
        <rect
          x="44"
          y={mouthY}
          width="12"
          height={mouthHeight}
          rx={mouthHeight > 6 ? 5 : 2}
          fill={avatarState === 'speaking' ? '#4a1515' : '#853232'}
        />
        {avatarState === 'speaking' && mouthHeight > 8 && (
          <rect x="46" y={mouthY} width="8" height="3" rx="1.5" fill="#ffffff" />
        )}

        {/* Friendly Rosy Cheeks */}
        <circle cx="33" cy="57" r="4" fill="#e88989" opacity="0.45" />
        <circle cx="67" cy="57" r="4" fill="#e88989" opacity="0.45" />
      </svg>
    );
  };

  return (
    <>
      {/* 🟢 FLOATING AVATAR BUBBLE (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-end gap-3 select-none">
          {/* Proactive Speech Bubble / Tip */}
          {hasProactiveTip && (
            <div className="hidden sm:flex flex-col bg-surface-container-lowest text-on-surface p-3 rounded-2xl shadow-xl border-2 border-primary/30 max-w-xs animate-bounce mb-2 relative">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Don Mateo (Assistente)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasProactiveTip(false);
                  }}
                  className="text-on-surface-variant hover:text-on-surface text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-on-surface leading-snug">
                {isPt
                  ? 'Olá, amigo produtor! Estufas monitoradas. Clique aqui para tirar qualquer dúvida!'
                  : '¡Hola amigo! Invernaderos activos. ¡Tócame aquí para cualquier consulta!'}
              </p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-surface-container-lowest border-r-2 border-b-2 border-primary/30 rotate-45" />
            </div>
          )}

          {/* Avatar Circle Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setHasProactiveTip(false);
              speakText(
                isPt
                  ? 'Olá companheiro! Como posso te ajudar hoje?'
                  : '¡Hola amigo! ¿En qué te puedo ayudar hoy?'
              );
            }}
            className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-b from-primary-container to-primary p-1 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-primary/30 hover:ring-primary/60 flex items-center justify-center overflow-hidden"
            title={t.askMateo}
            aria-label={t.askMateo}
          >
            {/* Animated Face */}
            <div className="w-full h-full rounded-full bg-surface-container-low flex items-center justify-center overflow-hidden">
              {renderMateoFace(72)}
            </div>

            {/* Speaking / Listening Pulse Indicators */}
            {avatarState === 'speaking' && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
              </span>
            )}

            {/* Badge Indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
              Don Mateo
            </div>
          </button>
        </div>
      )}

      {/* 💬 EXPANDED ASSISTANT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-on-surface/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header with Don Mateo Avatar */}
            <div className="bg-linear-to-r from-primary to-primary-container p-4 text-on-primary flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3.5">
                {/* Large Interactive Face */}
                <div className="relative w-14 h-14 rounded-full bg-surface-container-low ring-2 ring-on-primary/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {renderMateoFace(56)}
                  {avatarState === 'listening' && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-pulse">
                      <Mic className="w-5 h-5 text-on-primary" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold leading-tight">Don Mateo</h3>
                    <span className="bg-primary-fixed/25 text-on-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-on-primary/20">
                      {t.avatarRole}
                    </span>
                  </div>
                  <p className="text-xs text-on-primary/80 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                    {avatarState === 'speaking'
                      ? isPt ? 'Falando com voz masculina...' : 'Hablando con voz masculina...'
                      : avatarState === 'listening'
                      ? isPt ? 'Ouvindo sua voz...' : 'Escuchando tu voz...'
                      : avatarState === 'thinking'
                      ? isPt ? 'Pensando na recomendação...' : 'Analizando tu consulta...'
                      : isPt ? 'Pronto para tirar dúvidas' : 'Listo para ayudarte'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-on-primary/10 active:bg-on-primary/20 text-on-primary transition-colors cursor-pointer"
                title={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Playback Controls Banner */}
            {avatarState === 'speaking' && (
              <div className="bg-secondary-container/40 border-b border-secondary/20 px-4 py-2 flex items-center justify-between text-xs text-on-secondary-container animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                  <span className="font-semibold">
                    {isPt ? 'Reproduzindo resposta em voz...' : 'Reproduciendo en audio...'}
                  </span>
                </div>
                <button
                  onClick={handleStopSpeaking}
                  className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-highest hover:bg-surface-container text-on-surface rounded-full font-bold cursor-pointer transition-colors"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{isPt ? 'Parar Áudio' : 'Detener'}</span>
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
