const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const path = require("path");
const PageData = require("./dao/pageData.js");
const getPageDataEval = require("./getPageDataEval.js");
const yaml = require("./io/yaml.js");
const textIo = require("./io/text.js");
const conf = yaml.load("conf.yaml");
const TimeId = require("./tool/timeId.js");

const htmlDir = "./result/" + TimeId.getTimeId() + "/htmlcode/";
(async () => {
  if (conf.saveHtml) await fs.mkdir(htmlDir, { recursive: true });
})();

const assetDir = "./result/" + TimeId.getTimeId() + "/asset/";
(async () => {
  if (conf.saveAsset) await fs.mkdir(assetDir, { recursive: true });
})();

const screenShotDir = "./result/" + TimeId.getTimeId() + "/screenshot/";
(async () => {
  if (conf.saveScreenshot) await fs.mkdir(screenShotDir, { recursive: true });
})();

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
      if (conf.saveAsset) {
        page = await setSaveAssetFile(page);
      }
      let console_error = "";
      page.on("pageerror", (error) => {
        console_error += error.message + "\n";
      });
      let res = await page.goto(targetUrl, {
        waitUntil: "networkidle0",
        timeout: 0,
      });
      await scrollSurfaceToBottom(page);
      if (conf.saveHtml) {
        await textIo.exportHtmlData(
          await res.text(),
          htmlDir + getUniquePageId(targetUrl) + ".txt"
        );
      }
      pageData = await getPageDataEval.get(page);
      if (conf.saveScreenshot) {
        pageData = await getScreenShot(browser, pageData, targetUrl);
      }
      pageData.info.status = res._status;
      pageData.info.console_error = console_error;

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
async function setSaveAssetFile(page) {
  page.on("response", async (res) => {
    if (res.status() != 200) return;
    try {
      const buffer = await res.buffer();
      const url = new URL(res.url());
      const dir = assetDir + url.host + url.pathname.match(/.*\//g)[0];
      let pathname = assetDir + url.host + url.pathname;
      const contentType = res.headers()["content-type"];

      await fs.mkdir(dir, { recursive: true });
      if (
        typeof contentType === "string" &&
        contentType.indexOf("text/html") != -1 &&
        pathname.endsWith("/")
      ) {
        pathname += "index.html";
      }
      if (!(await fileExists(pathname)) && !pathname.endsWith("/")) {
        await fs.writeFile(pathname, buffer);
      }
    } catch (e) {
      console.log("asset download error:" + res.url());
    }
  });
  return new Promise(function (resolve) {
    resolve(page);
  });
}
async function getScreenShot(browser, pageData, targetUrl) {
  let page = await browser.newPage();
  let res = await page.goto(targetUrl, {
    waitUntil: "networkidle0",
    timeout: 0,
  });
  let rtnPageData = pageData;
  let fileId = getUniquePageId(targetUrl);
  let devices = Object.keys(conf.devices);
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];
    const savePath = screenShotDir + device + "_" + fileId + ".png";
    // console.log("screenshot:" + savePath);
    await page.setUserAgent(conf.devices[device].userAgent);
    await page.setViewport(conf.devices[device].viewport);
    await page.reload({ waitUntil: ["networkidle0"] });
    await scrollSurfaceToBottom(page);
    await page.screenshot({
      path: savePath,
      fullPage: true,
    });
    rtnPageData.info["screenshot_" + device] = savePath;
  }
  await page.close();
  return new Promise(function (resolve) {
    resolve(rtnPageData);
  });
}
async function scrollSurfaceToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          window.scrollTo(0, 0);
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
  return new Promise(function (resolve) {
    resolve(page);
  });
}
function getUniquePageId(url) {
  return url.replace(/\//g, "_");
}
function isLoadBlockUrl(targetUrl) {
  let blockFlag = false;
  const url = new URL(targetUrl);
  let ext = path.extname(url.pathname).replace(".", "");

  conf.loadBlockFileExtension.some((blockExt) => {
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
    conf.loadBlockFileExtension.some((ext) => {
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
async function fileExists(filepath) {
  try {
    return !!(await fs.lstat(filepath));
  } catch (e) {
    return false;
  }
}
