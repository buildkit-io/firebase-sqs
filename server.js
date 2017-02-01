//console.log(process.env.TIMES);
// Import Admin SDK
var admin = require("firebase-admin");
var AWS = require('aws-sdk');

AWS.config.update({region: process.env.AWS_REGION});

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

// SQS queue
var sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
});

// Attach an asynchronous callback to read the data at our posts reference
ref.on("child_added", function(snapshot) {
    console.log(snapshot.val());
    sqs.sendMessage({
        MessageGroupId: 'fifo', // currently we map 1 firebase task to 1 queue
        MessageDeduplicationId: snapshot.key, // firebase ID should be unique
        MessageBody: JSON.stringify(snapshot.val()),
        QueueUrl: process.env.AWS_SQS_QUEUE_URL
    }, function(err, data) {
        if (err) {
            console.log("Error", err);
        }
        else {
            console.log("Success", data.MessageId);
        }
    });
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});
