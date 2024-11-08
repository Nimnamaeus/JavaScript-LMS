# Simple Learning Management System 📚

This is a Learning Management System (LMS) project built using JavaScript, Node.js, and MongoDB. It enables administrators to create and manage courses and assign them to students. Students can log in to view their assigned courses. 🖥️📊

## Features 🌟

- **Admin Panel:** 👩‍💼👨‍💼
    - Login as an administrator to access the admin panel. 🔐
    - Create and manage multiple courses with details such as course name, description, and any additional information. 📝
    - Assign courses to specific students. 📋

- **Student Portal:** 🎓
    - Students can log in to their accounts. 🔐
    - View the courses assigned to them by the administrator. 👀

- **MongoDB Integration:** 📦 All data is stored in MongoDB, providing persistent storage and scalability. 💾

## Getting Started 🚀

### Prerequisites 📋

- Node.js and npm installed
- MongoDB installed and running
- A modern web browser with JavaScript enabled. 🌐

### Installation 📦

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lms-project.git
```

2. Install dependencies:

```bash
cd lms-project
npm install
```

3. Create a .env file in the root directory with:

```bash
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

4. Start the server:

```bash
npm start
```

5. Open `index.html` in your browser

## 📝Usage
1. Admin Panel 👩‍💼👨‍💼:
    - Login as an admin using your credentials.
    - Create courses by providing course details.
    - Assign courses to specific students by selecting the student and the course.
2. Student Portal 📚👩‍🎓👨‍🎓:
    - Login as a student using your credentials.
    - View the list of courses assigned to you by the administrator.

## 🤝Contributing
Contributions are welcome! If you'd like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/new-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/new-feature`.
5. Open a pull request.

## 📄License
This Project is licensed under the [MIT License](LICENSE.md), so you're welcome to use and share the content as you see fit.

Happy Learning! 📚🚀
