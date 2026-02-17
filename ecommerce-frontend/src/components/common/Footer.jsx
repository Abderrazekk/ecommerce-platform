import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation("footer");
  const currentYear = new Date().getFullYear();

  // Support links - now includes About Us and Contact
  const supportLinks = [
    { name: t("support.helpFAQ"), path: "/help-faq" },
    { name: t("support.customerService"), path: "/customer-service" },
    { name: t("support.deliveryPayment"), path: "/delivery-payment" },
    { name: t("support.returnPolicy"), path: "/return-policy" },
    { name: t("support.aboutUs"), path: "/about" }, // Added
    { name: t("support.contact"), path: "/contact" }, // Added
  ];

  // Legal links
  const legalLinks = [
    { name: t("legal.termsConditions"), path: "/terms-conditions" },
    { name: t("legal.privacyPolicy"), path: "/privacy-policy" },
    { name: t("legal.legalNotice"), path: "/legal-notice" },
  ];

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Premium Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 shadow-lg"></div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Main content grid - Now 4 columns: Brand, Support, Legal, Contact */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
              {/* Premium Brand Column */}
              <div className="space-y-8">
                {/* Logo */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-4 group">
                    <div>
                      <h2 className="text-3xl font-bold text-white group-hover:text-primary-300 transition-colors">
                        {t("brand.name")}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {t("brand.tagline")}
                      </p>
                    </div>
                  </Link>
                </div>

                <p className="text-gray-300 text-base leading-relaxed">
                  {t("brand.description")}
                </p>

                {/* Premium Social Icons */}
                <div className="flex space-x-4 pt-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=61585767552922"
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 flex items-center justify-center text-gray-300 hover:text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/10 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-lg"
                    aria-label={t("social.facebook")}
                  >
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.instagram.com/shoppina_tn/"
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 flex items-center justify-center text-gray-300 hover:text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-lg"
                    aria-label={t("social.instagram")}
                  >
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.tiktok.com/@shoppina_tn?is_from_webapp=1&sender_device=pc"
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 flex items-center justify-center text-gray-300 hover:text-white hover:border-white hover:bg-gray-900/60 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-lg"
                    aria-label={t("social.tiktok")}
                  >
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Premium Support Column */}
              <div className="space-y-8">
                <div className="relative">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t("support.title")}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"></div>
                </div>
                <ul className="space-y-4">
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 group flex items-center text-base"
                      >
                        <span className="w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-500 group-hover:w-4 mr-3 transition-all duration-300 rounded-full"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Legal Column */}
              <div className="space-y-8">
                <div className="relative">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t("legal.title")}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"></div>
                </div>
                <ul className="space-y-4">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 group flex items-center text-base"
                      >
                        <span className="w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-500 group-hover:w-4 mr-3 transition-all duration-300 rounded-full"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Contact Column */}
              <div className="space-y-8">
                <div className="relative">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t("contact.title")}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"></div>
                </div>
                <div className="space-y-6 text-base text-gray-300">
                  <a
                    href="mailto:Contact@shoppina.com"
                    className="flex items-start group hover:text-white transition-all duration-300 hover:translate-x-2"
                  >
                    <span className="text-primary-400 mr-4 mt-1 text-xl">
                      ✉️
                    </span>
                    <span className="break-all hover:text-primary-300">
                      {t("contact.email")}
                    </span>
                  </a>
                  <a
                    href="tel:+21655999444"
                    className="flex items-center group hover:text-white transition-all duration-300 hover:translate-x-2"
                  >
                    <span className="text-primary-400 mr-4 text-xl">📞</span>
                    <span className="hover:text-primary-300">
                      {t("contact.phone")}
                    </span>
                  </a>
                  <div className="flex items-start group hover:translate-x-2 transition-all duration-300">
                    <span className="text-primary-400 mr-4 mt-1 text-xl">
                      📍
                    </span>
                    <span className="hover:text-primary-300">
                      {t("contact.address")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Divider */}
            <div className="my-16 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

            {/* Premium Bottom Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              <div className="text-gray-400">
                <p className="text-base">
                  {t("copyright", { year: currentYear })}
                </p>
                <p className="text-sm mt-2 text-gray-500">
                  All rights reserved
                </p>
              </div>

              <div className="flex items-center space-x-8">
                <Link
                  to="/terms-conditions"
                  className="text-gray-400 hover:text-white hover:scale-105 transition-all duration-300 text-base font-medium"
                >
                  {t("legal.termsConditions")}
                </Link>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white hover:scale-105 transition-all duration-300 text-base font-medium"
                >
                  {t("legal.privacyPolicy")}
                </Link>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <Link
                  to="/legal-notice"
                  className="text-gray-400 hover:text-white hover:scale-105 transition-all duration-300 text-base font-medium"
                >
                  {t("legal.legalNotice")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Premium Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-11 h-11 sm:w-12 sm:h-12 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-2xl shadow-primary-500/40 flex items-center justify-center text-white z-50 hover:shadow-3xl hover:shadow-primary-500/50 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-lg border-2 border-primary-500/30 hover:border-primary-400"
        aria-label={t("backToTop")}
      >
        <svg
          className="w-5 h-5 sm:w-5 sm:h-5 lg:w-5 lg:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </>
  );
};

export default Footer;
