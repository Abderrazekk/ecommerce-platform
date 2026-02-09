const HelpFAQ = () => {
  const faqs = [
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer:
        "Nous acceptons les paiements par carte de crédit (Visa, Mastercard, American Express), PayPal et virement bancaire.",
      category: "Paiement",
      icon: "💳",
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer:
        "Les délais de livraison varient en fonction de la destination et du mode de livraison choisi. Vous pouvez consulter les délais de livraison estimés lors du processus de commande.",
      category: "Livraison",
      icon: "🚚",
    },
    {
      question: "Comment suivre ma commande ?",
      answer:
        "Une fois votre commande expédiée, nous vous enverrons un email de confirmation contenant un lien de suivi. Vous pouvez également suivre l'état de votre commande en vous connectant à votre compte sur notre site.",
      category: "Commande",
      icon: "📦",
    },
    {
      question: "Puis-je annuler ma commande ?",
      answer:
        "Vous pouvez annuler votre commande avant l'expédition de celle-ci. Veuillez nous contacter par email ou téléphone pour annuler votre commande.",
      category: "Commande",
      icon: "❌",
    },
    {
      question: "Comment retourner un produit ?",
      answer:
        "Veuillez consulter notre politique de retour pour connaître les conditions et la procédure de retour. Vous avez 30 jours pour retourner un article non utilisé.",
      category: "Retour",
      icon: "🔄",
    },
    {
      question: "Comment contacter le service client ?",
      answer:
        "Vous pouvez nous contacter par email, téléphone ou via le formulaire de contact sur notre site. Nous nous efforçons de répondre à toutes les demandes dans les plus brefs délais.",
      category: "Support",
      icon: "📞",
    },
    {
      question: "Les produits sont-ils garantis ?",
      answer:
        "Tous nos produits sont garantis contre les défauts de fabrication pendant une année à compter de la date d'achat. Veuillez consulter notre politique de garantie pour plus d'informations.",
      category: "Garantie",
      icon: "🛡️",
    },
    {
      question: "Comment utiliser un code promo ?",
      answer:
        "Lors du processus de commande, vous pouvez entrer votre code promo dans la case prévue à cet effet. Le montant de la réduction sera automatiquement appliqué à votre commande.",
      category: "Promotions",
      icon: "🎁",
    },
    {
      question: "Comment créer un compte sur le site ?",
      answer:
        "Pour créer un compte, cliquez sur le bouton 'Créer un compte' en haut de la page d'accueil. Vous devrez fournir votre nom, votre adresse email et un mot de passe.",
      category: "Compte",
      icon: "👤",
    },
    {
      question: "Est-il possible de modifier une commande déjà passée ?",
      answer:
        "Si votre commande n'a pas encore été expédiée, vous pouvez nous contacter pour modifier votre commande. Si votre commande a déjà été expédiée, veuillez consulter notre politique de retour.",
      category: "Commande",
      icon: "✏️",
    },
  ];

  const categories = [
    { name: "Tous", count: faqs.length },
    { name: "Commande", count: faqs.filter(f => f.category === "Commande").length },
    { name: "Livraison", count: faqs.filter(f => f.category === "Livraison").length },
    { name: "Paiement", count: faqs.filter(f => f.category === "Paiement").length },
    { name: "Retour", count: faqs.filter(f => f.category === "Retour").length },
    { name: "Support", count: faqs.filter(f => f.category === "Support").length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">❓</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Centre d'aide & FAQ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Trouvez rapidement des réponses à vos questions les plus fréquentes
          </p>
          
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Rechercher une question..."
              className="w-full px-6 py-4 bg-white rounded-xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg className="absolute right-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                idx === 0
                  ? "bg-primary-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow hover:shadow-md"
              }`}
            >
              {category.name}
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                idx === 0 ? "bg-white text-primary-600" : "bg-gray-100 text-gray-600"
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-100 group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-100 transition-colors">
                  <span className="text-xl">{faq.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      {faq.category}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {faq.question}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-xl p-6 shadow-lg">
            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900">Vous n'avez pas trouvé votre réponse ?</h3>
              <p className="text-gray-600">Notre équipe de support est disponible pour vous aider personnellement</p>
            </div>
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;