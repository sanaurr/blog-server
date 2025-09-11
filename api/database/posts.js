const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

exports.getAll = async (category) => {
  const posts = [];
  if (category == null || category == undefined || category == '') {
    return [];
  }
  if (category !== 'All') {
    const querySnapshot = await db.collection('posts').where('category', '==', category).get();
     querySnapshot.forEach((doc) => {
       posts.push({ ...doc.data(), id: doc.id });
     });
     return posts;
  }
  const querySnapshot = await db.collection('posts').get();
  querySnapshot.forEach((doc) => {
    posts.push({ ...doc.data(), id: doc.id });
  });
  return posts;
}
exports.create = async (post) => {
  const date = new Date().getTime();
  await db.collection('posts').add({...post, date});
}
exports.getById = async (id) => {
  const post = await db.collection('posts').doc(id).get();
  return post.data();
}

exports.getByUserId = async (userId) => {
  const posts = [];
  const querySnapshot = await db.collection('posts').where('authorid', '==', userId).get();
  querySnapshot.forEach((doc) => {
    posts.push({ ...doc.data(), id: doc.id });
  });
  console.log(posts);
  return posts;
}

exports.getLatestPosts = async (limit) => {
  const posts = [];
  const querySnapshot = await db.collection('posts').orderBy('date', 'desc').limit(limit).get();
  querySnapshot.forEach((doc) => {
    posts.push({ ...doc.data(), id: doc.id });
  });
  return posts;
}

exports.edit = async (id, post) => {
  const date = new Date().getTime();
  await db.collection('posts').doc(id).set({...post, date});
}

exports.delete = async (id) => {
  await db.collection('posts').doc(id).delete();
}