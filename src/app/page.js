"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./page.module.css";
import PushNotificationSender from "./PushNotificationSender";

const EVENT_SCHEMAS = {
  "course.created": {
    label: "course.created",
    fields: [
      { key: "id", label: "Course ID", type: "text", default: "appx_course_123" },
      { key: "name", label: "Name", type: "text", default: "BPSC TRE 4.0 - Maths & Science 2025" },
      { key: "category", label: "Category", type: "text", default: "BPSC" },
      { key: "launchDate", label: "Launch Date", type: "datetime", default: "2025-01-15T00:00:00Z" },
      { key: "expiryDate", label: "Expiry Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "examDate", label: "Exam Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "currentPrice", label: "Current Price", type: "number", default: 2999 },
      { key: "status", label: "Status", type: "text", default: "active" },
    ],
  },
  "course.updated": {
    label: "course.updated",
    fields: [
      { key: "id", label: "Course ID", type: "text", default: "appx_course_123" },
      { key: "name", label: "Name", type: "text", default: "BPSC TRE 4.0 - Maths & Science 2025" },
      { key: "category", label: "Category", type: "text", default: "BPSC" },
      { key: "launchDate", label: "Launch Date", type: "datetime", default: "2025-01-15T00:00:00Z" },
      { key: "expiryDate", label: "Expiry Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "examDate", label: "Exam Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "currentPrice", label: "Current Price", type: "number", default: 2999 },
      { key: "status", label: "Status", type: "text", default: "active" },
    ],
  },
  "course.deleted": {
    label: "course.deleted",
    fields: [
      { key: "id", label: "Course ID", type: "text", default: "appx_course_123" },
    ],
  },
  "coupon.created": {
    label: "coupon.created",
    fields: [
      { key: "code", label: "Coupon Code *", type: "text", default: "BPSC20" },
      {
        key: "courseIds",
        label: "Course IDs * (multiple, comma-separated)",
        type: "multitext",
        default: "appx_course_123",
      },
      {
        key: "discountType",
        label: "Discount Type *",
        type: "select",
        options: [
          { value: "percentage", label: "Discount Percentage (%)" },
          { value: "flat", label: "Flat Price Discount (₹)" },
        ],
        default: "percentage",
      },
      { key: "discountPercent", label: "Discount %", type: "number", default: 20, showWhen: { key: "discountType", value: "percentage" } },
      { key: "discountAmount", label: "Flat Discount (₹)", type: "number", default: 500, showWhen: { key: "discountType", value: "flat" } },
      { key: "expiryDate", label: "Expiry Date *", type: "datetime", default: "2026-05-01T00:00:00Z" },
      { key: "status", label: "Status", type: "text", default: "active" },
    ],
  },
  "coupon.updated": {
    label: "coupon.updated",
    fields: [
      { key: "code", label: "Coupon Code *", type: "text", default: "BPSC20" },
      {
        key: "courseIds",
        label: "Course IDs * (multiple, comma-separated)",
        type: "multitext",
        default: "appx_course_123",
      },
      {
        key: "discountType",
        label: "Discount Type *",
        type: "select",
        options: [
          { value: "percentage", label: "Discount Percentage (%)" },
          { value: "flat", label: "Flat Price Discount (₹)" },
        ],
        default: "percentage",
      },
      { key: "discountPercent", label: "Discount %", type: "number", default: 20, showWhen: { key: "discountType", value: "percentage" } },
      { key: "discountAmount", label: "Flat Discount (₹)", type: "number", default: 500, showWhen: { key: "discountType", value: "flat" } },
      { key: "expiryDate", label: "Expiry Date *", type: "datetime", default: "2026-05-01T00:00:00Z" },
      { key: "status", label: "Status", type: "text", default: "active" },
    ],
  },
  "coupon.deleted": {
    label: "coupon.deleted",
    fields: [
      { key: "code", label: "Coupon Code", type: "text", default: "BPSC20" },
      {
        key: "courseIds",
        label: "Course IDs (comma-separated)",
        type: "multitext",
        default: "appx_course_123",
      },
    ],
  },
};

// datetime-local input expects "YYYY-MM-DDTHH:MM", payload needs full ISO with Z
function toDatetimeLocal(iso) {
  if (!iso) return "";
  return iso.replace("Z", "").slice(0, 16);
}

function fromDatetimeLocal(val) {
  if (!val) return "";
  return val + ":00Z";
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

const PRESETS = [
  {
    label: "Expiry in 3 days",
    apply: () => ({
      event: "course.updated",
      data: {
        id: "appx_course_123",
        name: "BPSC TRE 4.0 - Maths & Science 2025",
        category: "BPSC",
        launchDate: "2025-01-15T00:00:00Z",
        expiryDate: addDays(3),
        examDate: "2026-06-30T00:00:00Z",
        currentPrice: 2999,
        status: "active",
      },
    }),
  },
  {
    label: "Exam after Expiry",
    apply: () => {
      const expiry = addDays(30);
      const exam = new Date(new Date(expiry).getTime() + 30 * 86400000)
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
      return {
        event: "course.updated",
        data: {
          id: "appx_course_123",
          name: "BPSC TRE 4.0 - Maths & Science 2025",
          category: "BPSC",
          launchDate: "2025-01-15T00:00:00Z",
          expiryDate: expiry,
          examDate: exam,
          currentPrice: 2999,
          status: "active",
        },
      };
    },
  },
  {
    label: "Price Change",
    apply: () => ({
      event: "course.updated",
      data: {
        id: "appx_course_123",
        name: "BPSC TRE 4.0 - Maths & Science 2025",
        category: "BPSC",
        launchDate: "2025-01-15T00:00:00Z",
        expiryDate: "2026-06-30T00:00:00Z",
        examDate: "2026-06-30T00:00:00Z",
        currentPrice: 1499,
        status: "active",
      },
    }),
  },
  {
    label: "Coupon Expiry Tomorrow",
    apply: () => ({
      event: "coupon.created",
      data: {
        code: "BPSC20",
        courseId: "appx_course_123",
        discountPercent: 20,
        expiryDate: addDays(1),
        status: "active",
      },
    }),
  },
];

function defaultFormData(event) {
  const schema = EVENT_SCHEMAS[event];
  const data = {};
  for (const f of schema.fields) {
    data[f.key] = f.default !== undefined ? String(f.default) : "";
  }
  return data;
}

function statusColor(code) {
  if (!code) return "";
  if (code === 200) return styles.statusGreen;
  if (code >= 400) return styles.statusRed;
  return styles.statusYellow;
}

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState("webhook");
  const [targetUrl, setTargetUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const origin = window.location.origin;
    if (window.location.hostname === "localhost") {
      setTargetUrl("http://localhost:3000/api/webhook/appx");
    } else {
      setTargetUrl(origin + "/api/webhook/appx");
    }
  }, []);
  const [selectedEvent, setSelectedEvent] = useState("course.created");
  const [formData, setFormData] = useState(() =>
    defaultFormData("course.created")
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [log, setLog] = useState([]);

  const handleEventChange = useCallback((e) => {
    const ev = e.target.value;
    setSelectedEvent(ev);
    setFormData(defaultFormData(ev));
    setResponse(null);
  }, []);

  const handleFieldChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset) => {
    const { event, data } = preset.apply();
    setSelectedEvent(event);
    const newData = {};
    for (const [k, v] of Object.entries(data)) {
      newData[k] = String(v);
    }
    setFormData(newData);
    setResponse(null);
  }, []);

  const buildPayload = useCallback(() => {
    const schema = EVENT_SCHEMAS[selectedEvent];
    const data = {};
    for (const f of schema.fields) {
      if (f.showWhen && formData[f.showWhen.key] !== f.showWhen.value) continue;
      if (f.type === "number") {
        data[f.key] = Number(formData[f.key]);
      } else if (f.type === "multitext") {
        data[f.key] = (formData[f.key] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        data[f.key] = formData[f.key];
      }
    }
    return {
      event: selectedEvent,
      timestamp: new Date().toISOString(),
      data,
    };
  }, [selectedEvent, formData]);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    const payload = buildPayload();
    try {
      const res = await fetch("/api/send-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, _targetUrl: targetUrl }),
      });
      const json = await res.json();
      setResponse({ ...json, apiStatus: res.status });
      setLog((prev) => [
        {
          event: selectedEvent,
          timestamp: payload.timestamp,
          status: json.trackoStatus ?? res.status,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  }, [buildPayload, selectedEvent]);

  const schema = EVENT_SCHEMAS[selectedEvent];

  return (
    <div className={styles.simContainer}>
      <header className={styles.simHeader}>
        <div className={styles.simLogoGroup}>
          <div className={styles.simLogo}>
            Teaching Pariksha
          </div>
          <nav className={styles.simNavTabs}>
            <button
              className={`${styles.simNavTab} ${
                activeTab === "webhook" ? styles.activeNavTab : ""
              }`}
              onClick={() => setActiveTab("webhook")}
              type="button"
            >
              ⚡ Webhook Simulator
            </button>
            <button
              className={`${styles.simNavTab} ${
                activeTab === "push" ? styles.activeNavTab : ""
              }`}
              onClick={() => setActiveTab("push")}
              type="button"
            >
              🔔 Push Notifications
            </button>
          </nav>
        </div>

        <div className={styles.simTarget} suppressHydrationWarning>
          {activeTab === "webhook" ? (
            <>Target: <code>{targetUrl || (mounted ? "" : "—")}</code></>
          ) : (
            <>Expo Push API: <code>https://exp.host/--/api/v2/push/send</code></>
          )}
        </div>
      </header>

      {activeTab === "push" ? (
        <PushNotificationSender />
      ) : (
        <div className={styles.simBody}>
        {/* Left Panel */}
        <div className={styles.leftPanel} suppressHydrationWarning>
          {/* Presets */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Presets</h3>
            <div className={styles.presetGrid}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className={styles.presetBtn}
                  onClick={() => applyPreset(p)}
                  suppressHydrationWarning
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* Target URL */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Target URL</h3>
            <input
              className={styles.input}
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://your-backend.com/api/webhook/appx"
              suppressHydrationWarning
            />
          </section>

          {/* Event Selector */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Event Type</h3>
            <select
              className={styles.select}
              value={selectedEvent}
              onChange={handleEventChange}
              suppressHydrationWarning
            >
              {Object.keys(EVENT_SCHEMAS).map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </section>

          {/* Form Fields */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Payload Data</h3>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Timestamp
                <input
                  className={styles.input}
                  value="Auto-generated on send"
                  disabled
                  suppressHydrationWarning
                />
              </label>
              {schema.fields.map((f) => {
                if (f.showWhen && formData[f.showWhen.key] !== f.showWhen.value)
                  return null;
                return (
                  <label key={f.key} className={styles.fieldLabel}>
                    {f.label}
                    {f.type === "datetime" ? (
                      <input
                        className={`${styles.input} ${styles.dateInput}`}
                        type="datetime-local"
                        value={toDatetimeLocal(formData[f.key] ?? "")}
                        onChange={(e) =>
                          handleFieldChange(f.key, fromDatetimeLocal(e.target.value))
                        }
                        suppressHydrationWarning
                      />
                    ) : f.type === "select" ? (
                      <select
                        className={styles.select}
                        value={formData[f.key] ?? f.default}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        suppressHydrationWarning
                      >
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "multitext" ? (
                      <>
                        <input
                          className={styles.input}
                          type="text"
                          value={formData[f.key] ?? ""}
                          placeholder="appx_course_123, appx_course_456"
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          suppressHydrationWarning
                        />
                        <span className={styles.fieldHint}>
                          Separate multiple IDs with commas
                        </span>
                      </>
                    ) : (
                      <input
                        className={styles.input}
                        type={f.type === "number" ? "number" : "text"}
                        value={formData[f.key] ?? ""}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        suppressHydrationWarning
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </section>

          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={loading}
            suppressHydrationWarning
          >
            {loading ? "Sending…" : "Send Webhook"}
          </button>
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          {/* Response */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Response</h3>
            {!response && !loading && (
              <p className={styles.emptyState}>
                No request sent yet. Fill in the form and click Send.
              </p>
            )}
            {loading && <p className={styles.emptyState}>Sending…</p>}
            {response && (
              <div className={styles.responsePanel}>
                {response.error ? (
                  <div className={styles.statusRed}>
                    Error: {response.error}
                  </div>
                ) : (
                  <>
                    <div
                      className={`${styles.statusBadge} ${statusColor(response.trackoStatus)}`}
                    >
                      HTTP {response.trackoStatus}
                    </div>
                    <div className={styles.responseBlock}>
                      <span className={styles.blockLabel}>
                        Tracko Response Body
                      </span>
                      <pre className={styles.pre}>{response.trackoBody}</pre>
                    </div>
                    <div className={styles.responseBlock}>
                      <span className={styles.blockLabel}>
                        Signature Header
                      </span>
                      <pre className={styles.pre}>{response.signature}</pre>
                    </div>
                    <div className={styles.responseBlock}>
                      <span className={styles.blockLabel}>Sent Payload</span>
                      <pre className={styles.pre}>
                        {JSON.stringify(response.sentPayload, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Log */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Session Log (last 10)</h3>
            {log.length === 0 ? (
              <p className={styles.emptyState}>No events sent yet.</p>
            ) : (
              <div className={styles.logTable}>
                <div className={styles.logHeader}>
                  <span>Event</span>
                  <span>Timestamp</span>
                  <span>Status</span>
                </div>
                {log.map((entry, i) => (
                  <div key={i} className={styles.logRow}>
                    <span className={styles.logEvent}>{entry.event}</span>
                    <span className={styles.logTs} suppressHydrationWarning>
                      {mounted && new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`${styles.logStatus} ${statusColor(entry.status)}`}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    )}
  </div>
);
}
