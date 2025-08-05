export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Support Center</h1>
          <p className="text-lg text-black">
            Get help and find answers to common questions
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <a href="/support/faq" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black ml-3">FAQ</h3>
            </div>
            <p className="text-black">
              Find answers to frequently asked questions about our apps
            </p>
          </a>

          <a href="/contact" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black ml-3">Contact Support</h3>
            </div>
            <p className="text-black">
              Get direct help from our support team for technical issues
            </p>
          </a>

          <a href="/apps" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black ml-3">App Documentation</h3>
            </div>
            <p className="text-black">
              Learn about our apps, features, and how to use them effectively
            </p>
          </a>
        </div>

        {/* FAQ Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                How do I download and install your apps?
              </h3>
              <p className="text-black">
                You can download our apps from the App Store (iOS) or Google Play Store (Android). 
                Simply search for "Purple Apps" or the specific app name, then tap "Install" or "Get".
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                Are your apps free to use?
              </h3>
              <p className="text-black">
                Most of our apps offer a free version with basic features. Premium features are available 
                through in-app purchases or subscription plans. Check each app's description for specific pricing details.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                Which devices are supported?
              </h3>
              <p className="text-black">
                Our apps support iOS 12.0+ and Android 6.0+. For the best experience, we recommend 
                using the latest version of your device's operating system.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                How can I restore my purchases?
              </h3>
              <p className="text-black">
                If you've purchased premium features and need to restore them on a new device, 
                go to the app settings and tap "Restore Purchases". Make sure you're signed in 
                with the same Apple ID or Google account used for the original purchase.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                How do I report a bug or request a feature?
              </h3>
              <p className="text-black">
                You can report bugs or request features by contacting us through the app's feedback 
                option or by sending an email to our support team. We value your feedback and 
                continuously work to improve our apps.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            Still Need Help?
          </h2>
          <p className="text-black mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200"
            >
              Contact Support
            </a>
            <a
              href="mailto:apps.ads.dev@gmail.com"
              className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition duration-200"
            >
              Email Us
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
