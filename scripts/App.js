/**
 * fetches random letter,  number and operator ( + or - ) to construct the question.
 */
class Question {


    englishLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    max;
    operand;
    number;
    questionText;
    randomChar;

    constructor(letters) {
        this.letters = letters || this.englishLetters;
    }

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

/**
 * some logic to suggest 1 correct and 3 incorrect options.
 */
class Answer {
    rightChar;
    wrongChars = [];

    constructor(isCorrect = false, char, num, operand, letters) {
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


    /**
     * renders options to question.
     * @param tagName
     * @param selector
     * @param className
     */
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

/**
 * this class constructor expects a tag, a selector and a className.
 * display() method creates DOM element according to given  HTML tag, adds to that element a className.
 * After all appends to given selector.
 *
 */
class Render {
    constructor(tagName, selector, className) {
        this.tagName = tagName;
        this.selector = selector;
        this.className = className;
    }

    /**
     * sets inner HTML of the given DOM Element to empty string.
     * @param selector
     */
    static reset(selector) {
        const element = document.querySelector(selector);
        element.innerHTML = "";
    }

    /**
     * creates HTML elements according to given arguments.
     * @returns {HTMLElement} HTML Element
     */
    display() {
        const rootElement = document.querySelector(this.selector);
        const createdElement = document.createElement(this.tagName);
        createdElement.className = this.className;
        rootElement.appendChild(createdElement);
        return createdElement;

    }
}

/**
 * the main class which renders answers, options, question, timer etc.
 */
class App {

    maxTime;
    letters;
    sidebar = new SideBar();
    answerBoxCount;
    answers = [];
    targets = [];

    constructor(letters, maxTime, answerBoxCount) {
        this.answerBoxCount = answerBoxCount;
        this.answerBox = new AnswerBox(this.answers, this.answerBoxCount);
        this.letters = letters;
        this.maxTime = maxTime;
        this.timer = new Timer(this.maxTime);
    }

    /**
     * renders all DOM elements.
     */
    render() {
        this.popup = new Popup(this.letters);
        this.question = new Question(this.letters);
        this.question.render();
        this.answer = new Answer(false, this.question.randomChar, this.question.number, this.question.operand, this.question.letters);
        this.answer.rightAnswer();
        this.answer.wrongAnswer();
        this.answer.render("div", ".root");
        this.sidebar.render();
        this.sidebar.showPoints();
        this.isAnswerTrue();
        this.timer.start();
        this.answerBox.render();
        this.popup.showRules();

        if (this.sidebar.gameDetails.questionsCount >= this.answerBoxCount) {
            this.popup.gameOver(this.sidebar.gameDetails.points / this.sidebar.gameDetails.questionsCount, this.answerBox, this.answers);
        }
    }

    /**
     * some logic to check if answer true or false and according to that sets some styles.
     */
    isAnswerTrue() {
        document.querySelector(".AnswerBox").addEventListener("click", (event) => {
            this.isThereAnswer = true;
            if (!this.timer.isTimeLeft) {
                this.answers.push(false);
                return;
            }


            const answerBoxElement = event.target.parentElement;
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


            // this.nextQuestionHandler(2000);

        });
    }


    nextQuestionHandler(milliSeconds) {
        this.sidebar.gameDetails.questionsCount++;


        Render.reset(".root");
        this.answerBox.reset();
        this.render();

        this.timer.pause();
        this.sidebar.gameDetails.questionsCount >= this.answerBoxCount ? this.timer.pause() : this.timer.start();


        if (!this.isThereAnswer) {
            this.sidebar.showPoints();
            this.answers.push(undefined);
        }
        this.isThereAnswer = false;

    }


    nextQuestion() {
        document.querySelector("button").addEventListener("click", this.nextQuestionHandler.bind(this));
    }
}

/**
 * calculate and render correct answers out of all questions.
 */
class SideBar {

    gameDetails = {
        points: 0,
        questionsCount: 0
    };

    /**
     * increases points
     * @returns {number} points
     */
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


/**
 * creates timer, if not given parameter, by default it is 16 seconds.
 */
class Timer {
    constructor(maxTime = 16) {

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


/**
 * show some popup boxes. For example, game over, or rules
 */
class Popup {

    constructor(letters) {
        this.letters = letters;

    }

    /**
     *  shows game Over popup box
     * @param message number which is fraction of correct answers.
     */
    gameOver(message) {
        const popUpElement = new Render("div", ".root", "game-over-container").display();
        popUpElement.addEventListener("click", (ev) => {
            ev.target.className === "game-over-container" ? Run.restart() : "";
        });

        new Render("div", ".game-over-container", "popup-message").display();
        const messageElement = new Render("div", ".popup-message", "message").display();

        messageElement.innerHTML = `<div id="game-over-text"> Game is over  <br>
                                    You earned ${message.toFixed(1) * 100}% </div> `;

        const copiedProgressBar = document.querySelector(".boxContainer").cloneNode(true);
        copiedProgressBar.className = ("popupBoxContainer");
        messageElement.appendChild(copiedProgressBar);

        new Render("div", ".popup-message", "btnContainer").display();
        const newGameBtn = new Render("input", ".btnContainer", "newGameBtn").display();

        newGameBtn.setAttribute("type", "button");
        newGameBtn.setAttribute("value", "New game");

        newGameBtn.addEventListener("click", () => {
            Run.restart();
        });


    }

    /**
     * popups rule box on mouse enter
     */
    showRules() {
        const rulesBtn = new Render("div", ".root", "rulesBtn").display();
        rulesBtn.innerHTML = "Show rules";
        rulesBtn.addEventListener("mouseenter", () => {
            // alert("hello")
        });
        const popupRules = new Render("div", ".rulesBtn", "rulesMessage").display();
        popupRules.innerHTML = `A simple game, where player should find the correct letter in the Alphabet according to given initial letter and number. 

            For Example, it is given  ${this.letters[0]}  + 3. You should find 3rd letter to right from  ${this.letters[0]} . And it is ${this.letters[3]} .`;

    }
}

/**
 * Class to create answers box, which contains true, false and missed boxes. (above 10 boxes by default)
 */
class AnswerBox {
    boxItems = [];
    boxCount;

    constructor(boxItems, boxCount = 10) {
        this.boxItems = boxItems;
        this.boxCount = boxCount;
    }

    /**
     * resets the answer box
     */
    reset() {
        this.boxContainer.parentElement.removeChild(this.boxContainer);
    }


    /**
     * @param boxItems is the answers received from user.
     * creates answer box (above 10 boxes) and styles it according to given answer.
     *
     */
    render() {

        this.boxContainer = new Render("div", ".heading").display();
        this.boxContainer.className = "boxContainer";


        for (let i = 0; i < this.boxCount; i++) {
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

/**
 * The instance of this class runs the app using letterGame() method
 * You can pass any language alphabet, and max time for timer.
 * Alphabet should pass as an array
 */
class Run {
    letters;
    maxTime;


    constructor(letters, maxTime, answerBoxCount) {
        this.letters = letters;
        this.maxTime = maxTime;
        this.answerBoxCount = answerBoxCount;
    }

    /**
     * Static method, refreshes browser page to restart the app;
     */
    static restart() {
        location.reload();
    }

    /**
     * Runs the app
     */
    letterGame() {
        this.app = new App(this.letters, this.maxTime, this.answerBoxCount);
        this.app.render();
        this.app.nextQuestion();
    }
}


const armenianLetters = ["Ա", "Բ", "Գ", "Դ", "Ե", "Զ", "Է", "Ը", "Թ", "Ժ", "Ի", "Լ", "Խ", "Ծ", "Կ", "Հ", "Ձ", "Ղ", "Ճ", "Մ", "Յ", "Ն", "Շ", "Ո", "Չ", "Պ", "Ջ", "Ռ", "Ս", "Վ", "Տ", "Ր", "Ց", "Ու", "Փ", "Ք", "ԵՎ", "Օ", "Ֆ"];
const englishLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const letterGame = new Run(englishLetters, 11, 15);

letterGame.letterGame();








