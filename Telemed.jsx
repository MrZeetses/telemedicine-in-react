import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── КОНФИГУРАЦИЯ ─────────────────────────────────────────────────────────────
// Замените на ваши данные из Supabase → Settings → API
const SUPABASE_URL = "https://klskklkgltlkbnimhuna.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6Rar90QvqMtOrqboEJWFpQ_YYr3r_KL";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── УТИЛИТЫ ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  new Date(d).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

const isCompleted = (c) => {
  if (c.status === "completed" || c.status === "cancelled") return true;
  const end = new Date(c.scheduled_at).getTime() + 3 * 60 * 60 * 1000;
  return Date.now() > end;
};

const generateLink = (role, id) =>
  `https://telemed.example.kz/${role}/${id}`;

// ── КОМПОНЕНТЫ ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    scheduled:       { label: "",               color: "#64748b" },
    cancel_requested:{ label: "Запрос на отмену", color: "#f59e0b" },
    cancelled:       { label: "Отменено",          color: "#ef4444" },
    completed:       { label: "Завершено",          color: "#10b981" },
  };
  const s = map[status] || map.scheduled;
  if (!s.label) return null;
  return (
    <span style={{
      background: s.color + "22",
      color: s.color,
      border: `1px solid ${s.color}44`,
      borderRadius: 6,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.03em",
    }}>{s.label}</span>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  const colors = { success: "#10b981", error: "#ef4444", info: "#3b82f6" };
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      background: "#1e293b",
      border: `1px solid ${colors[type] || colors.info}`,
      color: "#f8fafc",
      borderRadius: 12,
      padding: "14px 22px",
      fontFamily: "inherit",
      fontSize: 14,
      boxShadow: "0 8px 32px #0008",
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadeUp .3s ease",
    }}>
      <span style={{ color: colors[type] || colors.info, fontSize: 18 }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      {msg}
      <button onClick={onClose} style={{
        background: "none", border: "none", color: "#94a3b8",
        cursor: "pointer", marginLeft: 8, fontSize: 16,
      }}>×</button>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000088",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 16, padding: 32, minWidth: 360, maxWidth: 480,
        boxShadow: "0 24px 80px #000a",
        animation: "popIn .25s cubic-bezier(.34,1.56,.64,1)",
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 20px", color: "#f1f5f9", fontFamily: "inherit", fontSize: 18 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | reset
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else onLogin();
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true); setMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setMsg(error ? error.message : "Письмо отправлено! Проверьте почту.");
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    background: "#1e293b", border: "1px solid #334155",
    color: "#f1f5f9", fontFamily: "inherit", fontSize: 15,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)",
    }}>
      <div style={{
        background: "#0f172a88", backdropFilter: "blur(16px)",
        border: "1px solid #334155", borderRadius: 20,
        padding: 40, width: 360,
        boxShadow: "0 24px 80px #0006",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: 26,
          }}>🏥</div>
          <h1 style={{
            margin: 0, color: "#f1f5f9",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24, letterSpacing: "0.02em",
          }}>TeleMed</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            Модуль телемедицины
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            style={inp} type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleReset())}
          />
          {mode === "login" && (
            <input
              style={inp} type="password" placeholder="Пароль"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          )}
          {msg && <p style={{ margin: 0, color: msg.includes("отправлено") ? "#10b981" : "#f87171", fontSize: 13 }}>{msg}</p>}
          <button
            onClick={mode === "login" ? handleLogin : handleReset}
            disabled={loading}
            style={{
              padding: "13px 0", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", fontFamily: "inherit", fontSize: 15,
              fontWeight: 600, cursor: "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity .2s",
            }}
          >
            {loading ? "..." : mode === "login" ? "Войти" : "Сбросить пароль"}
          </button>
          <button
            onClick={() => setMode(mode === "login" ? "reset" : "login")}
            style={{
              background: "none", border: "none", color: "#6366f1",
              fontFamily: "inherit", fontSize: 13, cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {mode === "login" ? "Забыли пароль?" : "← Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CREATE CONSULTATION MODAL ────────────────────────────────────────────────
function CreateConsultation({ onClose, onCreated, toast }) {
  const [form, setForm] = useState({
    doctor_name: "", patient_name: "",
    doctor_phone: "", patient_phone: "",
    date: "", time: "",
  });
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(null);
  const [docSuggestions, setDocSuggestions] = useState([]);

  const isReady = form.doctor_name && form.patient_name && form.date && form.time;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load doctor suggestions from localStorage
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("tm_doctors") || "[]");
    setDocSuggestions(s);
  }, []);

  const saveDoctor = (name) => {
    const s = JSON.parse(localStorage.getItem("tm_doctors") || "[]");
    if (!s.includes(name)) {
      const updated = [name, ...s].slice(0, 20);
      localStorage.setItem("tm_doctors", JSON.stringify(updated));
    }
  };

  const handleGetLinks = async () => {
    setLoading(true);
    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
    const tempId = crypto.randomUUID();
    const doctorLink = generateLink("doctor", tempId);
    const patientLink = generateLink("patient", tempId);

    const { data, error } = await supabase.from("consultations").insert({
      doctor_name: form.doctor_name,
      patient_name: form.patient_name,
      doctor_phone: form.doctor_phone || null,
      patient_phone: form.patient_phone || null,
      scheduled_at: scheduledAt,
      doctor_link: generateLink("doctor", ""),
      patient_link: generateLink("patient", ""),
      status: "scheduled",
    }).select().single();

    if (error) {
      toast(error.message, "error");
    } else {
      const dLink = generateLink("doctor", data.id);
      const pLink = generateLink("patient", data.id);
      await supabase.from("consultations").update({
        doctor_link: dLink, patient_link: pLink,
      }).eq("id", data.id);

      setLinks({ doctor: dLink, patient: pLink, id: data.id });
      setSaved({ ...data, doctor_link: dLink, patient_link: pLink });
      saveDoctor(form.doctor_name);
      onCreated();
    }
    setLoading(false);
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast("Ссылка скопирована", "success");
  };

  const inp = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    background: "#1e293b", border: "1px solid #334155",
    color: "#f1f5f9", fontFamily: "inherit", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };
  const label = { color: "#94a3b8", fontSize: 12, marginBottom: 4, display: "block" };

  return (
    <Modal title="Новая консультация" onClose={onClose}>
      {!links ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <span style={label}>ФИО врача *</span>
            <input
              style={inp} value={form.doctor_name}
              onChange={e => set("doctor_name", e.target.value)}
              list="doc-suggestions" placeholder="Иванов Иван Иванович"
            />
            <datalist id="doc-suggestions">
              {docSuggestions.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <span style={label}>Телефон врача</span>
            <input style={inp} value={form.doctor_phone}
              onChange={e => set("doctor_phone", e.target.value)} placeholder="+7..." />
          </div>
          <div>
            <span style={label}>ФИО пациента *</span>
            <input style={inp} value={form.patient_name}
              onChange={e => set("patient_name", e.target.value)} placeholder="Петров Пётр Петрович" />
          </div>
          <div>
            <span style={label}>Телефон пациента</span>
            <input style={inp} value={form.patient_phone}
              onChange={e => set("patient_phone", e.target.value)} placeholder="+7..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <span style={label}>Дата *</span>
              <input style={inp} type="date" value={form.date}
                onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <span style={label}>Время *</span>
              <input style={inp} type="time" value={form.time}
                onChange={e => set("time", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px 0", borderRadius: 9,
              background: "#1e293b", border: "1px solid #334155",
              color: "#94a3b8", fontFamily: "inherit", cursor: "pointer",
            }}>Отмена</button>
            <button onClick={handleGetLinks} disabled={!isReady || loading} style={{
              flex: 2, padding: "11px 0", borderRadius: 9, border: "none",
              background: isReady ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#334155",
              color: isReady ? "#fff" : "#64748b",
              fontFamily: "inherit", fontSize: 14, fontWeight: 600,
              cursor: isReady ? "pointer" : "not-allowed", transition: "all .2s",
            }}>
              {loading ? "Создаём..." : "Получить ссылки на приём"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, color: "#10b981", fontSize: 13 }}>
            ✓ Консультация создана! Ссылки действительны в течение 3 часов с начала приёма.
          </p>
          {[
            { label: "Ссылка для врача", url: links.doctor },
            { label: "Ссылка для пациента", url: links.patient },
          ].map(({ label: lbl, url }) => (
            <div key={lbl} style={{
              background: "#1e293b", border: "1px solid #334155",
              borderRadius: 9, padding: 12,
            }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>{lbl}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  color: "#a5b4fc", fontSize: 12, wordBreak: "break-all", flex: 1,
                }}>{url}</span>
                <button onClick={() => copyLink(url)} style={{
                  background: "#334155", border: "none", borderRadius: 7,
                  padding: "6px 12px", color: "#f1f5f9", fontFamily: "inherit",
                  fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                }}>Копировать</button>
              </div>
            </div>
          ))}
          <button onClick={onClose} style={{
            padding: "11px 0", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontFamily: "inherit", fontSize: 14,
            fontWeight: 600, cursor: "pointer", marginTop: 4,
          }}>Готово</button>
        </div>
      )}
    </Modal>
  );
}

// ── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ c, onClose, onUpdate, onDelete, onCancel, toast }) {
  const [editDate, setEditDate] = useState(c.scheduled_at.slice(0, 10));
  const [editTime, setEditTime] = useState(c.scheduled_at.slice(11, 16));
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const done = isCompleted(c);
  const started = Date.now() > new Date(c.scheduled_at).getTime();

  const copy = (url) => {
    navigator.clipboard.writeText(url);
    toast("Ссылка скопирована", "success");
  };

  const handleSave = async () => {
    setSaving(true);
    const scheduled_at = new Date(`${editDate}T${editTime}`).toISOString();
    const { error } = await supabase.from("consultations")
      .update({ scheduled_at, status: "scheduled" })
      .eq("id", c.id);
    if (error) toast(error.message, "error");
    else { toast("Консультация обновлена", "success"); onUpdate(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("consultations").delete().eq("id", c.id);
    if (error) toast(error.message, "error");
    else { toast("Запись удалена", "success"); onDelete(); }
  };

  const handleCancel = async () => {
    const { error } = await supabase.from("consultations")
      .update({ status: "cancelled" }).eq("id", c.id);
    if (error) toast(error.message, "error");
    else { toast("Консультация отменена", "success"); onCancel(); }
  };

  const inp = {
    padding: "9px 12px", borderRadius: 8,
    background: "#1e293b", border: "1px solid #334155",
    color: "#f1f5f9", fontFamily: "inherit", fontSize: 13,
    outline: "none",
  };
  const row = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 };

  return (
    <div style={{
      width: 360, background: "#0f172a",
      borderLeft: "1px solid #1e293b",
      display: "flex", flexDirection: "column", height: "100%",
      overflow: "auto",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid #1e293b",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: 16, fontFamily: "inherit" }}>
          Детали консультации
        </h3>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#64748b",
          fontSize: 20, cursor: "pointer", lineHeight: 1,
        }}>×</button>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        {/* Cancel request warning */}
        {c.status === "cancel_requested" && (
          <div style={{
            background: "#f59e0b11", border: "1px solid #f59e0b44",
            borderRadius: 10, padding: 14,
          }}>
            <div style={{ color: "#f59e0b", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              Пациент запрашивает отмену или перенос
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
              Свяжитесь с пациентом для уточнения подробностей.<br />
              Чтобы перенести — измените дату/время и нажмите «Сохранить».<br />
              Для отмены — нажмите «Отменить консультацию».
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Врач", value: c.doctor_name },
            { label: "Пациент", value: c.patient_name },
            { label: "Статус", value: <StatusBadge status={c.status} /> },
          ].map(({ label: lbl, value }) => (
            <div key={lbl} style={{ ...row }}>
              <span style={{ color: "#64748b", fontSize: 13, minWidth: 80 }}>{lbl}</span>
              <span style={{ color: "#f1f5f9", fontSize: 13, textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Date/time edit */}
        {!done && (
          <div>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>Дата и время приёма</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input style={inp} type="date" value={editDate}
                onChange={e => setEditDate(e.target.value)} />
              <input style={inp} type="time" value={editTime}
                onChange={e => setEditTime(e.target.value)} />
            </div>
          </div>
        )}
        {done && (
          <div style={{ ...row }}>
            <span style={{ color: "#64748b", fontSize: 13 }}>Дата приёма</span>
            <span style={{ color: "#f1f5f9", fontSize: 13 }}>{fmt(c.scheduled_at)}</span>
          </div>
        )}

        {/* Links */}
        {[
          { label: "Ссылка врача", url: c.doctor_link },
          { label: "Ссылка пациента", url: c.patient_link },
        ].map(({ label: lbl, url }) => (
          <div key={lbl}>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>{lbl}</div>
            <div style={{
              background: "#1e293b", border: "1px solid #334155",
              borderRadius: 8, padding: 10,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <span style={{
                color: "#a5b4fc", fontSize: 11, wordBreak: "break-all", flex: 1,
              }}>{url || "—"}</span>
              {url && (
                <button onClick={() => copy(url)} style={{
                  background: "#334155", border: "none", borderRadius: 6,
                  padding: "5px 10px", color: "#f1f5f9",
                  fontFamily: "inherit", fontSize: 11, cursor: "pointer",
                }}>Копировать</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {!done && (
        <div style={{
          padding: "16px 24px 24px",
          borderTop: "1px solid #1e293b",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "11px 0", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontFamily: "inherit", fontSize: 14,
            fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
          {!started && (
            <button onClick={() => setConfirmDelete(true)} style={{
              padding: "11px 0", borderRadius: 9,
              background: "none", border: "1px solid #ef444444",
              color: "#ef4444", fontFamily: "inherit", fontSize: 13, cursor: "pointer",
            }}>Удалить запись</button>
          )}
          <button onClick={() => setConfirmCancel(true)} style={{
            padding: "11px 0", borderRadius: 9,
            background: "none", border: "1px solid #334155",
            color: "#94a3b8", fontFamily: "inherit", fontSize: 13, cursor: "pointer",
          }}>Отменить консультацию</button>
        </div>
      )}

      {/* Confirm dialogs */}
      {confirmCancel && (
        <Modal title="Отменить консультацию?" onClose={() => setConfirmCancel(false)}>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 0 }}>
            Врач и пациент получат смс-уведомление об отмене.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmCancel(false)} style={{
              flex: 1, padding: "11px 0", borderRadius: 9,
              background: "#1e293b", border: "1px solid #334155",
              color: "#94a3b8", fontFamily: "inherit", cursor: "pointer",
            }}>Нет</button>
            <button onClick={handleCancel} style={{
              flex: 1, padding: "11px 0", borderRadius: 9, border: "none",
              background: "#ef4444", color: "#fff",
              fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
            }}>Да</button>
          </div>
        </Modal>
      )}
      {confirmDelete && (
        <Modal title="Удалить запись?" onClose={() => setConfirmDelete(false)}>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 0 }}>
            Запись будет удалена без возможности восстановления.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDelete(false)} style={{
              flex: 1, padding: "11px 0", borderRadius: 9,
              background: "#1e293b", border: "1px solid #334155",
              color: "#94a3b8", fontFamily: "inherit", cursor: "pointer",
            }}>Нет</button>
            <button onClick={handleDelete} style={{
              flex: 1, padding: "11px 0", borderRadius: 9, border: "none",
              background: "#ef4444", color: "#fff",
              fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
            }}>Да</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const showToast = (msg, type = "info") => setToast({ msg, type });
  const hideToast = () => setToast({ msg: "", type: "info" });

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Load consultations
  const loadConsultations = useCallback(async () => {
    if (!session) return;
    let q = supabase.from("consultations").select("*").order("scheduled_at", { ascending: false });
    const { data, error } = await q;
    if (!error) setConsultations(data || []);
  }, [session]);

  useEffect(() => { loadConsultations(); }, [loadConsultations]);

  // Realtime
  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel("consultations_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" },
        () => loadConsultations()
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [session, loadConsultations]);

  const handleLogout = () => supabase.auth.signOut();

  // Filter
  const active = consultations.filter(c => !isCompleted(c));
  const completed = consultations.filter(c => isCompleted(c));

  const applyFilters = (list) => list.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.doctor_name.toLowerCase().includes(q) ||
      c.patient_name.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchDate = !filterDate || c.scheduled_at.slice(0, 10) === filterDate;
    return matchSearch && matchStatus && matchDate;
  });

  const filteredActive = applyFilters(active);
  const filteredCompleted = applyFilters(completed);

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0f172a", color: "#6366f1",
      fontFamily: "inherit", fontSize: 20,
    }}>Загрузка...</div>
  );

  if (!session) return <LoginPage onLogin={() => {}} />;

  // ── DASHBOARD ──
  const sidebarW = 280;

  const ConsultationRow = ({ c }) => {
    const done = isCompleted(c);
    const isSelected = selected?.id === c.id;
    return (
      <div
        onClick={() => setSelected(isSelected ? null : c)}
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1e293b",
          cursor: "pointer",
          background: isSelected ? "#1e293b" : "transparent",
          transition: "background .15s",
          display: "flex", flexDirection: "column", gap: 6,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 500 }}>{c.patient_name}</span>
          <StatusBadge status={c.status} />
        </div>
        <div style={{ color: "#64748b", fontSize: 12 }}>
          Врач: {c.doctor_name}
        </div>
        <div style={{ color: "#475569", fontSize: 12 }}>{fmt(c.scheduled_at)}</div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0f172a; font-family: 'IBM Plex Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(.92); }
          to { opacity: 1; transform: scale(1); }
        }
        button:hover { filter: brightness(1.08); }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarW, background: "#080f1e",
          borderRight: "1px solid #1e293b",
          display: "flex", flexDirection: "column",
          flexShrink: 0,
        }}>
          {/* Brand */}
          <div style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid #1e293b",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>🏥</div>
              <div>
                <div style={{
                  color: "#f1f5f9", fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 16, fontWeight: 600,
                }}>TeleMed</div>
                <div style={{ color: "#475569", fontSize: 11 }}>Кабинет администратора</div>
              </div>
            </div>
          </div>

          {/* User info */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid #1e293b",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ color: "#f1f5f9", fontSize: 13 }}>{session.user.email}</div>
              <div style={{ color: "#475569", fontSize: 11 }}>Администратор</div>
            </div>
            <button onClick={handleLogout} title="Выйти" style={{
              background: "none", border: "1px solid #334155",
              borderRadius: 7, padding: "5px 10px",
              color: "#64748b", fontFamily: "inherit", fontSize: 12,
              cursor: "pointer",
            }}>Выйти</button>
          </div>

          {/* Stats */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #1e293b",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          }}>
            {[
              { label: "Активных", value: active.length, color: "#6366f1" },
              { label: "Завершённых", value: completed.length, color: "#10b981" },
              { label: "Отмен. запросов", value: consultations.filter(c => c.status === "cancel_requested").length, color: "#f59e0b" },
              { label: "Отменено", value: consultations.filter(c => c.status === "cancelled").length, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ color, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{value}</div>
                <div style={{ color: "#475569", fontSize: 10, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 12px", flex: 1 }}>
            {[
              { label: "Консультации", icon: "📋" },
              { label: "Инструкция", icon: "📖" },
            ].map(({ label, icon }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8,
                color: label === "Консультации" ? "#a5b4fc" : "#64748b",
                background: label === "Консультации" ? "#6366f120" : "transparent",
                cursor: "pointer", fontSize: 13, marginBottom: 2,
              }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid #1e293b",
            display: "flex", alignItems: "center", gap: 14,
            background: "#0a1020",
          }}>
            <h2 style={{
              margin: 0, color: "#f1f5f9", fontSize: 18,
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, flex: 1,
            }}>Онлайн-консультации</h2>
            <button onClick={() => setShowCreate(true)} style={{
              padding: "9px 20px", borderRadius: 9, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", fontFamily: "inherit", fontSize: 13,
              fontWeight: 600, cursor: "pointer", display: "flex",
              alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Создать
            </button>
          </div>

          {/* Filters */}
          <div style={{
            padding: "12px 24px",
            borderBottom: "1px solid #1e293b",
            display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
            background: "#0a1020",
          }}>
            <input
              style={{
                padding: "8px 12px", borderRadius: 8,
                background: "#1e293b", border: "1px solid #334155",
                color: "#f1f5f9", fontFamily: "inherit", fontSize: 13,
                outline: "none", flex: 1, minWidth: 200,
              }}
              placeholder="Поиск по врачу или пациенту..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <input
              type="date"
              style={{
                padding: "8px 12px", borderRadius: 8,
                background: "#1e293b", border: "1px solid #334155",
                color: "#f1f5f9", fontFamily: "inherit", fontSize: 13, outline: "none",
              }}
              value={filterDate} onChange={e => setFilterDate(e.target.value)}
            />
            <select
              style={{
                padding: "8px 12px", borderRadius: 8,
                background: "#1e293b", border: "1px solid #334155",
                color: "#f1f5f9", fontFamily: "inherit", fontSize: 13, outline: "none",
              }}
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="cancel_requested">Запрос на отмену</option>
              <option value="cancelled">Отменено</option>
              <option value="scheduled">Запланировано</option>
              <option value="completed">Завершено</option>
            </select>
            {(search || filterDate || filterStatus !== "all") && (
              <button onClick={() => { setSearch(""); setFilterDate(""); setFilterStatus("all"); }} style={{
                background: "none", border: "1px solid #334155",
                borderRadius: 8, padding: "7px 12px",
                color: "#94a3b8", fontFamily: "inherit", fontSize: 12, cursor: "pointer",
              }}>Сбросить</button>
            )}
          </div>

          {/* List + Detail */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* List */}
            <div style={{
              flex: 1, overflowY: "auto",
              borderRight: selected ? "1px solid #1e293b" : "none",
            }}>
              {/* Active */}
              {filteredActive.length === 0 && filteredCompleted.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", height: 300, color: "#334155",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <div style={{ fontSize: 15 }}>Консультаций не найдено</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    {search || filterDate || filterStatus !== "all"
                      ? "Попробуйте изменить фильтры"
                      : "Нажмите «+ Создать» чтобы добавить первую консультацию"}
                  </div>
                </div>
              ) : (
                <>
                  {filteredActive.map(c => <ConsultationRow key={c.id} c={c} />)}

                  {/* Completed section */}
                  {filteredCompleted.length > 0 && (
                    <>
                      <div
                        onClick={() => setShowCompleted(v => !v)}
                        style={{
                          padding: "12px 20px",
                          background: "#080f1e",
                          borderBottom: "1px solid #1e293b",
                          borderTop: "1px solid #1e293b",
                          cursor: "pointer", display: "flex",
                          justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#475569", fontSize: 13 }}>
                          Завершённые консультации ({filteredCompleted.length})
                        </span>
                        <span style={{ color: "#475569", fontSize: 12 }}>
                          {showCompleted ? "▲" : "▼"}
                        </span>
                      </div>
                      {showCompleted && filteredCompleted.map(c => (
                        <ConsultationRow key={c.id} c={c} />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Detail Panel */}
            {selected && (
              <DetailPanel
                c={selected}
                onClose={() => setSelected(null)}
                onUpdate={() => { loadConsultations(); setSelected(null); }}
                onDelete={() => { loadConsultations(); setSelected(null); }}
                onCancel={() => { loadConsultations(); setSelected(null); }}
                toast={showToast}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateConsultation
          onClose={() => setShowCreate(false)}
          onCreated={loadConsultations}
          toast={showToast}
        />
      )}

      <Toast msg={toast.msg} type={toast.type} onClose={hideToast} />
    </>
  );
}
