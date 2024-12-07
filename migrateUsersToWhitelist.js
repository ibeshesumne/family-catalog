const admin = require("firebase-admin");

// Replace with the absolute path to your downloaded service account key
const serviceAccount = require("C:\\Users\\ml\\project\\family-catalog\\family-catalog-firebase-adminsdk-r4r0r-78bf8453d7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://family-catalog-default-rtdb.europe-west1.firebasedatabase.app", // Replace with your Firebase project database URL
});

async function migrateUsersToWhitelist() {
  try {
    const db = admin.database();
    const whitelistRef = db.ref("whitelistedEmails");

    // Fetch all users
    const listUsersResult = await admin.auth().listUsers();
    listUsersResult.users.forEach(async (userRecord) => {
      const email = userRecord.email;
      if (email) {
        const base64Email = Buffer.from(email).toString("base64");
        await whitelistRef.child(base64Email).set(true);
        console.log(`Added ${email} to the whitelist`);
      }
    });

    console.log("All users migrated to whitelist.");
  } catch (error) {
    console.error("Error migrating users:", error);
  }
}

migrateUsersToWhitelist();
