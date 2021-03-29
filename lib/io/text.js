const fs = require("fs").promises;
const PageData = require("../dao/pageData.js");

exports.readListData = async function readListData(filename) {
  const readData = await fs.readFile(filename, "utf8");
  const listArr = readData.split(/\r\n|\n|\r/);
  let rtnArr = [];
  for (let i = 0; i < listArr.length; i++) {
    let item = listArr[i];
    try {
      const url = new URL(item.split("\t")[0]);
      rtnArr.push(url.href);
    } catch (e) {
      console.log(
        "skip line (" +
          (i + 1) +
          ') because "' +
          item.split("\t")[0] +
          '" is not URL.'
      );
    }
  }
  return new Promise((resolve) => {
    resolve(rtnArr);
  });
};
exports.formatExportData = async function formatExportData(data) {
  let rtnStr = "";
  const itemKeyArr = Object.keys(new PageData().info);
  // ヘッダ
  rtnStr += "URL" + "\t";
  itemKeyArr.forEach((key) => {
    rtnStr += key + "\t";
  });
  rtnStr += "\n";

  // 実データ
  data.forEach((v, k) => {
    rtnStr += k + "\t";
    itemKeyArr.forEach((itemkey) => {
      rtnStr += v[itemkey] + "\t";
    });
    rtnStr += "\n";
  });
  Object.keys(data).forEach(function (dataKey) {
    let d = data[dataKey];
    rtnStr += dataKey + "\t";
    itemKeyArr.forEach((itemkey) => {
      rtnStr += d[itemkey] + "\t";
    });
    rtnStr += "\n";
  });
  return new Promise(function (resolve) {
    resolve(rtnStr);
  });
};
exports.textExport = async function textExport(data) {
  let filename = "./result/" + getCurrentTime() + ".txt";
  try {
    await fs.writeFile(filename, data);
  } catch (err) {
    console.log(err.toString());
  }
  return new Promise(function (resolve) {
    resolve(filename);
  });
};
function getCurrentTime() {
  var now = new Date();
  var res =
    "" +
    now.getFullYear() +
    padZero(now.getMonth() + 1) +
    padZero(now.getDate()) +
    padZero(now.getHours()) +
    padZero(now.getMinutes()) +
    padZero(now.getSeconds());
  return res;
}
function padZero(num) {
  return (num < 10 ? "0" : "") + num;
}
