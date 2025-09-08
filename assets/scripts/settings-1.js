const container = document.querySelector("#timeList");

container.addEventListener("click", (e) => {
  const a = e.target.closest("a.settings");
  if (!a || !container.contains(a)) return;
  e.preventDefault(); // 避免 # 跳頁

  // 先清掉同一個清單裡所有項目的狀態
  const list = a.closest("ul") || container;
  list.querySelectorAll("a.settings").forEach((el) => {
    el.classList.remove("active");
    el.querySelector("img")?.classList.add("d-none");
  });

  // 設定被點擊項目的狀態
  a.classList.add("active");
  a.querySelector("img")?.classList.remove("d-none");
});
