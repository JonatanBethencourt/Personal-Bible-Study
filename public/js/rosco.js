// Motor y Lógica de "El Rosco / La Ruleta de la A a la Z"
window.RoscoManager = (function () {
  const roscoState = {
    items: [],
    queue: [],
    pointer: 0,
    timerSeconds: 300,
    timerInterval: null,
    correct: 0,
    wrong: 0,
    passed: 0,
    active: false
  };

  const dom = {};

  function initDOM() {
    dom.roscoView = document.getElementById('roscoView');
    dom.roscoResultView = document.getElementById('roscoResultView');
    dom.roscoWheel = document.getElementById('roscoWheel');
    dom.roscoTimer = document.getElementById('roscoTimer');
    dom.roscoCorrectCount = document.getElementById('roscoCorrectCount');
    dom.roscoWrongCount = document.getElementById('roscoWrongCount');
    dom.roscoPendingCount = document.getElementById('roscoPendingCount');
    dom.roscoTimeSelect = document.getElementById('roscoTimeSelect');
    dom.roscoActiveLetterBadge = document.getElementById('roscoActiveLetterBadge');
    dom.roscoPrefix = document.getElementById('roscoPrefix');
    dom.roscoQuestionText = document.getElementById('roscoQuestionText');
    dom.roscoInput = document.getElementById('roscoInput');
    dom.btnRoscoSubmit = document.getElementById('btnRoscoSubmit');
    dom.btnRoscoPass = document.getElementById('btnRoscoPass');
    dom.roscoFinalCorrect = document.getElementById('roscoFinalCorrect');
    dom.roscoFinalWrong = document.getElementById('roscoFinalWrong');
    dom.roscoFinalPassed = document.getElementById('roscoFinalPassed');
    dom.roscoAnswersReview = document.getElementById('roscoAnswersReview');
    dom.btnRoscoRetry = document.getElementById('btnRoscoRetry');
    dom.btnRoscoToMenu = document.getElementById('btnRoscoToMenu');
  }

  function setupEvents() {
    initDOM();

    document.getElementById('roscoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitAnswer();
    });

    dom.btnRoscoPass.addEventListener('click', (e) => {
      e.preventDefault();
      passWord();
    });

    dom.roscoInput.addEventListener('keydown', (e) => {
      if (e.key === ' ' && dom.roscoInput.value.trim() === '') {
        e.preventDefault();
        passWord();
      }
    });

    dom.btnRoscoRetry.addEventListener('click', () => {
      startRoscoGame(window.lastSelectedTopicIds || []);
    });

    dom.btnRoscoToMenu.addEventListener('click', () => {
      if (window.stopConfetti) window.stopConfetti();
      document.getElementById('roscoResultView').style.display = 'none';
      document.getElementById('lobbyView').style.display = 'block';
    });
  }

  async function startRoscoGame(topicIds = []) {
    initDOM();
    if (window.stopConfetti) window.stopConfetti();
    window.lastSelectedTopicIds = topicIds;

    const btnStart = document.getElementById('btnStartRosco');
    if (btnStart) {
      btnStart.disabled = true;
      btnStart.textContent = 'Preparando Ruleta de la A a la Z...';
    }

    try {
      const res = await fetch('/api/game/rosco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicIds })
      });
      const data = await res.json();
      if (!data.success || !data.rosco || data.rosco.length === 0) {
        throw new Error(data.error || 'No se pudieron obtener preguntas del Rosco.');
      }

      roscoState.items = data.rosco.map(item => ({
        ...item,
        status: 'pending',
        userAnswer: ''
      }));

      roscoState.queue = roscoState.items.map((_, i) => i);
      roscoState.pointer = 0;
      roscoState.correct = 0;
      roscoState.wrong = 0;
      roscoState.passed = 0;
      roscoState.active = true;

      const dur = parseInt(dom.roscoTimeSelect ? dom.roscoTimeSelect.value : 300, 10) || 300;
      roscoState.timerSeconds = dur;

      renderWheel();
      startTimer();
      soundEngine.startBackgroundMusic();

      // Ocultar otras vistas y mostrar Rosco
      ['lobbyView', 'gameView', 'victoryView', 'roscoResultView'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      dom.roscoView.style.display = 'block';

      renderCurrentTurn();
    } catch (err) {
      alert('Error al iniciar la ruleta: ' + err.message);
    } finally {
      if (btnStart) {
        btnStart.disabled = false;
        btnStart.textContent = '🎡 ¡ENTRAR A LA RULETA FINAL (A a la Z)!';
      }
    }
  }

  function renderWheel() {
    dom.roscoWheel.innerHTML = '';
    const total = roscoState.items.length;
    const isSmall = window.innerWidth <= 600;
    const radius = isSmall ? 135 : 205;
    const cx = isSmall ? 160 : 240;
    const cy = isSmall ? 160 : 240;
    const step = (2 * Math.PI) / total;

    roscoState.items.forEach((item, index) => {
      const angle = -Math.PI / 2 + index * step;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      const node = document.createElement('div');
      node.className = `letter-node ${item.status}`;
      node.id = `rosco-node-${index}`;
      node.textContent = item.letter;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      dom.roscoWheel.appendChild(node);
    });
  }

  function updateNodesUI() {
    roscoState.items.forEach((item, index) => {
      const node = document.getElementById(`rosco-node-${index}`);
      if (!node) return;
      const isCurrent = roscoState.queue.length > 0 && roscoState.queue[roscoState.pointer] === index;
      node.className = `letter-node ${item.status} ${isCurrent ? 'active' : ''}`;
    });

    dom.roscoCorrectCount.textContent = roscoState.correct;
    dom.roscoWrongCount.textContent = roscoState.wrong;
    dom.roscoPendingCount.textContent = roscoState.queue.length;
  }

  function renderCurrentTurn() {
    if (roscoState.queue.length === 0) {
      finishGame('all_completed');
      return;
    }

    if (roscoState.pointer >= roscoState.queue.length) {
      roscoState.pointer = 0;
    }

    const itemIdx = roscoState.queue[roscoState.pointer];
    const item = roscoState.items[itemIdx];

    dom.roscoActiveLetterBadge.textContent = item.letter;
    dom.roscoPrefix.textContent = item.prefix || `Empieza por ${item.letter}`;
    dom.roscoQuestionText.textContent = item.question;

    dom.roscoInput.value = '';
    dom.roscoInput.focus();

    updateNodesUI();
  }

  function submitAnswer() {
    if (!roscoState.active || roscoState.queue.length === 0) return;

    const answer = dom.roscoInput.value.trim();
    if (!answer) return;

    const itemIdx = roscoState.queue[roscoState.pointer];
    const item = roscoState.items[itemIdx];
    item.userAnswer = answer;

    const cleanUser = normStr(answer);
    const expectedList = [item.answer, ...(item.aliases || [])].map(a => normStr(a));

    const isMatch = expectedList.some(cleanExp =>
      (cleanUser === cleanExp) ||
      (cleanExp.length >= 4 && cleanExp.includes(cleanUser)) ||
      (cleanUser.length >= 4 && cleanUser.includes(cleanExp))
    );

    if (isMatch) {
      soundEngine.playCorrect();
      item.status = 'correct';
      roscoState.correct += 1;
    } else {
      soundEngine.playWrong();
      item.status = 'wrong';
      roscoState.wrong += 1;
    }

    // Quitar de la cola de pendientes
    roscoState.queue.splice(roscoState.pointer, 1);

    if (roscoState.queue.length > 0) {
      renderCurrentTurn();
    } else {
      finishGame('all_completed');
    }
  }

  function passWord() {
    if (!roscoState.active || roscoState.queue.length === 0) return;

    soundEngine.playPass();
    const itemIdx = roscoState.queue[roscoState.pointer];
    const item = roscoState.items[itemIdx];

    if (item.status === 'pending') {
      item.status = 'passed';
      roscoState.passed += 1;
    }

    // Vuelta circular en la cola de pendientes
    roscoState.pointer = (roscoState.pointer + 1) % roscoState.queue.length;
    renderCurrentTurn();
  }

  function startTimer() {
    if (roscoState.timerInterval) clearInterval(roscoState.timerInterval);
    updateTimerText();

    roscoState.timerInterval = setInterval(() => {
      roscoState.timerSeconds -= 1;
      updateTimerText();

      if (roscoState.timerSeconds <= 30) {
        dom.roscoTimer.classList.add('urgent');
      } else {
        dom.roscoTimer.classList.remove('urgent');
      }

      if (roscoState.timerSeconds <= 0) {
        clearInterval(roscoState.timerInterval);
        roscoState.timerInterval = null;
        soundEngine.playTimeUp();
        finishGame('time_up');
      }
    }, 1000);
  }

  function updateTimerText() {
    const s = Math.max(0, roscoState.timerSeconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    dom.roscoTimer.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function finishGame(reason) {
    roscoState.active = false;
    if (roscoState.timerInterval) {
      clearInterval(roscoState.timerInterval);
      roscoState.timerInterval = null;
    }
    soundEngine.stopBackgroundMusic();

    const unanswered = roscoState.queue.length;
    dom.roscoFinalCorrect.textContent = roscoState.correct;
    dom.roscoFinalWrong.textContent = roscoState.wrong;
    dom.roscoFinalPassed.textContent = unanswered;

    const title = document.getElementById('roscoResultTitle');
    const sub = document.getElementById('roscoResultSubtitle');
    const emoji = document.getElementById('roscoResultEmoji');

    if (reason === 'time_up') {
      emoji.textContent = '⌛';
      title.textContent = '¡TIEMPO AGOTADO EN LA RULETA!';
      sub.textContent = 'El cronómetro ha llegado a cero. Aquí tienes tu balance final:';
    } else {
      if (roscoState.wrong === 0) {
        emoji.textContent = '👑';
        title.textContent = '¡PLENO EN EL ROSCO! ¡CAMPEÓN ABSOLUTO!';
        sub.textContent = '¡Has acertado todas las letras del abecedario sin fallar ninguna!';
        soundEngine.playVictory();
        if (window.startConfetti) window.startConfetti();
      } else {
        emoji.textContent = '🏆';
        title.textContent = '¡RULETA DE LA A A LA Z COMPLETADA!';
        sub.textContent = 'Has respondido todas las letras disponibles de tus temas de estudio.';
        soundEngine.playVictory();
        if (window.startConfetti) window.startConfetti();
      }
    }

    // Renderizar desglose de soluciones
    dom.roscoAnswersReview.innerHTML = roscoState.items.map(item => {
      let badge = '';
      if (item.status === 'correct') {
        badge = '<span style="color: var(--green-correct); font-weight: bold;">[ACERTADA ✓]</span>';
      } else if (item.status === 'wrong') {
        badge = '<span style="color: var(--red-wrong); font-weight: bold;">[FALLADA ✗]</span>';
      } else {
        badge = '<span style="color: var(--gold-primary); font-weight: bold;">[PASADA / SIN CONTESTAR ⏳]</span>';
      }

      return `
        <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding: 8px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
            <strong>Letra ${item.letter}: ${esc(item.answer)}</strong>
            ${badge}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
            ${esc(item.question)}
          </div>
          ${item.userAnswer ? `<div style="font-size: 0.8rem; color: #93c5fd;">Tu respuesta: <em>${esc(item.userAnswer)}</em></div>` : ''}
          <div style="font-size: 0.8rem; color: var(--gold-primary); font-style: italic;">
            💡 ${esc(item.explanation)}
          </div>
        </div>
      `;
    }).join('');

    dom.roscoView.style.display = 'none';
    dom.roscoResultView.style.display = 'block';
  }

  function normStr(str) {
    if (!str) return '';
    return str.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9ñ]/gi, '');
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.addEventListener('DOMContentLoaded', setupEvents);

  return {
    startRoscoGame
  };
})();
