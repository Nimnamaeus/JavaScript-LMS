"use strict";
const admin = 0;
const student = 1;
const API_URL = 'http://localhost:5000/api';
let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

async function checkLogin() {
  if (loginUser) {
    if (loginUser.type != student) {
      location.href = "../index.html";
    } else {
      document.getElementById("loginUserName").innerText =
        "Welcome, " + loginUser.userName;
      await getCourses();
    }
  } else {
    location.href = "../index.html";
  }
}

function logout() {
  sessionStorage.removeItem("loginUser");
  location.reload();
}

async function getCourses() {
  try {
    const response = await fetch(`${API_URL}/assign-courses/student/${loginUser._id}`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    
    const assignedCourses = await response.json();
    document.getElementById("viewCourses").innerHTML = "";
    
    if (assignedCourses && assignedCourses.courses.length > 0) {
      document.getElementById("viewCourses").innerHTML = `
        <div class="container">
          <div class="row" id="row">
            ${assignedCourses.courses.map(course => `
              <div class="col-4">
                <div class="card">
                  <img src="${course.courseImage}" class="card-img-top" alt="image" />
                  <hr>
                  <div class="card-body">
                    <h5 class="card-title">${course.courseName}</h5>
                    <span>(${course.courseType})</span>
                    <p class="card-text">${course.courseDescription}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    } else {
      document.getElementById("viewCourses").innerHTML = `
        <div class="alert alert-info">
          No courses assigned yet.
        </div>`;
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    document.getElementById("viewCourses").innerHTML = `
      <div class="alert alert-danger">
        Failed to load courses. Please try again later.
      </div>`;
  }
}
