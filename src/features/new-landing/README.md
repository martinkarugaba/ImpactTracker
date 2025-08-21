# New Landing Page

This is a new landing page design for ImpactTrack, converted from HTML to React
components.

## Structure

- `page.tsx` - Main page component that orchestrates all sections
- `components/` - Individual React components
  - `Header.tsx` - Navigation header with logo and menu
  - `HeroSection.tsx` - Hero section with background image and call-to-action
  - `FeaturesSection.tsx` - Features grid section
  - `FeatureCard.tsx` - Individual feature card component
  - `TestimonialsSection.tsx` - Client testimonials with horizontal scroll
  - `DetailedFeaturesSection.tsx` - Expandable feature details
  - `PricingSection.tsx` - Pricing plans with three tiers
  - `FAQSection.tsx` - Frequently asked questions with expandable answers
  - `ContactSection.tsx` - Contact form with email input
  - `CTASection.tsx` - Call-to-action section for demo requests
  - `Footer.tsx` - Footer with links and copyright

## Usage

The new landing page is available at `/new-landing` route.

## Design Features

- Responsive design with container queries (`@container`)
- Modern UI with Tailwind CSS
- Optimized for mobile and desktop
- Clean component separation for maintainability

## Components

### Header

- Logo and brand name
- Navigation menu (Features, Pricing, Resources, Contact)
- "Get Started" call-to-action button

### Hero Section

- Background image with gradient overlay
- Main headline: "Track Your Impact, Amplify Your Mission"
- Subtitle explaining the platform
- Primary call-to-action button

### Features Section

- Grid layout of key features
- Each feature has an image, title, and description
- Features: Participant Tracking, Training Management, VSLA Monitoring

### Testimonials Section

- Horizontal scrollable testimonials
- Client feedback with images and quotes
- Three testimonial cards

### Detailed Features Section

- Expandable accordion-style feature details
- First item open by default
- Detailed descriptions of each feature

### Pricing Section

- Three pricing tiers: Basic (Free), Standard ($49), Premium ($99)
- Feature lists for each plan
- "Most Popular" badge on Standard plan
- Action buttons for each tier

### FAQ Section

- Expandable FAQ items
- First item open by default
- Common questions and answers

### Contact Section

- Email input field
- Submit button
- Simple contact form

### CTA Section

- Demo request call-to-action
- Centered layout with button

### Footer

- Privacy Policy, Terms of Service, Contact Us links
- Copyright notice
