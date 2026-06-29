"use client";

import { ChangeEvent, DragEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, FileAudio, FileImage, FileText, Loader2, Mic, Paperclip, Send, Square, Sparkles, X } from "lucide-react";
import {
  ChatMessage,
  ClarificationQuestion,
  IntakeAttachment,
  IntakeResult,
  IntakeState,
} from "@/types/intake";

interface Props {
  onReady: (data: IntakeResult) => void | Promise<void>;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "oracle",
  content:
    "Give me the unedited version: deadlines, unfinished work, available hours, and anything currently blocked. I’ll work out what needs a decision before I build the schedule.",
  timestamp: new Date().toISOString(),
};

export default function OracleIntakeChat({ onReady }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<IntakeState>("collecting_commitments");
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [latestResult, setLatestResult] = useState<IntakeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<IntakeAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    if (state === "ready_to_generate" || state === "report_generated") return 100;
    if (state === "asking_clarifications") return 68;
    if (state === "analyzing_scope") return 45;
    return messages.length > 1 ? 28 : 12;
  }, [messages.length, state]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function addFiles(files: File[]) {
    const remaining = Math.max(0, 4 - pendingAttachments.length);
    const selected = files.slice(0, remaining);
    if (!selected.length) return;

    const allowed = selected.filter((file) => {
      const supported =
        file.type.startsWith("image/") ||
        file.type.startsWith("audio/") ||
        file.type === "application/pdf" ||
        file.type === "text/plain";
      return supported && file.size <= 8 * 1024 * 1024;
    });
    if (allowed.length !== selected.length) {
      setError("Use PDF, image, audio, or text files up to 8 MB each.");
    }

    const attachments = await Promise.all(
      allowed.map(
        (file) =>
          new Promise<IntakeAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                mimeType: file.type || "text/plain",
                dataUrl: String(reader.result),
                size: file.size,
              });
            reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
            reader.readAsDataURL(file);
          })
      )
    );
    setPendingAttachments((current) => [...current, ...attachments].slice(0, 4));
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    void addFiles(Array.from(event.dataTransfer.files));
  }

  async function startRecording() {
    if (recording || pendingAttachments.length >= 4) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(
        (type) => MediaRecorder.isTypeSupported(type)
      );
      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || preferredType || "audio/webm";
        const extension = mimeType.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([blob], `oracle-voice-note-${Date.now()}.${extension}`, {
          type: mimeType,
        });
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        void addFiles([file]);
      };

      recorder.start();
      setRecordingSeconds(0);
      setRecording(true);
      recordingTimerRef.current = window.setInterval(
        () => setRecordingSeconds((seconds) => seconds + 1),
        1000
      );
    } catch (caught) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      setError(
        caught instanceof DOMException && caught.name === "NotAllowedError"
          ? "Microphone access was denied. Allow it in your browser settings and try again."
          : "Oracle could not start microphone recording."
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    setRecording(false);
  }

  function formatRecordingTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  }

  async function submitContent(content: string, attachments = pendingAttachments) {
    const cleanContent = content.trim();
    if ((!cleanContent && !attachments.length) || loading || generating) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanContent || "Review the attached material and extract every commitment.",
      timestamp: new Date().toISOString(),
      attachments,
    };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setPendingAttachments([]);
    setQuestions([]);
    setError("");
    setLoading(true);
    setState("analyzing_scope");

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, previousResult: latestResult }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Intake analysis failed.");

      const result = data as IntakeResult;
      setLatestResult(result);
      setQuestions(result.clarificationQuestions || []);
      setState(
        result.status === "ready" ? "ready_to_generate" : "asking_clarifications"
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "oracle",
          content: result.oracleMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (caught) {
      setState("collecting_commitments");
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submitContent(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitContent(input);
    }
  }

  function answerQuestion(question: ClarificationQuestion, answer: string) {
    void submitContent(`${question.question}\nAnswer: ${answer}`);
  }

  async function generateReport() {
    if (!latestResult || latestResult.status !== "ready") return;
    setGenerating(true);
    setError("");
    try {
      await onReady(latestResult);
      setState("report_generated");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Report generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="overflow-hidden border border-white/[0.09] bg-[#101218] shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
      <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#9b94e3]">
              <Sparkles size={18} />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">Live intake</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">What needs your attention?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Start anywhere. Oracle will find the missing decisions.
            </p>
          </div>
          <span className="border border-white/10 px-3 py-1 text-xs text-slate-400">
            {state === "ready_to_generate" ? "Ready" : "Intake in progress"}
          </span>
        </div>
        <div className="mt-5 h-px overflow-hidden bg-white/[0.07]">
          <div
            className="h-full bg-[#7f77dd] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="oracle-scrollbar max-h-[54vh] min-h-[360px] space-y-7 overflow-y-auto px-5 py-7 sm:px-7">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "oracle" ? (
              <div className="flex w-full max-w-4xl gap-4">
                <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center bg-[#7f77dd] text-[10px] font-black text-white">O</div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f87df]">Oracle</p>
                  <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-200">{message.content}</div>
                </div>
              </div>
            ) : (
              <div className="max-w-[88%] rounded-[18px_4px_18px_18px] bg-[#5f58b7] px-4 py-3 text-sm leading-6 text-white sm:max-w-[72%]">
                <div className="whitespace-pre-wrap">{message.content}</div>
                {!!message.attachments?.length && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/15 pt-3">
                    {message.attachments.map((attachment) => (
                      <span key={attachment.id} className="bg-black/15 px-2.5 py-1 text-[11px] text-violet-100">{attachment.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {questions.map((question) => (
          <div key={question.id} className="ml-11 border-l-2 border-[#7f77dd] bg-white/[0.025] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {question.impact} impact
              </span>
              <span className="text-xs text-slate-500">{question.reason}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-6 text-white">{question.question}</p>
            {!!question.options?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={loading}
                    onClick={() => answerQuestion(question, option)}
                    className="border border-white/10 bg-[#151721] px-3 py-2 text-left text-xs text-slate-200 transition-[border-color,color,transform] duration-200 hover:border-[#7f77dd] hover:text-white active:scale-[0.98] disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="ml-11 flex items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-1" aria-label="Oracle is thinking">
              <span className="oracle-thinking-dot" />
              <span className="oracle-thinking-dot [animation-delay:120ms]" />
              <span className="oracle-thinking-dot [animation-delay:240ms]" />
            </div>
            Oracle is checking what changes the plan.
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.07] bg-[#0d0f15] p-5 sm:p-7">
        {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

        {state === "ready_to_generate" ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <div>
                <p className="text-sm font-semibold text-white">The workload is clear enough to model.</p>
                <p className="mt-1 text-xs text-slate-400">
                  {latestResult?.commitmentsDraft.length || 0} commitments extracted and checked.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={generateReport}
              disabled={generating}
              className="flex items-center justify-center gap-2 bg-[#6b63c7] px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform,opacity] duration-200 hover:bg-[#7f77dd] active:scale-95 disabled:opacity-60"
            >
              {generating ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}
              {generating ? "Building report…" : "Generate intelligence report"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            className="space-y-3"
          >
            <div className="border border-white/10 bg-[#151721] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-[#7f77dd] focus-within:bg-[#181a26] focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_3px_rgba(127,119,221,0.08)]">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || generating}
                rows={3}
                placeholder={
                  questions.length
                    ? "Answer in your own words, or choose an option above…"
                    : "Dump the deadlines, blockers, and half-finished work here…"
                }
                className="min-h-24 w-full resize-none bg-transparent p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
              />
            </div>
            {!!pendingAttachments.length && (
              <div className="flex flex-wrap gap-2">
                {pendingAttachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 border border-white/10 bg-[#151721] px-3 py-2 text-xs text-slate-300">
                    {attachment.mimeType.startsWith("image/") ? <FileImage size={14} className="text-violet-300" /> : attachment.mimeType.startsWith("audio/") ? <FileAudio size={14} className="text-amber-300" /> : <FileText size={14} className="text-violet-300" />}
                    <span className="max-w-44 truncate">{attachment.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${attachment.name}`}
                      onClick={() => setPendingAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                      className="text-slate-500 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-start gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,audio/*,application/pdf,text/plain"
                  onChange={handleFiles}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || pendingAttachments.length >= 4}
                  className="flex items-center gap-2 border border-dashed border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-400 transition-[border-color,color,transform] duration-200 hover:border-[#7f77dd] hover:text-white active:scale-[0.98] disabled:opacity-40"
                >
                  <Paperclip size={15} /> Add PDF, screenshot, or voice note
                </button>
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading || generating || (!recording && pendingAttachments.length >= 4)}
                  className={`flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold transition-[border-color,color,background-color,transform] duration-200 active:scale-[0.98] disabled:opacity-40 ${
                    recording
                      ? "border-rose-400 bg-rose-400/10 text-rose-300"
                      : "border-white/15 text-slate-400 hover:border-[#7f77dd] hover:text-white"
                  }`}
                >
                  {recording ? <Square size={14} fill="currentColor" /> : <Mic size={15} />}
                  {recording ? `Stop ${formatRecordingTime(recordingSeconds)}` : "Record voice"}
                  {recording && <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />}
                </button>
                <p className="basis-full text-[10px] text-slate-600">Or drag files here · up to 4 files, 8 MB each</p>
              </div>
              <button
                type="submit"
                disabled={recording || (!input.trim() && !pendingAttachments.length) || loading || generating}
                className="flex items-center justify-center gap-2 bg-[#6b63c7] px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform,opacity] duration-200 hover:bg-[#7f77dd] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} /> Send to Oracle
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
