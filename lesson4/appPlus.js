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
	      // idx是index，类似for循环中的i
	      // 不需要太多的数据，这里只要15组，40跟5其实一样的
	      if(idx < 15)
	      	topicUrls.push(href);
	    });

	    // 获取模块~ 准备并发
	    var ep = new eventproxy();

	    // 所有遍历结束后调用
	    ep.after('topic_html', topicUrls.length, function (topics) {
	      topics = topics.map(function (topicPair) {
	        var topicUrl = topicPair[0];
	        var topicHtml = topicPair[1];
	        var $ = cheerio.load(topicHtml);

	        return ({
	          title: $('.topic_full_title').text().trim(),
	          href: topicUrl,
	          // bigflower大胆猜测，这个.eq(0)就是div下面的第一个class，尚未验证
	          comment1: $('.reply_content').eq(0).text().trim(),
	          author1: $('.reply_author').eq(0).text().trim(),
	          score1: $('.reply_author').eq(0).attr('href')
	        });
	      });

	      // 基础部分到这里，
	      // res.send(topics);
	      // 挑战部分执行下面的函数
	      getAuthor1Url(res, topics)
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

// 挑战部分
// oldData : 之前得到的数据
// 设置两个传递值，思路更清晰
function getAuthor1Url(lastRes, oldData){
	// 获取模块~ 准备并发
    var ep = new eventproxy();
	
    var dataLength = 0
    oldData.forEach(function(item){
		// 因为有可能为空，所有又要处理，，，， 真是烦
		if(item.comment1 != ''){
			dataLength++
		}
	})

	ep.after('price_html', dataLength, function (prices) {
      prices = prices.map(function (price) {
        var topicHtml = price[0];
        var $ = cheerio.load(topicHtml);
        return ({
        	title: price[1],
	        href: price[2],
	        comment1: price[3],
	        author1: price[4],
	        score1: $('.floor').text().trim()
        })
      });
      console.log(prices)
      lastRes.send(prices)
    });


 	oldData.forEach(function(item){
 		if(item.comment1 != '')
	 		superagent.get(url.resolve(cnodeUrl, item.score1))
	          .end(function (err, res) {
	            ep.emit('price_html', [res.text, item.title, item.href, item.comment1, item.author1 ]);
	        });
 	})

}

app.listen(3000, function (req, res, next) {
  console.log('app is running at port 3000');
});

// 按照作者 alsotang 的代码，返回的数据总是有问题，很多为空
// 后来发现有些返回的html并不是网页数据，而是503，初步推测：是cnode的网站为了防刷做了处理吧
// 所以上面的代码里做了很多判断，我也不知道简单的方法应该怎么弄。。。 初学者嘛，加油！
