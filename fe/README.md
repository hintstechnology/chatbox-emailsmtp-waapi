# Chat System Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure API URL in `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5000`

## Build

To build for production:
```bash
npm run build
```

## Struktur Folder

```
fe/
├── src/
│   ├── admin/          # Admin pages
│   ├── components/     # React components
│   │   ├── ui/        # UI components (shadcn/ui)
│   │   └── ...
│   ├── utils/         # Utility functions
│   ├── styles/        # Global styles
│   ├── App.tsx        # Main App component
│   ├── main.tsx       # Entry point
│   └── ...
├── index.html
├── package.json
├── vite.config.ts
└── ...
```
