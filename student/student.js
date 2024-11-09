"use strict";
const admin = 0;
const student = 1;
const API_URL = 'http://localhost:5000/api';
let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

async function checkLogin() {
  if (loginUser) {
    if (loginUser.type != student) {
      location.href = "../auth.html";
    } else {
      document.getElementById("loginUserName").innerText =
        "Welcome, " + loginUser.userName;
      await loadCourses();
    }
  } else {
    location.href = "../auth.html";
  }
}

async function loadCourses() {
  try {
    const response = await fetch(`${API_URL}/assign-courses/student/${loginUser._id}`);
    const data = await response.json();
    
    const coursesList = document.getElementById('coursesList');
    
    if (!data || !data.courses || data.courses.length === 0) {
      coursesList.innerHTML = `
        <div class="alert alert-info">
          No courses assigned yet.
        </div>`;
      return;
    }

    coursesList.innerHTML = `
      <div class="container">
        <div class="row">
          ${data.courses.map(course => `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <img src="${course.courseImage}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="image" />
                <hr class="m-0">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${course.courseName}</h5>
                  <span class="mb-2">(${course.courseType})</span>
                  <p class="card-text flex-grow-1">${course.courseDescription}</p>
                  <div class="mt-auto">
                    <button class="btn btn-primary" onclick="viewActivities('${course._id}')">View Activities</button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('coursesList').innerHTML = `
      <div class="alert alert-danger">
        Failed to load courses. Please try again later.
      </div>`;
  }
}

async function viewActivities(courseId) {
  try {
    const [courseResponse, activitiesResponse] = await Promise.all([
      fetch(`${API_URL}/courses/${courseId}`),
      fetch(`${API_URL}/activities/course/${courseId}`)
    ]);

    const course = await courseResponse.json();
    const activities = await activitiesResponse.json();

    sessionStorage.setItem('currentCourseId', courseId);

    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3>${course.courseName}</h3>
          <button class="btn btn-secondary" onclick="loadCourses()">Back to Courses</button>
        </div>
        <div class="card-body">
          <div class="row mb-4">
            <div class="col-md-4">
              <img src="${course.courseImage}" class="img-fluid" alt="course image">
            </div>
            <div class="col-md-8">
              <h4>${course.courseName}</h4>
              <p><strong>Type:</strong> ${course.courseType}</p>
              <p><strong>Description:</strong> ${course.courseDescription}</p>
            </div>
          </div>
          
          <h5>Activities</h5>
          <div id="activitiesList"></div>
        </div>
      </div>`;

    // Now load activities separately
    await loadActivities();

  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load activities. Please try again.');
  }
}

function logout() {
  sessionStorage.removeItem("loginUser");
  location.reload();
}

function displayCourses(courses) {
    const container = document.getElementById('courseContainer');
    
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-journal-x"></i>
                <h3>No Courses Found</h3>
                <p class="text-muted">You haven't been assigned any courses yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-image" style="background-image: url('${getCourseImage(course.type)}')">
                <div class="course-overlay">
                    <h5 class="mb-0">${course.name}</h5>
                </div>
            </div>
            <div class="course-content">
                <span class="course-type">${course.type}</span>
                <h3 class="course-title">${course.name}</h3>
                <p class="course-description">${course.description || 'No description available'}</p>
                <a href="activities.html?courseId=${course._id}" class="btn btn-view">
                    <i class="bi bi-eye me-2"></i>View Activities
                </a>
            </div>
        </div>
    `).join('');
}

function getCourseImage(type) {
    const images = {
        'Technology': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
        'Science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
        'Mathematics': 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d',
        'default': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6'
    };
    return images[type] || images.default;
}
