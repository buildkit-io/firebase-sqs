var admin = require("firebase-admin");
var AWS = require('aws-sdk');

//set AWS region
AWS.config.update({region: process.env.AWS_REGION});

// init Firebase
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
    }),
    databaseURL: "https://" + process.env.FIREBASE_DATABASE_NAME + ".firebaseio.com"
});

// Get a database reference to our Firebase queue
var db = admin.database();
var ref = db.ref(process.env.FIREBASE_DB_REF);

// init SQS queue
var sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
});

// Attach an asynchronous callback to read the data from our queue
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
            ref.child(snapshot.key).remove(); // remove item from Firebase
        }
    });
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});
