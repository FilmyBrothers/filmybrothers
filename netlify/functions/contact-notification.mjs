const MAX_BODY_BYTES = 16_384;
const MAX_FIELD_LENGTHS = {
  name: 120,
  email: 254,
  message: 5_000,
};

function respond(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export default async function contactNotification(request) {
  if (request.method !== "POST") {
    return respond(405, { error: "Method not allowed." });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return respond(403, { error: "Invalid request origin." });
      }
    } catch {
      return respond(403, { error: "Invalid request origin." });
    }
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return respond(413, { error: "Request is too large." });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return respond(400, { error: "Invalid JSON body." });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return respond(400, { error: "Invalid contact details." });
  }

  if (Buffer.byteLength(JSON.stringify(payload)) > MAX_BODY_BYTES) {
    return respond(413, { error: "Request is too large." });
  }

  const { name, email, message, attachmentNames = [] } = payload;
  if (
    typeof name !== "string"
    || name.trim().length < 1
    || name.trim().length > MAX_FIELD_LENGTHS.name
    || typeof email !== "string"
    || email.trim().length < 3
    || email.trim().length > MAX_FIELD_LENGTHS.email
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof message !== "string"
    || message.trim().length < 1
    || message.trim().length > MAX_FIELD_LENGTHS.message
    || !Array.isArray(attachmentNames)
    || attachmentNames.length > 5
    || attachmentNames.some((fileName) => typeof fileName !== "string" || fileName.length > 255)
  ) {
    return respond(400, { error: "Please provide valid contact details and message." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_NOTIFICATION_TO || "info@filmybrothers.com";
  if (!apiKey || !from) {
    console.error("Contact email is not configured. Set RESEND_API_KEY and CONTACT_FROM_EMAIL.");
    return respond(503, { error: "Contact email notifications are not configured." });
  }

  const safeName = name.trim().replace(/[\r\n]+/g, " ");
  const safeEmail = email.trim();
  const attachmentList = attachmentNames.length
    ? `\n\nAttachments uploaded to the contact form:\n${attachmentNames.map((fileName) => `- ${fileName}`).join("\n")}`
    : "";
  const text = [
    "A new message was submitted through filmybrothers.com.",
    "",
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    "",
    "Message:",
    message.trim(),
    attachmentList,
  ].join("\n");

  let providerResponse;
  try {
    providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: safeEmail,
        subject: `New website message from ${safeName}`,
        text,
      }),
    });
  } catch (error) {
    console.error("Resend request failed.", error);
    return respond(502, { error: "The email provider could not be reached." });
  }

  if (!providerResponse.ok) {
    console.error("Resend rejected the contact notification.", {
      status: providerResponse.status,
      details: await providerResponse.text(),
    });
    return respond(502, { error: "The email provider rejected the notification." });
  }

  return respond(200, { sent: true });
}
