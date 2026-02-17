import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files - English
import navbarEN from "../locales/en/navbar.json";
import footerEN from "../locales/en/footer.json";
import homeEN from "../locales/en/home.json";
import sponsorsEN from "../locales/en/sponsors.json";
import featuredEN from "../locales/en/featured.json";
import shopEN from "../locales/en/shop.json";
import commonEN from "../locales/en/common.json";
import authEN from "../locales/en/auth.json";
import checkoutEN from "../locales/en/checkout.json";
import cartEN from "../locales/en/cart.json";
import ordersEN from "../locales/en/orders.json";
import wishlistEN from "../locales/en/wishlist.json";
import productdetailsEN from "../locales/en/productdetails.json";

// Import translation files - French
import navbarFR from "../locales/fr/navbar.json";
import footerFR from "../locales/fr/footer.json";
import homeFR from "../locales/fr/home.json";
import sponsorsFR from "../locales/fr/sponsors.json";
import featuredFR from "../locales/fr/featured.json";
import shopFR from "../locales/fr/shop.json";
import commonFR from "../locales/fr/common.json";
import authFR from "../locales/fr/auth.json";
import checkoutFR from "../locales/fr/checkout.json";
import cartFR from "../locales/fr/cart.json";
import ordersFR from "../locales/fr/orders.json";
import wishlistFR from "../locales/fr/wishlist.json";
import productdetailsFR from "../locales/fr/productdetails.json";

// Import translation files - Arabic
import navbarAR from "../locales/ar/navbar.json";
import footerAR from "../locales/ar/footer.json";
import homeAR from "../locales/ar/home.json";
import sponsorsAR from "../locales/ar/sponsors.json";
import featuredAR from "../locales/ar/featured.json";
import shopAR from "../locales/ar/shop.json";
import commonAR from "../locales/ar/common.json";
import authAR from "../locales/ar/auth.json";
import checkoutAR from "../locales/ar/checkout.json";
import cartAR from "../locales/ar/cart.json";
import ordersAR from "../locales/ar/orders.json";
import wishlistAR from "../locales/ar/wishlist.json";
import productdetailsAR from "../locales/ar/productdetails.json";

// Function to set direction based on language
const setDirection = (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  document.documentElement.setAttribute("dir", dir);

  // Update body classes
  document.body.classList.remove("ltr", "rtl");
  document.body.classList.add(dir);

  // Store in localStorage
  localStorage.setItem("i18nextLng", lng);
  localStorage.setItem("direction", dir);
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        navbar: navbarEN,
        footer: footerEN,
        home: homeEN,
        sponsors: sponsorsEN,
        featured: featuredEN,
        shop: shopEN,
        common: commonEN,
        auth: authEN,
        checkout: checkoutEN,
        cart: cartEN,
        orders: ordersEN,
        wishlist: wishlistEN,
        productdetails: productdetailsEN
      },
      fr: {
        navbar: navbarFR,
        footer: footerFR,
        home: homeFR,
        sponsors: sponsorsFR,
        featured: featuredFR,
        shop: shopFR,
        common: commonFR,
        auth: authFR,
        checkout: checkoutFR,
        cart: cartFR,
        orders: ordersFR,
        wishlist: wishlistFR,
        productdetails: productdetailsFR
      },
      ar: {
        navbar: navbarAR,
        footer: footerAR,
        home: homeAR,
        sponsors: sponsorsAR,
        featured: featuredAR,
        shop: shopAR,
        common: commonAR,
        auth: authAR,
        checkout: checkoutAR,
        cart: cartAR,
        orders: ordersAR,
        wishlist: wishlistAR,
        productdetails: productdetailsAR
      },
    },
    fallbackLng: "en",
    defaultNS: "navbar",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
      lookupLocalStorage: "i18nextLng",
      lookupCookie: "i18next",
      htmlTag: document.documentElement,
    },
  });

// Set direction on initial load
const savedLanguage = localStorage.getItem("i18nextLng") || i18n.language;
setDirection(savedLanguage);

// Also set direction when language changes
i18n.on("languageChanged", (lng) => {
  setDirection(lng);
});

// Set direction when i18n is initialized
i18n.on("initialized", () => {
  const currentLang = i18n.language;
  setDirection(currentLang);
});

// Force direction on page load
window.addEventListener("load", () => {
  const savedLang = localStorage.getItem("i18nextLng") || i18n.language;
  if (savedLang === "ar") {
    setDirection("ar");
  }
});

export default i18n;
