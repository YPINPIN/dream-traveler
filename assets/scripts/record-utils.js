import dataJSON from "/assets/scripts/record-data.json";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
dayjs.extend(minMax);

// 週資料
const weekJSON = dataJSON["week"];
// 月資料
const monthJSON = dataJSON["month"];
// 年資料
const yearJSON = dataJSON["year"];

// 取得指定週的旅行時長資料 (0 為最新週)
function getWeekTravelDataByIndex(weekIndex) {
  if (!weekJSON) return null;

  const week = weekJSON[weekIndex];
  if (!week) return null;

  return {
    dateStr: `${dayjs(week.data[0].date).format("M月D日")} 至 ${dayjs(
      week.data[week.data.length - 1].date
    ).format("M月D日")}`,
    averageTravelTime: week.averageTravelTime,
    diffFromLastTravel: week.diffFromLastTravel,
    totalTravelTime: week.totalTravelTime,
    data: week.data.map((item) => ({
      date: item.date,
      travelTime: item.travelTime,
    })),
  };
}
// 取得指定月的旅行時長資料 (0 為最新月)
function getMonthTravelDataByIndex(monthIndex) {
  if (!monthJSON) return null;

  const month = monthJSON[monthIndex];
  if (!month) return null;

  const data = month.data.map((item) => ({
    date: item.date,
    travelTime: item.travelTime,
  }));

  // 取得當月第一天與最後一天
  const firstDay = dayjs(data[0].date).startOf("month");
  const lastDay = dayjs(data[0].date).endOf("month");

  // 建立完整日期陣列
  const fullDates = [];
  for (
    let d = firstDay;
    d.isBefore(lastDay) || d.isSame(lastDay, "day");
    d = d.add(1, "day")
  ) {
    fullDates.push(d.format("YYYY-MM-DD"));
  }

  // 用 map 建立完整資料，缺少的日期補 0
  const completeData = fullDates.map((dateStr) => {
    const existing = data.find((item) => item.date === dateStr);
    return {
      date: dateStr,
      travelTime: existing ? existing.travelTime : 0, // 沒有就補 0
    };
  });

  return {
    dateStr: `${dayjs(data[0].date).format("M月")}`,
    averageTravelTime: month.averageTravelTime,
    diffFromLastTravel: month.diffFromLastTravel,
    totalTravelTime: month.totalTravelTime,
    data: completeData,
  };
}

// 取得指定年的旅行時長資料 (0 為最新年)
function getYearTravelDataByIndex(yearIndex) {
  if (!yearJSON) return null;

  const year = yearJSON[yearIndex];
  if (!year) return null;

  const data = year.data.map((item) => ({
    date: item.month,
    travelTime: item.travelTime,
  }));

  // 用 map 建立完整資料，缺少的日期補 0
  const completeData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
    (dateStr) => {
      const existing = data.find((item) => item.date === dateStr);
      return {
        date: dateStr,
        travelTime: existing ? existing.travelTime : 0, // 沒有就補 0
      };
    }
  );

  return {
    dateStr: year.year + "年",
    averageTravelTime: year.averageTravelTime,
    diffFromLastTravel: year.diffFromLastTravel,
    totalTravelTime: year.totalTravelTime,
    data: completeData,
  };
}

// 取得旅行時長總結資料
function getTravelSummary(type = "week") {
  let travelSummary;
  switch (type) {
    case "week":
      if (!weekJSON) travelSummary = null;
      travelSummary = weekJSON.map((d, index) => {
        return getWeekTravelDataByIndex(index);
      });
      break;
    case "month":
      if (!monthJSON) travelSummary = null;
      travelSummary = monthJSON.map((d, index) => {
        return getMonthTravelDataByIndex(index);
      });
      break;
    case "year":
      if (!yearJSON) travelSummary = null;
      travelSummary = yearJSON.map((d, index) => {
        return getYearTravelDataByIndex(index);
      });
      break;
    default:
      break;
  }

  // console.log(travelSummary);
  return travelSummary;
}

// 取得最多紀錄的小時區間
function getMostHourTime(data) {
  // 統計區間數量
  const rangeCount = {};
  data.forEach((d) => {
    const hour24 = d.departure.hour(); // 0-23
    // 轉 12 小時制
    const formatHour = (h) => {
      const period = h < 12 ? "AM" : "PM";
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12; // 0點 → 12AM, 12點 → 12PM
      return `${hour12}:00 ${period}`;
    };
    const range = `${formatHour(hour24)} - ${formatHour((hour24 + 1) % 24)}`;

    rangeCount[range] = (rangeCount[range] || 0) + 1;
  });
  // console.log("區間分布:", rangeCount);
  // 找出出現最多的區間
  let maxRange = null;
  let maxCount = -1;
  for (const [range, count] of Object.entries(rangeCount)) {
    if (count > maxCount) {
      maxCount = count;
      maxRange = range;
    }
  }

  // console.log(`資料最多的區間: ${maxRange}，共 ${maxCount} 筆`);
  return maxRange;
}

// 取得指定週的起程時間資料 (0 為最新週)
function getWeekDepartureDataByIndex(weekIndex) {
  if (!weekJSON) return null;

  const week = weekJSON[weekIndex];
  if (!week) return null;

  const data = week.data.map((item) => {
    // 分割時分
    const [hStr, mStr] = item.departureAt.split(":");
    const h = Number(hStr);
    const m = Number(mStr);

    // 補上固定日期 + 時間
    let fixedDateTime = dayjs("1970-01-01").hour(h).minute(m).second(0);
    // 如果是凌晨時間 (例如 0~6點) 視為隔天
    if (h < 6) {
      fixedDateTime = fixedDateTime.add(1, "day");
    }
    // console.log(fixedDateTime.format());
    return {
      date: item.date,
      departure: fixedDateTime,
    };
  });

  // 取得最小值 & 最大值
  let minTime = dayjs.min(data.map((d) => d.departure)).minute(0);
  let maxTime = dayjs.max(data.map((d) => d.departure));
  // maxTime 如果分鐘不是 0，調整時間
  if (maxTime.minute() !== 0) maxTime = maxTime.add(1, "hour").minute(0);

  const maxRange = getMostHourTime(data);

  return {
    goalDeparture: week.goalDeparture,
    diffFromLastDeparture: week.diffFromLastDeparture,
    mostDeparture: maxRange,
    data,
    minTime,
    maxTime,
  };
}
// 取得指定月的起程時間資料 (0 為最新月)
function getMonthDepartureDataByIndex(monthIndex) {
  if (!monthJSON) return null;

  const month = monthJSON[monthIndex];
  if (!month) return null;

  const data = month.data.map((item) => {
    // 分割時分
    const [hStr, mStr] = item.departureAt.split(":");
    const h = Number(hStr);
    const m = Number(mStr);

    // 補上固定日期 + 時間
    let fixedDateTime = dayjs("1970-01-01").hour(h).minute(m).second(0);
    // 如果是凌晨時間 (例如 0~6點) 視為隔天
    if (h < 6) {
      fixedDateTime = fixedDateTime.add(1, "day");
    }
    // console.log(fixedDateTime.format());
    return {
      date: item.date,
      departure: fixedDateTime,
    };
  });

  // 取得最小值 & 最大值
  let minTime = dayjs.min(data.map((d) => d.departure)).minute(0);
  let maxTime = dayjs.max(data.map((d) => d.departure));
  // maxTime 如果分鐘不是 0，調整時間
  if (maxTime.minute() !== 0) maxTime = maxTime.add(1, "hour").minute(0);

  const maxRange = getMostHourTime(data);

  // 取得當月第一天與最後一天
  const firstDay = dayjs(data[0].date).startOf("month");
  const lastDay = dayjs(data[0].date).endOf("month");

  // 建立完整日期陣列
  const fullDates = [];
  for (
    let d = firstDay;
    d.isBefore(lastDay) || d.isSame(lastDay, "day");
    d = d.add(1, "day")
  ) {
    fullDates.push(d.format("YYYY-MM-DD"));
  }

  // 用 map 建立完整資料，缺少的日期補 0
  const completeData = fullDates.map((dateStr) => {
    const existing = data.find((item) => item.date === dateStr);
    return {
      date: dateStr,
      departure: existing ? existing.departure : 0, // 沒有就補 0
    };
  });

  return {
    goalDeparture: month.goalDeparture,
    diffFromLastDeparture: month.diffFromLastDeparture,
    mostDeparture: maxRange,
    data: completeData,
    minTime,
    maxTime,
  };
}

// 取得指定年的起程時間資料 (0 為最新年)
function getYearDepartureDataByIndex(yearIndex) {
  if (!yearJSON) return null;

  const year = yearJSON[yearIndex];
  if (!year) return null;

  const data = year.data.map((item) => {
    // 分割時分
    const [hStr, mStr] = item.departureAt.split(":");
    const h = Number(hStr);
    const m = Number(mStr);

    // 補上固定日期 + 時間
    let fixedDateTime = dayjs("1970-01-01").hour(h).minute(m).second(0);
    // 如果是凌晨時間 (例如 0~6點) 視為隔天
    if (h < 6) {
      fixedDateTime = fixedDateTime.add(1, "day");
    }
    // console.log(fixedDateTime.format());
    return {
      date: item.month,
      departure: fixedDateTime,
    };
  });

  // 取得最小值 & 最大值
  let minTime = dayjs.min(data.map((d) => d.departure)).minute(0);
  let maxTime = dayjs.max(data.map((d) => d.departure));
  // maxTime 如果分鐘不是 0，調整時間
  if (maxTime.minute() !== 0) maxTime = maxTime.add(1, "hour").minute(0);

  const maxRange = getMostHourTime(data);

  // 用 map 建立完整資料，缺少的日期補 0
  const completeData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
    (dateStr) => {
      const existing = data.find((item) => item.date === dateStr);
      return {
        date: dateStr,
        departure: existing ? existing.departure : 0, // 沒有就補 0
      };
    }
  );

  return {
    goalDeparture: year.goalDeparture,
    diffFromLastDeparture: year.diffFromLastDeparture,
    mostDeparture: maxRange,
    data: completeData,
    minTime,
    maxTime,
  };
}

// 取得起程時間總結資料
function getDepartureSummary(type = "week") {
  let departureSummary;
  switch (type) {
    case "week":
      if (!weekJSON) departureSummary = null;
      departureSummary = weekJSON.map((d, index) => {
        return getWeekDepartureDataByIndex(index);
      });
      break;
    case "month":
      if (!monthJSON) departureSummary = null;
      departureSummary = monthJSON.map((d, index) => {
        return getMonthDepartureDataByIndex(index);
      });
      break;
    case "year":
      if (!yearJSON) departureSummary = null;
      departureSummary = yearJSON.map((d, index) => {
        return getYearDepartureDataByIndex(index);
      });
      break;
    default:
      break;
  }

  // console.log(departureSummary);
  return departureSummary;
}

export { getTravelSummary, getDepartureSummary };
