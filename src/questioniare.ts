(function () {
  function buildQuiz() {
    // variable to store the HTML output
    const output: string[] = [];

    // for each question...
    questions.forEach((currentQuestion: any, questionNumber) => {
      // variable to store the list of possible answers
      const answers = [];
      //var letter = [];

      // ${currentQuestion.answers[letter]}

      // and for each available answer...
      for (var letter in currentQuestion.answers) {
        //console.log(letter);

        // ...add an HTML radio button
        answers.push(
          `<label>
                  <input type="radio" class="form-check-input" name="question${questionNumber}" value="${letter}">
                  ${currentQuestion.answers[letter]}
                </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question-head">
                    <div class="question"> ${currentQuestion.question} </div>
               </div>
                <div class="answers-container">
                    <div class="answers"> ${answers.join("")} </div>
                </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    if (quizContainer != null) {
      quizContainer.innerHTML = output.join("");
    }
  }

  function showResults() {
    //gather answer containers from the quiz
    if (quizContainer != null) {
      const answerContainers = quizContainer.querySelectorAll(".answers");

      //keep track of the users answers
      let numCorrect = 0;

      //for each question
      questions.forEach((currentQuestion, questionNumber) => {
        //find seletect answer
        const answerContainer = answerContainers[questionNumber];
        const selector = `input[name=question${questionNumber}]:checked`;
        const userAnswer = (<HTMLInputElement>answerContainer.querySelector(selector) || {}).value;

        //if answer is correct
        if (userAnswer === currentQuestion.correctAnswer) {
          //add to the number of correct answers
          numCorrect++;
          overrallPoints++;
        }
      });
    }
    if (resultContainer != null) {
      resultContainer.innerHTML = `${overrallPoints} points scored!`;
    }
  }

  const quizContainer = document.getElementById("quiz");
  const submitbutton = document.getElementById("submit");
  const resultContainer = document.getElementById("result");
  var overrallPoints = 0;

  const questions = [
    {
      question: "Question 1 - How many stones in the stone circle are visible today?",
      answers: {
        a: "53",
        b: "63",
        c: "73",
        d: "83",
      },
      correctAnswer: "d",
    },
    {
      question: "Question 2 - How long ago was the monument erected, to the nearest 500 years?",
      answers: {
        a: "4500",
        b: "6000",
        c: "2000",
        d: "8500",
      },
      correctAnswer: "a",
    },
    {
      question: "Question 3 - Stone 56 is the tallest standing stone on the site. How tall is it?",
      answers: {
        a: "7 meters",
        b: "6.55 meters",
        c: "8.71 meters",
        d: "9 meters",
      },
      correctAnswer: "c",
    },
    {
      question: "Question 4 - How many people vist stonehenge each year?",
      answers: {
        a: "Around 2 millon",
        b: "Around 1.5 millon",
        c: "Around 1.3 millon",
        d: "Around 1.7 millon",
      },
      correctAnswer: "c",
    },
    {
      question: "Question 5 - The stonehenge and avebury world heritage site covers a total of how many acres?",
      answers: {
        a: "6500 acres",
        b: "4500 acres",
        c: "7500 acres",
        d: "5500 acres",
      },
      correctAnswer: "a",
    },
    {
      question: "Question 6 - In which year were stonehenge and avebury inscribed on the unesco world heritage list?",
      answers: {
        a: "1940",
        b: "1856",
        c: "1899",
        d: "1986",
      },
      correctAnswer: "d",
    },
    {
      question:
        "Question 7 - The earliest known major event here was the construction of a circular ditch in about 3000BC. What is its diameter?",
      answers: {
        a: "150 meters",
        b: "100 meters",
        c: "75 meters",
        d: "150 meters",
      },
      correctAnswer: "b",
    },
    {
      question:
        "Question 8 - Can you name the local landowner who bought stonehenge from the antrobus family in 1915 and subsequently gave it to the nation 3 years later?",
      answers: {
        a: "Cecil Chubb",
        b: "Rick Astley",
        c: "Ricado Milos",
        d: "Marshall Mathers",
      },
      correctAnswer: "c",
    },
  ];

  buildQuiz();

  if (submitbutton != null) {
    submitbutton.addEventListener("click", showResults);
  }

  $("#submit").click(function () {
    localStorage.setItem("points", overrallPoints.toString());
  });
})();
