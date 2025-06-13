# B-TECH Notes Project

## Project info

This is a notes application for B-TECH students.

## Firebase Authentication Setup

This project uses Firebase for authentication. To set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication in your Firebase project and set up Email/Password and Google sign-in methods
3. Create a web app in your Firebase project to get your configuration
4. Create a `.env.local` file in the root directory with the following variables (see `src/env.example` for reference):

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

You can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase Authentication

## How can I deploy this project?

You can deploy this project using services like Vercel, Netlify, or Firebase Hosting.

For example, to deploy with Vercel:
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure your project settings
4. Deploy

## Can I connect a custom domain to my project?

Yes, you can!

Most deployment platforms like Vercel, Netlify, and Firebase Hosting allow you to connect custom domains to your projects. Check their documentation for specific instructions.
