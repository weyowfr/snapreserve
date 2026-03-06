// SMS via Twilio — optionnel, fonctionne seulement si les variables sont configurées

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || sid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') return null

  // Import dynamique pour éviter les erreurs si Twilio n'est pas configuré
  const twilio = require('twilio')
  return twilio(sid, token)
}

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || ''

// ─── SMS au VENDEUR : réservation reçue ───────────────────────────────────
export async function sendSellerSMS({
  sellerPhone,
  carTitle,
  buyerName,
  buyerPhone,
  depositAmount,
}: {
  sellerPhone: string
  carTitle: string
  buyerName: string
  buyerPhone: string
  depositAmount: number
}) {
  const client = getTwilioClient()
  if (!client || !sellerPhone) return

  const deposit = (depositAmount / 100).toLocaleString('fr-FR')

  try {
    await client.messages.create({
      body: `🎉 SnapReserve\n${carTitle} vient d'être réservée !\n\nAcheteur : ${buyerName}\nTél : ${buyerPhone}\nAcompte reçu : ${deposit}€\n\nConnecte-toi sur ton dashboard pour voir les détails.`,
      from: FROM_NUMBER,
      to: sellerPhone,
    })
  } catch (err) {
    console.error('SMS seller error:', err)
  }
}

// ─── SMS à l'ACHETEUR : confirmation ─────────────────────────────────────
export async function sendBuyerConfirmationSMS({
  buyerPhone,
  carTitle,
  sellerName,
  depositAmount,
}: {
  buyerPhone: string
  carTitle: string
  sellerName: string
  depositAmount: number
}) {
  const client = getTwilioClient()
  if (!client) return

  const deposit = (depositAmount / 100).toLocaleString('fr-FR')

  try {
    await client.messages.create({
      body: `✅ SnapReserve\nRéservation confirmée !\n\n${carTitle} est réservée pour toi.\nAcompte payé : ${deposit}€\n\n${sellerName} va te contacter très rapidement pour finaliser.`,
      from: FROM_NUMBER,
      to: buyerPhone,
    })
  } catch (err) {
    console.error('SMS buyer error:', err)
  }
}

// ─── SMS à l'ACHETEUR : raté ──────────────────────────────────────────────
export async function sendBuyerMissedSMS({
  buyerPhone,
  carTitle,
}: {
  buyerPhone: string
  carTitle: string
}) {
  const client = getTwilioClient()
  if (!client) return

  try {
    await client.messages.create({
      body: `😔 SnapReserve\n${carTitle} a été réservée par quelqu'un d'autre.\n\nTon paiement n'a pas été prélevé. Surveille les prochaines annonces !`,
      from: FROM_NUMBER,
      to: buyerPhone,
    })
  } catch (err) {
    console.error('SMS missed error:', err)
  }
}
