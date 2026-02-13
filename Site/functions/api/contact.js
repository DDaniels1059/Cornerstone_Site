export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    const {
      name,
      email,
      service,
      leatherTier,
      message,
      website
    } = data;

    if (website) {
      return new Response("Spam detected", { status: 400 });
    }

    if (!name || !email || !message || !service) {
      return new Response("Missing required fields", { status: 400 });
    }

    const emailBody = `
New website message:

Name: ${name}
Email: ${email}
Service: ${service}
Leather Tier: ${leatherTier || "N/A"}

Message:
${message}
`.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: env.TO_EMAIL,
        reply_to: email,
        subject: `New message from ${name}`,
        text: emailBody
      })
    });

    if (!resendResponse.ok) {
      return new Response("Email failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });

  } catch {
    return new Response("Server error", { status: 500 });
  }
}
