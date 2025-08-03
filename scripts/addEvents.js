import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, Timestamp } from 'firebase/firestore';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyCDYbrnPQan84ZmKJPZ5gZ2mbw-ccr3f9Q",
  authDomain: "pawsome-40415.firebaseapp.com",
  projectId: "pawsome-40415",
  storageBucket: "pawsome-40415.firebasestorage.app",
  messagingSenderId: "938394526676",
  appId: "1:938394526676:web:3efd64e20e92429ada6c41",
  measurementId: "G-QEDHK4B8PG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleEvents = [
  {
    title: 'Weekend Dog Walk in Central Park',
    description: 'Join us for a fun group walk with your furry friends! We\'ll meet at the main entrance and walk together. Great opportunity for dogs to socialize and owners to share experiences.',
    date: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    location: {
      city: 'New York',
      lat: 40.7829,
      lng: -73.9654
    },
    eventType: 'walk',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1',
    createdBy: 'system',
    createdAt: Timestamp.now()
  },
  {
    title: 'Pet Adoption Festival',
    description: 'Find your perfect companion! Multiple shelters will be present with dogs, cats, and other pets looking for forever homes. Free vet consultations available.',
    date: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    location: {
      city: 'New York',
      lat: 40.7128,
      lng: -74.0060
    },
    eventType: 'adoption',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97',
    createdBy: 'system',
    createdAt: Timestamp.now()
  },
  {
    title: 'Basic Puppy Training Workshop',
    description: 'Learn essential training techniques from professional trainers. Topics include basic commands, leash training, and addressing common behavioral issues.',
    date: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
    location: {
      city: 'New York',
      lat: 40.7614,
      lng: -73.9776
    },
    eventType: 'training',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
    createdBy: 'system',
    createdAt: Timestamp.now()
  },
  {
    title: 'Cat Adoption Day',
    description: 'Special adoption event focusing on cats and kittens. Meet various breeds, learn about cat care, and maybe find your new feline friend!',
    date: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)),
    location: {
      city: 'New York',
      lat: 40.7505,
      lng: -73.9934
    },
    eventType: 'adoption',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5',
    createdBy: 'system',
    createdAt: Timestamp.now()
  },
  {
    title: 'Advanced Dog Training Masterclass',
    description: 'Take your dog\'s training to the next level! This workshop covers advanced commands, agility basics, and problem-solving techniques.',
    date: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
    location: {
      city: 'New York',
      lat: 40.7505,
      lng: -73.9934
    },
    eventType: 'training',
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e',
    createdBy: 'system',
    createdAt: Timestamp.now()
  },
  {
    title: 'Beach Day with Dogs',
    description: 'Bring your dogs for a fun day at the beach! We\'ll have games, treats, and plenty of space for dogs to run and play.',
    date: Timestamp.fromDate(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)),
    location: {
      city: 'New York',
      lat: 40.5734,
      lng: -73.9851
    },
    eventType: 'walk',
    imageUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6',
    createdBy: 'system',
    createdAt: Timestamp.now()
  }
];

const addSampleEvents = async () => {
  console.log('Starting to add events...');
  console.log('Connected to Firebase project:', firebaseConfig.projectId);
  
  try {
    const eventsCollection = collection(db, 'events');
    console.log('Got reference to events collection');

    for (const event of sampleEvents) {
      try {
        console.log('Adding event:', event.title);
        const docRef = await addDoc(eventsCollection, event);
        console.log('Successfully added event:', event.title, 'with ID:', docRef.id);
      } catch (error) {
        console.error('Error adding event:', event.title, error);
      }
    }
  } catch (error) {
    console.error('Fatal error:', error);
  }
};

// Run the function
console.log('Script started');
addSampleEvents()
  .then(() => console.log('All events added successfully!'))
  .catch(error => console.error('Script failed:', error));
