//console.log(process.env.TIMES);
// Import Admin SDK
var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
    }),
    databaseURL: "https://" + process.env.FIREBASE_DATABASE_NAME + ".firebaseio.com"
});

// Get a database reference to our tasks
var db = admin.database();
var ref = db.ref(process.env.FIREBASE_DB_REF);

// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
    console.log(snapshot.val());
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});
