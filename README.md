# Party Prep Checklist

A collaborative party planning checklist application that allows multiple users to coordinate party preparations in real-time.

## Features

- Interactive checklist with tasks organized by timeframes
- Real-time collaboration with Firebase
- Task and subtask support
- Progress tracking
- Shareable links for collaborators
- Responsive design for mobile and desktop

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Add a web app to your Firebase project
3. Enable Firestore Database
4. Enable Anonymous Authentication in the Authentication section
5. Copy your Firebase config values to `.env` file (use `.env.example` as a template)

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Firebase configuration (see `.env.example`)
4. Start the development server:
   ```
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

1. Push your code to GitHub 
2. Connect your GitHub repository to Vercel
3. Add the Firebase environment variables in Vercel project settings
4. Deploy!

## How Collaboration Works

- Each party checklist has a unique ID that's added to the URL
- When you share the link with collaborators, they'll see the same checklist
- All changes sync in real-time across all connected devices
- Create a new party with the "Create New Party" button
- Share your party with others using the "Share with Collaborators" button

## Technologies Used

- React
- TypeScript
- Firebase (Firestore & Authentication)
- Vercel for hosting

## License

MIT
