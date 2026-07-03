import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Settings, Shield, Play, Pause, SkipForward, RotateCcw, X, Plus, Pencil, Trash2, ChevronLeft, Send, Lock, Wind, Flower2, Sparkles, Mic, Square, Volume2 } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpVVCueidXAyjH7IPw7SjrnrXUYIfReHQ",
  authDomain: "aqui-estoy-ve.firebaseapp.com",
  projectId: "aqui-estoy-ve",
  storageBucket: "aqui-estoy-ve.firebasestorage.app",
  messagingSenderId: "235637920552",
  appId: "1:235637920552:web:99db6400eebfee905a361d"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function storageGet(key) {
  try {
    const ref = doc(db, "appdata", key);
    const snap = await getDoc(ref);
    return snap.exists() ? { value: snap.data().value } : null;
  } catch (e) {
    console.error("Error leyendo", key, e);
    return null;
  }
}

async function storageSet(key, value) {
  try {
    const ref = doc(db, "appdata", key);
    await setDoc(ref, { value });
    return true;
  } catch (e) {
    console.error("Error guardando", key, e);
    return false;
  }
}

// Checkins privados siguen en localStorage
function localGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function localSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

// cámbiala aquí si quieres otra clave
const INSTRUCTOR_PASSCODE = "namaste2026";

const DEFAULT_SESSIONS = [
  {
    id: "default-1",
    title: "Respiración Calmante",
    type: "respiracion",
    duration: 5,
    description: "Una práctica sencilla para bajar la activación del cuerpo cuando todo se siente demasiado.",
    steps: [
      { id: "s1", name: "Acomódate", seconds: 20, instruction: "Busca una posición cómoda, sentada o acostada. No tiene que ser perfecta, solo segura para ti en este momento." },
      { id: "s2", name: "Inhala en 4", seconds: 30, instruction: "Inhala por la nariz contando hasta 4, despacio. Siente cómo se llena tu abdomen." },
      { id: "s3", name: "Sostén en 4", seconds: 30, instruction: "Sostén el aire suavemente contando hasta 4. Sin forzar." },
      { id: "s4", name: "Exhala en 6", seconds: 40, instruction: "Suelta el aire por la boca contando hasta 6, dejando que los hombros bajen." },
      { id: "s5", name: "Repite a tu ritmo", seconds: 60, instruction: "Sigue este ciclo a tu propio ritmo. Estás a salvo en este momento, aquí, respirando." },
    ],
  },
  {
    id: "default-2",
    title: "Anclaje 5-4-3-2-1",
    type: "meditacion",
    duration: 6,
    description: "Una técnica de los sentidos para volver al presente cuando la mente está en alerta.",
    steps: [
      { id: "a1", name: "5 cosas que ves", seconds: 40, instruction: "Mira a tu alrededor y nombra, despacio, 5 cosas que puedas ver." },
      { id: "a2", name: "4 cosas que tocas", seconds: 35, instruction: "Nota 4 cosas que puedas tocar: la textura de tu ropa, el suelo bajo tus pies." },
      { id: "a3", name: "3 cosas que escuchas", seconds: 30, instruction: "Escucha con atención y nombra 3 sonidos a tu alrededor." },
      { id: "a4", name: "2 cosas que hueles", seconds: 25, instruction: "Identifica 2 olores, aunque sean sutiles." },
      { id: "a5", name: "1 cosa que agradeces", seconds: 30, instruction: "Termina nombrando una sola cosa, pequeña, que agradeces en este instante." },
    ],
  },
  {
    id: "default-3",
    title: "Yoga Suave del Trauma",
    type: "yoga",
    duration: 8,
    description: "Movimientos lentos y seguros, pensados para reconectar con el cuerpo sin exigirle nada.",
    steps: [
      { id: "y1", name: "Postura de montaña", seconds: 40, instruction: "De pie, pies separados al ancho de cadera. Siente tus pies en el suelo, firmes." },
      { id: "y2", name: "Estiramiento de brazos", seconds: 45, instruction: "Eleva los brazos despacio al inhalar, bájalos al exhalar. Solo hasta donde se sienta bien." },
      { id: "y3", name: "Torsión suave sentada", seconds: 50, instruction: "Siéntate y gira el torso suavemente hacia un lado, luego hacia el otro. Sin forzar." },
      { id: "y4", name: "Postura del niño", seconds: 60, instruction: "Si tu cuerpo lo permite, dobla las rodillas y reposa el torso sobre ellas. Si no, simplemente inclina la cabeza hacia adelante sentada." },
      { id: "y5", name: "Reposo final", seconds: 45, instruction: "Quédate quieta, sintiendo el peso de tu cuerpo apoyado. Has hecho suficiente." },
    ],
  },
  {
    id: "default-4",
    title: "Meditación de Compasión",
    type: "meditacion",
    duration: 7,
    description: "Una práctica para ofrecerte a ti misma la misma ternura que le darías a alguien que amas.",
    steps: [
      { id: "c1", name: "Mano en el corazón", seconds: 30, instruction: "Coloca una mano sobre tu pecho. Siente el calor, el latido." },
      { id: "c2", name: "Reconoce el dolor", seconds: 40, instruction: "Reconoce, sin juzgar, que este ha sido un momento difícil. Es válido sentir lo que sientes." },
      { id: "c3", name: "Frase de compasión", seconds: 45, instruction: "Repite en silencio: 'Que esté a salvo, que esté en calma, que sea amable conmigo misma.'" },
      { id: "c4", name: "Extiende la compasión", seconds: 40, instruction: "Piensa en otras personas que también están sanando, y desea lo mismo para ellas." },
      { id: "c5", name: "Cierre", seconds: 30, instruction: "Respira hondo una vez más. Lleva esta ternura contigo el resto del día." },
    ],
  },
];

const MOODS = [
  { id: "tranquila", emoji: "😌", label: "Más tranquila" },
  { id: "hablar", emoji: "😢", label: "Necesito hablar" },
  { id: "mejor", emoji: "🙏", label: "Mejor" },
  { id: "igual", emoji: "😐", label: "Igual" },
];

const TYPE_META = {
  respiracion: { label: "Respiración", icon: Wind, color: "#2A9D8F" },
  yoga: { label: "Yoga", icon: Flower2, color: "#D4A537" },
  meditacion: { label: "Meditación", icon: Sparkles, color: "#1B4965" },
};

function base64Size(base64) {
  if (!base64) return 0;
  const clean = base64.split(",").pop() || "";
  return Math.ceil((clean.length * 3) / 4);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Cloudinary — subida de audios sin límite de tamaño
const CLOUDINARY_CLOUD_NAME = "wjoapyux";
const CLOUDINARY_UPLOAD_PRESET = "aquiestoy_audio"; // unsigned preset (lo creamos abajo)

async function uploadAudioToCloudinary(blob) {
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "video"); // Cloudinary usa "video" para audio
  formData.append("folder", "aquiestoy");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Error subiendo audio");
  const data = await res.json();
  return data.secure_url; // URL pública del audio
}

function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (e) {
      setError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  }, []);

  const stop = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) { resolve(null); return; }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setUploading(true);
        try {
          const url = await uploadAudioToCloudinary(blob);
          setUploading(false);
          resolve(url);
        } catch (e) {
          setUploading(false);
          setError("No se pudo subir el audio. Verifica tu conexión e intenta de nuevo.");
          resolve(null);
        }
      };
      recorder.stop();
    });
  }, []);

  return { recording, uploading, error, start, stop, setError };
}

function AudioStepRecorder({ audioData, onChange }) {
  const { recording, uploading, error, start, stop } = useAudioRecorder();

  const handleToggle = async () => {
    if (recording) {
      const url = await stop();
      if (url) onChange(url);
    } else {
      await start();
    }
  };

  const handleRemove = () => onChange(null);

  return (
    <div style={styles.audioRecorderBox}>
      <div style={styles.audioRecorderRow}>
        <button
          type="button"
          style={recording ? styles.audioRecordButtonActive : styles.audioRecordButton}
          onClick={handleToggle}
          disabled={uploading}
        >
          {recording ? <Square size={14} color="#FFFFFF" /> : <Mic size={14} color="#FFFFFF" />}
          <span>
            {uploading ? "Subiendo audio..." : recording ? "Detener grabación" : audioData ? "Regrabar voz" : "Grabar voz para este paso"}
          </span>
        </button>
        {audioData && !recording && !uploading && (
          <button type="button" style={styles.iconButtonDanger} onClick={handleRemove} aria-label="Eliminar audio">
            <Trash2 size={14} color="#B3441E" />
          </button>
        )}
      </div>
      {audioData && !recording && !uploading && (
        <audio style={styles.audioPlayer} controls src={audioData} />
      )}
      {uploading && <p style={styles.hintText}>⏳ Subiendo a la nube, espera un momento...</p>}
      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home, settings, gate, instructors, player, history
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [emergencyNumber, setEmergencyNumber] = useState("+58 4141121308");
  const [whatsappNumber, setWhatsappNumber] = useState("+584126064772");
  const [instructorUnlocked, setInstructorUnlocked] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [savedSessions, savedNumber, savedCheckins, savedWhatsapp] = await Promise.all([
        storageGet("sessions"),
        storageGet("emergency_number"),
        Promise.resolve(localGet("checkins")),
        storageGet("whatsapp_number"),
      ]);
      if (!mounted) return;
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) setSessions(parsed);
        } catch (e) {}
      }
      if (savedNumber) setEmergencyNumber(savedNumber);
      if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);
      if (savedCheckins) {
        try {
          const parsed = JSON.parse(savedCheckins);
          if (Array.isArray(parsed)) setCheckins(parsed);
        } catch (e) {}
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistSessions = useCallback(async (next) => {
    setSessions(next);
    const ok = await storageSet("sessions", JSON.stringify(next));
    if (!ok) setSaveError("No se pudo guardar el cambio. Intenta de nuevo en unos segundos.");
    else setSaveError("");
  }, []);

  const persistEmergencyNumber = useCallback(async (num) => {
    setEmergencyNumber(num);
    const ok = await storageSet("emergency_number", num);
    return ok;
  }, []);

  const persistWhatsappNumber = useCallback(async (num) => {
    setWhatsappNumber(num);
    const ok = await storageSet("whatsapp_number", num);
    return ok;
  }, []);

  const persistCheckin = useCallback(
    async (entry) => {
      const next = [...checkins, entry];
      setCheckins(next);
      localSet("checkins", JSON.stringify(next));
    },
    [checkins]
  );

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingDot} />
        <p style={styles.loadingText}>Preparando un espacio tranquilo...</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {screen === "home" && (
        <HomeScreen
          sessions={sessions}
          emergencyNumber={emergencyNumber}
          whatsappNumber={whatsappNumber}
          onOpenSettings={() => setScreen("settings")}
          onOpenGate={() => setScreen(instructorUnlocked ? "instructors" : "gate")}
          onStartSession={(id) => {
            setActiveSessionId(id);
            setScreen("player");
          }}
          onOpenHistory={() => setScreen("history")}
        />
      )}
      {screen === "settings" && (
        <SettingsScreen
          emergencyNumber={emergencyNumber}
          whatsappNumber={whatsappNumber}
          onSave={persistEmergencyNumber}
          onSaveWhatsapp={persistWhatsappNumber}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "gate" && (
        <PasscodeGate
          onUnlock={() => {
            setInstructorUnlocked(true);
            setScreen("instructors");
          }}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "instructors" && (
        <InstructorPanel
          sessions={sessions}
          onChange={persistSessions}
          saveError={saveError}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "player" && activeSession && (
        <SessionPlayer
          session={activeSession}
          onExit={() => {
            setActiveSessionId(null);
            setScreen("home");
          }}
          onFinish={(mood) => {
            persistCheckin({
              sessionId: activeSession.id,
              sessionTitle: activeSession.title,
              mood,
              date: new Date().toISOString(),
            });
            setActiveSessionId(null);
            setScreen("home");
          }}
        />
      )}
      {screen === "history" && (
        <HistoryScreen checkins={checkins} onBack={() => setScreen("home")} />
      )}
      <WellnessChat emergencyNumber={emergencyNumber} />
    </div>
  );
}

function EmergencyBanner({ number, whatsapp }) {
  const waClean = (whatsapp || "").replace(/\D/g, "");
  const waLink = `https://wa.me/${waClean}`;
  return (
    <div style={styles.emergencyBanner}>
      <Shield size={18} color="#E8A0C4" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={styles.emergencyBannerTitle}>Ayuda emocional — estamos aquí</div>
        <div style={styles.emergencyBannerNumber}>{number || "Número no configurado"}</div>
        {whatsapp && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.emergencyBannerWhatsapp}
          >
            💬 WhatsApp: {whatsapp}
          </a>
        )}
      </div>
    </div>
  );
}

function HomeScreen({ sessions, emergencyNumber, whatsappNumber, onOpenSettings, onOpenGate, onStartSession, onOpenHistory }) {
  return (
    <div style={styles.screen}>
      <header style={styles.homeHeader}>
        <div style={styles.homeHeaderTop}>
          <Heart size={22} color={COLORS.gold} />
          <button style={styles.iconButtonGhost} onClick={onOpenSettings} aria-label="Configuración">
            <Settings size={20} color="#EAF4F4" />
          </button>
        </div>
        <h1 style={styles.homeTitle}>Aquí estoy</h1>
        <p style={styles.homeSubtitle}>Un espacio para respirar, sentir y acompañarnos en tiempos difíciles.</p>
      </header>

      <EmergencyBanner number={emergencyNumber} whatsapp={whatsappNumber} />

      <div style={styles.sectionLabel}>Sesiones guiadas</div>
      <div style={styles.sessionList}>
        {sessions.map((s) => {
          const meta = TYPE_META[s.type] || TYPE_META.meditacion;
          const Icon = meta.icon;
          return (
            <button key={s.id} style={styles.sessionCard} onClick={() => onStartSession(s.id)}>
              <div style={{ ...styles.sessionIconWrap, backgroundColor: `${meta.color}22` }}>
                <Icon size={20} color={meta.color} />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.sessionCardTitle}>{s.title}</div>
                <div style={styles.sessionCardMeta}>
                  {meta.label} · {s.duration} min
                </div>
                <div style={styles.sessionCardDesc}>{s.description}</div>
              </div>
            </button>
          );
        })}
        {sessions.length === 0 && (
          <p style={styles.emptyText}>Aún no hay sesiones disponibles. Vuelve pronto.</p>
        )}
      </div>

      <button style={styles.textLink} onClick={onOpenHistory}>
        Ver mi progreso
      </button>

      <div style={styles.footerRow}>
        <button style={styles.instructorButton} onClick={onOpenGate}>
          <Settings size={14} color="#9FB8B8" />
          <span>Para instructoras</span>
        </button>
      </div>
      <p style={styles.footerPhrase}>juntos somos invencibles</p>
    </div>
  );
}

function SettingsScreen({ emergencyNumber, whatsappNumber, onSave, onSaveWhatsapp, onBack }) {
  const [value, setValue] = useState(emergencyNumber);
  const [waValue, setWaValue] = useState(whatsappNumber);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSave = async () => {
    if (!value.trim()) { setError("Escribe un número antes de guardar."); return; }
    setError(""); setStatus("saving");
    const ok1 = await onSave(value.trim());
    const ok2 = await onSaveWhatsapp(waValue.trim());
    setStatus(ok1 && ok2 ? "saved" : "idle");
    if (!ok1 || !ok2) setError("No se pudo guardar. Intenta de nuevo.");
    if (ok1 && ok2) setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div style={styles.screen}>
      <TopBar title="Configuración" onBack={onBack} />
      <div style={styles.card}>
        <label style={styles.label}>Línea de ayuda emocional (llamadas)</label>
        <p style={styles.hintText}>Aparece en el banner de inicio para todas las personas que usan la app.</p>
        <input style={styles.input} type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ej. +58 4141121308" />

        <label style={styles.label}>Número de WhatsApp</label>
        <p style={styles.hintText}>Se mostrará como enlace directo a WhatsApp en el banner de emergencia.</p>
        <input style={styles.input} type="text" value={waValue} onChange={(e) => setWaValue(e.target.value)} placeholder="Ej. +584126064772" />

        {error && <p style={styles.errorText}>{error}</p>}
        <button style={styles.primaryButton} onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? "Guardando..." : status === "saved" ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function PasscodeGate({ onUnlock, onBack }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (value === INSTRUCTOR_PASSCODE) {
      setError("");
      onUnlock();
    } else {
      setError("Clave incorrecta. Intenta de nuevo.");
    }
  };

  return (
    <div style={styles.screen}>
      <TopBar title="Acceso de instructoras" onBack={onBack} />
      <div style={styles.card}>
        <div style={styles.lockIconWrap}>
          <Lock size={24} color="#C9A4E0" />
        </div>
        <label style={styles.label}>Clave de acceso</label>
        <input
          style={styles.input}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Escribe la clave"
        />
        {error && <p style={styles.errorText}>{error}</p>}
        <button style={styles.primaryButton} onClick={handleSubmit}>
          Entrar
        </button>
      </div>
    </div>
  );
}

function InstructorPanel({ sessions, onChange, saveError, onBack }) {
  const [editingSession, setEditingSession] = useState(null); // null = list view, "new" or session object
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = (id) => {
    onChange(sessions.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  const handleSaveSession = (sessionData) => {
    const exists = sessions.some((s) => s.id === sessionData.id);
    if (exists) {
      onChange(sessions.map((s) => (s.id === sessionData.id ? sessionData : s)));
    } else {
      onChange([...sessions, sessionData]);
    }
    setEditingSession(null);
  };

  if (editingSession) {
    return (
      <SessionEditor
        session={editingSession === "new" ? null : editingSession}
        onSave={handleSaveSession}
        onCancel={() => setEditingSession(null)}
      />
    );
  }

  return (
    <div style={styles.screen}>
      <TopBar title="Panel de instructoras" onBack={onBack} />
      {saveError && <p style={styles.errorText}>{saveError}</p>}
      <p style={styles.hintText}>
        Los cambios que hagas aquí se guardan para todas las personas que usen la app.
      </p>
      <button style={styles.newSessionButton} onClick={() => setEditingSession("new")}>
        <Plus size={18} color="#FFFFFF" />
        <span>Nueva sesión</span>
      </button>
      <div style={styles.sessionList}>
        {sessions.map((s) => {
          const meta = TYPE_META[s.type] || TYPE_META.meditacion;
          return (
            <div key={s.id} style={styles.adminCard}>
              <div style={{ flex: 1 }}>
                <div style={styles.sessionCardTitle}>{s.title}</div>
                <div style={styles.sessionCardMeta}>
                  {meta.label} · {s.duration} min · {s.steps.length} pasos
                </div>
              </div>
              <div style={styles.adminActions}>
                <button style={styles.iconButton} onClick={() => setEditingSession(s)} aria-label="Editar">
                  <Pencil size={16} color="#C9A4E0" />
                </button>
                <button
                  style={styles.iconButtonDanger}
                  onClick={() => setConfirmDeleteId(s.id)}
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} color="#B3441E" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmDeleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <p style={styles.modalText}>¿Eliminar esta sesión? Esta acción no se puede deshacer.</p>
            <div style={styles.modalActions}>
              <button style={styles.secondaryButton} onClick={() => setConfirmDeleteId(null)}>
                Cancelar
              </button>
              <button style={styles.dangerButton} onClick={() => handleDelete(confirmDeleteId)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionEditor({ session, onSave, onCancel }) {
  const [title, setTitle] = useState(session?.title || "");
  const [type, setType] = useState(session?.type || "meditacion");
  const [duration, setDuration] = useState(session?.duration || 5);
  const [description, setDescription] = useState(session?.description || "");
  const [steps, setSteps] = useState(session?.steps || []);
  const [error, setError] = useState("");

  const addStep = () => {
    setSteps([...steps, { id: uid("step"), name: "", seconds: 30, instruction: "", audioData: null }]);
  };

  const updateStep = (id, field, value) => {
    setSteps(steps.map((st) => (st.id === id ? { ...st, [field]: value } : st)));
  };

  const removeStep = (id) => {
    setSteps(steps.filter((st) => st.id !== id));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Ponle un título a la sesión.");
      return;
    }
    if (steps.length === 0) {
      setError("Agrega al menos un paso.");
      return;
    }
    if (steps.some((st) => !st.name.trim() || !st.instruction.trim())) {
      setError("Cada paso necesita nombre e instrucción.");
      return;
    }
    const totalAudioBytes = steps.reduce((sum, st) => sum + base64Size(st.audioData), 0);
    if (totalAudioBytes > MAX_AUDIO_BYTES * 3) {
      setError("Los audios de esta sesión pesan demasiado en conjunto. Acorta o quita alguna grabación.");
      return;
    }
    setError("");
    onSave({
      id: session?.id || uid("session"),
      title: title.trim(),
      type,
      duration: Number(duration) || 1,
      description: description.trim(),
      steps: steps.map((st) => ({ ...st, seconds: Number(st.seconds) || 10 })),
    });
  };

  return (
    <div style={styles.screen}>
      <TopBar title={session ? "Editar sesión" : "Nueva sesión"} onBack={onCancel} />
      <div style={styles.card}>
        <label style={styles.label}>Título</label>
        <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Respiración para dormir" />

        <label style={styles.label}>Tipo</label>
        <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="respiracion">Respiración</option>
          <option value="yoga">Yoga</option>
          <option value="meditacion">Meditación</option>
        </select>

        <label style={styles.label}>Duración (minutos)</label>
        <input
          style={styles.input}
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <label style={styles.label}>Descripción</label>
        <textarea
          style={{ ...styles.input, minHeight: 70, resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Una frase corta sobre para qué sirve esta sesión"
        />
      </div>

      <div style={styles.sectionLabel}>Pasos</div>
      <div style={styles.stepsList}>
        {steps.map((st, idx) => (
          <div key={st.id} style={styles.stepEditorCard}>
            <div style={styles.stepEditorHeader}>
              <span style={styles.stepEditorNumber}>{idx + 1}</span>
              <button style={styles.iconButtonDanger} onClick={() => removeStep(st.id)} aria-label="Eliminar paso">
                <Trash2 size={14} color="#B3441E" />
              </button>
            </div>
            <label style={styles.labelSmall}>Nombre del paso</label>
            <input
              style={styles.input}
              value={st.name}
              onChange={(e) => updateStep(st.id, "name", e.target.value)}
              placeholder="Ej. Inhala profundo"
            />
            <label style={styles.labelSmall}>Duración (segundos)</label>
            <input
              style={styles.input}
              type="number"
              min="5"
              value={st.seconds}
              onChange={(e) => updateStep(st.id, "seconds", e.target.value)}
            />
            <label style={styles.labelSmall}>Instrucción</label>
            <textarea
              style={{ ...styles.input, minHeight: 60, resize: "vertical" }}
              value={st.instruction}
              onChange={(e) => updateStep(st.id, "instruction", e.target.value)}
              placeholder="Texto que verá la persona durante este paso"
            />
            <label style={styles.labelSmall}>Audio guía (opcional)</label>
            <AudioStepRecorder
              audioData={st.audioData}
              onChange={(data) => updateStep(st.id, "audioData", data)}
            />
          </div>
        ))}
      </div>
      <button style={styles.secondaryButtonFull} onClick={addStep}>
        <Plus size={16} color="#C9A4E0" />
        <span>Agregar paso</span>
      </button>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.modalActions}>
        <button style={styles.secondaryButton} onClick={onCancel}>
          Cancelar
        </button>
        <button style={styles.primaryButton} onClick={handleSubmit}>
          Guardar sesión
        </button>
      </div>
    </div>
  );
}

function SessionPlayer({ session, onExit, onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(session.steps[0]?.seconds || 30);
  const [playing, setPlaying] = useState(true);
  const [showMoodScreen, setShowMoodScreen] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const currentStep = session.steps[stepIndex];

  useEffect(() => {
    setSecondsLeft(session.steps[stepIndex]?.seconds || 30);
  }, [stepIndex, session]);

  // Sincroniza el audio guía del paso con play/pause y con el cambio de paso
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !currentStep?.audioData) return;
    if (playing) {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, currentStep?.audioData]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !currentStep?.audioData) return;
    if (playing) {
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
  }, [playing, currentStep?.audioData]);

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (stepIndex < session.steps.length - 1) {
            setStepIndex((i) => i + 1);
            return session.steps[stepIndex + 1]?.seconds || 30;
          } else {
            setPlaying(false);
            setShowMoodScreen(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, stepIndex, session]);

  const handleRepeat = () => {
    setSecondsLeft(currentStep?.seconds || 30);
    if (audioRef.current && currentStep?.audioData) {
      audioRef.current.currentTime = 0;
      if (playing) audioRef.current.play().catch(() => {});
    }
  };

  const handleSkip = () => {
    if (stepIndex < session.steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setPlaying(false);
      setShowMoodScreen(true);
    }
  };

  if (showMoodScreen) {
    return (
      <div style={styles.screen}>
        <div style={styles.moodScreen}>
          <h2 style={styles.moodTitle}>¿Cómo te sentiste?</h2>
          <p style={styles.hintText}>Tu respuesta es privada y solo la ves tú, para acompañar tu progreso.</p>
          <div style={styles.moodGrid}>
            {MOODS.map((m) => (
              <button key={m.id} style={styles.moodButton} onClick={() => onFinish(m.id)}>
                <span style={styles.moodEmoji}>{m.emoji}</span>
                <span style={styles.moodLabel}>{m.label}</span>
              </button>
            ))}
          </div>
          <button style={styles.textLink} onClick={() => onFinish("sin_responder")}>
            Omitir
          </button>
        </div>
      </div>
    );
  }

  const meta = TYPE_META[session.type] || TYPE_META.meditacion;
  const progress = ((stepIndex + (currentStep ? (currentStep.seconds - secondsLeft) / currentStep.seconds : 0)) / session.steps.length) * 100;

  return (
    <div style={styles.screen}>
      <TopBar title={session.title} onBack={onExit} />
      <div style={styles.progressBarTrack}>
        <div style={{ ...styles.progressBarFill, width: `${Math.min(progress, 100)}%`, backgroundColor: meta.color }} />
      </div>
      <div style={styles.playerCard}>
        <div style={styles.playerStepCounter}>
          Paso {stepIndex + 1} de {session.steps.length}
        </div>
        <h2 style={styles.playerStepName}>{currentStep?.name}</h2>
        {currentStep?.audioData && (
          <div style={styles.audioBadge}>
            <Volume2 size={13} color={COLORS.teal} />
            <span>Con audio guía de la instructora</span>
          </div>
        )}
        <p style={styles.playerInstruction}>{currentStep?.instruction}</p>
        {currentStep?.audioData && (
          <audio ref={audioRef} src={currentStep.audioData} style={{ display: "none" }} />
        )}
        <div style={styles.playerTimer}>{secondsLeft}s</div>

        <div style={styles.playerControlsRow}>
          <button style={styles.controlButtonSecondary} onClick={handleRepeat} aria-label="Repetir paso">
            <RotateCcw size={18} color="#C9A4E0" />
          </button>
          <button style={styles.controlButtonPrimary} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pausar" : "Reproducir"}>
            {playing ? <Pause size={26} color="#FFFFFF" /> : <Play size={26} color="#FFFFFF" />}
          </button>
          <button style={styles.controlButtonSecondary} onClick={handleSkip} aria-label="Siguiente paso">
            <SkipForward size={18} color="#C9A4E0" />
          </button>
        </div>
        <div style={styles.playerControlLabels}>
          <span>Repetir</span>
          <span>{playing ? "Pausa" : "Reproducir"}</span>
          <span>Saltar</span>
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ checkins, onBack }) {
  const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div style={styles.screen}>
      <TopBar title="Mi progreso" onBack={onBack} />
      {sorted.length === 0 ? (
        <p style={styles.emptyText}>Cuando termines una sesión, tu registro aparecerá aquí.</p>
      ) : (
        <div style={styles.sessionList}>
          {sorted.map((c, idx) => {
            const mood = MOODS.find((m) => m.id === c.mood);
            const date = new Date(c.date);
            return (
              <div key={idx} style={styles.historyCard}>
                <span style={styles.historyEmoji}>{mood ? mood.emoji : "•"}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.sessionCardTitle}>{c.sessionTitle}</div>
                  <div style={styles.sessionCardMeta}>
                    {mood ? mood.label : "Sin respuesta"} ·{" "}
                    {date.toLocaleDateString("es-VE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div style={styles.topBar}>
      <button style={styles.iconButtonGhostDark} onClick={onBack} aria-label="Volver">
        <ChevronLeft size={22} color="#C9A4E0" />
      </button>
      <h2 style={styles.topBarTitle}>{title}</h2>
      <div style={{ width: 36 }} />
    </div>
  );
}

function WellnessChat({ emergencyNumber }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hola, soy tu Acompañante de Bienestar. Estoy aquí para escucharte, sin prisa. ¿Cómo te sientes hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system:
            "Eres un Acompañante de Bienestar para sobrevivientes del terremoto de Venezuela del 24 de junio de 2026. Hablas en español venezolano, con calidez, calma y validación emocional, sin tecnicismos clínicos. No das diagnósticos médicos. Si detectas riesgo de crisis o ideas de autolesión, recuerda con dulzura que puede llamar a la línea de ayuda emocional disponible en la app, y anímala a buscar apoyo humano real. Mantén respuestas breves, cálidas y centradas en la persona.",
          messages: newMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      const textBlock = (data.content || []).find((c) => c.type === "text");
      const reply = textBlock ? textBlock.text : "Estoy aquí contigo. ¿Puedes contarme un poco más?";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `No pude responder en este momento. Si necesitas hablar con alguien ahora, recuerda que puedes llamar a ${emergencyNumber}.`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button style={styles.chatFab} onClick={() => setOpen(true)} aria-label="Abrir Acompañante de Bienestar">
        <Heart size={22} color="#FFFFFF" />
      </button>
    );
  }

  return (
    <div style={styles.chatPanel}>
      <div style={styles.chatHeader}>
        <span style={styles.chatHeaderTitle}>Acompañante de Bienestar</span>
        <button style={styles.iconButtonGhost} onClick={() => setOpen(false)} aria-label="Cerrar chat">
          <X size={18} color="#EAF4F4" />
        </button>
      </div>
      <div style={styles.chatMessages} ref={scrollRef}>
        {messages.map((m, idx) => (
          <div key={idx} style={m.role === "user" ? styles.chatBubbleUser : styles.chatBubbleAssistant}>
            {m.text}
          </div>
        ))}
        {sending && <div style={styles.chatBubbleAssistant}>Escribiendo...</div>}
      </div>
      <div style={styles.chatInputRow}>
        <input
          style={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe lo que sientes..."
        />
        <button style={styles.chatSendButton} onClick={handleSend} disabled={sending} aria-label="Enviar mensaje">
          <Send size={16} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}

// Paleta "Aquí estoy": violeta profundo nocturno, lavanda suave como acento cálido,
// y un fondo casi negro-morado para el efecto de cielo estrellado, muy sutil.
const COLORS = {
  deepBlue: "#3B2A5E", // violeta profundo — antes azul, ahora acento principal/headers
  deepBlueDark: "#241A3D", // violeta más oscuro — antes azul oscuro
  teal: "#8B7BC7", // lavanda medio — antes teal, botones primarios/acentos activos
  gold: "#C9A4E0", // lavanda claro — antes dorado, acento secundario/fab
  cream: "#16101F", // fondo general casi negro-violeta — antes crema claro
  textDark: "#EDE7F6", // texto principal claro sobre fondo oscuro
  textMuted: "#A99BC4", // texto secundario lavanda apagado
  danger: "#C2548A", // rosado-violeta para emergencia, mantiene urgencia sin romper la paleta
  border: "#3A2E54", // bordes sutiles sobre fondo oscuro
  surface: "#1F1730", // tarjetas/superficies elevadas sobre el fondo
};

const styles = {
  app: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: COLORS.cream,
    backgroundImage: `
      radial-gradient(1px 1px at 7% 11%, rgba(201,164,224,0.7) 0%, transparent 70%),
      radial-gradient(1px 1px at 19% 53%, rgba(201,164,224,0.45) 0%, transparent 70%),
      radial-gradient(1.5px 1.5px at 31% 8%, rgba(201,164,224,0.6) 0%, transparent 70%),
      radial-gradient(1px 1px at 44% 72%, rgba(201,164,224,0.4) 0%, transparent 70%),
      radial-gradient(1px 1px at 53% 29%, rgba(201,164,224,0.5) 0%, transparent 70%),
      radial-gradient(2px 2px at 62% 86%, rgba(201,164,224,0.3) 0%, transparent 70%),
      radial-gradient(1px 1px at 74% 17%, rgba(201,164,224,0.55) 0%, transparent 70%),
      radial-gradient(1px 1px at 83% 61%, rgba(201,164,224,0.4) 0%, transparent 70%),
      radial-gradient(1.5px 1.5px at 91% 38%, rgba(201,164,224,0.5) 0%, transparent 70%),
      radial-gradient(1px 1px at 96% 79%, rgba(201,164,224,0.35) 0%, transparent 70%),
      radial-gradient(1px 1px at 25% 90%, rgba(201,164,224,0.4) 0%, transparent 70%),
      radial-gradient(1px 1px at 68% 45%, rgba(201,164,224,0.3) 0%, transparent 70%),
      radial-gradient(1px 1px at 48% 95%, rgba(201,164,224,0.35) 0%, transparent 70%),
      radial-gradient(120px 80px at 30% 25%, rgba(80,40,120,0.18) 0%, transparent 70%),
      radial-gradient(100px 60px at 75% 65%, rgba(60,20,100,0.15) 0%, transparent 70%),
      linear-gradient(160deg, #1C1130 0%, #16101F 50%, #110C1C 100%)
    `,
    backgroundAttachment: "fixed",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    position: "relative",
    color: COLORS.textDark,
  },
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16101F",
    color: COLORS.textDark,
    gap: 16,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: COLORS.gold,
  },
  loadingText: { fontSize: 13, opacity: 0.7, fontStyle: "italic", letterSpacing: 0.3 },
  screen: { padding: "24px 20px 110px", boxSizing: "border-box", position: "relative" },
  homeHeader: { padding: "4px 0 30px" },
  homeHeaderTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  homeTitle: { color: COLORS.textDark, fontSize: 32, margin: "0 0 10px", fontWeight: 300, letterSpacing: 0.5, lineHeight: 1.2 },
  homeSubtitle: { color: COLORS.textMuted, fontSize: 13.5, margin: 0, lineHeight: 1.7, fontStyle: "italic", maxWidth: 300 },
  emergencyBanner: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    backgroundColor: "rgba(194,84,138,0.2)",
    border: "1px solid rgba(194,84,138,0.4)",
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 28,
  },
  emergencyBannerTitle: { color: "#E8A0C4", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 },
  emergencyBannerNumber: { color: "#F0C8DE", fontSize: 15, fontWeight: 600, marginTop: 2, letterSpacing: 0.3 },
  emergencyBannerWhatsapp: { display: "block", color: "#A8F0C6", fontSize: 13, marginTop: 6, textDecoration: "none", fontWeight: 500, letterSpacing: 0.2 },
  sectionLabel: { fontSize: 10.5, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, opacity: 0.7 },
  sessionList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 },
  sessionCard: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    backgroundColor: "rgba(31,23,48,0.75)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
  },
  sessionIconWrap: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sessionCardTitle: { fontSize: 15, fontWeight: 500, color: COLORS.textDark, letterSpacing: 0.1 },
  sessionCardMeta: { fontSize: 11.5, color: COLORS.textMuted, marginTop: 3, letterSpacing: 0.3 },
  sessionCardDesc: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.5, opacity: 0.85 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: "center", padding: "24px 0", fontStyle: "italic" },
  textLink: { background: "none", border: "none", color: COLORS.teal, fontSize: 13, fontWeight: 400, padding: "10px 0", cursor: "pointer", display: "block", margin: "0 auto", letterSpacing: 0.3 },
  footerRow: { display: "flex", justifyContent: "center", marginTop: 28 },
  footerPhrase: { textAlign: "center", fontSize: 11, color: "rgba(169,155,196,0.4)", letterSpacing: 1.5, marginTop: 12, fontStyle: "italic" },
  instructorButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: `1px solid rgba(58,46,84,0.6)`,
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 11.5,
    color: "rgba(169,155,196,0.5)",
    cursor: "pointer",
    letterSpacing: 0.3,
  },
  iconButtonGhost: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  iconButtonGhostDark: { background: "none", border: "none", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  topBarTitle: { fontSize: 16, fontWeight: 400, margin: 0, color: COLORS.textDark, letterSpacing: 0.3 },
  card: { backgroundColor: "rgba(31,23,48,0.8)", backdropFilter: "blur(8px)", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 20, marginBottom: 18, display: "flex", flexDirection: "column" },
  label: { fontSize: 12.5, fontWeight: 500, color: COLORS.textDark, marginTop: 14, marginBottom: 6, letterSpacing: 0.2 },
  labelSmall: { fontSize: 11.5, fontWeight: 500, color: COLORS.textMuted, marginTop: 12, marginBottom: 4 },
  hintText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, marginTop: 0, marginBottom: 8, fontStyle: "italic" },
  input: { backgroundColor: "rgba(22,16,31,0.6)", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, fontFamily: "inherit", color: COLORS.textDark, outline: "none", boxSizing: "border-box", width: "100%" },
  errorText: { color: "#E89ABF", fontSize: 12, marginTop: 8, marginBottom: 0 },
  primaryButton: { backgroundColor: COLORS.teal, color: "#F0E8FF", border: "none", borderRadius: 12, padding: "13px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 14, letterSpacing: 0.3 },
  secondaryButton: { backgroundColor: "transparent", color: COLORS.gold, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", flex: 1 },
  secondaryButtonFull: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "transparent", color: COLORS.gold, border: `1px dashed ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 13, cursor: "pointer", width: "100%", marginBottom: 18 },
  dangerButton: { backgroundColor: "rgba(194,84,138,0.3)", color: "#F0C0DC", border: "1px solid rgba(194,84,138,0.5)", borderRadius: 12, padding: "12px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", flex: 1 },
  lockIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(42,32,68,0.8)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, alignSelf: "center" },
  newSessionButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.teal, color: "#F0E8FF", border: "none", borderRadius: 12, padding: "13px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", marginBottom: 18 },
  adminCard: { display: "flex", alignItems: "center", gap: 10, backgroundColor: "rgba(31,23,48,0.75)", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12 },
  adminActions: { display: "flex", gap: 6 },
  iconButton: { background: "rgba(42,32,68,0.8)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  iconButtonDanger: { background: "rgba(58,34,64,0.8)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(12,8,20,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 },
  modalCard: { backgroundColor: "#1F1730", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 22, maxWidth: 340, width: "100%" },
  modalText: { fontSize: 14, color: COLORS.textDark, lineHeight: 1.6, marginTop: 0 },
  modalActions: { display: "flex", gap: 10, marginTop: 18 },
  stepsList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 },
  stepEditorCard: { backgroundColor: "rgba(31,23,48,0.75)", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column" },
  stepEditorHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  stepEditorNumber: { fontSize: 11, fontWeight: 700, color: COLORS.teal, backgroundColor: "rgba(42,32,68,0.8)", borderRadius: 999, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" },
  moodScreen: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 36 },
  moodTitle: { fontSize: 22, fontWeight: 300, marginBottom: 6, color: COLORS.textDark, letterSpacing: 0.3 },
  moodGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", marginTop: 22 },
  moodButton: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, backgroundColor: "rgba(31,23,48,0.75)", border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "20px 10px", cursor: "pointer" },
  moodEmoji: { fontSize: 30 },
  moodLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: "center", letterSpacing: 0.2 },
  progressBarTrack: { height: 2, backgroundColor: "rgba(58,46,84,0.6)", borderRadius: 99, overflow: "hidden", marginBottom: 20 },
  progressBarFill: { height: "100%", borderRadius: 99, transition: "width 0.8s ease" },
  playerCard: { backgroundColor: "rgba(31,23,48,0.8)", backdropFilter: "blur(8px)", border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: "32px 22px", textAlign: "center" },
  playerStepCounter: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7 },
  playerStepName: { fontSize: 22, fontWeight: 300, margin: "10px 0 14px", color: COLORS.textDark, letterSpacing: 0.3 },
  playerInstruction: { fontSize: 14, color: COLORS.textMuted, lineHeight: 1.8, minHeight: 64, fontStyle: "italic" },
  playerTimer: { fontSize: 44, fontWeight: 200, color: COLORS.gold, margin: "20px 0", letterSpacing: 2 },
  playerControlsRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 8 },
  controlButtonPrimary: { width: 62, height: 62, borderRadius: "50%", backgroundColor: COLORS.teal, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  controlButtonSecondary: { width: 44, height: 44, borderRadius: "50%", backgroundColor: "rgba(42,32,68,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  playerControlLabels: { display: "flex", justifyContent: "center", gap: 36, marginTop: 10, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5, opacity: 0.6 },
  historyCard: { display: "flex", gap: 12, alignItems: "center", backgroundColor: "rgba(31,23,48,0.75)", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 },
  historyEmoji: { fontSize: 22 },
  audioRecorderBox: { marginTop: 6, display: "flex", flexDirection: "column", gap: 8 },
  audioRecorderRow: { display: "flex", alignItems: "center", gap: 8 },
  audioRecordButton: { display: "flex", alignItems: "center", gap: 7, backgroundColor: "rgba(59,42,94,0.8)", color: COLORS.gold, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "9px 13px", fontSize: 12.5, cursor: "pointer" },
  audioRecordButtonActive: { display: "flex", alignItems: "center", gap: 7, backgroundColor: "rgba(194,84,138,0.3)", color: "#F0C0DC", border: "1px solid rgba(194,84,138,0.4)", borderRadius: 10, padding: "9px 13px", fontSize: 12.5, cursor: "pointer" },
  audioPlayer: { width: "100%", height: 36, filter: "invert(1) hue-rotate(200deg) brightness(0.7)" },
  audioBadge: { display: "inline-flex", alignItems: "center", gap: 5, backgroundColor: "rgba(42,32,68,0.8)", color: COLORS.teal, fontSize: 11, padding: "4px 10px", borderRadius: 999, margin: "0 auto 10px", letterSpacing: 0.3 },
  chatFab: { position: "fixed", bottom: 22, right: "calc(50% - 230px)", width: 50, height: 50, borderRadius: "50%", backgroundColor: "rgba(139,123,199,0.85)", border: "1px solid rgba(201,164,224,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(139,123,199,0.3)" },
  chatPanel: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: "70vh", backgroundColor: "#1A1228", borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: "0 -8px 32px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", zIndex: 60 },
  chatHeader: { backgroundColor: "rgba(59,42,94,0.95)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTopLeftRadius: 22, borderTopRightRadius: 22, borderBottom: `1px solid ${COLORS.border}` },
  chatHeaderTitle: { color: COLORS.gold, fontSize: 14, fontWeight: 400, letterSpacing: 0.3 },
  chatMessages: { flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  chatBubbleUser: { alignSelf: "flex-end", backgroundColor: COLORS.teal, color: "#F0E8FF", padding: "9px 14px", borderRadius: "14px 14px 2px 14px", fontSize: 13.5, maxWidth: "80%", lineHeight: 1.5 },
  chatBubbleAssistant: { alignSelf: "flex-start", backgroundColor: "rgba(42,32,68,0.9)", color: COLORS.textDark, padding: "9px 14px", borderRadius: "14px 14px 14px 2px", fontSize: 13.5, maxWidth: "85%", lineHeight: 1.5 },
  chatInputRow: { display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${COLORS.border}` },
  chatInput: { flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "10px 14px", fontSize: 13.5, outline: "none", backgroundColor: "rgba(22,16,31,0.8)", color: COLORS.textDark },
  chatSendButton: { width: 38, height: 38, borderRadius: "50%", backgroundColor: COLORS.teal, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
};
