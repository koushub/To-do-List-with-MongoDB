const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://koushubhyadav:kH9TzVJlm4IMw9Zv@todolist.f5hrn0m.mongodb.net/?retryWrites=true&w=majority")

const uri = process.env.MONGODB_URI || '';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Your code here
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Do something"
});
const item2 = new Item({
  name: "Make water"
});
const item3 = new Item({
  name: "Exercise"
});

const defaultItems = [item1, item2, item3];

// Function to initialize default items
function initializeDefaultItems() {
  Item.insertMany(defaultItems)
    .then((docs) => {
      console.log('Default items inserted:', docs);
    })
    .catch((error) => {
      console.error('Error inserting default items:', error);
    });
}

// Check if default items need to be initialized
Item.find({})
  .then((foundItems) => {
    if (foundItems.length === 0) {
      initializeDefaultItems();
    }
  })
  .catch((error) => {
    console.error('Error checking for existing items:', error);
  });

app.get('/', function (req, res) {
  Item.find({})
    .then((foundItems) => {
      res.render('list', { listTitle: 'Today', newListItems: foundItems });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

app.post('/', function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  item.save();
  res.redirect('/');
});

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  Item.findByIdAndRemove(checkedItemId)
    .then((removedItem) => {
      if (removedItem) {
        console.log(`Item removed: ${removedItem}`);
      } else {
        console.log(`Item with _id ${itemIdToRemove} not found.`);
      }
      res.redirect('/');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

const PORT = process.env.PORT;

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});







