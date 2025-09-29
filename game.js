const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 270, y: 350, width: 60, height: 20 };
let bullets = [];
let aliens = [];
let score = 0;

// Generate aliens
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    aliens.push({ x: 50 + i*100, y: 50 + j*40, width: 40, height: 30 });
  }
}

// Game loop
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw player
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  // Draw aliens
  ctx.fillStyle = 'red';
  aliens.forEach(a => ctx.fillRect(a.x, a.y, a.width, a.height));

  // Move bullets
  bullets.forEach((b, index) => {
    b.y -= 5;
    aliens.forEach((a, aIndex) => {
      if (b.x < a.x + a.width && b.x + b.width > a.x &&
          b.y < a.y + a.height && b.y + b.height > a.y) {
        aliens.splice(aIndex, 1);
        bullets.splice(index, 1);
        score += 10;
      }
    });
  });

  requestAnimationFrame(draw);
}

draw();

// Player controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 10;
  if (e.key === 'ArrowRight' && player.x + player.width < canvas.width) player.x += 10;
  if (e.key === ' ') bullets.push({ x: player.x + player.width/2 - 2, y: player.y, width: 4, height: 10 });
});

// Submit score
document.getElementById('submitScoreBtn').addEventListener('click', async () => {
  const playerName = document.getElementById('playerName').value || "Anonymous";
  await fetch('http://127.0.0.1:8000/submit_score', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ player_name: playerName, score })
  });
  fetchLeaderboard();
});

// Fetch leaderboard
async function fetchLeaderboard() {
  const res = await fetch('http://127.0.0.1:8000/leaderboard');
  const data = await res.json();
  const list = document.getElementById('leaderboard');
  list.innerHTML = '';
  data.leaderboard.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item[0]} - ${item[1]} points (${item[2]} games)`;
    list.appendChild(li);
  });
}

fetchLeaderboard();
