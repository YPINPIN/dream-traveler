const appBorder = document.querySelector('.app-border');
const pathCardList = document.querySelectorAll('.path-card');
const pathButton = document.querySelector('.btn-path');

appBorder.addEventListener('click', (e) => {
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
