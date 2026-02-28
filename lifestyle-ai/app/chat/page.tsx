"use client";

import { useEffect, useRef, useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import { useAuth } from "@/context/AuthContext";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

type RiskInfo = {
  riskLevel: "low" | "moderate" | "high";
  shouldSeeDoctor: boolean;
};

type DoctorRecommendation = {
  id: string | number;
  full_name: string;
  specialty: string;
  clinic_name: string;
  city: string;
  country: string;
  website_url?: string | null;
  booking_url?: string | null;
};

type ChatApiResponse = {
  summary?: string;
  risk?: RiskInfo;
  doctorRecommendation?: DoctorRecommendation | null;
};

type SpeechRecognitionResultLike = {
  transcript?: string;
};

type SpeechRecognitionEventLike = {
  resultIndex?: number;
  results?: ArrayLike<ArrayLike<SpeechRecognitionResultLike> & { isFinal?: boolean }>;
};

type SpeechRecognitionConfigurable = {
  continuous?: boolean;
  results?: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildContextualFallback(text: string): string {
  const normalized = normalizeText(text);

  if (
    ["mellkas", "sziv", "legszomj", "chest", "heart", "cannot breathe", "shortness of breath"].some(
      (keyword) => normalized.includes(keyword)
    )
  ) {
    return "A leírt tünetek alapján ez kardiológiai vagy légzőszervi irányba kivizsgálandó lehet. Ha erősödik a panasz, sürgősen fordulj orvoshoz.";
  }

  if (
    ["fejfajas", "migren", "szedules", "zsibbadas", "headache", "migraine", "dizzy", "numb"].some(
      (keyword) => normalized.includes(keyword)
    )
  ) {
    return "A tüneteid neurológiai kivizsgálást is indokolhatnak. Javasolt neurológushoz fordulni, különösen ha a panasz visszatér vagy romlik.";
  }

  if (
    ["has", "gyomor", "hanyinger", "stomach", "nausea", "reflux", "diarrhea"].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return "A leírásod alapján gasztroenterológiai konzultáció hasznos lehet. Addig figyeld a tüneteid alakulását és a kiváltó tényezőket.";
  }

  if (
    ["szorongas", "panik", "depresszio", "anxiety", "panic", "depression", "stress"].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return "A leírtak mentálhigiénés támogatást is igényelhetnek. Pszichiáter vagy pszichológus felkeresése jó következő lépés lehet.";
  }

  return "Köszönöm, hogy leírtad a tüneteidet. Ez alapján érdemes háziorvossal vagy megfelelő szakorvossal egyeztetni, főleg ha a panasz tartós vagy romlik.";
}

export default function Chat() {
  const { isAuthenticated, accessToken, userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: "Hi! I'm your AI health assistant 🌿",
    },
  ]);

  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<"en-US" | "hu-HU">("en-US");
  const [voiceError, setVoiceError] = useState("");
  const [risk, setRisk] = useState<RiskInfo | null>(null);
  const [doctorRecommendation, setDoctorRecommendation] =
    useState<DoctorRecommendation | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const manualStopRef = useRef(false);
  const finalizedTranscriptRef = useRef("");

  const isEmbeddedContext = () => {
    try {
      return window.top !== window.self;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated || !accessToken) {
        setHistoryLoaded(true);
        return;
      }

      try {
        const res = await fetch("/api/chat-history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          setHistoryLoaded(true);
          return;
        }

        const data = (await res.json()) as { messages?: ChatMessage[] };
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch {
        // keep local session behavior when history load fails
      } finally {
        setHistoryLoaded(true);
      }
    };

    void loadHistory();
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !historyLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetch("/api/chat-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ messages }),
      });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [messages, isAuthenticated, accessToken, historyLoaded]);

  const requestMicAccess = async () => {
    if (!window.isSecureContext) {
      setVoiceError("Microphone requires a secure context. Open the app on localhost or HTTPS.");
      return false;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setVoiceError("Microphone API is unavailable in this browser context. Try opening in Chrome or Safari.");
      return false;
    }

    if (navigator?.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });

        if (permission.state === "denied") {
          setVoiceError(
            isEmbeddedContext()
              ? "Microphone is blocked in this embedded view. Open the app in Chrome/Safari and allow mic permission there."
              : "Microphone permission is denied in your browser. Allow it in site settings and try again."
          );
          return false;
        }
      } catch {
        // Ignore Permissions API failures and continue with getUserMedia.
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      const name = (error as { name?: string })?.name;

      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setVoiceError(
          isEmbeddedContext()
            ? "Microphone is blocked in this embedded view. Open the app in Chrome/Safari and allow mic permission there."
            : "Microphone permission is blocked. Please allow mic access in your browser settings."
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setVoiceError("No microphone device detected. Check your mic connection and selected input device.");
      } else {
        setVoiceError("Could not access microphone in this browser context. Try Chrome/Safari and retry.");
      }

      return false;
    }
  };

  const resolveSpeechError = (errorCode?: string) => {
    if (errorCode === "aborted" && manualStopRef.current) {
      return "";
    }

    if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
      return "Microphone access denied. Enable microphone permission and try again.";
    }

    if (errorCode === "audio-capture") {
      return "No microphone device detected. Check your mic connection and browser input device.";
    }

    if (errorCode === "no-speech") {
      return "No speech was detected. Speak a bit louder and try again.";
    }

    if (errorCode === "network") {
      return "Speech recognition network issue. Check connection and try again.";
    }

    return "Could not capture voice input. Please try again.";
  };

  const sendToBackend = async (text: string) => {
    try {
      const reportKey = userId ? `hasUploadedReport:${userId}` : "hasUploadedReport";
      const hasReport = localStorage.getItem(reportKey) === "true";
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, hasReport }),
      });

      if (!res.ok) {
        throw new Error("Failed summary request");
      }

      const data = (await res.json()) as ChatApiResponse;
      const aiSummary =
        typeof data.summary === "string" && data.summary.trim()
          ? data.summary
          : "Thanks for sharing. Let's turn this into one small healthy action today.";

      setRisk(data.risk ?? null);
      setDoctorRecommendation(data.doctorRecommendation ?? null);

      setSummary(aiSummary);
      return aiSummary;
    } catch {
      const fallback = buildContextualFallback(text);
      setRisk(null);
      setDoctorRecommendation(null);
      setSummary(fallback);
      return fallback;
    }
  };

  const sendMessage = async (textValue?: string) => {
    const payload = (textValue ?? input).trim();
    if (!payload) return;

    setMessages((prev) => [...prev, { role: "user", content: payload }]);
    if (!textValue) {
      setInput("");
    }

    const aiSummary = await sendToBackend(payload);
    setMessages((prev) => [...prev, { role: "ai", content: aiSummary }]);
  };

  const startRecording = async () => {
    setVoiceError("");

    if (isRecording && recognitionRef.current) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognitionClass =
      (
        window as Window & {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
          SpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
          SpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).SpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceError("Speech recognition is not supported in this browser.");
      return;
    }

    const hasMicAccess = await requestMicAccess();
    if (!hasMicAccess) {
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;
    manualStopRef.current = false;
    finalizedTranscriptRef.current = "";
    recognition.lang = voiceLanguage;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    (recognition as BrowserSpeechRecognition & SpeechRecognitionConfigurable).continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      const finalText = finalizedTranscriptRef.current.trim();
      if (finalText) {
        setTranscript(finalText);
        setInput(finalText);
        void sendMessage(finalText);
      }
      finalizedTranscriptRef.current = "";
      manualStopRef.current = false;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const message = resolveSpeechError(event?.error);
      if (message) {
        setVoiceError(message);
      }
      setIsRecording(false);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const resultStart = event.resultIndex ?? 0;
      let finalChunk = "";
      let interimChunk = "";

      if (!event.results) {
        return;
      }

      for (let i = resultStart; i < event.results.length; i += 1) {
        const result = event.results[i];
        const segment = result?.[0]?.transcript?.trim();
        if (!segment) continue;

        if (result.isFinal) {
          finalChunk += `${segment} `;
        } else {
          interimChunk += `${segment} `;
        }
      }

      if (finalChunk.trim()) {
        const nextFinal = `${finalizedTranscriptRef.current} ${finalChunk}`.trim();
        finalizedTranscriptRef.current = nextFinal;
      }

      const liveText = `${finalizedTranscriptRef.current} ${interimChunk}`.trim();
      if (liveText) {
        setTranscript(liveText);
        setInput(liveText);
      }
    };

    try {
      recognition.start();
    } catch {
      setVoiceError("Voice recording could not start. Please try again.");
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 pb-40">

      <div className="text-2xl font-semibold mb-4 flex items-center gap-2">
        🤖 AI Coach
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-[30px] max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-linear-to-r from-blue-500 to-purple-500 text-white"
                : "bg-slate-800/80 backdrop-blur-xl border border-slate-700"
            }`}
          >
            {msg.content}
          </div>
        ))}

      </div>

      {(transcript || summary || voiceError) && (
        <div className="app-card mb-4 rounded-2xl p-4 text-sm space-y-2">
          {transcript && (
            <p className="text-slate-200">
              <strong>Transcript:</strong> {transcript}
            </p>
          )}
          {summary && (
            <p className="text-blue-300">
              <strong>AI Summary:</strong> {summary}
            </p>
          )}
          {voiceError && <p className="text-red-300">{voiceError}</p>}

          {risk?.shouldSeeDoctor && doctorRecommendation && (
            <DoctorCard doctor={doctorRecommendation} />
          )}
        </div>
      )}

      <div className="fixed bottom-24 left-1/2 w-full max-w-120 -translate-x-1/2 px-6">
        <div className="flex bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full p-2 shadow-xl">
          <input
            className="flex-1 bg-transparent px-4 text-slate-200 outline-none"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={() => {
              if (isRecording) {
                return;
              }

              setVoiceLanguage((prev) => (prev === "en-US" ? "hu-HU" : "en-US"));
            }}
            disabled={isRecording}
            className="px-3 py-2 rounded-full mr-2 text-xs bg-slate-700 text-slate-200 disabled:opacity-50"
          >
            {voiceLanguage === "en-US" ? "EN" : "HU"}
          </button>
          <button
            onClick={() => {
              void startRecording();
            }}
            className={`px-4 py-2 rounded-full mr-2 text-sm ${
              isRecording
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-slate-200"
            }`}
          >
            {isRecording ? "Stop" : "🎤"}
          </button>
          <button
            onClick={() => {
              void sendMessage();
            }}
            className="bg-blue-500 px-5 py-2 rounded-full text-white"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}
