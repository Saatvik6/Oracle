"use client";

import { useState } from "react";

type SpeechRecognitionResultEvent = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface Props {
  rawInput: string;
  setRawInput: (value: string) => void;
  availableHoursPerDay: number;
  setAvailableHoursPerDay: (value: number) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function CommitmentInbox({
  rawInput,
  setRawInput,
  availableHoursPerDay,
  setAvailableHoursPerDay,
  onAnalyze,
  loading,
}: Props) {
  const [listening, setListening] = useState(false);

  function startVoiceInput() {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Voice input failed. Please try again.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRawInput(rawInput ? `${rawInput}\n${transcript}` : transcript);
    };

    recognition.start();
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Commitment Inbox</h2>
        <p className="text-sm text-slate-400 mt-1">
          Dump your tasks, deadlines, constraints, and available time.
        </p>
      </div>

      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Example: Hackathon due June 29 2 PM, internship feature tomorrow, basketball CV notebook pending..."
        className="w-full h-44 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-cyan-400"
      />

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm text-slate-300">Available hours/day</label>

        <input
          type="number"
          min={1}
          value={availableHoursPerDay}
          onChange={(e) => setAvailableHoursPerDay(Number(e.target.value))}
          className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2"
        />

        <button
          onClick={startVoiceInput}
          type="button"
          className="bg-slate-950 border border-slate-700 text-slate-300 font-semibold px-5 py-2 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition"
        >
          {listening ? "Listening..." : "🎙 Voice Input"}
        </button>

        <button
          onClick={onAnalyze}
          disabled={loading || !rawInput.trim()}
          className="bg-cyan-400 text-slate-950 font-semibold px-5 py-2 rounded-lg disabled:opacity-50 hover:bg-cyan-300 transition"
        >
          {loading ? "Analyzing..." : "Analyze Deadline Risk"}
        </button>
      </div>
    </section>
  );
}