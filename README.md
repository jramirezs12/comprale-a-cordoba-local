# Cómprale a Córdoba - Frontend

A React + **Next.js** web application connecting buyers with local businesses from the Córdoba department of Colombia. The platform showcases sellers, their products, and supports local commerce.

## Prerequisites

- **Node.js** >= 18

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

## Start (production)

```bash
npm start
```

## Environment Variables

No environment variables are required.

## Project Structure

```
src/
├── app/
│   ├── layout.js            # Root layout (imports global CSS)
│   ├── page.js              # Home page (/)
│   ├── home.css             # Home page styles
│   └── seller/
│       └── [id]/
│           └── page.js      # Seller detail page (/seller/:id)
├── components/
│   ├── Footer/              # Footer with sponsors
│   ├── Hero/                # Landing hero section
│   ├── HowItWorks/          # Step-by-step guide section
│   ├── Navbar/              # Floating glassmorphism navbar with segmented search
│   ├── SellerDetail/        # Seller detail component
│   ├── SellerSection/       # Seller cards carousel section
│   └── Stats/               # Impact statistics section
├── data/
│   └── mockData.js          # Mock sellers, stats and sponsors data
├── pages/
│   └── SellerDetailPage.css # Seller detail page styles (shared)
└── index.css                # Global CSS variables and base styles
public/
└── brand/
    └── inter.svg            # Inter Rapidísimo logo
```

