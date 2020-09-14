let express = require("express");
let router = express.Router();
let Poll = require("../models/poll");
let User = require("../models/user");

// Homepage
router.get("/", function(req, res) {
  Poll.find().exec(function(err, data) {
    if (err) throw err;

    let titles = [];
    for (let obj in data) {
      titles.push({"title": data[obj].title, id:data[obj]._id});
    }
    res.render("index", {
      titles: titles
    });
  });
});

module.exports = router;
