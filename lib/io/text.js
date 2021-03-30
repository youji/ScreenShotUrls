const fs = require("fs").promises;
const PageData = require("../dao/pageData.js");
const TimeId = require("../tool/timeId.js");

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
exports.formatResultData = async function formatResultData(data) {
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
exports.exportResultData = async function exportResultData(data) {
  let dir = "./result/";
  let filename = dir + TimeId.getTimeId() + ".txt";
  try {
    await fs.writeFile(filename, data);
  } catch (err) {
    console.log(err.toString());
  }
  return new Promise(function (resolve) {
    resolve(filename);
  });
};
exports.exportHtmlData = async function exportHtmlData(data, path) {
  try {
    await fs.writeFile(path, data);
  } catch (err) {
    console.log(err.toString());
  }
  return new Promise(function (resolve) {
    resolve(path);
  });
};
