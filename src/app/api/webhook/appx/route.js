export async function POST(request) {
  // Signature validation disabled - open webhook accepting requests directly
  let payload;
  try {
    payload = await request.json();
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
