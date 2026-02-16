const ReturnPolicy = () => {
  const steps = [
    {
      number: "01",
      title: "Contactez-nous",
      description:
        "Contactez notre service clientèle dans les 30 jours suivant la réception pour obtenir un numéro de retour.",
      icon: "📞",
    },
    {
      number: "02",
      title: "Préparez le colis",
      description:
        "Emballez soigneusement le produit dans son emballage d'origine avec tous les accessoires.",
      icon: "📦",
    },
    {
      number: "03",
      title: "Incluez les documents",
      description:
        "Ajoutez une copie de la facture originale et le formulaire de retour complété.",
      icon: "📄",
    },
    {
      number: "04",
      title: "Envoyez-nous le colis",
      description:
        "Expédiez le colis à l'adresse fournie avec le numéro de retour visible sur l'emballage.",
      icon: "🚚",
    },
  ];

  const conditions = [
    {
      title: "Produits éligibles",
      items: [
        "Produits non utilisés",
        "Dans l'emballage d'origine",
        "Avec toutes les étiquettes",
        "Avec tous les accessoires",
      ],
      icon: "✅",
    },
    {
      title: "Produits non éligibles",
      items: [
        "Produits personnalisés",
        "Articles de lingerie",
        "Produits hygiéniques",
        "Logiciels ouverts",
      ],
      icon: "❌",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">🔄</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Retours & Échanges
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une politique de retour simple et transparente pour votre
            tranquillité d'esprit
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-7 h-7 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Délais de retour
                  </h2>
                  <p className="text-gray-600">
                    Vous avez 3 jours pour retourner votre commande
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {conditions.map((condition, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow">
                        <span className="text-xl">{condition.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {condition.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {condition.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="flex items-center text-gray-700"
                        >
                          <svg
                            className="w-4 h-4 text-primary-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-xl">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-primary-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-primary-700 font-medium">
                    Les frais de retour sont à votre charge, sauf en cas
                    d'erreur de notre part ou de produit défectueux.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Remboursements</h3>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <h4 className="font-semibold mb-2">Délai de traitement</h4>
                <p className="text-primary-100">
                  5-10 jours ouvrables après réception du retour
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <h4 className="font-semibold mb-2">Mode de remboursement</h4>
                <p className="text-primary-100">
                  Sur le moyen de paiement original
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <h4 className="font-semibold mb-2">Frais déduits</h4>
                <p className="text-primary-100">
                  Frais de livraison initiaux non remboursés
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-primary-100 text-sm">
                Pour toute question concernant votre remboursement, contactez
                notre service client.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Processus de retour en 4 étapes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <span className="text-4xl font-bold text-primary-100">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-200 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
