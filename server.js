/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Happy Akter, Student ID: 170933238, Date: 08/03/2025
*
*  Online (Vercel) Link: ________________________________________________________
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData.js");
const app = express();
const expressLayouts = require("express-ejs-layouts");

// Set EJS as the view engine and layout
app.set("layout", "layouts/main");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Navigation middleware for active route
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

// Routes
app.get(["/", "/home"], (req, res) => {
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
  collegeData.addStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch((err) => res.status(500).render("error", { message: "Error adding student: " + err }));
});

app.get("/students", (req, res) => {
  if (req.query.course) {
    collegeData.getStudentsByCourse(req.query.course)
      .then((students) => res.render("students", { students }))
      .catch(() => res.render("students", { message: "no results" }));
  } else {
    collegeData.getAllStudents()
      .then((students) => res.render("students", { students }))
      .catch(() => res.render("students", { message: "no results" }));
  }
});

app.get("/student/:studentNum", (req, res) => {
  collegeData.getStudentByNum(req.params.studentNum)
    .then((student) => res.render("student", { student }))
    .catch(() => res.render("student", { message: "no results" }));
});

app.post("/student/update", (req, res) => {
  collegeData.updateStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch((err) => res.status(500).send(err));
});

app.get("/courses", (req, res) => {
  collegeData.getCourses()
    .then((courses) => res.render("courses", { courses }))
    .catch(() => res.render("courses", { message: "no results" }));
});

app.get("/course/:id", (req, res) => {
  collegeData.getCourseById(req.params.id)
    .then((course) => res.render("course", { course }))
    .catch(() => res.render("course", { message: "no results" }));
});

// Handle 404 Errors
app.use((req, res) => {
  res.status(404).render("404");
});

// Initialize data and start server
(async () => {
  try {
    await collegeData.initialize();
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server listening on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error("Failed to initialize data: ", err);
  }
})();

module.exports = app;