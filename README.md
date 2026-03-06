# 🚗 SnapReserve — Guide de déploiement complet

## Variables d'environnement nécessaires

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=noreply@tondomaine.com
TWILIO_ACCOUNT_SID=          # Optionnel pour SMS
TWILIO_AUTH_TOKEN=            # Optionnel pour SMS
TWILIO_PHONE_NUMBER=          # Optionnel pour SMS
NEXT_PUBLIC_APP_URL=https://TON_APP.vercel.app
```

---

## Étape 1 : Supabase (10 min)

1. [app.supabase.com](https://app.supabase.com) → New project
2. **SQL Editor** → Colle tout le contenu de `supabase-schema.sql` → Run
3. **Storage** → New bucket → nom: `car-photos` → ✅ Public
4. Dans Storage Policies, ajoute les 3 policies (voir supabase-schema.sql)
5. **Database → Replication** → Active la table `cars` pour le Realtime
6. **Settings → API** → Copie `URL`, `anon key`, `service_role key`

---

## Étape 2 : Stripe (5 min)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys
2. Copie `Publishable key` et `Secret key`

---

## Étape 3 : Resend (emails) (3 min)

1. [resend.com](https://resend.com) → Créer un compte gratuit (3 000 emails/mois)
2. **API Keys** → Create API Key → copie la clé
3. **Domains** → Add domain → vérifie ton domaine (ou utilise le domaine Resend de test)

---

## Étape 4 : Twilio (SMS) — Optionnel (5 min)

> Sans Twilio, l'app fonctionne parfaitement — les notifications SMS sont simplement ignorées.

1. [console.twilio.com](https://console.twilio.com) → Créer un compte
2. Copie `Account SID` et `Auth Token` depuis le dashboard
3. Achète un numéro de téléphone (~1$/mois)

---

## Étape 5 : Déploiement Vercel (5 min)

```bash
git init && git add . && git commit -m "SnapReserve initial"
# Crée un repo sur GitHub puis :
git remote add origin https://github.com/TON_USER/snapreserve.git
git push -u origin main
```

1. [vercel.com](https://vercel.com) → Add New Project → importe le repo
2. Ajoute toutes les variables d'environnement
3. Deploy !

### Configurer le Webhook Stripe
1. Stripe → Developers → Webhooks → Add endpoint
2. URL : `https://TON_APP.vercel.app/api/webhooks/stripe`
3. Events à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie le Signing secret → mets à jour `STRIPE_WEBHOOK_SECRET` dans Vercel → Redeploy

### Configurer le Portail de Facturation Stripe
1. Stripe → Settings → Billing → Customer portal
2. Active-le et configure les options (annulation, mise à jour de carte)
3. Sauvegarde

---

## Test final

Carte Stripe de test : `4242 4242 4242 4242` — Date: `12/34` — CVC: `123`

---

## Fonctionnalités complètes

| Fonctionnalité | Statut |
|---|---|
| Auth vendeur (inscription/connexion) | ✅ |
| Dashboard vendeur | ✅ |
| Ajout voiture (photos, prix, acompte) | ✅ |
| Page publique avec lien unique | ✅ |
| Partage natif (Web Share API) | ✅ |
| Paiement Stripe sécurisé | ✅ |
| Logique anti-conflit atomique | ✅ |
| Remboursement automatique si raté | ✅ |
| **Temps réel** (statut live sans refresh) | ✅ |
| **Email vendeur** à chaque réservation | ✅ |
| **Email acheteur** confirmation + raté | ✅ |
| **SMS vendeur** à chaque réservation | ✅ |
| **SMS acheteur** confirmation + raté | ✅ |
| Page profil vendeur | ✅ |
| Page réservations avec stats | ✅ |
| Navigation mobile bottom tabs | ✅ |
| Métadonnées OG (preview Snapchat) | ✅ |
| Middleware auth robuste | ✅ |
| Page 404 custom | ✅ |

---

## Coûts

| Service | Coût |
|---|---|
| Vercel Hobby | Gratuit |
| Supabase Free | Gratuit |
| Resend Free | Gratuit (3 000 emails/mois) |
| Twilio | ~1$/mois + 0,07€/SMS |
| Stripe | 1,5% + 0,25€/transaction |

**Total au démarrage : ~1$/mois** (seulement si tu actives les SMS)
