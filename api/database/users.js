const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

exports.create = async (user) => {
    const ref = db.collection('users');
    const result = ref.where('email', '==', user.email).get();
    if (result != null ) {
        return await ref.add(user);
    } else {
        return null;
    }
}


exports.getById = async (id) => {
    const user = await db.collection('users').doc(id).get();
    return user.data();
}

exports.getAll = async () => {
    const users = [];
    const querySnapshot = await db.collection('users').get();
    querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), id: doc.id });
    });
    return users;
}

exports.edit = async (id, user) => {
    await db.collection('users').doc(id).set(user);
}

exports.delete = async (id) => {
    await db.collection('users').doc(id).delete();
}

// exports.signUp = async (email, password) => {
//     let user = await db.collection('users').where('email', '==', email).get();
//     if (user.empty) {
//         await db.collection('users').set({ email, password });
//     } else {
//         throw new Error('User already exists');
//     }
// }

exports.signIn = async (email, password) => {
    let users = await db.collection('users').where('email', '==', email).get();
    if (users.empty) {
        throw new Error('User does not exist');
    } else if (users.docs.length > 1) {
        throw new Error('Multiple users found');
    } else {
        let user = users.docs[0].data();
        if (user.password === password) {

            return {...user, id: users.docs[0].id};
        } else {
            throw new Error('Wrong password');
        }
    }
}