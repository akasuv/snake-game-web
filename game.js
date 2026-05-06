const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');
const GRID   = 20;
const CELL   = canvas.width / GRID;
const FPS    = 8;

let snake, dir, nextDir, food, score, best, running, loopId;

best = +(localStorage.getItem('snakeBest') || 0);
document.getElementById('best').textContent = best;

function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

function placeFood() {
  let pos;
  do {
    pos = { x: rand(0, GRID), y: rand(0, GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function showOverlay(title, scoreText) {
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-score').textContent = scoreText;
  document.getElementById('overlay').classList.add('active');
}

function hideOverlay() {
  document.getElementById('overlay').classList.remove('active');
}

function init() {
  const mid = Math.floor(GRID / 2);
  snake   = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score   = 0;
  running = true;
  document.getElementById('score').textContent = score;
  placeFood();
  hideOverlay();
  if (loopId) clearInterval(loopId);
  loopId = setInterval(tick, 1000 / FPS);
}

function tick() {
  if (!running) return;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) return gameOver();
  if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameOver() {
  running = false;
  clearInterval(loopId);
  if (score > best) {
    best = score;
    localStorage.setItem('snakeBest', best);
    document.getElementById('best').textContent = best;
  }
  showOverlay('Game Over', 'Score: ' + score);
  draw();
}

function draw() {
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
  }
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    ctx.fillStyle = isHead ? '#00ff88' : 'hsl(' + (140 + i * 2) + ', 80%, ' + (55 - i * 0.5) + '%)';
    const pad = isHead ? 1 : 2;
    ctx.fillRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
  });
}

const KEYMAP = {
  ArrowUp:    { x:  0, y: -1 },
  ArrowDown:  { x:  0, y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x:  1, y:  0 },
  w: { x:  0, y: -1 }, a: { x: -1, y:  0 },
  s: { x:  0, y:  1 }, d: { x:  1, y:  0 },
  W: { x:  0, y: -1 }, A: { x: -1, y:  0 },
  S: { x:  0, y:  1 }, D: { x:  1, y:  0 },
};

document.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); init(); return; }
  const nd = KEYMAP[e.key];
  if (!nd) return;
  e.preventDefault();
  if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;
});

init();