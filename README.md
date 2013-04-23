<h1>爱丽丝前端加载方案。</h1>

<h2>一：Api设计</h2>
<div>
<pre><code>
// file2.js
Alice.use(["file.js"], function (require){
    var fileMod = require("file.js");
    var sayHello = function (){
        fileMod.sayHello();
        console.log("file2 say hello");
    };
    Alice.add("file2.js", {"sayHello":sayHello});
});
</code></pre>
    <h3>Alice.use:</h3>
    <p>Alice.use用于导入需要的文件，有三种重载，Alice.use("file.js", cb)、Alice.use(["file.js", "file1.js"], cb)、Alice.use(cb)。
    如在use的回调函数中有一个参数require，用来引用一个Alice模块导出的对象。</p>

    <h3>Alice.add:</h3>
    <p>有三种重载，Alice.add("file.js")、Alice.add("file.js", {"fn":fn})、Alice.add("file.js", {"fn":fn}, "file")。
    Alice.add和Alice.use配对，use从系统申请，add向系统通知。add有两个参数，第一个是当前文件的id，一般为文件路径，第二个是向外开放的接口集合。use的时候使用的useid和此id对应，
    require的参数也为此id，由于文件路径一般较长，所以增加了别名参数。第三个参数就是别名参数，如果指定了，在require的时候就可以用。另外如果没指定，系统会主动把第二个参数取最短
    的文件名当做别名，比如/script/main.js取main.js当做别名。</p>
</div>

<h2>二：目录结构和编译</h2>
sta<br/>
    src(源文件:必须)<br/>
        cmbConf(合并文件配置:可选配置)<br/>
        cmb(合并文件目录:此目录可由编译工具生成)<br/>
        script<br/>
        css<br/>
        
    tools(编译工具:必须)<br/>
        combine.py(合并文件)<br/>
        complie.py(编译出带版本号的文件)<br/>
        
    bin(编译后文件:由编译工具生成)<br/>
    
    conf(编译结果目录:由编译工具生成)<br/>
        verConf(缓存上次的编译结果)<br/>
        verConf_time.js(文件版本号信息)<br/>
        cmbConf_time.js(文件合并信息)<br/>

<p>其中src目录和tools目录是必须的，由开发人员创建。编译时候先执行combine.py把src/cmbConf配置中需要合并的文件合并到src/cmb目录中，然后complie.py会把src中所有的js,css文件
编译到bin目录的相同位置。编译工具使用python2.6以上版本，但不要使用python3。</p>

<h2>三：文件压缩</h2>
<p>压缩功能本身和Alice编译系统没有必要的联系，大家可以自选压缩工具，比如uglify，将bin目录中的所有文件压缩即可。</p>

<h2>四：使用步骤：</h2>
<p>比如现在你所有的静态文件都在sta文件夹目录下，首先在文件头手动引入三个文件，sta/conf/verConf_time.js、sta/conf/cmbConf_time.js、sta/bin/script/alice_time.js。然后
用Alice.setRootPath("zhangdongdong02.fe.baidu.com/voicedebug/sta")设置sta的绝对路径，那么Alice.use("script/main.js")就可以正确找到bin目录下相应的main_time.js。</p>


