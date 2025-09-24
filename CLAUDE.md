# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start development server (Vite)
npm run build        # TypeScript compilation + Vite production build
npm run preview      # Preview production build locally
npm run lint         # ESLint code analysis
```

### Build Architecture
The build process uses TypeScript compilation followed by Vite bundling with:
- Terser minification for production
- Manual chunking separating vendor libraries (React, React DOM, React Router)
- Output directory: `dist/`

## Project Architecture

### Core Tech Stack
- **React 19** with TypeScript
- **Vite 7** for build tooling and development
- **React Router DOM 7** for client-side routing
- **Tailwind CSS** for styling
- **React Helmet Async** for SEO management

### Application Structure

#### Single Page Application (SPA)
The app serves the same landing page component (`FormacaoCorretores`) on two routes:
- `/` - Root path
- `/quero-ser-um-corretor` - Marketing-specific URL

#### Component Architecture
```
src/
├── components/landing/    # All landing page sections as modular components
├── pages/                 # Page-level components
├── lib/                   # Utilities (SEO component)
└── router.tsx            # Route configuration
```

### Key Components

#### FormSection - Multi-Step Form
The `FormSection` component implements a 5-step form wizard with:
1. **Step 1**: Basic personal data (nome, whatsapp, nascimento, instagram)
2. **Step 2**: Personal information (relacionamento, family, religion, cities)
3. **Step 3**: Academic information (university enrollment details - conditional fields)
4. **Step 4**: Motivation questions (text areas)
5. **Step 5**: Professional assessment (12 multiple choice + 1 essay question)

**Form Architecture**:
- State management with useState for form data and current step
- Per-step validation with conditional field requirements
- Step-by-step navigation with back/forward controls
- Form submission simulation (currently console.log)

#### SEO Architecture
- Centralized SEO component in `lib/Seo.tsx`
- JSON-LD structured data for FAQ and Course schemas
- Default meta tags configured for the real estate training program
- Open Graph and Twitter Card support

#### Landing Page Sections
All sections are modular components in `components/landing/`:
- `HeroSection` - Main call-to-action area
- `BenefitsSection` - Program benefits
- `ContentSection` - What will be learned
- `TestimonialsSection` - Success stories
- `FormSection` - Multi-step registration form

### Production Configuration

#### Domain Configuration
- **Primary Domain**: famanegociosimobiliarios.com.br
- **Landing Page URL**: famanegociosimobiliarios.com.br/quero-ser-um-corretor
- **Server**: Nginx with SSL (Let's Encrypt)
- **Static Files**: Deployed to `/var/www/famanegociosimobiliarios.com.br/`

#### Build Optimization
- Vite configuration includes manual chunking for better caching
- Terser minification enabled
- Static assets with cache headers configured in Nginx
- SPA routing handled by `_redirects` (Netlify) and Nginx try_files

### Development Notes

#### Form Data Structure
The FormData interface contains 27 fields across 5 steps. Key patterns:
- Step 2 has conditional fields (religion name only required if follows religion)
- Step 3 has conditional university fields (only required if enrolled)
- Step 5 contains professional assessment questions

#### SEO Implementation
The application includes comprehensive SEO with:
- FAQ JSON-LD schema embedded in the page component
- Course JSON-LD schema for the training program
- Default meta tags optimized for the real estate training market

#### Deployment Process
1. Run `npm run build` to generate production files
2. Files are copied to `/var/www/famanegociosimobiliarios.com.br/`
3. Nginx serves the SPA with proper routing fallback
4. SSL certificate managed by Certbot with auto-renewal