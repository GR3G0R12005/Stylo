import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve('firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function viewShop() {
  const shopId = 'kFUXAn2XZkT5c8ywTbb6kVAAZLD3';
  console.log(`Fetching shop details for ${shopId}...`);
  const docRef = doc(db, 'shops', shopId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Shop Data:", JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("Shop not found!");
  }
}

viewShop().catch(console.error);
