# KPI Edge - Impact Tracking Platform

A comprehensive web application for tracking and managing Key Performance
Indicators (KPIs) in development projects, with a focus on community impact
measurement and organizational management.

## 🚀 Overview

KPI Edge is a modern, full-stack web application built with Next.js that enables
organizations to track participants, manage projects, monitor activities, and
generate detailed reports for development initiatives. The platform is
specifically designed for NGOs, development organizations, and community-based
projects operating in Uganda and East Africa.

## ✨ Key Features

### 📊 **Participant Management**

- Comprehensive participant registration and profile management
- Advanced filtering and search capabilities
- Bulk import from Excel/CSV files
- Demographics tracking and analytics
- Location-based participant mapping

### 🏢 **Organization Management**

- Multi-organization support with role-based access
- Organization clustering and hierarchy management
- Member management and assignments
- Custom organization profiles with acronyms

### 📈 **Project & Activity Tracking**

- Project lifecycle management
- Activity planning and monitoring
- Progress tracking and milestone management
- Resource allocation and budget tracking

### 🎯 **VSLA (Village Savings & Loan Associations)**

- VSLA group management and tracking
- Member savings and loan monitoring
- Financial performance analytics
- Group activity coordination

### 📋 **Training Management**

- Training program scheduling and management
- Participant enrollment and attendance tracking
- Skill development monitoring
- Certificate and completion tracking

### 📊 **Reporting & Analytics**

- Real-time dashboard with key metrics
- Visual analytics with charts and graphs
- Export capabilities for reports
- Custom filtering and data views

### 🎨 **Modern UI/UX**

- Responsive design for mobile and desktop
- Dark/light mode support with custom themes
- Accessible interface following modern standards
- Intuitive navigation with collapsible sidebar

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible headless components

### **Backend**

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and authorization
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database

### **Data & Analytics**

- **TanStack Query** - Server state management
- **Recharts** - Data visualization
- **React Hook Form** - Form management with validation
- **Zod** - Runtime type validation

### **Development Tools**

- **ESLint** - Code linting with custom rules
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **TypeScript** - Static type checking

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard features
│   └── api/               # API endpoints
├── components/            # Reusable UI components
│   └── ui/                # shadcn/ui components
├── features/              # Feature-based modules
│   ├── activities/        # Activity management
│   ├── auth/              # Authentication
│   ├── clusters/          # Cluster management
│   ├── dashboard/         # Dashboard components
│   ├── locations/         # Location services
│   ├── members/           # Member management
│   ├── organizations/     # Organization features
│   ├── participants/      # Participant management
│   ├── projects/          # Project tracking
│   ├── reports/           # Reporting system
│   ├── trainings/         # Training management
│   ├── users/             # User management
│   └── vslas/             # VSLA management
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── db/                # Database configuration
│   └── server/            # Server utilities
├── providers/             # React context providers
└── types/                 # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **PostgreSQL** database
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/martinkarugaba/ImpacTracker.git
   cd kpiedge
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file with:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/kpi_edge_db"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   # Add other required environment variables
   ```

4. **Set up the database**

   ```bash
   # Generate database schema
   pnpm db:generate

   # Push schema to database
   pnpm db:push
   ```

5. **Seed the database**

   ```bash
   # Seed location data for Uganda
   ./scripts/run-seed.sh

   # Or with direct database URL
   ./scripts/run-seed.sh "postgresql://username:password@localhost:5432/kpi_edge_db"
   ```

6. **Start the development server**

   ```bash
   pnpm dev
   ```

7. **Open your browser** Navigate to
   [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

### Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting errors
- `pnpm format` - Format code with Prettier
- `pnpm fix` - Run both linting and formatting
- `pnpm type-check` - Check TypeScript types

### Database

- `pnpm db:generate` - Generate Drizzle schema
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:seed` - Seed location data

## 🗄️ Database Seeding

The application includes comprehensive seeding scripts for Uganda location data:

```bash
# Seed all location data
./scripts/run-seed.sh

# Seed specific data types
./scripts/run-seed-districts.sh
./scripts/run-seed-municipalities.sh
./scripts/run-seed-cities.sh
./scripts/run-seed-subcounties.sh
```

Verify seeded data:

```bash
./scripts/test-urban-locations.sh
```

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Theme System** - Multiple theme options with dark/light mode
- **Sticky Navigation** - Context-aware headers with smooth navigation
- **Interactive Tables** - Advanced sorting, filtering, and pagination
- **Data Visualization** - Rich charts and analytics displays
- **Form Management** - Robust form validation and error handling

## 📊 Key Modules

### Participants

- Registration and profile management
- Advanced filtering by demographics, location, and organization
- Bulk import capabilities
- Visual analytics and reporting

### Organizations

- Multi-tier organization management
- Cluster-based grouping
- Member assignment and role management
- Performance tracking

### VSLAs

- Group formation and management
- Financial tracking and reporting
- Member savings and loan monitoring
- Activity coordination

### Projects & Activities

- Project lifecycle management
- Activity planning and execution
- Resource tracking
- Progress monitoring

## 🌍 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Or connect your GitHub repository to Vercel for automatic deployments
```

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code patterns
- Use TypeScript for all new code
- Ensure all tests pass
- Follow the component organization structure

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 👥 Team

**Martin Karugaba** - Project Lead & Developer

- GitHub: [@martinkarugaba](https://github.com/martinkarugaba)

## 🆘 Support

For support, please:

1. Check the existing documentation
2. Search through existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ for development organizations making a difference in communities
across Uganda and East Africa.**
