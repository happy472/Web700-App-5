/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Happy Akter  Student ID: 123456789  Date: March 26, 2025
*
*  Online (Vercel) Link: https://web700-app-5.vercel.app
********************************************************************************/

const express = require("express");
const path = require("path");
const collegeData = require("./collegeData");
const app = express();
const expressLayouts = require("express-ejs-layouts");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// EJS Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Navigation Middleware
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

// Custom EJS Helpers
app.locals.navLink = function (url, options) {
  return (
    '<li' +
    (url == app.locals.activeRoute ? ' class="nav-item active"' : ' class="nav-item"') +
    '><a class="nav-link" href="' +
    url +
    '">' +
    options.fn(this) +
    "</a></li>"
  );
};

app.locals.equal = function (lvalue, rvalue, options) {
  if (arguments.length < 3) throw new Error("Helper 'equal' needs 2 parameters");
  return lvalue != rvalue ? options.inverse(this) : options.fn(this);
};

// Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});

app.get("/students/add", (req, res) => {
  res.render("addStudent");
});

app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch((err) => res.status(500).render("error", { message: "Unable to add student. " + err }));
});

app.get("/students", (req, res) => {
  if (req.query.course) {
    collegeData
      .getStudentsByCourse(req.query.course)
      .then((students) => res.render("students", { students }))
      .catch(() => res.render("students", { message: "no results" }));
  } else {
    collegeData
      .getAllStudents()
      .then((students) => res.render("students", { students }))
      .catch(() => res.render("students", { message: "no results" }));
  }
});

app.get("/student/:studentNum", (req, res) => {
  collegeData
    .getStudentByNum(req.params.studentNum)
    .then((student) => res.render("student", { student }))
    .catch(() => res.status(404).send("Student Not Found"));
});

app.post("/student/update", (req, res) => {
  collegeData
    .updateStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch(() => res.status(500).send("Unable to update student"));
});

app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => res.render("courses", { courses }))
    .catch(() => res.render("courses", { message: "no results" }));
});

app.get("/course/:id", (req, res) => {
  collegeData
    .getCourseById(req.params.id)
    .then((course) => res.render("course", { course }))
    .catch(() => res.status(404).send("Course Not Found"));
});

// 404 Error Handling
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Initialize data before accepting requests
let appReady = false;

collegeData
  .initialize()
  .then(() => {
    console.log("Data initialized successfully.");
    appReady = true;
  })
  .catch((err) => {
    console.error("Initialization failed:", err);
  });

app.use((req, res, next) => {
  if (!appReady) {
    return res.status(503).render("error", { message: "Server not ready. Please try again shortly." });
  }
  next();
});

module.exports = app;
