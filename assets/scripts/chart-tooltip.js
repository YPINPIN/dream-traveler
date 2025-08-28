import dayjs from "dayjs";

// tooltip config
const tooltip_config_1 = {
  events: ["click"],
  animation: false,
  backgroundColor: "#F6F7F7",
  bodyColor: "#15312F",
  bodyFont: {
    size: 12,
    weight: "bold",
    lineHeight: 1.33,
  },
  padding: 4,
  cornerRadius: 4,
  // 是否顯示顏色色塊
  displayColors: false,
  // 顯示的位置
  xAlign: "center",
  yAlign: "bottom",
  callbacks: {
    title: function (tooltipItem) {
      // 返回空字串不顯示 title
      return "";
    },
    label: function (tooltipItem) {
      // 返回值加上單位
      return tooltipItem.formattedValue + " H";
    },
  },
};

const tooltip_config_2 = {
  events: ["click"],
  animation: false,
  backgroundColor: "#F6F7F7",
  titleColor: "#15312F",
  titleFont: {
    size: 12,
    weight: "normal",
    lineHeight: 1.33,
  },
  titleAlign: "center",
  titleMarginBottom: 0,
  bodyColor: "#15312F",
  bodyFont: {
    size: 12,
    weight: "bold",
    lineHeight: 1.33,
  },
  bodyAlign: "center",
  padding: 4,
  cornerRadius: 4,
  // 是否顯示顏色色塊
  displayColors: false,
  // 顯示的位置
  xAlign: "center",
  yAlign: "bottom",
  callbacks: {
    title: function (tooltipItem) {
      return "平均";
    },
    label: function (tooltipItem) {
      // 返回值加上單位
      return tooltipItem.formattedValue + " H";
    },
  },
};

const tooltip_config_3 = {
  events: ["click"],
  animation: false,
  backgroundColor: "#F6F7F7",
  bodyColor: "#15312F",
  bodyFont: {
    size: 12,
    weight: "bold",
    lineHeight: 1.33,
  },
  padding: 4,
  cornerRadius: 4,
  // 是否顯示顏色色塊
  displayColors: false,
  // 顯示的位置
  xAlign: "center",
  yAlign: "bottom",
  callbacks: {
    title: function (tooltipItem) {
      // 返回空字串不顯示 title
      return "";
    },
    label: function (tooltipItem) {
      // 返回格式化的時間
      return dayjs(tooltipItem.raw.y).format("hh:mm A");
    },
  },
};

const tooltip_config_4 = {
  events: ["click"],
  animation: false,
  backgroundColor: "#F6F7F7",
  titleColor: "#15312F",
  titleFont: {
    size: 12,
    weight: "normal",
    lineHeight: 1.33,
  },
  titleAlign: "center",
  titleMarginBottom: 0,
  bodyColor: "#15312F",
  bodyFont: {
    size: 12,
    weight: "bold",
    lineHeight: 1.33,
  },
  bodyAlign: "center",
  padding: 4,
  cornerRadius: 4,
  // 是否顯示顏色色塊
  displayColors: false,
  // 顯示的位置
  xAlign: "center",
  yAlign: "bottom",
  callbacks: {
    title: function (tooltipItem) {
      return "平均啟程時間";
    },
    label: function (tooltipItem) {
      // 返回格式化的時間
      return dayjs(tooltipItem.raw).format("hh:mm A");
    },
  },
};

export {
  tooltip_config_1,
  tooltip_config_2,
  tooltip_config_3,
  tooltip_config_4,
};
