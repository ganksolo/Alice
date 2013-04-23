<h1>爱丽丝计划，完整的前端加载解决方案。</h1>

<h2>一：Api设计</h2>
<div>
    <h3>Alice.use:</h3>
    <p>Alice.use用于导入需要的文件，有三种重载，Alice.use("file.js", cb)、Alice.use(["file.js", "file1.js"], cb)、Alice.use(cb)。如下代码：</p>
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
    <p>在use的回调函数中有一个参数require，用来引用一个Alice模块导出的对象。</p>

    <h3>Alice.add:</h3>
    <p>有三种重载，Alice.add("file.js")、Alice.add("file.js", {"fn":fn})、Alice.add("file.js", {"fn":fn}, "file")。
    Alice.add和Alice.use配对，use从系统申请，add向系统通知。add有两个参数，第一个是当前文件的id，一般为文件路径，第二个是向外开放的接口集合。use的时候使用的useid和此id对应，
    require的参数也为此id，由于文件路径一般较长，所以增加了别名参数。第三个参数就是别名参数，如果指定了，在require的时候就可以用。另外如果没指定，系统会主动把第二个参数取最短
    的文件名当做别名，比如/script/main.js取main.js当做别名。</p>
</div>
