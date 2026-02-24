const HelpFAQ = () => {
  const faqs = [
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer:
        "Nous proposons actuellement le paiement à la livraison (Cash on Delivery). Vous payez votre commande directement au moment de la réception.",
      category: "Paiement",
      icon: "💳",
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer:
        "Les délais de livraison varient selon votre localisation. En général, la livraison s’effectue entre 2 et 3 jours ouvrables après la confirmation de la commande.",
      category: "Livraison",
      icon: "🚚",
    },
    {
      question: "Comment suivre ma commande ?",
      answer:
        "Vous pouvez suivre l’état de votre commande en vous connectant à votre compte dans la section “Mes Commandes”. Le statut (En attente, Confirmée, Expédiée, Livrée) est mis à jour en temps réel.",
      category: "Commande",
      icon: "📦",
    },
    {
      question: "Puis-je annuler ma commande ?",
      answer:
        "Oui, vous pouvez annuler votre commande tant qu’elle n’a pas encore été expédiée. Veuillez nous contacter rapidement via la page Contact ou par email.",
      category: "Commande",
      icon: "❌",
    },
    {
      question: "Comment retourner un produit ?",
      answer:
        "Si vous n’êtes pas satisfait, vous pouvez demander un retour dans un délai de 7 jours après réception. Le produit doit être non utilisé et dans son emballage d’origine. Consultez notre politique de retour pour plus de détails.",
      category: "Retour",
      icon: "🔄",
    },
    {
      question: "Comment contacter le service client ?",
      answer:
        "Vous pouvez nous contacter via : Le formulaire disponible sur la page Contact Email Notre équipe vous répondra dans les plus brefs délais.",
      category: "Support",
      icon: "📞",
    },
    {
      question: "Les produits sont-ils garantis ?",
      answer:
        "Nos produits sont garantis contre tout défaut de fabrication. Pour toute réclamation, veuillez contacter le service client avec votre numéro de commande.",
      category: "Garantie",
      icon: "🛡️",
    },
    {
      question: "Comment créer un compte sur le site ?",
      answer:
        "Cliquez sur “S’inscrire” en haut de la page. Vous devrez renseigner votre nom, votre email et créer un mot de passe. Une fois inscrit, vous pourrez gérer vos commandes, votre profil et votre liste de souhaits.",
      category: "Compte",
      icon: "👤",
    },
    {
      question: "Est-il possible de modifier une commande déjà passée ?",
      answer:
        "Si votre commande n’a pas encore été traitée, vous pouvez nous contacter pour effectuer une modification. Une fois expédiée, la modification ne sera plus possible, mais vous pourrez effectuer un retour selon notre politique.",
      category: "Commande",
      icon: "✏️",
    },
  ];

  const categories = [
    { name: "Tous", count: faqs.length },
    {
      name: "Commande",
      count: faqs.filter((f) => f.category === "Commande").length,
    },
    {
      name: "Livraison",
      count: faqs.filter((f) => f.category === "Livraison").length,
    },
    {
      name: "Paiement",
      count: faqs.filter((f) => f.category === "Paiement").length,
    },
    {
      name: "Retour",
      count: faqs.filter((f) => f.category === "Retour").length,
    },
    {
      name: "Support",
      count: faqs.filter((f) => f.category === "Support").length,
    },
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
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
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
      </div>
    </div>
  );
};

export default HelpFAQ;
