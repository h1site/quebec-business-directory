/**
 * Blog Article: NEQ Québec - Complete Guide
 * Bilingual content (French/English)
 */

export const neqQuebecArticle = {
  id: 'neq-quebec-guide',
  slug: 'neq-quebec-tout-savoir-numero-entreprise',
  publishedDate: '2025-11-01',
  lastUpdated: '2025-11-01',
  author: 'Registre du Québec',

  // SEO metadata
  seo: {
    fr: {
      title: 'NEQ Québec : tout savoir sur le numéro d\'entreprise du Québec | Guide 2025',
      description: 'Guide complet NEQ Québec 2025 : définition du numéro d\'entreprise à 10 chiffres, qui doit l\'obtenir (inc., freelance, OSBL), étapes d\'immatriculation, recherche et vérification au registre. Tout savoir sur le NEQ.',
      keywords: 'NEQ Québec, numéro entreprise Québec, NEQ recherche, comment obtenir NEQ, registre entreprise Québec, NEQ number Quebec',
      canonical: 'https://registreduquebec.com/blogue/neq-quebec-tout-savoir-numero-entreprise'
    },
    en: {
      title: 'Quebec NEQ: Everything About the Quebec Enterprise Number | 2025 Guide',
      description: 'Complete Quebec NEQ guide 2025: definition of the 10-digit enterprise number, who needs it (inc., freelance, NPO), registration steps, search and verification in the registry. Everything about NEQ.',
      keywords: 'Quebec NEQ, Quebec enterprise number, NEQ search, how to get NEQ, Quebec business registry, NEQ number Quebec',
      canonical: 'https://registreduquebec.com/en/blog/neq-quebec-tout-savoir-numero-entreprise'
    }
  },

  // Hero image
  heroImage: {
    url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
    alt: {
      fr: 'Documents d\'entreprise et formulaires administratifs québécois montrant l\'importance du numéro NEQ',
      en: 'Quebec business documents and administrative forms showing the importance of NEQ number'
    },
    credit: 'Scott Graham',
    width: 1920,
    height: 1080
  },

  // Article title
  title: {
    fr: 'NEQ Québec : tout savoir sur le numéro d\'entreprise du Québec',
    en: 'Quebec NEQ: Everything About the Quebec Enterprise Number'
  },

  // Article introduction
  intro: {
    fr: 'Le NEQ (Numéro d\'entreprise du Québec) est l\'identifiant officiel à 10 chiffres qui permet d\'identifier une entreprise immatriculée au Québec. Il est exigé dans de nombreuses démarches administratives et facilite les échanges avec l\'État.',
    en: 'The NEQ (Quebec Enterprise Number) is the official 10-digit identifier for businesses registered in Quebec. It is required for many administrative procedures and facilitates exchanges with the government.'
  },

  // Important note
  disclaimer: {
    fr: '<strong>Note importante :</strong> pour obtenir la dernière mise à jour officielle, le site du gouvernement demeure l\'outil le plus à jour. Si vous êtes à l\'aise avec le registre, vous pouvez toutefois retrouver l\'information de base ici.',
    en: '<strong>Important note:</strong> for the latest official updates, the government website remains the most up-to-date tool. However, if you are comfortable with the registry, you can find basic information here.'
  },

  // Article sections with images
  sections: [
    {
      id: 'what-is-neq',
      title: {
        fr: '1. Qu\'est-ce que le NEQ au Québec ?',
        en: '1. What is the NEQ in Quebec?'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
        alt: {
          fr: 'Numéro d\'identification unique NEQ à 10 chiffres sur document officiel d\'entreprise québécoise',
          en: 'Unique 10-digit NEQ identification number on official Quebec business document'
        },
        credit: 'Markus Spiske',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <p>Le <strong>NEQ Québec</strong> (numéro d'entreprise du Québec) est un numéro unique à <strong>10 chiffres</strong> attribué à une entreprise ou une organisation lorsqu'elle est immatriculée au registre des entreprises du Québec.</p>
          <p>On le retrouve aussi sous différentes formes de recherche : <em>"NEQ numéro entreprise Québec", "NEQ Québec recherche", "numéro NEQ Québec", "registre entreprise Québec NEQ", "NEQ Québec enterprise number".</em></p>

          <h3>À quoi sert le NEQ ?</h3>
          <p>Il sert à :</p>
          <ul>
            <li>identifier officiellement une entreprise au Québec ;</li>
            <li>faire des déclarations et mises à jour au registre ;</li>
            <li>échanger avec Revenu Québec et certains ministères ;</li>
            <li>vérifier l'existence d'une entreprise ;</li>
            <li>participer à certains appels d'offres ou contrats.</li>
          </ul>

          <h3>Caractéristiques du NEQ</h3>
          <ul>
            <li><strong>Format :</strong> 10 chiffres (ex. 11XXXXXXXX) ;</li>
            <li><strong>Niveau :</strong> provincial (Québec) ;</li>
            <li><strong>Langues usuelles :</strong> "NEQ Québec" en français, "NEQ number in Quebec" ou "Quebec NEQ number" en anglais.</li>
          </ul>
        `,
        en: `
          <p>The <strong>Quebec NEQ</strong> (Quebec Enterprise Number) is a unique <strong>10-digit number</strong> assigned to a business or organization when it is registered in the Quebec enterprise registry.</p>
          <p>It is also found under different search forms: <em>"Quebec enterprise number NEQ", "NEQ Quebec search", "Quebec NEQ number", "Quebec business registry NEQ", "NEQ Quebec enterprise number".</em></p>

          <h3>What is the NEQ used for?</h3>
          <p>It is used to:</p>
          <ul>
            <li>officially identify a business in Quebec;</li>
            <li>make declarations and updates to the registry;</li>
            <li>communicate with Revenu Québec and certain ministries;</li>
            <li>verify the existence of a business;</li>
            <li>participate in certain tenders or contracts.</li>
          </ul>

          <h3>NEQ Characteristics</h3>
          <ul>
            <li><strong>Format:</strong> 10 digits (e.g., 11XXXXXXXX);</li>
            <li><strong>Level:</strong> provincial (Quebec);</li>
            <li><strong>Common languages:</strong> "NEQ Québec" in French, "NEQ number in Quebec" or "Quebec NEQ number" in English.</li>
          </ul>
        `
      }
    },
    {
      id: 'who-needs-neq',
      title: {
        fr: '2. Qui doit avoir un NEQ au Québec ?',
        en: '2. Who needs a NEQ in Quebec?'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
        alt: {
          fr: 'Propriétaires d\'entreprises québécoises en réunion discutant de l\'immatriculation et du NEQ',
          en: 'Quebec business owners in meeting discussing registration and NEQ requirements'
        },
        credit: 'Hunters Race',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <p>Dans la majorité des cas, dès qu'une entreprise exerce au Québec et doit être immatriculée, un <strong>NEQ</strong> lui est attribué.</p>

          <h3>Entreprises qui ont généralement un NEQ</h3>
          <ul>
            <li>compagnies / sociétés par actions (inc.) ;</li>
            <li>entreprises fédérales qui exercent au Québec ;</li>
            <li>sociétés de personnes (s.e.n.c., s.e.c.) ;</li>
            <li>OSBL actifs au Québec ;</li>
            <li>entreprises individuelles immatriculées.</li>
          </ul>

          <h3>Et les travailleurs autonomes ?</h3>
          <p>Question fréquente : <em>"do freelancer need a NEQ Quebec ? do you need a NEQ if you are freelancer Quebec ?"</em></p>
          <p>Réponse : si vous utilisez un <strong>nom d'entreprise</strong>, si vous exercez régulièrement des activités commerciales ou si vous voulez être inscrit au registre, vous pouvez avoir besoin d'un NEQ. Il faut vérifier selon votre situation.</p>
        `,
        en: `
          <p>In most cases, as soon as a business operates in Quebec and must be registered, a <strong>NEQ</strong> is assigned to it.</p>

          <h3>Businesses that generally have a NEQ</h3>
          <ul>
            <li>corporations / joint-stock companies (inc.);</li>
            <li>federal businesses operating in Quebec;</li>
            <li>partnerships (s.e.n.c., s.e.c.);</li>
            <li>NPOs active in Quebec;</li>
            <li>registered sole proprietorships.</li>
          </ul>

          <h3>What about freelancers?</h3>
          <p>Frequent question: <em>"do freelancers need a NEQ Quebec? do you need a NEQ if you are freelancer Quebec?"</em></p>
          <p>Answer: if you use a <strong>business name</strong>, if you regularly carry out commercial activities or if you want to be registered in the registry, you may need a NEQ. You need to verify according to your situation.</p>
        `
      }
    },
    {
      id: 'how-to-get-neq',
      title: {
        fr: '3. Comment obtenir un NEQ au Québec ?',
        en: '3. How to get a NEQ in Quebec?'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
        alt: {
          fr: 'Formulaire d\'immatriculation en ligne pour obtenir un numéro NEQ au Québec sur ordinateur',
          en: 'Online registration form to obtain a NEQ number in Quebec on computer'
        },
        credit: 'Corinne Kutz',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <p>C'est la requête : <em>"comment obtenir un NEQ pour entreprise Québec", "how to get a NEQ number in Quebec", "Québec NEQ registration", "service Québec NEQ".</em></p>

          <h3>Étapes pour obtenir son NEQ</h3>
          <ol>
            <li><strong>Choisir la forme juridique</strong> (entreprise individuelle, société, incorporation, OSBL).</li>
            <li><strong>Rassembler les informations</strong> : nom légal, adresse, activités, administrateurs.</li>
            <li><strong>Faire l'immatriculation au registre des entreprises du Québec</strong> (ou l'inscription de votre société fédérale).</li>
            <li><strong>Payer les droits exigés</strong>.</li>
            <li><strong>Recevoir le NEQ</strong> : dans la plupart des cas, le numéro d'entreprise du Québec est attribué rapidement après le dépôt.</li>
          </ol>

          <h4>Délais pour obtenir un NEQ</h4>
          <p>En ligne, l'obtention peut être très rapide (parfois le jour même), mais certains dossiers peuvent demander quelques jours de traitement.</p>

          <h4>Coûts et renouvellements</h4>
          <p>Les frais varient selon la forme juridique. Une déclaration ou mise à jour annuelle peut être exigée (on voit souvent les requêtes <em>"Québec NIR/NEQ registration / renewals"</em> ou <em>"pay NEQ registration Quebec"</em>).</p>
        `,
        en: `
          <p>This is the query: <em>"how to obtain a NEQ for Quebec business", "how to get a NEQ number in Quebec", "Quebec NEQ registration", "service Quebec NEQ".</em></p>

          <h3>Steps to obtain your NEQ</h3>
          <ol>
            <li><strong>Choose the legal form</strong> (sole proprietorship, partnership, incorporation, NPO).</li>
            <li><strong>Gather information</strong>: legal name, address, activities, directors.</li>
            <li><strong>Register with the Quebec enterprise registry</strong> (or register your federal corporation).</li>
            <li><strong>Pay the required fees</strong>.</li>
            <li><strong>Receive the NEQ</strong>: in most cases, the Quebec enterprise number is assigned quickly after filing.</li>
          </ol>

          <h4>Timeframe to obtain a NEQ</h4>
          <p>Online, obtaining can be very fast (sometimes same day), but some files may require a few days of processing.</p>

          <h4>Costs and renewals</h4>
          <p>Fees vary according to the legal form. An annual declaration or update may be required (we often see queries <em>"Quebec NIR/NEQ registration / renewals"</em> or <em>"pay NEQ registration Quebec"</em>).</p>
        `
      }
    },
    {
      id: 'search-verify-neq',
      title: {
        fr: '4. Comment chercher ou vérifier un NEQ (NEQ Québec recherche)',
        en: '4. How to search or verify a NEQ (NEQ Quebec search)'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51',
        alt: {
          fr: 'Recherche et vérification d\'un numéro NEQ dans le registre des entreprises du Québec en ligne',
          en: 'Search and verification of a NEQ number in the Quebec enterprise registry online'
        },
        credit: 'Marten Bjork',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <p>Beaucoup d'utilisateurs tapent : <em>"NEQ Québec search", "NEQ Québec lookup", "search NEQ Quebec", "trouver NEQ Québec", "comment trouver le NEQ d'une entreprise au Québec", "verification d'une entreprise au Québec NEQ".</em></p>
          <p>Le principe est simple : on part soit du <strong>nom de l'entreprise</strong>, soit du <strong>numéro NEQ</strong>, pour confirmer l'existence de l'entité, son statut et ses informations de base.</p>

          <h3>Quand faire une recherche NEQ ?</h3>
          <ul>
            <li>avant de signer un contrat ;</li>
            <li>pour vérifier qu'une entreprise est bien immatriculée ;</li>
            <li>pour retrouver le NEQ d'un fournisseur ou d'un client ;</li>
            <li>pour vérifier le statut (actif/radié).</li>
          </ul>

          <h3>Important sur les sources</h3>
          <p><strong>Attention :</strong> pour la version la plus récente des données, le site du gouvernement est la référence officielle. Les registres ou répertoires peuvent toutefois vous permettre de repérer rapidement un NEQ, une raison sociale ou un statut d'entreprise si vous êtes à l'aise avec ce type d'outil.</p>
        `,
        en: `
          <p>Many users search: <em>"NEQ Quebec search", "NEQ Quebec lookup", "search NEQ Quebec", "find NEQ Quebec", "how to find the NEQ of a business in Quebec", "verification of a business in Quebec NEQ".</em></p>
          <p>The principle is simple: you start with either the <strong>business name</strong> or the <strong>NEQ number</strong>, to confirm the existence of the entity, its status and its basic information.</p>

          <h3>When to do a NEQ search?</h3>
          <ul>
            <li>before signing a contract;</li>
            <li>to verify that a business is properly registered;</li>
            <li>to find the NEQ of a supplier or client;</li>
            <li>to check the status (active/struck off).</li>
          </ul>

          <h3>Important about sources</h3>
          <p><strong>Warning:</strong> for the most recent version of the data, the government website is the official reference. However, registries or directories can allow you to quickly locate a NEQ, a corporate name or a business status if you are comfortable with this type of tool.</p>
        `
      }
    },
    {
      id: 'neq-vs-other-numbers',
      title: {
        fr: '5. NEQ, Revenu Québec et autres numéros : ne pas confondre',
        en: '5. NEQ, Revenu Quebec and other numbers: don\'t confuse'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f',
        alt: {
          fr: 'Documents administratifs montrant différents numéros d\'identification d\'entreprise au Québec incluant le NEQ',
          en: 'Administrative documents showing different business identification numbers in Quebec including NEQ'
        },
        credit: 'Olu Eletu',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <p>Dans les recherches, on voit souvent : <em>"revenu Québec NEQ", "revenu Québec NEQ number", "revenu Québec NEQ invalide", "revenue Quebec NEQ signin", "NEQ vs Québec", "Québec business number NEQ".</em></p>
          <p>Le NEQ est un <strong>numéro provincial d'entreprise</strong>. Il ne remplace pas :</p>
          <ul>
            <li>le <strong>NAS</strong> (personnel) ;</li>
            <li>le <strong>numéro d'entreprise fédéral</strong> (BN) ;</li>
            <li>les numéros de taxes.</li>
          </ul>

          <h3>NEQ vs numéro d'entreprise du Canada</h3>
          <p>Une entreprise peut avoir un <strong>NEQ (Québec)</strong> et un <strong>numéro d'entreprise du Canada</strong>. Ce n'est pas un doublon, ce sont deux niveaux d'identification.</p>

          <h3>NEQ invalide ou rejeté</h3>
          <p>Si un système indique <strong>"NEQ invalide"</strong>, vérifiez :</p>
          <ul>
            <li>que le numéro comporte bien 10 chiffres ;</li>
            <li>que le nom légal est saisi correctement ;</li>
            <li>que l'entreprise n'a pas été radiée.</li>
          </ul>
        `,
        en: `
          <p>In searches, we often see: <em>"revenue Quebec NEQ", "revenue Quebec NEQ number", "revenue Quebec NEQ invalid", "revenue Quebec NEQ signin", "NEQ vs Quebec", "Quebec business number NEQ".</em></p>
          <p>The NEQ is a <strong>provincial enterprise number</strong>. It does not replace:</p>
          <ul>
            <li>the <strong>SIN</strong> (personal);</li>
            <li>the <strong>federal business number</strong> (BN);</li>
            <li>tax numbers.</li>
          </ul>

          <h3>NEQ vs Canada business number</h3>
          <p>A business can have a <strong>NEQ (Quebec)</strong> and a <strong>Canada business number</strong>. It's not a duplicate, these are two levels of identification.</p>

          <h3>Invalid or rejected NEQ</h3>
          <p>If a system indicates <strong>"invalid NEQ"</strong>, check:</p>
          <ul>
            <li>that the number has 10 digits;</li>
            <li>that the legal name is entered correctly;</li>
            <li>that the business has not been struck off.</li>
          </ul>
        `
      }
    },
    {
      id: 'faq',
      title: {
        fr: '6. Questions fréquentes sur le NEQ (FAQ)',
        en: '6. Frequently asked questions about NEQ (FAQ)'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
        alt: {
          fr: 'Section FAQ avec questions fréquentes sur le numéro d\'entreprise du Québec NEQ',
          en: 'FAQ section with frequently asked questions about Quebec enterprise number NEQ'
        },
        credit: 'Camylla Battani',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <h3>Qu'est-ce que le NEQ au Québec ?</h3>
          <p>C'est le numéro d'entreprise du Québec, attribué lors de l'immatriculation. Il identifie officiellement l'entreprise.</p>

          <h3>Combien de temps ça prend pour avoir un NEQ ?</h3>
          <p>Souvent très rapide en ligne. Prévoir quelques jours en cas de vérification.</p>

          <h3>Où trouver mon NEQ ?</h3>
          <p>Dans les documents d'immatriculation ou via une recherche par nom d'entreprise.</p>

          <h3>Est-ce qu'on peut annuler un NEQ ?</h3>
          <p>Oui, mais il faut faire les démarches de fermeture/radiation selon la forme juridique (<em>"cancel NEQ Québec", "cancel NEQ Québec entreprises"</em>).</p>

          <h3>Est-ce que c'est obligatoire pour un freelancer ?</h3>
          <p>Pas toujours, mais dès que vous travaillez sous un nom d'entreprise ou que vous devez être immatriculé, le NEQ devient nécessaire.</p>
        `,
        en: `
          <h3>What is the NEQ in Quebec?</h3>
          <p>It's the Quebec enterprise number, assigned during registration. It officially identifies the business.</p>

          <h3>How long does it take to get a NEQ?</h3>
          <p>Often very fast online. Allow a few days for verification.</p>

          <h3>Where to find my NEQ?</h3>
          <p>In registration documents or via a search by business name.</p>

          <h3>Can you cancel a NEQ?</h3>
          <p>Yes, but you must complete the closure/strike off procedures according to the legal form (<em>"cancel NEQ Quebec", "cancel NEQ Quebec enterprises"</em>).</p>

          <h3>Is it mandatory for a freelancer?</h3>
          <p>Not always, but as soon as you work under a business name or need to be registered, the NEQ becomes necessary.</p>
        `
      }
    },
    {
      id: 'official-sources',
      title: {
        fr: '7. Rappel sur les sources officielles',
        en: '7. Reminder about official sources'
      },
      image: {
        url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
        alt: {
          fr: 'Site web officiel du gouvernement du Québec pour l\'immatriculation et la recherche de NEQ',
          en: 'Official Quebec government website for registration and NEQ search'
        },
        credit: 'Scott Graham',
        width: 1200,
        height: 800
      },
      content: {
        fr: `
          <p>Les informations ci-dessus expliquent le fonctionnement général du <strong>NEQ au Québec</strong> et couvrent les recherches les plus fréquentes en français et en anglais.</p>
          <p><strong>Pour la dernière mise à jour officielle, le site du gouvernement du Québec demeure l'outil le plus à jour.</strong> Mais si vous êtes à l'aise avec le registre ou votre répertoire d'entreprises, vous pouvez déjà retrouver et valider beaucoup d'informations de base : nom légal, NEQ, statut, adresse.</p>
        `,
        en: `
          <p>The information above explains the general functioning of the <strong>NEQ in Quebec</strong> and covers the most frequent searches in French and English.</p>
          <p><strong>For the latest official update, the Quebec government website remains the most up-to-date tool.</strong> But if you are comfortable with the registry or your business directory, you can already find and validate a lot of basic information: legal name, NEQ, status, address.</p>
        `
      }
    }
  ],

  // Call to action
  cta: {
    fr: {
      title: 'Rechercher une entreprise par NEQ',
      description: 'Utilisez notre outil de recherche pour trouver rapidement une entreprise québécoise par son numéro NEQ ou son nom.',
      buttonText: 'Rechercher maintenant',
      buttonLink: '/recherche'
    },
    en: {
      title: 'Search for a business by NEQ',
      description: 'Use our search tool to quickly find a Quebec business by its NEQ number or name.',
      buttonText: 'Search now',
      buttonLink: '/en/search'
    }
  },

  // Related articles
  relatedArticles: [
    {
      id: 'incorporer-entreprise-quebec',
      slug: 'comment-incorporer-entreprise-quebec'
    },
    {
      id: 'revenu-quebec-entreprise',
      slug: 'guide-revenu-quebec-nouvelles-entreprises'
    },
    {
      id: 'registre-entreprises',
      slug: 'registre-entreprises-quebec-guide-complet'
    }
  ]
};
