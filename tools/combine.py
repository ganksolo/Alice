#!/usr/local/bin/python2.6
#-*-coding:utf8-*-
#read:compile src files to bin

import os
import json
from datetime import datetime
from hashlib import md5

def combine():
    toolPath = os.getcwd()
    rootPath = os.path.split(toolPath)[0]
    
    srcPath = os.path.join(rootPath, "src")
    if not os.path.exists(srcPath):
        print "src目录不存在!"
        return
    
    confPath = os.path.join(rootPath, "conf")
    if not os.path.exists(confPath):
        os.mkdir(confPath)

    cmbPath = os.path.join(srcPath, "cmb")
    if not os.path.exists(cmbPath):
        os.mkdir(cmbPath)

    cmbConfPath = srcPath + "/cmbConf"
    cmbConf = {}

    if not os.path.isfile(cmbConfPath):
        print "缺少合并文件配置！"
        return
    
    cmbConfContent = ""
    with open(cmbConfPath) as f:
        cmbConfContent = f.read()
        cmbConf = json.loads(cmbConfContent)
    
    for cmb in cmbConf:
        files = cmbConf[cmb]
        fileContents = []
        cmbFilePath = os.path.join(cmbPath, cmb)

        for file in files:
            filePath = os.path.join(srcPath, file)
            with open(filePath) as f:
                fileContents.append(f.read())
        
        with open(cmbFilePath, "w") as f:
            f.write("\n".join(fileContents))

    with open(os.path.join(confPath, "cmbConf.js"), "w") as f:
        f.write("var aliceCmbConf = " + cmbConfContent + ";")

if __name__ == "__main__":
    combine()