const yaml = require("../io/yaml.js");
const conf = yaml.load("conf.yaml");
module.exports = class PageData {
  constructor(name) {
    this.info = {
      status: "",
      title: "",
      description: "",
      keywords: "",
      canonical: "",
      viewport: "",
      charset: "",
      console_error: "",
    };
    if (conf.saveScreenshot) {
      for (const [k, v] of Object.entries(conf.devices)) {
        this.info["screenshot_" + k] = "";
      }
    }
    // this.hrefs = new Set();
  }
};
