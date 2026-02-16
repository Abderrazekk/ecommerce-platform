const DeliveryPayment = () => {
  const sections = [
    {
      title: "Livraison",
      icon: "🚚",
      items: [
        {
          question: "Comment sont calculés les frais de livraison ?",
          answer:
            "Les frais de livraison dépendent de la destination, du poids et de la taille de votre commande, ainsi que du mode de livraison choisi. Vous pouvez voir les frais de livraison exacts lors du processus de commande, avant de finaliser votre achat.",
        },
        {
          question: "Quels sont les modes de livraison proposés ?",
          answer:
            "Nous proposons plusieurs options de livraison, y compris la livraison standard, express et en point relais. Le choix des options de livraison dépend de la destination et du poids de votre commande.",
        },
        {
          question: "Les frais de livraison sont-ils remboursables ?",
          answer:
            "Les frais de livraison ne sont pas remboursables sauf en cas d'erreur de notre part ou de produit défectueux.",
        },
        {
          question: "Puis-je suivre ma livraison ?",
          answer:
            "Une fois votre commande expédiée, nous vous enverrons un email de confirmation contenant un lien de suivi. Vous pouvez également suivre l'état de votre commande en vous connectant à votre compte sur notre site.",
        },
        {
          question: "Livrez-vous à l'international ?",
          answer:
            "Oui, nous livrons à l'international. Les frais de livraison et les délais de livraison varient en fonction de la destination et du mode de livraison choisi.",
        },
        {
          question: "Est-ce que les frais de livraison sont offerts ?",
          answer:
            "Nous offrons la livraison gratuite pour les commandes dépassant 100€. Les détails et les conditions de l'offre de livraison gratuite sont disponibles sur notre site.",
        },
      ],
    },
    {
      title: "Suivi de commande",
      icon: "📦",
      items: [
        {
          question: "Comment suivre ma commande ?",
          answer:
            "Pour suivre votre commande, veuillez vous connecter à votre compte sur notre site et accéder à la page de suivi de commande. Vous y trouverez les informations de suivi de votre commande.",
        },
        {
          question: "Quand ma commande sera-t-elle expédiée ?",
          answer:
            "Nous expédions généralement les commandes dans un délai de 24 à 48 heures suivant la confirmation de la commande. Si vous avez des questions sur le délai d'expédition de votre commande, veuillez nous contacter.",
        },
        {
          question: "Comment suivre l'expédition de ma commande ?",
          answer:
            "Nous vous enverrons un email de confirmation d'expédition avec les informations de suivi de votre commande dès que celle-ci aura été expédiée.",
        },
      ],
    },
    {
      title: "Paiement",
      icon: "💳",
      items: [
        {
          question: "Quels modes de paiement acceptez-vous ?",
          answer:
            "Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), PayPal, Apple Pay et les virements bancaires.",
        },
        {
          question: "Mes informations de paiement sont-elles sécurisées ?",
          answer:
            "Oui, toutes les transactions sont cryptées avec la technologie SSL et nous ne stockons jamais vos informations de carte bancaire.",
        },
        {
          question: "Puis-je payer en plusieurs fois ?",
          answer:
            "Oui, nous proposons le paiement en 3 ou 4 fois sans frais pour les commandes supérieures à 150€.",
        },
        {
          question: "Quand serai-je débité ?",
          answer:
            "Le débit est effectué au moment de la validation de votre commande. En cas de paiement en plusieurs fois, les débits suivants sont prélevés automatiquement chaque mois.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Livraison & Paiement
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tout ce que vous devez savoir sur nos services de livraison et
            options de paiement
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center mr-4 border border-gray-100">
                  <span className="text-2xl">{section.icon}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full mt-2"></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-100 group"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-100 transition-colors">
                        <svg
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                          {item.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPayment;
