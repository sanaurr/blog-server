const { getFirestore } = require("firebase-admin/firestore");
const cheerio = require("cheerio");
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
// AIzaSyC3_puvN9lkvXHxiXI5pd4fmJVrn8Ry1Yw;
exports.generate = async (prompt , token) => {
  // Placeholder for AI generation logic  
  try {
     const response = await fetch(
       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "X-goog-api-key": "AIzaSyC3_puvN9lkvXHxiXI5pd4fmJVrn8Ry1Yw",
         },
         body: JSON.stringify({
           contents: [
             {
               parts: [{ text: prompt }],
             },
           ],
         }),
       }
     );

    const data = await response.json();
    console.log("✅ Gemini Response:", data);
    const blog = extractBlog(data);
    console.log("Generated Blog:", blog);
    blog.content = removeH1Tags(blog.content);
    console.log("Generated Blog:", blog);

    return blog;
    
  } catch (err) {
    console.error("Error generating text:", err);
  }
};
function extractBlog(rawResponse) {
  try {
    let text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Remove markdown code block wrappers if present
    text = text.replace(/```json|```/g, "").trim();

    // Clean up invalid control characters
    text = text.replace(/[\u0000-\u001F]+/g, "");

    // Sometimes Gemini returns “fancy quotes” → normalize
    text = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

    // Parse safely
    const parsed = JSON.parse(text);
    console.log("✅ Parsed Blog:", parsed);
    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse Gemini output:", err);
    console.log(
      "Raw text was:",
      rawResponse.candidates?.[0]?.content?.parts?.[0]?.text
    );
    return null;
  }
}

function removeH1Tags(htmlString) {
  if (!htmlString || htmlString.trim() === "") {
    return "";
  }

   const $ = cheerio.load(htmlString);

   // Completely remove <h1> and its contents
   $("h1").remove();

   // Return updated HTML string
   return $.html();
}