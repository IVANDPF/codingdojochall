let express = require("express");
let router = express.Router();
let passport = require("passport");
let Poll = require("../models/poll");
let User = require("../models/user");
let mongoose = require("mongoose");

// New Poll page
router.get("/new",  function(req, res) {
  if (req.user) {
    res.render("new");
  }
  else {
    req.flash("error_msg", "You must be logged in order to create a poll");
    res.redirect("/users/login");
  }
});

// New poll
router.post("/new", function(req, res) {
  let title = req.body.title;
  let opts = req.body.options.split(";");


  opts = opts.map(function(option) {
    return option.trim();
  });

  let options = [];
  for (let i in opts) {
    options.push({"option": opts[i], "vote": 0});
  }

  let newPoll = new Poll({
    creator: req.user.id,
    title: title,
    options: options
  });

  Poll.createPoll(newPoll, function(err, poll) {
    if (err) throw err;
    console.log(poll);
  });

  req.flash("success_msg", "Your poll is created!");
  res.redirect("/");
});

// Remove poll by id
router.use("/remove", function(req, res) {
  let pollId = req.url.substring(1, req.url.length);

  if (!req.user || !mongoose.Types.ObjectId.isValid(pollId)) {
    res.render("action", {
      error_msg: "You must be logged in to perform this action"
    });
  }
  else{
    Poll.getPollById(pollId, function(err, poll) {

      if (err || !poll || !poll.creator) {
        res.redirect("/");
      }
      else {
        if (req.user._id == poll.creator) {
          Poll.removePollById(pollId, function(err, msg) {
            if (err) throw err;
            console.log(msg);
            res.render("action", {
              success_msg: "You poll has been removed"
            });
          });
        }
        else {
          res.render("action", {
            error_msg: "You are not authorized to perform this action"
          });
        }
      }


    });
  }

});

// Display a poll
router.use("/", function(req, res) {
  let pollId = req.url.substring(1, req.url.length);

  if (req.method === "GET") {

    Poll.getPollById(pollId, function(err, poll) {

      if (err || !poll) {
        res.redirect("/");
      }
      else {
        let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

        // poll information to render on html
        let pollInfo = {title: poll.title, options: poll.options, id: pollId, user: req.user, link: fullUrl};

        let voters = poll.voters;

        if (req.user) {
          for (let voter in voters) {
            if (voters[voter].voterId == req.user._id) {
              pollInfo.choice = voters[voter].choice;
            }
          }

          if (req.user._id == poll.creator) {
            pollInfo.creatorSession = true;
          }
        }

        // Plot Chartjs
        function getRandomColor() {
          let letters = 'ABCDEF0123456789'.split('');
          let color = '#';
          for (let i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }

        function getRandomColorEachEmployee(count) {
          let data =[];
          for (let i = 0; i < count; i++) {
              data.push(getRandomColor());
          }
          return data;
        }

        let colors = getRandomColorEachEmployee(pollInfo.options.length);

        let votes = [];
        let labels = [];
        for (let i = 0; i < poll.options.length; i++) {
          votes.push(poll.options[i].vote);
          labels.push(poll.options[i].option);
        }

        pollInfo.colors = colors;
        pollInfo.labels = labels;
        pollInfo.votes = votes;
        // Complete info Chartjs

        User.getUserById(poll.creator, function(err, user) {
          pollInfo.creator = user.name;

          res.render("poll", pollInfo);
        });
        console.log(pollInfo, 'pollInfoGeneral');
      }

    });

  }
  else if (req.method === "POST") {
    let optionIndex = req.body.options;
    Poll.updatePollById(pollId, optionIndex, req.user._id);

    // display poll page
    Poll.getPollById(pollId, function(err, poll) {
      if (err) throw err;

      let pollInfo = {title: poll.title, options: poll.options, id: pollId};
      let userId = req.user._id;

      User.getUserById(userId, function(err, user) {
        pollInfo.creator = user.name;

        res.redirect("/polls/"+pollId);
      });
    });
  }

});

module.exports = router;
