import { bgSwiper } from "/src/swiper.js";

// 取得 DOM 元素
const departureBtn = document.getElementById("departure-button");
const departureIcon = document.getElementById('departure-button-icon');
const departureText = document.getElementById('departure-button-text');
const sceneIntro = document.getElementById('scene-intro');
const offcanvasRight = document.getElementById('offcanvasRight');
const pathCardList = document.querySelectorAll('.path-card');
const pathButton = document.querySelector('.btn-path');
const travelTimePage = document.querySelector('.travel-time-page');
const backToPathPage = document.querySelector('.travel-time-page .top-nav a')

function updateSceneIntro(newText) {
  if (sceneIntro.textContent === newText) return;

  sceneIntro.classList.remove('scene-intro-show');

  setTimeout(() => {
    sceneIntro.textContent = newText;
    sceneIntro.classList.add('scene-intro-show');
  }, 200);
}


document.addEventListener('DOMContentLoaded', () => {
  // 輪播切換
  bgSwiper.on('slideChange', () => {
    // 捕捉當前背景索引
    const activeIndex = bgSwiper.activeIndex;
    const currentSlide = bgSwiper.slides[activeIndex];

    // 透過 locked 狀態判斷是否顯示鎖定圖示
    if (currentSlide.classList.contains('locked')) {
      departureText.classList.remove('show');
      departureIcon.classList.add('show');
      departureBtn.style.cursor = 'default';
      departureBtn.style.pointerEvents = 'none';
      updateSceneIntro('尚未解鎖·敬請期待');
    } else {
      departureIcon.classList.remove('show');
      departureText.classList.add('show');
      departureBtn.style.cursor = 'pointer';
      departureBtn.style.pointerEvents = 'auto';
      updateSceneIntro('現在探索的場景');
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
