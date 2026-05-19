"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarController, useTTSLipSync } from "@/components/avatar";
import AvatarSettings, { useAvatarSettings } from "@/components/avatar/AvatarSettings";
import AzureAvatar, { type AzureAvatarHandle } from "@/components/avatar/AzureAvatar";
import AzureAvatarSelector from "@/components/avatar/AzureAvatarSelector";
import VoiceCallUI from "@/components/voice-call/VoiceCallUI";
import { apiPost } from "@/lib/api-client";
import {
  Send, User, PhoneOff, Loader2, FileText,
  Mic, Square, Brain, RefreshCw, Heart,
  ChevronDown, Activity, Database, Layers,
  MessageSquare, Zap, Eye, GitBranch,
  BookOpen, Search, Route, PenLine,
  Phone, Paperclip, Image as ImageIcon, X,
  UserCircle, Settings, Menu, Volume2, VolumeX,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNavigationGuard } from "@/contexts/navigation-guard-context";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── AudioRecorder class with silence detection ────────────────────────────────
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
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 },
      });
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: "audio/webm;codecs=opus" });
      this.audioChunks = [];
      this.onSilenceDetected = onSilenceDetected || null;
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };
      this.mediaRecorder.start(1000);
      if (onSilenceDetected) this.setupSilenceDetection();
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
        const threshold = 20;
        if (average < threshold) {
          const silenceDuration = Date.now() - this.silenceStartTime;
          if (silenceDuration >= 3000 && this.onSilenceDetected) {
            this.onSilenceDetected();
            this.isDetectingSilence = false;
            return;
          }
        } else {
          this.silenceStartTime = Date.now();
        }
        if (this.isDetectingSilence) requestAnimationFrame(checkSilence);
      };
      checkSilence();
    } catch (error) {
      console.error("Error setting up silence detection:", error);
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) { resolve(null); return; }
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
    if (this.microphone) { this.microphone.disconnect(); this.microphone = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; }
    this.mediaRecorder = null;
    this.onSilenceDetected = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  debug?: UmaDebug;
}

interface UmaDebug {
  emotion?: string;
  emotion_intensity?: number;
  tone_shift?: string;
  deep_need?: string;
  query_type?: string;
  subtext?: string;
  route?: string;
  route_detail?: string;
  strategy?: string;
  expression_style?: string;
  phase?: string;
  trigger_reason?: string;
  pipeline_steps?: string[];
  memories?: Array<{ content: string; score?: number; category?: string; access_count?: number }>;
  rag_chunks?: Array<{ content: string; score?: number }>;
  test_state?: {
    state: string;
    test_name?: string;
    current_q?: number;
    total_q?: number;
    trigger_reason?: string;
    conversation_route?: string;
    route_detail?: string;
  };
  test_history?: Array<{
    test_key: string;
    display_name?: string;
    summary?: string;
    scores?: { band?: string; total?: number };
    completed_at?: string;
    trigger_reason?: string;
  }>;
  catalog?: Record<string, { display_name: string; auto_generated?: boolean }>;
}

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

// ── Constants ─────────────────────────────────────────────────────────────────

const QUICK_STARTERS = [
  "I've been feeling stressed lately",
  "I need help managing anxiety",
  "I'm struggling with work-life balance",
  "I want to talk about my feelings",
];

const THINKING_MSGS = [
  "Saathi is listening…",
  "Understanding your feelings…",
  "Reflecting on what you shared…",
  "Crafting a thoughtful response…",
  "Almost there…",
];

const PHASES = ["opening", "venting", "seeking", "deep talk", "closing", "playful", "crisis"] as const;

const PIPELINE_STEPS_1 = [
  { key: "detect_signals", label: "detect", icon: Eye },
  { key: "extract_facts", label: "extract", icon: Search },
  { key: "fetch_knowledge", label: "fetch", icon: Database },
  { key: "route_conversation", label: "route", icon: Route },
];
const PIPELINE_STEPS_2 = [
  { key: "read_subtext", label: "read subtext", icon: BookOpen },
  { key: "recall_memories", label: "recall", icon: Brain },
  { key: "plan_response", label: "plan", icon: GitBranch },
  { key: "generate_reply", label: "write reply", icon: PenLine },
];

// ── Small helpers ─────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color = score >= 7 ? "bg-emerald-500" : score >= 4 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function scoreColor(s: number) {
  return s >= 7 ? "text-emerald-600" : s >= 4 ? "text-amber-500" : "text-red-500";
}

function PipelineStep({ label, icon: Icon, active }: { label: string; icon: any; active: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-center",
      active
        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
        : "text-gray-400 dark:text-gray-600"
    )}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[9px] font-medium leading-none">{label}</span>
    </div>
  );
}

function PhaseTag({ phase, active }: { phase: string; active: boolean }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all",
      active
        ? "bg-violet-600 text-white border-violet-600"
        : "bg-transparent text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700"
    )}>{phase}</span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NewSaathiPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { registerGuard } = useNavigationGuard();

  // ── Core chat state ──────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [report, setReport] = useState<WellnessReport | null>(null);
  const [thinkIdx, setThinkIdx] = useState(0);
  const [umaSessionId, setUmaSessionId] = useState<string | null>(null);

  // ── Debug panel ──────────────────────────────────────────────────────────
  const [debugTab, setDebugTab] = useState<"pipeline" | "test" | "memory" | "rag" | "catalog">("pipeline");
  const [latestDebug, setLatestDebug] = useState<UmaDebug | null>(null);
  const [activeSteps, setActiveSteps] = useState<string[]>([]);
  const [showMobileDebug, setShowMobileDebug] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pipelineNodeStates, setPipelineNodeStates] = useState<Record<string, { state: string; insight: string }>>({});

  // ── Nav guard ────────────────────────────────────────────────────────────
  const [showGuardModal, setShowGuardModal] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  // ── Voice / Call state ───────────────────────────────────────────────────
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);
  const [showClosedCaptions, setShowClosedCaptions] = useState(false);
  const [currentTTSText, setCurrentTTSText] = useState<string>("");
  const [lastAIMessage, setLastAIMessage] = useState<string>("");

  // ── Avatar state ─────────────────────────────────────────────────────────
  const [isAvatarMode, setIsAvatarMode] = useState(false);
  const [currentAvatarEmotion, setCurrentAvatarEmotion] = useState<string>("");
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [selectedAvatarCharacter, setSelectedAvatarCharacter] = useState("lisa");
  const [azureAvatarConnected, setAzureAvatarConnected] = useState(false);
  const [azureAvatarSpeaking, setAzureAvatarSpeaking] = useState(false);

  // ── File attachments ─────────────────────────────────────────────────────
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ── STT inline mic ───────────────────────────────────────────────────────
  const [isSttRecording, setIsSttRecording] = useState(false);

  // ── Options / dialogs ────────────────────────────────────────────────────
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showMinMessagesAlert, setShowMinMessagesAlert] = useState(false);
  const [showGreetingDialog, setShowGreetingDialog] = useState(false);
  const [greetingShown, setGreetingShown] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoListenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isVoiceModeRef = useRef(false);
  const audioEnabledRef = useRef(true);
  const isAvatarModeRef = useRef(false);
  const azureAvatarRef = useRef<AzureAvatarHandle>(null);
  const sessionStartTimeRef = useRef<Date>(new Date());

  // ── Avatar hooks ─────────────────────────────────────────────────────────
  const { config: avatarConfig, updateConfig: updateAvatarConfig, isOpen: isSettingsOpen, toggleSettings } = useAvatarSettings();
  const { speak: speakWithLipSync, stop: stopTTS, isPlaying: isTTSPlaying } = useTTSLipSync();

  const isGuardActive = messages.length >= 6 && !sessionEnded;

  // ── Ref sync effects ─────────────────────────────────────────────────────
  useEffect(() => { isVoiceModeRef.current = isVoiceMode; }, [isVoiceMode]);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);
  useEffect(() => { isAvatarModeRef.current = isAvatarMode; }, [isAvatarMode]);

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // ── Thinking message cycling ─────────────────────────────────────────────
  useEffect(() => {
    if (!loading) { setThinkIdx(0); setActiveSteps([]); return; }
    const id = setInterval(() => setThinkIdx(p => (p + 1) % THINKING_MSGS.length), 2500);
    const allSteps = [...PIPELINE_STEPS_1, ...PIPELINE_STEPS_2].map(s => s.key);
    let i = 0;
    const stepId = setInterval(() => {
      setActiveSteps(allSteps.slice(0, ++i));
      if (i >= allSteps.length) clearInterval(stepId);
    }, 400);
    return () => { clearInterval(id); clearInterval(stepId); };
  }, [loading]);

  // ── beforeunload guard ───────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    if (isGuardActive) window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isGuardActive]);

  // ── Navigation guard ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGuardActive) return;
    return registerGuard((dest) => { setPendingNav(dest); setShowGuardModal(true); return false; });
  }, [isGuardActive, registerGuard]);

  // ── Greeting dialog ──────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionId && !greetingShown && messages.length > 0) {
      setShowGreetingDialog(true);
      setGreetingShown(true);
    }
  }, [sessionId, greetingShown, messages.length]);

  // ── Avatar loading timeout ───────────────────────────────────────────────
  useEffect(() => {
    if (isAvatarMode && !avatarLoaded && !avatarLoadError) {
      const timeout = setTimeout(() => {
        if (!avatarLoaded) setAvatarLoaded(true);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isAvatarMode, avatarLoaded, avatarLoadError]);

  // ── Avatar cleanup on deactivate ─────────────────────────────────────────
  useEffect(() => {
    if (!isAvatarMode) {
      stopTTS();
      if (audioPlayerRef.current) { audioPlayerRef.current.pause(); audioPlayerRef.current = null; }
      setCurrentAvatarEmotion("");
      setAvatarLoaded(false);
      setAvatarLoadError(false);
    }
  }, [isAvatarMode, stopTTS]);

  // ── Call timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isVoiceMode && callStartTime) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [isVoiceMode, callStartTime]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addMessage = useCallback((role: "user" | "assistant", content: string, debug?: UmaDebug): Message => {
    const msg: Message = { id: `${Date.now()}-${Math.random()}`, role, content, timestamp: new Date(), debug };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ── File handlers ─────────────────────────────────────────────────────────
  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];
    files.forEach(file => {
      const maxSize = 10 * 1024 * 1024;
      const supportedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "text/plain", "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (file.size > maxSize) { errors.push(`${file.name} is too large (max 10MB)`); return; }
      if (!supportedTypes.includes(file.type)) { errors.push(`${file.name} has unsupported file type`); return; }
      validFiles.push(file);
    });
    if (errors.length > 0) toast.error(`Some files couldn't be added: ${errors.join(", ")}`);
    if (validFiles.length > 0) { setAttachedFiles(prev => [...prev, ...validFiles]); toast.success(`Added ${validFiles.length} file(s)`); }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
    if (event.target) event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  };
  const removeFile = (index: number) => { setAttachedFiles(prev => prev.filter((_, i) => i !== index)); toast.info("File removed"); };
  const openFileDialog = () => { fileInputRef.current?.click(); };

  const renderMessageContent = (content: string) => {
    const fileAttachmentRegex = /📎\s+([^\n,]+)/g;
    const hasAttachments = fileAttachmentRegex.test(content);
    if (hasAttachments) {
      const parts = content.split("\n\nAttached files:");
      const messageText = parts[0];
      const fileList = parts[1];
      return (
        <div>
          {messageText && <div className="prose prose-sm max-w-none mb-2"><ReactMarkdown>{messageText}</ReactMarkdown></div>}
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
    return <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{content}</ReactMarkdown></div>;
  };

  // ── Audio helpers ─────────────────────────────────────────────────────────
  const stopCurrentAudio = () => {
    stopTTS();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    if (!audioEnabledRef.current) return;
    stopCurrentAudio();
    setCurrentTTSText(text);
    setIsSpeaking(true);

    const scheduleAutoListen = () => {
      if (!isVoiceModeRef.current || !audioEnabledRef.current) return;
      if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
      autoListenTimerRef.current = setTimeout(() => {
        if (isVoiceModeRef.current && !isRecording) startRecording().catch(() => {});
      }, 400);
    };

    if (isAvatarModeRef.current && azureAvatarRef.current?.isConnected()) {
      try {
        await azureAvatarRef.current.speak(text);
        setIsSpeaking(false);
        scheduleAutoListen();
        return;
      } catch (err) {
        console.error("Azure Avatar speak failed, falling back:", err);
      }
    }

    const speakWithBrowser = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setIsSpeaking(false); scheduleAutoListen(); return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; utterance.pitch = 1.0; utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith("en") && !v.localService) || voices.find(v => v.lang.startsWith("en")) || voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => { setIsSpeaking(false); scheduleAutoListen(); };
      utterance.onerror = () => { setIsSpeaking(false); scheduleAutoListen(); };
      window.speechSynthesis.speak(utterance);
    };

    let audioUrl: string | null = null;
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, addEmotion: false }),
      });
      if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);
      const audioBlob = await response.blob();
      if (!audioBlob.size) throw new Error("Empty audio response");
      audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); if (audioUrl) URL.revokeObjectURL(audioUrl); audioPlayerRef.current = null; scheduleAutoListen(); };
      audio.onerror = () => { setIsSpeaking(false); if (audioUrl) URL.revokeObjectURL(audioUrl); audioPlayerRef.current = null; scheduleAutoListen(); };
      await audio.play();
    } catch (error: any) {
      console.error("TTS failed, falling back to browser TTS:", error?.message);
      setIsSpeaking(false);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioPlayerRef.current = null;
      setIsSpeaking(true);
      speakWithBrowser();
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
    try {
      const blobWithType = audioBlob.type ? audioBlob : new Blob([audioBlob], { type: "audio/webm;codecs=opus" });
      const formData = new FormData();
      const audioFile = new File([blobWithType], "recording.webm", { type: "audio/webm" });
      formData.append("audio", audioFile, "recording.webm");
      const transcriptionResponse = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!transcriptionResponse.ok) throw new Error("Failed to transcribe audio");
      const { text } = await transcriptionResponse.json();
      if (text && text.trim()) {
        setInput(text);
        await sendMessage(text);
        setProcessingAudio(false);
      } else {
        toast.error("No speech detected in recording");
        setProcessingAudio(false);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process audio message");
      setProcessingAudio(false);
    }
  };

  // ── Recording controls ────────────────────────────────────────────────────
  const startRecording = async () => {
    if (isRecording) return;
    if (!isVoiceModeRef.current) return;
    if (isSpeaking || isTTSPlaying || audioPlayerRef.current) stopCurrentAudio();
    if (autoListenTimerRef.current) { clearTimeout(autoListenTimerRef.current); autoListenTimerRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    const handleSilenceDetected = async () => { await stopRecording(); };
    try {
      const success = await audioRecorderRef.current.startRecording(handleSilenceDetected);
      if (success) { setIsRecording(true); }
      else toast.error("Failed to start recording. Please check microphone permissions.");
    } catch (error) {
      console.error("Error in startRecording:", error);
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setProcessingAudio(true);
    try {
      const audioBlob = await audioRecorderRef.current.stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        await processAudioMessage(audioBlob);
      } else {
        toast.error("No audio recorded. Please try again.");
        setProcessingAudio(false);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast.error("Failed to process audio recording");
      setProcessingAudio(false);
    }
  };

  const toggleSpeaking = () => { stopCurrentAudio(); };

  // ── Voice call controls ───────────────────────────────────────────────────
  const startCall = async () => {
    setIsVoiceMode(true);
    setCallStartTime(new Date());
    setCallDuration(0);
    setAudioEnabled(true);
    setShowVoiceInstructions(false);
    if (sessionId) {
      const voiceWelcome = "I'm here to listen. Please share whatever is on your mind.";
      addMessage("assistant", voiceWelcome);
      speakText(voiceWelcome);
    } else {
      setTimeout(() => startRecording().catch(() => {}), 600);
    }
    toast.success("🎙️ Voice call started! I'm listening...", { duration: 3000 });
  };

  const endCall = async () => {
    setIsVoiceMode(false);
    setCallStartTime(null);
    setCallDuration(0);
    setIsRecording(false);
    setProcessingAudio(false);
    stopCurrentAudio();
    if (autoListenTimerRef.current) { clearTimeout(autoListenTimerRef.current); autoListenTimerRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    toast.info("Call ended - generating report...");
    await endSession();
  };

  // ── Gamification ──────────────────────────────────────────────────────────
  const updateGamificationStreak = async (sessionDuration: number, messageCount: number) => {
    if (!user) return;
    try {
      const result = await apiPost<{ success: boolean; message?: string; points_earned?: number; new_badges?: string[] }>(
        "/gamification",
        {
          action: "conversation_complete",
          employee_id: user.id,
          company_id: user.company_id,
          data: { sessionDuration, messageCount, sessionType: isVoiceMode ? "voice" : "text", avatarMode: isAvatarMode },
        }
      );
      if (result.success) {
        if (result.points_earned && result.points_earned > 0) {
          toast.success(`🎉 ${result.message} (+${result.points_earned} points)`);
        } else {
          toast.success(result.message);
        }
        if (result.new_badges && result.new_badges.length > 0) {
          setTimeout(() => toast.success(`🏆 You earned ${result.new_badges!.length} new badge(s)!`, { duration: 5000 }), 1000);
        }
      }
    } catch (error) {
      console.error("Error updating gamification streak:", error);
    }
  };

  // ── refreshDebug — fetch debug session state ───────────────────────────────
  const refreshDebug = useCallback(async (sid?: string) => {
    const id = sid || umaSessionId;
    if (!id) return;
    try {
      const r = await fetch(`/api/uma/debug/${encodeURIComponent(id)}`);
      if (!r.ok) return;
      const d = await r.json();
      const p = d.last_pipeline || {};
      setLatestDebug(prev => ({
        ...prev,
        emotion: p.emotion ?? prev?.emotion,
        emotion_intensity: p.emotion_intensity ?? prev?.emotion_intensity,
        tone_shift: p.tone_shift ?? prev?.tone_shift,
        deep_need: p.deep_need ?? prev?.deep_need,
        query_type: p.query_type ?? prev?.query_type,
        subtext: p.subtext ?? prev?.subtext,
        route: p.conversation_route ?? prev?.route,
        route_detail: p.route_detail ?? prev?.route_detail,
        strategy: p.response_strategy ?? prev?.strategy,
        expression_style: p.expression_style ?? prev?.expression_style,
        phase: p.conversation_phase ?? prev?.phase,
        trigger_reason: p.trigger_reason ?? prev?.trigger_reason,
        memories: d.memories ?? prev?.memories,
        rag_chunks: p.retrieved_context ?? prev?.rag_chunks,
        test_state: d.assessment ?? prev?.test_state,
        test_history: d.test_history ?? prev?.test_history,
        catalog: d.available_tests ?? prev?.catalog,
      }));
    } catch (_) { /* debug endpoint is non-critical */ }
  }, [umaSessionId]);

  // ── sendMessage (Uma SSE streaming + fallback) ────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && attachedFiles.length === 0) || loading || sessionEnded) return;
    setInput("");

    let fullContent = trimmed;
    if (attachedFiles.length > 0) {
      const fileList = attachedFiles.map(f => `📎 ${f.name}`).join(", ");
      fullContent = trimmed ? `${trimmed}\n\nAttached files: ${fileList}` : `Attached files: ${fileList}`;
    }
    addMessage("user", fullContent);
    setLoading(true);
    setIsStreaming(true);
    setStreamingReply("");
    setPipelineNodeStates({});

    try {
      // File uploads still use the regular endpoint
      if (attachedFiles.length > 0) {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ message: trimmed, session_id: sessionId, user_id: user?.id ?? null, uma_session_id: umaSessionId }));
        attachedFiles.forEach(file => formData.append("files", file));
        const res = await fetch("/api/uma/chat", { method: "POST", body: formData });
        setAttachedFiles([]);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reply = data.response ?? data.reply ?? data.message ?? "I'm here for you.";
        if (data.session_id && !sessionId) setSessionId(data.session_id);
        if (data.uma_session_id) setUmaSessionId(data.uma_session_id);
        const debug = extractDebug(data);
        setLatestDebug(debug);
        setLastAIMessage(reply);
        addMessage("assistant", reply, debug);
        handleAvatarAndVoice(reply, data);
        setIsStreaming(false);
        setLoading(false);
        refreshDebug(data.uma_session_id || data.session_id);
        return;
      }

      // SSE streaming path
      const res = await fetch("/api/uma/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, session_id: sessionId, user_id: user?.id ?? null, uma_session_id: umaSessionId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let accumulatedReply = "";
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "node_start") {
              setPipelineNodeStates(prev => ({ ...prev, [evt.node]: { state: "running", insight: "" } }));
              setActiveSteps(prev => prev.includes(evt.node) ? prev : [...prev, evt.node]);
            } else if (evt.type === "node_done") {
              setPipelineNodeStates(prev => ({ ...prev, [evt.node]: { state: "done", insight: evt.insight || "" } }));
            } else if (evt.type === "reply_chunk" || evt.type === "reply_append") {
              accumulatedReply += evt.text;
              setStreamingReply(accumulatedReply);
            } else if (evt.type === "done") {
              finalData = evt.payload;
            } else if (evt.type === "error") {
              throw new Error(evt.message || "Stream error");
            }
          } catch (parseErr: any) {
            if (parseErr.message === "Stream error" || parseErr.message?.includes("error")) throw parseErr;
          }
        }
      }

      // Finalize the message
      const data = finalData || {};
      const reply = data.reply ?? data.response ?? (accumulatedReply || "I'm here for you.");
      if (data.session_id && !sessionId) setSessionId(data.session_id);
      if (data.uma_session_id) setUmaSessionId(data.uma_session_id);

      const debug = extractDebug(data);
      setLatestDebug(debug);
      setLastAIMessage(reply);
      addMessage("assistant", reply, debug);
      handleAvatarAndVoice(reply, data);
      setStreamingReply("");
      refreshDebug(data.uma_session_id || data.session_id);
    } catch (err) {
      console.error(err);
      addMessage("assistant", "I'm having trouble connecting right now. Please try again.");
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setStreamingReply("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sessionEnded, sessionId, umaSessionId, user, addMessage, attachedFiles, refreshDebug]);

  // Helper: extract debug fields from response data
  function extractDebug(data: any): UmaDebug {
    return {
      emotion: data.emotion ?? data.detected_emotion ?? data.peek?.emotion,
      emotion_intensity: data.emotion_intensity ?? data.peek?.emotion_intensity,
      tone_shift: data.tone_shift ?? data.peek?.tone_shift,
      deep_need: data.deep_need ?? data.peek?.deep_need,
      query_type: data.query_type ?? data.peek?.query_type,
      subtext: data.subtext ?? data.detected_subtext ?? data.peek?.subtext,
      route: data.route ?? data.selected_route ?? data.test_state?.conversation_route,
      route_detail: data.route_detail ?? data.test_state?.route_detail,
      strategy: data.strategy ?? data.response_strategy,
      expression_style: data.expression_style,
      phase: data.phase ?? data.conversation_phase ?? data.peek?.conversation_phase,
      trigger_reason: data.trigger_reason,
      pipeline_steps: data.pipeline_steps ?? data.steps_completed,
      memories: data.memories ?? data.retrieved_memories,
      rag_chunks: data.rag_chunks ?? data.retrieved_chunks ?? data.retrieved_context,
      test_state: data.test_state,
      test_history: data.test_history,
    };
  }

  // Helper: handle avatar emotion + voice after response
  function handleAvatarAndVoice(reply: string, data: any) {
    if (isAvatarModeRef.current) {
      if (data.avatarEmotion) {
        setCurrentAvatarEmotion(data.avatarEmotion);
      } else {
        const c = reply.toLowerCase();
        if (c.includes("happy") || c.includes("great") || c.includes("excellent")) setCurrentAvatarEmotion("HAPPY");
        else if (c.includes("angry") || c.includes("upset") || c.includes("frustrated")) setCurrentAvatarEmotion("ANGRY");
        else if (c.includes("laugh") || c.includes("funny") || c.includes("haha")) setCurrentAvatarEmotion("LAUGHING");
        else if (c.includes("congratulations") || c.includes("well done")) setCurrentAvatarEmotion("CLAPPING");
        else setCurrentAvatarEmotion("IDLE");
      }
    }
    if ((isVoiceModeRef.current || isAvatarModeRef.current) && audioEnabledRef.current) {
      speakText(reply).catch(err => console.error("Error in speakText:", err));
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // ── endSession ────────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (!user || loading || sessionEnded || messages.length < 2) return;
    setLoading(true);
    toast.info("Generating your wellness report…");
    try {
      const sessionDuration = callDuration ||
        Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000);
      const messageCount = messages.length;
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const res = await fetch("/api/chat_wrapper/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          user_id: user.id,
          messages: messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const result = await res.json();
      if (result.overall && result.mental_health) {
        const mh = result.mental_health; const ph = result.physical_health; const ov = result.overall;
        const mhM = mh.metrics || {}; const phM = ph.metrics || {};
        const wellnessReport: WellnessReport = {
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
        setReport(wellnessReport);
        setSessionEnded(true);
        toast.success("Wellness report generated!");
        await updateGamificationStreak(sessionDuration, messageCount);
      } else {
        throw new Error("Invalid report format");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, sessionEnded, messages, callDuration, isVoiceMode]);

  const handleGuardEndAndLeave = async () => {
    setShowGuardModal(false);
    const dest = pendingNav; setPendingNav(null);
    await endSession();
    if (dest) router.push(dest);
  };
  const handleGuardStay = () => { setShowGuardModal(false); setPendingNav(null); };

  const newSession = () => {
    setMessages([]); setSessionId(null); setSessionEnded(false);
    setReport(null); setInput(""); setLatestDebug(null); setActiveSteps([]);
    setShowMobileDebug(false); setUmaSessionId(null);
    setStreamingReply(""); setIsStreaming(false); setPipelineNodeStates({});
    sessionStartTimeRef.current = new Date();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row bg-[#eef7f5] dark:bg-gray-950" style={{ height: "calc(100vh - 60px)" }}>

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

      {/* ════════════════ LEFT: Chat Panel ════════════════ */}
      <div className={cn(
        "flex flex-col min-w-0 min-h-0 bg-white dark:bg-gray-900 lg:border-r border-gray-100 dark:border-gray-800",
        isAvatarMode ? "flex-1 lg:w-1/2" : "flex-1"
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">New Saathi</h1>
              <p className="text-[9px] sm:text-[10px] text-gray-400 hidden sm:block">Mental Wellness · Uma Pipeline</p>
            </div>
            {messages.length > 0 && !sessionEnded && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-[10px] font-medium text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800 flex-shrink-0">
                {messages.length} msgs
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowMobileDebug(v => !v)}
              className="lg:hidden flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium border border-violet-200 dark:border-violet-800 rounded-lg text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10 hover:bg-violet-100 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Debug</span>
            </button>
            {sessionEnded && (
              <Button size="sm" variant="outline" onClick={newSession} className="h-7 sm:h-8 text-[11px] sm:text-xs gap-1 sm:gap-1.5 px-2 sm:px-3">
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">New Session</span>
              </Button>
            )}
            {!sessionEnded && messages.length >= 2 && (
              <button
                onClick={() => { if (messages.length < 6) setShowMinMessagesAlert(true); else setShowEndConfirmation(true); }}
                disabled={loading}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 transition-colors disabled:opacity-40"
              >
                <PhoneOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">End Conversation</span>
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

        {/* Voice Mode Active Banner — violet gradient */}
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 shadow-md flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Phone className="h-5 w-5 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs sm:text-sm">Voice Call Active</p>
                <p className="text-xs text-violet-200 hidden sm:block">Click the microphone to speak</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Button variant="ghost" size="sm"
                onClick={() => {
                  setAudioEnabled(!audioEnabled);
                  if (!audioEnabled) toast.success("🔊 AI voice responses enabled");
                  else { toast.info("🔇 AI voice responses muted"); stopCurrentAudio(); }
                }}
                className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                {audioEnabled ? <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-violet-200">Duration</p>
                <p className="font-mono font-bold text-sm">{formatCallDuration(callDuration)}</p>
              </div>
              <div className="text-right sm:hidden">
                <p className="font-mono font-bold text-xs">{formatCallDuration(callDuration)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={endCall} className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0">
                <PhoneOff className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3 sm:space-y-4 min-h-0 bg-[#eef7f5] dark:bg-gray-950">

          {/* Date separator */}
          {messages.length > 0 && (
            <div className="flex items-center justify-center mb-3">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-[#eef7f5] dark:bg-gray-950 px-2">
                {new Date(messages[0]?.timestamp || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-6 pb-4 sm:pb-8 px-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                  Hi{user?.first_name ? `, ${user.first_name}` : ""}! I'm New Saathi
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Powered by the Uma pipeline — share what's on your mind.
                </p>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full max-w-sm">
                {QUICK_STARTERS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="px-3 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors leading-snug shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-[78%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-4 ${msg.role === "user" ? "bg-amber-400" : "bg-gradient-to-br from-violet-500 to-purple-600"}`}>
                  {msg.role === "user" ? <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" /> : <Brain className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
                </div>
                <div className={`flex flex-col gap-0.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
                    className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-sm"
                    }`}>
                    {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                  </motion.div>
                  <span className="text-[9px] text-gray-400 px-1">
                    {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming reply bubble */}
          {isStreaming && streamingReply && (
            <div className="flex justify-start">
              <div className="flex items-end gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-[78%]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mb-4">
                  <Brain className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                </div>
                <div className="flex flex-col gap-0.5 items-start">
                  <div className="rounded-2xl rounded-bl-sm px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{streamingReply}</ReactMarkdown>
                    </div>
                    <span className="inline-block w-0.5 h-3.5 bg-violet-500 ml-0.5 align-text-bottom rounded-sm animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline progress indicator (during streaming) */}
          {isStreaming && !streamingReply && Object.keys(pipelineNodeStates).length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {[...PIPELINE_STEPS_1, ...PIPELINE_STEPS_2].map(step => {
                      const ns = pipelineNodeStates[step.key];
                      return (
                        <span key={step.key} className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold transition-all",
                          ns?.state === "done" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                          ns?.state === "running" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 animate-pulse" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-400"
                        )}>
                          {ns?.state === "done" ? "✓" : ns?.state === "running" ? "●" : "○"} {step.label}
                        </span>
                      );
                    })}
                  </div>
                  {Object.values(pipelineNodeStates).some(n => n.insight) && (
                    <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[200px]">
                      {Object.values(pipelineNodeStates).filter(n => n.insight).pop()?.insight}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Thinking / processing indicator (fallback when no pipeline events) */}
          {(loading || processingAudio) && !isStreaming && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="block w-1.5 h-1.5 rounded-full bg-violet-400"
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span key={processingAudio ? "audio" : thinkIdx}
                        initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
                        className="text-xs text-gray-400 font-medium">
                        {processingAudio ? "Processing audio..." : THINKING_MSGS[thinkIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streaming thinking indicator (no reply text yet, no pipeline events) */}
          {isStreaming && !streamingReply && Object.keys(pipelineNodeStates).length === 0 && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="block w-1.5 h-1.5 rounded-full bg-violet-400"
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Connecting to Uma…</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inline report in chat */}
          {sessionEnded && report && (
            <Card className="bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg text-violet-900 dark:text-violet-100 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Session Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-4">
                <p className="text-violet-800 dark:text-violet-200 text-sm">Your wellness report has been generated and saved.</p>
                <div className="prose prose-sm max-w-none bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-md border border-violet-100 dark:border-violet-800">
                  <ReactMarkdown>{report.complete_report}</ReactMarkdown>
                </div>
                {report.key_insights?.length > 0 && (
                  <div className="bg-violet-100 dark:bg-violet-900/30 p-2 sm:p-3 rounded-md">
                    <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2 text-sm">Key Insights:</h4>
                    <ul className="text-xs sm:text-sm text-violet-800 dark:text-violet-200 space-y-1">
                      {report.key_insights.map((insight, i) => (
                        <li key={i} className="flex items-start"><span className="mr-2">•</span>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.recommendations?.length > 0 && (
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-md">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 text-sm">Recommendations:</h4>
                    <ul className="text-xs sm:text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start"><span className="mr-2">•</span>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>Session Type: {report.session_type} · Duration: {Math.floor(report.session_duration / 60)}m {report.session_duration % 60}s</span>
                  <Button size="sm" variant="outline" onClick={() => router.push("/employee/reports")}>
                    View All Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        {!sessionEnded && (
          <div className="flex-shrink-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">

            {/* File attachments preview */}
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

            {/* Quick reply chips */}
            {input.length === 0 && messages.length > 0 && !sessionEnded && (
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                {QUICK_STARTERS.slice(0, 3).map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); setTimeout(() => sendMessage(s), 80); }}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 border border-gray-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-50">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2">
              {/* Input pill */}
              <div className={cn(
                "flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-full border px-3 sm:px-4 py-2 sm:py-2.5 focus-within:border-violet-400 transition-colors",
                dragOver ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20" : "border-gray-200 dark:border-gray-700"
              )}>
                {/* Paperclip / options */}
                <button onClick={() => setShowOptionsPanel(!showOptionsPanel)} disabled={loading}
                  className="mr-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 flex-shrink-0 transition-colors"
                  title="Attachments & options">
                  <Paperclip className="h-5 w-5" />
                </button>

                <input ref={inputRef} type="text"
                  placeholder={isSttRecording ? "Listening…" : "Share what's on your mind…"}
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  disabled={loading}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 min-w-0" />
              </div>

              {/* STT mic button — standalone circle */}
              <button
                onClick={async () => {
                  if (isSttRecording) {
                    setIsSttRecording(false);
                    const blob = await audioRecorderRef.current.stopRecording();
                    if (blob && blob.size > 0) {
                      const fd = new FormData();
                      fd.append("audio", new File([blob], "recording.webm", { type: "audio/webm" }), "recording.webm");
                      try {
                        const res = await fetch("/api/transcribe", { method: "POST", body: fd });
                        const { text } = await res.json();
                        if (text?.trim()) setInput(text.trim());
                      } catch { toast.error("Transcription failed"); }
                    }
                  } else {
                    const ok = await audioRecorderRef.current.startRecording();
                    if (ok) setIsSttRecording(true);
                    else toast.error("Microphone access denied");
                  }
                }}
                disabled={loading}
                title={isSttRecording ? "Stop recording" : "Speak to type"}
                className={cn(
                  "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-md",
                  isSttRecording
                    ? "bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.25)] animate-pulse"
                    : "bg-violet-600 hover:bg-violet-700"
                )}>
                {isSttRecording
                  ? <Square className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="white" />
                  : <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />}
              </button>

              {/* Send button */}
              <button onClick={() => sendMessage(input)} disabled={loading || (!input.trim() && attachedFiles.length === 0)}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center transition-all shadow-md flex-shrink-0">
                <Send className="h-5 w-5 text-white" strokeWidth={2.5} />
              </button>

              {/* Voice call button */}
              <button onClick={isVoiceMode ? endCall : startCall} disabled={loading || sessionEnded}
                className={cn(
                  "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md disabled:opacity-40",
                  isVoiceMode ? "bg-red-500 hover:bg-red-600" : "bg-violet-600 hover:bg-violet-700"
                )}
                title={isVoiceMode ? "End call" : "Voice call"}>
                <Phone className="h-5 w-5 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════ Avatar Panel (right side) ════════════════ */}
      {isAvatarMode && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.5 }}
          className="flex w-full lg:w-1/2 h-[35vh] lg:h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 overflow-hidden flex-col border-b lg:border-b-0 lg:border-l border-gray-200 dark:border-gray-700 order-first lg:order-last"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-4 py-3 relative z-20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-violet-500 rounded-lg flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Avatar</span>
              </div>
              <div className="flex items-center space-x-3">
                <AzureAvatarSelector
                  selectedId={selectedAvatarCharacter}
                  onSelect={setSelectedAvatarCharacter}
                  disabled={azureAvatarSpeaking}
                  compact
                />
                {azureAvatarSpeaking && <Badge variant="secondary" className="text-xs">Speaking</Badge>}
              </div>
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <AzureAvatar
              ref={azureAvatarRef}
              characterId={selectedAvatarCharacter}
              onSpeakingChange={(speaking) => { setAzureAvatarSpeaking(speaking); setIsSpeaking(speaking); }}
              onConnected={() => { setAzureAvatarConnected(true); setAvatarLoaded(true); }}
              onDisconnected={() => setAzureAvatarConnected(false)}
              onError={(err) => { console.error("Azure Avatar error:", err); toast.error("Avatar connection issue: " + err); }}
              className="h-full"
            />
          </div>
        </motion.div>
      )}

      {/* ════════════════ RIGHT: Debug Panel ════════════════ */}
      {showMobileDebug && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setShowMobileDebug(false)} />
      )}

      <div className={cn(
        "flex flex-col bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800",
        "lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t shadow-2xl transition-transform duration-300",
        showMobileDebug ? "translate-y-0" : "translate-y-full",
        "lg:static lg:flex lg:translate-y-0 lg:w-80 xl:w-96 lg:border-l lg:rounded-none lg:shadow-none lg:z-auto"
      )} style={{ maxHeight: "70vh" }}>

        {/* Debug header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Pipeline Debug</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", loading ? "bg-amber-400 animate-pulse" : sessionId ? "bg-emerald-400" : "bg-gray-300")} />
            <button onClick={() => setShowMobileDebug(false)} className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-x-auto">
          {(["pipeline", "test", "memory", "rag", "catalog"] as const).map(tab => (
            <button key={tab} onClick={() => { setDebugTab(tab); if (tab === "catalog") refreshDebug(); }}
              className={cn("flex-1 py-2 text-[10px] sm:text-[11px] font-semibold capitalize transition-colors whitespace-nowrap px-1",
                debugTab === tab
                  ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300")}>
              {tab === "test" ? "Test State" : tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">

          {/* ── Pipeline tab ── */}
          {debugTab === "pipeline" && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Emotion Analysis</p>
                {latestDebug?.emotion ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                        <Heart className="h-3 w-3" /> {latestDebug.emotion}
                      </span>
                      {latestDebug.emotion_intensity != null && (
                        <span className="text-xs font-bold" style={{
                          color: latestDebug.emotion_intensity < 0.3 ? '#4ade80' : latestDebug.emotion_intensity < 0.6 ? '#fbbf24' : latestDebug.emotion_intensity < 0.85 ? '#fb923c' : '#ef4444'
                        }}>
                          {Math.round(latestDebug.emotion_intensity * 100)}%
                        </span>
                      )}
                    </div>
                    {latestDebug.emotion_intensity != null && (
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-400" style={{
                          width: `${latestDebug.emotion_intensity * 100}%`,
                          background: latestDebug.emotion_intensity < 0.3 ? '#4ade80' : latestDebug.emotion_intensity < 0.6 ? '#fbbf24' : latestDebug.emotion_intensity < 0.85 ? '#fb923c' : '#ef4444'
                        }} />
                      </div>
                    )}
                    {latestDebug.tone_shift && (
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">tone shift</span><span className="text-gray-600 dark:text-gray-300">{latestDebug.tone_shift}</span></div>
                    )}
                    {latestDebug.query_type && (
                      <div className="flex justify-between text-[10px] items-center"><span className="text-gray-400">query type</span>
                        <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                          latestDebug.query_type === "test_inquiry" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500" :
                          latestDebug.query_type === "crisis" ? "bg-red-100 dark:bg-red-900/30 text-red-500" :
                          latestDebug.query_type === "emotional_processing" ? "bg-pink-100 dark:bg-pink-900/30 text-pink-500" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-500"
                        )}>{latestDebug.query_type.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {latestDebug.deep_need && (
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">deep need</span><span className="text-purple-500 dark:text-purple-400">{latestDebug.deep_need}</span></div>
                    )}
                    {latestDebug.trigger_reason && (
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">test trigger</span><span className="text-amber-500 text-left max-w-[150px]">{latestDebug.trigger_reason}</span></div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">waiting for first message…</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subtext, Route &amp; Strategy</p>
                {latestDebug?.subtext || latestDebug?.route || latestDebug?.strategy ? (
                  <div className="space-y-1.5">
                    {latestDebug.route && (
                      <div><span className="text-[9px] text-gray-400 uppercase font-semibold">Route</span>
                        <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                          latestDebug.route === "crisis" ? "bg-red-100 dark:bg-red-900/30 text-red-500" :
                          latestDebug.route === "offer_test" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500" :
                          latestDebug.route === "guide_test" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-500"
                        )}>{latestDebug.route.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {latestDebug.route_detail && <div><span className="text-[9px] text-gray-400 uppercase font-semibold">Why</span><p className="text-[10px] text-gray-500 mt-0.5">{latestDebug.route_detail}</p></div>}
                    {latestDebug.subtext && <div><span className="text-[9px] text-gray-400 uppercase font-semibold">Subtext</span><p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5">{latestDebug.subtext}</p></div>}
                    {latestDebug.strategy && <div><span className="text-[9px] text-gray-400 uppercase font-semibold">Strategy</span><p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5">{latestDebug.strategy}</p></div>}
                    {latestDebug.expression_style && <div><span className="text-[9px] text-gray-400 uppercase font-semibold">Expression</span><span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500">{latestDebug.expression_style}</span></div>}
                  </div>
                ) : <p className="text-xs text-gray-400">—</p>}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Conversation Phase</p>
                <div className="flex flex-wrap gap-1.5">
                  {PHASES.map(p => <PhaseTag key={p} phase={p} active={latestDebug?.phase === p} />)}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pipeline Steps</p>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {PIPELINE_STEPS_1.map(s => {
                    const ns = pipelineNodeStates[s.key];
                    const isActive = activeSteps.includes(s.key);
                    return <PipelineStep key={s.key} label={s.label} icon={s.icon} active={isActive || ns?.state === "done"} />;
                  })}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {PIPELINE_STEPS_2.map(s => {
                    const ns = pipelineNodeStates[s.key];
                    const isActive = activeSteps.includes(s.key);
                    return <PipelineStep key={s.key} label={s.label} icon={s.icon} active={isActive || ns?.state === "done"} />;
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Test State tab ── */}
          {debugTab === "test" && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Test</p>
                {latestDebug?.test_state && latestDebug.test_state.state !== "none" ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-gray-400">test</span><span className="text-violet-600 dark:text-violet-400 font-medium">{latestDebug.test_state.test_name || "—"}</span></div>
                    <div className="flex justify-between text-xs items-center"><span className="text-gray-400">state</span>
                      <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        latestDebug.test_state.state === "in_progress" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" :
                        latestDebug.test_state.state === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500" :
                        "bg-gray-100 dark:bg-gray-700 text-gray-500"
                      )}>{latestDebug.test_state.state.replace(/_/g, ' ')}</span>
                    </div>
                    {latestDebug.test_state.total_q && latestDebug.test_state.total_q > 0 && (
                      <>
                        <div className="flex justify-between text-xs"><span className="text-gray-400">progress</span><span className="text-gray-600 dark:text-gray-300">Q{latestDebug.test_state.current_q} of {latestDebug.test_state.total_q}</span></div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.round(((latestDebug.test_state.current_q || 0) / latestDebug.test_state.total_q) * 100)}%` }} />
                        </div>
                      </>
                    )}
                    {latestDebug.test_state.trigger_reason && (
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">why this test</span><span className="text-amber-500 text-right max-w-[150px]">{latestDebug.test_state.trigger_reason}</span></div>
                    )}
                  </div>
                ) : <p className="text-xs text-gray-400 italic">no test running</p>}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Test History</p>
                {latestDebug?.test_history?.length ? (
                  <div className="space-y-2">
                    {latestDebug.test_history.slice().reverse().map((tr, i) => (
                      <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{tr.display_name || tr.test_key}</p>
                        {tr.summary && <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{tr.summary}</p>}
                        <div className="flex items-center gap-2">
                          {tr.scores?.band && (
                            <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                              tr.scores.band.toLowerCase().includes("high") ? "bg-red-100 dark:bg-red-900/30 text-red-500" :
                              tr.scores.band.toLowerCase().includes("moderate") ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" :
                              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500"
                            )}>{tr.scores.band}</span>
                          )}
                          {tr.scores?.total != null && <span className="text-[9px] text-gray-400">score: {tr.scores.total}</span>}
                        </div>
                        {tr.trigger_reason && <p className="text-[9px] text-amber-500">trigger: {tr.trigger_reason}</p>}
                        {tr.completed_at && <p className="text-[9px] text-gray-400">{new Date(tr.completed_at).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400 italic">no tests completed yet</p>}
              </div>
            </>
          )}

          {/* ── Memory tab ── */}
          {debugTab === "memory" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Retrieved Memories</p>
              {latestDebug?.memories?.length ? (
                <div className="space-y-2">
                  {latestDebug.memories.map((m, i) => (
                    <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                      <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">{m.content}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.category && <span className="text-[9px] text-gray-500 uppercase font-medium">{m.category}</span>}
                        {m.score != null && (
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.round(m.score * 100)}%` }} />
                            </div>
                            <span className="text-[9px] text-gray-400">{m.score.toFixed(3)}</span>
                          </div>
                        )}
                        {m.access_count != null && <span className="text-[9px] text-gray-400">×{m.access_count}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400 italic">no memories yet</p>}
            </div>
          )}

          {/* ── RAG tab ── */}
          {debugTab === "rag" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Retrieved RAG Chunks</p>
              {latestDebug?.rag_chunks?.length ? (
                <div className="space-y-2">
                  {latestDebug.rag_chunks.map((c, i) => {
                    const text = typeof c === "string" ? c : (c.content || JSON.stringify(c));
                    const score = typeof c === "string" ? null : c.score;
                    return (
                      <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-2 border-emerald-400">
                        <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">{text.slice(0, 280)}{text.length > 280 ? "…" : ""}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {score != null && <span className="text-[9px] text-gray-400">score: {score}</span>}
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 uppercase">injected</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-gray-400 italic">waiting for retrieval…</p>}
            </div>
          )}

          {/* ── Catalog tab ── */}
          {debugTab === "catalog" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Available Tests</p>
              {latestDebug?.catalog && Object.keys(latestDebug.catalog).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(latestDebug.catalog).map(([key, val]) => (
                    <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{val.display_name}</p>
                        <p className="text-[9px] text-gray-400 font-mono">{key}</p>
                      </div>
                      {val.auto_generated && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-500 uppercase">auto</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400 italic">no tests in catalog</p>}
            </div>
          )}

          {/* Wellness report in debug panel */}
          {sessionEnded && report && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">Wellness Report</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2 border-b border-gray-100 dark:border-gray-700">
                {[{ label: "Mood", val: report.mood }, { label: "Stress", val: report.stress_score }, { label: "Energy", val: report.energy_level }, { label: "Sleep", val: report.sleep_quality }].map(({ label, val }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex justify-between"><span className="text-[10px] text-gray-500">{label}</span><span className={`text-[10px] font-bold ${scoreColor(val)}`}>{val}/10</span></div>
                    <ScoreBar score={val} />
                  </div>
                ))}
              </div>
              {report.key_insights?.length > 0 && (
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Key Insights</p>
                  <ul className="space-y-1">{report.key_insights.slice(0, 3).map((ins, i) => <li key={i} className="text-[11px] text-gray-600 dark:text-gray-300 flex gap-1"><span className="text-violet-400">•</span>{ins}</li>)}</ul>
                </div>
              )}
              <div className="p-3 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => router.push("/employee/reports")} className="text-xs gap-1.5 h-7">
                  <FileText className="h-3 w-3" /> Full Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════ Overlays & Modals ════════════════ */}

      {/* Recording Indicator Overlay */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <div className="flex items-center space-x-2">
              <span className="font-medium">Listening</span>
              <div className="flex items-center space-x-0.5">
                {[...Array(4)].map((_, i) => (
                  <motion.div key={i} className="w-0.5 bg-white rounded-full"
                    animate={{ height: [8, 16, 8] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} />
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
          <div className="bg-violet-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i} className="w-1 bg-white rounded-full"
                  animate={{ height: [6, 12, 6] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
            <span className="text-sm font-medium">AI is speaking...</span>
            <button
              onClick={() => { stopTTS(); if (audioPlayerRef.current) { audioPlayerRef.current.pause(); audioPlayerRef.current = null; } setIsSpeaking(false); }}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors pointer-events-auto"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Options Dropdown Panel */}
      {showOptionsPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowOptionsPanel(false)} />
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[72px] right-8 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Options</span>
              <button onClick={() => setShowOptionsPanel(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="py-1">
              <button onClick={() => { alert("Coming Soon..."); }} disabled={loading || sessionEnded}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                  <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="font-medium">Add photos &amp; files</span>
                <span className="ml-2 text-[10px] text-violet-500 font-medium">Soon</span>
              </button>
              <button onClick={() => { alert("Coming Soon..."); }} disabled={loading || sessionEnded}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="font-medium">Add images</span>
                <span className="ml-2 text-[10px] text-violet-500 font-medium">Soon</span>
              </button>
              <button onClick={() => { alert("Coming Soon..."); }} disabled={loading || sessionEnded}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                  <Search className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium">Deep conversation</span>
                  <span className="ml-2 text-[10px] text-violet-500 font-medium">Soon</span>
                </div>
              </button>
              <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-800" />
              <div className="px-3 py-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Avatar &amp; Voice</span>
              </div>
              <button onClick={() => { alert("Coming Soon..."); }} disabled={loading || sessionEnded}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                  <UserCircle className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium">{isAvatarMode ? "Disable avatar" : "Enable avatar"}</span>
                  {isAvatarMode && <span className="ml-2 text-[10px] text-violet-500 font-medium">Active</span>}
                  <span className="ml-2 text-[10px] text-violet-500 font-medium">Soon</span>
                </div>
              </button>
              <button onClick={() => { alert("Coming Soon..."); }} disabled={loading || sessionEnded}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="font-medium">Avatar settings</span>
                <span className="ml-2 text-[10px] text-violet-500 font-medium">Soon</span>
              </button>
              <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-800" />
              <button
                onClick={() => { setShowOptionsPanel(false); if (messages.length < 6) setShowMinMessagesAlert(true); else setShowEndConfirmation(true); }}
                disabled={loading || sessionEnded || messages.length === 0}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50">
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

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple accept="image/*,.txt,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />

      {/* Avatar Character Picker panel */}
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

      {/* Minimum Messages Alert */}
      {showMinMessagesAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Keep the Conversation Going!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Minimum 6 messages are required to end the conversation and generate the report. This helps us provide a better and more accurate wellness assessment.
            </p>
            <Button onClick={() => setShowMinMessagesAlert(false)} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">End Conversation?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This will analyze your conversation and generate a comprehensive wellness report.</p>
              </div>
            </div>
            <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">What happens when you end:</h4>
              <ul className="text-sm text-violet-800 dark:text-violet-200 space-y-1">
                <li>• Complete conversation analysis</li>
                <li>• Comprehensive wellness report generation</li>
                <li>• All conversation data saved securely</li>
                <li>• Report added to your wellness history</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowEndConfirmation(false)} className="flex-1" disabled={loading}>Cancel</Button>
              <Button
                onClick={() => { setShowEndConfirmation(false); endSession(); }}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Analyzing…</> : <><PhoneOff className="h-5 w-5 mr-2" />End &amp; Analyze</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting Dialog */}
      <Dialog open={showGreetingDialog} onOpenChange={setShowGreetingDialog}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md mx-4 sm:mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🌿</span>
              Welcome to New Saathi!
            </DialogTitle>
          </DialogHeader>
          <div className="pt-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Hello, {user?.first_name || "there"}
            </p>
            <div className="border-t border-gray-100 dark:border-gray-700 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              New Saathi is here to listen and support you whenever you need it.<br />
              Share how you&apos;re feeling, ask questions, or explore simple ways to reduce stress and feel better.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowGreetingDialog(false)}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nav Guard Modal */}
      <Dialog open={showGuardModal} onOpenChange={open => { if (!open) handleGuardStay(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End conversation before leaving?</DialogTitle>
            <DialogDescription>You have an active conversation. End it now to generate your wellness report, or stay to continue chatting.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleGuardStay} disabled={loading}>Stay</Button>
            <Button variant="destructive" onClick={handleGuardEndAndLeave} disabled={loading}>
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Generating…</> : <><PhoneOff className="h-5 w-5 mr-2" />End Conversation</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
