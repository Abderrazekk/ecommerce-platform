const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              E-Shop
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your one-stop shop for all your needs. Quality products at affordable prices.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-500 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-pink-500 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-400 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></span>
            </h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Home
              </a></li>
              <li><a href="/shop" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Shop
              </a></li>
              <li><a href="/about" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>About Us
              </a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Contact
              </a></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-5 relative inline-block">
              Categories
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></span>
            </h4>
            <ul className="space-y-3">
              <li><a href="/shop?category=Electronics%20%26%20Gadgets" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Electronics
              </a></li>
              <li><a href="/shop?category=Fashion%20%26%20Apparel" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Fashion
              </a></li>
              <li><a href="/shop?category=Home%20%26%20Kitchen" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Home & Kitchen
              </a></li>
              <li><a href="/shop?category=Fitness%20%26%20Outdoors" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Fitness
              </a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-5 relative inline-block">
              Contact Info
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></span>
            </h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="mr-2 mt-1">📍</span>
                <span>123 Street, City, Country</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span>
                <a href="mailto:info@eshop.com" className="hover:text-blue-400 transition-colors">info@eshop.com</a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors">+1 234 567 8900</a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} E-Shop. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer