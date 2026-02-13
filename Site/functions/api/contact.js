export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const data = await request.json();

    const {
      name,
      email,
      service,
      leatherTier,
      addons,
      bookType,
      timeline,
      message,
      website
    } = data;

    // Honeypot spam protection
    if (website) {
      return new Response("Spam detected", { status: 400 });
    }

    // Required field checks
    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const safeAddons = Array.isArray(addons) ? addons : [];

    const emailBody = `
New website message:

Name: ${name}
Email: ${email}
Service: ${service || "N/A"}
Leather Tier: ${leatherTier || "N/A"}
Add-ons: ${safeAddons.length ? safeAddons.join(", ") : "None"}
Book Type: ${bookType || "N/A"}
Timeline: ${timeline || "N/A"}

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
      const errorText = await resendResponse.text();
      return new Response(errorText, { status: 500 });
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    return new Response("Server error", { status: 500 });
  }
}
