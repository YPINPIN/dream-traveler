import dayjs from "dayjs";

// 平均線 plugin
export const averageLinePlugin = {
  id: "averageLine",
  beforeDraw: (chart) => {
    const {
      ctx,
      chartArea: { left, right },
      scales: { y },
    } = chart;

    // 從 options 取得平均值 (小數第一位)
    const average =
      chart.config.options.plugins?.averageLine?.average.toFixed(1);
    if (average == null) return; // 沒設定就不畫

    // 取得 Y 軸平均值的像素位置
    const averageY = y.getPixelForValue(average);

    // 繪製平均線
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#C5CCCB";
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);
    ctx.moveTo(left, averageY);
    ctx.lineTo(right, averageY);
    ctx.stroke();

    // 繪製平均文字
    ctx.fillStyle = "#C5CCCB";
    ctx.textAlign = "right";
    ctx.fillText(`${average}`, left - 8, averageY + 4);
    ctx.restore();
  },
};

// 垂直線 plugin
export const verticalLinePlugin = {
  id: "verticalLine",
  beforeDraw: (chart) => {
    // 檢查是否有顯示的tooltip，判斷資料是否被點擊
    if (chart.tooltip?._active?.length) {
      const activePoint = chart.tooltip._active[0];
      // 取得被點擊的 data 座標
      const x = activePoint.element.x;
      const y = activePoint.element.y;
      // 取得 Y 軸
      const yAxis = chart.scales.y;
      const ctx = chart.ctx;

      // 垂直線 shadow 設定
      ctx.shadowColor = "rgba(123, 201, 194, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 繪製垂直線
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, yAxis.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#7BC9C2";
      ctx.stroke();
      ctx.restore();

      // 重置 shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }
  },
};

// 強制顯示 y.max
export const forceMaxTickPlugin = {
  id: "forceMaxTick",
  afterBuildTicks(chart) {
    const yAxis = chart.scales.y;
    const ticks = yAxis.ticks.map((t) => t.value);
    const maxTimeMs = chart.options.scales.y.max.getTime(); // 從 y.max 取得

    if (!ticks.includes(maxTimeMs)) {
      yAxis.ticks.push({ value: maxTimeMs }); // 不用自己格式化
    }
  },
};

// 自動觸發最後一筆資料 tooltip、onClick 的 plugin
export const autoSelectPlugin = {
  id: "autoSelect",
  beforeInit(chart) {
    // 初始化 flag
    chart._animationRunning = true;
    chart._autoSelectDone = false;
  },
  beforeEvent(chart, args) {
    // 動畫還在跑，阻擋 click 事件
    if (chart._animationRunning && args.event.type === "click") {
      // console.log("阻擋 click");
      return false;
    }
  },
  afterRender(chart, args, options) {
    if (chart._autoSelectDone) return; // 避免循環
    chart._autoSelectDone = true;

    const datasetIndex = options.datasetIndex ?? 0;
    const dataset = chart.data.datasets[datasetIndex];
    if (!dataset || dataset.data.length === 0) return;

    // 找到最後一筆有值的資料
    const reversedIndex = [...dataset.data].reverse().findIndex((d) => {
      // console.log("d", d);
      if (d === null || d === 0) return false;
      if (d.x) {
        if (d.y) return true;
      } else {
        return true;
      }
      return false;
    });
    const lastIndex =
      reversedIndex === -1 ? -1 : dataset.data.length - 1 - reversedIndex;
    // console.log("lastIndex", lastIndex);

    if (lastIndex === -1) return;

    const element = chart.getDatasetMeta(datasetIndex).data[lastIndex];
    if (!element) return;

    // 拿到 element 的座標（相對於 canvas）
    const pos = element.getProps(["x", "y"], true);

    // 建立假的事件
    const fakeEvent = {
      type: "click",
      chart,
      native: null, // 可以保持 null
      offsetX: pos.x, // 官方常用 offsetX/offsetY
      offsetY: pos.y,
      x: pos.x, // Chart.js 4.x 也會用 x/y
      y: pos.y,
    };

    // 找對應元素
    const elements = chart.getElementsAtEventForMode(
      fakeEvent,
      "nearest",
      { intersect: true },
      true
    );

    // 設定 tooltip active
    chart.tooltip.setActiveElements(elements, { x: pos.x, y: pos.y });
    // 重繪，不會觸發動畫
    chart.draw();
    chart.options.onClick(fakeEvent, elements, chart);
    // 額外觸發 monthFocusDatePlugin 的 beforeEvent
    monthFocusDatePlugin.beforeEvent?.(chart, { event: fakeEvent });
    // 動畫完成，允許點擊
    chart._animationRunning = false;
  },
};

export const clickOnDataOnlyPlugin = {
  id: "clickOnDataOnly",
  beforeEvent(chart, args) {
    const e = args.event;
    if (e.type === "click") {
      // 找對應元素
      const elements = chart.getElementsAtEventForMode(
        e.native,
        "nearest",
        { intersect: true },
        true
      );

      if (elements.length > 0) {
        // 點到圖表元素，可以執行後續處理
      } else {
        // 點到空白區域，阻擋
        return false;
      }
    }
  },
};

// month 模式下點到當前 x 軸 tick 的前後一日日期，強制顯示該日期，並隱藏掉相鄰的 tick。
export const monthFocusDatePlugin = {
  id: "monthFocusDate",
  beforeEvent(chart, args) {
    const e = args.event;
    // 不是 month 模式，直接跳過
    if (chart.options.currentMode === "month" && e.type === "click") {
      const elements = chart.getElementsAtEventForMode(
        e,
        "nearest",
        { intersect: true },
        true
      );

      if (elements.length > 0) {
        const el = elements[0];
        const dataset = chart.data.datasets[el.datasetIndex];
        let clickedDate = dataset.data[el.index].x;
        // 點到日期存在 chart 裡
        chart.forcedDate = dayjs(clickedDate);
        chart.update();
      } else {
        // 點到空白區域，阻擋
        return false;
      }
    }
  },
};
