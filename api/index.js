const express = require('express');
const { postsController, userController } = require('./database');
const multer = require('multer');
const cors = require('cors');
const { generateToken, verifyToken } = require('./token');
const server = express();

const port = 3005;

const upload = multer();

const router = express.Router();


server.use(cors());
router.use(cors());


router.post('/posts/', verifyToken, async (req, res) => {
    const post = req.body;
    console.log(req.header);
    console.log(req.body, 'body');
    await postsController.create(post);
    res.json("Post created successfully");
});


router.get('/posts/', async (req, res) => {
    const posts = await postsController.getAll();
    console.log(posts, 'all posts');
    
    res.json(await postsController.getAll());
});


router.get('/posts/:id', async (req, res) => {
    const post = await postsController.getById(req.params.id);

    res.json(post);
});

router.put('/posts/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const post = req.body;
    await postsController.edit(id, post);
    res.json("Post updated successfully");
});


router.delete('/posts/:id', async (req, res) => {
    const id = req.params.id;
    await postsController.delete(id);
    res.json("Post deleted successfully");
});

router.get('/users/', async (req, res) => {
    res.json(await userController.getAll());
});

router.get('/users/:id', async (req, res) => {
    const user = await userController.getById(req.params.id);
    res.json(user);
});

router.post('/users/', async (req, res) => {
    const user = req.body;
    const data = await userController.create(user);
    if (data != null && data != undefined) {
        const obj = await data.get();
        const user = { ...obj.data(), id: obj.id };
        console.log('user from api', user);
        const payloadAccess = {
            type: 'access',
            name: user.name,
            email: user.email,
            id: user.id
        }
        const payloadRefresh = {
            type: 'refresh',
            name: user.name,
            email: user.email,
            id: user.id
        }
        const accessToken = generateToken(payloadAccess, '15m');
        const refreshToken = generateToken(payloadRefresh, '15d');
        console.log(accessToken, refreshToken);
        res.json({ accessToken, refreshToken });
    } else {
        console.log("User already exists");
    }

});

router.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const user = req.body;
    await userController.edit(id, user);
    res.json("User updated successfully");
});

router.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    await userController.delete(id);
    res.json("User deleted successfully");
});

// router.post('/signup', async (req, res) => {
//     const user = req.body;
//     await userController.signUp(user.email, user.password);

//     res.json("User created successfully");
// });

router.post('/login', async (req, res) => {
    const userCred = req.body;
    try {
        const user = await userController.signIn(userCred.email, userCred.password);
        if (user != null && user != undefined) {
            const payloadAccess = {
                type: 'access',
                name: user.name,
                email: user.email,
                id: user.id
            }
            const payloadRefresh = {
                type: 'refresh',
                name: user.name,
                email: user.email,
                id: user.id
            }
            const accessToken = generateToken(payloadAccess, '1d');
            const refreshToken = generateToken(payloadRefresh, '15d');
            res.json({ accessToken, refreshToken, });
        } else {
            res.json("User does not exist");
        }
    } catch (error) {
        res.json(error);
    }
});

router.post('/refresh', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    try {
        const payload = verifyToken(refreshToken, '15d');
        const user = await userController.getById(payload.id);
        if (user != null && user != undefined) {
            const payloadAccess = {
                type: 'access',
                name: user.name,
                email: user.email,
                id: user.id
            }
            const accessToken = generateToken(payloadAccess, '15m');
            res.json({ accessToken });
        } else {
            res.json("User does not exist");
        }
    } catch (error) {
        res.json(error);
    }
});

server.use('/', upload.none(), router);

server.get('/', (req, res) => {
    res.json('Hello World');
});

// server.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
// });
module.exports = server;