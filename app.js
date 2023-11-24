const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 1. Creating a DB connection
mongoose.connect("mongodb://127.0.0.1:27017/blogData", {
  useNewUrlParser: true,
});

// 2. Creating a schema
const postSchema = mongoose.Schema({
  title: String,
  postText: String,
});

// 3. Creating an object using Schema
const Post = mongoose.model("Post", postSchema);

const post = new Post({
  title: "Pak vs India",
  postText:
    "Pakistan vs India match is going to be the most watched Cricket match ever.",
});

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhconcus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

var postArray = [];

//////////////////////////////////// Requests targeting all articles //////////////////////////////////////////////////
app
  .route("/post")
  .get(async function (req, res) {
    try {
      await getAllPosts();
      res.send(postArray);
    } catch (err) {
      res.send("Error occured while loading posts ===> " + err);
    }
  })
  .post(async function (req, res) {
    const postTitle = req.body.title;
    const postTextRead = req.body.postText;
    const newPost = new Post({
      title: postTitle,
      postText: postTextRead,
    });
    postArray.push(newPost);

    try {
      await newPost.save();
      res.send("Post has been uploaded successfully.");
    } catch (err) {
      res.send("Error faced while uploading this post ===> " + err);
    }
  })
  .delete(async function (req, res) {
    try {
      await Post.deleteMany();
      res.send("All posts has been deleted successfully.");
    } catch (err) {
      res.send("Error occured while deleting all posts ===> " + err);
    }
  });

//////////////////////////////////// Requests targeting a single article //////////////////////////////////////////////////
app
  .route("/posts/:posttitle")
  .get(async function (req, res) {
    var postTitle = _.lowerCase(req.params.posttitle);
    try {
      console.log("I am here.");
      const post = await Post.findOne({
        title: { $regex: new RegExp(postTitle, "i") },
      });
      res.send(post);
    } catch (err) {
      res.send("Error occured while loading this article ===> " + err);
    }
  })
  .put(async function (req, res) {
    var postTitle = _.lowerCase(req.params.posttitle);
    try {
      await Post.updateOne(
        {
          title: { $regex: new RegExp(postTitle, "i") },
        },
        { title: req.body.title, postText: req.body.postText },
        { overwrite: true },
        res.send("Post has been updated successfully.")
      );
    } catch (err) {
      res.send("Error faced while updating post....." + err);
    }
  })
  .patch(async function (req, res) {
    var postTitle = _.lowerCase(req.params.posttitle);
    try {
      await Post.updateOne(
        {
          title: { $regex: new RegExp(postTitle, "i") },
        },
        {
          $set: { postText: req.body.postText },
        },
        { overwrite: true },
        res.send("Post has been updated successfully.")
      );
    } catch (err) {
      res.send("Error faced while updating this post ===> " + err);
    }
  })
  .delete(async function (req, res) {
    var postTitle = _.lowerCase(req.params.posttitle);
    try {
      await Post.deleteOne({
        title: { $regex: new RegExp(postTitle, "i") },
      });
      res.send("Post has been deleted successfully");
    } catch (err) {
      res.send("Error occured while deleting this post ===> " + err);
    }
  });

app.get("/", async function (req, res) {
  await getAllPosts();
  //res.render("home", { posts: postArray });
  res.send(postArray);
});

app.get("/compose", function (req, res) {
  res.render("blog");
});

async function getAllPosts() {
  try {
    postArray = [];
    const posts = await Post.find({});
    posts.forEach((post) => {
      postArray.push(post);
      console.log(postArray.length);
    });
  } catch (err) {
    console.log("error loading posts ===> " + err);
  }
}

app.listen("3000", function () {
  console.log("App is running on port 3000...");
});
