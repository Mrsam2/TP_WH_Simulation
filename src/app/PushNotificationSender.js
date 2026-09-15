"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import styles from "./page.module.css";

const PRESETS = [
  {
    label: "📢 Simple Text",
    description: "Standard text notification",
    data: {
      title: "⚡ Test Push Notification",
      subtitle: "Teaching Pariksha",
      body: "Hello! This is a test push notification sent via Expo Push Server.",
      imageUrl: "",
      delaySeconds: 0,
      customData: JSON.stringify({ screen: "Home", type: "test" }, null, 2),
      priority: "high",
      sound: "default",
      badge: 1,
      channelId: "default",
    },
  },
  {
    label: "🖼️ With Banner Image",
    description: "Rich push notification with image attachment",
    data: {
      title: "🔥 Special Offer - 50% Flat Discount!",
      subtitle: "BPSC TRE 4.0 Super Combo",
      body: "Get complete access to Live Classes, Mock Test Series & PDF Notes. Offer ends tonight!",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      delaySeconds: 0,
      customData: JSON.stringify(
        {
          screen: "CourseDetails",
          courseId: "appx_course_123",
          promoCode: "BPSC50",
          bannerUrl:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        },
        null,
        2
      ),
      priority: "high",
      sound: "default",
      badge: 1,
      channelId: "promotions",
    },
  },
  {
    label: "⏱️ Timer Countdown (5s Delay)",
    description: "Scheduled dispatch with live 5s countdown timer",
    data: {
      title: "⏰ Live Class Starting Now!",
      subtitle: "Maths & Science Special",
      body: "Sir is going live right now. Click to join the interactive live session immediately!",
      imageUrl: "",
      delaySeconds: 5,
      customData: JSON.stringify(
        { screen: "LiveClass", classId: "live_9981" },
        null,
        2
      ),
      priority: "high",
      sound: "default",
      badge: 1,
      channelId: "reminders",
    },
  },
  {
    label: "🔗 Deep Link Navigation",
    description: "Includes screen navigation payload for React Native app",
    data: {
      title: "💬 New Doubt Discussion Reply",
      subtitle: "Teaching Pariksha Community",
      body: "Saurabh Sir replied to your doubt on BPSC Exam Strategy. Tap to open chat.",
      imageUrl: "",
      delaySeconds: 0,
      customData: JSON.stringify(
        {
          screen: "ChatScreen",
          chatId: "discussion_77",
          author: "Saurabh Sir",
          topic: "BPSC Strategy",
        },
        null,
        2
      ),
      priority: "high",
      sound: "default",
      badge: 1,
      channelId: "chat",
    },
  },
  {
    label: "🚨 High Priority Alert",
    description: "Urgent notification with custom sound & badge",
    data: {
      title: "🚨 Urgent Exam Notice Released!",
      subtitle: "Official Announcement",
      body: "Exam date timetable modified. Download official PDF notice inside the app.",
      imageUrl: "",
      delaySeconds: 0,
      customData: JSON.stringify({ type: "urgent_notice", noticeId: "notice_402" }, null, 2),
      priority: "high",
      sound: "default",
      badge: 1,
      channelId: "announcements",
    },
  },
];

const SAMPLE_TOKENS = [
  "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "ExponentPushToken[AbCdEf1234567890GhIjKl]",
];

export default function PushNotificationSender() {
  const [token, setToken] = useState("");
  const [recentTokens, setRecentTokens] = useState([]);
  const [title, setTitle] = useState("⚡ Test Push Notification");
  const [subtitle, setSubtitle] = useState("Teaching Pariksha");
  const [bodyText, setBodyText] = useState("Hello! This is a test push notification sent via Expo Server.");
  const [imageUrl, setImageUrl] = useState("");
  const [customDataStr, setCustomDataStr] = useState(
    JSON.stringify({ screen: "Home", type: "test" }, null, 2)
  );
  const [jsonError, setJsonError] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Expo settings
  const [priority, setPriority] = useState("high");
  const [sound, setSound] = useState("default");
  const [badge, setBadge] = useState(1);
  const [channelId, setChannelId] = useState("default");
  const [categoryId, setCategoryId] = useState("");
  const [ttl, setTtl] = useState("");
  const [expoAccessToken, setExpoAccessToken] = useState("");

  // Sending & countdown state
  const [loading, setLoading] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const countdownIntervalRef = useRef(null);

  // Response & log
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);

  // Load saved push token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("tp_expo_push_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedToken) setToken(savedToken);

      const savedRecents = localStorage.getItem("tp_recent_push_tokens");
      if (savedRecents) setRecentTokens(JSON.parse(savedRecents));
    } catch {}
  }, []);

  const saveTokenToHistory = (newToken) => {
    if (!newToken || newToken.includes("xxxxxx")) return;
    try {
      localStorage.setItem("tp_expo_push_token", newToken);
      setRecentTokens((prev) => {
        const filtered = prev.filter((t) => t !== newToken);
        const updated = [newToken, ...filtered].slice(0, 5);
        localStorage.setItem("tp_recent_push_tokens", JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const applyPreset = (preset) => {
    setTitle(preset.data.title);
    setSubtitle(preset.data.subtitle);
    setBodyText(preset.data.body);
    setImageUrl(preset.data.imageUrl);
    setDelaySeconds(preset.data.delaySeconds);
    setCustomDataStr(preset.data.customData);
    setPriority(preset.data.priority);
    setSound(preset.data.sound);
    setBadge(preset.data.badge);
    setChannelId(preset.data.channelId);
    setResponse(null);
    setJsonError("");
  };

  const validateAndParseJson = () => {
    if (!customDataStr.trim()) return {};
    try {
      setJsonError("");
      return JSON.parse(customDataStr);
    } catch (e) {
      setJsonError("Invalid JSON in Custom Data: " + e.message);
      return null;
    }
  };

  const executeSend = async () => {
    setLoading(true);
    setResponse(null);

    const parsedData = validateAndParseJson();
    if (parsedData === null) {
      setLoading(false);
      return;
    }

    saveTokenToHistory(token);

    const payload = {
      to: token,
      title,
      subtitle,
      body: bodyText,
      imageUrl,
      data: parsedData,
      priority,
      sound,
      badge: Number(badge),
      channelId,
      categoryId,
      ttl: ttl ? Number(ttl) : undefined,
      expoAccessToken: expoAccessToken || undefined,
    };

    try {
      const res = await fetch("/api/send-push-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      setResponse({ ...json, apiStatus: res.status });

      const firstTicket = json.tickets?.[0] || {};
      const ticketStatus = firstTicket.status || (res.status === 200 ? "ok" : "error");

      setLogs((prev) => [
        {
          title,
          token: token ? (token.length > 25 ? token.slice(0, 22) + "..." : token) : "No Token",
          timestamp: new Date().toISOString(),
          status: ticketStatus,
          apiStatus: res.status,
          hasImage: Boolean(imageUrl),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
      setCountdownActive(false);
    }
  };

  const handleStartSend = () => {
    if (!token.trim()) {
      alert("Please enter a valid Expo Push Token (e.g. ExponentPushToken[...])");
      return;
    }

    const parsedData = validateAndParseJson();
    if (parsedData === null) return;

    if (delaySeconds > 0) {
      setCountdownActive(true);
      setRemainingSeconds(delaySeconds);

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      let count = delaySeconds;
      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        setRemainingSeconds(count);
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current);
          executeSend();
        }
      }, 1000);
    } else {
      executeSend();
    }
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdownActive(false);
    setRemainingSeconds(0);
    setLoading(false);
  };

  return (
    <div className={styles.simBody}>
      {/* Left Panel - Push Configuration */}
      <div className={styles.leftPanel}>
        {/* Presets */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Notification Presets</h3>
          <div className={styles.presetGrid}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={styles.presetBtn}
                onClick={() => applyPreset(p)}
                type="button"
              >
                <strong>{p.label}</strong>
                <span className={styles.presetDesc}>{p.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Target Push Token */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h3 className={styles.sectionTitle}>Expo Push Token *</h3>
            <button
              className={styles.smallHelperBtn}
              onClick={() => setToken("ExponentPushToken[sample_token_123456789]")}
              type="button"
            >
              + Sample Token
            </button>
          </div>
          <input
            className={styles.input}
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
          />
          {recentTokens.length > 0 && (
            <div className={styles.recentTokensRow}>
              <span className={styles.fieldHint}>Recent:</span>
              {recentTokens.map((t, idx) => (
                <button
                  key={idx}
                  className={styles.tokenPill}
                  onClick={() => setToken(t)}
                  type="button"
                >
                  {t.slice(0, 18)}...
                </button>
              ))}
            </div>
          )}
          <span className={styles.fieldHint}>
            Format: <code>ExponentPushToken[...]</code> from your Expo React Native app.
          </span>
        </section>

        {/* Content Configuration */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Notification Content</h3>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Title *
              <input
                className={styles.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="🔥 New Course Launched!"
              />
            </label>

            <label className={styles.fieldLabel}>
              Subtitle (Optional)
              <input
                className={styles.input}
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Teaching Pariksha"
              />
            </label>

            <label className={styles.fieldLabel}>
              Body Message *
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                rows={3}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Message body text displayed in system tray..."
              />
            </label>

            <label className={styles.fieldLabel}>
              Image URL (Rich Notification with Banner)
              <input
                className={styles.input}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner-image.jpg"
              />
            </label>

            {/* Live Image Preview */}
            {imageUrl && (
              <div className={styles.imagePreviewBox}>
                <span className={styles.blockLabel}>Rich Notification Card Preview</span>
                <div className={styles.mockNotificationCard}>
                  <div className={styles.mockHeader}>
                    <span className={styles.mockAppIcon}>🔔</span>
                    <span className={styles.mockAppName}>TEACHING PARIKSHA</span>
                    <span className={styles.mockTime}>now</span>
                  </div>
                  <div className={styles.mockTitle}>{title}</div>
                  <div className={styles.mockBody}>{bodyText}</div>
                  <img
                    src={imageUrl}
                    alt="Notification Banner Preview"
                    className={styles.mockImage}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Timer / Delay Controls */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h3 className={styles.sectionTitle}>⏱️ Scheduled Send / Countdown Timer</h3>
            <span className={styles.badgeLabel}>
              {delaySeconds > 0 ? `${delaySeconds}s Delay` : "Immediate"}
            </span>
          </div>
          <div className={styles.timerControlRow}>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.timerQuickBtns}>
              {[0, 5, 10, 30, 60].map((sec) => (
                <button
                  key={sec}
                  className={`${styles.timerChip} ${delaySeconds === sec ? styles.activeChip : ""}`}
                  onClick={() => setDelaySeconds(sec)}
                  type="button"
                >
                  {sec === 0 ? "Now" : `${sec}s`}
                </button>
              ))}
            </div>
          </div>
          <span className={styles.fieldHint}>
            Set delay in seconds to simulate scheduled/delayed notifications.
          </span>
        </section>

        {/* Custom Data Payload */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h3 className={styles.sectionTitle}>Custom Payload Data (JSON)</h3>
            <button
              className={styles.smallHelperBtn}
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(customDataStr), null, 2);
                  setCustomDataStr(formatted);
                  setJsonError("");
                } catch (e) {
                  setJsonError("Invalid JSON formatting");
                }
              }}
              type="button"
            >
              Format JSON
            </button>
          </div>
          <textarea
            className={`${styles.input} ${styles.codeArea}`}
            rows={5}
            value={customDataStr}
            onChange={(e) => {
              setCustomDataStr(e.target.value);
              setJsonError("");
            }}
            placeholder={`{\n  "screen": "CourseDetails",\n  "courseId": "123"\n}`}
          />
          {jsonError && <div className={styles.jsonErrorText}>{jsonError}</div>}
          <span className={styles.fieldHint}>
            Sent inside <code>data</code> parameter for deep linking & in-app action handling.
          </span>
        </section>

        {/* Advanced Settings Toggle */}
        <section className={styles.section}>
          <button
            className={styles.toggleAdvancedBtn}
            onClick={() => setShowAdvanced(!showAdvanced)}
            type="button"
          >
            {showAdvanced ? "▼ Hide Advanced Expo Options" : "► Show Advanced Expo Options (Priority, Sound, Channel)"}
          </button>

          {showAdvanced && (
            <div className={styles.advancedBox}>
              <div className={styles.advancedGrid}>
                <label className={styles.fieldLabel}>
                  Priority
                  <select
                    className={styles.select}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="high">High (Immediate)</option>
                    <option value="default">Default</option>
                    <option value="normal">Normal</option>
                  </select>
                </label>

                <label className={styles.fieldLabel}>
                  Sound
                  <select
                    className={styles.select}
                    value={sound}
                    onChange={(e) => setSound(e.target.value)}
                  >
                    <option value="default">default (System Sound)</option>
                    <option value="none">none (Mute)</option>
                  </select>
                </label>

                <label className={styles.fieldLabel}>
                  Badge Count
                  <input
                    className={styles.input}
                    type="number"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </label>

                <label className={styles.fieldLabel}>
                  Channel ID (Android)
                  <input
                    className={styles.input}
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="default"
                  />
                </label>
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: "10px" }}>
                <label className={styles.fieldLabel}>
                  Category ID (Interactive Notification)
                  <input
                    className={styles.input}
                    type="text"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="e.g. interactive_reply"
                  />
                </label>

                <label className={styles.fieldLabel}>
                  TTL (Time-to-Live in seconds)
                  <input
                    className={styles.input}
                    type="number"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                    placeholder="e.g. 3600"
                  />
                </label>

                <label className={styles.fieldLabel}>
                  Expo Access Token (Optional)
                  <input
                    className={styles.input}
                    type="password"
                    value={expoAccessToken}
                    onChange={(e) => setExpoAccessToken(e.target.value)}
                    placeholder="Bearer token if push security enabled"
                  />
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Live Countdown Overlay / Modal */}
        {countdownActive && (
          <div className={styles.countdownCard}>
            <div className={styles.countdownHeader}>
              <span className={styles.spinnerIcon}>⏱️</span>
              <div>
                <strong>Sending Push Notification...</strong>
                <div>Dispatching to Expo Server in {remainingSeconds} second(s)</div>
              </div>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${((delaySeconds - remainingSeconds) / delaySeconds) * 100}%`,
                }}
              />
            </div>
            <button
              className={styles.cancelBtn}
              onClick={cancelCountdown}
              type="button"
            >
              Cancel Send
            </button>
          </div>
        )}

        {/* Main Action Button */}
        <button
          className={styles.sendBtn}
          onClick={handleStartSend}
          disabled={loading || countdownActive}
          type="button"
        >
          {loading
            ? "Sending to Expo Server..."
            : countdownActive
            ? `Sending in ${remainingSeconds}s...`
            : delaySeconds > 0
            ? `Start ${delaySeconds}s Countdown & Send`
            : "🚀 Send Push Notification"}
        </button>
      </div>

      {/* Right Panel - Response & Ticket Logs */}
      <div className={styles.rightPanel}>
        {/* Expo API Response */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Expo Server Response & Tickets</h3>
          {!response && !loading && !countdownActive && (
            <div className={styles.emptyState}>
              <p>No push notification sent yet.</p>
              <p className={styles.fieldHint}>
                Enter an Expo Push Token and click Send to test push delivery.
              </p>
            </div>
          )}

          {loading && <div className={styles.emptyState}>Contacting exp.host API...</div>}

          {response && (
            <div className={styles.responsePanel}>
              {response.error ? (
                <div className={styles.statusRed}>
                  <strong>Error:</strong> {response.error}
                  {response.detail && <div>{response.detail}</div>}
                </div>
              ) : (
                <>
                  <div className={styles.statusRow}>
                    <div
                      className={`${styles.statusBadge} ${
                        response.expoStatus === 200 ? styles.statusGreen : styles.statusRed
                      }`}
                    >
                      HTTP {response.expoStatus} OK
                    </div>

                    {response.tickets?.[0]?.status === "ok" && (
                      <span className={`${styles.statusBadge} ${styles.statusGreen}`}>
                        ✓ Ticket OK
                      </span>
                    )}

                    {response.tickets?.[0]?.status === "error" && (
                      <span className={`${styles.statusBadge} ${styles.statusRed}`}>
                        ✖ Ticket Error ({response.tickets[0].details?.error || "Error"})
                      </span>
                    )}
                  </div>

                  {/* Tickets Breakdown */}
                  {response.tickets && response.tickets.length > 0 && (
                    <div className={styles.responseBlock}>
                      <span className={styles.blockLabel}>Expo Push Ticket Details</span>
                      {response.tickets.map((t, i) => (
                        <div key={i} className={styles.ticketBox}>
                          <div>
                            <strong>Status:</strong>{" "}
                            <span
                              className={t.status === "ok" ? styles.textGreen : styles.textRed}
                            >
                              {t.status.toUpperCase()}
                            </span>
                          </div>
                          {t.id && (
                            <div>
                              <strong>Ticket ID:</strong> <code>{t.id}</code>
                            </div>
                          )}
                          {t.message && (
                            <div className={styles.textRed}>
                              <strong>Message:</strong> {t.message}
                            </div>
                          )}
                          {t.details?.error && (
                            <div className={styles.errorExplanation}>
                              <strong>Error Type:</strong> {t.details.error}
                              {t.details.error === "DeviceNotRegistered" && (
                                <p>
                                  💡 <em>DeviceNotRegistered</em> means the target device can no
                                  longer receive notifications (e.g. app uninstalled or push token
                                  expired).
                                </p>
                              )}
                              {t.details.error === "MessageTooBig" && (
                                <p>💡 Payload exceeds 4096 bytes limits.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sent Payload */}
                  <div className={styles.responseBlock}>
                    <span className={styles.blockLabel}>Payload Sent to Expo Server</span>
                    <pre className={styles.pre}>
                      {JSON.stringify(response.sentPayload, null, 2)}
                    </pre>
                  </div>

                  {/* Raw Expo API Response */}
                  <div className={styles.responseBlock}>
                    <span className={styles.blockLabel}>Raw Expo API Response</span>
                    <pre className={styles.pre}>
                      {JSON.stringify(response.expoResponse, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Session Log */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Notification History (Session)</h3>
          {logs.length === 0 ? (
            <p className={styles.emptyState}>No push notifications sent in this session.</p>
          ) : (
            <div className={styles.logTable}>
              <div className={styles.logHeader}>
                <span>Title</span>
                <span>Token</span>
                <span>Ticket</span>
              </div>
              {logs.map((entry, i) => (
                <div key={i} className={styles.logRow}>
                  <div className={styles.logTitleCell}>
                    {entry.hasImage && <span title="Has Banner Image">🖼️ </span>}
                    <strong>{entry.title}</strong>
                    <div className={styles.logTime}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className={styles.logTokenCell}>{entry.token}</span>
                  <span
                    className={`${styles.logStatus} ${
                      entry.status === "ok" ? styles.statusGreen : styles.statusRed
                    }`}
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
  );
}
