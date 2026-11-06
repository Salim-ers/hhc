import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ────────────────────────────────────────────────────────────────
 * Comptes, rôles, sessions
 * ──────────────────────────────────────────────────────────────── */

export const userRole = pgEnum("user_role", ["owner", "editor"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("editor"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

/** Le jeton de session n'est jamais stocké en clair : seul son SHA-256 est conservé. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    userAgent: text("user_agent"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    ipHash: text("ip_hash").notNull(),
    success: boolean("success").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_lookup_idx").on(t.ipHash, t.createdAt)],
);

/* ────────────────────────────────────────────────────────────────
 * Prestations & tarifs
 * ──────────────────────────────────────────────────────────────── */

/** Onglets de la page Tarifs (Femme, Homme, Enfant, Étudiant, Coloration…). */
export const priceCategories = pgTable("price_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  intro: text("intro"),
  footnote: text("footnote"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => priceCategories.id, { onDelete: "restrict" }),
    /** Sous-groupe affiché comme intertitre (ex. « Couleur », « Beauty Color »). */
    section: text("section"),
    name: text("name").notNull(),
    description: text("description"),
    durationMinutes: integer("duration_minutes"),
    /** Prix TTC en centimes. Null = « sur devis ». */
    priceCents: integer("price_cents"),
    priceFrom: boolean("price_from").notNull().default(false),
    /** Prix barré éventuel (promotion). */
    compareAtCents: integer("compare_at_cents"),
    supplementLabel: text("supplement_label"),
    supplementCents: integer("supplement_cents"),
    conditions: text("conditions"),
    badge: text("badge"),
    promoLabel: text("promo_label"),
    promoStartsAt: timestamp("promo_starts_at", { withTimezone: true }),
    promoEndsAt: timestamp("promo_ends_at", { withTimezone: true }),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    /** Donnée importée de l'ancien site, à confirmer par la cliente. */
    needsReview: boolean("needs_review").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("services_category_idx").on(t.categoryId, t.sortOrder)],
);

/** Variantes de prix : cheveux courts, longs ou épais… */
export const serviceVariants = pgTable(
  "service_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    priceCents: integer("price_cents").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("service_variants_service_idx").on(t.serviceId)],
);

/** Grandes expertises présentées sur la page Prestations. */
export const expertises = pgTable("expertises", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  kicker: text("kicker"),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body"),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  /** Onglet de la page Tarifs vers lequel pointer. */
  priceCategorySlug: text("price_category_slug"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ────────────────────────────────────────────────────────────────
 * Offres, forfaits, promotions, parrainage, bons cadeaux
 * ──────────────────────────────────────────────────────────────── */

export const offerKind = pgEnum("offer_kind", [
  "forfait",
  "formule",
  "promotion",
  "parrainage",
  "bon_cadeau",
  "banniere",
]);

export const publishStatus = pgEnum("publish_status", ["draft", "published"]);

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  kind: offerKind("kind").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  priceCents: integer("price_cents"),
  compareAtCents: integer("compare_at_cents"),
  priceLabel: text("price_label"),
  items: jsonb("items").$type<string[]>().notNull().default([]),
  conditions: text("conditions"),
  code: text("code"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  highlight: boolean("highlight").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  status: publishStatus("status").notNull().default("draft"),
  needsReview: boolean("needs_review").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ────────────────────────────────────────────────────────────────
 * Pages, sections éditables (brouillon / publié)
 * ──────────────────────────────────────────────────────────────── */

export const pages = pgTable("pages", {
  key: text("key").primaryKey(),
  title: text("title").notNull(),
  path: text("path").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  status: publishStatus("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SectionContent = Record<string, unknown>;

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageKey: text("page_key")
      .notNull()
      .references(() => pages.key, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    draft: jsonb("draft").$type<SectionContent>().notNull().default({}),
    published: jsonb("published").$type<SectionContent>().notNull().default({}),
    hasUnpublishedChanges: boolean("has_unpublished_changes").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("sections_page_key_unique").on(t.pageKey, t.key)],
);

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  pageKey: text("page_key").notNull().default("home"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Uniquement des témoignages authentiques dont l'autrice/l'auteur a donné son accord. */
export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  author: text("author").notNull(),
  context: text("context"),
  quote: text("quote").notNull(),
  rating: integer("rating"),
  consentConfirmed: boolean("consent_confirmed").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ────────────────────────────────────────────────────────────────
 * Médias & galerie
 * ──────────────────────────────────────────────────────────────── */

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull().unique(),
  pathname: text("pathname"),
  filename: text("filename"),
  mimeType: text("mime_type"),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  alt: text("alt").notNull().default(""),
  category: text("category").notNull().default("general"),
  credit: text("credit"),
  /** Photo de banque d'images temporaire (à remplacer par une réalisation d'Angèle). */
  isStock: boolean("is_stock").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull(),
  caption: text("caption"),
  category: text("category").notNull(),
  layout: text("layout").notNull().default("portrait"),
  isStock: boolean("is_stock").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ────────────────────────────────────────────────────────────────
 * Zone d'intervention
 * ──────────────────────────────────────────────────────────────── */

export const serviceAreas = pgTable("service_areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  postalCode: text("postal_code"),
  /** true = déplacement offert ; false = frais selon la distance. */
  travelIncluded: boolean("travel_included").notNull().default(true),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
});

/* ────────────────────────────────────────────────────────────────
 * Paramètres du site (clé / valeur JSON)
 * ──────────────────────────────────────────────────────────────── */

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ────────────────────────────────────────────────────────────────
 * Demandes de rendez-vous
 * ──────────────────────────────────────────────────────────────── */

export const requestStatus = pgEnum("request_status", [
  "nouvelle",
  "a_contacter",
  "en_attente",
  "confirmee",
  "terminee",
  "annulee",
]);

export const appointmentRequests = pgTable(
  "appointment_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    commune: text("commune").notNull(),
    service: text("service").notNull(),
    preferredDate: date("preferred_date"),
    timeSlot: text("time_slot"),
    message: text("message"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    status: requestStatus("status").notNull().default("nouvelle"),
    internalNote: text("internal_note"),
    sourcePage: text("source_page"),
    ipHash: text("ip_hash"),
    emailNotified: boolean("email_notified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("requests_status_idx").on(t.status, t.createdAt),
    index("requests_ip_idx").on(t.ipHash, t.createdAt),
  ],
);

/* ────────────────────────────────────────────────────────────────
 * Historique des modifications
 * ──────────────────────────────────────────────────────────────── */

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    userName: text("user_name"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type PriceCategory = typeof priceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceVariant = typeof serviceVariants.$inferSelect;
export type Expertise = typeof expertises.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Media = typeof media.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type ServiceArea = typeof serviceAreas.$inferSelect;
export type AppointmentRequest = typeof appointmentRequests.$inferSelect;
export type AuditEntry = typeof auditLog.$inferSelect;
