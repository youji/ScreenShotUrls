const puppeteer = require("puppeteer");
const surveyPage = require("./lib/surveyPage.js");
const yamlIo = require("./lib/io/yaml.js");
const textIo = require("./lib/io/text.js");
const conf = yamlIo.load("conf.yaml");

// puppeteer
let browser = null;

//
let notYetUrls = new Set(conf.startUrl);
let processingUrls = new Set();
let doneData = new Map();

main();

async function main() {
  console.time("screenshot time");
  const urlList = await textIo.readListData("./list.txt");
  console.log("start screenshot : " + urlList.length + " pages");

  browser = await puppeteer.launch(conf.browser);

  for (let i = 0; i < urlList.length; i++) {
    let targetUrl = urlList[i];
    let pageData = await surveyPage.survey(browser, targetUrl);
    doneData.set(targetUrl, pageData.info);
    console.log("nokori:" + (urlList.length - i - 1));
  }
  await closeBrowser();
  await exportResult();

  console.timeEnd("screenshot time");
  return;
}
async function closeBrowser() {
  await browser.close();
  console.log("-----CRAWL END!-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
async function exportResult() {
  const formatedData = await textIo.formatResultData(doneData);
  const filename = await textIo.exportResultData(formatedData);
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
  // 手動でログインする場合はこんな感じ（headlessmodeはfalseにしないとだめ）
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
