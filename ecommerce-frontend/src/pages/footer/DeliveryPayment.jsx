const DeliveryPayment = () => {
  const sections = [
    {
      title: "Livraison",
      icon: "🚚",
      items: [
        {
          question: "Quels sont les délais de livraison ?",
          answer:
            "Les délais de livraison varient selon votre localisation. En général, la livraison s’effectue entre 2 et 5 jours ouvrables après la confirmation de la commande.",
        },
        {
          question: "Livrez-vous à l'international ?",
          answer:
            "Oui, nous livrons à l'international. Les frais et délais dépendent de la destination et du mode de livraison choisi.",
        },
        {
          question: "Puis-je suivre ma livraison ?",
          answer:
            "Une fois votre commande expédiée, vous recevrez un email de confirmation avec un lien de suivi. Vous pouvez également suivre votre commande dans la section **Mes Commandes** de votre compte.",
        },
        {
          question: "Les frais de livraison sont-ils remboursables ?",
          answer:
            "Les frais de livraison ne sont pas remboursables sauf en cas d'erreur de notre part ou de produit défectueux.",
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
            "Connectez-vous à votre compte et accédez à **Mes Commandes** pour suivre l'état de votre commande en temps réel.",
        },
        {
          question: "Quand ma commande sera-t-elle expédiée ?",
          answer:
            "Les commandes sont généralement expédiées dans les 24 à 48 heures suivant la confirmation. Pour toute question sur l'expédition, contactez notre support.",
        },
        {
          question: "Puis-je annuler ou modifier ma commande ?",
          answer:
            "Vous pouvez annuler ou modifier votre commande tant qu'elle n’a pas été expédiée. Une fois expédiée, veuillez consulter notre politique de retour.",
        },
      ],
    },
    {
      title: "Paiement",
      icon: "💳",
      items: [
        {
          question: "Quels sont les modes de paiement acceptés ?",
          answer:
            "Nous proposons le paiement à la livraison (Cash on Delivery). Le paiement se fait directement lors de la réception de la commande.",
        },
        {
          question: "Mes informations de paiement sont-elles sécurisées ?",
          answer:
            "Oui, vos informations personnelles et de paiement sont protégées. Nous ne stockons jamais vos informations bancaires.",
        },
        {
          question: "Puis-je utiliser un code promo ?",
          answer:
            "Oui, vous pouvez entrer votre code promo lors du passage à la caisse. La réduction sera appliquée automatiquement avant confirmation.",
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
