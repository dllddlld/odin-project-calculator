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
    return format(result);
}

const subtract = function(num1, num2) {
    let result = new Decimal(num1).minus(num2);
    return format(result);
}

const multiply = function(num1, num2) {
    let result = new Decimal(num1).times(num2);
    return format(result);
}

const divide = function(num1, num2) {
    if (new Decimal(num2).isZero()) return 'Cannot divide by zero';
    let result = new Decimal(num1).dividedBy(num2);
    return format(result);
}

const execute = function(num1, num2) {
    if (isNullOrEmpty(stashedOperator)) return;
    if (!stashedOperator.hasOwnProperty('fn')) return;
    let result = stashedOperator.fn(num1, num2);
    return format(result);
}

const backspace = function() {
    if (currentDisplay.length === 1) {
        currentDisplay = '0';
    } else {
        currentDisplay = currentDisplay.substring(0, currentDisplay.length - 1);
    }
    updateDisplay('#current', currentDisplay);
}

const clearEntry = function() {
    currentDisplay = '0';
    clearDisplayOnNextEntry = false;
    updateDisplay('#current', currentDisplay);
}

const clearAll = function() {
    clearEntry();
    stashedNumber = '0';
    stashedOperator = null;
    clearDisplayOnNextEntry = false;
    updateDisplay('#previous', '\xA0');
}

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
        createButtonData('\u21A9', 'Backspace', backspace, false),
        createButtonData('CE', 'Delete', clearEntry, false),
        createButtonData('C', 'Escape', clearAll, true)
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
    if (clearDisplayOnNextEntry) {
        if (stashedOperator === operator) return;
        if (operator.text === '=') return;
        stashedOperator = operator;
        previousDisplay = currentDisplay + ' ' + operator.text;
        updateDisplay('#previous', previousDisplay);
        return;
    }
    if (isNullOrEmpty(stashedOperator)) {
        if (operator.text === '=') return;
        stashedOperator = operator;
        previousDisplay = currentDisplay + ' ' + operator.text;
        updateDisplay('#previous', previousDisplay);
    } else {
        if (operator.text === '=') {
            previousDisplay = stashedNumber + ' ' + stashedOperator.text + ' ' + 
                currentDisplay + ' =';
            updateDisplay('#previous', previousDisplay);
            currentDisplay = stashedOperator.fn(stashedNumber, currentDisplay);
        } else {
            currentDisplay = stashedOperator.fn(stashedNumber, currentDisplay);
            previousDisplay = currentDisplay + ' ' + operator.text;
            updateDisplay('#previous', previousDisplay);
        }
        updateDisplay('#current', currentDisplay);
        stashedOperator = operator.resetAfterFn ? null : operator;
    }
    stashedNumber = currentDisplay;
    clearDisplayOnNextEntry = true;
}

function doSpecialOperation() {
    let specialOperator = getButtonData(this.textContent);
    if (isNullOrEmpty(specialOperator)) return;
    specialOperator.fn();
    if (!isNullOrEmpty(stashedOperator)) {
        stashedOperator = specialOperator.resetAfterFn ? null : stashedOperator;
    }
}

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
    if (currentDisplay.length === MAX_CHAR && !clearDisplayOnNextEntry) {
        return;
    }
    if (currentDisplay === '0' && this.textContent !== '.') {
        currentDisplay = this.textContent;
    } else if (clearDisplayOnNextEntry) {
        previousDisplay = !isNullOrEmpty(stashedOperator) ? currentDisplay +
            ' ' + stashedOperator.text : currentDisplay;
        updateDisplay('#previous', previousDisplay);
        currentDisplay = this.textContent;
    } else {
        currentDisplay += this.textContent;
    }
    clearDisplayOnNextEntry = false;
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
    specialButtons.forEach(button => {
        button.addEventListener('click', doSpecialOperation);
    });
    document.addEventListener('keydown', handleKeyEvent);
}

function isNullOrEmpty(v) {
    return typeof v === 'undefined' || v === null || v.length === 0;
}

function format(result) {
    let characterLength = result.toFixed().length;
    if (characterLength <= MAX_CHAR) return result.toFixed();
    let integerPlaces = result.toFixed(0).length;
    if (integerPlaces > MAX_CHAR) {
        return result.toNumber().toString();
    } else {
        let formattedDP = MAX_CHAR - 1 - integerPlaces;
        return result.toFixed(formattedDP);
    }
}

