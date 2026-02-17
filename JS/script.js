const lightSwitch = document.getElementById('light-switch');
const body = document.body;
const cube = document.getElementById('cube');
const vaultIcon = document.getElementById('vault-icon');
const keypadModal = document.getElementById('keypad-modal');
const closeKeypad = document.getElementById('close-keypad');
const display = document.getElementById('display');
const keys = document.querySelectorAll('.key[data-num]');
const clearBtn = document.getElementById('clear-btn');
const enterBtn = document.getElementById('enter-btn');

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationX = -22;
let rotationY = -35;

body.classList.add('light-mode');
lightSwitch.classList.add('on');

lightSwitch.addEventListener('click', () => {
  lightSwitch.classList.toggle('on');
  body.classList.toggle('light-mode');
});

cube.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isDragging = true;
  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
  cube.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMouseX;
  const deltaY = e.clientY - previousMouseY;
  rotationY += deltaX * 0.5;
  rotationX -= deltaY * 0.5;
  updateCubeRotation();
  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    cube.style.cursor = 'grab';
  }
});

cube.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDragging = true;
  const touch = e.touches[0];
  previousMouseX = touch.clientX;
  previousMouseY = touch.clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - previousMouseX;
  const deltaY = touch.clientY - previousMouseY;
  rotationY += deltaX * 0.5;
  rotationX -= deltaY * 0.5;
  updateCubeRotation();
  previousMouseX = touch.clientX;
  previousMouseY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', () => {
  isDragging = false;
});

function updateCubeRotation() {
  cube.style.animation = 'none';
  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
}

vaultIcon.addEventListener('click', () => {
  keypadModal.classList.add('active');
  resetKeypad();
});

closeKeypad.addEventListener('click', () => {
  keypadModal.classList.remove('active');
});

keypadModal.addEventListener('click', (e) => {
  if (e.target === keypadModal || e.target.classList.contains('keypad-backdrop')) {
    keypadModal.classList.remove('active');
  }
});

let currentCode = '';
const correctCode = '2005';

keys.forEach(key => {
  key.addEventListener('click', () => {
    if (currentCode.length < 4) {
      currentCode += key.dataset.num;
      updateDisplay();
      playKeySound();
    }
  });
});

clearBtn.addEventListener('click', () => {
  currentCode = '';
  updateDisplay();
  playKeySound();
});

enterBtn.addEventListener('click', () => {
  checkCode();
});

document.addEventListener('keydown', (e) => {
  if (keypadModal.classList.contains('active')) {
    if (e.key === 'Enter') {
      checkCode();
    } else if (e.key === 'Backspace') {
      currentCode = currentCode.slice(0, -1);
      updateDisplay();
    } else if (e.key >= '0' && e.key <= '9' && currentCode.length < 4) {
      currentCode += e.key;
      updateDisplay();
    }
  }
});

function updateDisplay() {
  const digits = display.querySelectorAll('.digit');
  const codeArray = currentCode.padEnd(4, '_').split('');
  digits.forEach((digit, index) => {
    digit.textContent = codeArray[index];
    if (codeArray[index] !== '_') {
      digit.classList.add('filled');
      setTimeout(() => digit.classList.remove('filled'), 300);
    }
  });
}

const accessGrantedModal = document.getElementById('access-granted-modal');
const proceedBtn = document.getElementById('proceed-btn');

function checkCode() {
  if (currentCode.length !== 4) return;
  if (currentCode === correctCode) {
    playSuccessSound();
    keypadModal.classList.remove('active');
    setTimeout(() => {
      accessGrantedModal.classList.add('active');
    }, 350);
  } else {
    const displayElement = display;
    displayElement.style.animation = 'shake 0.5s';
    const digits = display.querySelectorAll('.digit');
    digits.forEach(digit => {
      digit.style.color = '#ff4444';
      digit.style.textShadow = '0 0 20px rgba(255, 68, 68, 0.8)';
    });
    setTimeout(() => {
      displayElement.style.animation = '';
      digits.forEach(digit => {
        digit.style.color = '';
        digit.style.textShadow = '';
      });
      currentCode = '';
      updateDisplay();
    }, 600);
  }
}

proceedBtn.addEventListener('click', () => {
  const theme = body.classList.contains('light-mode') ? 'light' : 'dark';
  window.location.href = 'VaultOpened.html?theme=' + theme;
});

function resetKeypad() {
  currentCode = '';
  updateDisplay();
}

function playKeySound() {}

function playSuccessSound() {}

const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

updateDisplay();

document.querySelectorAll('img, svg').forEach(element => {
  element.addEventListener('dragstart', (e) => e.preventDefault());
});
