# Purple Apps Website

A professional website for Purple Apps showcasing mobile applications for iOS and Android platforms. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, responsive design optimized for all devices
- **App Showcase**: Dedicated pages for displaying mobile app portfolio
- **Support Center**: Comprehensive help section with FAQ
- **Legal Pages**: Privacy policy and terms of service for app store compliance
- **Contact System**: Professional contact form and support resources
- **SEO Optimized**: Built for search engine visibility and app discovery

## 📱 Pages

- **Homepage**: Hero section, featured apps, company overview
- **Apps**: Complete app portfolio with filtering and store links
- **Support**: Help center with FAQ and troubleshooting guides
- **Privacy Policy**: Comprehensive privacy policy for app store requirements
- **Terms of Service**: Legal terms and conditions
- **Contact**: Contact form and support information

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment Ready**: Optimized for Vercel, Netlify, or any hosting platform

## 🏃‍♂️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🎨 Customization

### Update App Information
- Edit app details in `/src/app/apps/page.tsx`
- Replace placeholder app cards with your actual apps
- Update store links to point to your actual app store pages

### Branding
- Colors defined in `tailwind.config.ts` (primary purple theme)
- Update company name and branding throughout the site
- Replace placeholder content with your actual information

### Contact Information
- Update contact details in `/src/app/contact/page.tsx`
- Replace `devit.dev` email addresses with your actual contacts
- Update business hours and response times

### Legal Documents
- Customize privacy policy in `/src/app/privacy/page.tsx`
- Update terms of service in `/src/app/terms/page.tsx`
- Add your business address and legal jurisdiction

## 🌐 Domain Setup (devit.dev)

This website is designed for deployment at your devit.dev domain through Porkbun:

1. **DNS Configuration**: Point your domain to your hosting provider
2. **SSL Certificate**: Ensure HTTPS is enabled for security
3. **Domain Verification**: Complete any required domain verification steps

## 📋 App Store Requirements

This website includes all necessary components for app store compliance:

- ✅ Privacy Policy
- ✅ Terms of Service
- ✅ Contact Information
- ✅ Support Resources
- ✅ Professional Presentation

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Homepage
│   ├── apps/
│   │   └── page.tsx        # Apps showcase
│   ├── support/
│   │   └── page.tsx        # Support center
│   ├── privacy/
│   │   └── page.tsx        # Privacy policy
│   ├── terms/
│   │   └── page.tsx        # Terms of service
│   ├── contact/
│   │   └── page.tsx        # Contact page
│   └── globals.css         # Global styles
```

### Key Components
- Responsive navigation header
- Footer with site links
- App showcase cards
- Contact forms
- Legal document layouts

## 📄 License

This project is created for Purple Apps. Customize as needed for your business requirements.

## 🤝 Support

For questions about this website:
- Email: support@devit.dev
- Website: https://devit.dev

---

Built with ❤️ for Purple Apps mobile development
