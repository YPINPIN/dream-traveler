import Chart from "chart.js/auto";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import dayjs from "dayjs";

// plugin
import {
  averageLinePlugin,
  verticalLinePlugin,
  forceMaxTickPlugin,
  autoSelectPlugin,
  clickOnDataOnlyPlugin,
  monthFocusDatePlugin,
} from "/assets/scripts/chart-plugin.js";
// tooltip config
import {
  tooltip_config_1,
  tooltip_config_2,
  tooltip_config_3,
  tooltip_config_4,
  tooltip_config_5,
} from "/assets/scripts/chart-tooltip.js";
// 資料 utils
import {
  getTravelSummary,
  getDepartureSummary,
  getArrivalSummary,
} from "/assets/scripts/record-utils.js";

// 資料紀錄
let lastTab;
let currentTab;
let travelSummary;
let departureSummary;
let arrivalSummary;
let currentDataIndex;

// ------------------------------
// 旅行時長圖表 chart-travel-time
const ctx_travel = document.getElementById("chart-travel-time");
let chart_travel;
// 啟程時間圖表 chart-departure-time
const ctx_departure = document.getElementById("chart-departure-time");
let chart_departure;
// 抵達時間圖表 chart-arrival-time
const ctx_arrival = document.getElementById("chart-arrival-time");
let chart_arrival;

// tab switch
const tabBtns = document.querySelectorAll(`.time-btn-group .btn`);
// slider
const myCarousel = document.getElementById("record-carousel");
const carouselInner = myCarousel.querySelector(".carousel-inner");
// slider 按鈕
const prevBtn = document.querySelector(".record-custom-prev-btn");
const nextBtn = document.querySelector(".record-custom-next-btn");

// 旅行時長 el
const travelEl = document.querySelector("#data-travel");
const avgEl = travelEl.querySelector("#avg-travel");
const lastTravelEl = travelEl.querySelector("#last-travel-text");
const diffEl = travelEl.querySelector("#diff-travel");
const diffUpEl = travelEl.querySelector("#diff-travel-up");
const diffDownEl = travelEl.querySelector("#diff-travel-down");
const totalEl = travelEl.querySelector("#total-travel");
// 啟程時間 el
const departureEl = document.querySelector("#data-departure");
const goalDepartureEl = departureEl.querySelector("#goal-departure");
const lastDepartureEl = departureEl.querySelector("#last-departure-text");
const diffDepartureEl = departureEl.querySelector("#diff-departure");
const diffUpDepartureEl = departureEl.querySelector("#diff-departure-up");
const diffDownDepartureEl = departureEl.querySelector("#diff-departure-down");
const mostDepartureEl = departureEl.querySelector("#most-departure");
// 抵達時間 el
const arrivalEl = document.querySelector("#data-arrival");
const goalArrivalEl = arrivalEl.querySelector("#goal-arrival");
const lastArrivalEl = arrivalEl.querySelector("#last-arrival-text");
const diffArrivalEl = arrivalEl.querySelector("#diff-arrival");
const diffUpArrivalEl = arrivalEl.querySelector("#diff-arrival-up");
const diffDownArrivalEl = arrivalEl.querySelector("#diff-arrival-down");
const mostArrivalEl = arrivalEl.querySelector("#most-arrival");

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
  departureSummary = getDepartureSummary(tab);
  arrivalSummary = getArrivalSummary(tab);
  currentDataIndex = 0;

  setSlider();
  setTravelData(currentDataIndex);
  setDepartureData(currentDataIndex);
  setArrivalData(currentDataIndex);

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

// -------------------
// 設置旅行時長
function setTravelData(index) {
  const data = travelSummary[index];
  if (!data) return;

  // 設置旅行時長資料
  if (avgEl) {
    avgEl.textContent = data.averageTravelTime;
  }
  if (lastTravelEl) {
    lastTravelEl.textContent =
      currentTab === "week" ? "上週" : currentTab === "month" ? "上月" : "去年";
  }
  if (diffEl) {
    diffEl.textContent = Math.abs(data.diffFromLastTravel) + " 小時";
    if (data.diffFromLastTravel > 0) {
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
    switchChartTravelMode(data, currentTab);
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
        // month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
        const d = dayjs(value);
        const forcedDate = chart_travel.forcedDate;

        if (forcedDate && d.isSame(forcedDate, "day")) {
          return d.format("D");
        }

        if (
          forcedDate &&
          (d.isSame(forcedDate.add(1, "day"), "day") ||
            d.isSame(forcedDate.subtract(1, "day"), "day"))
        ) {
          return "";
        }

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

    // 重置 autoSelectPlugin 參數
    chart_travel._autoSelectDone = false;
    chart_travel._animationRunning = true;

    chart_travel.update();
  }
}

// 設置旅行時長圖表 mode
function switchChartTravelMode(newTravelData, mode) {
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
          // month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
          const d = dayjs(value);
          const forcedDate = chart_travel.forcedDate;

          if (forcedDate && d.isSame(forcedDate, "day")) {
            return d.format("D");
          }

          if (
            forcedDate &&
            (d.isSame(forcedDate.add(1, "day"), "day") ||
              d.isSame(forcedDate.subtract(1, "day"), "day"))
          ) {
            return "";
          }

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
      animation: { duration: 800 },
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
      currentMode: currentTab, // 自訂的屬性
    },
    plugins: [
      averageLinePlugin,
      autoSelectPlugin,
      clickOnDataOnlyPlugin,
      monthFocusDatePlugin,
    ],
  });
}

// -------------------
// 設置啟程時間
function setDepartureData(index) {
  const data = departureSummary[index];
  if (!data) return;

  // 設置啟程時間資料
  if (goalDepartureEl) {
    goalDepartureEl.textContent = data.goalDeparture + " 天";
  }
  if (lastDepartureEl) {
    lastDepartureEl.textContent =
      currentTab === "week" ? "上週" : currentTab === "month" ? "上月" : "去年";
  }
  if (diffDepartureEl) {
    diffDepartureEl.textContent = Math.abs(data.diffFromLastDeparture) + " 天";
    if (data.diffFromLastDeparture > 0) {
      diffDepartureEl.classList.remove("text-danger-90");
      diffUpDepartureEl && diffUpDepartureEl.classList.remove("d-none");
      diffDownDepartureEl && diffDownDepartureEl.classList.add("d-none");
    } else {
      diffDepartureEl.classList.add("text-danger-90");
      diffUpDepartureEl && diffUpDepartureEl.classList.add("d-none");
      diffDownDepartureEl && diffDownDepartureEl.classList.remove("d-none");
    }
  }
  if (mostDepartureEl) {
    mostDepartureEl.textContent = data.mostDeparture;
  }

  // 判斷是否同一 tab
  const isSameTab = chart_departure && currentTab === lastTab;
  if (!chart_departure || !isSameTab) {
    // 不同 tab 或第一次建立，建立新圖表
    switchChartDepartureMode(data, currentTab);
  } else {
    // 同一 tab ，直接更新 dataset，不 destroy
    const dataset = chart_departure.data.datasets[0];
    dataset.data =
      currentTab === "year"
        ? data.data.map((item) =>
            item.departure !== 0 ? item.departure.toDate() : null
          )
        : data.data.map((item) => ({
            x: item.date,
            y: item.departure !== 0 ? item.departure.toDate() : null,
          }));
    dataset.backgroundColor = Array(data.data.length).fill("#C5CCCB");
    dataset.pointBackgroundColor = Array(data.data.length).fill("#C5CCCB");
    // 設置 x 軸
    if (currentTab === "month") {
      const allDates = data.data.map((item) => dayjs(item.date));
      const lastDay = allDates[allDates.length - 1];
      const tickDates = allDates.filter(
        (d) => d.date() === 1 || (d.date() % 5 === 0 && d.date() !== 30)
      );
      tickDates.push(lastDay);
      chart_departure.options.scales.x.min = allDates[0].toDate();
      chart_departure.options.scales.x.max = lastDay.toDate();
      chart_departure.options.scales.x.ticks.callback = function (value) {
        // month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
        const d = dayjs(value);
        const forcedDate = chart_departure.forcedDate;

        if (forcedDate && d.isSame(forcedDate, "day")) {
          return d.format("D");
        }

        if (
          forcedDate &&
          (d.isSame(forcedDate.add(1, "day"), "day") ||
            d.isSame(forcedDate.subtract(1, "day"), "day"))
        ) {
          return "";
        }

        return tickDates.find((td) => td.isSame(d, "day")) ? d.format("D") : "";
      };
    }

    // console.log("minTime", data.minTime.format());
    // console.log("maxTime", data.maxTime.format());
    // 計算相差小時數
    const hoursDiff = data.maxTime.diff(data.minTime, "hour");
    // 基本 stepSize
    let stepSize = 1; // 每個刻度代表 1 小時
    // 如果時間差超過指定值，增加 stepSize
    const threshold = 4; // 例如 4 小時以上
    if (hoursDiff > threshold) {
      stepSize = 2; // 每個刻度變成 2 小時
    }
    chart_departure.options.scales.y.ticks.stepSize = stepSize;

    // 設置 y 軸最大最小值
    chart_departure.options.scales.y.min = data.minTime.toDate();
    chart_departure.options.scales.y.max = data.maxTime.toDate();
    // 清除 tooltip
    chart_departure.tooltip.setActiveElements([]);

    // 重置 autoSelectPlugin 參數
    chart_departure._autoSelectDone = false;
    chart_departure._animationRunning = true;

    chart_departure.update();
  }
}

// 設置啟程時間圖表 mode
function switchChartDepartureMode(newDepartureData, mode) {
  // 銷毀舊圖表
  if (chart_departure) chart_departure.destroy();

  // console.log("minTime", newDepartureData.minTime.format());
  // console.log("maxTime", newDepartureData.maxTime.format());

  // 設定 x 軸與 barThickness
  let xConfig = {};
  // let barThickness = 5;
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
            chart_departure &&
            chart_departure.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
      },
    };
  } else if (mode === "month") {
    const allDates = newDepartureData.data.map((item) => dayjs(item.date));
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
            chart_departure &&
            chart_departure.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
        callback: function (value) {
          // month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
          const d = dayjs(value);
          const forcedDate = chart_departure.forcedDate;

          if (forcedDate && d.isSame(forcedDate, "day")) {
            return d.format("D");
          }

          if (
            forcedDate &&
            (d.isSame(forcedDate.add(1, "day"), "day") ||
              d.isSame(forcedDate.subtract(1, "day"), "day"))
          ) {
            return "";
          }

          return tickDates.find((td) => td.isSame(d, "day"))
            ? d.format("D")
            : "";
        },
      },
    };
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
            chart_departure &&
            chart_departure.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
      },
    };
  }

  // 計算相差小時數
  const hoursDiff = newDepartureData.maxTime.diff(
    newDepartureData.minTime,
    "hour"
  );
  // 基本 stepSize
  let stepSize = 1; // 每個刻度代表 1 小時
  // 如果時間差超過指定值，增加 stepSize
  const threshold = 4; // 例如 4 小時以上
  if (hoursDiff > threshold) {
    stepSize = 2; // 每個刻度變成 2 小時
  }

  chart_departure = new Chart(ctx_departure, {
    type: "bar",
    data: {
      labels:
        mode === "year"
          ? newDepartureData.data.map((item) => item.date)
          : undefined,
      datasets: [
        {
          data:
            mode === "year"
              ? newDepartureData.data.map((item) =>
                  item.departure !== 0 ? item.departure.toDate() : null
                )
              : newDepartureData.data.map((item) => ({
                  x: item.date,
                  y: item.departure !== 0 ? item.departure.toDate() : null,
                })),
          // 設定為折線
          type: "line",
          borderColor: "#C5CCCB",
          borderWidth: 2,
          backgroundColor: Array(newDepartureData.data.length).fill("#C5CCCB"),
          hoverBackgroundColor: "#7BC9C2",
          // minBarLength: 1,
          // point 預設不顯示點
          pointRadius: 4,
          pointBorderWidth: 0,
          pointBackgroundColor: Array(newDepartureData.data.length).fill(
            "#C5CCCB"
          ),
          // hover 時才顯示點 (不放大)
          pointHitRadius: 6, // hover 判定區域，可比點大一點
          pointHoverBackgroundColor: "#7BC9C2",
        },
      ],
    },
    options: {
      animation: { duration: 800 },
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: mode === "year" ? tooltip_config_4 : tooltip_config_3,
      },
      layout: { padding: { left: 0, right: 0, top: 24, bottom: 0 } },
      scales: {
        x: xConfig,
        y: {
          type: "time",
          time: { unit: "hour", displayFormats: { hour: "hh:mm" } },
          min: newDepartureData.minTime.toDate(),
          max: newDepartureData.maxTime.toDate(),
          grid: { drawTicks: false, color: "rgba(197, 204, 203, 0.6)" },
          border: { display: false, dash: [2, 2], width: 1 },
          ticks: {
            stepSize: stepSize,
            color: "rgba(197, 204, 203, 0.6)",
            padding: 0,
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
        dataset.pointBackgroundColor = Array(dataset.data.length).fill(
          "#C5CCCB"
        );
        dataset.pointBackgroundColor[index] = "#7BC9C2";

        chart.update();
      },
      currentMode: currentTab, // 自訂的屬性
    },
    plugins: [
      forceMaxTickPlugin,
      verticalLinePlugin,
      autoSelectPlugin,
      clickOnDataOnlyPlugin,
      monthFocusDatePlugin,
    ],
  });
}

// -------------------
// 設置抵達時間
function setArrivalData(index) {
  const data = arrivalSummary[index];
  if (!data) return;

  // 設置啟程時間資料
  if (goalArrivalEl) {
    goalArrivalEl.textContent = data.goalArrival + " 天";
  }
  if (lastArrivalEl) {
    lastArrivalEl.textContent =
      currentTab === "week" ? "上週" : currentTab === "month" ? "上月" : "去年";
  }
  if (diffArrivalEl) {
    diffArrivalEl.textContent = Math.abs(data.diffFromLastArrival) + " 天";
    if (data.diffFromLastArrival > 0) {
      diffArrivalEl.classList.remove("text-danger-90");
      diffUpArrivalEl && diffUpArrivalEl.classList.remove("d-none");
      diffDownArrivalEl && diffDownArrivalEl.classList.add("d-none");
    } else {
      diffArrivalEl.classList.add("text-danger-90");
      diffUpArrivalEl && diffUpArrivalEl.classList.add("d-none");
      diffDownArrivalEl && diffDownArrivalEl.classList.remove("d-none");
    }
  }
  if (mostArrivalEl) {
    mostArrivalEl.textContent = data.mostArrival;
  }

  // 判斷是否同一 tab
  const isSameTab = chart_arrival && currentTab === lastTab;
  if (!chart_arrival || !isSameTab) {
    // 不同 tab 或第一次建立，建立新圖表
    switchChartArrivalMode(data, currentTab);
  } else {
    // 同一 tab ，直接更新 dataset，不 destroy
    const dataset = chart_arrival.data.datasets[0];
    dataset.data =
      currentTab === "year"
        ? data.data.map((item) =>
            item.arrival !== 0 ? item.arrival.toDate() : null
          )
        : data.data.map((item) => ({
            x: item.date,
            y: item.arrival !== 0 ? item.arrival.toDate() : null,
          }));
    dataset.backgroundColor = Array(data.data.length).fill("#C5CCCB");
    dataset.pointBackgroundColor = Array(data.data.length).fill("#C5CCCB");
    // 設置 x 軸
    if (currentTab === "month") {
      const allDates = data.data.map((item) => dayjs(item.date));
      const lastDay = allDates[allDates.length - 1];
      const tickDates = allDates.filter(
        (d) => d.date() === 1 || (d.date() % 5 === 0 && d.date() !== 30)
      );
      tickDates.push(lastDay);
      chart_arrival.options.scales.x.min = allDates[0].toDate();
      chart_arrival.options.scales.x.max = lastDay.toDate();
      chart_arrival.options.scales.x.ticks.callback = function (value) {
        // month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
        const d = dayjs(value);
        const forcedDate = chart_arrival.forcedDate;

        if (forcedDate && d.isSame(forcedDate, "day")) {
          return d.format("D");
        }

        if (
          forcedDate &&
          (d.isSame(forcedDate.add(1, "day"), "day") ||
            d.isSame(forcedDate.subtract(1, "day"), "day"))
        ) {
          return "";
        }

        return tickDates.find((td) => td.isSame(d, "day")) ? d.format("D") : "";
      };
    }

    // console.log("minTime", data.minTime.format());
    // console.log("maxTime", data.maxTime.format());
    // 計算相差小時數
    const hoursDiff = data.maxTime.diff(data.minTime, "hour");
    // 基本 stepSize
    let stepSize = 1; // 每個刻度代表 1 小時
    // 如果時間差超過指定值，增加 stepSize
    const threshold = 4; // 例如 4 小時以上
    if (hoursDiff > threshold) {
      stepSize = 2; // 每個刻度變成 2 小時
    }
    chart_arrival.options.scales.y.ticks.stepSize = stepSize;

    // 設置 y 軸最大最小值
    chart_arrival.options.scales.y.min = data.minTime.toDate();
    chart_arrival.options.scales.y.max = data.maxTime.toDate();
    // 清除 tooltip
    chart_arrival.tooltip.setActiveElements([]);

    // 重置 autoSelectPlugin 參數
    chart_arrival._autoSelectDone = false;
    chart_arrival._animationRunning = true;

    chart_arrival.update();
  }
}

// 設置啟程時間圖表 mode
function switchChartArrivalMode(newArrivalData, mode) {
  // 銷毀舊圖表
  if (chart_arrival) chart_arrival.destroy();

  // console.log("minTime", newArrivalData.minTime.format());
  // console.log("maxTime", newArrivalData.maxTime.format());

  // 設定 x 軸與 barThickness
  let xConfig = {};
  // let barThickness = 5;
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
            chart_arrival && chart_arrival.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
      },
    };
  } else if (mode === "month") {
    const allDates = newArrivalData.data.map((item) => dayjs(item.date));
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
            chart_arrival && chart_arrival.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
        callback: function (value) {
          // month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
          const d = dayjs(value);
          const forcedDate = chart_arrival.forcedDate;

          if (forcedDate && d.isSame(forcedDate, "day")) {
            return d.format("D");
          }

          if (
            forcedDate &&
            (d.isSame(forcedDate.add(1, "day"), "day") ||
              d.isSame(forcedDate.subtract(1, "day"), "day"))
          ) {
            return "";
          }

          return tickDates.find((td) => td.isSame(d, "day"))
            ? d.format("D")
            : "";
        },
      },
    };
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
            chart_arrival && chart_arrival.selectedBarIndex === context.index
              ? "bold"
              : "normal",
          lineHeight: 1.33,
        }),
      },
    };
  }

  // 計算相差小時數
  const hoursDiff = newArrivalData.maxTime.diff(newArrivalData.minTime, "hour");
  // 基本 stepSize
  let stepSize = 1; // 每個刻度代表 1 小時
  // 如果時間差超過指定值，增加 stepSize
  const threshold = 4; // 例如 4 小時以上
  if (hoursDiff > threshold) {
    stepSize = 2; // 每個刻度變成 2 小時
  }

  chart_arrival = new Chart(ctx_arrival, {
    type: "bar",
    data: {
      labels:
        mode === "year"
          ? newArrivalData.data.map((item) => item.date)
          : undefined,
      datasets: [
        {
          data:
            mode === "year"
              ? newArrivalData.data.map((item) =>
                  item.arrival !== 0 ? item.arrival.toDate() : null
                )
              : newArrivalData.data.map((item) => ({
                  x: item.date,
                  y: item.arrival !== 0 ? item.arrival.toDate() : null,
                })),
          // 設定為折線
          type: "line",
          borderColor: "#C5CCCB",
          borderWidth: 2,
          backgroundColor: Array(newArrivalData.data.length).fill("#C5CCCB"),
          hoverBackgroundColor: "#7BC9C2",
          // minBarLength: 1,
          // point 預設不顯示點
          pointRadius: 4,
          pointBorderWidth: 0,
          pointBackgroundColor: Array(newArrivalData.data.length).fill(
            "#C5CCCB"
          ),
          // hover 時才顯示點 (不放大)
          pointHitRadius: 6, // hover 判定區域，可比點大一點
          pointHoverBackgroundColor: "#7BC9C2",
        },
      ],
    },
    options: {
      animation: { duration: 800 },
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: mode === "year" ? tooltip_config_5 : tooltip_config_3,
      },
      layout: { padding: { left: 0, right: 0, top: 24, bottom: 0 } },
      scales: {
        x: xConfig,
        y: {
          type: "time",
          time: { unit: "hour", displayFormats: { hour: "hh:mm" } },
          min: newArrivalData.minTime.toDate(),
          max: newArrivalData.maxTime.toDate(),
          grid: { drawTicks: false, color: "rgba(197, 204, 203, 0.6)" },
          border: { display: false, dash: [2, 2], width: 1 },
          ticks: {
            stepSize: stepSize,
            color: "rgba(197, 204, 203, 0.6)",
            padding: 0,
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
        dataset.pointBackgroundColor = Array(dataset.data.length).fill(
          "#C5CCCB"
        );
        dataset.pointBackgroundColor[index] = "#7BC9C2";

        chart.update();
      },
      currentMode: currentTab, // 自訂的屬性
    },
    plugins: [
      forceMaxTickPlugin,
      verticalLinePlugin,
      autoSelectPlugin,
      clickOnDataOnlyPlugin,
      monthFocusDatePlugin,
    ],
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
  setDepartureData(currentDataIndex);
  setArrivalData(currentDataIndex);
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
