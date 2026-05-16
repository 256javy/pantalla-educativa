import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, doc, setDoc } from 'firebase/firestore';
import { SEED } from '../src/lib/seed-data';

// Use emulator if FIRESTORE_EMULATOR_HOST is set, otherwise default to localhost:8080
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
const [host, port] = emulatorHost.split(':');

const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'edudisplay-local.firebaseapp.com',
  projectId: 'edudisplay-local',
  storageBucket: 'edudisplay-local.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:demo',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, host, parseInt(port, 10));

async function seedDatabase() {
  console.log(`Seeding database to emulator at ${host}:${port}...`);

  const cardsRef = collection(db, 'cards');
  let count = 0;

  for (const cardData of SEED) {
    try {
      const cardId = cardData.refCode;
      const docRef = doc(cardsRef, cardId);
      await setDoc(docRef, {
        ...cardData,
        createdAt: new Date().toISOString(),
      });
      count++;
      console.log(`✓ Seeded card: ${cardData.refCode} (${cardData.title})`);
    } catch (error) {
      console.error(`✗ Error seeding card ${cardData.refCode}:`, error);
    }
  }

  console.log(`\nSeeding complete: ${count}/${SEED.length} cards added`);
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
