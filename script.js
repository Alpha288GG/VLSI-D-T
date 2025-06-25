alert("Welcome to the EDU portal!");
let isLoggedIn = false;
let isAdmin = false;

// ===== SIMPLE LOCAL STORAGE SYSTEM =====
// Use a single global object to store all files
const STORAGE_KEY = "EDU_PORTAL_ALL_FILES";

// Function to save files to storage (now supports base64 content)
function saveFile(category, fileName, fileLink, fileDataBase64 = null, fileType = null) {
  let allFiles = getAllFiles();
  if (!allFiles[category]) {
    allFiles[category] = [];
  }
  allFiles[category].push({
    name: fileName,
    link: fileLink,
    data: fileDataBase64, // base64 data if uploaded
    type: fileType, // MIME type if uploaded
    date: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
  console.log("File saved:", category, fileName, fileLink, fileType);
}

// Function to get all files from storage
function getAllFiles() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : {};
  } catch (e) {
    console.error("Error loading files from storage:", e);
    return {};
  }
}

// Function to get files for a specific category
function getFilesForCategory(category) {
  const allFiles = getAllFiles();
  return allFiles[category] || [];
}

// Function to display all stored data (for debugging)
function displayAllStoredData() {
  console.log("========= ALL STORED DATA =========");
  console.log(localStorage.getItem(STORAGE_KEY));
  
  const allFiles = getAllFiles();
  console.log("Categories:", Object.keys(allFiles));
  
  for (const category in allFiles) {
    console.log(`Category: ${category} - ${allFiles[category].length} files`);
    allFiles[category].forEach((file, i) => {
      console.log(`  ${i+1}. ${file.name} (${file.link})`);
    });
  }
  console.log("====================================");
}

// User login function
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("login-error");

  if (username === "admin" && password === "teacher") {
    isLoggedIn = true;
    isAdmin = true;
    console.log("Logged in as admin");
    alert("Welcome, Admin! You can now add study materials.");
  } else if (username === "user" && password === "student") {
    isLoggedIn = true;
    isAdmin = false;
    console.log("Logged in as user");
    alert("Welcome, Student! You can view study materials.");
  } else {
    errorDiv.textContent = "Invalid username or password.";
    return;
  }

  errorDiv.textContent = "";
  document.getElementById("login-container").style.display = "none";
  document.getElementById("main-container").style.display = "block";
  
  // Debug info
  console.log("isAdmin:", isAdmin);
  console.log("isLoggedIn:", isLoggedIn);
  
  // Display stored data for debugging
  displayAllStoredData();
}

// Function to check if admin
function checkIfAdmin() {
  console.log("Current admin status:", isAdmin);
  alert("Current admin status: " + (isAdmin ? "You are an admin" : "You are a regular user"));
  return isAdmin;
}

// Function to test file deletion
function testDeleteFile() {
  // Get all files
  const allFiles = getAllFiles();
  const categories = Object.keys(allFiles);
  
  if (categories.length === 0) {
    alert("No files found in storage to delete.");
    return;
  }
  
  // Display categories with files
  console.log("All categories with files:", categories);
  
  // Pick the first category with files
  let foundCategory = null;
  let foundFile = null;
  
  for (const category of categories) {
    if (allFiles[category].length > 0) {
      foundCategory = category;
      foundFile = allFiles[category][0];
      break;
    }
  }
  
  if (!foundCategory || !foundFile) {
    alert("No files found to delete.");
    return;
  }
  
  // Attempt to delete the file
  console.log("Attempting to delete file:", foundFile.name, "from category:", foundCategory);
  
  if (confirm(`Test delete: Are you sure you want to delete "${foundFile.name}" from ${foundCategory}?`)) {
    const result = deleteFile(foundCategory, foundFile.name);
    
    if (result) {
      alert(`Test successful: Deleted file "${foundFile.name}" from ${foundCategory}`);
      // Refresh the current view if we're in that category
      const currentCategory = document.getElementById("exam-title").textContent;
      if (currentCategory === foundCategory) {
        const parts = foundCategory.split(" - ");
        if (parts.length >= 3) {
          showQuestionPapers(
            parts.slice(0, -2).join(" - "),
            parts.slice(-2)[0],
            parts.slice(-1)[0]
          );
        }
      }
    } else {
      alert(`Test failed: Could not delete file "${foundFile.name}" from ${foundCategory}`);
    }
  }
}

// Show Semesters
function showSemesters(year) {
  if (!isLoggedIn) return alert("Please log in to access this feature.");

  document.getElementById("year-title").textContent = year;
  ["subjects-container", "exams-container", "content-container", "upload-container"].forEach(id => document.getElementById(id).style.display = "none");

  const semestersContainer = document.getElementById("semesters");
  semestersContainer.style.display = "block";
  semestersContainer.innerHTML = "";

  const semesterMap = {
    "1st Year": ["1st Sem", "2nd Sem"],
    "2nd Year": ["3rd Sem", "4th Sem"],
    "3rd Year": ["5th Sem", "6th Sem"],
    "Final Year": ["7th Sem", "8th Sem"]
  };

  (semesterMap[year] || []).forEach(sem => {
    const btn = document.createElement("button");
    btn.textContent = sem;
    btn.onclick = () => showSubjects(`${year} - ${sem}`);
    semestersContainer.appendChild(btn);
  });
}

// Show Subjects
function showSubjects(yearSemester) {
  if (!isLoggedIn) return;

  document.getElementById("year-title").textContent = yearSemester;
  ["subjects-container", "exams-container", "content-container", "upload-container"].forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById("subjects-container").style.display = "block";

  const [year, semester] = yearSemester.split(" - ");
  const subjectsContainer = document.getElementById("subjects");
  subjectsContainer.innerHTML = "";

  if (questionPapers[year]?.[semester]) {
    Object.keys(questionPapers[year][semester]).forEach(subject => {
      const btn = document.createElement("button");
      btn.textContent = subject;
      btn.onclick = () => showExams(yearSemester, subject);
      subjectsContainer.appendChild(btn);
    });
  } else {
    subjectsContainer.innerHTML = "<p>No subjects available for this semester.</p>";
  }
}

// Show Exams
function showExams(yearSemester, subject) {
  if (!isLoggedIn) return;

  document.getElementById("subject-title").textContent = `${yearSemester} - ${subject}`;
  ["exams-container", "content-container", "upload-container"].forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById("exams-container").style.display = "block";

  const examsContainer = document.getElementById("exams");
  examsContainer.innerHTML = "";

  const [year, semester] = yearSemester.split(" - ");
  if (questionPapers[year]?.[semester]?.[subject]) {
    Object.keys(questionPapers[year][semester][subject]).forEach(exam => {
      const btn = document.createElement("button");
      btn.textContent = exam.toUpperCase();
      btn.onclick = () => showQuestionPapers(yearSemester, subject, exam);
      examsContainer.appendChild(btn);
    });
  } else {
    examsContainer.innerHTML = "<p>No exams available for this subject.</p>";
  }
}

// Function to delete a file by category and file name
function deleteFile(category, fileName) {
  console.log("Deleting file:", category, fileName);
  
  // Get all stored files
  let allFiles = getAllFiles();
  
  // Check if category exists and has files
  if (!allFiles[category] || !Array.isArray(allFiles[category])) {
    console.error("Cannot delete file: Invalid category");
    return false;
  }
  
  // Find the file by name
  const fileIndex = allFiles[category].findIndex(file => file.name === fileName);
  if (fileIndex === -1) {
    console.error("Cannot delete file: File not found", fileName);
    return false;
  }
  
  // Remove the file at the specified index
  const deletedFile = allFiles[category].splice(fileIndex, 1)[0];
  console.log("Deleted file:", deletedFile);
  
  // Save updated files back to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
  
  return true;
}

// Show Question Papers
function showQuestionPapers(yearSemester, subject, exam) {
  if (!isLoggedIn) return;
  const categoryKey = `${yearSemester} - ${subject} - ${exam.toUpperCase()}`;
  document.getElementById("exam-title").textContent = categoryKey;
  document.getElementById("content-container").style.display = "block";
  const files = getFilesForCategory(categoryKey);
  const papersContainer = document.getElementById("question-papers");
  papersContainer.innerHTML = "";
  if (files.length > 0) {
    files.forEach((file, index) => {
      const card = document.createElement("div");
      card.className = "paper-card";
      card.setAttribute("data-filename", file.name);
      let a;
      if (file.data && file.type) {
        // File uploaded and stored as base64
        a = document.createElement("a");
        a.href = file.data;
        a.textContent = file.name + " (download)";
        a.download = file.name;
        a.target = "_blank";
      } else {
        // Link-based file
        a = document.createElement("a");
        a.href = file.link;
        a.textContent = file.name;
        a.target = "_blank";
      }
      card.appendChild(a);
      if (isAdmin) {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = "Delete this file";
        deleteBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
            if (deleteFile(categoryKey, file.name)) {
              // Refresh
              const parts = categoryKey.split(" - ");
              showQuestionPapers(
                parts.slice(0, -2).join(" - "),
                parts.slice(-2)[0],
                parts.slice(-1)[0]
              );
            }
          }
        };
        card.appendChild(deleteBtn);
      }
      papersContainer.appendChild(card);
    });
  } else {
    const msg = document.createElement("p");
    msg.textContent = "No files uploaded yet!";
    msg.style.color = "#777";
    papersContainer.appendChild(msg);
  }
  if (isAdmin) {
    document.getElementById("upload-container").style.display = "block";
  } else {
    document.getElementById("upload-container").style.display = "none";
  }
}

// Add file using manual link
function addFileWithLink() {
  console.log("Add Material button clicked");
  
  // Get file details
  const fileName = document.getElementById("file-name").value.trim();
  const fileLink = document.getElementById("file-link").value.trim();
  
  console.log("File name:", fileName);
  console.log("File link:", fileLink);
  
  if (!fileName || !fileLink) {
    alert("Please enter both file name and link");
    return;
  }
  
  // Validate URL
  try {
    new URL(fileLink);
  } catch (e) {
    alert("Please enter a valid URL (including http:// or https://)");
    return;
  }
  
  // Get current category
  const categoryKey = document.getElementById("exam-title").textContent;
  console.log("Category key:", categoryKey);
  
  if (!categoryKey) {
    alert("Please select a category to add the file to");
    return;
  }
  
  // Save file to storage
  saveFile(categoryKey, fileName, fileLink);
  
  // Clear form and show success message
  document.getElementById("file-name").value = "";
  document.getElementById("file-link").value = "";
  document.getElementById("upload-success").style.display = "block";
  setTimeout(() => {
    document.getElementById("upload-success").style.display = "none";
  }, 3000);
  
  // Refresh the file list
  showQuestionPapers(
    categoryKey.split(" - ").slice(0, -2).join(" - "),
    categoryKey.split(" - ").slice(-2)[0],
    categoryKey.split(" - ").slice(-1)[0]
  );
}

// Add file using file upload
function addFileWithUpload() {
  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];
  const fileName = document.getElementById("file-name").value.trim() || (file ? file.name : "");
  const categoryKey = document.getElementById("exam-title").textContent;
  if (!file || !categoryKey) {
    alert("Please select a file and category.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    saveFile(categoryKey, fileName, "", base64Data, file.type);
    document.getElementById("file-name").value = "";
    fileInput.value = "";
    document.getElementById("upload-success").style.display = "block";
    setTimeout(() => {
      document.getElementById("upload-success").style.display = "none";
    }, 3000);
    // Refresh the file list
    const parts = categoryKey.split(" - ");
    showQuestionPapers(
      parts.slice(0, -2).join(" - "),
      parts.slice(-2)[0],
      parts.slice(-1)[0]
    );
  };
  reader.readAsDataURL(file);
}

// Question Papers Object
const questionPapers = {
  "1st Year": {
    "1st Sem": {
      Math: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], Notes: [] },
      Physics: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], Notes: [] },
    },
    "2nd Sem": {
      Chemistry: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], Notes: [] },
      Biology: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], Notes: [] },
    },
  },
  "2nd Year": {
    "3rd Sem": {
      NTSS: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
      PYTHON: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
    },
    "4th Sem": {
      "MATHEMATICS-III": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
      EDC: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
    },
  },
  "3rd Year": {
    "5th Sem": {
      DEMP: { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
      "Digital Systems": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
    },
    "6th Sem": {
      "Control Systems": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
      "Embedded Systems": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
    },
  },
  "Final Year": {
    "7th Sem": {
      "VLSI Design": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
      "Machine Learning": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
    },
    "8th Sem": {
      "Project Work": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
      "Advanced Networking": { ct1: [], ct2: [], midsem: [], endsem: [], obt: [], pyq: [], Notes: [] },
    },
  },
};

// Logout function
function logout() {
  isLoggedIn = false;
  isAdmin = false;
  // Hide main, show login
  document.getElementById("main-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
  // Optionally clear fields
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  // Optionally show a message
  alert("You have been logged out.");
}
