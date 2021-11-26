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
            this.questionText += this.randomChar + this.operand + this.number;
        } else {
            this.max = this.letters.indexOf(this.randomChar);
            this.number = this.randomNum(0, this.max + 1);
            this.questionText += this.randomChar + this.operand + this.number;
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
        let question = this.askQuestion();
        return question;
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


    render(tagName, selector) {
        const answerElement = new Render(tagName, selector).display();


        answerElement.setAttribute("class", "AnswerBox");
        const arrOfElements = [`<div id="answer1"> ${this.wrongChars[1]}</div>`,
            `<div id="answer2"> ${this.wrongChars[2]}</div>`,
            `<div id="answer0"> ${this.wrongChars[0]}</div>`,
            `<div id="answer3"> ${this.wrongChars[3]}</div>`];

        answerElement.innerHTML = `${arrOfElements[0]} 
                                   ${arrOfElements[0]} 
                                   ${arrOfElements[0]}  
                                   ${arrOfElements[0]}`;

    }


}

class Render {
    constructor(tagName, selector) {
        this.tagName = tagName;
        this.selector = selector;
    }

    display() {
        const rootElement = document.querySelector(this.selector);
        const createdElement = document.createElement(this.tagName);
        rootElement.append(createdElement);
        return createdElement;

    }
}


class App {


    static render() {
        const question = new Question();
        question.render();
        const answer = new Answer(false, question.randomChar, question.number, question.operand, question.letters);
        answer.rightAnswer();
        answer.wrongAnswer();
        answer.render("div", ".root");
        // answer.render("div", ".wrongAnswerBox", true);


        console.log(question);
        console.log(answer.rightChar);
        console.log(answer.wrongAnswer());
    }


}


App.render();



