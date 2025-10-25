 # Thynk Frontend

 This project is a Next.js application for Thynk, featuring a modular component architecture and organized page structure. Below you'll find instructions on how to use the components and pages in your development workflow.

 ## Table of Contents
 - [Project Structure](#project-structure)
 - [Getting Started](#getting-started)
 - [Components Usage](#components-usage)
 - [Pages Usage](#pages-usage)
 - [Custom Hooks & Context](#custom-hooks--context)
 - [Utilities](#utilities)

 ---

 ## Project Structure

 ```
 components.json
 src/
	 app/
		 client.ts
		 globals.css
		 layout.tsx
		 page.tsx
		 api/
			 markets/route.ts
	 components/
		 app-layout/
		 logos/
		 main/
			 hero/
			 market/
			 misc/
		 ui/
		 constant/
		 context/
		 hooks/
		 lib/
		 provider/
 ```

 - **src/app/**: Contains main application files, global styles, and API routes.
 - **src/components/**: Contains reusable UI and feature components, organized by domain.
 - **src/components/ui/**: Contains generic UI elements (Button, Card, Input, etc.).
 - **src/components/main/**: Contains feature-specific components (Market, Hero, Misc).
 - **src/components/context/**: React context providers.
 - **src/components/hooks/**: Custom React hooks.
 - **src/components/lib/**: Utility libraries and Supabase client.
 - **src/components/provider/**: Theme and global providers.

 ---

 ## Getting Started

 1. **Install dependencies:**
		```bash
		npm install
		```
 2. **Run the development server:**
		```bash
		npm run dev
		```
 3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

 ---

 ## Components Usage

 ### UI Components (`src/components/ui/`)
 - Import and use in your pages or other components:
	 ```tsx
	 import { Button } from '@/components/ui/button';
	 import { Card } from '@/components/ui/card';
	 // ...other UI components
	 ```
 - Props are documented in each component file. Most UI components are styled and composable.

 ### Main Components (`src/components/main/`)
 - **Market:**
	 - `market-navbar.tsx`, `market-page.tsx`, `market-sidebar.tsx`, etc.
	 - Used for building market-related pages and features.
	 - Example:
		 ```tsx
		 import MarketSidebar from '@/components/main/market/market-sidebar';
		 <MarketSidebar />
		 ```
 - **Hero:**
	 - `home.tsx` for homepage hero section.
 - **Misc:**
	 - Carousel, skeletons, sorters, etc.

 ### App Layout (`src/components/app-layout/`)
 - Provides the main layout structure for the app.
 - Example:
	 ```tsx
	 import AppLayout from '@/components/app-layout/app-layout';
	 <AppLayout>{children}</AppLayout>
	 ```

 ### Logos (`src/components/logos/`)
 - SVG and logo components for branding.

 ---

 ## Pages Usage

 - **src/app/page.tsx**: Main landing page.
 - **src/app/layout.tsx**: Root layout, wraps all pages.
 - **src/app/api/markets/route.ts**: API route for market data.

 To create a new page, add a file under `src/app/` and export a React component:
 ```tsx
 // src/app/new-page.tsx
 export default function NewPage() {
	 return <div>New Page Content</div>;
 }
 ```

 ---

 ## Custom Hooks & Context

 - **Hooks:**
	 - `use-toast.ts`: Toast notification hook.
	 - Usage:
		 ```tsx
		 import { useToast } from '@/components/hooks/use-toast';
		 const { toast } = useToast();
		 toast('Message');
		 ```
 - **Context:**
	 - `layout-context.tsx`: Provides layout state/context.
	 - Usage:
		 ```tsx
		 import { LayoutProvider } from '@/components/context/layout-context';
		 <LayoutProvider>{children}</LayoutProvider>
		 ```

 ---

 ## Utilities

 - **Supabase Client:**
	 - `lib/supabase-client.ts`: For database interactions.
 - **General Utilities:**
	 - `lib/utils.ts`: Helper functions.

 ---

 ## Contributing

 1. Fork the repository.
 2. Create a new branch (`git checkout -b feature-name`).
 3. Make your changes and commit them.
 4. Open a pull request.

 ---

 ## License

 This project is licensed under the MIT License.
