const puppeteer = require("puppeteer");
const surveyPage = require("./lib/surveyPage.js");
const yamlIo = require("./lib/io/yaml.js");
const textIo = require("./lib/io/text.js");
const xlsxIo = require("./lib/io/xlsx.js");
const conf = yamlIo.load("conf.yaml");

// puppeteer
let browser = null;

//
let notYetUrls = new Set(conf.startUrl);
let processingUrls = new Set();
let doneData = new Map();

main();

async function main() {
  console.time("time");
  // const urlList = await textIo.readListData("./list.txt");
  // console.log(getInputFilePath());
  const urlList = await xlsxIo.getXlsxUrlColumnArr(getInputFilePath());
  // console.log(urlLis2);

  console.log("start : " + urlList.length + " pages");

  browser = await puppeteer.launch(conf.browser);

  for (let i = 0; i < urlList.length; i++) {
    let targetUrl = urlList[i];
    let pageData = await surveyPage.survey(browser, targetUrl);

    doneData.set(targetUrl, pageData.info);
    console.log("nokori:" + (urlList.length - i - 1));
  }
  await closeBrowser();
  // await exportTextResult();
  await exportXlsxResult();

  console.timeEnd("time");
  return;
}
async function closeBrowser() {
  await browser.close();
  console.log("-----CRAWL END!-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
async function exportTextResult() {
  const formatedData = await textIo.formatResultData(doneData);
  const filename = await textIo.exportResultData(formatedData);
  console.log("-----RESULT EXPORTED!(" + filename + ")-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
async function exportXlsxResult() {
  const formatedData = await xlsxIo.formatExportData(doneData);
  const filename = await xlsxIo.xlsxExport(formatedData);
  console.log("-----RESULT EXPORTED!(" + filename + ")-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
async function formAuthenticationLogin(browser) {
  // let url = "https://qiita.com/login";
  // let page = await browser.newPage();
  // await page.goto(url);
  // await page.type("input[name=identity]", "aaaaa");
  // await page.type("input[name=password]", "bbbbb");
  // await Promise.all([
  //   page.waitForNavigation({ waitUntil: "networkidle0" }),
  //   page.click("input[name=commit"),
  // ]);
  // await page.close();

  /*
  // ??????????????????????????????????????????????????????headlessmode???false????????????????????????
  let url = "https://qiita.com/login";
  let page = await browser.newPage();
  await page.goto(url);
  await page.waitForTimeout(15000);
  await page.close();
  */

  return new Promise(function (resolve) {
    resolve();
  });
}

function getInputFilePath() {
  let rtnPath = "";
  const inputBaseDir = "./input/";
  if (process.argv.length >= 3) {
    rtnPath = inputBaseDir + process.argv[2];
  } else {
    rtnPath = inputBaseDir + "urllist.xlsx";
  }
  return rtnPath;
}
