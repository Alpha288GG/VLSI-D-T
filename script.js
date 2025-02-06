const questionPapers = {
    "1st Year": {
        "ct1": ["/files/repeat_Q_M3_paper1.pdf"],
        "ct2": ["/files/Regular_Hall_Ticket.pdf"],
        "midsem": ["/files/Midsem_Paper.pdf"],
        "endsem": ["/files/Endsem_Paper.pdf"],
        "obt": ["/files/OBT_Paper.pdf"]
    },
    "2nd Year": {
        "ct1": ["/files/2ndYear_CT1_Maths.pdf"]
    },
    "3rd Year": {},
    "Final Year": {}
};

let isLoggedIn = false;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    if (username === 'csmss' && password === 'csmss') {
        isLoggedIn = true;
        errorDiv.textContent = "";
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
    } else {
        errorDiv.textContent = "Invalid username or password.";
    }
}

function showOptions(year) {
    if (!isLoggedIn) return;

    document.getElementById('year-title').textContent = year;
    document.getElementById('options-container').style.display = 'block';
    document.getElementById('content-container').style.display = 'none';

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    if (questionPapers[year]) {
        for (const exam in questionPapers[year]) {
            const button = document.createElement('button');
            button.textContent = exam.toUpperCase();
            button.onclick = () => showQuestionPapers(year, exam);
            optionsContainer.appendChild(button);
        }
    } else {
        optionsContainer.innerHTML = "No data available.";
    }
}

function showQuestionPapers(year, exam) {
    if (!isLoggedIn) return;

    document.getElementById('exam-title').textContent = `${year} - ${exam.toUpperCase()}`;
    document.getElementById('content-container').style.display = 'block';

    const papersContainer = document.getElementById('question-papers');
    papersContainer.innerHTML = '';

    if (questionPapers[year] && questionPapers[year][exam]) {
        questionPapers[year][exam].forEach(paper => {
            const link = document.createElement('a');
            link.href = paper;
            link.textContent = paper.split('/').pop();
            link.target = '_blank';
            papersContainer.appendChild(link);
        });
    } else {
        papersContainer.textContent = "No question papers available.";
    }
}
