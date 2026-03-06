-- ============================================
-- SNAPRESERVE — Schéma SQL Supabase COMPLET
-- Colle ce code dans l'éditeur SQL de Supabase
-- ============================================

-- Table des vendeurs
CREATE TABLE sellers (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT DEFAULT '',          -- Pour recevoir les SMS de réservation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des voitures
CREATE TABLE cars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       INTEGER NOT NULL,        -- en centimes
  deposit     INTEGER NOT NULL,        -- en centimes
  photos      TEXT[] DEFAULT '{}',
  status      TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE reservations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id             UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  buyer_name         TEXT NOT NULL,
  buyer_phone        TEXT NOT NULL,
  buyer_email        TEXT DEFAULT NULL,   -- Optionnel, pour email de confirmation
  stripe_payment_id  TEXT UNIQUE NOT NULL,
  status             TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_cars_seller_id  ON cars(seller_id);
CREATE INDEX idx_cars_slug       ON cars(slug);
CREATE INDEX idx_cars_status     ON cars(status);
CREATE INDEX idx_res_car_id      ON reservations(car_id);
CREATE INDEX idx_res_stripe_id   ON reservations(stripe_payment_id);
CREATE INDEX idx_res_status      ON reservations(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE sellers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Sellers
CREATE POLICY "sellers_own" ON sellers FOR ALL USING (auth.uid() = id);

-- Cars: lecture publique, écriture propriétaire uniquement
CREATE POLICY "cars_read_public"  ON cars FOR SELECT USING (true);
CREATE POLICY "cars_insert_own"   ON cars FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "cars_update_own"   ON cars FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "cars_delete_own"   ON cars FOR DELETE USING (auth.uid() = seller_id);

-- Reservations: lecture pour le vendeur de la voiture, insert public
CREATE POLICY "res_read_seller" ON reservations FOR SELECT USING (
  EXISTS (SELECT 1 FROM cars WHERE cars.id = car_id AND cars.seller_id = auth.uid())
);
CREATE POLICY "res_insert_public" ON reservations FOR INSERT WITH CHECK (true);

-- ============================================
-- REALTIME — Activer pour la page publique
-- ============================================
-- Dans Supabase → Database → Replication
-- Activer "cars" dans la liste des tables pour le realtime

-- ============================================
-- STORAGE — Bucket car-photos
-- ============================================
-- 1. Storage → New bucket → Nom: "car-photos" → ✅ Public
-- 2. Policies pour car-photos :

-- Lecture publique
-- CREATE POLICY "public_read" ON storage.objects FOR SELECT USING (bucket_id = 'car-photos');

-- Upload authentifié
-- CREATE POLICY "auth_upload" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'car-photos' AND auth.uid() IS NOT NULL
-- );

-- Suppression par le propriétaire
-- CREATE POLICY "owner_delete" ON storage.objects FOR DELETE USING (
--   bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- ============================================
-- ABONNEMENTS — Ajout pour le système payant
-- ============================================

-- Colonne abonnement dans sellers
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS subscription_id     TEXT DEFAULT NULL;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
  CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled'));
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS subscription_end    TIMESTAMPTZ DEFAULT NULL;

-- Colonne frais de service dans reservations (pour tracking)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS platform_fee INTEGER DEFAULT 0; -- 5% en centimes

-- Index
CREATE INDEX IF NOT EXISTS idx_sellers_stripe_customer ON sellers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_sellers_sub_status      ON sellers(subscription_status);
