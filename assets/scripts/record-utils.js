import dataJSON from "/assets/scripts/record-data.json";
import dayjs from "dayjs";

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
    differenceFromLastWeek: week.differenceFromLastWeek,
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
    differenceFromLastWeek: month.differenceFromLastWeek,
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
    differenceFromLastWeek: year.differenceFromLastWeek,
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

export { getTravelSummary };
