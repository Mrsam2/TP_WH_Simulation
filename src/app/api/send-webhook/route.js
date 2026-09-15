import { createHmac } from "crypto";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { _targetUrl, ...payload } = body;

  // Resolve relative paths against the incoming request's origin
  let targetUrl = _targetUrl || "/api/webhook/appx";
  if (targetUrl.startsWith("/")) {
    const { origin } = new URL(request.url);
    targetUrl = origin + targetUrl;
  }

  const rawBody = JSON.stringify(payload);
  const secret = process.env.APPX_WEBHOOK_SECRET;
  const signature = secret
    ? "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex")
    : "disabled";

  const headers = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["X-AppX-Signature"] = signature;
  }

  let trackoStatus;
  let trackoBody;
  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: rawBody,
    });
    trackoStatus = res.status;
    trackoBody = await res.text();
  } catch (err) {
    return Response.json(
      { error: "Failed to reach target URL", detail: err.message },
      { status: 502 }
    );
  }

  return Response.json({
    trackoStatus,
    trackoBody,
    sentPayload: payload,
    signature,
    targetUrl,
  });
}
