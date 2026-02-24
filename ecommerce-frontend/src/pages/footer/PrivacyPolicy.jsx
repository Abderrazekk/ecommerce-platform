const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      content:
        "Nous attachons une grande importance à la protection de votre vie privée. Cette politique décrit les informations que nous collectons et comment nous les utilisons. En utilisant notre site, vous acceptez ces pratiques.",
      icon: "👁️",
    },
    {
      title: "Informations que nous collectons",
      content:
        "Nous collectons les informations que vous nous fournissez lors de la création de votre compte ou de vos commandes, telles que votre nom, email et adresse. Nous recueillons également des données sur l'utilisation du site (pages consultées, clics) pour améliorer votre expérience.",
      icon: "📊",
    },
    {
      title: "Utilisation des informations",
      content:
        "Les informations collectées sont utilisées pour traiter vos commandes, gérer votre compte, communiquer avec vous et améliorer nos services. Avec votre consentement, nous pouvons aussi vous envoyer des offres promotionnelles et informations sur nos produits.",
      icon: "🔄",
    },
    {
      title: "Protection des informations",
      content:
        "Nous mettons en place des mesures de sécurité adaptées pour protéger vos données contre la perte, l’accès non autorisé ou l’utilisation abusive. Nous ne partageons vos informations avec des tiers que lorsque cela est nécessaire pour fournir nos services ou si la loi nous y oblige.",
      icon: "🔒",
    },
    {
      title: "Cookies",
      content:
        "Nous utilisons des cookies pour analyser l’utilisation du site et améliorer votre expérience. Ces fichiers sont stockés sur votre appareil et vous pouvez les gérer via les paramètres de votre navigateur.",
      icon: "🍪",
    },
    {
      title: "Vos droits",
      content:
        "Conformément au RGPD, vous pouvez accéder, rectifier, supprimer ou limiter l’utilisation de vos données personnelles, et vous opposer à leur traitement. Pour exercer ces droits, contactez-nous à l'adresse indiquée ci-dessous.",
      icon: "⚖️",
    },
    {
      title: "Modification de la politique",
      content:
        "Nous pouvons mettre à jour cette politique à tout moment. Les changements importants seront signalés sur le site et, si nécessaire, par email.",
      icon: "📝",
    },
    {
      title: "Contact",
      content:
        "Pour toute question concernant cette politique ou l'exercice de vos droits sur vos données personnelles, contactez-nous à l'adresse : privacy@votresite.com.",
      icon: "📧",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comment nous protégeons et utilisons vos informations personnelles
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Protection de vos données
                </h2>
                <p className="text-gray-600 mt-2">
                  Nous nous engageons à respecter votre vie privée
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="font-semibold">Conforme RGPD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:border-primary-100 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-100 transition-colors">
                      <span className="text-xl">{section.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
