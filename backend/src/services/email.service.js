const { Resend } = require('resend');

let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send the weekly digest email to a user.
 * @param {object} user - Mongoose User document
 * @param {object} digest - Mongoose Digest document
 */
async function sendDigestEmail(user, digest) {
  if (!resend) {
    console.warn(`[TabMind] Skipping digest email for ${user.email} (RESEND_API_KEY not configured)`);
    return;
  }

  const { stats, personalityCard, weekOf } = digest;
  const weekLabel = new Date(weekOf).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { background: #0A0A0F; color: #F8FAFC; font-family: Inter, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; padding: 32px; background: #0F0F1A; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); }
    h1 { font-size: 28px; background: linear-gradient(135deg, #7C3AED, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 4px; }
    .week { color: #94A3B8; font-size: 14px; margin-bottom: 28px; }
    .personality { background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2)); border: 1px solid rgba(124,58,237,0.4); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
    .personality .type { font-size: 24px; font-weight: 700; color: #A78BFA; }
    .personality .desc { color: #94A3B8; font-size: 14px; margin-top: 8px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
    .stat { background: #16162A; border-radius: 10px; padding: 16px; }
    .stat .value { font-size: 28px; font-weight: 700; color: #F8FAFC; }
    .stat .label { font-size: 12px; color: #94A3B8; margin-top: 4px; }
    .categories h3 { color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .cat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
    .cat-row:last-child { border-bottom: none; }
    .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 24px; }
    a { color: #7C3AED; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TabMind Weekly</h1>
    <p class="week">Week of ${weekLabel}</p>

    <div class="personality">
      <div class="type">🧠 ${personalityCard.type}</div>
      <div class="desc">${personalityCard.description}</div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="value">${stats.totalOpened}</div>
        <div class="label">Tabs Opened</div>
      </div>
      <div class="stat">
        <div class="value" style="color:#34D399">${stats.totalFulfilled}</div>
        <div class="label">Fulfilled ✓</div>
      </div>
      <div class="stat">
        <div class="value" style="color:#F87171">${stats.totalAbandoned}</div>
        <div class="label">Abandoned ✗</div>
      </div>
      <div class="stat">
        <div class="value" style="color:#A78BFA">${stats.fulfillmentRate}%</div>
        <div class="label">Fulfillment Rate</div>
      </div>
    </div>

    ${
      stats.topCategories?.length > 0
        ? `<div class="categories">
      <h3>Top Categories</h3>
      ${stats.topCategories
        .map(
          (c) => `<div class="cat-row"><span>${c.name}</span><span>${c.count} tabs</span></div>`
        )
        .join('')}
    </div>`
        : ''
    }

    ${stats.peakHour !== null && stats.peakHour !== undefined ? `<p style="color:#94A3B8; font-size:14px; margin-top:20px;">⏰ Your peak tab-opening hour was <strong style="color:#F8FAFC">${stats.peakHour}:00</strong>.</p>` : ''}

    <div class="footer">
      <a href="${process.env.DASHBOARD_URL || 'http://localhost:3000'}/digest">View full digest →</a><br/>
      <br/>TabMind · <a href="${process.env.DASHBOARD_URL || 'http://localhost:3000'}/settings">Manage preferences</a>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'digest@tabmind.app',
      to: user.email,
      subject: `Your TabMind Weekly: You're a ${personalityCard.type} 🧠`,
      html,
    });
    console.log(`Digest email sent to ${user.email}`);
  } catch (err) {
    console.error(`Failed to send digest email to ${user.email}:`, err.message);
  }
}

module.exports = { sendDigestEmail };
