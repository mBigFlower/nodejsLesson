////////////////////////////////////////////////
// 这节课感觉内容很少，也没有挑战内容，那就花时间把async明白
// https://github.com/caolan/async
// API:
//    mapLimit(arr, limit, iterator, [callback])
//     arr - An array to iterate over.
//     limit - 
//     iterator(item, callback) - A function to apply to each item in arr. The iterator is passed a 
//                                 callback(err, transformed) which must be called once it has completed
//                                 with an error (which can be null) and a transformed item.
//     callback(err, results) - Optional A callback which is called when all iterator functions have finished,
//                              or an error occurs. Results is an array of the transformed items from the arr.
// 流程如下：
// arr：既然要并发，那就要有一堆Url
// limit：既然要控制并发，就有个限制
// iterator(item, callback): item是arr中的一个值，
// callback(err, results): 最终处理结束后，的结果
//
// 总结：挨个处理arr中的链接，在iterator执行，在callback返回最终结果
////////////////////////////////////////////////
var async = require('async');

var concurrencyCount = 0;
var fetchUrl = function (url, callback) {
  // 随机的延时，模拟耗时
  var delay = parseInt((Math.random() * 10000000) % 2000, 10);
  concurrencyCount++;
  console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');

  // html content 是啥？看log就知道了，只是一个String
  // 其实用callback的方式就把我们的结果返回了，最终返回到result
  // setTimeout 字面理解嘛，就是个延时，delay时间后，执行function里的内容
  setTimeout(function () {
    concurrencyCount--;
    callback(null, url + ' html content');
  }, delay);
};

var urls = [];
for(var i = 0; i < 30; i++) {
  urls.push('http://datasource_' + i);
}

// 把rul数组放进来
async.mapLimit(urls, 5, function (url, callback) {
  fetchUrl(url, callback);
}, function (err, result) {
  console.log('final:');
  console.log(result);
});
