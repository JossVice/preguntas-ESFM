let quizData = [];
let userAnswers = [];

function loadQuiz(area, numQuestions) {
    return fetch(area)
        .then(response => response.json())
        .then(data => {
            let allQuestions = data.preguntas.map(q => {
                let correctIndex = q.opciones.indexOf(q.respuesta_correcta);
                let shuffledOptions = [...q.opciones].sort(() => Math.random() - 0.5);
                let shuffledCorrect = shuffledOptions.indexOf(q.respuesta_correcta);
                return {
                    question: q.pregunta,
                    options: shuffledOptions,
                    correct: shuffledCorrect
                };
            });
            allQuestions.sort(() => Math.random() - 0.5);
            quizData = allQuestions.slice(0, numQuestions);
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
            alert('Error al cargar las preguntas. Revisa la consola.');
        });
}

function loadFullExam() {
    const areas = [
        { file: 'comprension_lectora.json', num: 30 },
        { file: 'razonamiento_logico.json', num: 30 },
        { file: 'conocimientos_generales.json', num: 20 },
        { file: 'habilidades_socioemocionales.json', num: 20 }
    ];
    let promises = areas.map(area => 
        fetch(area.file)
            .then(response => response.json())
            .then(data => {
                let questions = data.preguntas.map(q => {
                    let correctIndex = q.opciones.indexOf(q.respuesta_correcta);
                    let shuffledOptions = [...q.opciones].sort(() => Math.random() - 0.5);
                    let shuffledCorrect = shuffledOptions.indexOf(q.respuesta_correcta);
                    return {
                        question: q.pregunta,
                        options: shuffledOptions,
                        correct: shuffledCorrect
                    };
                });
                questions.sort(() => Math.random() - 0.5);
                return questions.slice(0, area.num);
            })
    );
    return Promise.all(promises).then(results => {
        quizData = results.flat();
    }).catch(error => {
        console.error('Error loading full exam:', error);
        alert('Error al cargar el examen completo. Revisa la consola.');
    });
}

document.getElementById('practice').addEventListener('click', () => {
    const area = document.getElementById('area').value;
    loadQuiz(area, 50).then(() => {
        document.getElementById('selection').style.display = 'none';
        document.getElementById('quiz-section').style.display = 'block';
        displayQuiz();
        document.getElementById('submit').style.display = 'block';
    });
});

document.getElementById('exam').addEventListener('click', () => {
    loadFullExam().then(() => {
        document.getElementById('selection').style.display = 'none';
        document.getElementById('quiz-section').style.display = 'block';
        displayQuiz();
        document.getElementById('submit').style.display = 'block';
    });
});

document.getElementById('back').addEventListener('click', () => {
    location.reload();
});

function displayQuiz() {
    const quizDiv = document.getElementById('quiz');
    quizData.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        header.textContent = `Pregunta ${index + 1}`;
        
        const body = document.createElement('div');
        body.className = 'card-body';
        
        const p = document.createElement('p');
        p.className = 'card-text';
        p.textContent = q.question;
        body.appendChild(p);
        
        q.options.forEach((option, i) => {
            const checkDiv = document.createElement('div');
            checkDiv.className = 'form-check';
            
            const input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'radio';
            input.name = `q${index}`;
            input.value = i;
            input.id = `q${index}o${i}`;
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `q${index}o${i}`;
            label.textContent = option;
            
            checkDiv.appendChild(input);
            checkDiv.appendChild(label);
            body.appendChild(checkDiv);
        });
        
        questionDiv.appendChild(header);
        questionDiv.appendChild(body);
        quizDiv.appendChild(questionDiv);
    });
}

document.getElementById('submit').addEventListener('click', () => {
    userAnswers = [];
    quizData.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        userAnswers.push(selected ? parseInt(selected.value) : -1);
    });
    showResults();
});

function showResults() {
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('submit').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    let correctCount = 0;
    const detailsDiv = document.getElementById('details');
    detailsDiv.innerHTML = '';

    quizData.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correct;
        if (isCorrect) correctCount++;
        const resultDiv = document.createElement('div');
        resultDiv.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'}`;
        resultDiv.innerHTML = `
            <strong>Pregunta ${index + 1}:</strong> ${q.question}<br>
            <strong>Tu respuesta:</strong> ${userAnswer === -1 ? 'No respondida' : q.options[userAnswer]}<br>
            ${!isCorrect ? `<strong>Respuesta correcta:</strong> ${q.options[q.correct]}` : '<strong>¡Correcto!</strong>'}
        `;
        detailsDiv.appendChild(resultDiv);
    });

    const score = (correctCount / quizData.length * 100).toFixed(2);
    document.getElementById('score').innerHTML = `Nota: ${correctCount}/${quizData.length} (${score}%)`;
}