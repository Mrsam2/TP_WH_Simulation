export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    to,
    title,
    subtitle,
    body: pushBody,
    data,
    imageUrl,
    sound = "default",
    badge,
    priority = "high",
    channelId,
    categoryId,
    ttl,
    expiration,
    expoAccessToken,
  } = body;

  if (!to) {
    return Response.json(
      { error: "Push Token ('to') is required" },
      { status: 400 }
    );
  }

  // Parse push tokens (support comma-separated or string or array)
  let tokens = [];
  if (Array.isArray(to)) {
    tokens = to.filter(Boolean);
  } else if (typeof to === "string") {
    tokens = to
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  if (tokens.length === 0) {
    return Response.json(
      { error: "At least one valid Expo push token must be provided" },
      { status: 400 }
    );
  }

  // Build custom data payload including image if present
  const mergedData = { ...(data || {}) };
  if (imageUrl) {
    mergedData.image = imageUrl;
    mergedData.imageUrl = imageUrl;
  }

  // Construct Expo Push Notification messages payload
  const messages = tokens.map((token) => {
    const msg = {
      to: token,
      sound,
      title: title || "Notification",
      body: pushBody || "",
      data: mergedData,
      priority,
    };

    if (subtitle) msg.subtitle = subtitle;
    if (typeof badge === "number") msg.badge = badge;
    if (channelId) msg.channelId = channelId;
    if (categoryId) msg.categoryId = categoryId;
    if (typeof ttl === "number") msg.ttl = ttl;
    if (typeof expiration === "number") msg.expiration = expiration;

    // Rich media attachment for iOS / Android if image provided
    if (imageUrl) {
      msg.attachments = [{ url: imageUrl }];
      // Android rich notification data property
      msg.mutableContent = true;
    }

    return msg;
  });

  const expoHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
  };

  // Add Expo Access Token if provided or set in env
  const accessToken = expoAccessToken || process.env.EXPO_ACCESS_TOKEN;
  if (accessToken) {
    expoHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: expoHeaders,
      body: JSON.stringify(messages.length === 1 ? messages[0] : messages),
    });

    const expoData = await expoRes.json();

    return Response.json({
      expoStatus: expoRes.status,
      expoResponse: expoData,
      tickets: expoData.data || [],
      sentPayload: messages.length === 1 ? messages[0] : messages,
      tokensCount: tokens.length,
    });
  } catch (err) {
    return Response.json(
      {
        error: "Failed to connect to Expo Push Server",
        detail: err.message,
      },
      { status: 502 }
    );
  }
}
