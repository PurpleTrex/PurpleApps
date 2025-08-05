export default function Apps() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CalmBridge</h1>
          <p className="text-lg text-gray-600">
            Your self-paced companion for mental health awareness
          </p>
        </div>

        {/* App Info Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* App Icon and Info */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <img src="/myApps/CalmBridge/icon-512.jpg" alt="CalmBridge" className="w-20 h-20 rounded-2xl shadow-lg mr-4" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">CalmBridge</h2>
                  <p className="text-gray-600">Mental Health Companion</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                CalmBridge is a self-paced companion app that promotes mental health awareness. 
                Perfect for people who want to work on their own mental health skills or when 
                someone is in need of guidance. We are so happy you are here and have taken the 
                steps to be a better version of you!
              </p>

              <div className="flex space-x-4 mb-6">
                <a
                  href="#"
                  className="flex-1 bg-black text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition duration-200"
                >
                  App Store
                </a>
                <a
                  href="#"
                  className="flex-1 bg-green-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
                >
                  Google Play
                </a>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  Self-paced mental health exercises
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  Guided wellness activities
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  Personal progress tracking
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  Mental health awareness resources
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  Safe and supportive environment
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">App Screenshots</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="/myApps/CalmBridge/screenShots/Screenshot_20250805_091247.png" 
              alt="CalmBridge Screenshot 1" 
              className="w-full h-auto"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="/myApps/CalmBridge/screenShots/Screenshot_20250805_091407.png" 
              alt="CalmBridge Screenshot 2" 
              className="w-full h-auto"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="/myApps/CalmBridge/screenShots/Screenshot_20250805_091422.png" 
              alt="CalmBridge Screenshot 3" 
              className="w-full h-auto"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="/myApps/CalmBridge/screenShots/Screenshot_20250805_091443.png" 
              alt="CalmBridge Screenshot 4" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
