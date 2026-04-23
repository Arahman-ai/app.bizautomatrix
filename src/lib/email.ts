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
