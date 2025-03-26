const fs = require("fs");
const path = require("path");

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    const studentPath = path.join(__dirname, "../data/students.json");
    const coursePath = path.join(__dirname, "../data/courses.json");

    fs.readFile(coursePath, "utf8", (err, courseData) => {
      if (err) {
        reject("Unable to read courses.json");
        return;
      }

      fs.readFile(studentPath, "utf8", (err, studentData) => {
        if (err) {
          reject("Unable to read students.json");
          return;
        }

        dataCollection = new Data(
          JSON.parse(studentData),
          JSON.parse(courseData)
        );
        resolve();
      });
    });
  });
};

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    if (dataCollection?.students?.length > 0) resolve(dataCollection.students);
    else reject("no results");
  });
};

module.exports.getTAs = function () {
  return new Promise((resolve, reject) => {
    const tas = dataCollection?.students?.filter((s) => s.TA === true);
    tas?.length > 0 ? resolve(tas) : reject("no results");
  });
};

module.exports.getCourses = function () {
  return new Promise((resolve, reject) => {
    if (dataCollection?.courses?.length > 0) resolve(dataCollection.courses);
    else reject("no results");
  });
};

module.exports.getStudentByNum = function (num) {
  return new Promise((resolve, reject) => {
    const found = dataCollection?.students?.find(
      (s) => s.studentNum == num
    );
    found ? resolve(found) : reject("no results");
  });
};

module.exports.getStudentsByCourse = function (course) {
  return new Promise((resolve, reject) => {
    const filtered = dataCollection?.students?.filter(
      (s) => s.course == course
    );
    filtered?.length > 0 ? resolve(filtered) : reject("no results");
  });
};

module.exports.addStudent = function (studentData) {
  return new Promise((resolve, reject) => {
    if (!dataCollection?.students) {
      reject("Data not initialized");
      return;
    }

    studentData.TA = studentData.TA === "true" || studentData.TA === true;
    studentData.studentNum = dataCollection.students.length + 1;
    dataCollection.students.push(studentData);
    resolve();
  });
};

module.exports.updateStudent = function (studentData) {
  return new Promise((resolve, reject) => {
    const index = dataCollection?.students?.findIndex(
      (s) => s.studentNum == studentData.studentNum
    );
    if (index === -1) {
      reject("Student not found");
      return;
    }

    studentData.TA = studentData.TA === "true" || studentData.TA === true;
    dataCollection.students[index] = studentData;
    resolve();
  });
};

module.exports.getCourseById = function (id) {
  return new Promise((resolve, reject) => {
    const found = dataCollection?.courses?.find(
      (c) => c.courseId == id
    );
    found ? resolve(found) : reject("no results");
  });
};
