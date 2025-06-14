const { initializeApp, cert } = require('firebase-admin/app');

const serviceAccount = require('./.local/webapp-e9b8f-firebase-adminsdk-pg9pq-9b2fe1395a.json');

initializeApp({
  credential: cert(serviceAccount)
});

exports.postsController = require('./posts');
exports.userController = require('./users');
