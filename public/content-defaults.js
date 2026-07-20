/* Contenu par défaut de LaRuche.
   Sert de repli quand l'admin n'a rien enregistré, et de base d'édition dans /admin.
   Tous les textes proviennent du propriétaire ; contacts confirmés par le papier
   à en-tête et les étiquettes imprimées. */
window.LARUCHE_DEFAULTS = {
  texts: {
    brand: {
      name: 'LaRuche',
      slogan: 'Vivre Haïti dans chaque goutte !'
    },
    hero: {
      eyebrow: 'Entreprise apicole · Haïti',
      title: 'Vivre Haïti dans chaque goutte',
      sub: "Un miel 100 % naturel qui reconnecte le monde à l'essence du patrimoine naturel et culturel d'Haïti.",
      cta: 'Découvrir nos produits',
      cta2: 'Notre histoire'
    },
    histoire: {
      eyebrow: 'Notre histoire',
      title: "L'apiculture au service d'Haïti",
      intro: "LaRuche est une entreprise apicole engagée dans la valorisation du patrimoine naturel et culturel d'Haïti. Convaincue que l'entrepreneuriat constitue un puissant moteur de développement, elle œuvre à la réduction de la pauvreté au sein des communautés et investit dans la formation des jeunes afin de contribuer à leur épanouissement personnel et professionnel.",
      visionLabel: 'Notre vision',
      vision: "Reconnecter le monde à l'essence du patrimoine naturel et culturel d'Haïti."
    },
    missions: {
      eyebrow: 'Nos missions',
      title: 'Trois engagements',
      m1: "Créer et préserver un lien durable entre les consommateurs, la nature et la culture haïtienne en offrant une expérience authentique.",
      m2: "Renforcer l'économie locale en créant des opportunités à travers la valorisation des richesses de l'apiculture.",
      m3: "Investir dans la formation et l'épanouissement des jeunes afin qu'ils deviennent des acteurs du développement de leurs communautés."
    },
    valeurs: {
      eyebrow: 'Nos valeurs',
      title: 'Ce qui nous guide',
      v1Title: 'Authenticité',
      v1Desc: "Un produit vrai, issu du terroir haïtien, sans artifice.",
      v2Title: 'Bien-être',
      v2Desc: "Le miel comme source naturelle de santé et de plaisir.",
      v3Title: 'Croissance',
      v3Desc: "Faire grandir les communautés et les jeunes qui les composent."
    },
    produits: {
      eyebrow: 'Nos produits',
      title: 'Bee Happy',
      sub: "Notre miel 100 % naturel, décliné en trois formats."
    },
    marque: {
      eyebrow: 'La marque en situation',
      title: "L'identité LaRuche partout",
      sub: "Du pot à la carte de visite, une identité cohérente et soignée."
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Parlons-en',
      sub: "Une question, une commande, un partenariat ? Écrivez-nous.",
      address: '524, Autoroute de Carrefour, Entre Thor 67 et 69',
      addressNote: 'Bâtiment de New System Academy',
      phone: '+509 3785-6706 / 3563-0175',
      email: 'larucheht@gmail.com',
      site: 'www.laruche.com'
    },
    footer: {
      tagline: 'Vivre Haïti dans chaque goutte !',
      rights: '© 2026 LaRuche — Entreprise apicole haïtienne.'
    }
  },

  images: {
    heroLogo: 'images/logo-white-v.webp',
    heroBg: 'images/pattern.webp',
    histoire: 'images/mockup-letterhead.webp'
  },

  products: [
    { name: 'Bee Happy', volume: '175 ml', image: 'images/product-175.webp', desc: 'Le format nomade, à glisser partout.' },
    { name: 'Bee Happy', volume: '350 ml', image: 'images/product-350.webp', desc: 'Le format familial du quotidien.' },
    { name: 'Bee Happy', volume: '750 ml', image: 'images/product-750.webp', desc: 'Le grand format pour les amateurs.' }
  ],

  mockups: [
    { title: 'Carte de visite', image: 'images/mockup-card.webp' },
    { title: 'Casquette', image: 'images/mockup-cap.webp' },
    { title: 'Chemise', image: 'images/mockup-shirt.webp' },
    { title: 'T-shirt', image: 'images/mockup-tshirt.webp' },
    { title: 'Papier à en-tête', image: 'images/mockup-letterhead.webp' }
  ]
};
