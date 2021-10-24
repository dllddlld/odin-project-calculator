const MAX_CHAR = 22;
const allButtons = document.querySelectorAll('button');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const specialButtons = document.querySelectorAll('.special');
let buttonMapping = [];
let currentDisplay = document.querySelector('#current').textContent;
let previousDisplay = document.querySelector('#previous').textContent;
let stashedNumber = currentDisplay;
let stashedOperator;
let clearDisplayOnNextEntry = false;

const add = function(num1, num2) {
    let result = new Decimal(num1).plus(num2);
    return result.toString();
}

const subtract = function(num1, num2) {
    let result = new Decimal(num1).minus(num2);
    return result.toString();
}

const multiply = function(num1, num2) {
    let result = new Decimal(num1).times(num2);
    return result.toString();
}

const divide = function(num1, num2) {
    if (new Decimal(num2).isZero()) return 'Cannot divide by zero';
    let result = new Decimal(num1).dividedBy(num2);
    return result.toString();
}

const execute = function(num1, num2) {
    if (isNullOrEmpty(stashedOperator)) return;
    if (!stashedOperator.hasOwnProperty('fn')) return;
    return stashedOperator.fn(num1, num2);
}

// const backspace = function() {

// }

addButtonMapping();
addPageListeners();

function addButtonMapping() {
    numberButtons.forEach(button => {
        buttonMapping.push(
            createButtonData(button.textContent, button.textContent, null, false)
        );
    });
    buttonMapping.push(
        createButtonData('+', '+', add, false),
        createButtonData('-', '-', subtract, false),
        createButtonData('*', '*', multiply, false),
        createButtonData('/', '/', divide, false),
        createButtonData('=', '=', execute, true),
        createButtonData('=', 'Enter', execute, true),
        // createButtonData('&#8617;', 'Backspace', execute, true),
    );
}

function createButtonData(text, key, fn, resetAfterFn) {
    return {text: text, key: key, fn: fn, resetAfterFn: resetAfterFn};
}

function handleKeyEvent(e) {
    let buttonData = getButtonData(null, e.key);
    if (isNullOrEmpty(buttonData)) return;
    let button = [...allButtons].find(btn => btn.textContent === buttonData.text);
    if (isNullOrEmpty(button)) return;
    button.click();
}

function doOperation() {
    let operator = getButtonData(this.textContent);
    if (isNullOrEmpty(operator)) return;
    if (isNullOrEmpty(stashedOperator)) {
        if (operator.text === '=') return;
        stashedOperator = operator;
        previousDisplay = currentDisplay + ' ' + stashedOperator.text;
    } else {
        previousDisplay = stashedNumber + ' ' + stashedOperator.text + ' ' + currentDisplay;
        currentDisplay = stashedOperator.fn(stashedNumber, currentDisplay);
        updateDisplay('#current', currentDisplay);
        stashedOperator = operator.resetAfterFn ? null : operator;
    }
    stashedNumber = currentDisplay;
    clearDisplayOnNextEntry = true;
    updateDisplay('#previous', previousDisplay);
}

// function doSpecialOperation() {
//     let specialOperator = getButtonData(this.textContent);
//     if (isNullOrEmpty(specialOperator)) return;
// }

function getButtonData(textContent, key) {
    let button;
    if (!isNullOrEmpty(textContent)) {
        button = buttonMapping.find(btn => btn.text === textContent);
    } else if (!isNullOrEmpty(key)) {
        button = buttonMapping.find(btn => btn.key === key);
    }
    return !isNullOrEmpty(button) ? button : null;
}

function addToCurrentDisplay() {
    if (this.textContent === '0' && currentDisplay === '0') return;
    if (this.textContent === '.' && currentDisplay.indexOf('.') !== -1) return;
    if (currentDisplay.length === MAX_CHAR) return;
    if (currentDisplay === '0' && this.textContent !== '.') {
        currentDisplay = this.textContent;
    } else if (clearDisplayOnNextEntry) {
        updateDisplay('#previous', currentDisplay + ' ' + stashedOperator.text);
        currentDisplay = this.textContent;
        clearDisplayOnNextEntry = false;
    } else {
        currentDisplay += this.textContent;
    }
    updateDisplay('#current', currentDisplay);
}

function updateDisplay(elementId, value) {
    let element = document.querySelector(elementId);
    element.textContent = value;
}

function addPageListeners() {
    numberButtons.forEach(button => {
        button.addEventListener('click', addToCurrentDisplay);
    });
    operatorButtons.forEach(button => {
        button.addEventListener('click', doOperation);
    });
    // specialButtons.forEach(button => {
    //     button.addEventListener('click', doSpecialOperation);
    // });
    document.addEventListener('keydown', handleKeyEvent);
}

function isNullOrEmpty(v) {
    return typeof v === 'undefined' || v === null || v.length === 0;
}

// function format(result) {
//     let characterLength = result.toFixed().length;
//     if (characterLength <= MAX_CHAR) return result.toFixed();
//     let decimalPlaces = result.decimalPlaces();
//     let integerPlaces = result.toFixed(0).length;
//     if (integerPlaces > MAX_CHAR) {
//         return result.toNumber().toString();
//     } else {
//         let formattedDP = Math.min(MAX_CHAR - 1 - integerPlaces, characterLength - decimalPlaces);
//         return result.toFixed(formattedDP);
//     }
// }

