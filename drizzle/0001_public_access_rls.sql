-- ════════════════════════════════════════════════════════════════════════
-- Accès public restreint (défense en profondeur) — Row-Level Security
--
-- Le site public peut se connecter avec un rôle dédié « hhc_public » (variable
-- DATABASE_URL_PUBLIC). Ce rôle ne peut :
--   • LIRE que les contenus publiés (prestations, offres en cours, pages publiées…)
--   • CRÉER que des demandes de rendez-vous (jamais les lire ni les modifier)
-- Il n'a aucun accès aux comptes, sessions, historique ou médiathèque.
--
-- Le rôle propriétaire (DATABASE_URL), utilisé uniquement côté serveur pour
-- l'administration authentifiée, n'est pas soumis à ces politiques.
-- Pour activer la connexion du rôle public (une seule fois, dans la console Neon) :
--   ALTER ROLE hhc_public WITH LOGIN PASSWORD 'un-mot-de-passe-long-et-aleatoire';
-- ════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hhc_public') THEN
    CREATE ROLE hhc_public NOLOGIN;
  END IF;
END
$$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO hhc_public;
--> statement-breakpoint

-- Activation de RLS sur toutes les tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "login_attempts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "price_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "service_variants" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "expertises" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "pages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "sections" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "gallery_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "service_areas" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "appointment_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Lecture des contenus publiés uniquement
GRANT SELECT ON "price_categories", "services", "service_variants", "expertises", "offers",
  "pages", "faqs", "testimonials", "gallery_items", "service_areas", "settings" TO hhc_public;
--> statement-breakpoint
-- Sections : la colonne « draft » (brouillons) n'est pas lisible publiquement
GRANT SELECT ("id", "page_key", "key", "label", "sort_order", "visible", "published", "published_at") ON "sections" TO hhc_public;
--> statement-breakpoint

CREATE POLICY "public_read_categories" ON "price_categories" FOR SELECT TO hhc_public USING ("is_published");
--> statement-breakpoint
CREATE POLICY "public_read_services" ON "services" FOR SELECT TO hhc_public USING ("is_published");
--> statement-breakpoint
CREATE POLICY "public_read_variants" ON "service_variants" FOR SELECT TO hhc_public
  USING (EXISTS (SELECT 1 FROM "services" s WHERE s."id" = "service_id" AND s."is_published"));
--> statement-breakpoint
CREATE POLICY "public_read_expertises" ON "expertises" FOR SELECT TO hhc_public USING ("is_published");
--> statement-breakpoint
CREATE POLICY "public_read_offers" ON "offers" FOR SELECT TO hhc_public
  USING ("status" = 'published'
    AND ("starts_at" IS NULL OR "starts_at" <= now())
    AND ("ends_at" IS NULL OR "ends_at" >= now()));
--> statement-breakpoint
CREATE POLICY "public_read_pages" ON "pages" FOR SELECT TO hhc_public USING ("status" = 'published');
--> statement-breakpoint
CREATE POLICY "public_read_sections" ON "sections" FOR SELECT TO hhc_public
  USING (EXISTS (SELECT 1 FROM "pages" p WHERE p."key" = "page_key" AND p."status" = 'published'));
--> statement-breakpoint
CREATE POLICY "public_read_faqs" ON "faqs" FOR SELECT TO hhc_public USING ("is_published");
--> statement-breakpoint
CREATE POLICY "public_read_testimonials" ON "testimonials" FOR SELECT TO hhc_public
  USING ("is_published" AND "consent_confirmed");
--> statement-breakpoint
CREATE POLICY "public_read_gallery" ON "gallery_items" FOR SELECT TO hhc_public USING ("is_published");
--> statement-breakpoint
CREATE POLICY "public_read_areas" ON "service_areas" FOR SELECT TO hhc_public USING ("is_published");
--> statement-breakpoint
CREATE POLICY "public_read_settings" ON "settings" FOR SELECT TO hhc_public USING (true);
--> statement-breakpoint

-- Demandes de rendez-vous : création uniquement, avec un statut initial imposé
GRANT INSERT ("id", "full_name", "phone", "email", "commune", "service", "preferred_date", "time_slot",
  "message", "consent_at", "source_page", "ip_hash") ON "appointment_requests" TO hhc_public;
--> statement-breakpoint
CREATE POLICY "public_insert_requests" ON "appointment_requests" FOR INSERT TO hhc_public
  WITH CHECK ("status" = 'nouvelle' AND "internal_note" IS NULL AND "consent_at" IS NOT NULL);
--> statement-breakpoint

-- Limitation anti-abus : nombre de demandes récentes pour une empreinte d'IP (sans exposer la table)
CREATE OR REPLACE FUNCTION hhc_recent_request_count(p_ip_hash text, p_minutes integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM appointment_requests
  WHERE ip_hash = p_ip_hash AND created_at > now() - make_interval(mins => p_minutes);
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION hhc_recent_request_count(text, integer) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION hhc_recent_request_count(text, integer) TO hhc_public;
