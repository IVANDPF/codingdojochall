let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let bodyParser = require("body-parser");
let exphbs = require("express-handlebars");
let expressValidator = require("express-validator");
let flash = require("connect-flash");
let session = require("express-session");
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let mongo = require("mongodb");
let mongoose = require("mongoose");

const uri =
  "mongodb+srv://votingapp:votingapp@voting-app.sltza.mongodb.net/test";
mongoose.connect(uri, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
});
let routes = require("./routes/index");
let users = require("./routes/users");
let polls = require("./routes/polls");
let app = express();

// Engine
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({ defaultLayout: "layout" }));
app.set("view engine", "handlebars");

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Express
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      let namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

// Connect Flash
app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.use("/", routes); // main dashboard
app.use("/users", users); //  login and register
app.use("/polls", polls); // poll creation, voting and deletion

app.use(function (req, res) {
  res.render("404");
});

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function () {
  console.log("Running port #: ", app.get("port"));
});
