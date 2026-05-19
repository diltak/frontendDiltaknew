"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AvatarController, useTTSLipSync } from "@/components/avatar";
import AvatarSettings, { useAvatarSettings } from "@/components/avatar/AvatarSettings";
import AzureAvatar, { type AzureAvatarHandle } from "@/components/avatar/AzureAvatar";
import AzureAvatarSelector from "@/components/avatar/AzureAvatarSelector";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import VoiceCallUI from "@/components/voice-call/VoiceCallUI";
import { apiPost } from '@/lib/api-client';

import {
  Send,
  Bot,
  User,
  PhoneOff,
  Loader2,
  FileText,
  Sparkles,
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Play,
  Pause,
  Search,
  Menu,
  Brain,
  Paperclip,
  Image as ImageIcon,
  X,
  Upload,
  UserCircle, // Replace User3D with UserCircle
  Settings,
  CheckCircle,
  Heart,
  Plus,
} from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { useNavigationGuard } from '@/contexts/navigation-guard-context';
import { toast } from "sonner";
import type { ChatMessage } from "@/types/index";
import ReactMarkdown from "react-markdown";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Audio recording utilities with silence detection
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private silenceStartTime: number = 0;
  private isDetectingSilence: boolean = false;
  private onSilenceDetected: (() => void) | null = null;

  async startRecording(onSilenceDetected?: () => void): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];
      this.onSilenceDetected = onSilenceDetected || null;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second

      // Set up silence detection
      if (onSilenceDetected) {
        this.setupSilenceDetection();
      }

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      return false;
    }
  }

  private setupSilenceDetection() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.microphone = this.audioContext.createMediaStreamSource(this.stream!);
      this.microphone.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isDetectingSilence = true;
      this.silenceStartTime = Date.now();

      const checkSilence = () => {
        if (!this.isDetectingSilence || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const threshold = 20; // Adjust this value to change sensitivity (lower = more sensitive)

        if (average < threshold) {
          // Silence detected
          const silenceDuration = Date.now() - this.silenceStartTime;
          if (silenceDuration >= 3000 && this.onSilenceDetected) {
            // 3 seconds of silence - trigger processing
            this.onSilenceDetected();
            this.isDetectingSilence = false;
            return;
          }
        } else {
          // Sound detected - reset silence timer
          this.silenceStartTime = Date.now();
        }

        if (this.isDetectingSilence) {
          requestAnimationFrame(checkSilence);
        }
      };

      checkSilence();
    } catch (error) {
      console.error("Error setting up silence detection:", error);
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    this.isDetectingSilence = false;
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.onSilenceDetected = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

// The final report structure
interface WellnessReport {
  mood: number;
  stress_score: number;
  anxious_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  energy_level: number;
  confident_level: number;
  sleep_quality: number;
  complete_report: string;
  session_type: "text" | "voice";
  session_duration: number;
  key_insights: string[];
  recommendations: string[];
}

// Helper function to calculate risk level based on report data
const calculateRiskLevel = (
  report: WellnessReport
): "low" | "medium" | "high" => {
  const riskFactors = [
    report.stress_score >= 8 ? 2 : report.stress_score >= 6 ? 1 : 0,
    report.anxious_level >= 8 ? 2 : report.anxious_level >= 6 ? 1 : 0,
    report.mood <= 3 ? 2 : report.mood <= 5 ? 1 : 0,
    report.energy_level <= 3 ? 1 : 0,
    report.work_satisfaction <= 3 ? 1 : 0,
    report.sleep_quality <= 3 ? 1 : 0,
    report.confident_level <= 3 ? 1 : 0,
  ];

  const totalRisk = riskFactors.reduce((sum, factor) => sum + factor, 0);

  if (totalRisk >= 6) return "high";
  if (totalRisk >= 3) return "medium";
  return "low";
};

// ── Thinking messages (rotate sequentially while AI responds) ────────────────
const thinkingMessages = [
  "AI is thinking...",
  "Analyzing your message...",
  "Understanding context...",
  "Reflecting on your feelings...",
  "Generating thoughtful response...",
  "Considering the best advice...",
  "Processing emotional tone...",
  "Drawing insights from conversation...",
  "Forming empathetic reply...",
  "Thinking deeply about this...",
  "Connecting the dots...",
  "Preparing a supportive response...",
  "Crafting personalized advice...",
  "Almost there...",
  "Refining my thoughts...",
];

export default function EmployeeChatPage() {
  const { user, loading: userLoading } = useAuth();
  const { registerGuard } = useNavigationGuard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<WellnessReport | null>(
    null
  );

  // Uma agent session tracking
  const [umaSessionId, setUmaSessionId] = useState<string | null>(null);

  // Voice/Call state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAvatarMode, setIsAvatarMode] = useState(false); // Disabled by default to prevent navigation blocking

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Keep refs in sync with state for callbacks (must be after state declarations)
  // Cycle thinking messages every 2.5 s while loading
  useEffect(() => {
    if (!loading) { setThinkingIndex(0); return; }
    const id = setInterval(() => {
      setThinkingIndex(prev => (prev + 1) % thinkingMessages.length);
    }, 2500);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  useEffect(() => {
    isAvatarModeRef.current = isAvatarMode;
  }, [isAvatarMode]);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);

  // Avatar state
  const [currentAvatarEmotion, setCurrentAvatarEmotion] = useState<string>("");
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Azure Avatar state
  const azureAvatarRef = useRef<AzureAvatarHandle>(null);
  const [selectedAvatarCharacter, setSelectedAvatarCharacter] = useState("lisa");
  const [azureAvatarConnected, setAzureAvatarConnected] = useState(false);
  const [azureAvatarSpeaking, setAzureAvatarSpeaking] = useState(false);
  const isAvatarModeRef = useRef(isAvatarMode);

  // Avatar Settings
  const { config: avatarConfig, updateConfig: updateAvatarConfig, isOpen: isSettingsOpen, toggleSettings } = useAvatarSettings();
  
  // Enhanced TTS with lip sync
  const { speak: speakWithLipSync, stop: stopTTS, isPlaying: isTTSPlaying } = useTTSLipSync();
  const [currentTTSText, setCurrentTTSText] = useState<string>("");
  const [lastAIMessage, setLastAIMessage] = useState<string>("");

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Navigation guard state
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showNavGuardModal, setShowNavGuardModal] = useState(false);

  // Derived: guard is active when session has 6+ messages and hasn't ended
  const isGuardActive = messages.length >= 6 && !sessionEnded;

  // Greeting dialog state
  const [showGreetingDialog, setShowGreetingDialog] = useState(false);
  const [greetingShown, setGreetingShown] = useState(false);

  // Predefined starting messages
  const predefinedMessages = [
    "Hello! How are you today?",
    "I'd like to talk about my feelings",
    "I need some support right now",
    "Can you help me with stress management?",
  ];
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [processingAudio, setProcessingAudio] = useState(false);
  // Inline STT mic (ChatGPT-style) — separate from voice-call mode
  const [isSttRecording, setIsSttRecording] = useState(false);

  // Options panel state
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showMinMessagesAlert, setShowMinMessagesAlert] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Custom navigation handler — intercepts navigation when guard is active
  const handleNavigation = (path: string) => {
    if (isGuardActive) {
      // Guard is active: show confirmation modal (ignore if already open)
      if (!showNavGuardModal) {
        setPendingNavigation(path);
        setShowNavGuardModal(true);
      }
      return;
    }
    // Guard is not active: deactivate avatar if needed and navigate immediately
    if (isAvatarMode) {
      setIsAvatarMode(false);
    }
    router.push(path);
  };

  // End conversation and then navigate to the intercepted destination
  const handleNavGuardLeave = async () => {
    setShowNavGuardModal(false);
    const destination = pendingNavigation;
    setPendingNavigation(null);
    if (isAvatarMode) setIsAvatarMode(false);
    // Generate the wellness report first, then navigate
    await handleEndSession();
    if (destination) {
      router.push(destination);
    }
  };

  // Cancel leaving: close modal and stay on the chat page
  const handleNavGuardStay = () => {
    setShowNavGuardModal(false);
    setPendingNavigation(null);
  };

  // Register/remove beforeunload listener based on guard active state
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    if (isGuardActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGuardActive]);

  // Register navigation guard with the context so sidebar links are intercepted
  useEffect(() => {
    if (!isGuardActive) return;

    const cleanup = registerGuard((destination: string) => {
      // Block navigation and show the confirmation modal
      if (!showNavGuardModal) {
        setPendingNavigation(destination);
        setShowNavGuardModal(true);
      }
      return false; // block
    });

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuardActive, registerGuard]);

  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoListenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isVoiceModeRef = useRef(false);
  const audioEnabledRef = useRef(true);
  const [showClosedCaptions, setShowClosedCaptions] = useState(false);

  useEffect(() => {
    // Allow demo access without authentication
    if (!userLoading) {
      if (!user) {
        // Demo mode - continue without user
        console.log("Demo mode: No authentication required");
      }
    }
    if (user) {
      (async () => {
        await initializeChat();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show greeting dialog when chat is initialized
  useEffect(() => {
    if (sessionId && !greetingShown && messages.length > 0) {
      setShowGreetingDialog(true);
      setGreetingShown(true);
    }
  }, [sessionId, greetingShown, messages.length]);

  // Avatar loading timeout to prevent infinite loading
  useEffect(() => {
    if (isAvatarMode && !avatarLoaded && !avatarLoadError) {
      const timeout = setTimeout(() => {
        if (!avatarLoaded) {
          console.warn('Avatar loading timeout - this may indicate a loading issue');
          setAvatarLoaded(true); // Set as loaded to prevent continuous attempts
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isAvatarMode, avatarLoaded, avatarLoadError]);

  // Cleanup avatar when deactivated
  useEffect(() => {
    if (!isAvatarMode) {
      // Force cleanup of avatar resources
      stopTTS();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      // Reset avatar state
      setCurrentAvatarEmotion("");
      setAvatarLoaded(false);
      setAvatarLoadError(false);
    }
  }, [isAvatarMode, stopTTS]);

  // Call timer
  useEffect(() => {
    if (isVoiceMode && callStartTime) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(
          Math.floor((Date.now() - callStartTime.getTime()) / 1000)
        );
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isVoiceMode, callStartTime]);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (chatContainerRef.current) {
        // Fallback: scroll the container to bottom
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Stop whatever audio is currently playing (ElevenLabs, browser TTS, or lip-sync hook)
  const stopCurrentAudio = () => {
    stopTTS();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // TTS: fetch audio from ElevenLabs, play immediately, then auto-listen
  const speakText = async (text: string) => {
    if (!audioEnabledRef.current) return;

    // Stop anything already playing
    stopCurrentAudio();

    setCurrentTTSText(text);
    setIsSpeaking(true);

    // Auto-listen after speech ends (shared by both ElevenLabs and fallback)
    const scheduleAutoListen = () => {
      if (!isVoiceModeRef.current || !audioEnabledRef.current) return;
      if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
      autoListenTimerRef.current = setTimeout(() => {
        if (isVoiceModeRef.current && !isRecording) {
          startRecording().catch(() => {});
        }
      }, 400);
    };

    // --- Azure Avatar TTS: when avatar mode is on and connected, let Azure handle speech + lip sync ---
    if (isAvatarModeRef.current && azureAvatarRef.current?.isConnected()) {
      try {
        await azureAvatarRef.current.speak(text);
        setIsSpeaking(false);
        scheduleAutoListen();
        return;
      } catch (err) {
        console.error('Azure Avatar speak failed, falling back to normal TTS:', err);
        // Fall through to normal TTS
      }
    }

    // Browser built-in TTS fallback (no API key needed)
    const speakWithBrowser = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setIsSpeaking(false);
        scheduleAutoListen();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      // Pick a natural-sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && !v.localService) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => { setIsSpeaking(false); scheduleAutoListen(); };
      utterance.onerror = () => { setIsSpeaking(false); scheduleAutoListen(); };
      window.speechSynthesis.speak(utterance);
    };

    let audioUrl: string | null = null;

    try {
      // Skip emotion pre-processing (addEmotion: false) for lower latency
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, addEmotion: false }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error || `TTS HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      if (!audioBlob.size) throw new Error('Empty audio response');

      audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
        scheduleAutoListen();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
        scheduleAutoListen();
      };

      // Play immediately — no canplaythrough wait needed
      await audio.play();
    } catch (error: any) {
      console.error('ElevenLabs TTS failed, falling back to browser TTS:', error?.message);
      setIsSpeaking(false);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioPlayerRef.current = null;

      // Fallback: use browser's built-in speech synthesis
      setIsSpeaking(true);
      speakWithBrowser();
    }
  };

  // Audio recording controls (moved to enhanced version below)

  const processAudioMessage = async (audioBlob: Blob) => {
    try {
      console.log('🎙️ Processing audio message...', { blobSize: audioBlob.size, blobType: audioBlob.type });
      
      // Ensure the blob has the correct MIME type for webm
      const blobWithType = audioBlob.type 
        ? audioBlob 
        : new Blob([audioBlob], { type: 'audio/webm;codecs=opus' });
      
      // Convert audio to text using Whisper API
      const formData = new FormData();
      // Create a File object with proper name and type for OpenAI Whisper
      const audioFile = new File(
        [blobWithType],
        'recording.webm',
        { type: 'audio/webm' }
      );
      formData.append("audio", audioFile, "recording.webm");

      console.log('📤 Sending audio to transcription API...');
      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json().catch(() => ({ error: 'Failed to transcribe audio' }));
        throw new Error(errorData.error || "Failed to transcribe audio");
      }
      
      const { text } = await transcriptionResponse.json();
      console.log('📝 Transcription received:', text);
      
      if (text && text.trim()) {
        setCurrentMessage(text);
        console.log('💬 Sending transcribed text to AI...');
        await handleSendMessage(text);
        // Processing is complete - the AI response will be spoken automatically
        setProcessingAudio(false);
        console.log('✅ Audio processing complete, waiting for AI response...');
      } else {
        console.warn('⚠️ No speech detected in recording');
        toast.error("No speech detected in recording");
        setProcessingAudio(false);
      }
    } catch (error) {
      console.error("❌ Error processing audio:", error);
      toast.error("Failed to process audio message");
      setProcessingAudio(false);
    }
  };

  // Call controls
  const startCall = async () => {
    setIsVoiceMode(true);
    setCallStartTime(new Date());
    setCallDuration(0);
    setAudioEnabled(true);
    setShowVoiceInstructions(false); // Hide instructions for autonomous mode
    
    // Greet the user and start voice loop
    if (sessionId) {
      const voiceWelcome = "I'm here to listen. Please share whatever is on your mind.";
      await addMessageToDb(voiceWelcome, "ai", sessionId);
      // speakText → onended → startRecording automatically (the loop)
      speakText(voiceWelcome);
    } else {
      // No session yet — start listening immediately
      setTimeout(() => startRecording().catch(() => {}), 600);
    }
    
    toast.success("🎙️ Voice call started! I'm listening...", {
      duration: 3000,
      icon: '🎙️',
    });
  };

  const endCall = async () => {
    setIsVoiceMode(false);
    setCallStartTime(null);
    setCallDuration(0);

    setIsRecording(false);
    setProcessingAudio(false);
    stopCurrentAudio();
    
    // Clear all timers
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
      autoListenTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    toast.info("Call ended - generating report...");
    await handleEndSession();
  };

  // Format call duration
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const initializeChat = async () => {
    if (!user) return;
    try {
      const newId = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setSessionId(newId);

      const welcomeMessageContent = `Hello ${user!.first_name || "there"}! How are you?`;
      setMessages([{
        id: `${newId}-welcome`,
        sender: "ai",
        content: welcomeMessageContent,
        timestamp: new Date().toISOString(),
      } as ChatMessage]);
    } catch (error: any) {
      console.error("Error creating chat session:", error);
      toast.error("Failed to initialize chat session.");
    }
  };

  const addMessageToDb = async (
    content: string,
    sender: "user" | "ai",
    currentSessionId: string,
  ) => {
    if (!currentSessionId) return;
    const id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMessages(prev => [...prev, {
      id,
      sender,
      content,
      timestamp: new Date().toISOString(),
    } as ChatMessage]);
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`);
        return;
      }

      if (!supportedTypes.includes(file.type)) {
        errors.push(`${file.name} has unsupported file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(`Some files couldn't be added: ${errors.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} file(s)`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to render message content with file attachments
  const renderMessageContent = (content: string) => {
    // Check if message contains file attachment indicators
    const fileAttachmentRegex = /📎\s+([^\n,]+)/g;
    const hasAttachments = fileAttachmentRegex.test(content);

    if (hasAttachments) {
      const parts = content.split('\n\nAttached files:');
      const messageText = parts[0];
      const fileList = parts[1];

      return (
        <div>
          {messageText && (
            <div className="prose prose-sm max-w-none mb-2">
              <ReactMarkdown>{messageText}</ReactMarkdown>
            </div>
          )}
          {fileList && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <Paperclip className="h-3 w-3" />
                <span className="font-medium">Attachments:</span>
              </div>
              <div className="mt-1 text-gray-700">{fileList}</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageContent = messageText || currentMessage;
    if ((!messageContent.trim() && attachedFiles.length === 0) || !sessionId || loading || sessionEnded) return;

    setCurrentMessage("");
    setLoading(true);

    // Create message content with file info
    let fullMessageContent = messageContent;
    if (attachedFiles.length > 0) {
      const fileList = attachedFiles.map(f => `📎 ${f.name}`).join(', ');
      fullMessageContent = messageContent ? `${messageContent}\n\nAttached files: ${fileList}` : `Attached files: ${fileList}`;
    }

    // Add user message to DB immediately for optimistic UI update
    await addMessageToDb(fullMessageContent, "user", sessionId);

    try {
      // Note: we fetch the latest messages from state to ensure the API gets the full context
      const messageHistoryForApi = [
        ...messages,
        {
          id: "temp",
          session_id: sessionId,
          sender: "user",
          content: messageContent,
          timestamp: new Date().toISOString(),
        },
      ];

      let response;

      if (attachedFiles.length > 0) {
        // Handle file upload
        const formData = new FormData();

        // Add JSON data
        formData.append('data', JSON.stringify({
          messages: messageHistoryForApi,
          sessionType: isVoiceMode ? "voice" : "text",
          userId: user?.id,
          companyId: user?.company_id,
          umaSessionId,
        }));

        // Add files
        attachedFiles.forEach(file => {
          formData.append('files', file);
        });

        response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        // Clear attached files after sending
        setAttachedFiles([]);
      } else {
        // Regular text message
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messageHistoryForApi,
            sessionType: isVoiceMode ? "voice" : "text",
            userId: user?.id,
            companyId: user?.company_id,
            umaSessionId,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to get response from AI.");
      }

      const result = await response.json();

      if (result.type === "message") {
        await addMessageToDb(result.data.content, "ai", sessionId);
        
        // Track Uma session for conversation continuity
        if (result.data.umaSessionId) {
          setUmaSessionId(result.data.umaSessionId);
        }

        // Store the last AI message for lip sync
        setLastAIMessage(result.data.content);

        // Set avatar emotion — use Uma's emotion detection if available, otherwise keyword fallback
        if (isAvatarModeRef.current) {
          if (result.data.avatarEmotion) {
            setCurrentAvatarEmotion(result.data.avatarEmotion);
          } else {
            const content = result.data.content.toLowerCase();
            if (content.includes('happy') || content.includes('great') || content.includes('excellent')) {
              setCurrentAvatarEmotion('HAPPY');
            } else if (content.includes('angry') || content.includes('upset') || content.includes('frustrated')) {
              setCurrentAvatarEmotion('ANGRY');
            } else if (content.includes('laugh') || content.includes('funny') || content.includes('haha')) {
              setCurrentAvatarEmotion('LAUGHING');
            } else if (content.includes('congratulations') || content.includes('well done') || content.includes('bravo')) {
              setCurrentAvatarEmotion('CLAPPING');
            } else if (content.includes('success') || content.includes('achievement') || content.includes('accomplish')) {
              setCurrentAvatarEmotion('VICTORY');
            } else {
              setCurrentAvatarEmotion('IDLE');
            }
          }
        }
        // Speak the AI response in voice mode or avatar mode
        // Use refs to get latest values (avoid stale closures)
        const currentVoiceMode = isVoiceModeRef.current;
        const currentAudioEnabled = audioEnabledRef.current;
        
        const currentAvatarMode = isAvatarModeRef.current;
        console.log('🤖 AI response received, checking if should speak...', {
          isVoiceMode: currentVoiceMode,
          isAvatarMode: currentAvatarMode,
          audioEnabled: currentAudioEnabled,
          contentLength: result.data.content.length
        });

        if ((currentVoiceMode || currentAvatarMode) && currentAudioEnabled) {
          console.log('🗣️ Calling speakText with AI response...');
          speakText(result.data.content).catch(err => {
            console.error('❌ Error in speakText:', err);
            toast.error('Failed to speak AI response');
          });
        } else {
          console.log('⚠️ Not speaking AI response', { 
            isVoiceMode: currentVoiceMode, 
            isAvatarMode, 
            audioEnabled: currentAudioEnabled 
          });
        }
      } else {
        // This case should not happen during a normal conversation
        console.warn("Received a report unexpectedly. Treating as a message.");
        await addMessageToDb(JSON.stringify(result.data), "ai", sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while communicating with the AI.");
      // Optionally add the error message back to the chat for the user
      await addMessageToDb(
        "Sorry, I encountered an error. Please try again.",
        "ai",
        sessionId
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId || loading || sessionEnded || !user) return;

    toast.info("Analyzing conversation and generating comprehensive wellness report...");
    setLoading(true);

    try {
      const sessionDuration = callDuration ||
        Math.floor((Date.now() - (callStartTime?.getTime() || Date.now())) / 1000);

      const messageCount = messages.length;
      const userMessages = messages.filter(m => m.sender === 'user');
      const aiMessages = messages.filter(m => m.sender === 'ai');

      const conversationContent = messages.map(m =>
        `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n');

      const token = (typeof window !== 'undefined') ? localStorage.getItem('access_token') : null;

      // Build analyze-compatible messages
      const analyzeMessages = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const response = await fetch("/api/chat_wrapper/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: user.id, messages: analyzeMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate comprehensive report from AI.");
      }

      const result = await response.json();

      // result is a ReportResponse: { meta, mental_health, physical_health, overall }
      if (result.overall && result.mental_health) {
        const mh = result.mental_health;
        const ph = result.physical_health;
        const ov = result.overall;
        const mhM = mh.metrics || {};
        const phM = ph.metrics || {};

        // Map ReportResponse → WellnessReport for the existing display/risk logic
        const report: WellnessReport = {
          mood: mhM.emotional_tone?.score ?? mh.score,
          stress_score: mhM.stress_anxiety?.score ?? 5,
          anxious_level: mhM.stress_anxiety?.score ?? 5,
          work_satisfaction: mhM.motivation_engagement?.score ?? mh.score,
          work_life_balance: mhM.work_life_balance?.score ?? mh.score,
          energy_level: phM.activity?.score ?? ph.score,
          confident_level: mhM.self_esteem?.score ?? mh.score,
          sleep_quality: phM.lifestyle?.score ?? ph.score,
          complete_report: ov.full_report || ov.summary,
          session_type: isVoiceMode ? "voice" : "text",
          session_duration: sessionDuration,
          key_insights: ov.key_insights || [],
          recommendations: ov.recommendations || [],
        };

        // Update chat session — persistence is handled by backend.
        // (Firestore writes for chat_sessions, mental_health_reports, and
        // conversation_analyses have been removed; the backend persists the
        // wellness report via /api/chat_wrapper/analyze.)

        setGeneratedReport(report);
        setSessionEnded(true);
        toast.success("Comprehensive wellness report generated and saved successfully!");

        await updateGamificationStreak(sessionDuration, messageCount);
      } else {
        throw new Error("AI did not return a valid report format.");
      }
    } catch (error) {
      console.error("Error ending session and generating comprehensive report:", error);
      toast.error("Could not generate your comprehensive report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const updateGamificationStreak = async (sessionDuration: number, messageCount: number) => {
    if (!user) return;

    try {
      const result = await apiPost<{
        success: boolean;
        message?: string;
        points_earned?: number;
        new_badges?: string[];
      }>(
        '/gamification',
        {
          action: 'conversation_complete',
          employee_id: user.id,
          company_id: user.company_id,
          data: {
            sessionDuration,
            messageCount,
            sessionType: isVoiceMode ? 'voice' : 'text',
            avatarMode: isAvatarMode
          }
        }
      );
      if (result.success) {
        // Show success message with points earned
        if (result.points_earned && result.points_earned > 0) {
          toast.success(`🎉 ${result.message} (+${result.points_earned} points)`);
        } else {
          toast.success(result.message);
        }

        // Show new badges if any
        if (result.new_badges && result.new_badges.length > 0) {
          setTimeout(() => {
            toast.success(`🏆 You earned ${result.new_badges!.length} new badge(s)!`, {
              duration: 5000
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error updating gamification streak:', error);
      // Don't show error to user as this is a background operation
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Enhanced recording functionality with lip sync feedback and interrupt
  const startRecording = async () => {
    // Don't start if already recording
    if (isRecording) {
      console.log('⚠️ Already recording, skipping');
      return;
    }
    
    // Check if we're in voice mode (use ref for latest value)
    if (!isVoiceModeRef.current) {
      console.log('⚠️ Not in voice mode, skipping recording', { isVoiceMode: isVoiceModeRef.current });
      return;
    }
    
    // TALK TO INTERRUPT: stop AI audio immediately when user starts speaking
    if (isSpeaking || isTTSPlaying || audioPlayerRef.current) {
      stopCurrentAudio();
    }
    
    // Clear any existing auto-listen timer
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
      autoListenTimerRef.current = null;
    }
    
    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Start recording with silence detection callback
    const handleSilenceDetected = async () => {
      // Use a ref check or direct check - don't rely on closure
      console.log('🔇 3 seconds of silence detected - processing audio', { isRecording });
      // Stop recording and process audio
      await stopRecording();
    };
    
    console.log('🎤 Attempting to start recording...', { 
      isVoiceMode: isVoiceModeRef.current, 
      audioEnabled: audioEnabledRef.current 
    });
    try {
      const success = await audioRecorderRef.current.startRecording(handleSilenceDetected);
      if (success) {
        setIsRecording(true);
        console.log('✅ Recording started successfully - isRecording set to true');
        if (isAvatarMode && !isVoiceMode) {
          toast.success("Microphone test started - speak to see lip sync");
        }
        // Don't show toast in autonomous voice mode to avoid interruption
      } else {
        console.error('❌ Failed to start recording - startRecording returned false');
        toast.error(
          "Failed to start recording. Please check microphone permissions."
        );
      }
    } catch (error) {
      console.error('❌ Error in startRecording:', error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = async () => {
    console.log('🛑 Stopping recording...', { isRecording });
    setIsRecording(false);
    setProcessingAudio(true);
    
    try {
      const audioBlob = await audioRecorderRef.current.stopRecording();
      console.log('📦 Audio blob received:', { size: audioBlob?.size, type: audioBlob?.type });

      if (audioBlob && audioBlob.size > 0) {
        console.log('🔄 Processing audio message...');
        await processAudioMessage(audioBlob);
      } else {
        console.warn('⚠️ No audio blob or empty blob received');
        toast.error("No audio recorded. Please try again.");
        setProcessingAudio(false);
      }
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      toast.error("Failed to process audio recording");
      setProcessingAudio(false);
    }
  };

  const toggleSpeaking = () => {
    stopCurrentAudio();
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col text-gray-900 dark:text-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
      {/* Voice Call UI Overlay */}
      <VoiceCallUI
        isActive={isVoiceMode}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
        isProcessing={processingAudio}
        callDuration={callDuration}
        onEndCall={endCall}
        onToggleMute={() => setAudioEnabled(!audioEnabled)}
        isMuted={!audioEnabled}
        showClosedCaptions={showClosedCaptions}
        onToggleClosedCaptions={() => setShowClosedCaptions(!showClosedCaptions)}
        currentText={currentTTSText || lastAIMessage}
      />

      {/* Full Screen Chat Container */}
      <div className={`flex flex-1 relative bg-[#eef7f5] dark:bg-gray-950 ${isAvatarMode ? 'flex-col lg:flex-row p-0 lg:p-0' : 'flex-col px-6 py-4'}`} style={{ overflow: 'hidden' }}>
        {/* Chat card — full width in avatar mode, centered otherwise */}
        <div className={`flex flex-col min-h-0 relative bg-white dark:bg-gray-900 overflow-hidden ${
          isAvatarMode
            ? 'flex-1 lg:w-1/2 rounded-none lg:border-r border-gray-200 dark:border-gray-700'
            : 'flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 w-full'
        }`} style={{ height: '100%' }}>
          {/* Chat Section */}
          <div className="flex flex-col w-full min-h-0" style={{ height: '100%' }}>

            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                {/* <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Wellness Assistant</span> */}
              </div>

              <div className="flex items-center gap-2">
                {isVoiceMode && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {isRecording && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                    {isSpeaking && !isRecording && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                    <span className="font-mono text-[11px]">{formatCallDuration(callDuration)}</span>
                  </div>
                )}
                {!sessionEnded && (
                  <button
                    onClick={() => {
                      if (messages.length < 6) {
                        setShowMinMessagesAlert(true);
                      } else {
                        setShowEndConfirmation(true);
                      }
                    }}
                    disabled={loading || messages.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                  >
                    <PhoneOff className="h-3.5 w-3.5 text-red-500" />
                    End Conversation
                  </button>
                )}
                {!sessionEnded && (
                  <button
                    onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar px-6 py-4 min-h-0 bg-[#eef7f5] dark:bg-gray-950"
              style={{ touchAction: 'pan-y' }}
              onWheel={(e) => { e.stopPropagation(); }}
            >
              {messages.length === 0 && !loading && (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-400">Start a conversation with your Wellness Assistant</p>
                  </div>
                </div>
              )}

              {/* Voice Mode Instructions Card */}
              {isVoiceMode && showVoiceInstructions && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-3">
                  <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mic className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Voice Call Guide</span>
                            <button onClick={() => setShowVoiceInstructions(false)} className="text-emerald-600 hover:text-emerald-800">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <ul className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                            <li>1. Click the green mic to start recording</li>
                            <li>2. Speak naturally — AI will transcribe and respond</li>
                            <li>3. Click the red square to stop recording</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Date separator */}
              {messages.length > 0 && (
                <div className="flex items-center justify-center mb-3">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-[#eef7f5] dark:bg-gray-950 px-2">
                    {new Date(messages[0]?.timestamp || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex mb-2.5 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-1.5 max-w-[75%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-3.5 ${
                      message.sender === "user"
                        ? "bg-amber-400"
                        : "bg-gradient-to-br from-green-400 to-emerald-600"
                    }`}>
                      {message.sender === "user" ? (
                        <User className="h-3 w-3 text-white" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-white" />
                      )}
                    </div>

                    {/* Bubble + timestamp */}
                    <div className={`flex flex-col gap-0.5 ${message.sender === "user" ? "items-end" : "items-start"}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed ${
                          message.sender === "user"
                            ? "bg-emerald-500 text-white rounded-br-sm"
                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-sm"
                        }`}
                      >
                        {message.sender === "ai" ? (
                          <div>{renderMessageContent(message.content)}</div>
                        ) : (
                          renderMessageContent(message.content)
                        )}
                      </motion.div>
                      <span className="text-[9px] text-gray-400 px-0.5">
                        {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Typing / Audio Processing */}
              {(loading || processingAudio) && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-end gap-2">
                    {/* Avatar dot */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>

                    {/* Bubble */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        {/* Three animated dots */}
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.span
                              key={i}
                              className="block w-2 h-2 rounded-full bg-emerald-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{
                                duration: 0.7,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                              }}
                            />
                          ))}
                        </div>

                        {/* Cycling message text — no overflow clip */}
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={processingAudio ? 'audio' : thinkingIndex}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25 }}
                            className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium"
                          >
                            {processingAudio ? 'Processing audio...' : thinkingMessages[thinkingIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Report */}
              {sessionEnded && generatedReport && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="p-2 sm:p-4">
                    <CardTitle className="text-base sm:text-lg text-green-900 flex items-center">
                      <FileText className="h-5 w-5 sm:h-5 sm:w-5 mr-2" />
                      Session Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4 space-y-4">
                    <p className="text-green-800 text-sm sm:text-base">
                      Your wellness report has been generated and saved.
                    </p>

                    <div className="prose prose-sm max-w-none bg-white p-3 sm:p-4 rounded-md border">
                      <ReactMarkdown>
                        {generatedReport.complete_report}
                      </ReactMarkdown>
                    </div>

                    {generatedReport.key_insights?.length > 0 && (
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-md">
                        <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                          Key Insights:
                        </h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                          {generatedReport.key_insights.map(
                            (insight, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {insight}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {generatedReport.recommendations?.length > 0 && (
                      <div className="bg-purple-50 p-2 sm:p-3 rounded-md">
                        <h4 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">
                          Recommendations:
                        </h4>
                        <ul className="text-xs sm:text-sm text-purple-800 space-y-1">
                          {generatedReport.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex flex-col space-y-1">
                      <span>
                        Session Type: {generatedReport.session_type} • Duration:{" "}
                        {Math.floor(generatedReport.session_duration / 60)}m{" "}
                        {generatedReport.session_duration % 60}s
                      </span>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">Comprehensive analysis completed</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigation("/employee/reports")}
                      >
                        View All Reports
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      This report is confidential and intended to help you track
                      your well-being.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Mode Active Banner - Modern Design */}
            {isVoiceMode && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 shadow-md"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Phone className="h-5 w-5 sm:h-5 sm:w-5 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm">Voice Call Active</p>
                      <p className="text-xs text-green-100 hidden sm:block">Click the microphone to speak</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    {/* Audio Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAudioEnabled(!audioEnabled);
                        if (!audioEnabled) {
                          toast.success("🔊 AI voice responses enabled");
                        } else {
                          toast.info("🔇 AI voice responses muted");
                          stopTTS();
                          // Stop any playing audio
                          if (audioPlayerRef.current) {
                            audioPlayerRef.current.pause();
                            audioPlayerRef.current.currentTime = 0;
                            audioPlayerRef.current = null;
                          }
                        }
                      }}
                      className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title={audioEnabled ? "Mute AI voice" : "Unmute AI voice"}
                    >
                      {audioEnabled ? (
                        <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                    
                    {/* Call Duration */}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-green-100">Duration</p>
                      <p className="font-mono font-bold text-sm">{formatCallDuration(callDuration)}</p>
                    </div>
                    <div className="text-right sm:hidden">
                      <p className="font-mono font-bold text-xs">{formatCallDuration(callDuration)}</p>
                    </div>
                    
                    {/* End Call */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={endCall}
                      className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      title="End voice call"
                    >
                      <PhoneOff className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </motion.div>
            )}

            {/* Chat Input Area */}
            <div className="bg-white dark:bg-gray-900 px-4 pb-4 pt-3 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
              {/* File Attachments Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />{attachedFiles.length} file(s)
                    </span>
                    <button onClick={() => setAttachedFiles([])} className="text-gray-400 hover:text-gray-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] text-gray-500 border border-gray-200 dark:border-gray-600">
                        <FileText className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate max-w-20">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick reply chips — shown when no message typed */}
              {!sessionEnded && currentMessage.length === 0 && messages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 justify-center">
                  {predefinedMessages.slice(0, 3).map((msg, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentMessage(msg); setTimeout(() => handleSendMessage(msg), 80); }}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 border border-gray-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-50"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="flex items-center gap-2">
                {/* Input pill: paperclip | text | mic */}
                <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-2 focus-within:border-emerald-400 dark:focus-within:border-emerald-600 transition-colors">
                  {/* Paperclip */}
                  <button
                    onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                    disabled={loading || sessionEnded}
                    className="mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-colors"
                    title="Attachments & options"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    placeholder={isSttRecording ? "Listening…" : "Start Conversation"}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading || sessionEnded}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 min-w-0"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  />

                  {/* STT mic button — inside the pill, right side */}
                  <button
                    onClick={async () => {
                      if (isSttRecording) {
                        // Stop and transcribe
                        setIsSttRecording(false);
                        const blob = await audioRecorderRef.current.stopRecording();
                        if (blob && blob.size > 0) {
                          const fd = new FormData();
                          fd.append('audio', new File([blob], 'recording.webm', { type: 'audio/webm' }), 'recording.webm');
                          try {
                            const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
                            const { text } = await res.json();
                            if (text?.trim()) setCurrentMessage(text.trim());
                          } catch { toast.error('Transcription failed'); }
                        }
                      } else {
                        // Start plain recording (no voice-mode loop)
                        const ok = await audioRecorderRef.current.startRecording();
                        if (ok) setIsSttRecording(true);
                        else toast.error('Microphone access denied');
                      }
                    }}
                    disabled={loading || sessionEnded}
                    title={isSttRecording ? 'Stop recording' : 'Speak to type'}
                    className={`ml-2 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      isSttRecording
                        ? 'bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.25)] animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {isSttRecording ? (
                      <Square className="h-5 w-5 text-white" fill="white" />
                    ) : (
                      <Mic className="h-5 w-5 text-white" strokeWidth={2.5} />
                    )}
                  </button>
                </div>

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || sessionEnded || !currentMessage.trim()}
                  className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0 shadow-md"
                  title="Send message"
                >
                  <Send className="h-5 w-5 text-white" strokeWidth={2.5} />
                </button>

                {/* Voice Call button */}
                <button
                  onClick={isVoiceMode ? endCall : startCall}
                  disabled={loading || sessionEnded}
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md ${
                    isVoiceMode ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  } disabled:opacity-40`}
                  title={isVoiceMode ? 'End call' : 'Voice call'}
                >
                  <Phone className="h-5 w-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

            </div>


      </div>{/* end chat section */}

      {/* Options Dropdown Panel */}
      {showOptionsPanel && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOptionsPanel(false)}
                />

                {/* Dropdown — anchored near the menu icon (top-right of chat card) */}
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="fixed top-[72px] right-8 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Options</span>
                    <button
                      onClick={() => setShowOptionsPanel(false)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="py-1">
                    {/* Files */}
                    <button
                      // onClick={() => { openFileDialog(); setShowOptionsPanel(false); }}
                      onClick={() => { alert("Comming Soon..."); }}
                      disabled={loading || sessionEnded}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium">Add photos &amp; files</span>
                      <span className="ml-2 text-[10px] text-purple-500 font-medium">Soon</span>
                    </button>

                    {/* Images */}
                    <button
                      onClick={() => {
                        // const input = document.createElement('input');
                        // input.type = 'file'; input.multiple = true; input.accept = 'image/*';
                        // input.onchange = (e) => handleFileSelect(e as any);
                        // input.click();
                        // setShowOptionsPanel(false);
                        alert("Comming Soon...");
                      }}
                      disabled={loading || sessionEnded}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium">Add images</span>
                      <span className="ml-2 text-[10px] text-purple-500 font-medium">Soon</span>
                    </button>

                    {/* Deep Conversation */}
                    <button
                      onClick={() => {
                        // toast.info('Deep Conversation coming soon!', { duration: 3000 });
                        // setShowOptionsPanel(false);
                        alert("Comming Soon...");
                      }}
                      disabled={loading || sessionEnded}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <Search className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">Deep conversation</span>
                        <span className="ml-2 text-[10px] text-purple-500 font-medium">Soon</span>
                      </div>
                    </button>

                    <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-800" />

                    {/* Section label */}
                    <div className="px-3 py-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Avatar &amp; Voice</span>
                    </div>

                    {/* Avatar toggle */}
                    <button
                      // onClick={() => { setIsAvatarMode(!isAvatarMode); toast.success(isAvatarMode ? 'Avatar disabled' : 'Avatar enabled'); setShowOptionsPanel(false); }}
                      onClick={() => { alert("Comming Soon..."); }}
                      disabled={loading || sessionEnded}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <UserCircle className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">{isAvatarMode ? 'Disable avatar' : 'Enable avatar'}</span>
                        {isAvatarMode && <span className="ml-2 text-[10px] text-emerald-500 font-medium">Active</span>}
                        <span className="ml-2 text-[10px] text-purple-500 font-medium">Soon</span>
                      </div>
                    </button>

                    {/* Avatar settings */}
                    <button
                      // onClick={() => { toggleSettings(); setShowOptionsPanel(false); }}
                      onClick={() => { alert("Comming Soon..."); }}
                      disabled={loading || sessionEnded}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <Settings className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium">Avatar settings</span>
                      <span className="ml-2 text-[10px] text-purple-500 font-medium">Soon</span>
                    </button>

                    {/* Test mic */}
                    {/* <button
                      onClick={() => { isRecording ? stopRecording() : startRecording(); setShowOptionsPanel(false); }}
                      disabled={loading || sessionEnded}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <Mic className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">Test microphone</span>
                        {isRecording && <span className="ml-2 text-[10px] text-red-500 font-medium">Recording…</span>}
                      </div>
                    </button> */}

                    {/* Test TTS */}
                    {/* <button
                      onClick={() => { speakText('Hello! This is a test of the text-to-speech system.'); setShowOptionsPanel(false); }}
                      disabled={loading || sessionEnded || isSpeaking}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                        <Volume2 className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">Test voice</span>
                        {isSpeaking && <span className="ml-2 text-[10px] text-blue-500 font-medium">Speaking…</span>}
                      </div>
                    </button> */}

                    <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-800" />

                    {/* End conversation */}
                    <button
                      onClick={() => { 
                        setShowOptionsPanel(false); 
                        if (messages.length < 6) {
                          setShowMinMessagesAlert(true);
                        } else {
                          setShowEndConfirmation(true); 
                        }
                      }}
                      disabled={loading || sessionEnded || messages.length === 0}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                    >
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center justify-center flex-shrink-0">
                        <PhoneOff className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">End conversation</span>
                        <div className="text-[10px] text-gray-400">Generate wellness report</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

        </div>{/* end chat card */}

          {isAvatarMode && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
            className="flex w-full lg:w-1/2 h-[35vh] lg:h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 overflow-hidden flex-col border-b lg:border-b-0 lg:border-l border-gray-200 dark:border-gray-700 order-first lg:order-last"
          >
              {/* Avatar Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-4 py-3 relative z-20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Avatar</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Avatar Character Selector */}
                    <AzureAvatarSelector
                      selectedId={selectedAvatarCharacter}
                      onSelect={setSelectedAvatarCharacter}
                      disabled={azureAvatarSpeaking}
                      compact
                    />
                    {azureAvatarSpeaking && (
                      <Badge variant="secondary" className="text-xs">
                        Speaking
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Azure Avatar Video Display */}
              <div className="flex-1 relative z-10">
                <AzureAvatar
                  ref={azureAvatarRef}
                  characterId={selectedAvatarCharacter}
                  onSpeakingChange={(speaking) => {
                    setAzureAvatarSpeaking(speaking);
                    setIsSpeaking(speaking);
                  }}
                  onConnected={() => {
                    setAzureAvatarConnected(true);
                    setAvatarLoaded(true);
                    console.log('Azure Avatar connected');
                  }}
                  onDisconnected={() => {
                    setAzureAvatarConnected(false);
                    console.log('Azure Avatar disconnected');
                  }}
                  onError={(err) => {
                    console.error('Azure Avatar error:', err);
                    toast.error('Avatar connection issue: ' + err);
                  }}
                  className="h-full"
                />

              </div>
          </motion.div>
        )}

      </div>{/* end Full Screen Chat Container */}

      {/* Floating Voice Call Action Button - Only show when not in voice mode */}
      {/* {!sessionEnded && !isVoiceMode && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            onClick={startCall}
            disabled={loading}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110"
          >
            <Phone className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
        </motion.div>
      )} */}

      {/* Recording Indicator Overlay - Modern Minimal Design */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Listening</span>
              {/* Audio Waveform Animation */}
              <div className="flex items-center space-x-0.5">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-white rounded-full"
                    animate={{
                      height: [8, 16, 8],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Speaking Indicator */}
      {(isSpeaking || isTTSPlaying) && !isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="bg-blue-500 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-full"
                  animate={{
                    height: [6, 12, 6],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">AI is speaking...</span>
            <button
              onClick={() => {
                stopTTS();
                // Stop any playing audio
                if (audioPlayerRef.current) {
                  audioPlayerRef.current.pause();
                  audioPlayerRef.current.currentTime = 0;
                  audioPlayerRef.current = null;
                }
                setIsSpeaking(false);
              }}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors pointer-events-auto"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Minimum Messages Alert Dialog */}
      {showMinMessagesAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Keep the Conversation Going!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Minimum 6 messages are required to end the conversation and generate the report. This helps us provide a better and more accurate wellness assessment.
            </p>
            <Button
              onClick={() => setShowMinMessagesAlert(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continue Chatting
            </Button>
          </div>
        </div>
      )}

      {/* End Conversation Confirmation Dialog */}
      {showEndConfirmation && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <PhoneOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                End Conversation?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will analyze your entire conversation and generate a comprehensive wellness report.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens when you end:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Complete conversation analysis</li>
              <li>• Comprehensive wellness report generation</li>
              <li>• All conversation data saved securely</li>
              <li>• Report added to your wellness history</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEndConfirmation(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowEndConfirmation(false);
                handleEndSession();
              }}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End & Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )}

      {/* Avatar Character Picker (full panel — desktop only, triggered from settings button) */}
      {isAvatarMode && isSettingsOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Choose Avatar</span>
              <button onClick={toggleSettings} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">&times;</button>
            </div>
            <AzureAvatarSelector
              selectedId={selectedAvatarCharacter}
              onSelect={(id) => { setSelectedAvatarCharacter(id); toggleSettings(); }}
              disabled={azureAvatarSpeaking}
            />
          </div>
        </div>
      )}

      {/* Greeting Dialog — matches image */}
      <Dialog open={showGreetingDialog} onOpenChange={setShowGreetingDialog}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md mx-4 sm:mx-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>🌿</span>
                Welcome to Wellness Assistant!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="pt-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Hello, {user?.first_name || "there"}
            </p>
            <div className="border-t border-gray-100 dark:border-gray-700 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Your Wellness Assistant is here to listen and support you whenever you need it.<br />
              Share how you&apos;re feeling, ask questions, or explore simple ways to reduce stress and feel better.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowGreetingDialog(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Guard Confirmation Modal */}
      <Dialog
        open={showNavGuardModal}
        onOpenChange={(open) => {
          if (!open) handleNavGuardStay();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End conversation before leaving?</DialogTitle>
            <DialogDescription>
              You have an active conversation. End it now to generate your
              wellness report, or stay to continue chatting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleNavGuardStay} disabled={loading}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={handleNavGuardLeave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating report...
                </>
              ) : (
                <>
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Conversation
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
