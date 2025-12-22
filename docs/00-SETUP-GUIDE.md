# Setup Guide - Getting Your Development Environment Ready

Welcome! This guide will walk you through setting up everything you need to start building the TTRPG Colab Builder.

## Step 1: Install Node.js

Node.js is a JavaScript runtime that lets you run JavaScript on your computer (not just in browsers).

1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version
3. Run the installer
4. Verify installation by opening a terminal and typing:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers appear!

## Step 2: Install Git

Git helps you track changes to your code and sync with GitHub.

1. Go to https://git-scm.com/downloads
2. Download and install for your operating system
3. Verify installation:
   ```bash
   git --version
   ```

## Step 3: Install a Code Editor

I recommend **Visual Studio Code (VS Code)** - it's free and powerful!

1. Go to https://code.visualstudio.com/
2. Download and install
3. Recommended VS Code extensions:
   - **ES7+ React/Redux/React-Native snippets** - Code shortcuts
   - **Prettier** - Code formatter
   - **ESLint** - Code quality checker
   - **Tailwind CSS IntelliSense** - CSS help

## Step 4: Clone the Repository

Open a terminal and navigate to where you want the project:

```bash
# Clone the repo
git clone https://github.com/JamesWillis96/TTRPG-Colab-Builder.git

# Enter the project folder
cd TTRPG-Colab-Builder
```

## Step 5: Install Project Dependencies

This downloads all the code libraries the project needs:

```bash
npm install
```

This might take a few minutes. Don't worry if you see lots of text scrolling by!

## Step 6: Set Up Environment Variables

Environment variables store sensitive information (like API keys) that shouldn't be in your code.

```bash
# Copy the example file
cp .env.example .env.local
```

For now, we'll leave the placeholder values. We'll fill these in later when we set up the database.

## Step 7: Start the Development Server

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 8: Open the App

Open your browser and go to: http://localhost:3000

You should see the Next.js welcome page! 🎉

## Troubleshooting

### "Command not found" errors
- Make sure you've installed Node.js and Git
- Try closing and reopening your terminal

### Port 3000 already in use
- Something else is using that port
- Stop other dev servers or use: `npm run dev -- -p 3001`

### Permission errors on Mac/Linux
- You might need to use `sudo` for some commands
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

## Next Steps

Once you have everything running:
1. Read `01-JAVASCRIPT-BASICS.md` for JavaScript fundamentals
2. Explore the project structure
3. Start making small changes and see what happens!

**Remember**: Making mistakes is part of learning. If something breaks, you can always use Git to go back to a working version!

---

Need help? Create an issue on GitHub or check the Next.js documentation at https://nextjs.org/docs