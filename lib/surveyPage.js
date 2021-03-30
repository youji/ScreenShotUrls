const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const PageData = require("./dao/pageData.js");
const getPageDataEval = require("./getPageDataEval.js");
const yaml = require("./io/yaml.js");
const textIo = require("./io/text.js");
const conf = yaml.load("conf.yaml");
const TimeId = require("./tool/timeId.js");

const exportHtmlDir = "./result/htmlcode/" + TimeId.getTimeId() + "/";
fs.mkdir(exportHtmlDir, { recursive: true }, (err) => {
  if (err) throw err;
});
const screenShotDir = "./result/screenshot/" + TimeId.getTimeId() + "/";
fs.mkdir(screenShotDir, { recursive: true }, (err) => {
  if (err) throw err;
});

exports.survey = async function survey(browser, targetUrl) {
  let pageData = {};
  try {
    if (isLoadBlockUrl(targetUrl)) {
      console.log("skip:" + targetUrl);
      pageData = new PageData();
      pageData.info.status = "skip";
    } else {
      console.log("open:" + targetUrl);
      let page = await browser.newPage();
      page = await settingBasicAuthenticate(page);
      page = await initLoadBlockFile(page);
      let res = await page.goto(targetUrl, {
        waitUntil: "networkidle0",
        timeout: 0,
      });
      await textIo.exportHtmlData(
        await res.text(),
        exportHtmlDir + getUniuePageId(targetUrl) + ".html"
      );
      pageData = await getPageDataEval.get(page);
      pageData = await getScreenShot(page, pageData, targetUrl);
      pageData.info.status = "success";
      await page.close();
    }
  } catch (e) {
    console.log("error:" + targetUrl);
    console.log(e);
    pageData = new PageData();
    pageData.info.status = "error";
  }

  return new Promise(function (resolve) {
    resolve(pageData);
  });
};
async function getScreenShot(page, pageData, targetUrl) {
  let rtnPageData = pageData;
  let fileid = getUniuePageId(targetUrl);
  let devices = Object.keys(conf.devices);
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    const savePath = screenShotDir + device + "_" + fileid + ".png";
    // console.log(device, savePath);
    await page.setUserAgent(conf.devices[device].userAgent);
    await page.setViewport(conf.devices[device].viewport);
    await page.reload({ waitUntil: ["networkidle0"] });
    await page.screenshot({
      path: savePath,
      fullPage: true,
    });
    rtnPageData.info["screenshot_" + device] = savePath;
  }
  return new Promise(function (resolve) {
    resolve(rtnPageData);
  });
}
function getUniuePageId(url) {
  return url.replace(/\//g, "_");
}
function isLoadBlockUrl(targetUrl) {
  let blockFlag = false;
  const url = new URL(targetUrl);
  let ext = path.extname(url.pathname).replace(".", "");

  conf.loadBlockFileExtention.some((blockExt) => {
    if (ext == blockExt) {
      blockFlag = true;
      return true; //break
    }
  });
  return blockFlag;
}
async function initLoadBlockFile(page) {
  await page.setRequestInterception(true);
  page.on("request", (interceptedRequest) => {
    let loadFlag = true;
    conf.loadBlockFileExtention.some((ext) => {
      if (interceptedRequest.url().endsWith(ext)) {
        loadFlag = false;
        return true; //break
      }
    });
    if (loadFlag) interceptedRequest.continue();
    else interceptedRequest.abort();
  });
  return new Promise(function (resolve) {
    resolve(page);
  });
}

async function settingBasicAuthenticate(page) {
  if (
    conf.hasOwnProperty("basicAuthentication") &&
    conf.basicAuthentication.hasOwnProperty("username") &&
    conf.basicAuthentication.hasOwnProperty("password")
  ) {
    await page.authenticate(conf.basicAuthentication);
  }
  return new Promise(function (resolve) {
    resolve(page);
  });
}
