// 引入依赖
var express = require('express');
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

// 建立 express 实例
var app = express();

app.get('/', function (req, res, next) {
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

	    // 获取模块~
	    var ep = new eventproxy();
	    // 所有遍历结束后调用
	    ep.after('topic_html', topicUrls.length, function (topics) {
	      topics = topics.map(function (topicPair) {
	        var topicUrl = topicPair[0];
	        var topicHtml = topicPair[1];
	        var $ = cheerio.load(topicHtml);
	        // 因为返回的数据有些为空，所以这里做了一下判断 有的topicHtml返回503
	        // if($('.topic_full_title').text().trim() === ''){
	        // 	console.log('儿子title为空');
	        // 	if(topicHtml){
	        // 		console.log('爸爸不为空2:'+topicHtml);
	        // 	}
	        // } 
	        return ({
	          title: $('.topic_full_title').text().trim(),
	          href: topicUrl,
	          // bigflower大胆猜测，这个.eq(0)就是div下面的第一个class，尚未验证
	          comment1: $('.reply_content').eq(0).text().trim()
	        });
	      });

	      // console.log('final:');
	      // console.log(topics);
	      res.send(topics);
	    });
	    // 真正遍历的函数，并且在服务器请求结束后，将结果emit
	    topicUrls.forEach(function (topicUrl) {
	      superagent.get(topicUrl)
	        .end(function (err, res) {
	          // console.log('fetch ' + topicUrl + ' successful');
	          ep.emit('topic_html', [topicUrl, res.text]);
	        });
	    });
	  });
});

app.listen(3000, function (req, res, next) {
  console.log('app is running at port 3000');
});

// 按照作者 alsotang 的代码，返回的数据总是有问题，很多为空
// 后来发现有些返回的html并不是网页数据，而是503，初步推测：是cnode的网站为了防刷做了处理吧
