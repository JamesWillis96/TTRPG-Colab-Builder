# The Loom

A collaborative worldbuilding and session management web application for West Marches style TTRPG campaigns, with primary support for Daggerheart.

## 🎲 Project Overview

This project aims to create a web-based platform where players can:
- Manage flexible session scheduling and attendance for West Marches style play
- Collaboratively build and document a shared game world
- Track characters, sessions, and campaign progress
- Create and explore locations, NPCs, quests, and lore together

## 🎯 Core Features (Planned)

### Phase 1: Session & Player Management
- [ ] User authentication and player profiles
- [ ] Session creation and signup system
- [ ] Player availability tracking
- [ ] Session history and reports
- [ ] GM dashboard

### Phase 2: Collaborative Worldbuilding
- [ ] Interactive world map
- [ ] Wiki-style location and lore pages
- [ ] NPC database
- [ ] Quest/rumor board
- [ ] Contribution tracking

### Phase 3: Daggerheart Integration
- [ ] Character sheet management
- [ ] Experience and progression tracking
- [ ] Armor/Hope/Fear mechanics
- [ ] Downtime activities

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (React-based full-stack framework)
- **Language**: TypeScript/JavaScript
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed ([Download here](https://nodejs.org/))
- Git installed
- A code editor (VS Code recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JamesWillis96/The-Loom.git
cd The-Loom
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📚 Learning Resources

New to web development? Check out these guides in the `/docs` folder:
- `00-SETUP-GUIDE.md` - Getting your development environment ready
- `01-JAVASCRIPT-BASICS.md` - JavaScript fundamentals
- `02-REACT-INTRO.md` - Introduction to React
- `03-NEXTJS-BASICS.md` - Understanding Next.js
- `04-DATABASE-PRIMER.md` - Working with databases

## 📁 Project Structure

```
The Loom/
├── app/                    # Next.js app directory (pages & routes)
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── public/                 # Static assets (images, icons)
├── docs/                   # Learning guides and documentation
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 🗺️ Project Roadmap

Check the [Issues](https://github.com/JamesWillis96/The-Loom/issues) tab for the detailed development roadmap and current tasks.

## 🤝 Contributing

This is currently a personal learning project, but suggestions and ideas are welcome!

## 📄 License

MIT License - feel free to use this for your own campaigns!

---

**Campaign System**: Daggerheart  
**Play Style**: West Marches  
**Status**: In Development 🚧