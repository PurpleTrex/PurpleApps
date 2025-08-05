export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-black">
            Find answers to the most common questions about our apps
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black">App Usage</h3>
            <p className="text-black text-sm">Learn how to use our apps effectively</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black">Technical Issues</h3>
            <p className="text-black text-sm">Troubleshoot common problems</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black">Billing & Account</h3>
            <p className="text-black text-sm">Manage your account and purchases</p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {/* General Questions */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-black mb-6">General Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  What is CalmBridge?
                </h3>
                <p className="text-black leading-relaxed">
                  CalmBridge is a self-paced mental health companion app designed to promote mental health awareness. 
                  It's perfect for people who want to work on their own mental health skills or when someone is in 
                  need of guidance. The app provides tools, exercises, and resources to help users on their wellness journey.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  How do I download and install CalmBridge?
                </h3>
                <p className="text-black leading-relaxed">
                  You can download CalmBridge from the Google Play Store for Android devices. 
                  Simply search for "CalmBridge" or visit our apps page to find the direct download link. 
                  An iOS version is currently in development.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  Is CalmBridge free to use?
                </h3>
                <p className="text-black leading-relaxed">
                  CalmBridge offers both free and premium features. The basic version includes essential tools 
                  for mental health support, while premium features provide advanced exercises, personalized 
                  content, and additional resources for enhanced wellness support.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  What devices are supported?
                </h3>
                <p className="text-black leading-relaxed">
                  Currently, CalmBridge is available for Android devices running Android 6.0 (API level 23) or higher. 
                  An iOS version is in development and will be available soon. For the best experience, 
                  we recommend using a device with at least 2GB of RAM and the latest OS version.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Issues */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Technical Issues</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  The app crashes when I try to open it. What should I do?
                </h3>
                <p className="text-black leading-relaxed mb-3">
                  If CalmBridge crashes on startup, try these troubleshooting steps:
                </p>
                <ul className="list-disc list-inside text-black space-y-2 pl-4">
                  <li>Force close the app and restart it</li>
                  <li>Restart your device</li>
                  <li>Update the app to the latest version</li>
                  <li>Clear the app cache (Android Settings → Apps → CalmBridge → Storage → Clear Cache)</li>
                  <li>Ensure you have sufficient storage space on your device</li>
                </ul>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  I'm experiencing slow performance. How can I improve it?
                </h3>
                <p className="text-black leading-relaxed mb-3">
                  To improve app performance:
                </p>
                <ul className="list-disc list-inside text-black space-y-2 pl-4">
                  <li>Close other apps running in the background</li>
                  <li>Ensure your device has at least 1GB of free storage</li>
                  <li>Update your device's operating system</li>
                  <li>Restart your device regularly</li>
                  <li>Check your internet connection for online features</li>
                </ul>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  I can't access premium features I paid for. What's wrong?
                </h3>
                <p className="text-black leading-relaxed">
                  If you're unable to access premium features after purchase, try these steps:
                  1) Go to app settings and tap "Restore Purchases"
                  2) Ensure you're logged in with the same Google account used for purchase
                  3) Check your internet connection
                  4) If the problem persists, contact our support team with your purchase receipt.
                </p>
              </div>
            </div>
          </section>

          {/* Account & Billing */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Account & Billing</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  How do I cancel my premium subscription?
                </h3>
                <p className="text-black leading-relaxed">
                  To cancel your premium subscription, go to your Google Play Store account settings, 
                  find CalmBridge in your subscriptions, and select "Cancel subscription." 
                  You'll continue to have access to premium features until the end of your current billing period.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  Can I get a refund for my purchase?
                </h3>
                <p className="text-black leading-relaxed">
                  Refund policies follow Google Play Store guidelines. Generally, you can request a refund 
                  within 48 hours of purchase through the Play Store. For issues beyond this timeframe, 
                  please contact our support team and we'll do our best to help resolve your concern.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  How do I change my account information?
                </h3>
                <p className="text-black leading-relaxed">
                  Account information is managed through your Google account. To update your details, 
                  go to your Google account settings. Changes to your primary email or name will 
                  automatically sync with CalmBridge the next time you open the app.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Privacy & Security</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  How is my personal data protected?
                </h3>
                <p className="text-black leading-relaxed">
                  We take your privacy seriously. All personal data is encrypted and stored securely. 
                  We only collect data necessary for app functionality and never share personal information 
                  with third parties without your consent. Please review our Privacy Policy for complete details.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  Can I delete my account and data?
                </h3>
                <p className="text-black leading-relaxed">
                  Yes, you have the right to delete your account and all associated data. 
                  Contact our support team with your account details, and we'll permanently remove 
                  all your personal information from our systems within 30 days.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-black mb-3">
                  Do you share data with other apps or services?
                </h3>
                <p className="text-black leading-relaxed">
                  We do not share your personal wellness data with other apps or services. 
                  The only data sharing occurs for essential app functions like payment processing 
                  (handled securely by Google Play) and anonymous analytics to improve app performance.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Support */}
        <section className="bg-primary-50 rounded-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-black mb-4">
            Still Have Questions?
          </h2>
          <p className="text-black mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200"
            >
              Contact Support
            </a>
            <a
              href="/support"
              className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition duration-200"
            >
              Back to Support Center
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
