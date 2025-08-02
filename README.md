# 🐾 Pawsome - Pet Community Platform

A modern, responsive community platform for pet lovers built with React, TypeScript, and Firebase.

## 🌟 Live Demo

**🚀 [Visit Pawsome](https://pawsome-40415.web.app)**

## ✨ Features

### 📝 Community Posts
- Create and share posts with the community
- Image upload support with Firebase Storage
- Real-time comments and interactions
- Responsive card-based layout

### 🐾 Pet Adoption System
- Post pets available for adoption
- Interactive location mapping with OpenStreetMap
- Interested users tracking for pet owners
- Privacy-focused (no contact information sharing)
- Location-based pet discovery

### 📊 Community Polls
- Create polls with multiple options
- Image support for polls
- Date/time picker for precise expiration
- Real-time voting with progress visualization
- Poll management (close/delete for creators)
- Multiple selection support

### 💬 Universal Comments System
- Comments work across all content types (posts, adoptions, polls)
- Real-time comment updates
- User authentication integration
- Comment management (edit/delete)

### 🔒 Authentication & Security
- Firebase Authentication
- Google Sign-in integration
- Secure Firestore rules
- Protected routes
- User profile management

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Seamless experience across all devices
- Modern Material Design inspired UI

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing

### Backend & Database
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - Image and file storage
- **Firebase Hosting** - Static site hosting

### Maps & Location
- **OpenStreetMap** - Open-source mapping
- **Nominatim API** - Geocoding services

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pawsome
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

### Other Platforms
The built files in the `dist` folder can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## 📁 Project Structure

```
pawsome/
├── src/
│   ├── components/          # React components
│   │   ├── Navigation.tsx   # Main navigation
│   │   ├── PostCard.tsx     # Post display component
│   │   ├── AdoptionCard.tsx # Adoption post component
│   │   ├── PollCard.tsx     # Poll display component
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Posts feed
│   │   ├── AdoptionPage.tsx # Adoption listings
│   │   ├── PollPage.tsx     # Community polls
│   │   └── ...
│   ├── services/            # API services
│   │   ├── postService.ts   # Posts CRUD
│   │   ├── adoptionService.ts # Adoptions CRUD
│   │   ├── pollService.ts   # Polls CRUD
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── firebase/            # Firebase configuration
│   └── ...
├── public/                  # Static assets
├── firestore.rules         # Firestore security rules
├── firebase.json           # Firebase configuration
└── ...
```

## 🔒 Security Features

- Environment variables for sensitive data
- Firestore security rules
- Authentication-protected routes
- Input validation and sanitization
- Secure image upload handling

## 🌟 Key Features Explained

### Location Mapping
- Uses OpenStreetMap for pet location visualization
- Geocoding for address-to-coordinates conversion
- Interactive maps for better user experience

### Real-time Updates
- Live comment updates
- Real-time vote counting
- Instant content refresh

### Image Management
- Secure image upload to Firebase Storage
- Image optimization and validation
- Preview functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase team for the excellent backend services
- OpenStreetMap contributors for the mapping data
- React team for the amazing framework
- All pet lovers who inspire this project

## 📞 Support

For support, email [your-email] or create an issue in this repository.

---

Made with ❤️ for the pet community 🐕🐱
