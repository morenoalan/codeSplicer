"use strict";

var filesList = [];
var relativePath;
var files;
var originalFile;
var generalFile;

document.getElementById("filepicker").addEventListener("change", async function(event){
    let output = document.getElementById("listing");
    files = event.target.files;
    for (let i=0; i<files.length; i++) {
        let item = document.createElement("li");
        item.innerHTML = files[i].webkitRelativePath;
        filesList.push(files[i].webkitRelativePath);
        output.appendChild(item);
    };
    relativePath = files[0].webkitRelativePath.slice(0, (files[0].webkitRelativePath.length - files[0].name.length));
    await htmlFinder();
    await cssFinder();
    await console.log(generalFile);
    await jsFinder();
    if(document.getElementById("blogspotCheckbox").checked){
        await bsAdapter();
    }
    await loadFile(originalFile, generalFile);
}, false);

async function loadFile(originalFile, generalFile){
    let parser = new DOMParser();
    let text = await originalFile.text();
    let xmlDoc = parser.parseFromString(text,"text/html");
    //Finding comments and publishing all
    document.getElementById('outputField').textContent += "<!DOCTYPE html>" + '\r\n';
    console.log(xmlDoc.documentElement.ownerDocument.childNodes.length);
    for(let i=0; i < xmlDoc.documentElement.ownerDocument.childNodes.length; i++){
        if(xmlDoc.documentElement.ownerDocument.childNodes[i].nodeType===10){
            console.log("null tag");
        }else if(xmlDoc.documentElement.ownerDocument.childNodes[i].outerHTML!=xmlDoc.documentElement.outerHTML){
            document.getElementById('outputField').textContent += await "<!--" + xmlDoc.documentElement.ownerDocument.childNodes[i].textContent + "-->" + '\r\n';
            console.log(xmlDoc.documentElement.ownerDocument.childNodes[i].nodeType);
        }
        else{
            document.getElementById('outputField').textContent += await generalFile + '\r\n';
        }
    }
}

function fileFinder(file){
    let fileToFind = file;
    for (let i = 0; i < filesList.length; i++) {
        let fileLeftHand = files[i].name.toLowerCase();
        let fileRightHand = fileToFind.toLowerCase();
        if (fileLeftHand==fileRightHand){
            originalFile = files[i];
            return;
        }else if (i==filesList.length){
            console.log(fileToFind + " not found.");
        }
    }
}

async function htmlFinder(){
    let htmlFile = "index.html";
    fileFinder(htmlFile);
    generalFile = await originalFile;
}

async function cssFinder(){
    let parser = new DOMParser();
    let text = await generalFile.text();
    let xmlDoc = parser.parseFromString(text,"text/html");
    console.log(xmlDoc);
    let tagsList = xmlDoc.getElementsByTagName('link');
    for(let i = 0; i<tagsList.length; i++){
        if(tagsList[i].getAttribute('type')=='text/css'){
            let cssFileContent = await files[filesList.indexOf(relativePath + tagsList[i].getAttribute('href'))].text();
            let linkedText = '\<style\>' + cssFileContent + '\<\/style\>';
            xmlDoc.getElementsByTagName('link')[i].insertAdjacentHTML('beforebegin', linkedText);
            xmlDoc.getElementsByTagName('link')[i].remove();
            generalFile = xmlDoc;
        }
    }
}

async function jsFinder(){
    let xmlDoc = await generalFile;
    let tagsList = xmlDoc.getElementsByTagName('script');
    for(let i = 0; i<tagsList.length; i++){
        if(tagsList[i].getAttribute('type')=='text/javascript'){
            let jsFileContent = await files[filesList.indexOf(relativePath + tagsList[i].getAttribute('src'))].text();
            let linkedText = '\<script type="text/javascript" id="'+tagsList[i].getAttribute('id')+'"\>' + jsFileContent + '\<\/script\>';
            xmlDoc.getElementsByTagName('script')[i].insertAdjacentHTML('beforebegin', linkedText);
            xmlDoc.getElementsByTagName('script')[i+1].remove();
        }
    }
    generalFile = xmlDoc;
    console.log(generalFile);
}

async function bsAdapter(){
    //Next steps to code:
    //separate elements <link> about fonts joined with "&";
    
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'command', 'keygen', 'menuitem'];
    
    let xmlDoc = await generalFile;
    let strDoc = await generalFile.documentElement.ownerDocument.childNodes[1].outerHTML;

    for (let j = 0; j < selfClosingTags.length; j++){
        fixTagEnding(selfClosingTags[j]);
    }

    function htmlReparus(strTag, linkedText){
        let strDim = strTag.length;
        let cut = strDoc.indexOf(strTag);
        strDoc = strDoc.substr(0,cut) + linkedText + strDoc.substr(cut + strDim);
        //console.log(strDoc);
    }

    function fixTagEnding(goTag){
        let tagsList = xmlDoc.getElementsByTagName(goTag);
        
        for(let i = 0; i<tagsList.length; i++){
            let strTag = tagsList[i].outerHTML;
            let linkedText;
            if(~strTag.indexOf(" \/\>")){
                linkedText = strTag;
            }else if(~strTag.indexOf("\/\>")){
                let cut = strTag.indexOf("\/\>");
                linkedText = strTag.substr(0,cut)+" "+strTag.substr(cut);
            }else if(~strTag.indexOf("\>")){
                let cut = strTag.indexOf("\>");
                linkedText = strTag.substr(0,cut)+" \/"+strTag.substr(cut);
            }
            htmlReparus(strTag, linkedText);
            //console.log(xmlDoc.documentElement.ownerDocument.childNodes[1].outerHTML.indexOf(strTag));
            //xmlDoc.getElementsByTagName(goTag)[i].remove();
        }
    }

    function addFragmentByTag(tag, content){
        let tagsList = xmlDoc.getElementsByTagName(tag);
        console.log(tagsList);
        console.log(tagsList.length);

        let contentList = content;

        for(let i = 0; i < tagsList.length; i++){
            let strTag = tagsList[i];
            for(let j = 0; j < contentList.length; j++){
                let linkedText = strTag.insertAdjacentHTML(contentList[j][0], '\r\n'+contentList[j][1]+'\r\n');
                console.log(contentList[j][0]+", "+contentList[j][1]);
                htmlReparus(strTag, linkedText);
            }
            console.log(strTag);
        }
    }

    addFragmentByTag('script',[
        ['afterbegin','\/\/\<\!\[CDATA\['],
        ['beforeend','\/\/\]\]\>']
    ]);
    addFragmentByTag('head',[
        ['beforeend','\<b:skin\>\<\!\[CDATA\[\]\]\>\<\/b:skin\>']
    ]);
    addFragmentByTag('body',[
        ['afterbegin','\<b:section class="header-section" id="header-section" maxwidgets="1" showaddelement="no" \/\>']
    ]);

    generalFile = generalFile.documentElement.ownerDocument.childNodes[1].outerHTML;

    let allTags = await generalFile.getElementsByTagName('*');
    console.log(allTags);
    let allAttributes = [];
    
    function withoutValueAttribSearcher(){
        for (let i = 0; i < allAttributes.length; i++){
            if(!allAttributes[i].getAttribute(i)){
                console.log(allAttributes[i].getAttribute(i));
            }
        }
    }

    function attribAdapter(){
        for(let i = 0; i < allTags.length; i++){
            allAttributes = allTags[i].getAttributeNames();
            withoutValueAttribSearcher();
        }
    }
    attribAdapter();

    console.log(generalFile);
    console.log(generalFile.documentElement.ownerDocument.childNodes[1].outerHTML);
    generalFile = generalFile.documentElement.ownerDocument.childNodes[1].outerHTML;
    //console.log(generalFile);
    generalFile = generalFile.documentElement.ownerDocument.childNodes[1].outerHTML;
}