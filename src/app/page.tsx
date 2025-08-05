export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Purple Apps
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              A small dev team creating meaningful mobile apps
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apps"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
              >
                Explore Our Apps
              </a>
              <a
                href="/contact"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition duration-200"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured App Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our App</h2>
            <p className="text-lg text-gray-600">
              Discover CalmBridge - our mental health companion app
            </p>
          </div>
          
          <div className="flex justify-center">
            {/* CalmBridge App Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 max-w-md">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <img src="/myApps/CalmBridge/icon-512.jpg" alt="CalmBridge" className="w-24 h-24 rounded-2xl shadow-lg" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">CalmBridge</h3>
                <p className="text-gray-600 mb-4">
                  A self-paced companion app that promotes mental health awareness. Perfect for people who want to work on their own mental health skills or when someone is in need of guidance.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apps"
                className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200"
              >
                Learn More
              </a>
              <a
                href="/apps#beta-testing"
                className="inline-block bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition duration-200"
              >
                Join Beta Testing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About Purple Apps
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We are a small development team passionate about creating mobile applications that 
                make a positive impact on people's lives. We focus on quality over quantity, 
                ensuring each app we build serves a meaningful purpose.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Currently, we're proud to offer CalmBridge, our mental health companion app designed 
                to help users on their wellness journey at their own pace.
              </p>
              <a
                href="/contact"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200"
              >
                Work With Us
              </a>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-8 h-64 flex items-center justify-center">
              <div className="text-primary-600 text-8xl">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We believe technology should support mental health and wellbeing. 
            That's why we're committed to creating apps that help people take better care of themselves.
          </p>
        </div>
      </section>
    </div>
  )
}
