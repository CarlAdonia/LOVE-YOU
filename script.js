const TEXTS = [
  'Murah ❤️', 'Je t\'aime Murah 💖', 'For you Murah 🌹',
  'Murah mon amour 💕', 'Rien que toi Murah 💋', 'Murah pour toujours 💞',
  'Tu es ma vie Murah 🥰', 'Murah je t\'adore ❤️‍🔥', 'Murah forever 💍',
  'I love you bbe 💕', 'Je t\'aime mon cœur ❤️', 'Te quiero mucho 🌹',
  'Tu es ma vie 💖', 'Tiako ianao 💗', 'You are my everything 🥰',
  'Mi amor ❤️‍🔥', 'Je t\'adore 💓', 'My heart is yours 💝',
  'Pour toi pour toujours 💞', 'Mon tout petit cœur 🫶',
  'Solo tú 🌺', 'Forever yours 💍', 'Mon bébé chéri 🌷',
  'I choose you every day 💘', 'Murah tu es unique 🌟', 'Murah my love 💘',
  'Murah 💕', 'Mon amour 💖', 'Bbe ❤️', 'Toujours toi 💫',
  'Murah chéri 🌸', 'Only you 💝', 'Murah 🥰', 'T\'aime fort 💗',
  'Murah mon soleil ☀️', 'Je t\'aime 💋', 'My love 🌹', 'Pour toi 💞',
];

const PHOTOS = [
  'images/photo1.jpg', 'images/photo2.jpg', 'images/photo3.jpg',
  'images/photo4.jpg', 'images/photo5.jpg', 'images/photo6.jpg',
  'images/photo7.jpg', 'images/photo8.jpg',
];

const EMOJIS = ['❤️','💕','💖','💗','💓','💞','💝','🌹','🥰','😍','💋','🫶','💫','✨','🌸','💘','❤️‍🔥','🌺','💍','🌷','⭐','🌟','💥','🎇'];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const CX = canvas.width / 2;
const CY = canvas.height / 2;

let phase = 0;
let phaseTime = 0;
let lastTimestamp = 0;
let globalTime = 0;
let exploded = false;

// ---- PAILLETTES — simples points scintillants ----
const sparkles = [];
for (let i = 0; i < 150; i++) {
  sparkles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    offset: Math.random() * Math.PI * 2,
    color: Math.random() > 0.5 ? '#ff69b4' : '#ffffff',
  });
}

function drawSparkles() {
  sparkles.forEach(s => {
    const a = 0.2 + 0.8 * Math.abs(Math.sin(globalTime * 2 + s.offset));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ---- PHOTOS ----
const photoObjects = PHOTOS.map((src, i) => {
  const img = new Image();
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.8 + Math.random() * 1.2;
  const obj = {
    img,
    loaded: false,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    w: 120 + Math.random() * 100,
    alpha: 0,
    targetAlpha: 0.55 + Math.random() * 0.35,
    rot: (Math.random() - 0.5) * 0.4,
    rotSpeed: (Math.random() - 0.5) * 0.004,
    floatOffset: Math.random() * Math.PI * 2,
    layer: i % 3,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    dirTimer: 0,
    dirInterval: 2 + Math.random() * 3,
  };
  img.onload = () => { obj.loaded = true; };
  img.src = src;
  return obj;
});

function drawPhoto(obj, dt) {
  if (!obj.loaded || obj.alpha <= 0) return;
  const ratio = obj.img.naturalHeight / obj.img.naturalWidth;
  const w = obj.w;
  const h = w * ratio;

  obj.dirTimer += dt * 0.016;
  if (obj.dirTimer > obj.dirInterval) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 1.4;
    obj.vx = Math.cos(angle) * speed;
    obj.vy = Math.sin(angle) * speed;
    obj.dirTimer = 0;
    obj.dirInterval = 2 + Math.random() * 3;
  }

  obj.x += obj.vx * dt;
  obj.y += obj.vy * dt;
  obj.rot += obj.rotSpeed;

  if (obj.x < -w) obj.x = canvas.width + w;
  if (obj.x > canvas.width + w) obj.x = -w;
  if (obj.y < -h) obj.y = canvas.height + h;
  if (obj.y > canvas.height + h) obj.y = -h;

  ctx.save();
  ctx.globalAlpha = obj.alpha;
  ctx.translate(obj.x + w / 2, obj.y + h / 2);
  ctx.rotate(obj.rot);
  ctx.shadowColor = 'rgba(255,100,180,0.5)';
  ctx.shadowBlur = 20;
  ctx.drawImage(obj.img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ---- PLUIE TEXTES ----
const rainDrops = [];
for (let i = 0; i < 100; i++) {
  rainDrops.push({
    text: TEXTS[Math.floor(Math.random() * TEXTS.length)],
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: 4 + Math.random() * 5,
    size: Math.random() * 20 + 10,
    alpha: 0.65 + Math.random() * 0.35,
    style: Math.floor(Math.random() * 3),
    active: false,
  });
}

// ---- PLUIE EMOJIS ----
const emojiDrops = [];
for (let i = 0; i < 45; i++) {
  emojiDrops.push({
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 1.2,
    vy: 3.5 + Math.random() * 4,
    size: Math.random() * 26 + 12,
    alpha: 0.7 + Math.random() * 0.3,
    pulse: Math.random() * Math.PI * 2,
    active: false,
  });
}

// ---- EXPLOSION ----
function triggerRain() {
  rainDrops.forEach(d => {
    d.active = true;
    d.x = Math.random() * canvas.width;
    d.y = -60 - Math.random() * 300;
  });
  emojiDrops.forEach(e => {
    e.active = true;
    e.x = Math.random() * canvas.width;
    e.y = -40 - Math.random() * 300;
  });
  photoObjects.forEach(o => { o.alpha = o.targetAlpha; });
}

// ---- COEUR ----
function heartPath(x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x, y - size * 0.5, x - size, y - size * 0.5, x - size, y);
  ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size * 1.1, x, y + size * 1.1);
  ctx.bezierCurveTo(x, y + size * 1.1, x + size, y + size * 0.6, x + size, y);
  ctx.bezierCurveTo(x + size, y - size * 0.5, x, y - size * 0.5, x, y);
  ctx.closePath();
}

let ballRadius = 0, ballAlpha = 0, heartSize = 0;

// ---- BOUCLE ----
function animate(timestamp) {
  requestAnimationFrame(animate);
  const delta = Math.min((timestamp - lastTimestamp) / 16.67, 3);
  lastTimestamp = timestamp;
  phaseTime += 0.016 * delta;
  globalTime += 0.01 * delta;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // PHASE 0 — Noir
  if (phase === 0) {
    if (phaseTime > 5) { phase = 1; phaseTime = 0; }
    return;
  }

  // PHASE 1 — Boule
  if (phase === 1) {
    ballAlpha = Math.min(1, phaseTime);
    ballRadius = 15 + (phaseTime / 2) * 70;
    ctx.save();
    ctx.globalAlpha = ballAlpha;
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, ballRadius);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, '#ff69b4');
    g.addColorStop(1, 'rgba(255,20,147,0)');
    ctx.fillStyle = g;
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(CX, CY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (phaseTime > 2) { phase = 2; phaseTime = 0; }
    return;
  }

  // PHASE 2 — Coeur
  if (phase === 2) {
    const p = Math.min(1, phaseTime / 1.5);
    heartSize = 90 * p;
    ctx.save();
    ctx.globalAlpha = 1 - p;
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, ballRadius);
    g.addColorStop(0, '#ff69b4');
    g.addColorStop(1, 'rgba(255,20,147,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(CX, CY, ballRadius * (1 - p * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = '#ff69b4';
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 40;
    heartPath(CX, CY - heartSize * 0.5, heartSize);
    ctx.fill();
    ctx.restore();
    if (phaseTime > 1.5) { phase = 3; phaseTime = 0; }
    return;
  }

  // PHASE 3 — Explosion
  if (phase === 3) {
    const p = Math.min(1, phaseTime / 0.8);
    const bigSize = heartSize + p * 350;
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.fillStyle = '#ff69b4';
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 80;
    heartPath(CX, CY - bigSize * 0.5, bigSize);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    if (!exploded && phaseTime > 0.1) { triggerRain(); exploded = true; }
    if (phaseTime > 0.8) { phase = 4; phaseTime = 0; }
    return;
  }

  // PHASE 4 — Animation principale
  if (phase === 4) {

    // Paillettes fond
    drawSparkles();

    // Photos derrière
    photoObjects.filter(o => o.layer === 0).forEach(o => drawPhoto(o, delta));

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pluie textes
    rainDrops.forEach(d => {
      if (!d.active) return;
      d.x += d.vx * delta;
      d.y += d.vy * delta;
      if (d.y > canvas.height + 60) {
        d.x = Math.random() * canvas.width;
        d.y = -50;
        d.text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
        d.vx = (Math.random() - 0.5) * 0.6;
        d.vy = 1.8 + Math.random() * 2.2;
        d.style = Math.floor(Math.random() * 3);
      }
      if (d.x < -200) d.x = canvas.width + 50;
      if (d.x > canvas.width + 200) d.x = -50;
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.font = `bold ${d.size}px Arial`;
      if (d.style === 0) {
        ctx.fillStyle = '#00eeff';
        ctx.shadowColor = '#00eeff';
        ctx.shadowBlur = 12;
      } else if (d.style === 1) {
        ctx.fillStyle = '#ff69b4';
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffccff';
        ctx.shadowBlur = 8;
      }
      ctx.fillText(d.text, d.x, d.y);
      ctx.restore();
    });

    // Photos milieu
    photoObjects.filter(o => o.layer === 1).forEach(o => drawPhoto(o, delta));

    // Pluie emojis
    emojiDrops.forEach(e => {
      if (!e.active) return;
      e.pulse += 0.05 * delta;
      e.x += e.vx * delta;
      e.y += e.vy * delta;
      const s = e.size * (1 + 0.15 * Math.sin(e.pulse));
      if (e.y > canvas.height + 50) {
        e.x = Math.random() * canvas.width;
        e.y = -40;
        e.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        e.vx = (Math.random() - 0.5) * 1.0;
        e.vy = 1.0 + Math.random() * 2.0;
      }
      if (e.x < -50) e.x = canvas.width + 20;
      if (e.x > canvas.width + 50) e.x = -20;
      ctx.save();
      ctx.globalAlpha = e.alpha;
      ctx.font = `${s}px Arial`;
      ctx.fillText(e.emoji, e.x, e.y);
      ctx.restore();
    });

    // Photos devant
    photoObjects.filter(o => o.layer === 2).forEach(o => drawPhoto(o, delta));
  }
}

requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});