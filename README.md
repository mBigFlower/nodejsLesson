# nodejsLesson

如果你是90后，那明明就是你嫂子；如果你是90前，那明明就是你老了-。-

# 说点啥
空下来了，就学点知识

课程地址：https://github.com/alsotang/node-lessons 
这个地方是我自己的作业，因为课程里挑战部分没有答案。。。

因为是初学者，代码我写的都觉得丑，怎么还是觉得java好看呢？额。。。

node_modules被我ignore了哈，大家自行install

# 注意事项

### lesson6 代码覆盖率工具
教程中用到了两个：mocha和istanbul 朋友说mocha叫作抹茶，我理解的istanbul叫作伊斯坦布尔

言归正传（我用的是windows）

教程中说：

	安装一个 istanbul : $ npm i istanbul -g
	
	执行 $ istanbul cover _mocha

然而我并没有成功，后来[百度了下](http://blog.csdn.net/csr0312/article/details/47044259)，是这样的：

	cnpm install –save istanbul（cnpm是淘宝的一个npm的镜像，速度较之更快）
	istanbul cover main.js
	和
	istanbul cover _mocha

然而虽然进步了一点，但是还是有问题。有点暴躁，继续看链接，后面说了个跟lesson教程中类似的话，版本匹配问题，而且说mocha最好表弄成-g的？不懂。。。 然后百度到的方法里说用下面的代码（然并卵）

	istanbul cover –hook-run-in-content node_modules/mocha/bin/_mocha 

执行的错误结果如下：

	Unable to resolve file [–hook-run-in-content]

然后我手动改成了：	

	istanbul cover node_modules/mocha/bin/_mocha 

成了！

等懂得了他们的好处，回过头来再仔细研究