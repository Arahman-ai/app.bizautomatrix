import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM!;
const ADMIN = process.env.EMAIL_ADMIN!.split(",").map((e) => e.trim());

export async function sendNewLeadNotification(lead: {
  businessName: string;
  ownerName?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  city?: string | null;
  industry?: string | null;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `New Lead: ${lead.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New Audit Lead!</h2>
          <p style="margin: 5px 0 0;">Someone just submitted the free audit form</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Business</td><td style="padding: 8px 0; font-weight: bold;">${lead.businessName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Owner</td><td style="padding: 8px 0;">${lead.ownerName ?? "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">${lead.phone ?? "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Website</td><td style="padding: 8px 0;">${lead.website ?? "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">City</td><td style="padding: 8px 0;">${lead.city ?? "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Industry</td><td style="padding: 8px 0;">${lead.industry ?? "—"}</td></tr>
          </table>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View in Admin Panel →
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendReviewRequest({
  customerName,
  customerEmail,
  businessName,
  reviewLink,
}: {
  customerName: string;
  customerEmail: string;
  businessName: string;
  reviewLink: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `How was your experience at ${businessName}?`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 24px;">We'd Love Your Feedback!</h2>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Share your experience with others</p>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${customerName}</strong>,</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Thank you for choosing <strong>${businessName}</strong>! We hope you had a great experience.
          </p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Would you take 60 seconds to leave us a Google review? Your feedback helps us improve and helps other customers find us.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${reviewLink}" style="background: #2563eb; color: #ffffff; padding: 16px 36px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
              ⭐ Leave a Google Review
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">
            Takes less than a minute · No account needed
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            You received this because you recently visited ${businessName}.<br/>
            Powered by <a href="https://bizautomatrix.com" style="color: #6b7280;">BizAutomatrix</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(name: string, email: string, businessName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.bizautomatrix.com";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to BizAutomatrix, ${name.split(" ")[0]}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to BizAutomatrix!</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Your marketing is about to go on autopilot</p>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${name.split(" ")[0]}</strong>,</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Welcome aboard! Your account for <strong>${businessName}</strong> is ready. Here's how to get started:
          </p>
          <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px; font-weight: bold; color: #1e40af;">Your Getting Started Checklist:</p>
            <p style="margin: 8px 0; color: #374151;">✅ Create your account</p>
            <p style="margin: 8px 0; color: #374151;">⬜ Complete your business profile</p>
            <p style="margin: 8px 0; color: #374151;">⬜ Add your Google Review link</p>
            <p style="margin: 8px 0; color: #374151;">⬜ Send your first review request</p>
            <p style="margin: 8px 0; color: #374151;">⬜ Upgrade to a paid plan</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/dashboard" style="background: #2563eb; color: #ffffff; padding: 16px 36px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
              Go to Your Dashboard →
            </a>
          </div>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Questions? Just reply to this email or reach us at
            <a href="tel:+14042037674" style="color: #2563eb;">+1 (404) 203-7674</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} BizAutomatrix ·
            <a href="https://bizautomatrix.com" style="color: #6b7280;">bizautomatrix.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendAuditConfirmation(email: string, businessName: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Free Audit is Being Prepared — ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Thanks for Submitting!</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi there,</p>
          <p>We received your free audit request for <strong>${businessName}</strong>.</p>
          <p>Our team is analyzing your online presence and will send your personalized report within <strong>24 hours</strong>.</p>
          <p>Here's what we'll cover in your audit:</p>
          <ul>
            <li>Google Business Profile score</li>
            <li>Online review analysis</li>
            <li>Website performance</li>
            <li>Social media presence</li>
            <li>Local SEO opportunities</li>
          </ul>
          <p>Stay tuned!</p>
          <p><strong>The BizAutomatrix Team</strong></p>
        </div>
      </div>
    `,
  });
}
