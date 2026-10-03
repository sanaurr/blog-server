const express = require("express");
const { postsController, userController } = require("./database");
const multer = require("multer");
const cors = require("cors");
const { generateToken, verifyToken } = require("./token");
const server = express();

const port = 3005;

const upload = multer();

const router = express.Router();

server.use(cors());
router.use(cors());
server.use(express.json());
router.use(express.json());

router.post("/posts/", verifyToken, async (req, res) => {
  const post = req.body;
  console.log(req.header);
  console.log(req.body, "body");
  await postsController.create(post);
  res.json("Post created successfully");
});

router.post("/assistant/generate", verifyToken, async (req, res) => {
    console.log(req.body,"ai body");
  const { topic, length, category } = req.body;

  const prompt = `Write a blog post about "${topic}".
1. Suggest a catchy blog TITLE.
2. Write the blog CONTENT (about ${length} words).
3. The blog should be in the category of "${category}".
4. content should be formatted using HTML tags.
5. Don't include the title and also <!DOCTYPE html> tag in the content body.
  Return in JSON format:
{
  "title": "...",
  "content": "..."
}`;
  const response = await postsController.generate(prompt);
      res.json(response);
    
});

router.post("/assistant/edit", verifyToken, async (req, res) => {
  console.log(req.body,"ai body");
  const { category, title, content, length, instruction } = req.body;
  const prompt = `You are an assistant that edits blog posts.  
Your task is to improve the given blog according to the user's instructions.

BLOG DETAILS:
- Current Title: "${title}"
- Current Content (HTML formatted): 
${content}

EDITING INSTRUCTIONS:
${instruction}

REQUIREMENTS:
1. Keep the blog in the category of "${category}".
2. Adjust the content length to be around ${length} words (if specified).
3. Ensure the content uses valid HTML tags.
4. Do not include title and also <!DOCTYPE html> or <html>/<body> tags in the content.
5. Edited item should be catchy and reflect the edits.
6. Edited Title shoult be at least 30 words long.
7. Only return JSON in the format below:

{
  "title": "edited title here",
  "content": "edited content here (HTML formatted)"
}`;
  const response = await postsController.generateEdit(prompt);
      res.json(response);
    
});

router.get("/posts/category/:category", async (req, res) => {
  const posts = await postsController.getAll(req.params.category);
//   console.log(posts, "all posts");

  res.json(posts);
});

router.get("/posts/user/:id", async (req, res) => {
  const posts = await postsController.getByUserId(req.params.id);
  res.json(posts);
});

router.get("/posts/latest/:limit", async (req, res) => {
  const limit = parseInt(req.params.limit);
  const posts = await postsController.getLatestPosts(limit);
  res.json(posts);
});

router.get("/posts/id/:id", async (req, res) => {
  const post = await postsController.getById(req.params.id);

  res.json(post);
});

router.put("/posts/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const post = req.body;
  console.log(post);
  console.log(id);
  const data = await postsController.edit(id, post);
  console.log(data);
  res.json("Post updated successfully");
});

router.delete("/posts/:id", async (req, res) => {
  const id = req.params.id;
  await postsController.delete(id);
  res.json("Post deleted successfully");
});

router.get("/users/", async (req, res) => {
  res.json(await userController.getAll());
});

router.get("/users/:id", async (req, res) => {
  const user = await userController.getById(req.params.id);
  res.json(user);
});

router.post("/users/", async (req, res) => {
  const user = req.body;
  const data = await userController.create(user);
  if (data != null && data != undefined) {
    const obj = await data.get();
    const user = { ...obj.data(), id: obj.id };
    console.log("user from api", user);
    const payloadAccess = {
      type: "access",
      name: user.name,
      email: user.email,
      id: user.id,
    };
    const payloadRefresh = {
      type: "refresh",
      name: user.name,
      email: user.email,
      id: user.id,
    };
    const accessToken = generateToken(payloadAccess, "15d");
    const refreshToken = generateToken(payloadRefresh, "30d");
    console.log(accessToken, refreshToken);
    res.json({ accessToken, refreshToken });
  } else {
    console.log("User already exists");
  }
});

router.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  await userController.edit(id, user);
  res.json("User updated successfully");
});

router.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  await userController.delete(id);
  res.json("User deleted successfully");
});
router.post("/login", async (req, res) => {
  const userCred = req.body;
  try {
    const user = await userController.signIn(userCred.email, userCred.password);
    if (user != null && user != undefined) {
      const payloadAccess = {
        type: "access",
        name: user.name,
        email: user.email,
        id: user.id,
      };
      const payloadRefresh = {
        type: "refresh",
        name: user.name,
        email: user.email,
        id: user.id,
      };
      const accessToken = generateToken(payloadAccess, "15d");
      const refreshToken = generateToken(payloadRefresh, "30d");
      res.json({ accessToken, refreshToken });
    } else {
      res.json("User does not exist");
    }
  } catch (error) {
    res.json(error);
  }
});

router.post("/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  try {
    const payload = verifyToken(refreshToken, "15d");
    const user = await userController.getById(payload.id);
    if (user != null && user != undefined) {
      const payloadAccess = {
        type: "access",
        name: user.name,
        email: user.email,
        id: user.id,
      };
      const accessToken = generateToken(payloadAccess, "15d");
      res.json({ accessToken });
    } else {
      res.json("User does not exist");
    }
  } catch (error) {
    res.json(error);
  }
});

server.use("/", upload.none(), router);

server.get("/", (req, res) => {
  res.json("Hello World");
});

// server.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
// });
module.exports = server;
