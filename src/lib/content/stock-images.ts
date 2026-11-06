/**
 * Photographies TEMPORAIRES issues d'Unsplash (licence Unsplash : usage commercial autorisé,
 * sans attribution obligatoire). Elles illustrent la démonstration et ne représentent PAS
 * des réalisations d'Angèle. Elles sont toutes enregistrées dans la médiathèque avec le
 * drapeau `isStock` afin d'être remplacées depuis l'administration.
 */
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const stock = {
  heroHairMotion: { url: u("1567582173070-228d1cd84c72"), alt: "Chevelure blonde caramel en mouvement sur fond sombre" },
  profileGoldLight: { url: u("1515138692129-197a2c608cfd"), alt: "Profil de femme dont la chevelure capte une lumière dorée" },
  profileDark: { url: u("1610659128929-fa69328744e2"), alt: "Portrait de profil, cheveux bruns, lumière douce" },
  portraitBlonde: { url: u("1524504388940-b1c1722653e1"), alt: "Portrait éditorial, cheveux blonds ondulés" },
  portraitDark: { url: u("1532170579297-281918c8ae72"), alt: "Portrait beauté sur fond noir, cheveux bruns" },
  curlsDark: { url: u("1535579710123-3c0f261c474e"), alt: "Chevelure bouclée brune, lumière tamisée" },
  wavesBrunette: { url: u("1596911647169-7085321c81b8"), alt: "Longue chevelure brune ondulée vue de dos" },
  redHair: { url: u("1636208640803-6a443f9676d4"), alt: "Chevelure cuivrée, portrait intimiste" },
  balayageBlonde: { url: u("1554519934-e32b1629d9ee"), alt: "Balayage blond lumineux sur cheveux longs, vue de dos" },
  balayageCaramel: { url: u("1522337360788-8b13dee7a37e"), alt: "Balayage caramel sur cheveux ondulés" },
  balayageAsh: { url: u("1605980625600-88b46abafa8d"), alt: "Nuances cendrées et ondulations souples" },
  ombreAsh: { url: u("1605980766335-d3a41c7332a1"), alt: "Dégradé de couleur froide sur cheveux ondulés" },
  wavesBlonde: { url: u("1785456283212-338f5bc44d50"), alt: "Ondulations blondes et brunes, reflets naturels" },
  stylingWaves: { url: u("1785456390070-9960e3997066"), alt: "Mise en forme d'ondulations sur cheveux longs" },
  hairTexture: { url: u("1602549179763-ce6c9df961b7"), alt: "Gros plan sur la brillance d'une chevelure châtain" },
  colorFoil: { url: u("1707812343087-c9ff9e5abb43"), alt: "Application d'une coloration avec papillotes" },
  blowDry: { url: u("1580618672591-eb180b1a973f"), alt: "Modelage au sèche-cheveux et à la brosse ronde" },
  curler: { url: u("1560869713-7d0a29430803"), alt: "Création de boucles au fer" },
  tools: { url: u("1595475884562-073c30d45670"), alt: "Brosses, ciseaux et pinceau de coloration" },
  washBasin: { url: u("1634449571010-02389ed0f9b0"), alt: "Shampooing soin et massage du cuir chevelu" },
  updoCopper: { url: u("1672788709547-6d7f239972c3"), alt: "Chignon flou sur chevelure cuivrée" },
  chignonJewel: { url: u("1672788725446-c303ec2b318e"), alt: "Chignon structuré orné d'un bijou de cheveux" },
  bridalHalfUp: { url: u("1549236177-77e8271c34b6"), alt: "Coiffure de cérémonie semi-attachée et accessoire floral" },
  bridalBun: { url: u("1660121870836-a29885278317"), alt: "Chignon bas blond et fleur, coiffure de mariage" },
  menScissors: { url: u("1657105052497-f996284ffff8"), alt: "Coupe homme aux ciseaux et au peigne" },
  menBeard: { url: u("1599011176306-4a96f1516d4d"), alt: "Taille de barbe aux ciseaux" },
  menPortrait: { url: u("1630827020718-3433092696e7"), alt: "Portrait d'homme, coupe structurée et barbe" },
  menFade: { url: u("1593702275687-f8b402bf1fb5"), alt: "Finitions d'une coupe homme" },
  kidCut: { url: u("1704072650662-76df3af134a7"), alt: "Coupe enfant, garçon sous la cape" },
  kidCurls: { url: u("1602030028438-4cf153cbae9e"), alt: "Enfant souriant aux cheveux bouclés" },
  jewelHoops: { url: u("1617038220319-276d3cfab638"), alt: "Créoles dorées torsadées sur pierres blanches" },
  jewelHands: { url: u("1633934542430-0905ccb5f050"), alt: "Bagues et collier dorés portés" },
  jewelNecklace: { url: u("1585960622850-ed33c41d6418"), alt: "Collier doré délicat porté sur chemise blanche" },
  jewelPendant: { url: u("1620656798579-1984d9e87df7"), alt: "Pendentif doré sur haut noir" },
  jewelTray: { url: u("1650455221359-3aebf920bcc5"), alt: "Plateau de bijoux dorés" },
} as const;

export type StockKey = keyof typeof stock;
export const STOCK_CREDIT = "Unsplash — photo libre de droits, temporaire";
