import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Purple Apps - Mobile App Development',
  description: 'Discover our collection of innovative mobile apps available on Google Play and iOS App Store. Professional app development services.',
  keywords: 'mobile apps, app development, iOS, Android, Google Play, App Store',
  authors: [{ name: 'Purple Apps' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm border-b">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <a href="/" className="flex items-center">
                  <img src="/websiteLogo/logo.png" alt="Purple Apps" className="h-8 w-auto mr-2" />
                  <span className="text-2xl font-bold text-primary-600">Purple Apps</span>
                </a>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="/" className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </a>
                  <a href="/apps" className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Apps
                  </a>
                  <a href="/support" className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Support
                  </a>
                  <a href="/contact" className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </header>
        
        <main>{children}</main>
        
        <footer className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1">
                <div className="flex items-center mb-4">
                  <img src="/websiteLogo/logo.png" alt="Purple Apps" className="h-6 w-auto mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Purple Apps</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Creating innovative mobile applications for iOS and Android platforms.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Apps</h4>
                <ul className="space-y-2">
                  <li><a href="/apps" className="text-gray-600 hover:text-primary-600 text-sm">All Apps</a></li>
                  <li><a href="/apps?platform=ios" className="text-gray-600 hover:text-primary-600 text-sm">iOS Apps</a></li>
                  <li><a href="/apps?platform=android" className="text-gray-600 hover:text-primary-600 text-sm">Android Apps</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Support</h4>
                <ul className="space-y-2">
                  <li><a href="/support" className="text-gray-600 hover:text-primary-600 text-sm">Help Center</a></li>
                  <li><a href="/support/faq" className="text-gray-600 hover:text-primary-600 text-sm">FAQ</a></li>
                  <li><a href="/contact" className="text-gray-600 hover:text-primary-600 text-sm">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="/privacy" className="text-gray-600 hover:text-primary-600 text-sm">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-600 hover:text-primary-600 text-sm">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-400 text-sm">
                © 2025 Purple Apps. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
