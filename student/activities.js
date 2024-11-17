async function loadActivities() {
  try {
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    const currentCourseId = sessionStorage.getItem('currentCourseId');
    
    console.log('Loading activities for course:', currentCourseId);
    
    const response = await fetch(`${API_URL}/activities/course/${currentCourseId}`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    
    const activities = await response.json();
    console.log('Fetched activities:', activities);
    
    const activitiesList = document.getElementById('activitiesList');
    
    if (activities.length === 0) {
      activitiesList.innerHTML = '<p class="text-muted">No activities added yet.</p>';
      return;
    }

    // Fetch submissions
    const submissionPromises = activities.map(activity => 
      fetch(`${API_URL}/submissions/${activity._id}/${loginUser._id}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
    );
    const submissions = await Promise.all(submissionPromises);
    
    console.log('Submissions:', submissions);
    
    activities.sort((a, b) => a.sequence - b.sequence);

    activitiesList.innerHTML = `
      <div class="timeline">
        ${activities.map((activity, index) => `
          <div class="timeline-item">
            <div class="timeline-number">${activity.sequence}</div>
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">${activity.title}</h5>
                <p class="card-text">
                  <span class="badge bg-secondary">${activity.type}</span>
                  <span class="badge bg-info ms-2">
                    Deadline: ${new Date(activity.deadline).toLocaleString()}
                  </span>
                </p>
                <div class="d-flex gap-2">
                  <a href="${activity.content}" target="_blank" class="btn btn-primary">
                    ${activity.type === 'file' ? 'View Activity' : 'Watch Video'}
                  </a>
                  ${activity.type === 'file' ? 
                    (submissions[index] ? `
                      <div class="d-flex gap-2">
                        <a href="${submissions[index].submissionUrl}" target="_blank" class="btn btn-success">
                          View Submission
                        </a>
                        <button type="button" class="btn btn-danger" onclick="cancelSubmission('${activity._id}', '${submissions[index]._id}')">
                          Cancel Submission
                        </button>
                      </div>
                    ` : `
                      <button type="button" class="btn btn-primary" onclick="this.nextElementSibling.classList.remove('d-none')">
                        Submit Work
                      </button>
                      <form onsubmit="submitActivity(event, '${activity._id}')" class="d-inline d-none">
                        <div class="input-group mb-2">
                          <input type="url" class="form-control" name="submissionUrl" 
                                 placeholder="Paste your Google Docs URL here" required>
                          <button type="submit" class="btn btn-success">
                            <i class="bi bi-link-45deg"></i> Submit
                          </button>
                          <button type="button" class="btn btn-secondary" onclick="hideSubmissionForm(this)">
                            Cancel
                          </button>
                        </div>
                      </form>
                    `)
                  : ''}
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

async function submitActivity(event, activityId) {
  event.preventDefault();
  const loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
  const form = event.target;
  const submissionUrl = form.submissionUrl.value;
  
  if (!submissionUrl.startsWith('https://docs.google.com/')) {
    alert('Please provide a valid Google Docs URL');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId: loginUser._id,
        activityId: activityId,
        submissionUrl: submissionUrl
      })
    });

    if (!response.ok) throw new Error('Failed to submit activity');
    
    alert('Activity submitted successfully!');
    await loadActivities(); // Refresh the view to show the submission
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit activity. Please try again.');
  }
}

async function cancelSubmission(activityId, submissionId) {
  if (!confirm('Are you sure you want to cancel this submission? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/submissions/${submissionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to cancel submission');
    
    alert('Submission cancelled successfully!');
    await loadActivities(); // Refresh the view
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to cancel submission. Please try again.');
  }
}

function hideSubmissionForm(button) {
  const form = button.closest('form');
  form.submissionUrl.value = '';
  form.classList.add('d-none');
} 