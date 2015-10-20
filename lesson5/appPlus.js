// 复制粘贴害死人！

var express = require('express');
var async = require('async');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';
// 建立 express 实例
var app = express();

app.get('/', function (req, res, next) {
  // 获得首页的40个文章的地址
  superagent.get(cnodeUrl)
      .end(function (err, sres) {
        if (err) {
          return console.error(err);
        }
        var topicUrls = [];
        var $ = cheerio.load(sres.text);
        $('#topic_list .topic_title').each(function (idx, element) {
          var $element = $(element);
          var href = url.resolve(cnodeUrl, $element.attr('href'));
          topicUrls.push(href);
        });
        // console.log(topicUrls)
        asyncTest(res, topicUrls)
      });
});
app.listen(3000, function (req, res, next) {
  console.log('app is running at port 3000');
});

// 获得到urls后，处理并发
var asyncTest = function (res, urls){
  async.mapLimit(urls, 5, function (url, callback) {
    fetchUrl(url, callback);
  }, function (err, result) {
    console.log('final:');
    console.log(result);
    res.send(result)
  });
}

var fetchUrl = function (url, callback) {
  superagent.get(url)
    .end(function (err, sres) {
      if (err) {
        return console.error(err);
      }
      var $ = cheerio.load(sres.text);

      var callbackData = []
      callbackData.push({
          title: $('.topic_full_title').text().trim(),
          href: url,
          // bigflower大胆猜测，这个.eq(0)就是div下面的第一个class，尚未验证
          comment1: $('.reply_content').eq(0).text().trim()
      })
      // console.log(callbackData)
      callback(null, callbackData[0]);
    });

};
// 这个获得标题的时候，置顶\n\n\n\n    CNode客户端专题
// 虽说很烦，不过不管了！不太会爬网站
// <span class="topic_full_title">
//   <span class='put_top'>置顶</span>
//    CNode客户端专题
// </span>

