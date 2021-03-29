const puppeteer = require("puppeteer");
const surveyPage = require("./lib/surveyPage");
const yamlIo = require("./lib/io/yaml");
const textIo = require("./lib/io/text");
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
  const readList = await textIo.readListData("./list.txt");
  console.log("start screenshot : " + readList.length + " pages");
  // console.log(str);

  browser = await puppeteer.launch(conf.browser);

  readList.forEach((url) => {
    // let pageData = await surveyPage.survey(browser, url);
  });
  await closeBrowser();
  // await exportResult();

  console.timeEnd("screenshot time");
  return;

  browser = await puppeteer.launch(conf.browser);
  await formAuthenticationLogin(browser);
  //
  while (notYetUrls.size > 0) {
    let targetUrl = getNotYetUrl1(notYetUrls);

    notYetUrls.delete(targetUrl);
    processingUrls.add(targetUrl);
    let pageData = await surveyPage.survey(browser, targetUrl);
    notYetUrls = mergeUrlList(notYetUrls, pageData.hrefs);
    processingUrls.delete(targetUrl);

    doneData.set(targetUrl, pageData.info);
    console.log("nokori:" + notYetUrls.size);
  }
  await closeBrowser();
  await exportResult();

  console.timeEnd("screenshot time");
}
async function closeBrowser() {
  await browser.close();
  console.log("-----CRAWL END!-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
async function exportResult() {
  const formatedData = await textIo.formatExportData(doneData);
  const filename = await textIo.textExport(formatedData);
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
function createPageObjects() {
  let pages = [];
  return pages;
}
function getNextPageObject() {}
function getNotYetUrl1(set) {
  for (var value of set) return value;
}
function mergeUrlList(baseSet, addSet) {
  let set = baseSet;
  for (var url of addSet) {
    try {
      const domain = new URL(url).hostname;
      if (conf.allowDomain.indexOf(domain) !== -1 && !doneData.has(url)) {
        set.add(url);
      }
    } catch (e) {
      // new URLが失敗することがある（空文字が入ってくる？）
      console.log("ERROR:" + url);
    }
  }
  return set;
}
