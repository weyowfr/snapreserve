import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'noreply@snapreserve.fr'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://snapreserve.vercel.app'

// ─── Email au VENDEUR : ta voiture vient d'être réservée ───────────────────
export async function sendSellerReservationEmail({
  sellerEmail,
  sellerName,
  carTitle,
  carSlug,
  buyerName,
  buyerPhone,
  depositAmount,
  platformFee = 0,
}: {
  sellerEmail: string
  sellerName: string
  carTitle: string
  carSlug: string
  buyerName: string
  buyerPhone: string
  depositAmount: number
  platformFee?: number
}) {
  const depositFormatted = (depositAmount / 100).toLocaleString('fr-FR')
  const feeFormatted = (platformFee / 100).toLocaleString('fr-FR')
  const netFormatted = ((depositAmount - platformFee) / 100).toLocaleString('fr-FR')

  await resend.emails.send({
    from: `SnapReserve <${FROM}>`,
    to: sellerEmail,
    subject: `🎉 ${carTitle} vient d'être réservée !`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voiture réservée</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:4px;margin:0;">
        SNAP<span style="color:#f97316;">RESERVE</span>
      </h1>
    </div>

    <!-- Card -->
    <div style="background:#111111;border:1px solid #222222;border-radius:20px;padding:32px;margin-bottom:24px;">
      
      <!-- Success icon -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;width:64px;height:64px;background:rgba(249,115,22,0.15);border-radius:50%;align-items:center;justify-content:center;">
          <span style="font-size:28px;">🎉</span>
        </div>
      </div>

      <h2 style="color:#ffffff;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
        Bonne nouvelle, ${sellerName} !
      </h2>
      <p style="color:#71717a;text-align:center;margin:0 0 28px;font-size:15px;">
        Ta voiture <strong style="color:#f97316;">${carTitle}</strong> vient d'être réservée.
      </p>

      <!-- Buyer info -->
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:600;">Infos de l'acheteur</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#71717a;font-size:14px;padding:6px 0;">Prénom</td>
            <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${buyerName}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:14px;padding:6px 0;">Téléphone</td>
            <td style="text-align:right;"><a href="tel:${buyerPhone}" style="color:#f97316;font-size:14px;font-weight:600;text-decoration:none;">${buyerPhone}</a></td>
          </tr>
          <tr style="border-top:1px solid #222;">
            <td style="color:#71717a;font-size:14px;padding:12px 0 4px;">Acompte brut</td>
            <td style="color:#ffffff;font-size:16px;font-weight:700;text-align:right;padding:12px 0 4px;">${depositFormatted} €</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:2px 0;">Frais SnapReserve (5%)</td>
            <td style="color:#f87171;font-size:13px;text-align:right;padding:2px 0;">- ${feeFormatted} €</td>
          </tr>
          <tr style="border-top:1px solid #222;">
            <td style="color:#71717a;font-size:14px;padding:10px 0 6px;font-weight:600;">Tu reçois net</td>
            <td style="color:#4ade80;font-size:20px;font-weight:700;text-align:right;padding:10px 0 6px;">${netFormatted} €</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <a href="${APP_URL}/dashboard" 
         style="display:block;background:#f97316;color:#ffffff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
        Voir sur mon dashboard →
      </a>
    </div>

    <!-- Footer -->
    <p style="color:#3f3f46;font-size:12px;text-align:center;">
      SnapReserve — Zéro conflit, 100% transparent<br>
      <a href="${APP_URL}" style="color:#f97316;text-decoration:none;">snapreserve.fr</a>
    </p>
  </div>
</body>
</html>
    `,
  })
}

// ─── Email à l'ACHETEUR : ta réservation est confirmée ────────────────────
export async function sendBuyerConfirmationEmail({
  buyerEmail,
  buyerName,
  carTitle,
  carSlug,
  depositAmount,
  sellerName,
}: {
  buyerEmail?: string
  buyerName: string
  carTitle: string
  carSlug: string
  depositAmount: number
  sellerName: string
}) {
  if (!buyerEmail) return // email optionnel pour l'acheteur

  const depositFormatted = (depositAmount / 100).toLocaleString('fr-FR')

  await resend.emails.send({
    from: `SnapReserve <${FROM}>`,
    to: buyerEmail,
    subject: `✅ Tu as réservé : ${carTitle}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:4px;margin:0;">
        SNAP<span style="color:#f97316;">RESERVE</span>
      </h1>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:20px;padding:32px;">
      <div style="text-align:center;margin-bottom:20px;font-size:48px;">🔒</div>
      <h2 style="color:#4ade80;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Réservation confirmée !</h2>
      <p style="color:#71717a;text-align:center;margin:0 0 24px;font-size:15px;">
        Tu as réservé <strong style="color:#ffffff;">${carTitle}</strong> en premier.
      </p>
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#71717a;font-size:14px;padding:6px 0;">Voiture</td>
            <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${carTitle}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:14px;padding:6px 0;">Vendeur</td>
            <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${sellerName}</td>
          </tr>
          <tr style="border-top:1px solid #222;">
            <td style="color:#71717a;font-size:14px;padding:12px 0 6px;">Acompte payé</td>
            <td style="color:#4ade80;font-size:18px;font-weight:700;text-align:right;padding:12px 0 6px;">${depositFormatted} €</td>
          </tr>
        </table>
      </div>
      <p style="color:#71717a;font-size:13px;text-align:center;margin:0;">
        Le vendeur va te contacter très rapidement pour finaliser la vente.
      </p>
    </div>
    <p style="color:#3f3f46;font-size:12px;text-align:center;margin-top:24px;">
      SnapReserve — <a href="${APP_URL}" style="color:#f97316;text-decoration:none;">snapreserve.fr</a>
    </p>
  </div>
</body>
</html>
    `,
  })
}

// ─── Email à l'ACHETEUR : désolé, tu as raté la réservation ──────────────
export async function sendBuyerMissedEmail({
  buyerEmail,
  buyerName,
  carTitle,
}: {
  buyerEmail?: string
  buyerName: string
  carTitle: string
}) {
  if (!buyerEmail) return

  await resend.emails.send({
    from: `SnapReserve <${FROM}>`,
    to: buyerEmail,
    subject: `😔 ${carTitle} — Quelqu'un a été plus rapide`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:4px;margin:0;">
        SNAP<span style="color:#f97316;">RESERVE</span>
      </h1>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:20px;padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">😔</div>
      <h2 style="color:#f87171;font-size:20px;font-weight:700;margin:0 0 12px;">Raté cette fois...</h2>
      <p style="color:#71717a;font-size:15px;margin:0 0 24px;">
        Quelqu'un a réservé <strong style="color:#ffffff;">${carTitle}</strong> avant toi. 
        Ton paiement n'a pas été prélevé.
      </p>
      <p style="color:#71717a;font-size:13px;">Surveille les nouvelles annonces du vendeur sur Snapchat !</p>
    </div>
  </div>
</body>
</html>
    `,
  })
}
