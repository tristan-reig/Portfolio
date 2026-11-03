type Quatre = [string, string, string, string]

export type Groupe = {
  titre: string
  mots: Quatre
  niveau: 0 | 1 | 2 | 3
  caches?: Quatre
  notes?: Quatre
}
export type Grille = [Groupe, Groupe, Groupe, Groupe]

export const GRILLES: Grille[] = [
  [
    { niveau: 0, titre: 'Fruits rouges', mots: ['FRAISE', 'CERISE', 'FRAMBOISE', 'GROSEILLE'] },
    { niveau: 1, titre: 'Matériel du peintre', mots: ['PINCEAU', 'ROULEAU', 'TOILE', 'PALETTE'] },
    { niveau: 2, titre: '___ de bain', mots: ['SEL', 'SERVIETTE', 'PEIGNOIR', 'SALLE'] },
    { niveau: 3, titre: 'Un animal caché', mots: ['CHÂTEAU', 'RÂTEAU', 'LOUPE', 'COQUILLE'], caches: ['CHAT', 'RAT', 'LOUP', 'COQ'] },
  ],
  [
    { niveau: 0, titre: 'Mois', mots: ['AVRIL', 'MAI', 'JUIN', 'MARS'] },
    { niveau: 1, titre: 'Planètes', mots: ['VÉNUS', 'SATURNE', 'JUPITER', 'MERCURE'] },
    { niveau: 2, titre: 'Métaux', mots: ['FER', 'CUIVRE', 'ZINC', 'PLOMB'] },
    { niveau: 3, titre: 'Se prononcent comme un nombre', mots: ['SANG', 'CET', 'DIS', 'SIS'], notes: ['cent', 'sept', 'dix', 'six'] },
  ],
  [
    { niveau: 0, titre: 'Sports de raquette', mots: ['TENNIS', 'BADMINTON', 'SQUASH', 'PADEL'] },
    { niveau: 1, titre: 'Fromages', mots: ['BRIE', 'COMTÉ', 'ROQUEFORT', 'MUNSTER'] },
    { niveau: 2, titre: 'Départements', mots: ['CANTAL', 'GARD', 'AIN', 'VAR'] },
    { niveau: 3, titre: 'Palindromes', mots: ['RADAR', 'KAYAK', 'SAGAS', 'ÉTÉ'] },
  ],
  [
    { niveau: 0, titre: 'Ustensiles de cuisine', mots: ['LOUCHE', 'ÉCUMOIRE', 'SPATULE', 'PASSOIRE'] },
    { niveau: 1, titre: 'Pâtes', mots: ['PENNE', 'FUSILLI', 'FARFALLE', 'LASAGNE'] },
    { niveau: 2, titre: 'Sauces', mots: ['PESTO', 'BÉCHAMEL', 'AÏOLI', 'SALSA'] },
    { niveau: 3, titre: 'Coup de ___', mots: ['FOUDRE', 'POUCE', 'MAIN', 'FOUET'] },
  ],
  [
    { niveau: 0, titre: 'Fleuves français', mots: ['LOIRE', 'RHÔNE', 'SEINE', 'GARONNE'] },
    { niveau: 1, titre: "Pièces d'échecs", mots: ['ROI', 'DAME', 'FOU', 'CAVALIER'] },
    { niveau: 2, titre: 'Château fort', mots: ['DONJON', 'REMPART', 'DOUVES', 'TOUR'] },
    { niveau: 3, titre: 'Se prononcent comme une lettre', mots: ['HACHE', 'AILE', 'ÈRE', 'THÉ'], notes: ['H', 'L', 'R', 'T'] },
  ],
  [
    { niveau: 0, titre: 'Instruments à cordes', mots: ['VIOLON', 'GUITARE', 'HARPE', 'CONTREBASSE'] },
    { niveau: 1, titre: 'Genres musicaux', mots: ['JAZZ', 'BLUES', 'ROCK', 'FUNK'] },
    { niveau: 2, titre: 'Cinéastes français', mots: ['TRUFFAUT', 'GODARD', 'VARDA', 'BESSON'] },
    { niveau: 3, titre: 'Commencent par une note', mots: ['DOUCHE', 'MIROIR', 'LAPIN', 'SIROP'], caches: ['DO', 'MI', 'LA', 'SI'] },
  ],
  [
    { niveau: 0, titre: 'Parties du visage', mots: ['NEZ', 'MENTON', 'JOUE', 'SOURCIL'] },
    { niveau: 1, titre: '___ de poule', mots: ['CHAIR', 'NID', 'LAIT', 'BOUILLON'] },
    { niveau: 2, titre: 'Vocabulaire militaire', mots: ['FRONT', 'TRANCHÉE', 'CASERNE', 'RECRUE'] },
    { niveau: 3, titre: 'Un nombre caché', mots: ['HUÎTRE', 'CENTRE', 'SEPTEMBRE', 'MILLEFEUILLE'], caches: ['HUIT', 'CENT', 'SEPT', 'MILLE'] },
  ],
  [
    { niveau: 0, titre: 'Lettres grecques', mots: ['ALPHA', 'DELTA', 'SIGMA', 'OMÉGA'] },
    { niveau: 1, titre: 'Îles', mots: ['BALI', 'CRÈTE', 'MALTE', 'CORSE'] },
    { niveau: 2, titre: 'Serpents', mots: ['COBRA', 'VIPÈRE', 'BOA', 'MAMBA'] },
    { niveau: 3, titre: 'Langages de programmation', mots: ['RUST', 'RUBY', 'PYTHON', 'JAVA'] },
  ],
  [
    { niveau: 0, titre: 'Félins', mots: ['LION', 'TIGRE', 'LYNX', 'GUÉPARD'] },
    { niveau: 1, titre: 'Signes du zodiaque', mots: ['BÉLIER', 'TAUREAU', 'CANCER', 'BALANCE'] },
    { niveau: 2, titre: 'Instruments de mesure', mots: ['MÈTRE', 'THERMOMÈTRE', 'CHRONOMÈTRE', 'BAROMÈTRE'] },
    { niveau: 3, titre: 'Une partie du corps cachée', mots: ['BRASSERIE', 'MAINTENANT', 'PIÉDESTAL', 'DOSSIER'], caches: ['BRAS', 'MAIN', 'PIED', 'DOS'] },
  ],
  [
    { niveau: 0, titre: 'Bateaux', mots: ['VOILIER', 'CHALUTIER', 'PAQUEBOT', 'CATAMARAN'] },
    { niveau: 1, titre: "Parties d'un vélo", mots: ['GUIDON', 'PÉDALE', 'SELLE', 'RAYON'] },
    { niveau: 2, titre: 'Télévision', mots: ['ANTENNE', 'ÉMISSION', 'CHAÎNE', 'PLATEAU'] },
    { niveau: 3, titre: 'Un pays caché', mots: ['PIRANHA', 'INCUBATEUR', 'ROMANCE', 'ANOMALIE'], caches: ['IRAN', 'CUBA', 'OMAN', 'MALI'] },
  ],
  [
    { niveau: 0, titre: 'Viennoiseries', mots: ['BRIOCHE', 'CROISSANT', 'CHAUSSON', 'CHOCOLATINE'] },
    { niveau: 1, titre: 'Formes géométriques', mots: ['CERCLE', 'CARRÉ', 'LOSANGE', 'HEXAGONE'] },
    { niveau: 2, titre: 'Percussions', mots: ['TAMBOUR', 'CYMBALE', 'XYLOPHONE', 'TRIANGLE'] },
    { niveau: 3, titre: "___ d'or", mots: ['BALLON', 'PALME', 'ÂGE', 'CŒUR'] },
  ],
  [
    { niveau: 0, titre: 'Météo', mots: ['PLUIE', 'NEIGE', 'GRÊLE', 'BROUILLARD'] },
    { niveau: 1, titre: 'Vents', mots: ['MISTRAL', 'TRAMONTANE', 'SIROCCO', 'AUTAN'] },
    { niveau: 2, titre: 'Façons de saluer', mots: ['ACCOLADE', 'RÉVÉRENCE', 'CHECK', 'BISE'] },
    { niveau: 3, titre: 'Verlan', mots: ['MEUF', 'RELOU', 'CHELOU', 'ZARBI'], notes: ['femme', 'lourd', 'louche', 'bizarre'] },
  ],
  [
    { niveau: 0, titre: 'Poissons', mots: ['SARDINE', 'THON', 'SAUMON', 'MORUE'] },
    { niveau: 1, titre: 'Crustacés', mots: ['CRABE', 'HOMARD', 'CREVETTE', 'LANGOUSTE'] },
    { niveau: 2, titre: '___ de mer', mots: ['ÉTOILE', 'FRUITS', 'MAL', 'LION'] },
    { niveau: 3, titre: 'Un poisson caché', mots: ['MARATHON', 'CONSOLE', 'CRAIE', 'BARON'], caches: ['THON', 'SOLE', 'RAIE', 'BAR'] },
  ],
  [
    { niveau: 0, titre: 'Métiers du cinéma', mots: ['RÉALISATEUR', 'MONTEUR', 'CASCADEUR', 'SCÉNARISTE'] },
    { niveau: 1, titre: 'Prix de cinéma', mots: ['OSCAR', 'CÉSAR', 'LION', 'OURS'] },
    { niveau: 2, titre: 'Empereurs romains', mots: ['AUGUSTE', 'NÉRON', 'TRAJAN', 'CALIGULA'] },
    { niveau: 3, titre: 'Commencent par un pronom', mots: ['JEUDI', 'TULIPE', 'ILLUSION', 'ONGLE'], caches: ['JE', 'TU', 'IL', 'ON'] },
  ],
  [
    { niveau: 0, titre: 'Modes de cuisson', mots: ['RÔTIR', 'GRILLER', 'BOUILLIR', 'FRIRE'] },
    { niveau: 1, titre: 'Herbes aromatiques', mots: ['BASILIC', 'PERSIL', 'CIBOULETTE', 'ESTRAGON'] },
    { niveau: 2, titre: 'Épices', mots: ['CANNELLE', 'CURCUMA', 'PAPRIKA', 'CUMIN'] },
    { niveau: 3, titre: 'Sonnent comme un mot du calendrier', mots: ['THYM', 'MOI', 'HEURT', 'DATTE'], notes: ['temps', 'mois', 'heure', 'date'] },
  ],
  [
    { niveau: 0, titre: "Sports d'équipe", mots: ['FOOTBALL', 'RUGBY', 'HANDBALL', 'VOLLEY'] },
    { niveau: 1, titre: 'Postes au football', mots: ['GARDIEN', 'DÉFENSEUR', 'MILIEU', 'ATTAQUANT'] },
    { niveau: 2, titre: 'Vocabulaire du rugby', mots: ['MÊLÉE', 'TOUCHE', 'PLAQUAGE', 'TRANSFORMATION'] },
    { niveau: 3, titre: 'Synonymes de test', mots: ['ESSAI', 'ÉPREUVE', 'EXAMEN', 'CONTRÔLE'] },
  ],
  [
    { niveau: 0, titre: 'Fleurs', mots: ['ROSE', 'TULIPE', 'MARGUERITE', 'LYS'] },
    { niveau: 1, titre: 'Villes', mots: ['NANTES', 'LILLE', 'NICE', 'BORDEAUX'] },
    { niveau: 2, titre: 'Couleurs', mots: ['OCRE', 'TURQUOISE', 'ÉCARLATE', 'INDIGO'] },
    { niveau: 3, titre: 'Une couleur cachée', mots: ['VERTIGE', 'BRUNCH', 'ROUGEOLE', 'GRISOU'], caches: ['VERT', 'BRUN', 'ROUGE', 'GRIS'] },
  ],
  [
    { niveau: 0, titre: 'Périphériques', mots: ['CLAVIER', 'ÉCRAN', 'IMPRIMANTE', 'ENCEINTE'] },
    { niveau: 1, titre: 'Touches du clavier', mots: ['ÉCHAP', 'MAJ', 'TAB', 'SUPPR'] },
    { niveau: 2, titre: 'Au restaurant, dans l’ordre', mots: ['APÉRITIF', 'ENTRÉE', 'PLAT', 'DESSERT'] },
    { niveau: 3, titre: 'Rongeurs', mots: ['HAMSTER', 'CASTOR', 'ÉCUREUIL', 'SOURIS'] },
  ],
  [
    { niveau: 0, titre: 'Dieux grecs', mots: ['ZEUS', 'HADÈS', 'APOLLON', 'ATHÉNA'] },
    { niveau: 1, titre: 'Mousquetaires', mots: ['ATHOS', 'PORTHOS', 'ARAMIS', "D'ARTAGNAN"] },
    { niveau: 2, titre: 'Héros grecs', mots: ['ULYSSE', 'ACHILLE', 'PERSÉE', 'THÉSÉE'] },
    { niveau: 3, titre: 'Un dieu grec caché', mots: ['CARESSE', 'THÉRAPIE', 'ZÉROS', 'PANIER'], caches: ['ARÈS', 'HÉRA', 'ÉROS', 'PAN'] },
  ],
  [
    { niveau: 0, titre: 'Civilisations anciennes', mots: ['AZTÈQUE', 'INCA', 'OLMÈQUE', 'ÉTRUSQUE'] },
    { niveau: 1, titre: 'Magiciens', mots: ['MERLIN', 'GANDALF', 'DUMBLEDORE', 'JAFAR'] },
    { niveau: 2, titre: 'Vocabulaire de la 3D', mots: ['POLYGONE', 'TEXTURE', 'SHADER', 'VERTEX'] },
    { niveau: 3, titre: 'Logiciels de 3D', mots: ['BLENDER', 'ZBRUSH', 'MAYA', 'HOUDINI'] },
  ],
]
