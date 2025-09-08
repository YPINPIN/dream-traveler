document.addEventListener("DOMContentLoaded", () => {
  const sw = document.getElementById("sleep-alert");
  const panel = document.getElementById("alert-sleep-setting");
  const sleep_time = document.getElementById("sleep_time");

  console.log(sw, panel);
  if (!sw || !panel) return;

  const sync = () => {
    // 啟動時移除、關閉時加回
    const on = sw.checked; // 或 isOn()

    panel.classList.toggle("opacity-30", !on); // 父層透明度
    panel.classList.toggle("pe-none", !on); //禁用連結
    panel.setAttribute("aria-disabled", String(!on));

    sleep_time.textContent = on ? "5分鐘前" : "未設定";
    sleep_time.classList.toggle("text-neutral-400", on);
  };

  sw.addEventListener("change", sync);
  sync(); // 載入時先同步一次
});
