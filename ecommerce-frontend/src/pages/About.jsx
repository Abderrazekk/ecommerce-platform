import { Users, Shield, Truck, Award } from 'lucide-react'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Shoppina</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Your trusted destination for quality products and exceptional shopping experience since 2025.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2025, Shoppina began with a simple mission: to make quality products accessible to everyone at affordable prices. 
                  What started as a small online store has grown into a comprehensive e-commerce platform serving thousands of customers worldwide.
                </p>
                <p>
                  We believe that shopping should be easy, enjoyable, and accessible. That's why we've built a platform that brings together 
                  the best products from trusted suppliers, backed by excellent customer service and fast, reliable delivery.
                </p>
                <p>
                  Our team is passionate about creating a seamless shopping experience and building lasting relationships with our customers. 
                  We're constantly innovating and improving to serve you better.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Our Team"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer First</h3>
              <p className="text-gray-600">
                We put our customers at the heart of everything we do, ensuring their satisfaction is our top priority.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality & Trust</h3>
              <p className="text-gray-600">
                We carefully select and verify every product to ensure they meet our high standards of quality.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                We work with reliable partners to ensure your orders reach you quickly and safely.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect of our service, from product selection to customer support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About