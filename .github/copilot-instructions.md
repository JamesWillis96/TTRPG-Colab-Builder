# AI Coding Agent Instructions for The Loom

## Project Overview
The Loom is a collaborative worldbuilding and session management web application designed for West Marches style TTRPG campaigns, with a focus on supporting the Daggerheart system. The project is built using Next.js, TypeScript, and Supabase, and aims to provide tools for session scheduling, player management, and collaborative lore creation.

## Key Directories and Files
- **`app/`**: Contains Next.js pages and routes. Subdirectories represent different features (e.g., `login`, `map`, `wiki`). Dynamic routes are used for session and wiki management.
- **`components/`**: Reusable React components. Example: `NavBar.tsx` for navigation.
- **`contexts/`**: Context providers for global state management (e.g., `AuthContext.tsx` for authentication).
- **`lib/`**: Utility functions and configurations (e.g., `supabase.ts` for database interactions).
- **`public/`**: Static assets like images and icons.
- **`styles/`**: Global CSS styles.
- **`types/`**: TypeScript type definitions.

## Development Workflow
### Setting Up the Project
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/JamesWillis96/The-Loom.git
   cd The-Loom
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building and Testing
- **Build**: Run `npm run build` to create a production build.
- **Linting**: Use `npm run lint` to check for code quality issues.
- **Testing**: (Planned) Add unit and integration tests in the future.

## Project-Specific Conventions
- **Dynamic Routing**: The project uses dynamic routes extensively (e.g., `app/sessions/[id]/page.tsx` for session details).
- **Supabase Integration**: Database and authentication are managed via Supabase. See `lib/supabase.ts` for configuration.
- **Tailwind CSS**: Styling is handled using Tailwind. Refer to `app/globals.css` for global styles.
- **Context API**: Global state (e.g., authentication) is managed using React Context. Example: `contexts/AuthContext.tsx`.

## External Dependencies
- **Supabase**: Used for database and authentication.
- **Next.js**: Full-stack framework for React.
- **Tailwind CSS**: Utility-first CSS framework.

## Examples of Common Patterns
### Authentication
Authentication is handled via Supabase. Example usage:
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Dynamic Routing
Dynamic routes are used for sessions and wiki pages. Example:
- `app/sessions/[id]/page.tsx`: Displays session details.
- `app/wiki/[slug]/page.tsx`: Displays a wiki page.

## Planned Enhancements
- Add unit tests using Jest.
- Implement collaborative editing for wiki pages.
- Enhance the GM dashboard with analytics.

## Notes for AI Agents
- Follow the established folder structure and naming conventions.
- Use TypeScript for all new code.
- Ensure Supabase queries handle errors gracefully.
- Adhere to Tailwind CSS conventions for styling.

For questions or clarifications, refer to the [README.md](../README.md) or the `docs/` folder.