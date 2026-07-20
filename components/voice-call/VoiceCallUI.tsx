"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Subtitles, Bot, Sparkles } from "lucide-react";

interface VoiceCallUIProps {
  isActive: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  callDuration: number;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleRecording?: () => void;
  isMuted?: boolean;
  showClosedCaptions?: boolean;
  onToggleClosedCaptions?: () => void;
  currentText?: string;
}

function WaveformBars({ active, color }: { active: boolean; color: string }) {
  const bars = [3, 5, 8, 6, 10, 7, 4, 9, 5, 7, 4, 6, 8, 5, 3];
  return (
    <div className="flex items-center justify-center gap-[3px] h-12">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className={`rounded-full ${color}`}
          style={{ width: 3 }}
          animate={
            active
              ? {
                  height: [h * 2, h * 4 + Math.random() * 10, h * 2],
                  opacity: [0.6, 1, 0.6],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            active
              ? {
                  duration: 0.5 + (i % 4) * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.04,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

export default function VoiceCallUI({
  isActive,
  isRecording,
  isSpeaking,
  isProcessing,
  callDuration,
  onEndCall,
  onToggleMute,
  isMuted = false,
  showClosedCaptions = false,
  onToggleClosedCaptions,
  currentText = "",
}: VoiceCallUIProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusLabel = isSpeaking
    ? "Speaking…"
    : isRecording
    ? "Listening…"
    : isProcessing
    ? "Processing…"
    : "Tap to speak";

  const statusColor = isSpeaking
    ? "text-emerald-300"
    : isRecording
    ? "text-red-300"
    : isProcessing
    ? "text-amber-300"
    : "text-white/50";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1a] to-emerald-950/20"
        >
          {/* Top bar */}
          <div className="w-full flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              {(isRecording || isSpeaking) && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500" : "bg-emerald-400"}`}
                />
              )}
              <span className="text-white/40 text-xs font-mono">
                {formatDuration(callDuration)}
              </span>
            </div>

            {onToggleClosedCaptions && (
              <button
                onClick={onToggleClosedCaptions}
                className={`p-2 rounded-full transition-colors ${
                  showClosedCaptions
                    ? "bg-white/20 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Subtitles className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Central area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-6">
            {/* Avatar orb */}
            <div className="relative flex items-center justify-center py-8">
              {/* Outer glow ring */}
              <motion.div
                animate={
                  isSpeaking
                    ? { scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }
                    : isRecording
                    ? { scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }
                    : { scale: 1, opacity: 0.05 }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-64 h-64 rounded-full bg-emerald-500/30 blur-2xl"
              />
              {/* Mid ring */}
              <motion.div
                animate={
                  isSpeaking || isRecording
                    ? { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }
                    : { scale: 1, opacity: 0.1 }
                }
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute w-48 h-48 rounded-full border border-emerald-400/20 bg-emerald-500/10 backdrop-blur-sm"
              />
              {/* Core orb */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center z-10 border border-white/20 relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
                <Bot className="w-14 h-14 text-white drop-shadow-lg z-10" />
              </div>
            </div>

            {/* Name + role */}
            <div className="text-center mt-2">
              <p className="text-white text-3xl font-bold tracking-tight">Saathi</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <p className="text-white/60 text-sm font-medium">Your AI Wellness Companion</p>
              </div>
            </div>

            {/* Waveform */}
            <div className="w-full max-w-xs">
              <WaveformBars
                active={isSpeaking || isRecording}
                color={
                  isSpeaking
                    ? "bg-emerald-400"
                    : isRecording
                    ? "bg-red-400"
                    : "bg-white/20"
                }
              />
            </div>

            {/* Status label */}
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`text-sm font-medium ${statusColor} tracking-wide`}
            >
              {statusLabel}
            </motion.p>

            {/* Processing dots */}
            {isProcessing && (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Closed captions */}
          <AnimatePresence>
            {showClosedCaptions && currentText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full px-6 mb-4"
              >
                <div className="bg-black/60 backdrop-blur rounded-xl px-4 py-3 text-center">
                  <p className="text-white text-sm leading-relaxed line-clamp-3">{currentText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls */}
          <div className="w-full flex items-center justify-center gap-8 pb-12">
            {/* Mute */}
            <button
              onClick={onToggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-lg border ${
                isMuted
                  ? "bg-white/20 border-white/30 text-white ring-2 ring-white/20"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
              }`}
            >
              {isMuted ? (
                <MicOff className="h-7 w-7" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={onEndCall}
              className="w-20 h-20 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-400/50 transition-all hover:scale-105"
            >
              <PhoneOff className="h-8 w-8 text-white" />
            </button>
          </div>

          {/* Home indicator */}
          <div className="w-32 h-1 bg-white/20 rounded-full mb-2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
