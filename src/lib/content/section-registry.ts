import { HERO_FILM } from "./hero-film";
import { stock } from "./stock-images";

/**
 * Registre des sections éditables.
 * Chaque section possède une liste de champs (utilisée pour générer automatiquement
 * le formulaire d'administration) et un contenu par défaut (utilisé pour l'initialisation
 * de la base et comme filet de sécurité si un champ est vide).
 *
 * Ce n'est volontairement PAS un constructeur de pages : la mise en page reste maîtrisée
 * par la direction artistique, seuls les contenus et l'ordre/visibilité sont modifiables.
 */

export type ImageValue = { url: string; alt: string };
export type LinkValue = { label: string; href: string };

export type FieldDef =
  | { name: string; label: string; type: "text"; help?: string }
  | { name: string; label: string; type: "textarea"; help?: string; rows?: number }
  | { name: string; label: string; type: "image"; help?: string }
  | { name: string; label: string; type: "link"; help?: string }
  | {
      name: string;
      label: string;
      type: "list";
      itemLabel: string;
      fields: Exclude<FieldDef, { type: "list" }>[];
      help?: string;
      max?: number;
    };

export type SectionDef = {
  key: string;
  label: string;
  description?: string;
  /** Les sections « fixes » ne peuvent pas être masquées (ex. le Hero). */
  locked?: boolean;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

export type PageDef = {
  key: string;
  title: string;
  path: string;
  seoTitle: string;
  seoDescription: string;
  /** La page d'accueil et les pages légales ne peuvent pas passer en brouillon. */
  canBeDraft: boolean;
  sections: SectionDef[];
};

const title = { name: "title", label: "Titre", type: "text" } as const;
const subtitle = { name: "subtitle", label: "Sous-titre", type: "textarea", rows: 2 } as const;
const body = { name: "body", label: "Texte", type: "textarea", rows: 6 } as const;
const image = { name: "image", label: "Image", type: "image" } as const;

const intro = (d: { title: string; subtitle: string; image?: ImageValue }): SectionDef => ({
  key: "intro",
  label: "En-tête de page",
  locked: true,
  fields: [title, subtitle, ...(d.image ? [image] : [])],
  defaults: d,
});

export const PAGES: PageDef[] = [
  /* ─────────────────────────────── ACCUEIL ─────────────────────────────── */
  {
    key: "home",
    title: "Accueil",
    path: "/",
    seoTitle: "Coiffeuse à domicile à Troyes & Sainte-Savine, coloriste et visagiste",
    seoDescription:
      "Hair Home Concept : coiffure haut de gamme à domicile à Troyes et Sainte-Savine par Angèle, maître artisan coloriste et visagiste. Coupe, couleur, balayage, femmes, hommes, enfants.",
    canBeDraft: false,
    sections: [
      {
        key: "hero",
        label: "Hero (haut de la page d'accueil)",
        locked: true,
        description:
          "Plein écran : un film de coiffure muet en boucle (ou une photo), le titre, le bouton de rendez-vous et le téléphone. Le déplacement et les horaires sont repris des Paramètres.",
        fields: [
          { name: "title", label: "Titre (une ligne par retour à la ligne)", type: "textarea", rows: 3 },
          subtitle,
          {
            name: "video",
            label: "Film d'ouverture (lien .mp4)",
            type: "text",
            help: "Vidéo muette de 10 à 15 secondes, au format paysage. Laisser vide pour afficher la photo à la place.",
          },
          { name: "image", label: "Photo (affichée sans film, ou comme affiche d'un film importé)", type: "image" },
          { name: "ctaPrimary", label: "Bouton principal", type: "link" },
          { name: "ctaSecondary", label: "Lien secondaire (sous les horaires)", type: "link" },
        ],
        defaults: {
          title: "Votre coiffeuse\nvient chez vous.",
          subtitle:
            "Angèle, maître artisan coiffeuse, coloriste et visagiste, arrive avec tout le matériel d'un salon : coupe, couleur et coiffage pour toute la famille.",
          video: HERO_FILM.src,
          image: stock.heroStylist,
          ctaPrimary: { label: "Prendre rendez-vous", href: "/contact" },
          ctaSecondary: { label: "Voir les prestations et les tarifs", href: "/prestations" },
        },
      },
      {
        key: "expertise",
        label: "Angèle, maître artisan",
        fields: [title, body, image, { name: "cta", label: "Lien", type: "link" }],
        defaults: {
          title: "Une signature, une écoute, un suivi sur mesure.",
          body:
            "Forte d'une grande expérience auprès des plus grandes marques de la coiffure française et internationale, Angèle a choisi de réserver son savoir-faire à une clientèle privée. Chaque rendez-vous commence par une écoute attentive : votre style de vie, votre morphologie, vos envies. Puis vient le geste, précis, pensé pour durer et facile à entretenir au quotidien.",
          image: stock.profileGoldLight,
          cta: { label: "Son parcours", href: "/a-propos" },
        },
      },
      {
        key: "signatures",
        label: "Prestations signatures",
        fields: [
          title,
          {
            name: "items",
            label: "Prestations mises en avant",
            type: "list",
            itemLabel: "Prestation",
            max: 4,
            fields: [
              { name: "title", label: "Titre", type: "text" },
              { name: "text", label: "Texte", type: "textarea", rows: 2 },
              { name: "image", label: "Image", type: "image" },
              { name: "href", label: "Lien (ex. /prestations#coloration)", type: "text" },
            ],
          },
        ],
        defaults: {
          title: "Le meilleur du salon, l'intimité de votre intérieur.",
          items: [
            {
              title: "La coupe sur mesure",
              text: "Shampooing, coupe et modelage : une ligne dessinée pour votre visage et votre quotidien.",
              image: stock.portraitBlonde,
              href: "/prestations#femme",
            },
            {
              title: "La couleur & le balayage",
              text: "Couleur, balayage, mèches ou tons pastels : la lumière juste, sans compromis.",
              image: stock.balayageBlonde,
              href: "/coloriste-visagiste",
            },
            {
              title: "Soins & techniques",
              text: "Soins, renforçateur, décollement de racines, défrisage : la matière sublimée.",
              image: stock.hairTexture,
              href: "/prestations#soins-techniques",
            },
            {
              title: "Coiffures d'exception",
              text: "Attaches, boucles et chignons pour vos cérémonies et grands moments.",
              image: stock.chignonJewel,
              href: "/prestations#femme",
            },
          ],
        },
      },
      {
        key: "experience",
        label: "La coiffure à domicile",
        fields: [
          title,
          body,
          image,
          {
            name: "items",
            label: "Avantages",
            type: "list",
            itemLabel: "Avantage",
            max: 6,
            fields: [
              { name: "title", label: "Titre", type: "text" },
              { name: "text", label: "Texte", type: "textarea", rows: 2 },
            ],
          },
        ],
        defaults: {
          title: "Restez chez vous. La beauté se déplace.",
          body: "Pas de trajet, pas de salle d'attente : Angèle arrive équipée et installe un véritable moment de soin chez vous.",
          image: stock.blowDry,
          items: [
            { title: "Sans attente", text: "Le rendez-vous s'organise selon vos disponibilités, du lundi au samedi de 9h à 20h." },
            { title: "Déplacement offert", text: "À Troyes et dans toute son agglomération, quelle que soit la prestation." },
            { title: "Toute la famille", text: "Une personne seule, une famille, un groupe d'amis : chacun est coiffé lors de la même visite." },
            { title: "Sans vous déplacer", text: "Les mêmes prestations de qualité pour les personnes à mobilité réduite." },
          ],
        },
      },
      {
        key: "galerie",
        label: "Galerie (aperçu défilant)",
        fields: [title, { name: "cta", label: "Lien", type: "link" }],
        defaults: {
          title: "Matières, lumières, mouvements.",
          cta: { label: "Voir toute la galerie", href: "/galerie" },
        },
      },
      {
        key: "avis",
        label: "Avis clients",
        description: "N'affiche que des témoignages authentiques publiés avec l'accord de leur auteur.",
        fields: [title, body, { name: "cta", label: "Lien (ex. page Facebook)", type: "link" }],
        defaults: {
          title: "Vos mots, bientôt ici.",
          body:
            "Vous avez été coiffé·e par Angèle ? Votre avis aidera d'autres personnes à découvrir la coiffure à domicile. Les témoignages sont publiés uniquement avec votre accord.",
          cta: { label: "Laisser un avis sur Facebook", href: "https://www.facebook.com/AngeleMatHHC/" },
        },
      },
      {
        key: "faq",
        label: "Questions fréquentes",
        fields: [title],
        defaults: { title: "Tout savoir avant votre rendez-vous." },
      },
      {
        key: "cta",
        label: "Invitation au rendez-vous (bas de chaque page)",
        description: "Affichée en bas de toutes les pages du site, au-dessus du pied de page, sauf sur la page Contact. Masquer cette section la retire partout.",
        fields: [title, body, image],
        defaults: {
          title: "Offrez-vous un moment rien qu'à vous.",
          body: "Indiquez vos souhaits et vos disponibilités : Angèle vous rappelle pour convenir ensemble du rendez-vous.",
          image: stock.wavesBrunette,
        },
      },
    ],
  },

  /* ─────────────────────────────── PRESTATIONS & TARIFS ─────────────────────────────── */
  {
    key: "prestations",
    title: "Prestations & tarifs",
    path: "/prestations",
    seoTitle: "Prestations & tarifs de coiffure à domicile à Troyes",
    seoDescription:
      "Coupes femmes, hommes, étudiants et enfants, coloration, balayage, mèches, soins et techniques : toutes les prestations de coiffure à domicile de Hair Home Concept à Troyes, avec leurs tarifs TTC.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Chaque prestation, son juste prix.",
        subtitle:
          "Choisissez une catégorie : tout est réalisé chez vous, avec le matériel et les produits d'un salon haut de gamme. Prix TTC, déplacement offert dans l'agglomération troyenne.",
      }),
      {
        key: "notes",
        label: "Mentions sous les tarifs",
        fields: [
          { name: "validity", label: "Validité des tarifs", type: "text" },
          { name: "supplement", label: "Supplément général", type: "text" },
          { name: "extra", label: "Autre mention", type: "textarea", rows: 2 },
        ],
        defaults: {
          validity: "Tarifs TTC à compter du 12 mars 2026, modifiables sans préavis.",
          supplement: "Supplément cheveux longs ou épais : 13 € sur les prestations signalées.",
          extra: "La coupe est offerte par l'enseigne Hair Home Concept sur les prestations techniques signalées.",
        },
      },
    ],
  },

  /* ─────────────────────────────── COLORISTE & VISAGISTE ─────────────────────────────── */
  {
    key: "coloriste-visagiste",
    title: "Coloriste & visagiste",
    path: "/coloriste-visagiste",
    seoTitle: "Coloriste & visagiste à domicile à Troyes, diagnostic personnalisé",
    seoDescription:
      "Diagnostic personnalisé, coloration, balayage, mèches, patines et coupe adaptée au visage : l'expertise coloriste et visagiste d'Angèle, à domicile à Troyes et Sainte-Savine.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Révéler, plutôt que transformer.",
        subtitle:
          "La couleur et la coupe se pensent ensemble. Elles dialoguent avec votre visage, votre carnation et votre façon de vivre.",
        image: stock.profileDark,
      }),
      {
        key: "diagnostic",
        label: "Le diagnostic",
        fields: [title, body, image],
        defaults: {
          title: "Tout commence par l'écoute.",
          body:
            "Nature et état du cheveu, couleur actuelle, carnation, morphologie du visage, mais aussi votre rythme de vie et le temps que vous souhaitez consacrer à l'entretien : Angèle prend le temps de comprendre avant de proposer.",
          image: stock.hairTexture,
        },
      },
      {
        key: "techniques",
        label: "Les techniques de coloration",
        fields: [
          title,
          body,
          {
            name: "items",
            label: "Techniques",
            type: "list",
            itemLabel: "Technique",
            fields: [
              { name: "title", label: "Titre", type: "text" },
              { name: "text", label: "Texte", type: "textarea", rows: 2 },
            ],
          },
        ],
        defaults: {
          title: "La juste nuance, le juste geste.",
          body: "Chaque technique répond à une intention : couvrir, éclairer, nuancer, oser.",
          items: [
            { title: "Couleur", text: "Une teinte homogène et lumineuse, pour sublimer ou couvrir les cheveux blancs." },
            { title: "Balayage", text: "Des éclats posés à main levée pour une lumière naturelle et un entretien léger." },
            { title: "Mèches", text: "Des reflets plus structurés, du plus subtil au plus affirmé." },
            { title: "Patine & effet lumière", text: "Pour neutraliser, raviver ou nuancer une couleur entre deux rendez-vous." },
            { title: "Tons pastels ou gris", text: "Une décoloration maîtrisée puis la création de nuances pastel ou grises." },
            { title: "Transparence & flash", text: "Un voile de couleur pour la brillance et la profondeur." },
          ],
        },
      },
      {
        key: "harmonie",
        label: "L'harmonie des couleurs",
        fields: [title, body, image],
        defaults: {
          title: "Une couleur qui s'accorde à votre lumière.",
          body:
            "Chaude, froide, dorée, cendrée : la bonne nuance illumine le teint et adoucit les traits. Le travail de coloriste consiste à trouver cet accord, puis à le faire vivre dans le temps grâce à un entretien régulier. C'est tout l'esprit du forfait Beauty Color.",
          image: stock.balayageCaramel,
        },
      },
      {
        key: "visagisme",
        label: "Le visagisme",
        fields: [title, body, image],
        defaults: {
          title: "Une coupe dessinée pour votre visage.",
          body:
            "Ovale, rond, carré, cœur : chaque morphologie a ses équilibres. Une coupe adaptée structure le visage, met en valeur le regard et respecte la nature du cheveu. L'objectif d'Angèle : créer des coupes qui vous appartiennent, faciles d'entretien dans la vie de tous les jours.",
          image: stock.portraitDark,
        },
      },
    ],
  },

  /* ─────────────────────────────── OFFRES ─────────────────────────────── */
  {
    key: "offres",
    title: "Forfaits & offres",
    path: "/forfaits-offres",
    seoTitle: "Forfaits Beauty Color, parrainage & bons cadeaux, coiffure à domicile à Troyes",
    seoDescription:
      "Forfaits Beauty Color, Formul'Hair, modelage illimité, parrainage, offre de bienvenue, tarif étudiant et bons cadeaux : les formules Hair Home Concept à Troyes.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Des formules à votre rythme.",
        subtitle:
          "Entretien régulier de la couleur, modelages, rendez-vous en famille ou cadeau à offrir : choisissez la formule qui vous ressemble.",
        image: stock.balayageAsh,
      }),
      {
        key: "cadeau",
        label: "Bloc bons cadeaux",
        fields: [title, body, image],
        defaults: {
          title: "Le bon cadeau, une attention qui se vit.",
          body:
            "Faites plaisir à vos proches avec un bon cadeau personnalisé selon leurs désirs ou leurs besoins : coiffure, couleur, coiffure de cérémonie… et bijoux.",
          image: stock.jewelNecklace,
        },
      },
    ],
  },

  /* ─────────────────────────────── GALERIE ─────────────────────────────── */
  {
    key: "galerie",
    title: "Galerie",
    path: "/galerie",
    seoTitle: "Galerie : coiffure, couleur et balayage à domicile à Troyes",
    seoDescription:
      "Inspirations coupes, couleurs, balayages, coiffures de cérémonie, hommes et enfants : la galerie Hair Home Concept.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Inspirations.",
        subtitle: "Coupes, couleurs, lumières et attaches : un aperçu de l'univers Hair Home Concept.",
      }),
      {
        key: "notice",
        label: "Mention sur les photos",
        fields: [{ name: "text", label: "Mention", type: "textarea", rows: 2 }],
        defaults: {
          text: "Les visuels présentés sont des photographies d'inspiration. Les réalisations d'Angèle viendront bientôt les remplacer.",
        },
      },
    ],
  },

  /* ─────────────────────────────── À PROPOS ─────────────────────────────── */
  {
    key: "a-propos",
    title: "À propos",
    path: "/a-propos",
    seoTitle: "Angèle, maître artisan coiffeuse, coloriste et visagiste à Troyes",
    seoDescription:
      "Découvrez Angèle, maître artisan coiffeuse, coloriste et visagiste, et le concept Hair Home Concept : la coiffure haut de gamme à domicile à Troyes et Sainte-Savine.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Angèle, la coiffure autrement.",
        subtitle: "Maître artisan, coloriste et visagiste. Une passion : donner vie à une idée, et la rendre unique.",
      }),
      {
        key: "portrait",
        label: "Portrait d'Angèle",
        description: "Ajoutez ici la vraie photographie d'Angèle. Sans image, un monogramme élégant est affiché.",
        fields: [
          { name: "image", label: "Photographie d'Angèle", type: "image" },
          { name: "caption", label: "Légende", type: "text" },
        ],
        defaults: { image: { url: "", alt: "Portrait d'Angèle" }, caption: "Angèle, fondatrice de Hair Home Concept" },
      },
      {
        key: "parcours",
        label: "Parcours",
        fields: [title, body],
        defaults: {
          title: "L'exigence des grandes maisons.",
          body:
            "Angèle a travaillé chez un grand coiffeur créateur, élu Meilleur Coiffeur aux Victoires de la beauté, où elle a acquis toute l'expérience de la technique de coupe haut de gamme. Elle a participé au Mondial de la Coiffure et suivi de multiples formations de perfectionnement en coupe et en couleur.\n\nSon expérience s'est construite auprès des plus grandes marques de la coiffure française et étrangère, dont René Furterer, L'Oréal Paris, Sebastian, Toni & Guy, American Crew, Bumble and Bumble, Revlon et Wella.\n\nAprès des résultats très satisfaisants, y compris dans le management, elle a fait le choix d'offrir ses idées et ses prestations à une clientèle personnelle et unique.",
        },
      },
      {
        key: "concept",
        label: "Le concept",
        fields: [title, body, image],
        defaults: {
          title: "Répondre aux nouvelles attentes.",
          body:
            "Angèle a observé de nouvelles attentes, tant au niveau des horaires que de la qualité de service. D'où l'idée d'un concept de coiffure à domicile, sur une large amplitude horaire : pour les personnes actives à qui les horaires traditionnels ne conviennent pas toujours, pour les familles nombreuses qui veulent éviter les rendez-vous à répétition, et pour les personnes à mobilité réduite, afin qu'elles accèdent aux mêmes prestations de qualité.",
          image: stock.tools,
        },
      },
      {
        key: "passion",
        label: "Sa passion",
        fields: [{ name: "quote", label: "Citation", type: "textarea", rows: 3 }, body],
        defaults: {
          quote: "Il n'est pas question pour moi de reproduire, mais de créer et d'innover.",
          body:
            "Conseiller, réaliser des coupes et des techniques en fonction de la morphologie et du style de vie de chacun, accompagner le renouvellement et le changement : son but est de proposer des prestations personnalisées, uniques, adaptées à chaque attente, pour procurer à chacun un vrai sentiment de bien-être.",
        },
      },
    ],
  },

  /* ─────────────────────────────── ZONE ─────────────────────────────── */
  {
    key: "zone",
    title: "Zone d'intervention",
    path: "/zone-intervention",
    seoTitle: "Zone d'intervention : coiffure à domicile à Troyes, Sainte-Savine et agglomération",
    seoDescription:
      "Hair Home Concept se déplace à domicile à Troyes, Sainte-Savine et dans l'agglomération troyenne. Déplacement offert dans la zone, horaires du lundi au samedi de 9h à 20h.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Troyes, Sainte-Savine et toute l'agglomération.",
        subtitle:
          "Hair Home Concept est un service exclusivement à domicile : il n'y a pas de salon. C'est Angèle qui vient à vous.",
      }),
      {
        key: "deplacement",
        label: "Déplacement & horaires",
        fields: [
          title,
          body,
          { name: "outside", label: "Hors zone", type: "textarea", rows: 2 },
          { name: "afterHours", label: "Hors horaires", type: "textarea", rows: 2 },
        ],
        defaults: {
          title: "Offert dans l'agglomération troyenne.",
          body: "Le déplacement est offert à Troyes et dans son agglomération, quelle que soit la prestation.",
          outside: "En dehors de cette zone, des frais de déplacement s'appliquent selon la distance. N'hésitez pas à demander un devis.",
          afterHours:
            "Possibilité d'intervenir en dehors des horaires habituels (après 20h, le dimanche et les jours fériés) avec une majoration de 20 %, sur devis.",
        },
      },
    ],
  },

  /* ─────────────────────────────── CONTACT ─────────────────────────────── */
  {
    key: "contact",
    title: "Contact & rendez-vous",
    path: "/contact",
    seoTitle: "Prendre rendez-vous avec une coiffeuse à domicile à Troyes",
    seoDescription:
      "Demandez un rendez-vous de coiffure à domicile à Troyes et Sainte-Savine : formulaire, téléphone 06 98 94 96 63 ou e-mail. Angèle vous recontacte pour confirmer.",
    canBeDraft: false,
    sections: [
      intro({
        title: "Parlons de votre prochain rendez-vous.",
        subtitle:
          "Précisez vos souhaits ainsi que les jours et tranches horaires qui vous conviennent : Angèle vous rappelle dans les meilleurs délais pour confirmer.",
        image: stock.stylingWaves,
      }),
      {
        key: "messagerie",
        label: "Bloc messagerie",
        fields: [title, body],
        defaults: {
          title: "Messagerie 24h/24, 7j/7",
          body: "Une boîte vocale est disponible à tout moment. Laissez vos nom, coordonnées et souhaits : vous serez rappelé·e dans les meilleurs délais.",
        },
      },
    ],
  },

  /* ─────────────────────────────── BIJOUX ─────────────────────────────── */
  {
    key: "bijoux",
    title: "Bijoux & cadeaux",
    path: "/bijoux-cadeaux",
    seoTitle: "Bijoux & bons cadeaux, Hair Home Concept Troyes",
    seoDescription:
      "Bijoux argent, plaqué or et fantaisie, réunions à domicile et comités d'entreprise, bons cadeaux coiffure et bijoux : l'univers cadeaux de Hair Home Concept.",
    canBeDraft: true,
    sections: [
      intro({
        title: "Pour offrir, ou simplement se faire plaisir.",
        subtitle: "Un large choix de bijoux de qualité, en argent, plaqué or ou fantaisie, pour un style design et tendance.",
        image: stock.jewelHoops,
      }),
      {
        key: "collection",
        label: "Collection",
        fields: [
          title,
          body,
          {
            name: "items",
            label: "Univers",
            type: "list",
            itemLabel: "Univers",
            fields: [
              { name: "title", label: "Titre", type: "text" },
              { name: "image", label: "Image", type: "image" },
            ],
          },
        ],
        defaults: {
          title: "Pendentifs, bracelets, sautoirs, bagues…",
          body:
            "Retrouvez une gamme unique de pendentifs, bracelets, sautoirs, montres, bagues, parures, porte-clés, boucles d'oreilles, pinces à épiler et autres bijoux pour hommes et enfants, disponibles sur catalogue.",
          items: [
            { title: "Colliers & pendentifs", image: stock.jewelPendant },
            { title: "Bagues & parures", image: stock.jewelHands },
            { title: "Boucles d'oreilles", image: stock.jewelTray },
          ],
        },
      },
      {
        key: "reunions",
        label: "Réunions & comités d'entreprise",
        fields: [title, body],
        defaults: {
          title: "Des réunions bijoux chez vous ou en entreprise.",
          body:
            "Angèle organise des réunions spécialisées à domicile et dans le cadre des comités d'entreprise. Catalogue disponible sur demande, déplacement offert à Troyes et dans son agglomération.",
        },
      },
    ],
  },

  /* ─────────────────────────────── LÉGAL ─────────────────────────────── */
  {
    key: "mentions-legales",
    title: "Mentions légales",
    path: "/mentions-legales",
    seoTitle: "Mentions légales",
    seoDescription: "Mentions légales du site Hair Home Concept.",
    canBeDraft: false,
    sections: [
      {
        key: "content",
        label: "Contenu",
        locked: true,
        fields: [{ name: "body", label: "Texte (les informations de l'entreprise proviennent des Paramètres)", type: "textarea", rows: 12 }],
        defaults: {
          body:
            "Propriété intellectuelle\nL'ensemble des contenus du site (textes, logo, identité visuelle) est la propriété de Hair Home Concept, sauf mention contraire. Les photographies et le film d'illustration proviennent des banques d'images Unsplash et Pexels et sont utilisés conformément à leurs licences.\n\nResponsabilité\nLes informations et tarifs sont donnés à titre indicatif et peuvent être modifiés sans préavis. Une demande de rendez-vous envoyée via le site ne vaut pas réservation : elle est confirmée par Hair Home Concept.",
        },
      },
    ],
  },
  {
    key: "confidentialite",
    title: "Politique de confidentialité",
    path: "/confidentialite",
    seoTitle: "Politique de confidentialité",
    seoDescription: "Comment Hair Home Concept protège vos données personnelles.",
    canBeDraft: false,
    sections: [
      {
        key: "content",
        label: "Contenu",
        locked: true,
        fields: [{ name: "body", label: "Texte", type: "textarea", rows: 16 }],
        defaults: {
          body:
            "Données collectées\nLorsque vous envoyez une demande de rendez-vous, nous recueillons vos nom et prénom, téléphone, e-mail (facultatif), commune d'intervention, prestation souhaitée, date et créneau préférés et votre message.\n\nFinalité et base légale\nCes données servent uniquement à traiter votre demande et à vous recontacter. Le traitement repose sur votre consentement, recueilli dans le formulaire.\n\nDurée de conservation\nLes demandes sont conservées 3 ans au maximum après le dernier contact, puis supprimées.\n\nDestinataires\nVos données sont destinées exclusivement à Hair Home Concept. Elles sont hébergées par nos sous-traitants techniques (hébergement du site et de la base de données, envoi des notifications e-mail), dans le respect du RGPD. Elles ne sont jamais vendues ni cédées.\n\nVos droits\nVous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de limitation. Pour l'exercer, écrivez à l'adresse e-mail indiquée ci-dessous. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).\n\nCookies\nLe site n'utilise que des cookies strictement nécessaires à son fonctionnement. Aucun outil de mesure d'audience n'est activé sans votre consentement. La carte interactive est fournie par Google Maps.",
        },
      },
    ],
  },
];

export const PAGE_KEYS = PAGES.map((p) => p.key);

export function getPageDef(key: string) {
  return PAGES.find((p) => p.key === key);
}

export function getSectionDef(pageKey: string, sectionKey: string) {
  return getPageDef(pageKey)?.sections.find((s) => s.key === sectionKey);
}
