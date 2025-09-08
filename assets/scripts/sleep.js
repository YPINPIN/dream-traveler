document.addEventListener("DOMContentLoaded", () => {
  const sw = document.getElementById("sleep-alert");
  const panel = document.getElementById("alert-sleep-setting");
  const sleep_time = document.getElementById("sleep_time");
  if (!sw || !panel) return;

  const sync = () => {
    // 啟動時移除、關閉時加回
    const on = sw.checked; // 或 isOn()

    panel.classList.toggle("opacity-30", !on); // 父層透明度
    sleep_time.textContent = on ? "細雨輕敲" : "";

    // 依狀態切換文字樣式（以 Bootstrap 為例）
    sleep_time.classList.toggle("text-neutral-400", on);
  };

  sw.addEventListener("change", sync);
  sync(); // 載入時先同步一次
});
(() => {
  const box = document.getElementById("endSleep");
  const range = document.getElementById("sleepRange");
  const knob = document.getElementById("knob");
  const label = document.getElementById("sleepLabel");
  const fill = label.querySelector(".bg-fill");

  const PAD = 8; // 與 CSS --pad 一致
  const THRESHOLD = 95; // 到 95% 視為完成

  let maxX = 0; // knob 可移動的最大距離（px）
  let knobW = 40; // knob 寬度

  function measure() {
    const trackRect = box.querySelector(".track").getBoundingClientRect();
    knobW = knob.getBoundingClientRect().width || 40;
    maxX = Math.max(0, trackRect.width - PAD * 2 - knobW);
  }

  function setVisualByValue(val) {
    // val: 0..100
    const p = Math.max(0, Math.min(100, +val)) / 100; // 0..1
    const x = Math.round(maxX * p);
    // knob 位置（從左側 PAD 起算）
    knob.style.transform = `translate(${x}px)`;
  }

  function finish() {
    box.classList.remove("dragging");
    box.classList.add("done");
    range.value = 100;
    setVisualByValue(100);
    label.innerHTML =
      '完成睡眠紀錄<span class="end-btn rounded-circle p-2 bg-neutral-100 position-absolute" id="knob"><img src="/dream-traveler/assets/images/05-icon/check-green.svg" alt="next"></span>';
    range.disabled = true; // 鎖住互動
    label.classList.remove("btn-primary-300");
    label.classList.add("btn-primary-400");
    document.getElementById("sleepLabel").click();
  }

  function reset() {
    box.classList.remove("done", "dragging");
    range.disabled = false;
    range.value = 0;
    setVisualByValue(0);
    label.textContent = "滑動以結束睡眠";
  }

  // 事件
  range.addEventListener("pointerdown", () => {
    box.classList.add("dragging");
    measure();
  });
  range.addEventListener(
    "touchstart",
    () => {
      box.classList.add("dragging");
      measure();
    },
    { passive: true }
  );
  range.addEventListener("input", () => {
    setVisualByValue(range.value);
  });
  range.addEventListener("change", () => {
    // 放手時判斷門檻
    if (+range.value >= THRESHOLD) finish();
    else {
      range.value = 0;
      setVisualByValue(0);
      box.classList.remove("dragging");
    }
  });
  range.addEventListener("pointerup", () => box.classList.remove("dragging"));
  range.addEventListener("pointercancel", () =>
    box.classList.remove("dragging")
  );
  range.addEventListener("blur", () => box.classList.remove("dragging"));
  window.addEventListener("resize", () => {
    const cur = +range.value;
    measure();
    setVisualByValue(cur);
  });

  // 提供外部重置
  window.resetEndSleep = reset;

  // 初始化
  measure();
  setVisualByValue(range.value);
})();
