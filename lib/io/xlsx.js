const xlsx = require("xlsx");
const PageData = require("../dao/pageData.js");
const TimeId = require("../tool/timeId.js");

exports.getXlsxUrlColumnArr = async function getXlsxUrlColumnArr(path) {
  let rtnArr = [];
  const book = xlsx.readFile(path);
  const ws = book.Sheets["urllist"];
  const range = xlsx.utils.decode_range(ws["!ref"]);

  for (let i = 1; i <= range.e.r; i++) {
    let cell = ws[xlsx.utils.encode_cell({ r: i, c: 0 })];
    try {
      const url = new URL(cell.v);
      rtnArr.push(url.href);
    } catch (e) {
      console.log(
        "skip:" + xlsx.utils.encode_cell({ r: i, c: 0 }) + " (not URL)"
      );
    }
  }

  return new Promise(function (resolve) {
    resolve(rtnArr);
  });
};
exports.formatExportData = async function formatExportData(data) {
  let rtnArr = [];
  let rowTmpArr = [];
  const itemKeyArr = Object.keys(new PageData().info);
  // ヘッダ
  rowTmpArr = [];
  rowTmpArr.push("url");
  itemKeyArr.forEach((key) => {
    rowTmpArr.push(key);
  });
  rtnArr.push(rowTmpArr);

  // 実データ
  data.forEach((v, url) => {
    rowTmpArr = [];
    rowTmpArr.push(url);
    itemKeyArr.forEach((itemKey) => {
      rowTmpArr.push(v[itemKey]);
    });
    rtnArr.push(rowTmpArr);
  });
  return new Promise(function (resolve) {
    resolve(rtnArr);
  });
};
exports.xlsxExport = async function xlsxExport(data) {
  let filename = "./result/" + TimeId.getTimeId() + "/result.xlsx";
  try {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(data);
    const ws_name = "urllist";

    xlsx.utils.book_append_sheet(wb, ws, ws_name);
    xlsx.writeFile(wb, filename);
  } catch (e) {
    console.log(e);
  }
  return new Promise(function (resolve) {
    resolve(filename);
  });
};
