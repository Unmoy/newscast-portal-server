const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require("mongodb").MongoClient;
const port = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static("newsImage"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nexck.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const newsCollection = client.db("newsportal").collection("dailynews");
  console.log("Database Connected");
  // ROUTES

  app.post("/addnews", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const author = req.body.author;
    const description = req.body.description;
    const category = req.body.category;
    const newImg = file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    newsCollection
      .insertOne({ title, image, author, description, category })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  app.get("/shownews", (req, res) => {
    newsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/getNewsById/:id", (req, res) => {
    newsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, document) => {
        res.send(document[0]);
      });
  });
  app.get("/categories/", (req, res) => {
    if (req.query.category) {
      newsCollection
        .find({ category: req.query.category })
        .toArray((err, documents) => {
          res.send(documents);
        });
    } else if ((req.query.category = " ")) {
      newsCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    } else {
      newsCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    }
  });
});

app.listen(process.env.PORT || port);
