const TermsConditions = () => {
  const sections = [
    {
      title: "Introduction",
      content: "Les présentes conditions d'utilisation régissent l'accès et l'utilisation de notre site ecommerce. En utilisant notre site, vous acceptez ces conditions dans leur intégrité. Si vous n'êtes pas d'accord avec ces conditions, vous ne devez pas utiliser notre site.",
      icon: "📋",
    },
    {
      title: "Utilisation du site",
      content: "Vous êtes autorisé à utiliser notre site pour votre usage personnel et non commercial. Vous ne pouvez pas utiliser notre site à des fins illégales ou pour causer un préjudice à une personne ou une entreprise. Vous ne pouvez pas copier, modifier ou distribuer le contenu de notre site sans notre autorisation écrite.",
      icon: "💻",
    },
    {
      title: "Contenu du site",
      content: "Nous nous réservons le droit de modifier ou de supprimer tout contenu de notre site à tout moment, sans préavis. Nous ne garantissons pas l'exactitude, l'exhaustivité ou la pertinence de tout contenu présent sur notre site. Nous déclinons toute responsabilité pour toute perte ou tout dommage subi en raison de l'utilisation de notre site.",
      icon: "📄",
    },
    {
      title: "Propriété intellectuelle",
      content: "Notre site et son contenu sont protégés par les lois sur la propriété intellectuelle et les marques de commerce. Toute reproduction, distribution ou modification du contenu de notre site sans notre autorisation écrite est interdite.",
      icon: "⚖️",
    },
    {
      title: "Liens vers d'autres sites",
      content: "Notre site peut contenir des liens vers d'autres sites web. Nous ne sommes pas responsables du contenu de ces sites ou des dommages qui pourraient résulter de leur utilisation. L'accès à ces sites se fait à vos propres risques.",
      icon: "🔗",
    },
    {
      title: "Limitation de responsabilité",
      content: "Nous déclinons toute responsabilité pour toute perte ou tout dommage résultant de l'utilisation de notre site ou de son contenu. Nous ne sommes pas responsables des erreurs ou des omissions dans le contenu de notre site. Nous ne garantissons pas que notre site sera exempt d'interruptions, d'erreurs ou de virus.",
      icon: "⚠️",
    },
    {
      title: "Modification des conditions",
      content: "Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Votre utilisation continue de notre site après la modification de ces conditions constitue votre acceptation de ces modifications. Nous vous encourageons à consulter régulièrement cette page.",
      icon: "🔄",
    },
    {
      title: "Loi applicable",
      content: "Les présentes conditions d'utilisation sont régies par les lois de la Tunisie. Tout litige découlant de l'utilisation de notre site sera soumis à la juridiction exclusive des tribunaux compétents de la Tunisie.",
      icon: "🌍",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">📜</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Conditions d'Utilisation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Règles et conditions régissant l'utilisation de notre plateforme
          </p>
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow">
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Dernière mise à jour : 1er Janvier 2024</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-white rounded-xl shadow flex items-center justify-center mr-4">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Conditions Générales</h2>
                  <p className="text-gray-600">Veuillez lire attentivement ces conditions avant d'utiliser notre site</p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Version 2.1</p>
                  <p className="text-sm text-gray-500">Entrée en vigueur : 01/01/2024</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="mb-10 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                <div className="flex">
                  <svg className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Avertissement important</h3>
                    <p className="text-gray-700">
                      En créant un compte ou en passant une commande sur notre site, vous acceptez automatiquement 
                      l'ensemble de nos conditions d'utilisation. Ces conditions constituent un contrat légal entre 
                      vous et notre entreprise.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:border-primary-100 transition-all duration-300 hover:shadow-lg group"
                  >
                    <div className="flex items-center mb-4">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Questions sur nos conditions ?</h4>
                      <p className="text-gray-600 text-sm">Notre équipe juridique est à votre disposition</p>
                    </div>
                  </div>
                  <a
                    href="mailto:legal@votresite.com"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow hover:shadow-md"
                  >
                    Contact juridique
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Consultez également</h4>
              <p className="text-gray-600">Nos autres documents importants</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow hover:shadow-md">
                Mentions légales
              </button>
              <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow hover:shadow-md">
                Politique de confidentialité
              </button>
              <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow hover:shadow-md">
                Politique de cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;