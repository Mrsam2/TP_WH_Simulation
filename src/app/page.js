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
      { key: "exact_path", label: "Exact Path", type: "text", default: "Teaching Exams / BPSC / TRE 4.0" },
      { key: "launchDate", label: "Launch Date", type: "datetime", default: "2025-01-15T00:00:00Z" },
      { key: "expiryDate", label: "Expiry Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "examDate", label: "Exam Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "currentPrice", label: "Current Price", type: "number", default: 2999 },
      { key: "status", label: "Status", type: "text", default: "active" },
      { key: "bannerImage", label: "Banner Image URL", type: "text", default: "https://appx-content-v2.classx.co.in/paid_course3/2025-12-18-0_05192212341815827.png" },
    ],
  },
  "course.updated": {
    label: "course.updated",
    fields: [
      { key: "id", label: "Course ID", type: "text", default: "appx_course_123" },
      { key: "name", label: "Name", type: "text", default: "BPSC TRE 4.0 - Maths & Science 2025" },
      { key: "category", label: "Category", type: "text", default: "BPSC" },
      { key: "exact_path", label: "Exact Path", type: "text", default: "Teaching Exams / BPSC / TRE 4.0" },
      { key: "launchDate", label: "Launch Date", type: "datetime", default: "2025-01-15T00:00:00Z" },
      { key: "expiryDate", label: "Expiry Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "examDate", label: "Exam Date", type: "datetime", default: "2026-06-30T00:00:00Z" },
      { key: "currentPrice", label: "Current Price", type: "number", default: 2999 },
      { key: "status", label: "Status", type: "text", default: "active" },
      { key: "bannerImage", label: "Banner Image URL", type: "text", default: "https://appx-content-v2.classx.co.in/paid_course3/2025-12-18-0_05192212341815827.png" },
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
  "syllabus.class.scheduled": {
    label: "syllabus.class.scheduled",
    fields: [
      { key: "courseId", label: "Course ID (courseId)", type: "text", default: "course_id" },
      { key: "ClassId", label: "Class ID (ClassId)", type: "text", default: "class_chem_som_part3" },
      { key: "courseName", label: "Course Name (courseName)", type: "text", default: "BPSC TRE 4.0 - Maths & Science" },
      { key: "subject", label: "Subject (subject)", type: "text", default: "Hindi" },
      { key: "topic", label: "Topic (topic / title)", type: "text", default: "title" },
      { key: "chapter", label: "Chapter (chapter / Topic parent Folder)", type: "text", default: "(Topic parent Folder)" },
      { key: "teacher", label: "Teacher / Faculty (teacher)", type: "text", default: "teacher" },
      { key: "scheduledDate", label: "Scheduled Date (scheduledDate)", type: "text", default: "date_time" },
      { key: "scheduledTime", label: "Scheduled Time (scheduledTime)", type: "text", default: "date_time" },
      { key: "duration", label: "Duration (duration)", type: "text", default: "duration" },
      { key: "isWeekOff", label: "Week Off (isWeekOff)", type: "text", default: "Working Day" },
      { key: "classType", label: "Class Type (classType)", type: "text", default: "type" },
      {
        key: "Class_path",
        label: "Class Path (Class_path)",
        type: "text",
        default: "CTET CC Combo (Paper 1+2) M&S - SEP 2026 TARGET 130+ CRASH COURSE / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
      },
    ],
  },
  "syllabus.scheduled.class.Update": {
    label: "syllabus.scheduled.class.Update",
    fields: [
      { key: "courseId", label: "Course ID (courseId)", type: "text", default: "course_id" },
      { key: "ClassId", label: "Class ID (ClassId)", type: "text", default: "class_chem_som_part3" },
      { key: "courseName", label: "Course Name (courseName)", type: "text", default: "BPSC TRE 4.0 - Maths & Science" },
      { key: "subject", label: "Subject (subject)", type: "text", default: "Hindi" },
      { key: "topic", label: "Topic (topic / title)", type: "text", default: "title" },
      { key: "chapter", label: "Chapter (chapter / Topic parent Folder)", type: "text", default: "(Topic parent Folder)" },
      { key: "teacher", label: "Teacher / Faculty (teacher)", type: "text", default: "teacher" },
      { key: "scheduledDate", label: "Scheduled Date (scheduledDate)", type: "text", default: "date_time" },
      { key: "scheduledTime", label: "Scheduled Time (scheduledTime)", type: "text", default: "date_time" },
      { key: "duration", label: "Duration (duration)", type: "text", default: "duration" },
      { key: "isWeekOff", label: "Week Off (isWeekOff)", type: "text", default: "Working Day" },
      { key: "classType", label: "Class Type (classType / Type)", type: "text", default: "Live class" },
      {
        key: "Class_path",
        label: "Class Path (Class_path)",
        type: "text",
        default: "CTET CC Combo (Paper 1+2) M&S / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
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
        exact_path: "Teaching Exams / BPSC / TRE 4.0",
        launchDate: "2025-01-15T00:00:00Z",
        expiryDate: addDays(3),
        examDate: "2026-06-30T00:00:00Z",
        currentPrice: 2999,
        status: "active",
        bannerImage: "https://appx-content-v2.classx.co.in/paid_course3/2025-12-18-0_05192212341815827.png",
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
          exact_path: "Teaching Exams / BPSC / TRE 4.0",
          launchDate: "2025-01-15T00:00:00Z",
          expiryDate: expiry,
          examDate: exam,
          currentPrice: 2999,
          status: "active",
          bannerImage: "https://appx-content-v2.classx.co.in/paid_course3/2025-12-18-0_05192212341815827.png",
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
        exact_path: "Teaching Exams / BPSC / TRE 4.0",
        launchDate: "2025-01-15T00:00:00Z",
        expiryDate: "2026-06-30T00:00:00Z",
        examDate: "2026-06-30T00:00:00Z",
        currentPrice: 1499,
        status: "active",
        bannerImage: "https://appx-content-v2.classx.co.in/paid_course3/2025-12-18-0_05192212341815827.png",
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
  {
    label: "Class Scheduled (Template)",
    apply: () => ({
      event: "syllabus.class.scheduled",
      timestamp: "2026-09-14T16:00:00.000Z",
      data: {
        courseId: "course_id",
        ClassId: "class_chem_som_part3",
        courseName: "BPSC TRE 4.0 - Maths & Science",
        subject: "Hindi",
        topic: "title",
        chapter: "(Topic parent Folder)",
        teacher: "teacher",
        scheduledDate: "date_time",
        scheduledTime: "date_time",
        duration: "duration",
        isWeekOff: "Working Day",
        classType: "type",
        Class_path: "CTET CC Combo (Paper 1+2) M&S - SEP 2026 TARGET 130+ CRASH COURSE / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
      },
    }),
  },
  {
    label: "Class (data.event: delete)",
    apply: () => ({
      timestamp: "2026-09-15T18:00:00.000Z",
      data: {
        event: "delete",
        courseId: ["718", "743"],
        ClassId: "class_chem_som_part3",
        courseName: ["CTET CC Combo (Paper 1+2) M&S", "BPSC TRE 4.0 - Chemistry"],
        topic: "Chemistry - States of matter -Part - 3",
        teacher: "Saurabh",
        scheduledDate: "2026-09-14",
        scheduledTime: "20:00",
        duration: "01:40:00",
        isWeekOff: "Working Day",
        Type: ["Live class", "PDF", "folder"],
        Class_path: [
          "CTET CC Combo (Paper 1+2) M&S / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
          "BPSC TRE 4.0 - Chemistry / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
        ],
      },
    }),
  },
  {
    label: "Class (data.event: update)",
    apply: () => ({
      timestamp: "2026-09-15T18:00:00.000Z",
      data: {
        event: "update",
        courseId: ["718", "743"],
        ClassId: "class_chem_som_part3",
        courseName: ["CTET CC Combo (Paper 1+2) M&S", "BPSC TRE 4.0 - Chemistry"],
        topic: "Chemistry - States of matter -Part - 3",
        teacher: "Saurabh",
        scheduledDate: "2026-09-14",
        scheduledTime: "20:00",
        duration: "01:40:00",
        isWeekOff: "Working Day",
        Type: ["Live class", "PDF", "folder"],
        Class_path: [
          "CTET CC Combo (Paper 1+2) M&S / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
          "BPSC TRE 4.0 - Chemistry / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
        ],
      },
    }),
  },
  {
    label: "Class (data.event: create)",
    apply: () => ({
      timestamp: "2026-09-15T18:00:00.000Z",
      data: {
        event: "create",
        courseId: ["718", "743"],
        ClassId: "class_chem_som_part3",
        courseName: ["CTET CC Combo (Paper 1+2) M&S", "BPSC TRE 4.0 - Chemistry"],
        topic: "Chemistry - States of matter -Part - 3",
        teacher: "Saurabh",
        scheduledDate: "2026-09-14",
        scheduledTime: "20:00",
        duration: "01:40:00",
        isWeekOff: "Working Day",
        Type: ["Live class", "PDF", "folder"],
        Class_path: [
          "CTET CC Combo (Paper 1+2) M&S / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
          "BPSC TRE 4.0 - Chemistry / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
        ],
      },
    }),
  },
  {
    label: "Class Update / Reschedule (Multi-Course)",
    apply: () => ({
      event: "syllabus.scheduled.class.Update",
      timestamp: "2026-09-15T18:00:00.000Z",
      data: {
        courseId: ["718", "743"],
        ClassId: "class_chem_som_part3",
        courseName: ["CTET CC Combo (Paper 1+2) M&S", "BPSC TRE 4.0 - Chemistry"],
        topic: "Chemistry - States of matter -Part - 3",
        teacher: "Saurabh",
        scheduledDate: "2026-09-14",
        scheduledTime: "20:00",
        duration: "01:40:00",
        isWeekOff: "Working Day",
        Type: ["Live class", "PDF", "folder"],
        Class_path: [
          "CTET CC Combo (Paper 1+2) M&S / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
          "BPSC TRE 4.0 - Chemistry / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
        ],
      },
    }),
  },
  {
    label: "Class Scheduled (Multi-Course Array)",
    apply: () => ({
      event: "syllabus.class.scheduled",
      timestamp: new Date().toISOString(),
      data: {
        courseId: ["course_bpsc_001", "course_ctet_002"],
        ClassId: "class_chem_som_part3",
        courseName: ["BPSC TRE 4.0 - Maths & Science", "CTET Target 130+ Crash Course"],
        topic: "Chemistry - States of matter -Part - 3",
        teacher: "Saurabh",
        scheduledDate: "2026-09-15",
        scheduledTime: "20:00",
        duration: "01:40:00",
        isWeekOff: "Working Day",
        Type: ["Live class", "PDF", "folder"],
        Class_path: [
          "BPSC TRE 4.0 - Maths & Science / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
          "CTET Target 130+ Crash Course / Chemistry / States of matter / Chemistry - States of matter -Part - 3",
        ],
      },
    }),
  },
  {
    label: "Class Scheduled (Live Demo)",
    apply: () => ({
      event: "syllabus.class.scheduled",
      timestamp: new Date().toISOString(),
      data: {
        courseId: "appx_course_123",
        ClassId: "cls_2026_chem_03",
        courseName: "BPSC TRE 4.0 - Maths & Science",
        subject: "Hindi",
        topic: "Hindi Grammar - Part 1",
        chapter: "Vyakaran",
        teacher: "Narjis Khatoon",
        scheduledDate: new Date().toISOString().slice(0, 10),
        scheduledTime: "16:00",
        duration: "60",
        isWeekOff: "Working Day",
        classType: "Live",
        Class_path: "BPSC TRE 4.0 - Maths & Science / Hindi / Vyakaran / Hindi Grammar - Part 1",
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
  const [targetUrl, setTargetUrl] = useState("http://localhost:3000/api/webhook/appx");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      setTargetUrl(window.location.origin + "/api/webhook/appx");
    }
  }, []);
  const [selectedEvent, setSelectedEvent] = useState("course.created");
  const [formData, setFormData] = useState(() =>
    defaultFormData("course.created")
  );
  const [customTimestamp, setCustomTimestamp] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [log, setLog] = useState([]);

  const handleEventChange = useCallback((e) => {
    const ev = e.target.value;
    setSelectedEvent(ev);
    setFormData(defaultFormData(ev));
    setCustomTimestamp(ev === "syllabus.class.scheduled" ? "2026-09-14T16:00:00.000Z" : "");
    setResponse(null);
  }, []);

  const handleFieldChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset) => {
    const { event, data, timestamp } = preset.apply();
    setSelectedEvent(event);
    setCustomTimestamp(timestamp || "");
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
        const val = formData[f.key];
        const num = Number(val);
        data[f.key] = isNaN(num) || val === "" ? val : num;
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
      timestamp: customTimestamp.trim() || new Date().toISOString(),
      data,
    };
  }, [selectedEvent, formData, customTimestamp]);

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
  }, [buildPayload, selectedEvent, targetUrl]);

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
              suppressHydrationWarning
            >
              ⚡ Webhook Simulator
            </button>
            <button
              className={`${styles.simNavTab} ${
                activeTab === "push" ? styles.activeNavTab : ""
              }`}
              onClick={() => setActiveTab("push")}
              type="button"
              suppressHydrationWarning
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
                Timestamp (ISO 8601)
                <input
                  className={styles.input}
                  placeholder="Auto-generated on send (e.g. 2026-09-14T16:00:00.000Z)"
                  value={customTimestamp}
                  onChange={(e) => setCustomTimestamp(e.target.value)}
                  suppressHydrationWarning
                />
                <span className={styles.fieldHint}>
                  {customTimestamp.trim()
                    ? "Custom timestamp specified"
                    : "Leave empty to auto-generate current UTC ISO timestamp on send"}
                </span>
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
          {/* Live Payload Preview */}
          <section className={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className={styles.sectionTitle}>Outgoing Payload Preview</h3>
              <span className={styles.fieldHint} style={{ margin: 0 }}>
                Live JSON generated from form
              </span>
            </div>
            <pre className={styles.pre} suppressHydrationWarning>
              {JSON.stringify(buildPayload(), null, 2)}
            </pre>
          </section>

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
