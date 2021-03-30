const PageData = require("./dao/pageData.js");
exports.get = async function get(page) {
  let pageData = new PageData();
  pageData.info.title = await getPageTitle(page);
  pageData.info.description = await getPageMeta(page, "description");
  pageData.info.keywords = await getPageMeta(page, "keywords");
  pageData.info.canonical = await getPageCanonical(page, "canonical");
  pageData.info.viewport = await getPageMeta(page, "viewport");
  pageData.info.charset = await getPageCharset(page);

  return new Promise(function (resolve) {
    resolve(pageData);
  });
};
// TODO 以下各データを取得する箇所で改行コードを削除する

async function getPageTitle(page) {
  let title = await page.evaluate(function () {
    let data = "";
    try {
      data = document.title.replace(/\r?\n/g, " ").replace(/\t/g, " ");
    } catch (e) {
      data = "";
    }
    return data;
  });
  return new Promise(function (resolve) {
    resolve(title);
  });
}
async function getPageCharset(page) {
  let charset = await page.evaluate(function () {
    let data = "";
    try {
      data = document.charset.replace(/\r?\n/g, " ").replace(/\t/g, " ");
    } catch (e) {
      data = "";
    }
    return data;
  });
  return new Promise(function (resolve) {
    resolve(charset);
  });
}
async function getPageMeta(page, name) {
  let metaData = await page.evaluate(function (name) {
    let data = "";
    try {
      data = document
        .querySelector('meta[name="' + name + '"]')
        .content.replace(/\r?\n/g, " ")
        .replace(/\t/g, " ");
    } catch (e) {
      data = "";
    }
    return data;
  }, name);
  return new Promise(function (resolve) {
    resolve(metaData);
  });
}
async function getPageCanonical(page) {
  let metaData = await page.evaluate(function () {
    let data = "";
    try {
      data = document
        .querySelector('link[rel="canonical"]')
        .href.replace(/\r?\n/g, " ")
        .replace(/\t/g, " ");
    } catch (e) {
      data = "";
    }
    return data;
  });
  return new Promise(function (resolve) {
    resolve(metaData);
  });
}
