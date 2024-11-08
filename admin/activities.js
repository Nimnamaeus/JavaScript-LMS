const API_URL = 'http://localhost:5000/api';
let currentCourseId = '';

async function checkLogin() {
    let loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    if (loginUser) {
        if (loginUser.type != 0) { // 0 for admin
            location.href = "../index.html";
        } else {
            document.getElementById("loginUserName").innerText = "Welcome, " + loginUser.userName;
            await loadCourseDetails();
            await loadActivities();
        }
    } else {
        location.href = "../index.html";
    }
}

async function loadCourseDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        currentCourseId = urlParams.get('courseId');
        
        const response = await fetch(`${API_URL}/courses/${currentCourseId}`);
        if (!response.ok) throw new Error('Failed to fetch course details');
        
        const course = await response.json();
        
        document.getElementById('courseName').innerText = course.courseName;
        document.getElementById('courseDetails').innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${course.courseImage}" class="img-fluid" alt="course image">
                </div>
                <div class="col-md-8">
                    <h4>${course.courseName}</h4>
                    <p><strong>Type:</strong> ${course.courseType}</p>
                    <p><strong>Description:</strong> ${course.courseDescription}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load course details');
    }
}

async function loadActivities() {
    try {
        const response = await fetch(`${API_URL}/activities/course/${currentCourseId}`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        
        const activities = await response.json();
        const activitiesList = document.getElementById('activitiesList');
        
        if (activities.length === 0) {
            activitiesList.innerHTML = '<p class="text-muted">No activities added yet.</p>';
            return;
        }

        // Sort activities by sequence number
        activities.sort((a, b) => a.sequence - b.sequence);

        activitiesList.innerHTML = `
            <div class="timeline">
                ${activities.map((activity, index) => `
                    <div class="timeline-item">
                        <div class="timeline-number">${activity.sequence}</div>
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 class="card-title">${activity.title}</h5>
                                        <p class="card-text">
                                            <span class="badge bg-secondary">${activity.type}</span>
                                        </p>
                                        <a href="${activity.content}" target="_blank" class="btn btn-primary">
                                            ${activity.type === 'file' ? 'Start Activity' : 'Watch Video'}
                                        </a>
                                    </div>
                                    <div>
                                        <button class="btn btn-sm btn-warning me-2" onclick="editActivity('${activity._id}')">
                                            <i class="bi bi-pencil"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteActivity('${activity._id}')">
                                            <i class="bi bi-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load activities');
    }
}

// Add activity form submission handler
document.getElementById('btnAddActivity').addEventListener('click', async () => {
    const form = document.forms.activity;
    const btn = document.getElementById('btnAddActivity');
    const isEdit = btn.dataset.activityId;
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    try {
        const url = isEdit 
            ? `${API_URL}/activities/${btn.dataset.activityId}`
            : `${API_URL}/activities`;
            
        const activityResponse = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId: currentCourseId,
                title: form.title.value,
                type: form.type.value,
                content: form.content.value,
                sequence: isEdit ? parseInt(btn.dataset.sequence) : undefined
            })
        });

        if (!activityResponse.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'add'} activity`);
        
        form.reset();
        form.classList.remove('was-validated');
        btn.textContent = 'Add Activity';
        delete btn.dataset.activityId;
        await loadActivities();
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to ${isEdit ? 'update' : 'add'} activity`);
    }
});

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.getElementById('courseDetails').appendChild(alertDiv);
}

function logout() {
    sessionStorage.removeItem("loginUser");
    location.href = "../index.html";
}

async function deleteActivity(activityId) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
        const response = await fetch(`${API_URL}/activities/${activityId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete activity');
        await loadActivities();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete activity');
    }
}

async function editActivity(activityId) {
    try {
        const response = await fetch(`${API_URL}/activities/${activityId}`);
        if (!response.ok) throw new Error('Failed to fetch activity');
        
        const activity = await response.json();
        const form = document.forms.activity;
        
        // Populate form with activity data
        form.title.value = activity.title;
        form.type.value = activity.type;
        form.content.value = activity.content;
        
        // Change button text and store activity ID
        const btn = document.getElementById('btnAddActivity');
        btn.textContent = 'Update Activity';
        btn.dataset.activityId = activityId;
        btn.dataset.sequence = activity.sequence;
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load activity details');
    }
} 