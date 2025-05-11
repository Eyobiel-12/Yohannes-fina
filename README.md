# Yohannes Financial Management App

A comprehensive financial management application for Yohannes Hoveniersbedrijf B.V. Built with Next.js and Supabase.

## Features

- **Dashboard**: View key financial metrics and business overview
- **Client Management**: Manage client information and details
- **Project Management**: Track and organize projects
- **Invoice Generation**: Create, manage and send invoices
- **PDF Exports**: Generate professional PDF invoices
- **Company Settings**: Configure your business information for invoices

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)
- shadcn/ui Components

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see below)
4. Run the development server: `pnpm dev`

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

[MIT](LICENSE) 