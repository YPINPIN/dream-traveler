import { swiper } from "/src/swiper.js";
import lockedIcon from "/assets/images/05-icon/locked.svg";
import lockedValleyPath from '/assets/images/04-background/main-scene/home-lock/home-main-scene-lock-深眠幽谷@2x.png';
import lockedForestPath from '/assets/images/04-background/main-scene/home-lock/home-main-scene-lock-記憶森林@2x.png';
import lockedIslandPath from '/assets/images/04-background/main-scene/home-lock/home-main-scene-lock-浮島邊境@2x.png';

const backgroundPaths = {
  'locked-valley': lockedValleyPath,
  'locked-forest': lockedForestPath,
  'locked-island': lockedIslandPath
}

// 取得 DOM 元素
const departureBtn = document.getElementById("departure-button");
const swiperSlides = document.querySelectorAll('.swiper-slide');
const sceneIntro = document.getElementById('scene-intro');
const sceneTitle = document.getElementById('scene-title');
const offcanvasRight = document.getElementById('offcanvasRight');
const pathCardList = document.querySelectorAll('.path-card');
const pathButton = document.querySelector('.btn-path');
const travelTimePage = document.querySelector('.travel-time-page');
const backToPathPage = document.querySelector('.travel-time-page .top-nav a')

// 設定輪播背景圖片
swiperSlides.forEach(slide => {
  const backgroundName = slide.dataset.background;
  const isLocked = slide.classList.contains('locked');

  if (isLocked) {
    const pathKey = `locked-${backgroundName}`;
    const imagePath = backgroundPaths[pathKey];
    slide.style.backgroundImage = `url(${imagePath})`;
  } else {
    slide.style.backgroundImage = '';
  }
})

document.addEventListener('DOMContentLoaded', () => {
  // 輪播切換
  swiper.on('slideChange', () => {
    // 捕捉當前背景索引
    const activeIndex = swiper.activeIndex;
    const currentSlide = swiper.slides[activeIndex];
    const backgroundName = currentSlide.dataset.background;
    const sceneMap = {
      'village': '淺夢之村',
      'valley': '深眠幽谷',
      'forest': '記憶森林',
      'island': '浮島邊境',
    }

    departureBtn.innerHTML = '';
    sceneTitle.textContent = sceneMap[backgroundName];

    // 透過 locked 狀態判斷是否顯示鎖定圖示
    if (currentSlide.classList.contains('locked')) {
      departureBtn.innerHTML = `<img class="locked-icon" src=${lockedIcon} alt="鎖定圖示">`;
      departureBtn.style.padding = '35px';
      departureBtn.style.cursor = 'default';
      departureBtn.style.pointerEvents = 'none';
      sceneIntro.textContent = '尚未解鎖·敬請期待';
    } else {
      departureBtn.style.padding = '3rem 1.75rem';
      departureBtn.style.cursor = 'pointer';
      departureBtn.style.pointerEvents = 'auto';
      departureBtn.textContent = "現在啟程";
      sceneIntro.textContent = '現在探索的場景';
    }
  })

  offcanvasRight.addEventListener('click', (e) => {
    const cardElement = e.target.closest('.card');
    if (!cardElement) return;

    // 路徑卡片清單的卡片被選到加上 selected 樣式，沒選到移除 selected 樣式
    pathCardList.forEach((cardItem) => {
      const cardId = cardElement.dataset.cardId;
      if (cardItem.dataset.cardId === cardId) {
        cardItem.classList.add('selected');
      } else {
        cardItem.classList.remove('selected');
      }
    })

    // 檢查是否有路徑卡片被選到
    const hasSelected = [...pathCardList].some(cardItem => cardItem.classList.contains('selected'));

    if (hasSelected) {
      pathButton.classList.add('active');
    }
  })

  // 設定旅遊時間頁動態效果
  pathButton.addEventListener('click', () => {
    travelTimePage.classList.add('show');
  })

  backToPathPage.addEventListener('click', () => {
    travelTimePage.classList.remove('show');
  })
})
