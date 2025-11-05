const admin = require('firebase-admin');
const serviceAccount = require('./promptifyai-6j2zl-firebase-adminsdk-fbsvc-d667afb62b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin; 