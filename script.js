const body = document.body;
const welcome = document.querySelector('.welcome');
const split = document.querySelector('.split-container');
const halves = document.querySelectorAll('.half');
const blocker = document.getElementById('ui-blocker');
const menuSweet = document.getElementById('menu-sweet');
const menuSavory = document.getElementById('menu-savory');
const nav = document.getElementById('main-nav');
const historyBtn = document.getElementById('history-btn');
const historyOverlay = document.getElementById('history-overlay');
const historyModal = document.getElementById('history-modal');

let currentView = 'landing';
let historyOpen = false;


historyBtn.addEventListener('click', () => {
  if (!historyOpen) openHistoryModal();
  else closeHistoryModal();
});

function openHistoryModal() {
  historyOverlay.classList.add('active');
  historyModal.classList.add('active');
  historyModal.setAttribute('aria-hidden', 'false');
  historyOpen = true;
}


function closeHistoryModal() {
  historyModal.classList.add('exit');
  historyOverlay.classList.remove('active');
  setTimeout(() => {
    historyModal.classList.remove('active', 'exit');
    historyModal.setAttribute('aria-hidden', 'true');
    historyOpen = false;
  }, 700);
}


historyOverlay.addEventListener('click', closeHistoryModal);


window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && historyOpen) closeHistoryModal();
});



historyOverlay.addEventListener('click', () => closeHistoryModal());


window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && historyOpen) closeHistoryModal();
});

   
   


window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => body.classList.add('loaded'));
});


halves.forEach(half => {
  half.addEventListener('click', () => enterSide(half.dataset.side));
});

function enterSide(side) {
    if (currentView !== 'landing') return;
  
    // 1) Welcome 淡出上滑
    welcome.classList.add('exit');
  
    // 2) 计算被点半屏的位置，创建填色层（避免 flex 卡顿与闪白）
    const chosen = Array.from(halves).find(h => h.dataset.side === side);
    const rect = chosen.getBoundingClientRect();
    const top = rect.top;
    const left = rect.left;
    const right = window.innerWidth - rect.right;
    const bottom = window.innerHeight - rect.bottom;
  
    const fill = document.createElement('div');
    fill.className = 'fill-layer';
    fill.style.background = getComputedStyle(chosen).backgroundColor;
    // 初始 clip-path：只显示被点击区域
    fill.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 0)`;
    document.body.appendChild(fill);
  
    // 3) 同时让另一侧标题丝滑淡出，当前侧标题也轻微淡出，避免“卡掉”
    halves.forEach(h => h.querySelector('span').classList.add('fade-out-title'));
  
    // 4) 下一帧将 clip-path 动画到全屏
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.clipPath = 'inset(0px 0px 0px 0px round 0)';
      });
    });
  
    // 5) 分屏淡出（不立即隐藏，避免闪白）
    split.classList.add('fade-out');
  
    // 6) 动画结束后激活对应菜单，并再隐藏分屏
    setTimeout(() => {
      if (side === 'sweet') {
        menuSweet.classList.add('active');
        currentView = 'sweet';
      } else {
        menuSavory.classList.add('active');
        currentView = 'savory';
      }
      // 显示导航栏
nav.classList.add('visible');
nav.setAttribute('aria-hidden', 'false');

      // 真正移除分屏的可见性（此时 fill-layer 已盖住屏幕）
      split.style.display = 'none';
    }, 650); // 与 clip-path 过渡接近但略早，确保视觉连贯
  
    // 7) 再稍晚一点移除填色层，让菜单露出来（无闪白）
    setTimeout(() => {
      fill.remove();
    }, 950);
  }
  

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') goBack();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') handleEscape();
});

function handleEscape() {
  // 先处理 History 面板
  if (historyPanel && historyPanel.classList.contains('active')) {
    historyPanel.classList.remove('active');
    historyPanel.setAttribute('aria-hidden', 'true');
    historyOpen = false;
    return;
  }

  // 在菜单里 → 回主页：先启用禁鼠层，阻断 hover
  if (currentView === 'sweet' || currentView === 'savory') {
    blocker.classList.add('active');     // ★ 关键：立即启用
    goBack();
  }
}


function goBack() {
  if (currentView === 'landing') return;

  // 启用禁鼠层：防止 hover 或点击穿透
  blocker.classList.add('active');

  const side = currentView; // 'sweet' | 'savory'
  const menu = side === 'sweet' ? menuSweet : menuSavory;
  const chosen = Array.from(halves).find(h => h.dataset.side === side);

  // 1️⃣ 菜单淡出
  menu.classList.remove('active');

  // 2️⃣ 创建全屏填色层（纯色覆盖）
  const fill = document.createElement('div');
  fill.className = 'fill-layer';
  fill.style.background = getComputedStyle(chosen).backgroundColor;
  fill.style.clipPath = 'inset(0 0 0 0 round 0)'; // 起点：全屏
  document.body.appendChild(fill);

  // 3️⃣ 恢复分屏到文档流（但暂不可见）
  split.style.display = 'flex';
  split.classList.remove('fade-out', 'titles-fade');
  halves.forEach(h => h.querySelector('span').classList.remove('fade-out-title'));
  split.classList.add('restore-prep', 'returning');
  // 强制 reflow
  // eslint-disable-next-line no-unused-expressions
  split.offsetHeight;

  // 4️⃣ 两帧后测量位置，开始回缩
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const rect = chosen.getBoundingClientRect();
      const top = rect.top;
      const left = rect.left;
      const right = window.innerWidth - rect.right;
      const bottom = window.innerHeight - rect.bottom;

      // 让分屏在遮罩下准备好显示 + 标题渐显
      split.classList.remove('restore-prep');
      split.classList.add('restore-show', 'returning-show');

      // 执行 clip-path 收缩动画
      fill.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 0)`;

      // 5️⃣ 监听动画结束
      const onEnd = (e) => {
        if (e.propertyName !== 'clip-path') return;
        fill.removeEventListener('transitionend', onEnd);

        // 清理遮罩
        fill.remove();

        // 重置分屏状态
        split.classList.remove('returning', 'returning-show');
        welcome.classList.remove('exit');
        currentView = 'landing';

        // 隐藏导航栏
        nav.classList.remove('visible');
        nav.setAttribute('aria-hidden', 'true');

        // 关闭禁鼠层
        blocker.classList.remove('active');
      };

      fill.addEventListener('transitionend', onEnd, { once: true });
    });
  });

  // ⏱ 兜底超时关闭（防止 transitionend 未触发）
  setTimeout(() => blocker.classList.remove('active'), 1200);
}

 
const dishDetail = document.getElementById('dish-detail');
const dishReturn = document.getElementById('dish-return');
let doorOpen = false;


const wingsCard = document.querySelector('[alt="Pistachio Chicken Wings"]');
const wingsSection = document.getElementById('dish-detail');
const wingsReturn = wingsSection.querySelector('.dish-return');

wingsCard.addEventListener('click', () => {
  wingsSection.classList.add('active');
  wingsSection.setAttribute('aria-hidden', 'false');
});

function closeWings() {
  wingsSection.scrollTo({ top: 0, behavior: 'smooth' });
  wingsSection.classList.add('exit');
  setTimeout(() => {
    wingsSection.classList.remove('active', 'exit');
    wingsSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

wingsReturn.addEventListener('click', closeWings);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && wingsSection.classList.contains('active')) closeWings();
});
function openDishDetail(img) {
  const section = img.closest('section');
  const color = section.classList.contains('menu-sweet') ? '#ADCD87' : '#78B141';
  dishDetail.style.setProperty('--dish-color', color);

  dishDetail.classList.add('active');
  dishDetail.setAttribute('aria-hidden', 'false');
  doorOpen = true;
}

function closeDishDetail() {
  dishDetail.scrollTo({ top: 0, behavior: 'smooth' });
  dishDetail.classList.add('exit');
  setTimeout(() => {
    dishDetail.classList.remove('active', 'exit');
    dishDetail.setAttribute('aria-hidden', 'true');
    doorOpen = false;
  }, 900);
}

dishReturn.addEventListener('click', closeDishDetail);

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && doorOpen) closeDishDetail();
});


let timerInterval;
const timerDisplay = document.getElementById('timer-display');
const timerBtn = document.getElementById('start-timer');
let timerRunning = false;
let remainingTime = 35 * 60; 

function updateTimer() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function startTimer() {
  if (!timerRunning) {
    timerRunning = true;
    timerBtn.textContent = 'Pause Timer';
    timerInterval = setInterval(() => {
      remainingTime--;
      updateTimer();
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = 'Done!';
        timerBtn.textContent = 'Restart Timer';
        timerRunning = false;
        remainingTime = 35 * 60;
      }
    }, 1000);
  } else {
    
    clearInterval(timerInterval);
    timerBtn.textContent = 'Resume Timer';
    timerRunning = false;
  }
}

timerBtn.addEventListener('click', startTimer);


const cheesecakeSection = document.getElementById('dish-cheesecake');
const cheesecakeReturn = cheesecakeSection.querySelector('.dish-return');

document.querySelector('[alt="Pistachio Basque Cheesecake"]').addEventListener('click', () => {
  cheesecakeSection.classList.add('active');
  cheesecakeSection.setAttribute('aria-hidden', 'false');
});

function closeCheesecake() {
  cheesecakeSection.scrollTo({ top: 0, behavior: 'smooth' });
  cheesecakeSection.classList.add('exit');
  setTimeout(() => {
    cheesecakeSection.classList.remove('active', 'exit');
    cheesecakeSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

cheesecakeReturn.addEventListener('click', closeCheesecake);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cheesecakeSection.classList.contains('active')) closeCheesecake();
});


const gelatoSection = document.getElementById('dish-gelato');
const gelatoReturn = gelatoSection.querySelector('.dish-return');

document.querySelector('[alt="Pistachio Gelato"]').addEventListener('click', () => {
  gelatoSection.classList.add('active');
  gelatoSection.setAttribute('aria-hidden', 'false');
});

function closeGelato() {
  gelatoSection.scrollTo({ top: 0, behavior: 'smooth' });
  gelatoSection.classList.add('exit');
  setTimeout(() => {
    gelatoSection.classList.remove('active', 'exit');
    gelatoSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

gelatoReturn.addEventListener('click', closeGelato);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && gelatoSection.classList.contains('active')) closeGelato();
});


const latteSection = document.getElementById('dish-latte');
const latteReturn = latteSection.querySelector('.dish-return');

document.querySelector('[alt="Pistachio Latte"]').addEventListener('click', () => {
  latteSection.classList.add('active');
  latteSection.setAttribute('aria-hidden', 'false');
});

function closeLatte() {
  latteSection.scrollTo({ top: 0, behavior: 'smooth' });
  latteSection.classList.add('exit');
  setTimeout(() => {
    latteSection.classList.remove('active', 'exit');
    latteSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

latteReturn.addEventListener('click', closeLatte);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && latteSection.classList.contains('active')) closeLatte();
});


const macaronSection = document.getElementById('dish-macaron');
const macaronReturn = macaronSection.querySelector('.dish-return');

document.querySelector('[alt="Pistachio Macaron"]').addEventListener('click', () => {
  macaronSection.classList.add('active');
  macaronSection.setAttribute('aria-hidden', 'false');
});

function closeMacaron() {
  macaronSection.scrollTo({ top: 0, behavior: 'smooth' });
  macaronSection.classList.add('exit');
  setTimeout(() => {
    macaronSection.classList.remove('active', 'exit');
    macaronSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

macaronReturn.addEventListener('click', closeMacaron);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && macaronSection.classList.contains('active')) closeMacaron();
});

// ===== Halibut with Pistachio Soup Page =====
const halibutSection = document.getElementById('dish-halibut');
const halibutReturn = halibutSection.querySelector('.dish-return');

document.querySelector('[alt="Halibut with Pistachio Soup"]').addEventListener('click', () => {
  halibutSection.classList.add('active');
  halibutSection.setAttribute('aria-hidden', 'false');
});

function closeHalibut() {
  halibutSection.scrollTo({ top: 0, behavior: 'smooth' });
  halibutSection.classList.add('exit');
  setTimeout(() => {
    halibutSection.classList.remove('active', 'exit');
    halibutSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

halibutReturn.addEventListener('click', closeHalibut);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && halibutSection.classList.contains('active')) closeHalibut();
});


const pastaSection = document.getElementById('dish-pasta');
const pastaReturn = pastaSection.querySelector('.dish-return');

document.querySelector('[alt="Pistachio Pesto Pasta"]').addEventListener('click', () => {
  pastaSection.classList.add('active');
  pastaSection.setAttribute('aria-hidden', 'false');
});

function closePasta() {
  pastaSection.scrollTo({ top: 0, behavior: 'smooth' });
  pastaSection.classList.add('exit');
  setTimeout(() => {
    pastaSection.classList.remove('active', 'exit');
    pastaSection.setAttribute('aria-hidden', 'true');
  }, 900);
}

pastaReturn.addEventListener('click', closePasta);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && pastaSection.classList.contains('active')) closePasta();
});


const facts = [
  "Pistachios have 3 g fiber per serving — more than 1/2 cup cooked broccoli.",
  "Two daily handfuls of pistachios may help protect eyes from blue light damage.",
  "A serving of pistachios provides fiber, protein, thiamin, vitamin B6, Mn, P and Cu.",
  "Pistachios contain nutrients that may benefit glycemic control and overall health."
];

const navFacts = document.getElementById('navFacts');
const factText = document.getElementById('factText');

let factIndex = 0;
factText.textContent = facts[factIndex];

function switchFact(){
  factIndex = (factIndex + 1) % facts.length;

  factText.classList.remove('flash');
  void factText.offsetWidth;           
  factText.textContent = facts[factIndex];
  factText.classList.add('flash');
}
setInterval(switchFact, 5000);

navFacts.addEventListener('click', () => {
  window.open(navFacts.href, '_blank', 'noopener');
});

