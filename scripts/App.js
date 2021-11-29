class Question {
    letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    max;
    operand;
    number;
    questionText;
    randomChar;


    randomLetter() {
        const randIndex = Math.floor(Math.random() * (this.letters.length - 1));
        return this.letters[randIndex];
    }


    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }


    askQuestion() {
        this.operand = Math.random() > 0.5 ? " + " : " - ";
        this.questionText = "";
        this.randomChar = this.randomLetter();


        if (this.operand === " + ") {
            this.max = this.letters.length - this.letters.indexOf(this.randomChar);
            this.number = this.randomNum(0, this.max);
            this.questionText += "\"" + this.randomChar + "\" " + this.operand + this.number;
        } else {
            this.max = this.letters.indexOf(this.randomChar);
            this.number = this.randomNum(0, this.max + 1);
            this.questionText += "\"" + this.randomChar + "\" " + this.operand + this.number;
        }


        return {
            questionText: this.questionText,
            operand: this.operand,
            randomChar: this.randomChar,
            max: this.max,
            letters: this.letters
        };
    }


    questionDetails() {
        return this.askQuestion();
    }


    render() {
        const createdElement = new Render("div", ".root").display();
        createdElement.innerHTML = this.questionDetails().questionText;
        createdElement.setAttribute("id", "question");
    }


}

class Answer {
    rightChar;
    wrongChars = [];

    constructor(isCorrect = false, char, num, operand, letters) {
        this.isCorrect = isCorrect;
        this.char = char;
        this.num = num;
        this.operand = operand;
        this.letters = letters;
    }

    rightAnswer() {


        if (this.operand === " + ") {
            this.rightChar = this.letters[this.letters.indexOf(this.char) + this.num];
        } else {
            this.rightChar = this.letters[this.letters.indexOf(this.char) - this.num];
        }

        return this.rightChar;

    }

    wrongAnswer() {
        const tempLetters = this.letters.slice();

        this.wrongChars.push(this.rightChar);

        for (let i = 0; i < 3; i++) {
            tempLetters.splice(tempLetters.indexOf(this.wrongChars[i]), 1);
            const randChar = tempLetters[Math.floor(Math.random() * (tempLetters.length - 1))];

            this.wrongChars.push(randChar);
        }

        return this.wrongChars;
    }


    render(tagName, selector, className) {
        const answerElement = new Render(tagName, selector, className).display();

        answerElement.setAttribute("class", "AnswerBox");
        const arrOfElements = [`<div id="answer1" class="options"> ${this.wrongChars[1]}</div>`,
            `<div id="answer2" class="options"> ${this.wrongChars[2]}</div>`,
            `<div id="answer0" class="options"> ${this.wrongChars[0]}</div>`,
            `<div id="answer3" class="options"> ${this.wrongChars[3]}</div>`];

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;

            while (currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }

            return array;
        }

        shuffle(arrOfElements);

        answerElement.innerHTML = `${arrOfElements[0]} 
                                   ${arrOfElements[1]} 
                                   ${arrOfElements[2]}  
                                   ${arrOfElements[3]}`;

    }
}

class Render {
    constructor(tagName, selector, className) {
        this.tagName = tagName;
        this.selector = selector;
        this.className = className;
    }

    static reset(selector) {
        const element = document.querySelector(selector);
        element.innerHTML = "";
    }

    display() {
        const rootElement = document.querySelector(this.selector);
        const createdElement = document.createElement(this.tagName);
        createdElement.className = this.className;
        rootElement.appendChild(createdElement);
        return createdElement;

    }
}


class App {
    sidebar = new SideBar();
    timer = new Timer(16);
    popup = new Popup();
    answerBox = new AnswerBox();
    answers = [];

    render() {

        this.question = new Question();
        this.question.render();
        this.answer = new Answer(false, this.question.randomChar, this.question.number, this.question.operand, this.question.letters);
        this.answer.rightAnswer();
        this.answer.wrongAnswer();
        this.answer.render("div", ".root");
        this.sidebar.render();
        this.sidebar.showPoints();
        this.isAnswerTrue();
        this.timer.start();
        this.answerBox.render(this.answers);
        this.popup.showRules();

        if (this.sidebar.gameDetails.questionsCount >= 10) {
            this.popup.gameOver(this.sidebar.gameDetails.points / this.sidebar.gameDetails.questionsCount, this.answerBox, this.answers);
        }


    }

    isAnswerTrue() {
        document.querySelector(".AnswerBox").addEventListener("click", (event) => {
            this.isThereAnswer = true;
            if (!this.timer.isTimeLeft) {
                this.answers.push(false);
                return;
            }


            const answerBoxElement = event.target.parentElement;
            this.sidebar.gameDetails.questionsCount++;
            this.sidebar.showPoints();
            this.timer.pause();


            if (event.target.id === "answer0") {
                event.target.className = "right-answer";
                this.answers.push(true);
                this.sidebar.pointCounter();
                this.sidebar.showPoints();


            } else {
                if (event.target.className !== "AnswerBox") {
                    event.target.className = "wrong-answer";
                    document.querySelector("#answer0").className = "right-answer";
                    this.answers.push(false);

                }

            }


            if (answerBoxElement.className !== "root") {
                answerBoxElement.classList.toggle("AnswerBox-invisible");
            }

            this.answerBox.reset();
            this.answerBox.render(this.answers);


        });
    }


    nextQuestion() {
        document.querySelector("button").addEventListener("click", (ev) => {

            Render.reset(".root");
            this.answerBox.reset();
            this.render();

            this.timer.pause();
            this.sidebar.gameDetails.questionsCount >= 10 ? this.timer.pause() : this.timer.start();

            if (!this.isThereAnswer) {
                this.sidebar.gameDetails.questionsCount++;
                this.sidebar.showPoints();
                this.answers.push(undefined);
            }
            this.isThereAnswer = false;
        });
    }
}


class SideBar {

    gameDetails = {
        points: 0,
        questionsCount: 0
    };


    pointCounter() {
        return ++(this.gameDetails.points);
    }

    render() {
        let countElement = new Render("div", ".root").display();
        countElement.setAttribute("id", "pointInfo");
        countElement.innerHTML = this.gameDetails.points;
    }

    showPoints() {
        const pointBoxElement = document.getElementById("pointInfo");
        pointBoxElement.innerHTML = `Your have ${this.gameDetails.points} points out of ${this.gameDetails.questionsCount} questions`;
    }


}


class Timer {
    constructor(maxTime = 15) {
        this.isTimeLeft = true;
        this.initialVal = maxTime;
        this.isRunning = false;
        this.currTimer = maxTime;

        this.timer = document.getElementById('timer');
    }

    start() {
        if (!this.isRunning) {
            this.isTimeLeft = true;
            this.isRunning = true;
            this.currTimer = this.initialVal;
            this.runTimer = setInterval(() => {
                if (this.currTimer <= 0) {
                    this.isTimeLeft = false;
                    return;
                }
                this.timer.innerHTML = this.currTimer < 11 ? "Timer 00:0" + --this.currTimer : "Timer 00:" + --this.currTimer;

            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            clearInterval(this.runTimer);
            this.isRunning = false;
        }
    }

}


class Popup {

    gameOver(message) {
        const popUpElement = new Render("div", ".root", "game-over-container").display();
        popUpElement.addEventListener("click", (ev) => {
            ev.target.className === "game-over-container" ? Run.restart() : "";
        });

        const popupMessageElement = new Render("div", ".game-over-container", "popup-message").display();
        const messageElement = new Render("div", ".popup-message", "message").display();

        messageElement.innerHTML = `<div id="game-over-text"> Game is over  <br>
                                    You earned ${message.toFixed(1) * 100}% </div> `;

        const copiedProgressBar = document.querySelector(".boxContainer").cloneNode(true);
        copiedProgressBar.style.width = "100%";
        messageElement.appendChild(copiedProgressBar);

        const btnContainerElement = new Render("div", ".popup-message", "btnContainer").display();
        const newGameBtn = new Render("input", ".btnContainer", "newGameBtn").display();

        newGameBtn.setAttribute("type", "button");
        newGameBtn.setAttribute("value", "New game");

        newGameBtn.addEventListener("click", () => {
            Run.restart();
        });


    }

    showRules() {
        const rulesBtn = new Render("div", ".root", "rulesBtn").display();
        rulesBtn.innerHTML = "Show rules";
rulesBtn.addEventListener("mouseenter", ()=> {
    // alert("hello")
})
        const popupRules = new Render("div", ".rulesBtn", "rulesMessage").display();
        popupRules.innerHTML =
            "A simple game, where player should find the correct letter in the English Alphabet according to given initial letter and number. " +

            "For Example, it is given \"A\" + 3. You should find 3rd letter to right from \"A\". And it is \"D\".   "

    }
}


class AnswerBox {
    boxItems = [];

    reset() {
        this.boxContainer.parentElement.removeChild(this.boxContainer);
    }

    render(boxItems) {
        this.boxItems = boxItems;

        this.boxContainer = new Render("div", ".heading").display();
        this.boxContainer.className = "boxContainer";


        for (let i = 0; i < 10; i++) {
            this.boxElement = document.createElement("div");
            this.boxElement.innerHTML = `${i + 1}`;
            if (this.boxItems[i] === undefined) {
                this.boxElement.classList.add("answerBox");
            } else if (this.boxItems[i]) {
                this.boxElement.classList.add("correctAnswer");

            } else {
                this.boxElement.classList.add("wrongAnswer");
            }

            this.boxContainer.appendChild(this.boxElement);
        }
    }
}

class Run {

    static letterGame() {
        this.app = new App();
        this.app.render();
        this.app.nextQuestion();
    }

    static restart() {
        location.reload();
    }
}


Run.letterGame();








