// 命名空间
void function (){
    var namespace = window.namespace = function (name){
        if (!name) return window;
        name = name + "";

        var names = name.split(".");
        var space = window;

        for (var i=0,len=names.length; i<len; i++){
            var n = names[i];
            space = space[n] || (space[n] = {});
        }

        return space;
    };
}();
// 加载器
void function (){
    var Alice = namespace("Alice");
    var doc = document;
    var objectPool = {};
    var aliasPool = {};

    var log = Alice.log = function (){
        window.console && console.log && console.log(Array.prototype.join.call(arguments, ""));
    };

    var Deferred = function (){
        var event = {};
        var status = "pending";

        var sub = function (s, cb){
            if (s == status) {
                cb();
                return;
            }

            if (event[s] == null)  event[s] = [];
            event[s].push(cb);
        };

        var pub = function (s, data){
            status = s;
            
            var events = event[s];
            if (events == null) return;
            
            var cb;
            while (cb = events.shift()){
                cb.call(null, data);
            }
        };

        var subpub = function (s, p){
            (typeof p == "function") ? sub(s, p) : pub(s, p);
        };

        var done = function (p){
            subpub("done", p);
            return this;
        };

        var fail = function (p){
            subpub("fail", p);
            return this;
        };

        var state = function (){
            return status;
        };

        return {
            state : state
            ,done : done
            ,fail : fail
        };
    };

    var when = function (){
        var retDefer = Deferred();

        var defers = [].slice.call(arguments); 
        var len = defers.length;

        var result = [];
        var dones = 0;
        var fails = 0;

        var check = function (){
            if (fails + dones < len) return;
            if (fails > 0) {
                retDefer.fail(result);
                return;
            }
            retDefer.done(result);
        };

        for (var i=0, defer; i<len; i++){
            void function (j){
                defer = defers[j];
                defer.done(function (data){
                    result[j] = ["done", data];
                    check(dones++);
                }).fail(function(data){
                    result[j] = ["fail", data];
                    check(fails++);
                });
            }(i);
        }

        return retDefer;
    };

    var createScript = function (js){
        var script = doc.createElement("script");
        script.setAttribute('type', "text/javascript");
        script.setAttribute('src', js); 
        script.setAttribute('async', true); 

        doc.getElementsByTagName("head")[0].appendChild(script);
        return script;
    };

    var regist = function (loadFn, file){ 
        var cache = loadFn.loadCache = (loadFn.loadCache || {});
        if (file in cache) return {"defer" : cache[file], "isCache" : true};

        var defer = Deferred();
        cache[file] = defer;

        return {"defer" : cache[file], "isCache" : false};
    };

    var loadJs = function (js){
        js = getAbsolutePath(js);
        var msg = regist(loadJs, js);
        if (msg.isCache) return msg.defer;

        createScript(js);
        return msg.defer;
    };

    Alice.add = function (file, object, alias){
        file = file.toString();
        object = object || {};
        alias = (alias || file.split("/").reverse()[0]).toString();

        var absFile = getAbsolutePath(file);
        var defer = loadJs.loadCache[absFile];
        if (defer) {
            objectPool[file] = aliasPool[alias] = object;
            defer.done();
        }
    };

    var loadNetJs = function (netJs){
        netJs = getAbsolutePath(netJs);
        var msg = regist(loadNetJs, netJs);
        if (msg.isCache) return msg.defer;
        
        var script = createScript(netJs);
        script.onload = script.onreadystatechange = function (){
            if (!this.readystate || this.readystate == "loaded" || this.readystate == "complete"){
                msg.defer.done();
            }
        }; 

        return msg.defer;
    };
    
    var loadCmbJs = function (cmbJs){
        if ( (typeof aliceCmbConf == "undefined") || (!(cmbJs in aliceCmbConf)) ){
            log("合并文件配置缺失！");
            return;
        }

        var files = aliceCmbConf[cmbJs];
        cmbJs = getAbsolutePath("cmb/"+cmbJs);
        
        var msg = regist(loadCmbJs, cmbJs);
        if (msg.isCache) return msg.defer;

        createScript(cmbJs);
        var fileDefers = [];

        for (var i=0, len=files.length; i<len; i++){
            var absFile = getAbsolutePath(files[i]);
            fileDefers.push(regist(loadJs, absFile).defer);
        }

        return fileDefers;
    };

    var loadCss = function (css){
        css = getAbsolutePath(css);
        var msg = regist(loadCss, css);
        if (msg.isCache) return msg.defer;

        var link = doc.createElement("link");
        link.setAttribute('type', "text/css");
        link.setAttribute('href', css);
        link.setAttribute('rel', 'stylesheet');

        var image = doc.createElement("img");
        image.onerror = function (){
            image.onerror = null;
            doc.getElementsByTagName("head")[0].appendChild(link);
            msg.defer.done();
        };
        image.src = css;

        return msg.defer;
    };

    var load = function (file){
        var loadFn = Function.prototype;

        if (/\.net\.js/.test(file)){
            loadFn = loadNetJs;
        }
        else if (/\.js/.test(file)){
            loadFn = loadJs;

            var plug = file.slice(-4);
            if (plug.charAt(0) == "#"){
                plug = plug.slice(-3);

                if (plug == "net") loadFn = loadNetJs;
                else if (plug == "cmb") loadFn = loadCmbJs;
                file = file.slice(0, -4);
            }
        }
        else if (/\.css/.test(file)){
            loadFn = loadCss;
        }

        return loadFn(file);
    };

    var require = function (file){
        var object = aliasPool[file] || objectPool[file];
        if (!object) throw("Can't require " + file + "!");

        return object;
    };

    Alice.use = function (files, cb){
        if (typeof files == "function"){
            files();
            return false;
        }

        files = [].concat(files);
        cb = cb || Function.prototype;

        var fileDefers = [];

        for (var i=0, len=files.length, path, absPath, defer; i<len; i++){
            path = files[i];
            defer = load(path);
            if (defer) fileDefers = fileDefers.concat(defer);
        }
        
        when.apply(this, fileDefers).done(function (data){
            cb(require);
        });
    };

    var rootPath = "";
    var getAbsolutePath = function (path){
        if (typeof aliceVerConf == "undefined"){
            return rootPath + "/src/" + path;
        }
        else {
            var version = aliceVerConf[path];
            var pathTemp = path.split(".");
            return rootPath + "/bin/" + pathTemp[0] + "_" + version + "." + pathTemp[1];
        }
    };
    Alice.setRootPath = function (path){
        rootPath = path;
    };
}();