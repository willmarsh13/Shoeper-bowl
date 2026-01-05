const nodemailer = require("nodemailer");
const {gmailSecret} = ("../databaseCreds");

async function SendEmail({
                             fromEmail = "Shoeper-bowl <willmarsh13@gmail.com>",
                             toEmails = [],
                             subject = "",
                             body = "",
                             ctaText,
                             ctaUrl,
                             secondaryText,
                             secondaryUrl,
                         }) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'willmarsh13@gmail.com',
            pass: gmailSecret,
        },
    });

    const html = buildShoeperBowlTemplate({
        subject,
        body,
        ctaText,
        ctaUrl,
        secondaryText,
        secondaryUrl,
    });

    return transporter.sendMail({
        from: fromEmail,
        to: toEmails.join(", "),
        subject,
        text: body,
        html,
    });
}

function buildShoeperBowlTemplate({
                                      subject,
                                      body,
                                      ctaText,
                                      ctaUrl,
                                      secondaryText,
                                      secondaryUrl,
                                  }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0b;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 10px;">
        <table width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#1f2937;color:#ffffff;padding:20px;text-align:center;">
              <h1 style="margin:0;font-size:26px;">Shoeper-bowl</h1>
              <p style="margin:5px 0 0;font-size:14px;">
                Postseason Fantasy Football Tournament
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:25px;color:#111827;font-size:15px;line-height:1.6;">
              ${body
        .split("\n")
        .map(line => `<p style="margin:0 0 12px;">${line}</p>`)
        .join("")}
            </td>
          </tr>

          <!-- CTA -->
          ${
        ctaUrl
            ? `
          <tr>
            <td align="center" style="padding:10px 25px 25px;">
              <a href="${ctaUrl}"
                 style="
                   display:inline-block;
                   background:#2563eb;
                   color:#ffffff;
                   text-decoration:none;
                   padding:12px 24px;
                   border-radius:6px;
                   font-weight:bold;
                 ">
                 ${ctaText || "Review Request"}
              </a>
            </td>
          </tr>
          `
            : ""
    }

          <!-- Secondary Action -->
          ${
        secondaryUrl
            ? `
          <tr>
            <td align="center" style="padding-bottom:20px;font-size:13px;">
              <a href="${secondaryUrl}" style="color:#6b7280;text-decoration:underline;">
                ${secondaryText || "Reject request"}
              </a>
            </td>
          </tr>
          `
            : ""
    }

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280;">
              <p style="margin:0;">
                Shoeper-bowl Admin Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

module.exports = {
    SendEmail
}