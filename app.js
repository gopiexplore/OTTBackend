require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const rateLimit=require("express-rate-limit")

// View engine
app.set("view engine", "hbs");

// Port
const port = 5000;

// MongoDB Connection
mongoose.connect("mongodb+srv://gopithammisetti6:6OdiZJMM3QwtyBdN@cluster0.62vqegu.mongodb.net/netflixClone")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Session Middleware
app.use(session({
    secret: "abcd1234",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://gopithammisetti6:6OdiZJMM3QwtyBdN@cluster0.62vqegu.mongodb.net/netflixClone"
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

let limitter=rateLimit({
    max:3,
    windowMs:60*60*1000,
    message:"We Are received to Many requests from this IP.please try after one hour "
})
app.use(limitter)
// Passport Configuration
const User = require("./models/User");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const dashboard = require("./routes/dashboard");
const addMovie=require("./routes/addMovie")
const updateMovieRoute=require("./routes/updateMovie")
const myList=require("./routes/mylist")
const watchedMovies=require("./routes/watchedMovie")
const deleteMovie=require("./routes/deleteMovie")
const getMovies=require("./routes/getMovies")
app.use("/", authRoutes);
app.use("/", dashboard);
app.use("/",addMovie)
app.use("/",updateMovieRoute)
app.use("/",myList)
app.use("/",watchedMovies)
app.use("/",deleteMovie)
app.use("/",getMovies)
// Start Server
app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});
