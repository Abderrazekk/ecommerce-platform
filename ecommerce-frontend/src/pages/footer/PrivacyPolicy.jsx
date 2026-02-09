const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      content: "Nous prenons très au sérieux la protection de la vie privée de nos utilisateurs. La présente politique de confidentialité décrit les types d'informations que nous collectons et comment nous les utilisons. En utilisant notre site, vous acceptez les termes de cette politique.",
      icon: "👁️",
    },
    {
      title: "Les informations que nous collectons",
      content: "Nous collectons les informations que vous nous fournissez, telles que votre nom, votre adresse électronique et votre adresse postale. Nous collectons également des informations sur l'utilisation de notre site, telles que les pages que vous consultez et les liens sur lesquels vous cliquez, afin d'améliorer votre expérience.",
      icon: "📊",
    },
    {
      title: "Comment nous utilisons les informations collectées",
      content: "Nous utilisons les informations que nous collectons pour fournir nos services, pour communiquer avec vous et pour améliorer notre site. Nous pouvons également utiliser ces informations pour vous envoyer des offres promotionnelles et des informations sur nos produits et services, uniquement avec votre consentement.",
      icon: "🔄",
    },
    {
      title: "Comment nous protégeons les informations collectées",
      content: "Nous prenons des mesures de sécurité appropriées pour protéger les informations collectées contre la perte, l'utilisation abusive et l'accès non autorisé. Nous ne divulguons pas les informations collectées à des tiers, sauf dans les cas où cela est nécessaire pour fournir nos services ou si nous y sommes légalement obligés.",
      icon: "🔒",
    },
    {
      title: "Les cookies",
      content: "Nous utilisons des cookies pour collecter des informations sur l'utilisation de notre site. Les cookies sont des fichiers texte qui sont stockés sur votre ordinateur et qui nous permettent de reconnaître votre ordinateur lorsque vous visitez notre site ultérieurement. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.",
      icon: "🍪",
    },
    {
      title: "Vos droits",
      content: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition au traitement de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à l'adresse indiquée ci-dessous.",
      icon: "⚖️",
    },
    {
      title: "Modification de la politique de confidentialité",
      content: "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Si nous apportons des modifications importantes à cette politique, nous vous en informerons en publiant une notification sur notre site et, le cas échéant, par email.",
      icon: "📝",
    },
    {
      title: "Contactez-nous",
      content: "Si vous avez des questions ou des préoccupations concernant cette politique de confidentialité, ou si vous souhaitez exercer vos droits relatifs à vos données personnelles, n'hésitez pas à nous contacter à privacy@votresite.com.",
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
          <div className="mt-6 inline-flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow">
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Dernière mise à jour : 1er Janvier 2024</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Protection de vos données</h2>
                <p className="text-gray-600 mt-2">Nous nous engageons à respecter votre vie privée</p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white rounded-xl shadow flex items-center justify-center mr-4">
                    <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Contact Protection des Données</h4>
                    <p className="text-gray-600 text-sm">Délégué à la protection des données</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <a
                    href="mailto:dpo@votresite.com"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow hover:shadow-md"
                  >
                    Contacter notre DPO
                  </a>
                  <p className="text-gray-600 text-sm mt-2">Réponse sous 48 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <span>Document valide en :</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">France</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">UE</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Tunisie</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;