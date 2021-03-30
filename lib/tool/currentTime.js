exports.get = function get() {
  var now = new Date();
  var res =
    "" +
    now.getFullYear() +
    padZero(now.getMonth() + 1) +
    padZero(now.getDate()) +
    padZero(now.getHours()) +
    padZero(now.getMinutes()) +
    padZero(now.getSeconds()) +
    padZero(now.getMilliseconds());
  return res;
};
function padZero(num) {
  return (num < 10 ? "0" : "") + num;
}
