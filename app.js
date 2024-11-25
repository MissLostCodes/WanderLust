const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");
const session = require("express-session");
const listingsRoutes = require("./routes/listing");
const reviewsRoutes = require("./routes/review");
const userRoutes = require("./routes/user.js");
const flash = require("connect-flash");
const passport = require("passport");
const localStratergy = require("passport-local");
const User =  require("./models/user.js");
const Joi = require('joi'); 
const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Database connection error:", err));

// Set up EJS with ejs-mate
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

const sessionOptions = {
  secret: "mysupersecretcode", 
  resave: false,
  saveUninitialized: true,
  cookie: {
  expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,},
};
 
// Apply the session middleware
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser() ); // serialize-> store user related info in session 
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next)=> {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user ;
  next();
})
/*
app.get("/demouser", async (req, res) => {
  try {
      let fakeUser = new User({
          email: "student@gmail.com",
          username: "delta-student",
      });

      let registeredUser = await User.register(fakeUser, "helloworld");
      res.send(registeredUser);
  } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred during user registration.");
  }
});

*/

// Routes
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/" , userRoutes);


// Home Route
app.get(
  "/",
  wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("home", { listings });
  })
);

// Catch-all route for unknown endpoints
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

// Start server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
