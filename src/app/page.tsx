import { BannerAd, ResponsiveAd } from '../components/AdSense';

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
                  href="https://testflight.apple.com/join/xaWunEjk"
                  className="flex-1 bg-black text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TestFlight (iOS)
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.purple.calm&hl=en-US&ah=3lHO3fcFuhft2S0ouYyGMGhfgWE&pli=1"
                  className="flex-1 bg-green-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
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

        {/* Ad Banner */}
        <div className="py-4 bg-gray-100 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BannerAd />
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

        {/* Beta Testing Section */}
        <div id="beta-testing" className="bg-primary-600 text-white py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Join CalmBridge Beta Testing</h3>
            <p className="text-xl text-primary-100 mb-8">
              <strong>iOS TestFlight is now available!</strong> Be among the first to experience new features and help us improve CalmBridge
            </p>
            
            <div className="bg-white rounded-lg p-8 text-gray-900 max-w-md mx-auto">
              <form action="https://formspree.io/f/myzpnnbo" method="POST" className="space-y-6">
                <input type="hidden" name="_subject" value="CalmBridge Beta Testing Signup" />
                
                <div>
                  <label htmlFor="beta-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="beta-email"
                    name="_replyto"
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Which platform are you interested in? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="platform"
                        value="iOS"
                        required
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">iOS (TestFlight)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="platform"
                        value="Android"
                        required
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Android (Google Play Beta)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="platform"
                        value="Both"
                        required
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Both iOS & Android</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="beta-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="beta-name"
                    name="name"
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="beta-feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    What interests you most about CalmBridge? (Optional)
                  </label>
                  <textarea
                    id="beta-feedback"
                    name="feedback"
                    rows={3}
                    placeholder="Tell us what drew you to CalmBridge..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition duration-200"
                >
                  Join Beta Testing
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We'll contact you when beta spots become available. Your email will only be used for beta testing communications.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
