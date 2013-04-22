#!/usr/local/bin/python2.6
#-*-coding:utf8-*-
#read:compile src files to bin

import os
import json
from datetime import datetime
from hashlib import md5

def compile():
    verConf = {}
    varConfPath = None
    varConfJS = {}
    varConfJSPath = None

    toolPath = os.getcwd()
    rootPath = os.path.split(toolPath)[0]

    # 目录确认
    srcPath = os.path.join(rootPath, "src")
    if not os.path.exists(srcPath):
        print "src目录不存在!"
        return
    
    binPath = os.path.join(rootPath, "bin")
    if not os.path.exists(binPath):
        os.mkdir(binPath)
    
    confPath = os.path.join(rootPath, "conf")
    if not os.path.exists(confPath):
        os.mkdir(confPath)
    
    # 读取上一次编译结果
    varConfPath = os.path.join(confPath, "verConf")
    varConfJSPath = os.path.join(confPath, "verConf.js")

    if os.path.isfile(varConfPath):
        f = open(varConfPath, "r")
        verConf = json.load(f)

    # 开始编译(js, css)
    compileTime = datetime.now().strftime("%Y%m%d%H%M%S")
    for root, dirs, files in os.walk(srcPath):
        for dir in dirs:
            dirPath = os.path.join(root, dir)
            binDirPath = rootPath+"/bin"+ dirPath[len(srcPath):]
            if not os.path.exists(binDirPath):
                os.mkdir(binDirPath)
            
        for file in files:
            if file[0] == "." : continue
            extension = os.path.splitext(file)[1]
            if extension not in [".js", ".css"] : continue
            
            filePath = os.path.join(root, file)
            fileContent = open(filePath).read()
            m = md5()
            m.update(fileContent)
            md5Str = m.hexdigest()

            if (filePath not in verConf) or (verConf[filePath]["md5"] != md5Str):
                verConf[filePath] = {"md5":md5Str, "ver":compileTime}
                binFilePath = rootPath+"/bin"+ filePath[len(srcPath):]
                binFilePathTemp = os.path.splitext(binFilePath)
                binFilePath = binFilePathTemp[0] + "_" + compileTime + binFilePathTemp[1]
                with open(binFilePath, "w") as f:
                    f.write(fileContent)
    
    # 保存编译结果
    with open(varConfPath, "w") as f:
        json.dump(verConf, f)
    
    # 保存对加载器的编译结果
    for filePath in verConf:
        jsPath = filePath[len(srcPath)+1:]
        varConfJS[jsPath] = verConf[filePath]["ver"]
    
    with open(varConfJSPath, "w") as f:
        f.write("var aliceVerConf = " + json.dumps(varConfJS) + ";")

if __name__ == "__main__":
    compile()