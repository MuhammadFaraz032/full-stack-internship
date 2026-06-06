'use strict';

// ─── STATE ───────────────────────────────────────────
const state = {
  current:      '0',
  previous:     '',
  operator:     null,
  waitingForOperand: false,
  justEqualed:  false,
};

// ─── DOM ─────────────────────────────────────────────
const displayMain = document.getElementById('display');
const displayExpr = document.getElementById('expression');

// ─── DISPLAY ─────────────────────────────────────────
function updateDisplay() {
  const val = state.current;

  // size class based on length
  displayMain.classList.remove('small', 'xsmall', 'error');
  if (val.length > 12) displayMain.classList.add('xsmall');
  else if (val.length > 8) displayMain.classList.add('small');

  displayMain.textContent = val;

  // expression line
  if (state.operator && !state.waitingForOperand) {
    displayExpr.textContent = `${state.previous} ${state.operator}`;
  } else if (state.operator && state.waitingForOperand) {
    displayExpr.textContent = `${state.previous} ${state.operator}`;
  } else {
    displayExpr.textContent = '\u00a0';
  }
}

function showError(msg = 'Error') {
  displayMain.classList.add('error');
  displayMain.textContent = msg;
  displayExpr.textContent = '\u00a0';
  resetState();
}

function resetState() {
  state.current = '0';
  state.previous = '';
  state.operator = null;
  state.waitingForOperand = false;
  state.justEqualed = false;
}

// ─── ACTIONS ─────────────────────────────────────────
function inputNumber(digit) {
  if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else {
    // after equals, start fresh
    if (state.justEqualed) {
      state.current = digit;
      state.previous = '';
      state.operator = null;
      state.justEqualed = false;
    } else {
      state.current = state.current === '0' ? digit : state.current + digit;
    }
  }
  // cap at 12 digits
  if (state.current.replace('-', '').replace('.', '').length > 12) return;
  updateDisplay();
}

function inputDecimal() {
  if (state.waitingForOperand) {
    state.current = '0.';
    state.waitingForOperand = false;
    updateDisplay();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    updateDisplay();
  }
}

function inputOperator(op) {
  const curr = parseFloat(state.current);

  // chain operators without pressing =
  if (state.operator && !state.waitingForOperand) {
    const result = calculate(parseFloat(state.previous), curr, state.operator);
    if (result === null) { showError('Cannot ÷ 0'); return; }
    state.current = formatResult(result);
    state.previous = state.current;
  } else {
    state.previous = state.current;
  }

  state.operator = op;
  state.waitingForOperand = true;
  state.justEqualed = false;
  highlightOperator(op);
  updateDisplay();
}

function inputEquals() {
  if (!state.operator || state.waitingForOperand) return;

  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  const result = calculate(a, b, state.operator);

  if (result === null) { showError('Cannot ÷ 0'); return; }

  displayExpr.textContent = `${state.previous} ${state.operator} ${state.current} =`;
  state.current = formatResult(result);
  state.previous = '';
  state.operator = null;
  state.waitingForOperand = false;
  state.justEqualed = true;

  clearOperatorHighlight();
  updateDisplay();
}

function inputClear() {
  resetState();
  clearOperatorHighlight();
  displayMain.classList.remove('error');
  updateDisplay();
}

function inputSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

function inputPercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = formatResult(val / 100);
  updateDisplay();
}

// ─── CALC ENGINE ────────────────────────────────────
function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
    default: return b;
  }
}

function formatResult(n) {
  if (!isFinite(n)) return 'Error';
  // avoid floating point noise: round to 10 decimal places
  const rounded = parseFloat(n.toPrecision(12));
  // trim trailing zeros
  return String(rounded);
}

// ─── OPERATOR HIGHLIGHT ──────────────────────────────
function highlightOperator(op) {
  clearOperatorHighlight();
  document.querySelectorAll('.btn-op').forEach(btn => {
    if (btn.dataset.value === op) btn.classList.add('active-op');
  });
}

function clearOperatorHighlight() {
  document.querySelectorAll('.btn-op').forEach(btn => btn.classList.remove('active-op'));
}

// ─── BUTTON PRESS ANIMATION ──────────────────────────
function animatePress(btn) {
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 120);
}

// ─── EVENT LISTENERS ────────────────────────────────
document.querySelector('.keypad').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  animatePress(btn);

  const { action, value } = btn.dataset;

  switch (action) {
    case 'number':   inputNumber(value);   break;
    case 'decimal':  inputDecimal();       break;
    case 'operator': inputOperator(value); break;
    case 'equals':   inputEquals();        break;
    case 'clear':    inputClear();         break;
    case 'sign':     inputSign();          break;
    case 'percent':  inputPercent();       break;
  }
});

// ─── INIT ────────────────────────────────────────────
updateDisplay();
