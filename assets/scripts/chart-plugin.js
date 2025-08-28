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
