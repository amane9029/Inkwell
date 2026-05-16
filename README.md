# Inkwell

Inkwell is a modern AI-powered writing and content creation platform built for immersive storytelling, drafting, and interactive content workflows.

Designed with a polished modern UI, rich text editing, and AI integration, Inkwell focuses on making writing feel fluid, creative, and engaging rather than static.

## Features

- Rich text editing powered by TipTap
- AI-assisted content workflows via InsForge SDK
- Interactive and animated modern UI
- Responsive layout for desktop and mobile
- Smooth transitions and motion interactions using Framer Motion
- Dynamic particle-based visual effects
- Modern App Router architecture with Next.js 16
- Type-safe codebase using TypeScript

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React

### Editor & Content
- TipTap Editor
- TipTap Starter Kit
- TipTap Image Extension

### AI / Integrations
- InsForge SDK
- InsForge Next.js Integration

### UI / Effects
- tsParticles

## Project Structure

```bash
Inkwell/
├── app/               # Next.js app router pages
├── components/        # Reusable UI components
├── lib/               # Utility functions / integrations
├── public/            # Static assets
├── styles/            # Styling configuration
└── package.json
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 18+
- npm / pnpm / yarn / bun

### Installation

Clone the repository:

```bash
git clone https://github.com/amane9029/Inkwell.git
```

Move into the project:

```bash
cd Inkwell
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file if required for AI integrations:

```env
INSFORGE_API_KEY=your_key_here
```

(Add any additional environment variables depending on your setup.)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run lint checks
```

## Design Philosophy

Inkwell is built around the idea that writing tools should feel inspiring, fast, and intelligent.

Instead of traditional static editors, the goal is to combine:

- clean interface design
- expressive interactions
- AI-enhanced workflows
- immersive writing experiences

## Roadmap

Planned improvements:

- document persistence
- export functionality
- collaboration support
- richer AI writing assistance
- templates / writing modes
- user authentication
- publishing workflows

## Author

Built by Amane
