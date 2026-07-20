// --- START OF FILE page.tsx ---

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AvatarController, useTTSLipSync } from "@/components/avatar";
import AvatarSettings, { useAvatarSettings } from "@/components/avatar/AvatarSettings";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import VoiceCallUI from "@/components/voice-call/VoiceCallUI";

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
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
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

export default function EmployeeChatPage() {
  const { user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
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
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);
  
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);

  // Avatar state
  const [currentAvatarEmotion, setCurrentAvatarEmotion] = useState<string>("");
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Avatar Settings
  const { config: avatarConfig, updateConfig: updateAvatarConfig, isOpen: isSettingsOpen, toggleSettings } = useAvatarSettings();
  
  // Enhanced TTS with lip sync
  const { speak: speakWithLipSync, stop: stopTTS, isPlaying: isTTSPlaying } = useTTSLipSync();
  const [currentTTSText, setCurrentTTSText] = useState<string>("");
  const [lastAIMessage, setLastAIMessage] = useState<string>("");

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Greeting dialog state
  const [showGreetingDialog, setShowGreetingDialog] = useState(false);
  const [greetingShown, setGreetingShown] = useState(false);

  // Predefined starting messages
  const predefinedMessages = [
    "Hello! How are you today?",
    "I'd like to discuss team wellness",
    "I need some management support",
    "Can you help me with employee wellness strategies?",
  ];
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [processingAudio, setProcessingAudio] = useState(false);

  // Options panel state
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Custom navigation handler that deactivates avatar before navigating
  const handleNavigation = (path: string) => {
    // Immediately deactivate avatar and navigate - don't wait for cleanup
    if (isAvatarMode) {
      setIsAvatarMode(false);
    }
    // Navigate immediately - React will handle cleanup during unmount
    router.push(path);
  };

  // Cleanup avatar on navigation - don't block navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAvatarMode) {
        setIsAvatarMode(false);
        // Note: Modern browsers ignore custom messages in beforeunload
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Listen for route changes to deactivate avatar
    const handleRouteChange = () => {
      if (isAvatarMode) {
        setIsAvatarMode(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Use Next.js router events if available, otherwise just cleanup on unmount
    const cleanup = () => {
      if (isAvatarMode) {
        setIsAvatarMode(false);
      }
    };
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [isAvatarMode]);

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

  // Enhanced TTS with ElevenLabs API (male teen voice)
  const speakText = async (text: string) => {
    console.log('🗣️ speakText called', { text: text.substring(0, 50) + '...', audioEnabled, audioEnabledRef: audioEnabledRef.current });
    
    // Use ref to check audioEnabled (avoid stale closure)
    if (!audioEnabledRef.current) {
      console.log('⚠️ Audio disabled, not speaking');
      return;
    }
    
    // Stop any current speech
    stopTTS();
    
    // Stop any playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    
    setCurrentTTSText(text);
    setIsSpeaking(true);
    console.log('🎵 Requesting TTS from ElevenLabs...');
    
    try {
      // Call ElevenLabs API for text-to-speech
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate speech' }));
        console.error('❌ ElevenLabs API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Get audio blob from response
      const audioBlob = await response.blob();
      console.log('✅ Audio blob received from ElevenLabs', { size: audioBlob.size, type: audioBlob.type });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element with proper settings
      const audio = new Audio();
      audio.preload = 'auto'; // Ensure full buffering
      audioPlayerRef.current = audio;
      
      console.log('⏳ Loading audio for playback...');

      // Wait for the audio to be fully loaded before playing
      await new Promise<void>((resolve, reject) => {
        const handleCanPlayThrough = () => {
          console.log('✅ Audio fully buffered and ready to play');
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          audio.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = (error: Event) => {
          console.error('❌ Error loading audio:', error);
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          audio.removeEventListener('error', handleError);
          reject(new Error('Failed to load audio'));
        };
        
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);
        
        // Set the source after adding event listeners
        audio.src = audioUrl;
        audio.load(); // Explicitly start loading
        
        // Timeout fallback - if audio doesn't load within 10 seconds, try playing anyway
        setTimeout(() => {
          if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or better
            handleCanPlayThrough();
          } else if (audio.readyState >= 2) { // HAVE_CURRENT_DATA - might work
            console.warn('⚠️ Audio may not be fully buffered, attempting playback anyway');
            handleCanPlayThrough();
          }
        }, 10000);
      });

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
        
        // Auto-start listening after AI finishes speaking (only in voice mode)
        // Use refs to get the latest state values (not stale closure values)
        const currentVoiceMode = isVoiceModeRef.current;
        const currentAudioEnabled = audioEnabledRef.current;
        console.log('🎵 Audio playback ended, checking if should start listening...', { 
          isVoiceMode: currentVoiceMode, 
          audioEnabled: currentAudioEnabled, 
          isRecording 
        });
        
        if (currentVoiceMode && currentAudioEnabled && !isRecording) {
          // Wait 500ms before auto-starting to listen
          autoListenTimerRef.current = setTimeout(() => {
            // Double-check state before starting (use refs again for latest values)
            if (!isRecording && !isSpeaking && isVoiceModeRef.current) {
              console.log('🎤 Auto-starting listening after AI finished speaking');
              startRecording().catch(err => {
                console.error('❌ Error starting recording:', err);
                toast.error('Failed to start listening. Please check microphone permissions.');
              });
            } else {
              console.log('⚠️ Skipping auto-listen - state check failed', { 
                isRecording, 
                isSpeaking, 
                isVoiceMode: isVoiceModeRef.current 
              });
            }
          }, 500);
        } else {
          console.log('⚠️ Not starting auto-listen', { 
            isVoiceMode: currentVoiceMode, 
            audioEnabled: currentAudioEnabled, 
            isRecording 
          });
        }
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
        toast.error('Failed to play audio');
      };

      // Handle stalled/waiting events to detect buffering issues
      audio.onstalled = () => {
        console.warn('⚠️ Audio playback stalled - network issue or buffering');
      };
      
      audio.onwaiting = () => {
        console.warn('⚠️ Audio waiting for more data...');
      };

      // Play audio - should be ready now since we waited for canplaythrough
      console.log('▶️ Starting audio playback...');
      try {
        await audio.play();
        console.log('✅ Audio playback started successfully');
      } catch (playError) {
        console.error('❌ Error playing audio:', playError);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
        throw playError;
      }

      // If in avatar mode, also trigger lip sync (optional - you may want to sync with audio timing)
      if (isAvatarMode) {
        // Note: Lip sync timing may need adjustment for ElevenLabs audio
        // For now, we'll just use the text for visual feedback
      }
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      setIsSpeaking(false);
      toast.error('Failed to generate speech. Please check your ElevenLabs API key.');
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
    
    // Show a welcome message from AI in voice mode, then auto-start listening
    if (sessionId) {
      const voiceWelcome = "I'm here to listen. Please share whatever is on your mind.";
      await addMessageToDb(voiceWelcome, "ai", sessionId);
      
      // Speak the welcome message, then auto-start listening after it finishes
      if (audioEnabled) {
        // Wait a bit then speak, and the onended handler will auto-start listening
        setTimeout(() => {
          speakText(voiceWelcome);
        }, 500);
        
        // FALLBACK: Start listening after 5 seconds even if welcome message doesn't finish
        // This ensures listening starts even if TTS fails or takes too long
        setTimeout(() => {
          if (!isRecording && isVoiceMode) {
            console.log('🎤 Fallback: Starting listening after timeout');
            startRecording();
          }
        }, 5000);
      } else {
        // If audio is disabled, start listening immediately
        setTimeout(() => {
          console.log('🎤 Starting listening immediately (audio disabled)');
          startRecording();
        }, 1000);
      }
    } else {
      // If no session, start listening immediately
      setTimeout(() => {
        console.log('🎤 Starting listening immediately (no session)');
        startRecording();
      }, 1000);
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
    setIsSpeaking(false);
    setProcessingAudio(false);

    // Stop any ongoing speech
    stopTTS();
    
    // Stop any playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    
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
      // Generate a local session ID — no Firestore needed
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setSessionId(newSessionId);

      const welcomeMessageContent = `Hello ${user.first_name || 'there'}! How are you?`;
      addMessageToDb(welcomeMessageContent, 'ai', newSessionId);
    } catch (error: any) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to initialize chat session.');
    }
  };

  const addMessageToDb = (
    content: string,
    sender: 'user' | 'ai',
    currentSessionId: string
  ) => {
    if (!currentSessionId) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      session_id: currentSessionId,
      content,
      sender,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
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
        if (isAvatarMode) {
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
        
        console.log('🤖 AI response received, checking if should speak...', { 
          isVoiceMode: currentVoiceMode, 
          isAvatarMode, 
          audioEnabled: currentAudioEnabled, 
          contentLength: result.data.content.length 
        });
        
        if ((currentVoiceMode || isAvatarMode) && currentAudioEnabled) {
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
      // Calculate conversation metrics
      const sessionDuration = callDuration || 
        Math.floor((Date.now() - (callStartTime?.getTime() || Date.now())) / 1000);
      
      const messageCount = messages.length;
      const userMessages = messages.filter(m => m.sender === 'user');
      const aiMessages = messages.filter(m => m.sender === 'ai');
      
      // Extract conversation content for analysis
      const conversationContent = messages.map(m => 
        `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n');

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          endSession: true,
          sessionType: isVoiceMode ? "voice" : "text",
          sessionDuration,
          conversationAnalysis: true,
          conversationMetrics: {
            totalMessages: messageCount,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            sessionDuration,
            hasAttachments: messages.some(m => m.content.includes('📎')),
            voiceMode: isVoiceMode,
            avatarMode: isAvatarMode
          },
          userId: user?.id,
          companyId: user?.company_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate comprehensive report from AI.");
      }

      const result = await response.json();

      if (result.type === "report") {
        const report = result.data as WellnessReport;
        const sessionDuration = callDuration ||
          Math.floor(
            (Date.now() - (callStartTime?.getTime() || Date.now())) / 1000
          );

        // Create comprehensive conversation data
        const conversationData = {
          sessionId,
          employeeId: user.id,
          companyId: user.company_id || "default",
          sessionType: isVoiceMode ? "voice" : "text",
          sessionDuration,
          messageCount,
          userMessageCount: userMessages.length,
          aiMessageCount: aiMessages.length,
          conversationContent,
          hasAttachments: messages.some(m => m.content.includes('📎')),
          avatarMode: isAvatarMode,
          voiceMode: isVoiceMode,
          startTime: callStartTime?.toISOString() || new Date().toISOString(),
          endTime: new Date().toISOString(),
          messages: messages.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          }))
        };

        // Session is tracked in-memory only — no Firestore update needed

        // Save comprehensive mental health report
        const mentalHealthReport = {
          employee_id: user.id,
          company_id: user.company_id || "default",
          stress_level: Math.max(1, Math.min(10, Math.round(report.stress_score))),
          mood_rating: Math.max(1, Math.min(10, Math.round(report.mood))),
          energy_level: Math.max(1, Math.min(10, Math.round(report.energy_level))),
          work_satisfaction: Math.max(1, Math.min(10, Math.round(report.work_satisfaction))),
          work_life_balance: Math.max(1, Math.min(10, Math.round(report.work_life_balance))),
          anxiety_level: Math.max(1, Math.min(10, Math.round(report.anxious_level))),
          confidence_level: Math.max(1, Math.min(10, Math.round(report.confident_level))),
          sleep_quality: Math.max(1, Math.min(10, Math.round(report.sleep_quality))),
          overall_wellness: Math.max(
            1,
            Math.min(
              10,
              Math.round(
                (report.mood +
                  report.energy_level +
                  report.work_satisfaction +
                  report.work_life_balance +
                  report.confident_level +
                  report.sleep_quality +
                  (11 - report.stress_score) +
                  (11 - report.anxious_level)) /
                8
              )
            )
          ),
          comments: `Comprehensive AI-generated report from ${isVoiceMode ? "voice" : "text"} conversation session`,
          ai_analysis: report.complete_report || "Comprehensive conversation analysis completed",
          sentiment_score: Math.max(0, Math.min(1, report.mood / 10)),
          emotion_tags: Array.isArray(report.key_insights) ? report.key_insights : [],
          risk_level: calculateRiskLevel(report),
          session_type: isVoiceMode ? "voice" : "text",
          session_duration: sessionDuration,
          conversation_metrics: {
            totalMessages: messageCount,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            hasAttachments: messages.some(m => m.content.includes('📎')),
            avatarMode: isAvatarMode,
            voiceMode: isVoiceMode
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';
          const token = localStorage.getItem('access_token');
          await fetch(`${SERVER}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(mentalHealthReport),
          });
          console.log("Comprehensive mental health report saved successfully");
        } catch (saveError) {
          console.error("Error saving mental health report:", saveError);
          toast.error("Report generated but failed to save. Please contact support.");
        }

        // Save conversation data separately for detailed analysis
        try {
          const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';
          const token = localStorage.getItem('access_token');
          await fetch(`${SERVER}/api/conversation-analyses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(conversationData),
          });
          console.log("Conversation analysis data saved successfully");
        } catch (conversationError) {
          console.error("Error saving conversation analysis:", conversationError);
        }

        setGeneratedReport(report);
        setSessionEnded(true);
        toast.success("Comprehensive wellness report generated and saved successfully!");

        // Update gamification streak and points
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
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'conversation_complete',
          employee_id: user.id,
          company_id: user.company_id,
          data: {
            sessionDuration,
            messageCount,
            sessionType: isVoiceMode ? 'voice' : 'text',
            avatarMode: isAvatarMode
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        // Show success message with points earned
        if (result.points_earned > 0) {
          toast.success(`🎉 ${result.message} (+${result.points_earned} points)`);
        } else {
          toast.success(result.message);
        }
        
        // Show new badges if any
        if (result.new_badges && result.new_badges.length > 0) {
          setTimeout(() => {
            toast.success(`🏆 You earned ${result.new_badges.length} new badge(s)!`, {
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
    
    // TALK TO INTERRUPT: Stop any ongoing AI speech when user starts speaking
    if (isSpeaking || isTTSPlaying) {
      stopTTS();
      // Stop any playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current = null;
      }
      setIsSpeaking(false);
      console.log('🔇 AI speech interrupted by user');
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
    if (isSpeaking) {
      stopTTS();
      // Stop any playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current = null;
      }
      setIsSpeaking(false);
    }
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
      <div className="flex flex-col flex-1 relative" style={{ overflow: 'hidden' }}>
        {/* Responsive Layout - Split on desktop, overlay on mobile */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 relative" style={{ height: '100%' }}>
          {/* Chat Section - Equal 50% width on desktop */}
          <div
            className="flex flex-col w-full lg:w-1/2 bg-white dark:bg-gray-900 min-h-0"
            style={{ height: '100%', maxHeight: '100vh' }}
          >
            {/* Chat Header - Modern Clean Design */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-gray-900 dark:text-gray-100 font-medium text-base truncate">Wellness Assistant</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Always here to listen</p>
                  </div>
                </div>

                {/* Status Indicators and Controls */}
                <div className="flex items-center space-x-2">
                  {isVoiceMode && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                      {isRecording && (
                        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="hidden sm:inline font-medium">Recording</span>
                        </div>
                      )}
                      {isSpeaking && !isRecording && (
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="hidden sm:inline font-medium">Speaking</span>
                        </div>
                      )}
                      {!isRecording && !isSpeaking && (
                        <span className="font-mono font-medium">{formatCallDuration(callDuration)}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Voice Call Toggle Button - Clean Icon Style */}
                  {!sessionEnded && !isVoiceMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startCall}
                      disabled={loading}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Start voice call"
                    >
                      <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  )}
                  
                  {/* End Call Button - Clean Icon Style */}
                  {!sessionEnded && isVoiceMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={endCall}
                      disabled={loading}
                      className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="End voice call"
                    >
                      <PhoneOff className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </Button>
                  )}

                  {/* End Conversation Button - Text Mode */}
                  {!sessionEnded && !isVoiceMode && messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEndConfirmation(true)}
                      disabled={loading}
                      className="h-8 px-3 text-xs sm:text-sm rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                      title="End conversation and generate report"
                    >
                      <PhoneOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                      <span className="hidden sm:inline">End</span>
                    </Button>
                  )}

                  {/* Settings Menu */}
                  {!sessionEnded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="More options"
                    >
                      <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages - Clean Modern Layout */}
            <div 
              ref={chatContainerRef}
              className={`flex-1 overflow-y-scroll overflow-x-hidden chat-scrollbar px-4 sm:px-6 py-6 min-h-0 ${
                isAvatarMode 
                  ? 'bg-transparent lg:bg-white lg:dark:bg-gray-900' 
                  : 'bg-white dark:bg-gray-900'
              }`}
              style={{ 
                height: '100%',
                maxHeight: 'calc(100vh - 200px)',
                boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
                touchAction: 'pan-y'
              }}
              onWheel={(e) => {
                // Ensure wheel events work for scrolling
                e.stopPropagation();
              }}
            >
              {messages.length === 0 && !loading && (
                <div className="flex items-center justify-center h-full min-h-[calc(100vh-16rem)] px-4">
                  <motion.div
                    className="text-center max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      How can I help you today?
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-8">
                      I&apos;m your AI wellness assistant. Share your thoughts, feelings, or anything on your mind.
                    </p>
                    
                    {/* Suggestion Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {[
                        { icon: "💬", text: "I'd like to talk about my day" },
                        { icon: "🎯", text: "Help me with stress management" },
                        { icon: "😊", text: "I want to improve my wellbeing" },
                        { icon: "🎙️", text: "Start a voice conversation" },
                      ].map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          onClick={() => {
                            if (i === 3) {
                              startCall();
                            } else {
                              setCurrentMessage(suggestion.text);
                            }
                          }}
                          className="p-4 text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{suggestion.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion.text}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Your conversations are confidential and designed to support your mental wellbeing
                    </p>
                  </motion.div>
                </div>
              )}

              {/* Voice Mode Instructions Card */}
              {isVoiceMode && showVoiceInstructions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mb-4"
                >
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Mic className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                            Voice Call Guide
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowVoiceInstructions(false)}
                              className="ml-auto h-6 w-6 p-0 text-green-600 hover:text-green-800"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                            <li className="flex items-start">
                              <span className="mr-2">1️⃣</span>
                              <span>Click the <strong>green microphone button</strong> to start recording</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">2️⃣</span>
                              <span>Speak naturally - the AI will transcribe and respond</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">3️⃣</span>
                              <span>Click the <strong>red square button</strong> to stop recording</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">💡</span>
                              <span>The AI will speak responses - use the speaker icon to mute/unmute</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-6 ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[85%] sm:max-w-[75%] ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar - Minimal */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user" 
                        ? "bg-blue-600" 
                        : "bg-gradient-to-br from-purple-500 to-blue-500"
                    }`}>
                      {message.sender === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble - Clean ChatGPT Style */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <div>
                          {renderMessageContent(message.content)}
                        </div>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </motion.div>
                  </div>
                </div>
              ))}

              {/* AI Typing / Audio Processing */}
              {(loading || processingAudio) && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[75%]">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback>
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-xl px-3 py-2 sm:p-3 border shadow-sm">
                      <div className="flex space-x-1 items-center">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-500" />
                        <span className="text-xs text-gray-500">
                          {processingAudio
                            ? "Processing audio..."
                            : "AI is thinking..."}
                        </span>
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
                        onClick={() => handleNavigation("/manager/personal/reports")}
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

            {/* Chat Input Area - Clean Modern Design */}
            <div className={`border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 ${
              isAvatarMode 
                ? 'bg-white/95 lg:bg-white dark:bg-gray-900/95 lg:dark:bg-gray-900 backdrop-blur-sm' 
                : 'bg-white dark:bg-gray-900'
            }`}>
              {/* File Attachments Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
                      <Paperclip className="h-5 w-5 mr-1" />
                      {attachedFiles.length} file(s) attached
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachedFiles([])}
                      className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border text-xs"
                      >
                        <FileText className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                          {file.name}
                        </span>
                        <span className="text-gray-500">
                          ({formatFileSize(file.size)})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-5 w-5 p-0 hover:bg-red-100 flex-shrink-0"
                        >
                          <X className="h-2 w-2 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined Starting Messages */}
              {messages.length > 0 && currentMessage.length === 0 && !sessionEnded && (
                <div className="mb-3 px-2 sm:px-4 md:px-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 justify-center items-center">
                      {predefinedMessages.map((message, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentMessage(message);
                            // Auto-send after a brief delay for better UX
                            setTimeout(() => {
                              handleSendMessage(message);
                            }, 100);
                          }}
                          disabled={loading || sessionEnded}
                          className="text-xs sm:text-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 h-auto min-h-[44px] rounded-full border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex-shrink-0 w-full sm:w-auto"
                        >
                          <span className="block text-center whitespace-nowrap">{message}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Input Container */}
              <div className="relative">
                {/* Mobile Avatar Mode Indicator */}
                {isAvatarMode && (
                  <div className="lg:hidden absolute -top-8 left-0 right-0 flex justify-center">
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs flex items-center space-x-1 backdrop-blur-sm">
                      <UserCircle className="h-3 w-3" />
                      <span>3D Avatar Background Active</span>
                    </div>
                  </div>
                )}

                {/* Input Container - Modern ChatGPT Style */}
                <div className="relative max-w-4xl mx-auto">
                  <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                    {/* Attachment Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                      disabled={loading || sessionEnded}
                      className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent flex-shrink-0 ml-2"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    {/* Text Input */}
                    <input
                      type="text"
                      placeholder={isVoiceMode ? "Speak or type your message..." : "Message Wellness Assistant..."}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading || sessionEnded}
                      className="flex-1 bg-transparent border-none outline-none px-3 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    />

                    {/* Right Side Controls */}
                    <div className="flex items-center space-x-1 mr-2 flex-shrink-0">
                      {/* Microphone Button - Voice Mode */}
                      {(isVoiceMode || currentMessage.length === 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleRecording}
                          disabled={loading || sessionEnded}
                          className={`h-9 w-9 p-0 rounded-full transition-all ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                              : isVoiceMode
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {isRecording ? (
                            <Square className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                      )}

                      {/* Send Button - Only when there's text */}
                      {currentMessage.length > 0 && (
                        <Button
                          onClick={() => handleSendMessage()}
                          disabled={loading || sessionEnded}
                          className="h-9 w-9 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag and Drop Overlay */}
                {dragOver && (
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center z-20">
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                        Drop files here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Options Dropdown Panel */}
            {showOptionsPanel && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-transparent z-30"
                    onClick={() => setShowOptionsPanel(false)}
                  />

                  {/* Options Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-16 left-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-40 overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {/* Add Files */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          openFileDialog();
                          setShowOptionsPanel(false);
                        }}
                        disabled={loading || sessionEnded}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Add photos & files</span>
                        </div>
                      </Button>

                      {/* Add Images */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.multiple = true;
                          input.accept = 'image/*';
                          input.onchange = (e) => handleFileSelect(e as any);
                          input.click();
                          setShowOptionsPanel(false);
                        }}
                        disabled={loading || sessionEnded}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Add images</span>
                        </div>
                      </Button>

                      {/* Deep Conversation */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast.info("🚀 Deep Conversation is coming soon! This exciting feature will provide enhanced AI analysis with real-time data, advanced reasoning capabilities, and deeper contextual understanding for more meaningful conversations.", {
                            duration: 6000,
                            style: {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              fontSize: '14px',
                              padding: '20px',
                              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                              maxWidth: '400px',
                            },
                          });
                          setShowOptionsPanel(false);
                        }}
                        disabled={loading || sessionEnded}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Search className="h-5 w-5 text-white animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Deep conversation</span>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Coming Soon</div>
                          </div>
                        </div>
                      </Button>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      {/* Avatar Options */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3">
                          Avatar & Voice
                        </div>

                        {/* Enable/Disable Avatar */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAvatarMode(!isAvatarMode);
                            toast.success(isAvatarMode ? "Avatar disabled" : "Avatar enabled");
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <UserCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {isAvatarMode ? "Disable avatar" : "Enable avatar"}
                              </span>
                              {isAvatarMode && (
                                <div className="text-xs text-green-600 dark:text-green-400">Active</div>
                              )}
                            </div>
                          </div>
                        </Button>

                        {/* Avatar Settings */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toggleSettings();
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Avatar settings</span>
                          </div>
                        </Button>

                        {/* Test Microphone */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isRecording) {
                              stopRecording();
                            } else {
                              startRecording();
                            }
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test microphone</span>
                              {isRecording && (
                                <div className="text-xs text-red-600 dark:text-red-400">Recording...</div>
                              )}
                            </div>
                          </div>
                        </Button>

                        {/* Test TTS Settings */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const testText = "Hello! This is a test of the text-to-speech system.";
                            speakText(testText);
                            setShowOptionsPanel(false);
                          }}
                          disabled={loading || sessionEnded || isSpeaking}
                          className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test TTS settings</span>
                              {isSpeaking && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">Speaking...</div>
                              )}
                            </div>
                          </div>
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      {/* End Conversation */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowOptionsPanel(false);
                          setShowEndConfirmation(true);
                        }}
                        disabled={loading || sessionEnded || messages.length === 0}
                        className="w-full justify-start text-left p-3 h-auto hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <PhoneOff className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">End conversation</span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Generate wellness report</div>
                          </div>
                        </div>
                      </Button>
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
          </div>

          {/* Avatar Section - Background on mobile, Equal 50% Split on desktop */}
          {isAvatarMode && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="fixed inset-0 lg:relative lg:w-1/2 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-pink-900/40 lg:bg-gradient-to-b lg:from-blue-50 lg:to-gray-50 lg:dark:from-blue-900/20 lg:dark:to-gray-800/20 lg:border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full z-0 lg:z-auto pointer-events-none"
          >
              {/* Mobile Avatar Background Indicator */}
              <div className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-b border-white/20 px-4 py-2 z-30 pointer-events-none">
                <div className="flex items-center justify-center space-x-2 text-white/90">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">3D Avatar Background</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Avatar Header - Hidden on mobile, visible on desktop */}
              <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-4 py-3 relative z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">3D Avatar + Lip Sync</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {currentAvatarEmotion || 'IDLE'}
                    </Badge>
                    {(isTTSPlaying || isRecording) && (
                      <Badge variant="secondary" className="text-xs">
                        {isTTSPlaying ? '🎤 TTS' : '🎙️ Mic'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* 3D Avatar Display */}
              <div className="flex-1 relative avatar-split-screen bg-gradient-to-br from-purple-200/30 to-blue-200/30 lg:bg-transparent z-10"
                   style={{
                     backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                   }}>
                {!avatarLoadError ? (
                  <AvatarController
                    emotion={currentAvatarEmotion || 'IDLE'}
                    speaking={isSpeaking || isRecording}
                    scale={avatarConfig.scale}
                    interactive={avatarConfig.interactive}
                    showEnvironment={avatarConfig.showEnvironment}
                    enableFloating={avatarConfig.enableFloating}
                    quality={avatarConfig.quality}
                    lipSyncSource={
                      isRecording ? 'microphone' : 
                      isTTSPlaying ? 'text' : 
                      isVoiceMode ? 'microphone' : 'text'
                    }
                    speechText={currentTTSText || lastAIMessage}
                    onLoad={() => {
                      setAvatarLoaded(true);
                      console.log('Avatar loaded successfully');
                    }}
                    onError={(error) => {
                      setAvatarLoadError(true);
                      console.error('Avatar loading error:', error);
                      toast.error('Failed to load 3D avatar');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Avatar failed to load</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvatarLoadError(false);
                          setAvatarLoaded(false);
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}

                {/* Avatar Loading Indicator */}
                {!avatarLoaded && !avatarLoadError && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 text-center pointer-events-none">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Loading 3D Avatar...</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This may take a few moments</p>
                  </div>
                )}

                {/* Avatar Status Indicator - Repositioned for mobile */}
                {(isSpeaking || isRecording) && (
                  <div className="absolute top-4 right-4 lg:top-4 lg:right-4 bg-black/80 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm flex items-center space-x-1 lg:space-x-2 backdrop-blur-sm z-10 pointer-events-none">
                    {isRecording && (
                      <>
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="hidden lg:inline">🎤 Recording</span>
                        <span className="lg:hidden">🎤</span>
                      </>
                    )}
                    {isSpeaking && !isRecording && (
                      <>
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="hidden lg:inline">💬 Speaking</span>
                        <span className="lg:hidden">💬</span>
                      </>
                    )}
                  </div>
                )}

                {/* Avatar Info Panel - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-xs text-gray-600 max-w-xs">
                  <div className="font-medium text-gray-800 mb-1">🎭 3D Avatar Active</div>
                  <div className="space-y-1">
                    <div>• Emotion: {currentAvatarEmotion || 'IDLE'}</div>
                    <div>• Speaking: {isSpeaking ? "🟢 Active" : "⚪ Inactive"}</div>
                    <div>• Mode: {isVoiceMode ? "Voice Chat" : "Text Chat"}</div>
                  </div>
                </div>

                {/* Mobile Avatar Indicator - Only visible on mobile */}
                <div className="lg:hidden absolute bottom-4 left-4 bg-purple-600/80 text-white px-3 py-2 rounded-xl text-xs backdrop-blur-sm z-10 shadow-lg pointer-events-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <UserCircle className="h-5 w-5" />
                    <span className="font-medium">Avatar: {currentAvatarEmotion || 'IDLE'}</span>
                  </div>
                </div>
              </div>
          </motion.div>
        )}
        </div>
      </div>

      {/* Floating Voice Call Action Button - Only show when not in voice mode */}
      {!sessionEnded && !isVoiceMode && messages.length > 0 && (
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
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full animate-ping"></div>
        </motion.div>
      )}

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

      {/* Avatar Settings Panel */}
      {isAvatarMode && (
        <AvatarSettings
          config={avatarConfig}
          onConfigChange={updateAvatarConfig}
          isOpen={isSettingsOpen}
          onToggle={toggleSettings}
        />
      )}

      {/* Greeting Dialog */}
      <Dialog open={showGreetingDialog} onOpenChange={setShowGreetingDialog}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 sm:space-x-2 text-lg sm:text-xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
              <span className="break-words">Welcome to Wellness Assistant!</span>
            </DialogTitle>
            <DialogDescription className="pt-3 sm:pt-2">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Hello {user?.first_name || "there"}! 👋
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                I&apos;m here to support you. Feel free to share what&apos;s on your mind, ask questions, or use the quick message options below to get started.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4 sm:pt-4">
            <Button
              onClick={() => setShowGreetingDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px] px-6 sm:px-8 text-sm sm:text-base"
            >
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
