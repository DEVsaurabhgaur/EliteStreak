// ============================================
// Particle Effects System
// Celebrations for level-ups, achievements,
// streak milestones, and perfect days
// ============================================

export function spawnParticles(x, y, count = 30, colors = ['#00ff88', '#7c3aed', '#ffd700', '#ff6b35', '#00d4ff']) {
  const root = document.getElementById('particles-root');
  if (!root) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 8 + 4;
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const velocity = Math.random() * 200 + 100;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - Math.random() * 100; // Slight upward bias
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 0.6 + 0.6;

    particle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      --tx: ${tx}px;
      --ty: ${ty}px;
      animation-duration: ${duration}s;
    `;

    root.appendChild(particle);
    setTimeout(() => particle.remove(), duration * 1000);
  }
}

export function celebrateLevelUp() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  // Multiple bursts
  spawnParticles(centerX, centerY, 50, ['#ffd700', '#ffe066', '#ffeb3b', '#fff9c4']);
  setTimeout(() => spawnParticles(centerX - 100, centerY + 50, 30), 200);
  setTimeout(() => spawnParticles(centerX + 100, centerY - 50, 30), 400);
}

export function celebrateAchievement() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  spawnParticles(centerX, centerY, 40, ['#7c3aed', '#a78bfa', '#c4b5fd', '#ffd700']);
}

export function celebrateHabitComplete(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  spawnParticles(x, y, 12, ['#00ff88', '#66ffaa', '#00cc6a']);
}

export function celebratePerfectDay() {
  // Fireworks effect — multiple positions
  const positions = [
    [window.innerWidth * 0.3, window.innerHeight * 0.3],
    [window.innerWidth * 0.7, window.innerHeight * 0.4],
    [window.innerWidth * 0.5, window.innerHeight * 0.2],
  ];

  positions.forEach(([x, y], i) => {
    setTimeout(() => {
      spawnParticles(x, y, 40, ['#00ff88', '#7c3aed', '#ffd700', '#ff6b35', '#00d4ff', '#ff3366']);
    }, i * 300);
  });
}

// Upward velocity bias

