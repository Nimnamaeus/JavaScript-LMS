"use strict";
const admin = 0;
const student = 1;
const API_URL = 'http://localhost:5000/api';

async function checkLogin() {
  let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
  if (loginUser) {
    if (loginUser.type != admin) {
      location.href = "../auth.html";
    } else {
      document.getElementById("loginUserName").innerText =
        "Welcome, " + loginUser.userName;
      await Promise.all([getStudents(), displayCourses()]);
      
      // Check if returning from activities page
      const hash = window.location.hash;
      if (hash === '#displayCourses') {
        // Show the display courses tab
        const tabEl = document.querySelector('a[href="#displayCourses"]');
        const tab = new bootstrap.Tab(tabEl);
        tab.show();
      }
    }
  } else {
    location.href = "../auth.html";
  }
}

function logout() {
  sessionStorage.removeItem("loginUser");
  location.reload();
}

async function getStudents() {
  try {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    const [studentsResponse, coursesResponse] = await Promise.all([
      fetch(`${API_URL}/users/students`),
      fetch(`${API_URL}/courses?adminId=${loginUser._id}`)
    ]);

    const students = await studentsResponse.json();
    const courses = await coursesResponse.json();

    document.getElementById("students").innerHTML = "";
    
    students.forEach(async (student) => {
      const assignedCoursesResponse = await fetch(`${API_URL}/assign-courses/student/${student._id}`);
      const assignedCourses = await assignedCoursesResponse.json();

      let studentHtml = `
        <div id="accordion${student._id}">
          <div class="card">
            <div class="card-header text-start" data-bs-toggle="collapse" href="#collapse${student._id}">
              ${student.userName}
            </div>
            <div id="collapse${student._id}" class="collapse" data-bs-parent="#accordion${student._id}">
              <div class="card-body">
                <table class="table table-bordered w-50" id="table-${student._id}">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>`;

      courses.forEach(course => {
        const isAssigned = assignedCourses?.courses?.some(c => c._id === course._id);
        studentHtml += `
          <tr>
            <td class="w-80">${course.courseName}</td>
            <td>
              <button type="button" onclick="addCourse('${student._id}', '${course._id}')" 
                class="btn btn-primary btn-sm btn-block ${isAssigned ? 'd-none' : ''}">Add</button>
              <button type="button" onclick="removeCourse('${student._id}', '${course._id}')" 
                class="btn btn-danger btn-sm btn-block ${!isAssigned ? 'd-none' : ''}">Remove</button>
            </td>
          </tr>`;
      });

      studentHtml += `
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>`;

      document.getElementById("students").innerHTML += studentHtml;
    });
  } catch (error) {
    console.error('Error:', error);
    document.getElementById("students").innerHTML = `
      <div class="alert alert-danger">
        Failed to load students and courses. Please try again later.
      </div>`;
  }
}

async function displayCourses() {
  try {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    const response = await fetch(`${API_URL}/courses?adminId=${loginUser._id}`);
    const courses = await response.json();
    
    let displayCoursesId = document.getElementById("displayCourses");
    displayCoursesId.innerHTML = `
      <div class="container">
        <div class="row">
          ${courses.map(course => `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <img src="${course.courseImage}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="image" />
                <hr class="m-0">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${course.courseName}</h5>
                  <span class="mb-2">(${course.courseType})</span>
                  <p class="card-text flex-grow-1">${course.courseDescription}</p>
                  <div class="d-flex justify-content-between mt-auto">
                    <button class="btn btn-primary" onclick="navigateToActivities('${course._id}')">View Activities</button>
                    <button class="btn btn-danger" onclick="deleteCourse('${course._id}')">
                      <i class="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById("displayCourses").innerHTML = `
      <div class="alert alert-danger">
        Failed to load courses. Please try again later.
      </div>`;
  }
}

function navigateToActivities(courseId) {
  sessionStorage.setItem('lastTab', 'displayCourses');
  window.location.href = `activities.html?courseId=${courseId}`;
}

async function addCourse(studentId, courseId) {
  try {
    const response = await fetch(`${API_URL}/assign-courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId, courseId })
    });

    if (!response.ok) throw new Error('Failed to assign course');
    await getStudents(); // Refresh the student list
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to assign course. Please try again.');
  }
}

async function removeCourse(studentId, courseId) {
  try {
    const response = await fetch(`${API_URL}/assign-courses/${studentId}/${courseId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to remove course');
    await getStudents(); // Refresh the student list
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to remove course. Please try again.');
  }
}

// Add event listener for course creation
document.getElementById('btnCourse').addEventListener('click', async (event) => {
  const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
  let courseName = document.forms.course.courseName.value;
  let courseType = document.forms.course.courseType.value;
  let courseDescription = document.forms.course.courseDescription.value;
  let courseImage = document.forms.course.courseImage.value;

  if (!document.forms.course.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    document.forms.course.classList.add('was-validated');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseName,
        courseType,
        courseImage,
        courseDescription,
        adminId: loginUser._id
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('courseAlert').classList.remove('d-none');
      document.forms.course.reset();
      await Promise.all([getStudents(), displayCourses()]);
    } else {
      document.getElementById('courseExitAlert').classList.remove('d-none');
    }

    setTimeout(() => {
      document.getElementById('courseAlert').classList.add('d-none');
      document.getElementById('courseExitAlert').classList.add('d-none');
    }, 2000);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create course. Please try again.');
  }
});

async function deleteCourse(courseId) {
  if (!confirm('Are you sure you want to delete this course? This will also delete all associated activities.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete course');
    
    // Refresh both the courses display and students list (since assigned courses might have changed)
    await Promise.all([getStudents(), displayCourses()]);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to delete course. Please try again.');
  }
}
