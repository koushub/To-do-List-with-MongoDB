//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

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

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

Item.insertMany(defaultItems)
  .then((docs) => {
    console.log('Documents inserted:', docs);
  })
  .catch((error) => {
    console.error('Error inserting documents:', error);
  });

app.get("/", function (req, res) {

  // const day = date.getDate();
  // Removed the date object to simplify. It was listTitle: day
  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      }
      return foundItems;
    })
    .then(docs => {
      console.log('Documents inserted:', docs); // This will log the inserted documents, if any
      res.render("list", { listTitle: "Today", newListItems: docs });
    })
    .catch(error => {
      console.error('Error:', error); // This will log any errors that occur
    });

});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName.toLowerCase();;

  List.findOne({ name: customListName })
    .then(foundList => {
      if (foundList) {
        // The list with the specified name was found, and "foundList" contains the document.
        console.log("Found list:", foundList);
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      } else {
        // No list with the specified name was found. So create it
        console.log("List not found. Creating it rn");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
    })
    .catch(error => {
      console.error(error);
    });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then(foundList =>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(error => {
        console.error(error);
      });    
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(removedItem => {
      if (removedItem) {
        console.log(`Item removed: ${removedItem}`);
      } else {
        console.log(`Item with _id ${itemIdToRemove} not found.`);
      }
      res.redirect("/");
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  else
  {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(foundList => {
        if (foundList) {
          // The update was successful, and "foundList" contains the updated document.
          res.redirect("/" + listName);
        } else {
          // The list with the specified name was not found.
          console.log("List not found.");
        }
      })
      .catch(error => {
        console.error("There was an error:", error);
        // Handle the error here
      });
      // OLD METHOD - just callback is different now we use promises, everything else is same
      // List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      //   if(!err){
      //     res.redirect("/" + listName);
      //   }
      //   else {
      //     console.log("there was and error ",err);
      //   }
  }
  

});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});







