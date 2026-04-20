import { createHmac, timingSafeEqual } from "crypto";

export async function POST(request) {
  const secret = process.env.APPX_WEBHOOK_SECRET;
  const signature = request.headers.get("x-appx-signature") ?? "";
  const rawBody = await request.text();

  if (secret) {
    const expected =
      "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    const valid = a.length === b.length && timingSafeEqual(a, b);
    if (!valid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload?.event;
  if (!event) {
    return Response.json({ error: "Missing event field" }, { status: 400 });
  }

  return Response.json({
    received: true,
    event,
    timestamp: payload.timestamp,
    data: payload.data,
  });
}
