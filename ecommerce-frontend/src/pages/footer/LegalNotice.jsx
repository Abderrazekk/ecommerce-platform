const LegalNotice = () => {
  const sections = [
    {
      title: "Identification du site",
      content:
        "Ce site ecommerce est édité par Monsieur Benhadjmbarek Abderazek, dont le siège social est situé à kalaar el andalous, ariana.",
      icon: "🏢",
    },
    {
      title: "Numéro d'identification",
      content:
        "[RCS/ SIRET/ N° TVA/ NAF] : [numéro d'identification de l'entreprise].",
      icon: "📋",
    },
    {
      title: "Directeur de la publication",
      content:
        "[Nom et prénom du directeur de la publication], en qualité de [fonction du directeur de la publication], est responsable du contenu éditorial du site.",
      icon: "👨‍💼",
    },
    {
      title: "Propriété intellectuelle",
      content:
        "Le contenu du site (textes, images, vidéos, etc.) est protégé par le droit d'auteur et autres droits de propriété intellectuelle. Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, sans l'autorisation expresse et préalable de [nom de l'entreprise] est interdite.",
      icon: "⚖️",
    },
    {
      title: "Liens hypertextes",
      content:
        "Le site peut contenir des liens hypertextes vers d'autres sites web. Nous ne sommes pas responsables du contenu de ces sites ou des dommages qui pourraient résulter de leur utilisation.",
      icon: "🔗",
    },
    {
      title: "Limitation de responsabilité",
      content:
        "Nous déclinons toute responsabilité pour toute perte ou tout dommage résultant de l'utilisation de notre site ou de son contenu. Nous ne sommes pas responsables des erreurs ou des omissions dans le contenu de notre site. Nous ne garantissons pas que notre site sera exempt d'interruptions, d'erreurs ou de virus.",
      icon: "⚠️",
    },
    {
      title: "Loi applicable",
      content:
        "Les présentes mentions légales sont régies par les lois de la Tunisie. Tout litige découlant de l'utilisation de notre site sera soumis à la juridiction exclusive des tribunaux compétents de la Tunisie.",
      icon: "📜",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">⚖️</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Mentions Légales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Informations juridiques importantes concernant l'utilisation de
            notre site
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white rounded-xl shadow flex items-center justify-center mr-4">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations sur l'éditeur
                </h2>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <div key={index} className="group">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-100 transition-colors">
                      <span className="text-xl">{section.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                        {section.title}
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full mb-4"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-16">
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

export default LegalNotice;
