
const CONCEPT_GROUPS = [
  // --- JARDINAGE & EXTÉRIEUR ---
  ["cisaille", "sabre", "coupe", "sécateur", "élagage", "taille", "ciseaux", "branche"],
  ["tronçonneuse", "élagueuse", "abattage", "arbre", "bois", "bûche", "stihl", "husqvarna", "scie à chaine"],
  ["tondeuse", "gazon", "jardin", "herbe", "faucheuse", "robot tondeuse"],
  ["pelle", "bêche", "rateau", "pioche", "creuser", "terre", "jardinage"],
  ["arrosoir", "tuyau", "arrosage", "karcher", "nettoyeur haute pression", "jet"],
  ["barbecue", "grill", "bbq", "plancha", "charbon", "brochette"],
  ["piscine", "gonflable", "bassin", "eau", "pompe", "filtre", "chlore"],
  ["parasol", "voile", "ombrage", "store", "banne"],
  ["terrasse", "dalle", "carrelage", "extérieur"],

  // --- BRICOLAGE & TRAVAUX ---
  ["perceuse", "visseuse", "forêt", "trou", "bricolage", "bosch", "makita", "ryobi", "hilti"],
  ["marteau", "clou", "taper", "maillet", "arrache-clou"],
  ["scie", "découpe", "lame", "bois", "sauteuse", "circulaire", "onglet"],
  ["échelle", "escabeau", "hauteur", "échafaudage", "marchepied"],
  ["peinture", "pinceau", "rouleau", "bac", "vernis", "mur", "renovation"],
  ["ponceuse", "papier de verre", "abrasif", "limage"],
  ["niveau", "mètre", "mesure", "ruban", "laser"],
  ["colle", "scotch", "adhesif", "glu", "fixation"],
  ["plomberie", "tuyau", "joint", "fuite", "robinet", "évier", "clé à molette"],
  ["électricité", "câble", "fil", "prise", "interrupteur", "disjoncteur", "multimètre"],
  ["tournevis", "tourne vis", "tourne-vis", "cruciforme", "plat", "torx", "allen", "six pans", "embout", "visser", "dévisser", "vis", "boulon", "tête"],
  ["clé", "molette", "pipe", "plate", "cliquet", "douille", "serrage", "mécanique", "écrou", "facom"],
  ["pince", "coupante", "multiprise", "bec", "étau", "dénuder", "tenaille", "monseigneur", "serrer"],

  // --- VÉHICULES & MOBILITÉ ---
  ["voiture", "auto", "véhicule", "automobile", "roues", "transport", "citadine", "berline"],
  ["vélo", "bicyclette", "vtt", "vtc", "cyclisme", "guidon", "pédale", "decathlon", "btwin"],
  ["scooter", "moto", "deux-roues", "mobylette", "vespa", "motard"],
  ["casque", "protection", "gants", "blouson"],
  ["pneu", "roue", "crevaison", "jante", "cric", "gonfleur"],
  ["trottinette", "électrique", "patinette", "xiaomi"],
  ["accessoire auto", "siège", "autoradio", "gps", "coffre de toit", "barres"],
  ["entretien", "vidange", "huile", "filtre", "batterie", "chargeur", "cosses"],
  ["chaine", "neige", "hiver", "chaussette"],

  // --- MEUBLES & DÉCO ---
  ["canapé", "sofa", "fauteuil", "banquette", "salon", "clic-clac", "bz", "méridienne"],
  ["lit", "matelas", "sommier", "couchage", "chambre", "drap", "couette", "oreiller"],
  ["table", "bureau", "manger", "pupitre", "tréteau", "secrétaire"],
  ["chaise", "tabouret", "siège", "banc", "assise", "pouf"],
  ["armoire", "penderie", "commode", "rangement", "placard", "dressing", "étagère", "bibliothèque"],
  ["meuble tv", "buffet", "bahut", "vaisselier"],
  ["tapis", "moquette", "sol", "paillasson"],
  ["rideau", "store", "voilage", "tringle"],
  ["luminaire", "lampe", "lumière", "éclairage", "ampoule", "lampadaire", "lustre", "suspension", "led"],
  ["miroir", "glace", "reflet", "cadre", "tableau", "poster", "décoration"],
  ["vase", "fleur", "plante", "pot"],

  // --- CUISINE & ART DE LA TABLE ---
  ["vaisselle", "assiette", "verre", "tasse", "bol", "mug", "couvert"],
  ["casserole", "poêle", "sautian", "wok", "cocotte", "faitout", "cuisson"],
  ["moule", "gâteau", "patisserie", "plat", "four"],
  ["ustensile", "louche", "spatule", "fouet", "râpe", "couteau"],
  ["tupperware", "boite", "conservation", "bocal", "verrine"],
  
  // --- ÉLECTROMÉNAGER ---
  ["lave-linge", "machine à laver", "linge", "buanderie", "hublot"],
  ["sèche-linge", "séchage", "étendage", "tancarville"],
  ["lave-vaisselle", "vaisselle", "lavage"],
  ["frigo", "réfrigérateur", "congélateur", "froid", "américain", "glacière"],
  ["four", "micro-onde", "cuisson", "gazinière", "plaque", "induction", "vitrocéramique"],
  ["cafetière", "café", "nespresso", "senseo", "dolce gusto", "expresso", "broyeur"],
  ["robot", "mixeur", "blender", "thermomix", "monsieur cuisine", "batteur", "hachoir"],
  ["aspirateur", "dyson", "rowenta", "balai", "traineau", "sac"],
  ["fer à repasser", "centrale vapeur", "table à repasser", "repassage"],
  ["raclette", "fondue", "crêpière", "gaufrier", "appareil"],

  // --- HIGH-TECH & INFORMATIQUE ---
  ["téléphone", "smartphone", "mobile", "iphone", "samsung", "android", "xiaomi", "huawei"],
  ["ordinateur", "pc", "mac", "macbook", "laptop", "portable", "tour", "unité centrale"],
  ["tablette", "ipad", "galaxy tab", "kindle", "liseuse"],
  ["écran", "moniteur", "dalle", "hdmi"],
  ["clavier", "souris", "trackpad", "périphérique"],
  ["imprimante", "scanner", "encre", "cartouche", "canon", "hp", "epson"],
  ["télé", "tv", "télévision", "oled", "qled", "4k", "télécommande"],
  ["console", "jeu vidéo", "ps4", "ps5", "playstation", "xbox", "nintendo", "switch", "manette"],
  ["enceinte", "son", "baffle", "haut-parleur", "bluetooth", "jbl", "bose", "barre de son"],
  ["casque audio", "écouteurs", "airpods", "buds", "son"],
  ["photo", "caméra", "objectif", "reflex", "hybride", "canon", "nikon", "sony", "trépied"],
  ["chargeur", "câble", "usb", "lightning", "adaptateur", "batterie externe", "powerbank"],

  // --- VÊTEMENTS & ACCESSOIRES ---
  ["vêtement", "habit", "mode", "fripe", "textile", "dressing"],
  ["chaussures", "baskets", "sneakers", "bottes", "bottines", "talons", "escarpins", "sandales", "tong", "nike", "adidas"],
  ["pantalon", "jean", "denim", "levis", "legging", "jogging", "survêtement"],
  ["haut", "t-shirt", "chemise", "polo", "top", "débardeur", "blouse"],
  ["pull", "sweat", "gilet", "chandail", "maille", "capuche"],
  ["manteau", "veste", "blouson", "doudoune", "parka", "trench", "imperméable"],
  ["robe", "jupe", "soirée", "été"],
  ["costume", "cravate", "noeud papillon", "mariage", "complet"],
  ["sac", "sac à main", "sac à dos", "besace", "pochette", "valise", "bagage"],
  ["montre", "bijou", "collier", "bracelet", "boucle d'oreille", "bague", "or", "argent"],
  ["lunettes", "soleil", "vue", "monture", "rayban"],

  // --- ENFANT & BÉBÉ ---
  ["bébé", "naissance", "nouveau-né", "nourrisson", "maternité"],
  ["poussette", "landau", "cosy", "siège auto", "yoyo", "chicco"],
  ["lit bébé", "berceau", "cododo", "barreau", "parapluie"],
  ["chaise haute", "transat", "repas bébé", "biberon", "tétine", "tire-lait"],
  ["table à langer", "baignoire", "soin bébé", "couches"],
  ["jouet", "jeu", "peluche", "doudou", "hochet", "éveil"],
  ["lego", "playmobil", "construction", "brique"],
  ["poupée", "barbie", "poupon", "dinette"],
  ["déguisement", "costume", "carnaval", "halloween"],

  // --- SPORT & LOISIRS ---
  ["sport", "musculation", "fitness", "crossfit", "haltère", "poids", "banc"],
  ["tapis de sol", "yoga", "gym", "pilates"],
  ["foot", "football", "ballon", "but", "crampons"],
  ["tennis", "raquette", "balle", "filet"],
  ["natation", "piscine", "maillot", "lunettes", "bonnet"],
  ["ski", "snowboard", "neige", "bâtons", "masque", "combinaison"],
  ["camping", "tente", "duvet", "sac de couchage", "matelas gonflable", "quechua"],
  ["pêche", "canne", "moulinet", "hameçon", "poisson"],
  ["livre", "roman", "lecture", "bouquin", "poche", "bibliothèque"],
  ["bd", "bande dessinée", "manga", "comics", "album"],
  ["musique", "instrument", "partition"],
  ["guitare", "basse", "ampli", "électrique", "acoustique", "fender", "gibson"],
  ["piano", "synthétiseur", "clavier", "orgue"],
  ["batterie", "percussion", "tambour", "baguettes"],
  ["jeu de société", "plateau", "cartes", "dés", "poker", "monopoly"],

  // --- SERVICES & AIDE (Important pour les "Demandes") ---
  ["déménagement", "déménager", "bras", "camion", "utilitaire", "transport", "carton"],
  ["ménage", "femme de ménage", "nettoyage", "repassage", "domicile", "aide"],
  ["bricoleur", "travaux", "montage meuble", "réparation", "main d'oeuvre"],
  ["jardinier", "tondre", "tailler", "haie", "entretien jardin", "débroussailler"],
  ["garde", "babysitting", "nounou", "baby-sitter", "enfant", "sortie école"],
  ["animaux", "pet sitting", "garde chien", "promenade", "chat"],
  ["cours", "soutien", "maths", "anglais", "français", "professeur", "devoirs"],
  ["informatique", "dépannage", "formatage", "installation", "bug"],
  ["covoiturage", "trajet", "conduite", "chauffeur"],

  // --- ANIMAUX ---
  ["chien", "chiot", "canin", "croquettes", "laisse", "collier", "panier", "niche"],
  ["chat", "chaton", "félin", "litière", "arbre à chat", "griffoir", "pâtée"],
  ["rongeur", "hamster", "lapin", "cochon d'inde", "cage", "fouin", "foin"],
  ["aquarium", "poisson", "bocal", "pompe", "filtre"],
  ["oiseau", "perruche", "canari", "cage", "volière", "graine"],

  // --- SCOLAIRE & BUREAU ---
  ["fourniture", "scolaire", "école", "rentrée", "cartable", "trousse"],
  ["cahier", "classeur", "feuille", "stylo", "crayon", "feutre"],
  ["calculatrice", "casio", "ti", "graphique", "collège", "lycée"],
  ["manuel", "livre scolaire", "dictionnaire", "bescherelle"],
  ["bureau", "chaise de bureau", "lampe de bureau", "caisson"],

  // --- SANTÉ & BEAUTÉ ---
  ["parfum", "eau de toilette", "flacon", "fragrance"],
  ["maquillage", "makeup", "rouge à lèvre", "mascara", "palette", "pinceau"],
  ["coiffure", "sèche-cheveux", "lisseur", "fer à lisser", "brosse", "boucleur"],
  ["épilateur", "rasoir", "tondeuse barbe", "cire"],
  ["médical", "béquilles", "fauteuil roulant", "attelle", "orthèse", "kiné"]
];

// Fonction utilitaire pour retirer les accents
const normalize = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// CONSTRUCTION AUTOMATIQUE DU DICTIONNAIRE
const SYNONYMS_MAP = {};

CONCEPT_GROUPS.forEach((group) => {
  // On nettoie tous les mots du groupe
  const normalizedGroup = group.map(word => normalize(word));
  
  normalizedGroup.forEach((word) => {
    // Pour chaque mot, on lui associe tous les autres mots du groupe
    // On filtre pour ne pas inclure le mot lui-même dans sa liste de synonymes
    if (!SYNONYMS_MAP[word]) {
        SYNONYMS_MAP[word] = [];
    }
    // On fusionne avec les existants au cas où un mot apparaît dans plusieurs groupes
    const others = normalizedGroup.filter(w => w !== word);
    SYNONYMS_MAP[word] = [...new Set([...SYNONYMS_MAP[word], ...others])];
  });
});

/**
 * @param {string} term - Le mot tapé par l'utilisateur
 * @returns {string[]} - Tableau contenant le mot original + synonymes
 */
export const expandSearchTerm = (term) => {
  if (!term) return [];
  
  // Nettoyer le terme de recherche
  const cleanTerm = normalize(term.trim());
  
  // Trouver les synonymes
  const synonyms = SYNONYMS_MAP[cleanTerm] || [];
  
  // Retourner le terme original + les synonymes
  return [cleanTerm, ...synonyms];
};

/**
 * Fonction de vérification
 * @param {string} text - Le texte de l'annonce
 * @param {string[]} keywords - Le tableau retourné par expandSearchTerm
 */
export const matchSemantic = (text, keywords) => {
  if (!text) return false;
  const cleanText = normalize(text);
  
  // On vérifie si l'un des mots-clés est contenu dans le texte
  return keywords.some(keyword => cleanText.includes(keyword));
};