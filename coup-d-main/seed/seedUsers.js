import fs from "fs";
import admin from "firebase-admin";
import { faker } from "@faker-js/faker";
const serviceAccount = JSON.parse(fs.readFileSync("./seed/serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

const cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Nantes"];

// Génère une date de naissance (18–65 ans)
function generateBirthDate() {
  return faker.date.birthdate({ min: 18, max: 65, mode: "age" });
}

// Génère un username
function generateUsername(firstName, lastName) {
  const suffix = faker.number.int({ min: 10, max: 99 });
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}`;
}

async function createFakeUser() {
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const city = faker.helpers.arrayElement(cities);
  const birthDate = generateBirthDate();
  const username = generateUsername(firstname, lastname);

  // 1️⃣ Création Auth
  const userRecord = await auth.createUser({
    email: faker.internet.email({ firstname, lastname }),
    password: "Test1234!",
    displayName: `${firstname} ${lastname}`,
  });

  // 2️⃣ Création Firestore
  await db.collection("users").doc(userRecord.uid).set({
    firstname,
    lastname,
    city,
    dateOfBirth: admin.firestore.Timestamp.fromDate(birthDate),
    username,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return userRecord.uid;
}

async function seed(count = 50) {
  for (let i = 0; i < count; i++) {
    await createFakeUser();
    console.log(`User ${i + 1}/${count} créé`);
  }
}

seed(30)
  .then(() => {
    console.log("Seed terminé");
    process.exit(0);
  })
  .catch(console.error);
