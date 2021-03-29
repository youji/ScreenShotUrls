const puppeteer = require("puppeteer");
const path = require("path");
const PageData = require("./dao/pageData.js");
const getPageDataEval = require("./getPageDataEval.js");
const yaml = require("./io/yaml.js");
const conf = yaml.load("conf.yaml");
const device = puppeteer.devices[conf.emulateDevice];

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
      await page.emulate(device);
      await page.goto(targetUrl, {
        waitUntil: "networkidle0",
        timeout: 0,
      });
      pageData = await getPageDataEval.get(page);
      pageData.info.status = "success";
      await page.close();
    }
  } catch (e) {
    console.log("error:" + targetUrl);
    pageData = new PageData();
    pageData.info.status = "error";
  }

  return new Promise(function (resolve) {
    resolve(pageData);
  });
};
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
