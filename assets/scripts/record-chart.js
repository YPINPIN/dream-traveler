import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import dayjs from "dayjs";

// plugin
import { averageLinePlugin } from "/assets/scripts/chart-plugin.js";
// tooltip config
import {
  tooltip_config_1,
  tooltip_config_2,
} from "/assets/scripts/chart-tooltip.js";
// 資料 utils
import { getTravelSummary } from "/assets/scripts/record-utils.js";

// 資料紀錄
let lastTab;
let currentTab;
let travelSummary;
let currentDataIndex;

// ------------------------------
// 旅行時長圖表 chart-travel-time
const ctx_travel = document.getElementById("chart-travel-time");
let chart_travel;

// tab switch
const tabBtns = document.querySelectorAll(`.time-btn-group .btn`);
// slider
const myCarousel = document.getElementById("record-carousel");
const carouselInner = myCarousel.querySelector(".carousel-inner");
// slider 按鈕
const prevBtn = document.querySelector(".record-custom-prev-btn");
const nextBtn = document.querySelector(".record-custom-next-btn");

// 旅行時長
const travelEl = document.querySelector("#data-travel");
const avgEl = travelEl.querySelector("#avg-travel");
const diffEl = travelEl.querySelector("#diff-travel");
const diffUpEl = travelEl.querySelector("#diff-travel-up");
const diffDownEl = travelEl.querySelector("#diff-travel-down");
const totalEl = travelEl.querySelector("#total-travel");

// 綁定 tab 點擊事件
tabBtns.forEach((tab) => {
  tab.addEventListener("click", () => {
    // 切換 active 樣式
    tabBtns.forEach((b) => b.classList.remove("active"));
    tab.classList.add("active");

    // 更新顯示資料
    setTabData(tab.dataset.content);
  });
});

// 切換 tab 更新相關元素資料
function setTabData(tab) {
  if (lastTab === tab) return;
  currentTab = tab;
  travelSummary = getTravelSummary(tab);
  currentDataIndex = 0;

  setSlider();
  setTravelData(currentDataIndex);

  lastTab = currentTab; // 更新 lastTab
}

// 設置 slider
function setSlider() {
  const length = travelSummary.length;

  // 重置 slider 按鈕
  prevBtn.classList.remove("disabled");
  nextBtn.classList.remove("disabled");
  if (currentDataIndex === 0) {
    nextBtn.classList.add("disabled");
  }
  if (currentDataIndex === length - 1) {
    prevBtn.classList.add("disabled");
  }

  // 清空 carousel 內的舊項目
  carouselInner.innerHTML = "";
  // 依資料動態生成 item，反轉資料，最舊在前、最新在後
  [...travelSummary].reverse().forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add(
      "carousel-item",
      "carousel-item--" + currentTab,
      "px-1",
      "fs-9",
      "text-nowrap",
      "text-center"
    );

    if (index === length - 1) div.classList.add("active"); // 最後 item 為 active

    div.textContent = item.dateStr;
    carouselInner.append(div);
  });
  setInnerWidth();
}

// 設置旅行時長
function setTravelData(index) {
  const data = travelSummary[index];
  if (!data) return;

  // 設置旅行時長資料
  if (avgEl) {
    avgEl.textContent = data.averageTravelTime;
  }
  if (diffEl) {
    diffEl.textContent = Math.abs(data.differenceFromLastWeek) + " 小時";
    if (data.differenceFromLastWeek > 0) {
      diffEl.classList.remove("text-danger-90");
      diffUpEl && diffUpEl.classList.remove("d-none");
      diffDownEl && diffDownEl.classList.add("d-none");
    } else {
      diffEl.classList.add("text-danger-90");
      diffUpEl && diffUpEl.classList.add("d-none");
      diffDownEl && diffDownEl.classList.remove("d-none");
    }
  }
  if (totalEl) {
    totalEl.textContent = data.totalTravelTime + " 小時";
  }

  // 判斷是否同一 tab
  const isSameTab = chart_travel && currentTab === lastTab;
  if (!chart_travel || !isSameTab) {
    // 不同 tab 或第一次建立，建立新圖表
    switchChartMode(data, currentTab);
  } else {
    // 同一 tab ，直接更新 dataset，不 destroy
    const dataset = chart_travel.data.datasets[0];
    dataset.data =
      currentTab === "year"
        ? data.data.map((item) => item.travelTime)
        : data.data.map((item) => ({ x: item.date, y: item.travelTime }));
    dataset.backgroundColor = Array(data.data.length).fill("#C5CCCB");

    if (currentTab === "month") {
      const allDates = data.data.map((item) => dayjs(item.date));
      const lastDay = allDates[allDates.length - 1];
      const tickDates = allDates.filter(
        (d) => d.date() === 1 || (d.date() % 5 === 0 && d.date() !== 30)
      );
      tickDates.push(lastDay);

      chart_travel.options.scales.x.min = allDates[0].toDate();
      chart_travel.options.scales.x.max = lastDay.toDate();
      chart_travel.options.scales.x.ticks.callback = function (value) {
        const d = dayjs(value);
        return tickDates.find((td) => td.isSame(d, "day")) ? d.format("D") : "";
      };
    }

    chart_travel.options.plugins.averageLine = {
      average: data.averageTravelTime,
    };
    chart_travel.options.scales.y.max = Math.ceil(
      Math.max(...data.data.map((item) => item.travelTime))
    );

    // 清除 tooltip
    chart_travel.tooltip.setActiveElements([]);
    chart_travel.update();
  }
}

// 設置旅行時長圖表 mode
function switchChartMode(newTravelData, mode) {
  // 銷毀舊圖表
  if (chart_travel) chart_travel.destroy();

  // 設定 x 軸與 barThickness
  let xConfig = {};
  let barThickness = 5;
  if (mode === "week") {
    xConfig = {
      type: "time",
      time: { unit: "day", displayFormats: { day: "M/D" } },
      grid: { display: false },
      border: { color: "#C5CCCB", width: 1 },
      ticks: {
        autoSkip: false,
        source: "data",
        maxRotation: 0,
        minRotation: 0,
        color: "rgba(197, 204, 203, 0.6)",
        padding: 0,
        font: (context) => ({
          size: 12,
          family: "Inter",
          style: "normal",
          weight:
            chart_travel && chart_travel.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
      },
    };
    barThickness = 20;
  } else if (mode === "month") {
    const allDates = newTravelData.data.map((item) => dayjs(item.date));
    const lastDay = allDates[allDates.length - 1];
    const tickDates = allDates.filter(
      (d) => d.date() === 1 || (d.date() % 5 === 0 && d.date() !== 30)
    );
    tickDates.push(lastDay);

    xConfig = {
      type: "time",
      time: { unit: "day", displayFormats: { day: "D" } },
      min: allDates[0].toDate(),
      max: lastDay.toDate(),
      grid: { display: false },
      border: { color: "#C5CCCB", width: 1 },
      ticks: {
        autoSkip: false,
        source: "data",
        maxRotation: 0,
        minRotation: 0,
        color: "rgba(197, 204, 203, 0.6)",
        padding: 0,
        font: (context) => ({
          size: 12,
          family: "Inter",
          style: "normal",
          weight:
            chart_travel && chart_travel.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
        callback: function (value) {
          const d = dayjs(value);
          return tickDates.find((td) => td.isSame(d, "day"))
            ? d.format("D")
            : "";
        },
      },
    };
    barThickness = 5;
  } else if (mode === "year") {
    xConfig = {
      type: "category",
      grid: { display: false },
      border: { color: "#C5CCCB", width: 1 },
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        color: "rgba(197, 204, 203, 0.6)",
        padding: 0,
        font: (context) => ({
          size: 12,
          family: "Inter",
          style: "normal",
          weight:
            chart_travel && chart_travel.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
      },
    };
    barThickness = 19;
  }

  chart_travel = new Chart(ctx_travel, {
    type: "bar",
    data: {
      labels:
        mode === "year"
          ? newTravelData.data.map((item) => item.date)
          : undefined,
      datasets: [
        {
          data:
            mode === "year"
              ? newTravelData.data.map((item) => item.travelTime)
              : newTravelData.data.map((item) => ({
                  x: item.date,
                  y: item.travelTime,
                })),
          backgroundColor: Array(newTravelData.data.length).fill("#C5CCCB"),
          hoverBackgroundColor: "#7BC9C2",
          minBarLength: 1,
          borderRadius: { topRight: 4, topLeft: 4 },
          barThickness,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: mode === "year" ? tooltip_config_2 : tooltip_config_1,
        averageLine: { average: newTravelData.averageTravelTime },
      },
      layout: { padding: { left: 0, right: 0, top: 24, bottom: 0 } },
      scales: {
        x: xConfig,
        y: {
          beginAtZero: true,
          max: Math.ceil(
            Math.max(...newTravelData.data.map((item) => item.travelTime))
          ),
          grid: { drawTicks: false, color: "rgba(197, 204, 203, 0.6)" },
          border: { display: false, dash: [2, 2], width: 1 },
          ticks: {
            color: "rgba(197, 204, 203, 0.6)",
            padding: 12,
            stepSize: 3,
            font: {
              family: "Inter",
              size: 12,
              style: "normal",
              weight: "normal",
              lineHeight: 1.33,
            },
          },
        },
      },
      onClick: function (event, elements, chart) {
        const clickedElement = elements[0];
        if (!clickedElement) return;
        const dataset = chart.data.datasets[clickedElement.datasetIndex];
        const index = clickedElement.index;
        chart.selectedBarIndex = index;

        dataset.backgroundColor = Array(dataset.data.length).fill("#C5CCCB");
        dataset.backgroundColor[index] = "#7BC9C2";
        chart.update();
      },
    },
    plugins: [averageLinePlugin],
  });
}

// -------------------

// 監聽 slider
myCarousel.addEventListener("slide.bs.carousel", function (event) {
  currentDataIndex = travelSummary.length - 1 - event.to;
  // console.log("currentDataIndex", currentDataIndex);
  prevBtn.classList.remove("disabled");
  nextBtn.classList.remove("disabled");
  if (currentDataIndex === 0) {
    nextBtn.classList.add("disabled");
  }
  if (currentDataIndex === travelSummary.length - 1) {
    prevBtn.classList.add("disabled");
  }

  setTravelData(currentDataIndex);
});

// 調整 inner 寬度
function setInnerWidth() {
  const activeItem = myCarousel.querySelector(".carousel-item.active");
  if (!activeItem) return;
  carouselInner.style.width = activeItem.offsetWidth + "px";
}

// 滑動開始：立即調整 inner 寬度，保持動畫寬度一致
myCarousel.addEventListener("slide.bs.carousel", setInnerWidth);

// 滑動結束：再次調整，確保結束後寬度正確
myCarousel.addEventListener("slid.bs.carousel", setInnerWidth);

// 初始化資料
setTabData("week");
