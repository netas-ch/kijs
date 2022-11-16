window.kijs=class kijs{static get version(){return'0.0.1';}
static get keys(){return{BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INS:45,DEL:46,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,KEYPAD_0:96,KEYPAD_1:97,KEYPAD_2:98,KEYPAD_3:99,KEYPAD_4:100,KEYPAD_5:101,KEYPAD_6:102,KEYPAD_7:103,KEYPAD_8:104,KEYPAD_9:105,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123};}
static createDelegate(fn,context,args){return function(){const callArgs=args||arguments;return fn.apply(context||window,callArgs);};}
static createNamespace(name,object){const parts=name.split('.');let parent=window;let part;for(let i=0;i<parts.length;i++){part=parts[i];if(!parent[part]){parent[part]=i===parts.length-1&&object?object:{};}
parent=parent[part];}
return part;}
static defer(fn,millis,context,args=null){if(args!==null){args=kijs.isArray(args)?args:[args];}
fn=this.createDelegate(fn,context,args);if(millis>0){return setTimeout(fn,millis);}else{fn();return 0;}}
static getGetParameter(parameterName){const params={};if('search'in window.location){const pt=window.location.search.substr(1).split('&');for(let i=0;i<pt.length;i++){let tmp=pt[i].split('=');params[tmp[0]]=tmp.length===2?tmp[1]:null;};}
if(parameterName===undefined){return params;}else{return params[parameterName];}}
static getObjectFromNamespace(name){const parts=name.split('.');let parent=window;let part;for(let i=0;i<parts.length;i++){part=parts[i];if(!parent[part]){return false;}
parent=parent[part];}
return parent;}
static getText(key,variant='',args=null,comment='',languageId=null){if(kijs.isFunction(kijs.__getTextFn)){return kijs.__getTextFn.call(kijs.__getTextFnScope||this,key,variant,args,comment,languageId);}
let text=key;if(args!==null){args=kijs.isArray(args)?args:[args];for(var i=args.length;i>0;i--){text=kijs.String.replaceAll(text,'%'+i,args[i-1]);}}
return text;}
static interval(fn,millis,context,args){fn=this.createDelegate(fn,context,args);return setInterval(fn,millis);}
static isArray(value){return Object.prototype.toString.call(value)==='[object Array]';}
static isBoolean(value){return value===true||value===false;}
static isDate(value){return value instanceof Date&&!isNaN(value.valueOf());}
static isDefined(value){return typeof value!=='undefined';}
static isEmpty(value){if(value===null||value===''||value===undefined){return true;}
if(this.isArray(value)){return value.length===0;}
if(this.isObject(value)){return Object.keys(value).length===0;}
return false;}
static isFloat(value){return this.isInteger(value)===false&&parseFloat(value)===value;}
static isFunction(value){return typeof value==='function';}
static isHTMLElement(value){return value instanceof HTMLElement;}
static isInteger(value){return parseInt(value)===value;}
static isNumber(value){return typeof value==='number'&&!window.isNaN(value);}
static isNumeric(value){return this.isNumber(value)||!!(this.isString(value)&&value.match(/^-{0,1}[0-9]+(\.[0-9]+){0,1}$/));}
static isObject(value){return Object.prototype.toString.call(value)==='[object Object]';}
static isReady(fn,context){document.addEventListener('DOMContentLoaded',this.createDelegate(fn,context||this),false);}
static isString(value){return typeof value==='string';}
static toString(value){if(kijs.isString(value)){return value;}else if(value===null||!kijs.isDefined(value)){return'';}else if(kijs.isBoolean(value)){return value?'1':'0';}else if(kijs.isFunction(value.toString)){return value.toString();}
return(value+'');}
static setGetTextFn(fn,scope=null){kijs.__getTextFn=fn;kijs.__getTextFnScope=scope;}
static uniqId(prefix=''){if(!window.kijs.__uniqId){window.kijs.__uniqId=0;}
window.kijs.__uniqId++;return'kijs-'+(prefix?prefix+'-':'')+window.kijs.__uniqId;}};kijs.Ajax=class kijs_Ajax{static request(config={}){let postData;config.method=config.method||'GET';config.format=config.format||'json';config.parameters=config.parameters||{};config.abortHappened=false;config.timeoutHappened=false;if(config.disableCaching){config.parameters.noCache=(new Date()).getTime();}
if(!config.headers||!config.headers['Content-Type']){let contentType='';switch(config.format){case'json':contentType='application/json';break;case'xml':contentType='application/xml';break;case'text':contentType='text/plain';break;}
if(contentType){config.headers=config.headers||{};config.headers['Content-Type']=contentType;}}
if(config.parameters){const parString=kijs.Ajax.createQueryStringFromObject(config.parameters);if(parString){config.url+=(/\?/.test(config.url)?'&':'?')+parString;}}
if(config.method==='GET'){postData=null;}else{postData=config.postData||null;if(kijs.isObject(postData)||kijs.isArray(postData)){postData=JSON.stringify(postData);}}
const xmlhttp=new XMLHttpRequest();if('timeout'in config&&kijs.isInteger(config.timeout)){xmlhttp.timeout=config.timeout;}
if(kijs.isFunction(config.progressFn)){xmlhttp.onprogress=function(oEvent){config.progressFn.call(config.context||this,oEvent,config);};}
xmlhttp.onabort=function(){config.abortHappened=true;};xmlhttp.ontimeout=function(){config.timeoutHappened=true;};xmlhttp.onloadend=function(){let val=null;if(xmlhttp.status>=200&&xmlhttp.status<=299){switch(config.format){case'text':val=xmlhttp.responseText;break;case'json':try{val=JSON.parse(xmlhttp.responseText);}catch(e){val=xmlhttp.responseText;}
break;case'xml':val=kijs.Ajax.parseXml(xmlhttp.responseXML);break;}
config.fn.call(config.context||this,val,config,null);}else{let error='';if(xmlhttp.status>0){error=kijs.getText('Der Server hat mit einem Fehler geantwortet')+': '+xmlhttp.statusText+' (Code '+xmlhttp.status+')';}else if(config.abortHappened){error=kijs.getText('Die Verbindung wurde abgebrochen')+'.';}else if(config.timeoutHappened){error=kijs.getText('Der Server brauchte zu lange, um eine Antwort zu senden')+'. '+
kijs.getText('Die Verbindung wurde abgebrochen')+'.';}else{error=kijs.getText('Die Verbindung konnte nicht aufgebaut werden')+'.';}
config.fn.call(config.context||this,val,config,error);}};xmlhttp.open(config.method,config.url,true);if(config.headers){for(let name in config.headers){if(config.headers[name]!==null){xmlhttp.setRequestHeader(name,config.headers[name]);}}}
xmlhttp.send(postData);return xmlhttp;}
static parseXml(xml){let ret={};if(xml.nodeType===1){if(xml.attributes.length>0){for(let j=0;j<xml.attributes.length;j++){let attribute=xml.attributes.item(j);ret[attribute.nodeName]=attribute.nodeValue;}}}else if(xml.nodeType===3){ret=xml.nodeValue.trim();}
if(xml.hasChildNodes()){for(let i=0;i<xml.childNodes.length;i++){let item=xml.childNodes.item(i);let nodeName=item.nodeName;if(typeof(ret[nodeName])==='undefined'){let tmp=kijs.Ajax.parseXml(item);if(tmp!==''){ret[nodeName]=tmp;}}else{if(typeof(ret[nodeName].push)==="undefined"){let old=ret[nodeName];ret[nodeName]=[];ret[nodeName].push(old);}
let tmp=kijs.Ajax.parseXml(item);if(tmp!==''){ret[nodeName].push(tmp);}}}}
return ret;}
static createQueryStringFromObject(obj){let params=[];for(let key in obj){let name=encodeURIComponent(key);let val=obj[key];if(kijs.isObject(val)){throw new kijs.Error('Objects can not be convert to query strings.');}else if(kijs.isArray(val)){kijs.Array.each(val,function(v){v=encodeURIComponent(v);params.push(name+'='+v);},this);}else{val=encodeURIComponent(val);params.push(name+'='+val);}}
return params.join('&');}};kijs.Array=class kijs_Array{static clear(array){while(array.length>0){array.pop();}}
static clone(array){return Array.prototype.slice.call(array);}
static compare(array1,array2){if(!kijs.isArray(array1)||!kijs.isArray(array2)){return false;}
if(array1.length!==array2.length){return false;}
for(let i=0,l=array1.length;i<l;i++){if(array1[i]instanceof Array&&array2[i]instanceof Array){if(!this.compare(array1[i],array2[i])){return false;}}else if(array1[i]instanceof Date&&array2[i]instanceof Date){if(array1[i].getTime()!==array2[i].getTime()){return false;}}else if(array1[i]!==array2[i]){return false;}}
return true;}
static concat(...arrays){let arr;[arr,...arrays]=arrays;return arr.slice(0).concat(...arrays);}
static concatUnique(...arrays){return kijs.Array.unique(kijs.Array.concat(...arrays));}
static contains(array,value){if(kijs.isFunction(array.indexOf)){return array.indexOf(value)!==-1;}else if(kijs.isInteger(array.length)){for(let i=0;i<array.length;i++){if(array[i]===value){return true;}}}
return false;}
static diff(array1,...arrays){let diff=[];kijs.Array.each(array1,function(v){let uniqueVal=true;kijs.Array.each(arrays,function(compareArray){if(kijs.Array.contains(compareArray,v)){uniqueVal=false;return false;}},this);if(uniqueVal){diff.push(v);}},this);return diff;}
static each(array,fn,context,reverse){const len=array.length;if(reverse){for(let i=len-1;i>-1;i--){if(fn.call(context,array[i],i,array)===false){return i;}}}else{for(let i=0;i<len;i++){if(fn.call(context,array[i],i,array)===false){return i;}}}
return true;}
static max(array){let max;for(let i=0;i<array.length;i++){if(max===undefined||array[i]>max){max=array[i];}}
return max;}
static min(array){let min;for(let i=0;i<array.length;i++){if(min===undefined||array[i]<min){min=array[i];}}
return min;}
static move(array,fromIndex,toIndex){fromIndex=Math.max(0,Math.min(fromIndex,array.length));toIndex=Math.max(0,Math.min(toIndex,array.length));const value=array[fromIndex];if(toIndex>fromIndex){toIndex-=1;}
if(fromIndex!==toIndex){array.splice(fromIndex,1);array.splice(toIndex,0,value);}
return array;}
static remove(array,value){const index=array.indexOf(value);if(index!==-1){array.splice(index,1);}
return array;}
static removeIf(array,fn,context){let toDelete=[];kijs.Array.each(array,function(item){if(fn.call(context,item)===true){toDelete.push(item);}},this);kijs.Array.removeMultiple(array,toDelete);return array;}
static removeMultiple(array,values){kijs.Array.each(values,function(value){kijs.Array.remove(array,value);});return array;}
static slice(array,begin,end){if([1,2].slice(1,undefined).length){return Array.prototype.slice.call(array,begin,end);}else{if(typeof begin==='undefined'){return Array.prototype.slice.call(array);}
if(typeof end==='undefined'){return Array.prototype.slice.call(array,begin);}
return Array.prototype.slice.call(array,begin,end);}}
static unique(array){const ret=[];for(let i=0;i<array.length;i++){if(ret.indexOf(array[i])===-1){ret.push(array[i]);}}
return ret;}};kijs.Char=class kijs_Char{static get charTable(){return{A:[0x00C1,0x0102,0x1EAE,0x1EB6,0x1EB0,0x1EB2,0x1EB4,0x01CD,0x00C2,0x1EA4,0x1EAC,0x1EA6,0x1EA8,0x1EAA,0x00C4,0x1EA0,0x00C0,0x1EA2,0x0100,0x0104,0x00C5,0x01FA,0x00C3,0x00C6,0x01FC],B:[0x1E04,0x0181],C:[0x0106,0x010C,0x00C7,0x0108,0x010A,0x0186,0x0297],D:[0x010E,0x1E12,0x1E0C,0x018A,0x1E0E,0x01F2,0x01C5,0x0110,0x00D0,0x01F1,0x01C4],E:[0x00C9,0x0114,0x011A,0x00CA,0x1EBE,0x1EC6,0x1EC0,0x1EC2,0x1EC4,0x00CB,0x0116,0x1EB8,0x00C8,0x1EBA,0x0112,0x0118,0x1EBC,0x0190,0x018F],F:[0x0191],G:[0x01F4,0x011E,0x01E6,0x0122,0x011C,0x0120,0x1E20,0x029B],H:[0x1E2A,0x0124,0x1E24,0x0126],I:[0x00CD,0x012C,0x01CF,0x00CE,0x00CF,0x0130,0x1ECA,0x00CC,0x1EC8,0x012A,0x012E,0x0128,0x0132],J:[0x0134],K:[0x0136,0x1E32,0x0198,0x1E34],L:[0x0139,0x023D,0x013D,0x013B,0x1E3C,0x1E36,0x1E38,0x1E3A,0x013F,0x01C8,0x0141,0x01C7],M:[0x1E3E,0x1E40,0x1E42],N:[0x0143,0x0147,0x0145,0x1E4A,0x1E44,0x1E46,0x01F8,0x019D,0x1E48,0x01CB,0x00D1,0x01CA],O:[0x00D3,0x014E,0x01D1,0x00D4,0x1ED0,0x1ED8,0x1ED2,0x1ED4,0x1ED6,0x00D6,0x1ECC,0x0150,0x00D2,0x1ECE,0x01A0,0x1EDA,0x1EE2,0x1EDC,0x1EDE,0x1EE0,0x014C,0x019F,0x01EA,0x00D8,0x01FE,0x00D5,0x0152,0x0276],P:[0x00DE],Q:[],R:[0x0154,0x0158,0x0156,0x1E58,0x1E5A,0x1E5C,0x1E5E,0x0281],S:[0x015A,0x0160,0x015E,0x015C,0x0218,0x1E60,0x1E62,0x1E9E],T:[0x0164,0x0162,0x1E70,0x021A,0x1E6C,0x1E6E,0x0166,0x00DE,0x00D0],U:[0x00DA,0x016C,0x01D3,0x00DB,0x00DC,0x01D7,0x01D9,0x01DB,0x01D5,0x1EE4,0x0170,0x00D9,0x1EE6,0x01AF,0x1EE8,0x1EF0,0x1EEA,0x1EEC,0x1EEE,0x016A,0x0172,0x016E,0x0168],V:[],W:[0x1E82,0x0174,0x1E84,0x1E80,0x02AC],X:[],Y:[0x00DD,0x0176,0x0178,0x1E8E,0x1EF4,0x1EF2,0x01B3,0x1EF6,0x0232,0x1EF8],Z:[0x0179,0x017D,0x017B,0x1E92,0x1E94,0x01B5],a:[0x00E1,0x0103,0x1EAF,0x1EB7,0x1EB1,0x1EB3,0x1EB5,0x01CE,0x00E2,0x1EA5,0x1EAD,0x1EA7,0x1EA9,0x1EAB,0x00E4,0x1EA1,0x00E0,0x1EA3,0x0101,0x0105,0x00E5,0x01FB,0x00E3,0x00E6,0x01FD,0x0251,0x0250,0x0252],b:[0x1E05,0x0253,0x00DF],c:[0x0107,0x010D,0x00E7,0x0109,0x0255,0x010B],d:[0x010F,0x1E13,0x1E0D,0x0257,0x1E0F,0x0111,0x0256,0x02A4,0x01F3,0x02A3,0x02A5,0x01C6,0x00F0],e:[0x00E9,0x0115,0x011B,0x00EA,0x1EBF,0x1EC7,0x1EC1,0x1EC3,0x1EC5,0x00EB,0x0117,0x1EB9,0x00E8,0x1EBB,0x0113,0x0119,0x1EBD,0x0292,0x01EF,0x0293,0x0258,0x025C,0x025D,0x0259,0x025A,0x029A,0x025E],f:[0x0192,0x017F,0x02A9,0xFB01,0xFB02,0x0283,0x0286,0x0285,0x025F,0x0284],g:[0x01F5,0x011F,0x01E7,0x0123,0x011D,0x0121,0x0260,0x1E21,0x0261,0x0263],h:[0x1E2B,0x0125,0x1E25,0x0266,0x1E96,0x0127,0x0267,0x0265,0x02AE,0x02AF,0x0173],i:[0x00ED,0x012D,0x01D0,0x00EE,0x00EF,0x1ECB,0x00EC,0x1EC9,0x012B,0x012F,0x0268,0x0129,0x0269,0x0131,0x0133,0x025F],j:[0x01F0,0x0135,0x029D,0x0237,0x025F,0x0284],k:[0x0137,0x1E33,0x0199,0x1E35,0x0138,0x029E],l:[0x013A,0x019A,0x026C,0x013E,0x013C,0x1E3D,0x1E37,0x1E39,0x1E3B,0x0140,0x026B,0x026D,0x0142,0x019B,0x026E,0x01C9,0x02AA,0x02AB],m:[0x1E3F,0x1E41,0x1E43,0x0271,0x026F,0x0270],n:[0x0149,0x0144,0x0148,0x0146,0x1E4B,0x1E45,0x1E47,0x01F9,0x0272,0x1E49,0x0273,0x00F1,0x01CC,0x014B,0x014A],o:[0x00F3,0x014F,0x01D2,0x00F4,0x1ED1,0x1ED9,0x1ED3,0x1ED5,0x1ED7,0x00F6,0x1ECD,0x0151,0x00F2,0x1ECF,0x01A1,0x1EDB,0x1EE3,0x1EDD,0x1EDF,0x1EE1,0x014D,0x01EB,0x00F8,0x01FF,0x00F5,0x025B,0x0254,0x0275,0x0298,0x0153],p:[0x0278,0x00FE],q:[0x02A0],r:[0x0155,0x0159,0x0157,0x1E59,0x1E5B,0x1E5D,0x027E,0x1E5F,0x027C,0x027D,0x027F,0x0279,0x027B,0x027A],s:[0x015B,0x0161,0x015F,0x015D,0x0219,0x1E61,0x1E63,0x0282,0x017F,0x0283,0x0286,0x00DF,0x0285],t:[0x0165,0x0163,0x1E71,0x021B,0x1E97,0x1E6D,0x1E6F,0x0288,0x0167,0x02A8,0x02A7,0x00FE,0x00F0,0x02A6,0x0287],u:[0x0289,0x00FA,0x016D,0x01D4,0x00FB,0x00FC,0x01D8,0x01DA,0x01DC,0x01D6,0x1EE5,0x0171,0x00F9,0x1EE7,0x01B0,0x1EE9,0x1EF1,0x1EEB,0x1EED,0x1EEF,0x016B,0x0173,0x016F,0x0169,0x028A],v:[0x028B,0x028C],w:[0x1E83,0x0175,0x1E85,0x1E81,0x028D],x:[],y:[0x00FD,0x0177,0x00FF,0x1E8F,0x1EF5,0x1EF3,0x01B4,0x1EF7,0x0233,0x1EF9,0x028E],z:[0x017A,0x017E,0x0291,0x017C,0x1E93,0x1E95,0x0290,0x01B6]};};static getRegexPattern(text){let letters=null;if(kijs.isFunction(Array.from)){letters=Array.from(text);}else{letters=text.split('');}
let regex='';kijs.Array.each(letters,function(letter){if(kijs.isArray(kijs.Char.charTable[letter])&&kijs.Char.charTable[letter].length>0){regex+='['+letter;kijs.Array.each(kijs.Char.charTable[letter],function(specialLetter){regex+=String.fromCodePoint?String.fromCodePoint(specialLetter):String.fromCharCode(specialLetter);},this);regex+=']';}else{regex+=''+letter;}},this);return regex;}
static replaceSpecialChars(text){let letters=null;if(kijs.isFunction(Array.from)){letters=Array.from(text);}else{letters=text.split('');}
let responseText='';kijs.Array.each(letters,function(letter){for(let char in kijs.Char.charTable){if(kijs.Array.contains(kijs.Char.charTable[char],letter.codePointAt?letter.codePointAt(0):letter.charCodeAt(0))){responseText+=char;return;}}
responseText+=letter;});return responseText;}};kijs.Data=class kijs_Data{constructor(config={}){this._columns=[];this._rows=[];this._primary=[];this._disableDuplicateCheck=false;this._configMap={disableDuplicateCheck:true,rows:true,columns:true,primary:true};if(kijs.isObject(config)){this.applyConfig(config);}}
get columns(){return this._columns;}
set columns(val){this._columns=val;}
get disableDuplicateCheck(){return this._disableDuplicateCheck;}
set disableDuplicateCheck(val){this._disableDuplicateCheck=!!val;}
get rows(){return this._rows;}
set rows(val){if(kijs.isEmpty(val)){this._rows=[];return;}
if(!kijs.isArray(val)){val=[val];}
this._convertFromAnyDataArray(val);if(!this._disableDuplicateCheck){if(this.duplicateCheck(val)){throw new Error('Not unique primary-key on ('+this._primary.join(', ')+').');}}
this._rows=val;}
get primary(){return this._primary;}
set primary(val){this._primary=val;}
add(rows,duplicateCheck){if(kijs.isEmpty(rows)){return;}
if(!kijs.isArray(rows)){rows=[rows];}
this._convertFromAnyDataArray(rows);if(duplicateCheck){if(this.duplicateCheck(rows)){throw new Error('Not unique primary-key on ('+this.primary.join(', ')+').');}}
for(let i=0;i<rows.length;i++){let row=rows[i];this.rows.push(row);}}
applyConfig(config={}){kijs.Object.assignConfig(this,config,this._configMap);this._convertFromAnyDataArray(this._rows);if(kijs.isEmpty(this._columns)){this._columns=this._getColumnsFromRows(this._rows);}}
columnExist(columnName){return kijs.Array.contains(this._columns,columnName);}
duplicateCheck(rows){let hasDuplicate=false;if(kijs.isEmpty(rows)){return false;}
if(!kijs.isArray(rows)){rows=[rows];}
kijs.Array.each(this._rows,function(item){let match=0;for(let i=0;i<this._primary.length;i++){let pk=this._primary[i];if(rows[pk]===item[pk]){match++;}}
if(match===this._primary.length){hasDuplicate=true;return false;}},this);return hasDuplicate;}
each(fn,context){if(kijs.isEmpty(this._rows)){return;}
return kijs.Array.each(this._rows,fn,context);}
getCount(){return this._rows.length;}
getEmptyRowObject(){const o={};for(let i=0;i<this._columns.length;i++){o[this._columns[i]]=null;}
return o;}
getRowsByFieldValue(columnName,value){const len=this._rows.length;const ret=[];for(let i=0,len;i<len;i++){if(kijs.toString(this._rows[i][columnName])===kijs.toString(value)){ret.push(this._rows[i]);}}
return ret;}
getRowByPrimary(primary){let keys={};if(kijs.isEmpty(this._primary)){throw new Error('No primary key is defined in this data object.');}
if(kijs.isString(primary)||kijs.isNumber(primary)){keys[this._primary[0]]=primary;}
if(kijs.isArray(primary)){for(let i=0;i<primary.length;i++){keys[this._primary[i]]=primary;}}
if(kijs.isObject(primary)){keys=primary;}
for(let i=0;i<this._primary.length;i++){if(kijs.isEmpty(keys[this._primary[i]])){throw new Error('Number of primary-columns does not match.');}}
const len=this._rows.length;for(let i=0,len;i<len;i++){let ok=true;for(let j=0;j<this._primary.length;j++){const col=this._primary[j];if(kijs.toString(this._rows[i][col])!==kijs.toString(keys[col])){ok=false;break;}}
if(ok){return this._rows[i];}}
return null;}
insertBefore(newRow,row){this._completeRowObject(newRow);if(this._duplicateCheck(row)){return false;}
const pos=this._rows.indexOf(row);if(pos===-1){this._rows.push(row);}else{this._rows.splice(pos,0,newRow);}
return true;}
remove(row){const pos=this._rows.indexOf(row);if(pos===-1)return false;this._rows.splice(pos,1);return true;}
removeAll(){this._rows=[];}
_completeRowObject(row){let ret=false;for(let i=0;i<this._columns.length;i++){let col=this._columns[i];if(!kijs.isDefined(row[col])){row[col]=null;ret=true;}}
return ret;}
_convertFromAnyDataArray(rows){if(kijs.isEmpty(rows)){return;}
let format;if(kijs.isObject(rows[0])){format='object';}else if(kijs.isArray(rows[0])){if(!kijs.isEmpty(this._columns)&&rows[0].length===this._columns.length){format='array';}else{throw new Error('The number of columns does not match.');}}else{format='value';}
switch(format){case'object':if(this._completeRowObject(rows[0])&&rows.length>1){for(let i=1;i<rows.length;i++){this._completeRowObject(rows[i]);}}
break;case'array':for(let i=0;i<rows.length;i++){let row={};for(let j=0;j<this._columns.length;j++){const name=this._columns[j];row[name]=rows[i][j];}
rows[i]=row;}
break;case'value':let name;if(!kijs.isEmpty(this._primary)){name=this._primary[0];}else if(!kijs.isEmpty(this._columns)){name=this._columns[0];}else{name='id';this._columns.push(name);for(let i=0;i<rows.length;i++){let row=this.getEmptyRowObject();row[name]=rows[i];this._completeRowObject(row);rows[i]=row;}}
break;}}
_getColumnsFromRows(rows){const columns=[];if(rows.length>0){for(let argName in rows[0]){columns.push(argName);}}
return columns;}
destruct(){this._columns=null;this._rows=null;this._primary=null;}};kijs.Date=class kijs_Date{static get weekdays(){return[kijs.getText('Sonntag'),kijs.getText('Montag'),kijs.getText('Dienstag'),kijs.getText('Mittwoch'),kijs.getText('Donnerstag'),kijs.getText('Freitag'),kijs.getText('Samstag')];}
static get weekdays_short(){return[kijs.getText('So','3'),kijs.getText('Mo','3'),kijs.getText('Di','3'),kijs.getText('Mi','3'),kijs.getText('Do','3'),kijs.getText('Fr','3'),kijs.getText('Sa','3')];}
static get months(){return[kijs.getText('Januar'),kijs.getText('Februar'),kijs.getText('März'),kijs.getText('April'),kijs.getText('Mai'),kijs.getText('Juni'),kijs.getText('Juli'),kijs.getText('August'),kijs.getText('September'),kijs.getText('Oktober'),kijs.getText('November'),kijs.getText('Dezember')];}
static get months_short(){return[kijs.getText('Jan','3'),kijs.getText('Feb','3'),kijs.getText('Mär','3'),kijs.getText('Apr','3'),kijs.getText('Mai','3'),kijs.getText('Jun','3'),kijs.getText('Jul','3'),kijs.getText('Aug','3'),kijs.getText('Sep','3'),kijs.getText('Okt','3'),kijs.getText('Nov','3'),kijs.getText('Dez','3')];}
static addDays(date,days){const ret=new Date(date.valueOf());ret.setDate(ret.getDate()+days);return ret;}
static addMonths(date,months){const ret=new Date(date.valueOf());ret.setMonth(ret.getMonth()+months);return ret;}
static addYears(date,yars){const ret=new Date(date.valueOf());ret.setFullYear(ret.getFullYear()+yars);return ret;}
static clone(date){return new Date(date.getTime());}
static compare(date1,date2){if(date1 instanceof Date!==date2 instanceof Date){return false;}
if(date1 instanceof Date){return date1.getTime()===date2.getTime();}else{return date1===date2;}}
static create(arg){let ret=null;if(arg instanceof Date){ret=this.clone(arg);}else if(kijs.isNumber(arg)){ret=new Date(arg*1000);}else if(kijs.isString(arg)&&arg.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)){ret=this.getDateFromSqlString(arg);}else if(kijs.isString(arg)&&arg.match(/^[0-9]{1,2}\.?([0-9]{1,2}\.?([0-9]{2,4})?)?/)){ret=this.getDateFromGermanString(arg);}else if(kijs.isString(arg)&&arg.match(/^[^0-9]+[0-9]{1,2}[^0-9]?([0-9]{2,4})?/)){ret=this.getDateFromWeekString(arg);}else if(kijs.isArray(arg)&&arg.length>0){let year=parseInt(arg[0]);let month=1;let day=1;let hour=0;let minute=0;let second=0;if(arg.length>1)month=parseInt(arg[1]);if(arg.length>2)day=parseInt(arg[2]);if(arg.length>3)hour=parseInt(arg[3]);if(arg.length>4)minute=parseInt(arg[4]);if(arg.length>5)second=parseInt(arg[5]);ret=new Date(year,month-1,day,hour,minute,second);}
if(ret&&isNaN(ret.valueOf())){ret=null;}
return ret;}
static format(date,format){return kijs.toString(format).replace(/[a-zA-Z]/g,(letter)=>{return this.__formatReplace(letter,date);});}
static getDateFromGermanString(strDate){const args=strDate.split(' ');let argsTmp;let strTime='';if(args.length>=1){if(args[0].indexOf(':')>=0){strTime=args[0];}else{strDate=args[0];}}
if(args.length>=2){if(args[1].indexOf(':')>=0){strTime=args[1];}}
argsTmp=strDate.split('.');let day=argsTmp.length>=1&&argsTmp[0]?parseInt(argsTmp[0]):(new Date).getDate();let month=argsTmp.length>=2&&argsTmp[1]?parseInt(argsTmp[1]):(new Date).getMonth()+1;let year=argsTmp.length>=3&&argsTmp[2]?parseInt(argsTmp[2]):(new Date).getFullYear();if(year<100){if(year<70){year+=2000;}else if(year>=70){year+=1900;}}
argsTmp=strTime.split(':');let hours=argsTmp.length>=2?parseInt(argsTmp[0]):0;let minutes=argsTmp.length>=2?parseInt(argsTmp[1]):0;let seconds=argsTmp.length>=3?parseInt(argsTmp[2]):0;return new Date(year,month-1,day,hours,minutes,seconds,0);}
static getDateFromWeekString(strWeek){const matches=strWeek.match(/^[^0-9]+([0-9]{1,2})[^0-9]?([0-9]{2,4})?/);const week=parseInt(matches[1]);let year=matches[2]?parseInt(matches[2]):(new Date).getFullYear();if(year<100){if(year<70){year+=2000;}else if(year>=70){year+=1900;}}
return this.getFirstOfWeek(week,year);}
static getDateFromSqlString(sqlDate){let year=parseInt(sqlDate.substr(0,4));let month=parseInt(sqlDate.substr(5,2));let day=parseInt(sqlDate.substr(8,2));let hours=0;let minutes=0;let seconds=0;if(sqlDate.length>10){hours=parseInt(sqlDate.substr(11,2));minutes=parseInt(sqlDate.substr(14,2));seconds=parseInt(sqlDate.substr(17,2));}
return new Date(year,month-1,day,hours,minutes,seconds,0);}
static getDatePart(date){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}
static getFirstOfMonth(date){return new Date(date.getFullYear(),date.getMonth(),1);}
static getFirstOfWeek(week,year){let date=new Date(year,0,4,0,0,0,0);date=this.getMonday(date);return this.addDays(date,(week-1)*7);}
static getLastOfMonth(date){return new Date(date.getFullYear(),date.getMonth()+1,0);}
static getMonday(date){const day=date.getDay(),diff=date.getDate()-day+(day===0?-6:1);return new Date(date.setDate(diff));}
static getMonthName(date,short=false){if(short){return this.months_short[date.getMonth()];}else{return this.months[date.getMonth()];}}
static getNumberOfWeeks(year){const fd=new Date(year,0,1).getDay();const ld=new Date(year,11,31).getDay();const ly=this.isLeapYear(new Date(year,0,1));if(ly){if(fd===3&&ld===4)return 53;if(fd===4&&ld===5)return 53;}else{if(fd===4&&ld===4)return 53;}
return 52;}
static getSunday(date){const f=this.getMonday(date);f.setDate(f.getDate()+6);return f;}
static getWeekday(date,short){if(short){return this.weekdays_short[date.getDay()];}else{return this.weekdays[date.getDay()];}}
static getWeekOfYear(date){const ms1d=864e5;const ms7d=7*ms1d;const DC3=Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()+3)/ms1d;const AWN=Math.floor(DC3/7);const Wyr=new Date(AWN*ms7d).getUTCFullYear();return AWN-Math.floor(Date.UTC(Wyr,0,7)/ms7d)+1;}
static isLeapYear(date){const year=date.getFullYear();return!!((year&3)===0&&(year%100||(year%400===0&&year)));}
static unixTimestamp(date){return Math.round(date.getTime()/1000);}
static __formatReplace(letter,date){switch(letter){case'd':return kijs.String.padding(date.getDate(),2,'0','left');case'D':return this.getWeekday(date,true);case'j':return date.getDate();case'l':return this.getWeekday(date,false);case'F':return this.getMonthName(date,false);case'm':return kijs.String.padding(date.getMonth()+1,2,'0','left');case'M':return this.getMonthName(date,true);case'n':return(date.getMonth()+1);case'W':return kijs.String.padding(this.getWeekOfYear(date),2,'0','left');case'Y':return date.getFullYear();case'y':return kijs.toString(date.getFullYear()).substr(2);case'L':return this.isLeapYear(date)?'1':'0';case'G':return date.getHours();case'H':return kijs.String.padding(date.getHours(),2,'0','left');case'i':return kijs.String.padding(date.getMinutes(),2,'0','left');case's':return kijs.String.padding(date.getSeconds(),2,'0','left');case'c':return date.toISOString();case'r':return date.toString();case'U':return kijs.toString(kijs.Date.unixTimestamp(date));default:return letter;}}};kijs.Dom=class kijs_Dom{static addEventListener(eventName,node,fn,context,useCapture){useCapture=!!useCapture;context._nodeEventListeners=context._nodeEventListeners||{};context._nodeEventListeners[eventName]=context._nodeEventListeners[eventName]||[];if(!this.hasEventListener(eventName,node,context,useCapture)){let delegate=null;if(kijs.isString(fn)){let kijsEventName=fn;delegate=function(e){return context.raiseEvent(kijsEventName,{eventName:kijsEventName,nodeEventName:eventName,useCapture:useCapture,nodeEvent:e,context:context},this);};}else if(kijs.isFunction(fn)){delegate=function(e){return fn.apply(context,[{nodeEventName:eventName,useCapture:useCapture,nodeEvent:e,context:context}]);};}else{throw new kijs.Error(`Parameter "fn" can not be empty`);}
context._nodeEventListeners[eventName].push({node:node,useCapture:useCapture,delegate:delegate});node.addEventListener(eventName,delegate,useCapture);}}
static getAbsolutePos(node){let x=0;let y=0;let w=node.offsetWidth;let h=node.offsetHeight;while(node){x+=node.offsetLeft-node.scrollLeft;y+=node.offsetTop-node.scrollTop;node=node.offsetParent;}
return{x:x,y:y,w:w,h:h};}
static getFirstFocusableNode(node){let subNode=null;if(node.tabIndex>=0){return node;}else{if(node.hasChildNodes()){for(let i=0,len=node.children.length;i<len;i++){subNode=this.getFirstFocusableNode(node.children[i]);if(subNode){return subNode;}}}}
return null;}
static getScrollbarWidth(){if(!this.__scrollbarWidth){const outer=document.createElement("div");outer.style.visibility="hidden";outer.style.width="100px";outer.style.msOverflowStyle="scrollbar";document.body.appendChild(outer);const widthNoScroll=outer.offsetWidth;outer.style.overflow="scroll";const inner=document.createElement("div");inner.style.width="100%";outer.appendChild(inner);const widthWithScroll=inner.offsetWidth;outer.parentNode.removeChild(outer);this.__scrollbarWidth=widthNoScroll-widthWithScroll;}
return this.__scrollbarWidth;}
static hasEventListener(eventName,node,context,useCapture){useCapture=!!useCapture;context._nodeEventListeners=context._nodeEventListeners||{};context._nodeEventListeners[eventName]=context._nodeEventListeners[eventName]||[];let ret=false;if(context._nodeEventListeners[eventName]){kijs.Array.each(context._nodeEventListeners[eventName],function(listener){if(listener.node===node&&listener.useCapture===useCapture){ret=true;return false;}},this);}
return ret;}
static insertNodeAfter(node,targetNode){targetNode.parentNode.insertBefore(node,targetNode.nextSibling);}
static isChildOf(childNode,parentNode,sameAlso){if(childNode===parentNode){return!!sameAlso;}
if(childNode.parentNode){if(this.isChildOf(childNode.parentNode,parentNode,true)){return true;}}
return false;}
static removeAllChildNodes(node){while(node.hasChildNodes()){node.removeChild(node.lastChild);}}
static removeAllEventListenersFromContext(context){if(!kijs.isEmpty(context._nodeEventListeners)){kijs.Object.each(context._nodeEventListeners,function(eventName,listeners){kijs.Array.each(listeners,function(listener){listener.node.removeEventListener(eventName,listener.delegate,listener.useCapture);},this);},this);}
context._nodeEventListeners={};}
static removeEventListener(eventName,node,context,useCapture){useCapture=!!useCapture;context._nodeEventListeners=context._nodeEventListeners||{};context._nodeEventListeners[eventName]=context._nodeEventListeners[eventName]||[];let delegate=null;if(!kijs.isEmpty(context._nodeEventListeners[eventName])){const arr=[];kijs.Array.each(context._nodeEventListeners[eventName],function(listener){if(listener.node===node&&listener.useCapture===useCapture){delegate=listener.delegate;}else{arr.push(listener);}},this);context._nodeEventListeners[eventName]=arr;}
if(delegate){node.removeEventListener(eventName,delegate,useCapture);}}
static setInnerHtml(node,html,htmlDisplayType){html=kijs.toString(html);switch(htmlDisplayType){case'code':this.removeAllChildNodes(node);node.appendChild(document.createTextNode(html));break;case'text':let d=document.createElement('div');d.innerHTML=html;node.innerHTML=d.textContent||d.innerText||'';d=null;break;case'html':default:node.innerHTML=html;break;}}};kijs.DragDrop=class kijs_DragDrop{static addDragEvents(element,dom){if(dom instanceof kijs.gui.Dom){dom.on('dragStart',function(e){this._onDragStart(e.nodeEvent,element,dom);},this);dom.on('dragEnd',function(e){this._onDragEnd(e.nodeEvent,element,dom);},this);}else{dom.addEventListener('dragstart',this._onDragStart.bind(this,element,dom));dom.addEventListener('dragend',this._onDragEnd.bind(this,element,dom));}}
static addDropEvents(element,dom){if(dom instanceof kijs.gui.Dom){dom.on('dragEnter',function(e){this._onDragEnter(e.nodeEvent,element,dom);},this);dom.on('dragOver',function(e){this._onDragOver(e.nodeEvent,element,dom);},this);dom.on('dragLeave',function(e){this._onDragLeave(e.nodeEvent,element,dom);},this);dom.on('drop',function(e){this._onDrop(e.nodeEvent,element,dom);},this);}else{dom.addEventListener('dragenter',this._onDragEnter.bind(this,element,dom));dom.addEventListener('dragover',this._onDragOver.bind(this,element,dom));dom.addEventListener('dragleave',this._onDragLeave.bind(this,element,dom));dom.addEventListener('drop',this._onDrop.bind(this,element,dom));}}
static _getDataFromNodeEvent(nodeEvent,targetElement,targetDom){if(nodeEvent.dataTransfer&&kijs.Array.contains(nodeEvent.dataTransfer.types,'application/kijs-dragdrop')&&kijs.DragDrop._ddData){kijs.DragDrop._ddData.nodeEvent=nodeEvent;kijs.DragDrop._ddData.targetElement=targetElement;kijs.DragDrop._ddData.targetDom=targetDom instanceof kijs.gui.Dom?targetDom:null;kijs.DragDrop._ddData.targetNode=targetDom instanceof kijs.gui.Dom?targetDom.node:targetDom;return kijs.DragDrop._ddData;}else{return{nodeEvent:nodeEvent,data:null,sourceElement:null,sourceDom:null,sourceNode:null,targetElement:targetElement,targetDom:targetDom instanceof kijs.gui.Dom?targetDom:null,targetNode:targetDom instanceof kijs.gui.Dom?targetDom.node:targetDom,markTarget:true,position:{allowOnto:false,allowAbove:false,allowBelow:false,allowLeft:false,allowRight:false,margin:0}};}}
static _getPosition(w,h,x,y,hasOnto,hasAbove,hasBelow,hasLeft,hasRight,margin){let distToBt=h-y;let distToRt=w-x;let distToTp=y;let distToLt=x;if(hasOnto&&!hasAbove&&!hasBelow&&!hasLeft&&!hasRight){return'onto';}else if(!hasOnto&&hasAbove&&!hasBelow&&!hasLeft&&!hasRight){return'above';}else if(!hasOnto&&!hasAbove&&hasBelow&&!hasLeft&&!hasRight){return'below';}else if(!hasOnto&&!hasAbove&&!hasBelow&&hasLeft&&!hasRight){return'left';}else if(!hasOnto&&!hasAbove&&!hasBelow&&!hasLeft&&hasRight){return'right';}
if(hasOnto&&distToLt>margin&&distToTp>margin&&distToBt>margin&&distToRt>margin){return'onto';}
if(hasAbove&&(!hasBelow||distToTp<distToBt)&&(!hasRight||distToTp<distToRt)&&(!hasLeft||distToTp<distToLt)){return'above';}
if(hasBelow&&(!hasAbove||distToBt<distToTp)&&(!hasRight||distToBt<distToRt)&&(!hasLeft||distToBt<distToLt)){return'below';}
if(hasLeft&&(!hasAbove||distToLt<distToTp)&&(!hasRight||distToLt<distToRt)&&(!hasBelow||distToLt<distToBt)){return'left';}
if(hasRight&&(!hasAbove||distToRt<distToTp)&&(!hasLeft||distToRt<distToLt)&&(!hasBelow||distToRt<distToBt)){return'right';}
return false;}
static _markTargetShow(w,h,x,y,pos){if(!kijs.DragDrop._ddMarker){kijs.DragDrop._ddMarker={};kijs.DragDrop._ddMarker.top=document.createElement('div');kijs.DragDrop._ddMarker.bottom=document.createElement('div');kijs.DragDrop._ddMarker.left=document.createElement('div');kijs.DragDrop._ddMarker.right=document.createElement('div');kijs.DragDrop._ddMarker.top.className='kijs-dragdrop-marker top';kijs.DragDrop._ddMarker.bottom.className='kijs-dragdrop-marker bottom';kijs.DragDrop._ddMarker.left.className='kijs-dragdrop-marker left';kijs.DragDrop._ddMarker.right.className='kijs-dragdrop-marker right';}
kijs.DragDrop._ddMarker.top.style.width=w+'px';kijs.DragDrop._ddMarker.top.style.left=x+'px';kijs.DragDrop._ddMarker.top.style.top=(y-2)+'px';kijs.DragDrop._ddMarker.bottom.style.width=w+'px';kijs.DragDrop._ddMarker.bottom.style.left=x+'px';kijs.DragDrop._ddMarker.bottom.style.top=(y+h)+'px';kijs.DragDrop._ddMarker.left.style.height=(h+4)+'px';kijs.DragDrop._ddMarker.left.style.left=(x-2)+'px';kijs.DragDrop._ddMarker.left.style.top=(y-2)+'px';kijs.DragDrop._ddMarker.right.style.height=(h+4)+'px';kijs.DragDrop._ddMarker.right.style.left=(x+w)+'px';kijs.DragDrop._ddMarker.right.style.top=(y-2)+'px';if(pos==='onto'||pos==='above'){document.body.appendChild(kijs.DragDrop._ddMarker.top);}else if(kijs.DragDrop._ddMarker.top.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.top);}
if(pos==='onto'||pos==='below'){document.body.appendChild(kijs.DragDrop._ddMarker.bottom);}else if(kijs.DragDrop._ddMarker.bottom.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.bottom);}
if(pos==='onto'||pos==='left'){document.body.appendChild(kijs.DragDrop._ddMarker.left);}else if(kijs.DragDrop._ddMarker.left.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.left);}
if(pos==='onto'||pos==='right'){document.body.appendChild(kijs.DragDrop._ddMarker.right);}else if(kijs.DragDrop._ddMarker.right.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.right);}}
static _markTargetHide(){if(kijs.DragDrop._ddMarker){if(kijs.DragDrop._ddMarker.top.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.top);}
if(kijs.DragDrop._ddMarker.bottom.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.bottom);}
if(kijs.DragDrop._ddMarker.left.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.left);}
if(kijs.DragDrop._ddMarker.right.parentNode===document.body){document.body.removeChild(kijs.DragDrop._ddMarker.right);}}}
static _onDragStart(nodeEvent,element,dom){kijs.DragDrop._ddData={nodeEvent:nodeEvent,data:null,sourceElement:element,sourceDom:dom instanceof kijs.gui.Dom?dom:null,sourceNode:dom instanceof kijs.gui.Dom?dom.node:dom,targetElement:null,targetDom:null,targetNode:null,markTarget:true,position:{allowOnto:true,allowAbove:true,allowBelow:true,allowLeft:true,allowRight:true,margin:8}};if(element.raiseEvent('ddStart',kijs.DragDrop._ddData)){nodeEvent.dataTransfer.setData('application/kijs-dragdrop','');}else{kijs.DragDrop._ddData=null;}}
static _onDragEnd(nodeEvent,element,dom){this._markTargetHide();kijs.DragDrop._ddData=null;kijs.DragDrop._ddMarker=null;}
static _onDragEnter(nodeEvent,element,dom){element.raiseEvent('ddEnter',this._getDataFromNodeEvent(nodeEvent,element,dom));nodeEvent.preventDefault();nodeEvent.stopPropagation();}
static _onDragOver(nodeEvent,element,dom){let dropData=this._getDataFromNodeEvent(nodeEvent,element,dom);element.raiseEvent('ddOver',dropData);if(!dropData.position.allowOnto&&!dropData.position.allowAbove&&!dropData.position.allowBelow&&!dropData.position.allowLeft&&!dropData.position.allowRight){nodeEvent.dataTransfer.dropEffect='none';}
if(dropData.markTarget){let absPos=kijs.Dom.getAbsolutePos(dom instanceof kijs.gui.Dom?dom.node:dom);let x=nodeEvent.pageX-absPos.x,y=nodeEvent.pageY-absPos.y;let pos=this._getPosition(absPos.w,absPos.h,x,y,dropData.position.allowOnto,dropData.position.allowAbove,dropData.position.allowBelow,dropData.position.allowLeft,dropData.position.allowRight,dropData.position.margin);this._markTargetShow(absPos.w,absPos.h,absPos.x,absPos.y,pos);}
nodeEvent.preventDefault();nodeEvent.stopPropagation();}
static _onDragLeave(nodeEvent,element,dom){element.raiseEvent('ddLeave',this._getDataFromNodeEvent(nodeEvent,element,dom));this._markTargetHide();nodeEvent.preventDefault();nodeEvent.stopPropagation();}
static _onDrop(nodeEvent,element,dom){nodeEvent.preventDefault();let dropData=this._getDataFromNodeEvent(nodeEvent,element,dom);this._markTargetHide();let absPos=kijs.Dom.getAbsolutePos(dom instanceof kijs.gui.Dom?dom.node:dom);let x=nodeEvent.pageX-absPos.x,y=nodeEvent.pageY-absPos.y;dropData.position.position=this._getPosition(absPos.w,absPos.h,x,y,dropData.position.allowOnto,dropData.position.allowAbove,dropData.position.allowBelow,dropData.position.allowLeft,dropData.position.allowRight,dropData.position.margin);element.raiseEvent('ddDrop',dropData);}};kijs.Grafic=class kijs_Grafic{static alignRectToRect(rect,targetRect,targetPos,pos,offsetX,offsetY){const ret={x:rect.x,y:rect.y,w:rect.w,h:rect.h};targetPos=targetPos||'bl';pos=pos||'tl';offsetX=offsetX||0;offsetY=offsetY||0;const tAnchor=this.getAnchorPos(targetRect,targetPos);const eAnchor=this.getAnchorPos({x:0,y:0,w:rect.w,h:rect.h},pos);ret.x=tAnchor.x-eAnchor.x+offsetX;ret.y=tAnchor.y-eAnchor.y+offsetY;return ret;}
static getAnchorPos(rect,pos){const ret={x:0,y:0};if(pos.indexOf('t')!==-1){ret.y=rect.y;}else if(pos.indexOf('b')!==-1){ret.y=rect.y+rect.h;}else{ret.y=rect.y+Math.floor(rect.h/2);}
if(pos.indexOf('l')!==-1){ret.x=rect.x;}else if(pos.indexOf('r')!==-1){ret.x=rect.x+rect.w;}else{ret.x=rect.x+Math.floor(rect.w/2);}
return ret;}
static rectsOverlap(rect,rectOuter){const ret={};ret.sizeL=rect.x-rectOuter.x;ret.sizeR=(rectOuter.x+rectOuter.w)-(rect.x+rect.w);ret.sizeT=rect.y-rectOuter.y;ret.sizeB=(rectOuter.y+rectOuter.h)-(rect.y+rect.h);ret.fitX=ret.sizeL>=0&&ret.sizeR>=0;ret.fitY=ret.sizeT>=0&&ret.sizeB>=0;ret.fit=ret.fitX&&ret.fitY;return ret;}};kijs.Navigator=class kijs_Navigator{static get browser(){return kijs.Navigator.getBrowserInfo().browser;}
static get browserVendor(){return kijs.Navigator.getBrowserInfo().browserVendor;}
static get browserVersion(){return kijs.Navigator.getBrowserInfo().browserVersion;}
static get isChrome(){return kijs.Navigator.getBrowserInfo().isChrome;}
static get isChromium(){return kijs.Navigator.getBrowserInfo().isChromium;}
static get isFirefox(){return kijs.Navigator.getBrowserInfo().isFirefox;}
static get isEdge(){return kijs.Navigator.getBrowserInfo().isEdge;}
static get isIE(){return kijs.Navigator.getBrowserInfo().isIE;}
static get isSafari(){return kijs.Navigator.getBrowserInfo().isSafari;}
static get isWindows(){return kijs.Navigator.getBrowserInfo().isWindows;}
static get isMac(){return kijs.Navigator.getBrowserInfo().isMac;}
static get isAndroid(){return kijs.Navigator.getBrowserInfo().isAndroid;}
static get isIOS(){return kijs.Navigator.getBrowserInfo().isIOS;}
static get isLinux(){return kijs.Navigator.getBrowserInfo().isLinux;}
static get os(){return kijs.Navigator.getBrowserInfo().os;}
static get osVendor(){return kijs.Navigator.getBrowserInfo().osVendor;}
static get osVersion(){return kijs.Navigator.getBrowserInfo().osVersion;}
static getBrowserInfo(userAgent=null){let ua=userAgent||window.navigator.userAgent;if(userAgent===null&&kijs.Navigator._bi){return kijs.Navigator._bi;}
let bi={browserVersion:'',browserVendor:'',browser:'',os:'',osVersion:'',osVendor:'',isChrome:false,isChromium:false,isFirefox:false,isEdge:false,isIE:false,isSafari:false,isWindows:false,isMac:false,isAndroid:false,isIOS:false,isLinux:false};if(kijs.Navigator._browserVersion(ua,'Edge')){bi.browser='Edge';bi.browserVendor='Microsoft';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Edge');bi.isEdge=true;}else if(kijs.Navigator._browserVersion(ua,'Edg')){bi.browser='Edge';bi.browserVendor='Microsoft';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Edg');bi.isEdge=true;bi.isChromium=true;}else if(kijs.Navigator._browserVersion(ua,'Firefox')){bi.browser='Firefox';bi.browserVendor='Mozilla';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Firefox');bi.isFirefox=true;}else if(ua.match(/Trident/i)&&ua.match(/rv:11/i)){bi.browser='Internet Explorer';bi.browserVendor='Microsoft';bi.browserVersion='11.0';bi.isIE=true;}else if(kijs.Navigator._browserVersion(ua,'Vivaldi')){bi.browser='Vivaldi';bi.browserVendor='Vivaldi';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Vivaldi');bi.isChromium=true;}else if(kijs.Navigator._browserVersion(ua,'Opera')){bi.browser='Opera';bi.browserVendor='Opera';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Opera');bi.isChromium=true;}else if(kijs.Navigator._browserVersion(ua,'SamsungBrowser')){bi.browser='Internet Browser';bi.browserVendor='Samsung';bi.browserVersion=kijs.Navigator._browserVersion(ua,'SamsungBrowser');bi.isChromium=true;}else if(kijs.Navigator._browserVersion(ua,'Chrome')){bi.browser='Chrome';bi.browserVendor='Google';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Chrome');bi.isChrome=true;bi.isChromium=true;}else if(kijs.Navigator._browserVersion(ua,'Safari')){bi.browser='Safari';bi.browserVendor='Apple';bi.browserVersion=kijs.Navigator._browserVersion(ua,'Version');if(!bi.browserVersion){bi.browserVersion=kijs.Navigator._browserVersion(ua,'Safari');}
bi.isSafari=true;}
let win=ua.match(/Windows NT ([0-9\.]+)/i);if(win&&win[1]){let NtVersion=parseFloat(win[1]);bi.isWindows=true;bi.os='Windows';bi.osVendor='Microsoft';switch(NtVersion){case 5.1:case 5.2:bi.osVersion='XP';break;case 6.0:bi.osVersion='Vista';break;case 6.1:bi.osVersion='7';break;case 6.2:bi.osVersion='8';break;case 6.3:bi.osVersion='8.1';break;case 6.4:case 10.0:bi.osVersion='10';break;default:bi.osVersion='NT '+NtVersion;break;}}
if(!bi.os&&ua.match(/(iPad|iPhone|iPod)/i)){bi.isIOS=true;bi.os=ua.match(/iPad/i)?'iPadOS':'iOS';bi.osVendor='Apple';let os=ua.match(/OS ([0-9_]+)/i);if(os){bi.osVersion=kijs.String.replaceAll(os[1],'_','.');}}
if(!bi.os&&ua.match(/Macintosh/i)){bi.isMac=true;bi.os='macOS';bi.osVendor='Apple';let os=ua.match(/OS (?:X )?([0-9_]+)/i);if(os){bi.osVersion=kijs.String.replaceAll(os[1],'_','.');}}
if(!bi.os&&ua.match(/Android/i)){bi.isAndroid=true;bi.os='Android';bi.osVendor='Google';let os=ua.match(/Android ([0-9\.]+)/i);if(os){bi.osVersion=os[1];}}
if(!bi.os&&ua.match(/Linux/i)){bi.isLinux=true;bi.os='Linux';let os=ua.match(/rv:([0-9\.]+)/i);if(os){bi.osVersion=os[1];}}
if(userAgent===null){kijs.Navigator._bi=bi;}
return bi;}
static _browserVersion(ua,browser){let re=new RegExp(browser+'/([0-9\\.]+)','i');let match=ua.match(re);if(match&&match[1]){return match[1];}
return'';}};kijs.Number=class kijs_String{static format(number,decimals=0,decPoint='.',thousandsSep='\''){let ret='';if(decimals===''||decimals===null){let tmp=kijs.toString(number).split('.');if(tmp.length>1){decimals=tmp[1].length;}else{decimals=0;}}else{decimals=Number(decimals);}
let tmp=kijs.toString(Math.abs(kijs.Number.round(number,decimals))).split('.');if(!kijs.isEmpty(thousandsSep)&&!kijs.isEmpty(tmp[0])){const len=kijs.toString(tmp[0]).length;for(let i=len-1;i>=0;i--){ret=tmp[0].substr(i,1)+ret;if((len-i)%3===0&&i>0){ret=thousandsSep+ret;}}}else{ret=tmp[0]+'';}
if(decimals>0&&!kijs.isEmpty(ret)&&!kijs.isEmpty(decPoint)){let digits=tmp.length>1?kijs.toString(tmp[1]):'';digits=kijs.String.padding(digits.substr(0,decimals),decimals,'0','right');ret+=decPoint+digits;}
if(kijs.Number.round(number,decimals)<0){ret='-'+ret;}
return ret;}
static parse(number,decimals=0,decPoint='.',thousandsSep='\''){if(thousandsSep!==''){number=kijs.String.replaceAll(number,thousandsSep,'');}
if(decPoint!=='.'&&decPoint!==''){number=kijs.String.replaceAll(number,decPoint,'.');}
number=number.replace(/[^\-0-9\.]/,'');number=window.parseFloat(number);if(!window.isNaN(number)){if(decimals===0){number=window.parseInt(number.toFixed(0));}else{number=window.parseFloat(number.toFixed(decimals));}
return number;}
return null;}
static round(number,precision=0){return Number(Math.round(number+'e'+precision)+'e-'+precision);}
static roundTo(number,roundTo=0){if(roundTo>0){return kijs.Number.round(number/roundTo)*roundTo;}else{return kijs.Number.round(number);}}};kijs.Object=class kijs_Object{static assignConfig(object,config,configMap){let tmpConfigs=[];kijs.Object.each(config,function(cfgKey,cfgVal){if(!configMap.hasOwnProperty(cfgKey)){if(config.skipUnknownConfig||cfgKey==='skipUnknownConfig'){return;}else{throw new kijs.Error(`Unkown config "${cfgKey}"`);}}
let prio=Number.MIN_VALUE;let fn='replace';let target='_'+cfgKey;let context=object;let map=configMap[cfgKey];if(map===true){}else if(map===false){fn='error';}else if(kijs.isString(map)){target=map;}else if(kijs.isObject(map)){if(kijs.isNumeric(map.prio)){prio=Number(map.prio);}
if(map.fn){fn=map.fn;}
if(map.target){target=map.target;}
if(map.context){context=map.context;}}else{throw new kijs.Error(`Unkown format on configMap "${cfgKey}"`);}
tmpConfigs.push({prio:prio,key:cfgKey,fn:fn,target:target,context:context,value:cfgVal});},this);tmpConfigs.sort(function(a,b){return a.prio-b.prio;});kijs.Array.each(tmpConfigs,function(cfg){switch(cfg.fn){case'manual':break;case'replace':cfg.context[cfg.target]=cfg.value;break;case'append':if(kijs.isArray(cfg.context[cfg.target])){if(kijs.isArray(cfg.value)){cfg.context[cfg.target]=kijs.Array.concat(cfg.context[cfg.target],cfg.value);}else if(cfg.value){cfg.context[cfg.target].push(cfg.value);}}else{if(kijs.isArray(cfg.value)){cfg.context[cfg.target]=cfg.value;}else if(cfg.value){cfg.context[cfg.target]=[cfg.value];}}
break;case'appendUnique':if(kijs.isArray(cfg.context[cfg.target])){if(kijs.isArray(cfg.value)){cfg.context[cfg.target]=kijs.Array.concatUnique(cfg.context[cfg.target],cfg.value);}else if(cfg.value){cfg.context[cfg.target].push(cfg.value);kijs.Array.unique(cfg.context[cfg.target]);}}else{if(kijs.isArray(cfg.value)){cfg.context[cfg.target]=cfg.value;kijs.Array.unique(cfg.context[cfg.target]);}else if(cfg.value){cfg.context[cfg.target]=[cfg.value];}}
break;case'assign':if(kijs.isObject(cfg.context[cfg.target])){if(kijs.isObject(cfg.value)){Object.assign(cfg.context[cfg.target],cfg.value);}else if(cfg.value){throw new kijs.Error(`config "${cfg.key}" is not an object`);}}else{if(kijs.isObject(cfg.value)){cfg.context[cfg.target]=cfg.value;}else if(cfg.value){throw new kijs.Error(`config "${cfg.key}" is not an object`);}}
break;case'assignDeep':if(kijs.isObject(cfg.context[cfg.target])){if(kijs.isObject(cfg.value)){kijs.Object.assignDeep(cfg.context[cfg.target],cfg.value);}else if(cfg.value){throw new kijs.Error(`config "${cfg.key}" is not an object`);}}else{if(kijs.isObject(cfg.value)){cfg.context[cfg.target]=cfg.value;}else if(cfg.value){throw new kijs.Error(`config "${cfg.key}" is not an object`);}}
break;case'assignListeners':if(kijs.isObject(cfg.value)){for(let k in cfg.value){if(k!=='context'){if(!kijs.isFunction(cfg.value[k])){throw new kijs.Error('Listener "'+k+'" ist not a function.');}
cfg.context.on(k,cfg.value[k],cfg.value.context||cfg.context);}}}
break;case'function':if(kijs.isFunction(cfg.target)){cfg.target.call(cfg.context,cfg.value);}else{throw new kijs.Error(`config "${cfg.key}" is not a function`);}
break;case'error':throw new kijs.Error(`Assignment of config "${cfg.key}" is prohibited`);break;}},this);tmpConfigs=null;}
static assignDeep(target,source,overwrite=true){kijs.Object.each(source,function(key,val){if(kijs.isObject(val)){if(kijs.isObject(target[key])){kijs.Object.assignDeep(target[key],val,overwrite);}else{target[key]=kijs.Object.clone(val);}}else if(kijs.isArray(val)){if(overwrite||target[key]===undefined){target[key]=kijs.Array.clone(val);}}else{if(overwrite||target[key]===undefined){target[key]=val;}}},this);return target;}
static clone(object){return JSON.parse(JSON.stringify(object));}
static each(object,fn,context){for(let key in object){if(object.hasOwnProperty(key)){if(fn.call(context,key,object[key])===false){return;}}}}};kijs.Observable=class kijs_Observable{constructor(){this._nodeEventListeners={};this._events=this._events||{};}
get jsClassName(){if(kijs.isString(this.constructor.name)){return kijs.String.replaceAll(this.constructor.name,'_','.');}
return null;}
hasListener(name,callback=null,context=null){let listeners=this._events[name];if(listeners){if(!callback&&!context){return true;}else{for(let i=0;i<listeners.length;i++){let listener=listeners[i];const callbackOk=!callback||callback===listener.callback;const contextOk=!context||context===listener.context;if(callbackOk&&contextOk){return true;}}}}
return false;}
off(names=null,callback=null,context=null){if(!names&&!callback&&!context){this._events={};return;}
if(kijs.isEmpty(names)){names=Object.keys(this._events);}else if(!kijs.isArray(names)){names=[names];}
kijs.Array.each(names,function(name){let skip=false;let listeners=this._events[name];if(!listeners){skip=true;}
if(!skip&&!callback&&!context){delete this._events[name];skip=true;}
if(!skip){let remaining=[];for(let j=0;j<listeners.length;j++){let listener=listeners[j];if((callback&&callback!==listener.callback)||(context&&context!==listener.context)){remaining.push(listener);}}
if(remaining.length){this._events[name]=remaining;}else{delete this._events[name];}}},this);}
on(names,callback,context){if(!kijs.isString(names)&&!kijs.isArray(names)){throw new kijs.Error(`invalid argument 1 for on(names, callback, context): string or array expected`);}
if(!kijs.isFunction(callback)){throw new kijs.Error(`invalid argument 2 for on(names, callback, context): function expected`);}
names=kijs.isArray(names)?names:[names];kijs.Array.each(names,function(name){if(!this.hasListener(name,callback,context)){if(!this._events[name]){this._events[name]=[];}
this._events[name].push({callback:callback,context:context});}},this);}
once(names,callback,context){const callbackWrapper=function(e){this.off(names,callbackWrapper,context);return callback.apply(context,arguments);};this.on(names,callbackWrapper,this);}
raiseEvent(name,...args){this._events=this._events||{};if(kijs.isEmpty(this._events)){return true;}
if(!kijs.isDefined(name)){name=Object.keys(this._events);}
if(!kijs.isArray(name)){name=[name];}
const names=name;let returnValue=true;for(let i=0;i<names.length;i++){name=names[i];const listeners=this._events[name];if(listeners){for(let j=0;j<listeners.length;j++){const listener=listeners[j];if(listener.callback.apply(listener.context,args)===false){returnValue=false;}}}}
return returnValue;}
destruct(){this.off();}};kijs.Rpc=class kijs_Rpc{constructor(config={}){this._url='.';this._parameters={};this._defer=10;this._timeout=0;this._deferId=null;this._queue=null;this._tid=0;this._queue=[];this._configMap={defer:true,timeout:true,url:true,parameters:true};if(kijs.isObject(config)){this.applyConfig(config);}}
static get states(){return{QUEUE:1,TRANSMITTED:2,CANCELED_BEFORE_TRANSMIT:3,CANCELED_AFTER_TRANSMIT:4};}
get defer(){return this._defer;}
set defer(val){this._defer=val;}
get url(){return this._url;}
set url(val){this._url=val;}
get timeout(){return this._timeout;}
set timeout(val){this._timeout=parseInt(val);}
applyConfig(config={}){kijs.Object.assignConfig(this,config,this._configMap);}
do(facadeFn,requestData,fn,context,cancelRunningRpcs,rpcParams,responseArgs){if(!facadeFn){throw new kijs.Error('RPC call without facade function');}
if(this._deferId){clearTimeout(this._deferId);}
if(cancelRunningRpcs){for(let i=0;i<this._queue.length;i++){if(this._queue[i].facadeFn===facadeFn&&this._queue[i].context===context&&this._queue[i].fn===fn){switch(this._queue[i].state){case 1:this._queue[i].state=kijs.Rpc.states.CANCELED_BEFORE_TRANSMIT;this._receive([{tid:this._queue[i].tid}],{postData:[this._queue[i]]});break;case 2:this._queue[i].state=kijs.Rpc.states.CANCELED_AFTER_TRANSMIT;break;}}}}
this._queue.push({facadeFn:facadeFn,requestData:requestData,type:'rpc',tid:this._createTid(),fn:fn,context:context,rpcParams:rpcParams,responseArgs:responseArgs,state:kijs.Rpc.states.QUEUE});this._deferId=kijs.defer(this._transmit,this.defer,this);}
_createTid(){this._tid++;return this._tid;}
_getByTid(tid){for(let i=0;i<this._queue.length;i++){if(this._queue[i].tid===tid){return this._queue[i];}}
return null;}
_receive(response,request,errorMsg){for(let i=0;i<request.postData.length;i++){let subResponse=kijs.isArray(response)?response[i]:null;let subRequest=this._getByTid(request.postData[i].tid);if(!kijs.isObject(subResponse)){subResponse={errorMsg:'RPC-Antwort im falschen Format'};}
if(errorMsg){subResponse.errorMsg=errorMsg;}
if(!subResponse.errorMsg&&subResponse.tid!==subRequest.tid){subResponse.errorMsg='Die RPC-Antwort passt nicht zum Request';}
if(subRequest.state===kijs.Rpc.states.CANCELED_BEFORE_TRANSMIT||subRequest.state===kijs.Rpc.states.CANCELED_AFTER_TRANSMIT){subResponse.canceled=true;}
this._removeTid(subRequest.tid);if(subRequest.fn&&kijs.isFunction(subRequest.fn)){subRequest.fn.call(subRequest.context||this,subResponse,subRequest);}}}
_removeTid(tid){const newQueue=[];for(let i=0;i<this._queue.length;i++){if(this._queue[i].tid!==tid){newQueue.push(this._queue[i]);}}
this._queue=newQueue;}
_transmit(){this._deferId=null;const transmitData=[];for(let i=0;i<this._queue.length;i++){if(this._queue[i].state===kijs.Rpc.states.QUEUE){const subRequest=kijs.isObject(this._queue[i].rpcParams)?this._queue[i].rpcParams:{};subRequest.facadeFn=this._queue[i].facadeFn;subRequest.requestData=this._queue[i].requestData;subRequest.type=this._queue[i].type;subRequest.tid=this._queue[i].tid;transmitData.push(subRequest);this._queue[i].state=kijs.Rpc.states.TRANSMITTED;}}
if(transmitData.length>0){kijs.Ajax.request({method:'POST',headers:{'X-LIBRARY':'kijs'},postData:transmitData,url:this.url,parameters:this._parameters,fn:this._receive,context:this,timeout:this.timeout});}}
destruct(){if(this._deferId){clearTimeout(this._deferId);}
this._parameters=null;this._queue=null;}};kijs.Storage=class kijs_Storage{static getItem(key,mode='local',keyPrefix=true){let prefix=kijs.Storage._getPrefix(keyPrefix),storage=kijs.Storage._getStorage(mode);try{if(!storage){return false;}
let val=storage.getItem(prefix+key);if(val){val=JSON.parse(val);if(val&&kijs.isObject(val)&&val.value!==undefined){return val.value;}}
return null;}catch(e){return false;}}
static getKeys(mode='local',keyPrefix=true){let prefix=kijs.Storage._getPrefix(keyPrefix),storage=kijs.Storage._getStorage(mode);try{if(!storage||!storage.key){return false;}
let keys=[],i,k;for(i=0;i<storage.length;i++){k=storage.key(i);if(k&&k.substr(0,prefix.length)===prefix){keys.push(k.substr(prefix.length));}}
return keys;}catch(e){return false;}}
static removeAll(mode='local',keyPrefix=true){let keys=kijs.Storage.getKeys(mode,keyPrefix);if(keys===false){return false;}
for(let i=0;i<keys.length;i++){kijs.Storage.removeItem(keys[i],mode,keyPrefix);}
return true;}
static removeItem(key,mode='local',keyPrefix=true){let prefix=kijs.Storage._getPrefix(keyPrefix),storage=kijs.Storage._getStorage(mode);try{if(!storage){return false;}
storage.removeItem(prefix+key);}catch(e){return false;}}
static setItem(key,value,mode='local',keyPrefix=true){let prefix=kijs.Storage._getPrefix(keyPrefix),storage=kijs.Storage._getStorage(mode);try{if(!storage||!storage.setItem){return false;}
storage.setItem(prefix+key,JSON.stringify({value:value}));return true;}catch(e){return false;}}
static updateItem(key,value,mode='local',keyPrefix=true){if(!kijs.isObject(value)){return false;}
let oldValue=kijs.Storage.getItem(key,mode,keyPrefix);if(!kijs.isObject(oldValue)){oldValue={};}
for(let k in value){oldValue[k]=value[k];}
return kijs.Storage.setItem(key,oldValue,mode,keyPrefix);}
static _getStorage(mode){if(!kijs.Array.contains(['session','local'],mode)){throw new kijs.Error('invalid storage mode');}
return mode==='session'?window.sessionStorage:window.localStorage;}
static _getPrefix(pref){let prefix='kijs-';if(pref===true&&document.title){prefix+=document.title.toLowerCase().replace(/[^a-z0-9]/,'')+'-';}else if(kijs.isString(pref)&&pref){prefix+=pref+'-';}
return prefix;}};kijs.String=class kijs_String{static beginsWith(text,search){return text.indexOf(search)===0;}
static contains(text,search){return text.indexOf(search)>=0;}
static endsWith(text,search){return text.indexOf(search,text.length-search.length)!==-1;}
static htmlentities(html){return kijs.toString(html).replace(/[\u00A0-\u9999<>\&\'\"]/gim,function(i){return'&#x'+i.codePointAt(0).toString(16)+';';});}
static htmlentities_decode(html){return kijs.toString(html).replace(/&#(x[0-9a-f]+|[0-9]+)(;|$)/gim,function(entity,number){let nr=null;if(number.substr(0,1).toLowerCase()==='x'){nr=window.parseInt(number.substr(1),16);}else{nr=window.parseInt(number,10);}
if(kijs.isNumber(nr)){return String.fromCodePoint(nr);}else{return entity;}});}
static htmlspecialchars(text,doubleEncode=true){let replaces=[{f:'&',t:'&amp;'},{f:'"',t:'&quot;'},{f:'\'',t:'&apos;'},{f:'<',t:'&lt;'},{f:'>',t:'&gt;'}];if(!doubleEncode){kijs.Array.each(replaces,function(replace){text=kijs.String.replaceAll(text,replace.t,replace.f);},this);}
kijs.Array.each(replaces,function(replace){text=kijs.String.replaceAll(text,replace.f,replace.t);},this);return text;}
static padding(text,length,padString=' ',type='right'){length=length||0;text=kijs.toString(text);while(text.length<length){if(type==='left'||type==='both'){text=padString+text;}
if(!type||type==='right'||type==='both'){text=text+padString;}}
return text;}
static regexpEscape(text){return kijs.toString(text).replace(/[-\\^$*+?.()|[\]{}]/g,'\\$&');}
static repeat(text,multiplier){let response='';for(let i=0;i<multiplier;i++){response+=kijs.toString(text);}
return response;}
static replaceAll(text,search,replace){text=kijs.isEmpty(text)?'':text;search=kijs.isEmpty(search)?'':search;replace=kijs.isEmpty(replace)?'':replace;return text.split(search).join(replace);}
static trunc(text,length,useWordBoundary=false,postFixChar='…'){if(kijs.isEmpty(text)||!length||text.length<=length){return text;}
let subString=text.substr(0,length-1);if(useWordBoundary){subString=subString.substr(0,subString.lastIndexOf(' '));}
return subString+''+postFixChar;}
static wrap(text,length,useWordBoundary=true){if(useWordBoundary){return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`,'g'),'$1\n');}else{return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})`,'g'),'$1\n');}}};kijs.gui=class kijs_gui{static getClassFromXtype(xtype){const parts=xtype.split('.');let parent=window;for(let i=0;i<parts.length;i++){let part=parts[i];if(!parent[part]){console.log(part);return null;}
parent=parent[part];}
return parent;}};kijs.gui.LayerManager=class kijs_gui_LayerManager{constructor(){if(!kijs_gui_LayerManager._singletonInstance){kijs_gui_LayerManager._singletonInstance=this;this._parents=new Map();this._startZIndex=10000;}
return kijs_gui_LayerManager._singletonInstance;}
getActive(parentNode){const parentProp=this._parents.get(parentNode);if(parentProp&&parentProp.activeEl){return parentProp.activeEl;}else{return null;}}
setActive(el){if(el===this.getActive(el.parentNode)){return false;}
this.removeElement(el,true);this.addElement(el);this._assignZIndexes(el.parentNode);const parentProp=this._parents.get(el.parentNode);parentProp.activeEl=this._getTopVisibleElement(el.parentNode);if(parentProp.activeEl){parentProp.activeEl.focus();}
return true;}
addElement(el){let parentProp=this._parents.get(el.parentNode);if(!parentProp){parentProp={activeEl:null,stack:[]};this._parents.set(el.parentNode,parentProp);}
if(kijs.Array.contains(parentProp.stack,el)){throw new kijs.Error(`element is duplicated in layermanager`);}
parentProp.stack.push(el);el.on('destruct',this._onElementDestruct,this);el.on('changeVisibility',this._onElementChangeVisibility,this);}
removeElement(el,preventReorder){let changed=false;let parentProp=this._parents.get(el.parentNode);if(kijs.isEmpty(parentProp)||kijs.isEmpty(parentProp.stack)){return changed;}
const newElements=[];for(let i=0;i<parentProp.stack.length;i++){if(parentProp.stack[i]===el){changed=true;}else{newElements.push(parentProp.stack[i]);}}
parentProp.stack=newElements;if(parentProp.stack.length===0){this._parents.delete(el.parentNode);parentProp=null;}
el.off('destruct',this._onElementDestruct,this);el.off('changeVisibility',this._onElementChangeVisibility,this);if(parentProp&&changed&&!preventReorder){this._assignZIndexes(el.parentNode);parentProp.activeEl=this._getTopVisibleElement(el.parentNode);if(parentProp.activeEl){parentProp.activeEl.focus();}}
return changed;}
_assignZIndexes(parentNode){let zIndex=this._startZIndex;const parentProp=this._parents.get(parentNode);if(kijs.isEmpty(parentProp)||kijs.isEmpty(parentProp.stack)){return;}
kijs.Array.each(parentProp.stack,function(el){el.style.zIndex=zIndex;zIndex+=10;},this);}
_getTopVisibleElement(parentNode){const parentProp=this._parents.get(parentNode);if(kijs.isEmpty(parentProp)||kijs.isEmpty(parentProp.stack)){return;}
for(let i=parentProp.stack.length-1;i>=0;i--){if(parentProp.stack[i].visible){return parentProp.stack[i];}}
return null;}
_onElementDestruct(e){this.removeElement(e.element);}
_onElementChangeVisibility(e){const el=e.element;const parentProp=this._parents.get(el.parentNode);if(kijs.isEmpty(parentProp)||kijs.isEmpty(parentProp.stack)){return;}
parentProp.activeEl=this._getTopVisibleElement(el.parentNode);if(parentProp.activeEl){parentProp.activeEl.focus();}}
destruct(){for(var parentProp of this._parents.values()){kijs.Array.each(parentProp.stack,function(el){el.off(null,null,this);},this);}
this._parents.clear();this._parents=null;}};kijs.gui.MsgBox=class kijs_gui_MsgBox{static alert(caption,msg,fn,context){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,fn:fn,context:context,buttons:[{name:'ok',caption:kijs.getText('OK'),isDefault:true}]});}
static confirm(caption,msg,fn,context){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,fn:fn,context:context,icon:{iconChar:'&#xf059',style:{color:'#4398dd'}},buttons:[{name:'yes',caption:kijs.getText('Ja')},{name:'no',caption:kijs.getText('Nein')}]});}
static error(caption,msg,fn,context){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,fn:fn,context:context,icon:{iconChar:'&#xf06a',style:{color:'#be6280'}},buttons:[{name:'ok',caption:kijs.getText('OK'),isDefault:true}]});}
static info(caption,msg,fn,context){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,fn:fn,context:context,icon:{iconChar:'&#xf05a',style:{color:'#4398dd'}},buttons:[{name:'ok',caption:kijs.getText('OK'),isDefault:true}]});}
static prompt(caption,msg,label,value,fn,context){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,fieldXtype:'kijs.gui.field.Text',label:label,value:value,fn:fn,context:context,icon:{iconChar:'&#xf059',style:{color:'#4398dd'}},buttons:[{name:'ok',caption:kijs.getText('OK'),isDefault:true},{name:'cancel',caption:kijs.getText('Abbrechen')}]});}
static show(config){let btn='none';let value=null;const elements=[];const footerElements=[];if(config.icon){if(!(config.icon instanceof kijs.gui.Icon)){config.icon.xtype='kijs.gui.Icon';}
elements.push(config.icon);}
if(config.fieldXtype){elements.push({xtype:'kijs.gui.Container',htmlDisplayType:'html',cls:'kijs-msgbox-inner',elements:[{xtype:'kijs.gui.Element',html:config.msg,htmlDisplayType:'html',style:{marginBottom:'4px'}},{xtype:config.fieldXtype,name:'field',label:config.label,value:config.value,labelStyle:{marginRight:'4px'},on:{enterPress:function(e){if(config.fieldXtype){btn='ok';value=e.element.upX('kijs.gui.Window').down('field').value;e.element.upX('kijs.gui.Window').destruct();}},context:this}}]});}else{elements.push({xtype:'kijs.gui.Element',html:config.msg,htmlDisplayType:'html',cls:'kijs-msgbox-inner'});}
kijs.Array.each(config.buttons,function(button){if(!(button instanceof kijs.gui.Button)){button.xtype='kijs.gui.Button';if(!button.on){button.on={};}
if(!button.on.click){button.on.click=function(){btn=button.name;if(config.fieldXtype){value=this.upX('kijs.gui.Window').down('field').value;}
this.upX('kijs.gui.Window').destruct();};}}
footerElements.push(button);},this);const win=new kijs.gui.Window({caption:config.caption,iconChar:config.iconChar?config.iconChar:'',collapsible:false,resizable:false,maximizable:false,modal:true,cls:'kijs-msgbox',elements:elements,footerElements:footerElements});if(config.fn){win.on('destruct',function(e){e.btn=btn;e.value=value;config.fn.call(config.context,e);});}
win.show();}
static warning(caption,msg,fn,context){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,fn:fn,context:context,icon:{iconChar:'&#xf071',style:{color:'#ff9900'}},buttons:[{name:'ok',caption:kijs.getText('OK'),isDefault:true},{name:'cancel',caption:kijs.getText('Abbrechen')}]});}
static _convertArrayToHtml(messages){if(messages.length===1){return messages[0];}
let ret='<ul>';kijs.Array.each(messages,function(msg){ret+='<li>'+msg+'</li>';},this);ret+='</ul>';return ret;}};kijs.gui.field=class kijs_gui_field{};kijs.gui.grid=class kijs_gui_grid{};kijs.gui.grid.cell=class kijs_gui_grid_cell{};kijs.gui.grid.columnConfig=class kijs_gui_grid_columnConfig{};kijs.gui.grid.filter=class kijs_gui_grid_filter{};kijs.FileUpload=class kijs_FileUpload extends kijs.Observable{constructor(config={}){super(false);this._ajaxUrl='index.php';this._contentTypes=[];this._currentUploadIds=[];this._directory=false;this._dropZones=[];this._maxFilesize=null;this._multiple=true;this._sanitizeFilename=false;this._uploadId=1;this._uploadResponses={};this._filenameHeader='X-Filename';this._pathnameHeader='X-Filepath';this._validMediaTypes=['application','audio','example','image','message','model','multipart','text','video'];config=Object.assign({},{},config);this._configMap={ajaxUrl:true,directory:{target:'directory'},multiple:{target:'multiple'},filenameHeader:true,pathnameHeader:true,maxFilesize:true,sanitizeFilename:true,dropZones:{target:'dropZone'},contentTypes:{target:'contentTypes'}};if(kijs.isObject(config)){this.applyConfig(config,true);}}
get contentTypes(){return this._contentTypes;}
set contentTypes(val){if(!kijs.isArray(val)){val=[val];}
this._contentTypes=[];kijs.Array.each(val,function(contentType){let parts=contentType.toLowerCase().split('/',2);if(!kijs.Array.contains(this._validMediaTypes,parts[0])){throw new kijs.Error('invalid content type "'+contentType+'"');}
if(parts.length===1){parts.push('*');}
this._contentTypes.push(parts.join('/'));},this);}
get dropZones(){return this._dropZones;}
set dropZones(val){this.bindDropZones(val);}
get directory(){return this._directory;}
set directory(val){this._directory=!!val&&this._browserSupportsDirectoryUpload();}
get multiple(){return this._multiple;}
set multiple(val){this._multiple=!!val;}
bindDropZones(dropZones){if(!kijs.isArray(dropZones)){dropZones=[dropZones];}
kijs.Array.each(dropZones,function(dropZone){if(!(dropZone instanceof kijs.gui.DropZone)){throw new kijs.Error('added zone not of type kijs.gui.DropZone');}
if(!kijs.Array.contains(this._dropZones,dropZone)){dropZone.off(null,null,this);dropZone.on('drop',this._onDropZoneDrop,this);this._dropZones.push(dropZone);}},this);}
applyConfig(config={}){kijs.Object.assignConfig(this,config,this._configMap);}
showFileOpenDialog(multiple=null,directory=null){multiple=multiple===null?this._multiple:multiple;directory=directory===null?this._directory:directory;let input=document.createElement('input');input.setAttribute('type','file');if(multiple){input.setAttribute('multiple','multiple');}
if(directory){input.setAttribute('directory','directory');input.setAttribute('webkitdirectory','webkitdirectory');input.setAttribute('mozdirectory','mozdirectory');}
if(this._contentTypes.length>0){input.setAttribute('accept',this._contentTypes.join(','));}
kijs.Dom.addEventListener('change',input,function(e){if(e.nodeEvent.target&&e.nodeEvent.target.files){this._uploadFiles(e.nodeEvent.target.files);}},this);input.click();}
_browserSupportsDirectoryUpload(){let uploadEl=document.createElement('input'),support=false;uploadEl.setAttribute('type','file');uploadEl.setAttribute('multiple','multiple');if(kijs.isBoolean(uploadEl.webkitdirectory)||kijs.isBoolean(uploadEl.directory)){support=true;}
uploadEl=null;return support;}
_checkMime(mime){let match=false;if(mime&&this._contentTypes.length>0){mime=mime.toLowerCase();let mimeParts=mime.split('/',2);kijs.Array.each(this._contentTypes,function(contentType){if(mime===contentType||contentType===mimeParts[0]+'/*'){match=true;}},this);}
return match;}
_getFilename(filename){if(this._sanitizeFilename){filename=kijs.Char.replaceSpecialChars(filename);let filenameParts=filename.split('.'),extension='';if(filenameParts.length>1){extension=filenameParts.pop().replace(/[^a-zA-Z0-9]/g,'');}
filename=filenameParts.join('_').replace(/[^a-zA-Z0-9\-]/g,'_');if(extension){filename+='.'+extension;}}
return filename;}
_onDropZoneDrop(e){this._uploadFiles(e.nodeEvent.dataTransfer.files);}
_uploadFiles(fileList){this._uploadResponses={};if(fileList){for(let i=0;i<fileList.length;i++){if(this._checkMime(fileList[i].type)){this._uploadFile(fileList[i]);}else{this.raiseEvent('failUpload',this,this._getFilename(fileList[i].name),fileList[i].type);}}}}
_uploadFile(file){let uploadId=this._uploadId++,headers={},filename=this._getFilename(file.name),filedir=this._getRelativeDir(file.name,file.relativePath||file.webkitRelativePath),filetype=file.type||'application/octet-stream';headers[this._filenameHeader]=filename;headers[this._pathnameHeader]=filedir;headers['Content-Type']=filetype;kijs.Ajax.request({url:this._ajaxUrl,method:'POST',format:'json',headers:headers,postData:file,fn:this._onEndUpload,progressFn:this._onProgress,context:this,uploadId:uploadId});this._currentUploadIds.push(uploadId);this.raiseEvent('startUpload',this,filename,filedir,filetype,uploadId);}
_onEndUpload(val,config,error){kijs.Array.remove(this._currentUploadIds,config.uploadId);if(!val||!val.success){error=error||val.msg||kijs.getText('Es ist ein unbekannter Fehler aufgetreten')+'.';}
let uploadResponse=val?(val.upload||null):null;this._uploadResponses[config.uploadId]=uploadResponse;this.raiseEvent('upload',this,uploadResponse,error,config.uploadId);if(this._currentUploadIds.length===0){this.raiseEvent('endUpload',this,this._uploadResponses);}}
_onProgress(e,config){let percent=null;if(e.lengthComputable&&e.total>0){percent=Math.round(100/e.total*e.loaded);percent=Math.min(100,Math.max(0,percent));}
this.raiseEvent('progress',this,e,config.uploadId,percent);}
_getRelativeDir(name,path){if(path&&path.substr(path.length-name.length)===name){return path.substr(0,path.length-name.length-1);}
return'';}
destruct(){this._dropZones=null;this._contentTypes=null;super.destruct();}};kijs.gui.ApertureMask=class kijs_gui_ApertureMask extends kijs.Observable{constructor(config={}){super(false);this._targetEl=null;this._targetDom=null;this._animated=true;this._topDom=new kijs.gui.Dom({cls:['kijs-aperturemask','top']});this._rightDom=new kijs.gui.Dom({cls:['kijs-aperturemask','right']});this._leftDom=new kijs.gui.Dom({cls:['kijs-aperturemask','left']});this._bottomDom=new kijs.gui.Dom({cls:['kijs-aperturemask','bottom']});this._configMap={animated:true,cls:{fn:'function',target:this.clsAdd},target:{target:'target'}};if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
kijs.Dom.addEventListener('resize',window,this._onWindowResize,this);}
get isRendered(){return!!this._topDom.isRendered;}
get targetDom(){return this._targetDom;}
set target(val){if(this._targetEl){this._targetEl.off(null,null,this);}
if(val instanceof kijs.gui.Element){this._targetEl=val;this._targetDom=val.dom;this._targetEl.on('afterResize',this._onAfterResize,this);}else if(val instanceof kijs.gui.Dom){this._targetEl=null;this._targetDom=val;}else{throw new kijs.Error('invalid element for kijs.gui.ApertureMask target');}}
get visible(){return this.isRendered;}
set visible(val){if(val&&!this.visible){this.show();}else if(!val&&this.visible){this.hide();}}
applyConfig(config={}){kijs.Object.assignConfig(this,config,this._configMap);}
clsAdd(cls){this._topDom.clsAdd(cls);this._rightDom.clsAdd(cls);this._bottomDom.clsAdd(cls);this._leftDom.clsAdd(cls);}
hide(){this._topDom.style.opacity=0;this._rightDom.style.opacity=0;this._bottomDom.style.opacity=0;this._leftDom.style.opacity=0;if(this._animated){kijs.defer(function(){this.unrender();},200,this);}else{this.unrender();}}
render(){this._topDom.renderTo(document.body);this._rightDom.renderTo(document.body);this._bottomDom.renderTo(document.body);this._leftDom.renderTo(document.body);this.raiseEvent('afterRender');}
show(){this.updatePosition();this.render();if(this._animated){kijs.defer(function(){this._topDom.style.opacity=1;this._rightDom.style.opacity=1;this._bottomDom.style.opacity=1;this._leftDom.style.opacity=1;},10,this);}else{this._topDom.style.opacity=1;this._rightDom.style.opacity=1;this._bottomDom.style.opacity=1;this._leftDom.style.opacity=1;}}
updatePosition(){let node=this._targetDom&&this._targetDom.node?this._targetDom.node:null;let pos=node?kijs.Dom.getAbsolutePos(node):{x:0,y:0,w:0,h:0};this._topDom.style.left=pos.x+'px';this._topDom.style.height=pos.y+'px';this._topDom.style.width=pos.w+'px';this._rightDom.style.left=(pos.x+pos.w)+'px';this._bottomDom.style.left=pos.x+'px';this._bottomDom.style.top=(pos.y+pos.h)+'px';this._bottomDom.style.width=pos.w+'px';this._leftDom.style.width=pos.x+'px';}
_onAfterResize(){if(this.isRendered){this.updatePosition();}}
_onWindowResize(){if(this.isRendered){this.updatePosition();}}
unrender(superCall=false){if(!superCall){this.raiseEvent('unrender');}
this._topDom.unrender();this._rightDom.unrender();this._leftDom.unrender();this._bottomDom.unrender();}
destruct(superCall=false){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._targetEl){this._targetEl.off(null,null,this);}
this._targetEl=null;this._targetDom=null;kijs.Dom.removeEventListener('resize',window,this);if(this._topDom){this._topDom.destruct();}
if(this._rightDom){this._rightDom.destruct();}
if(this._leftDom){this._leftDom.destruct();}
if(this._bottomDom){this._bottomDom.destruct();}
this._topDom=null;this._rightDom=null;this._leftDom=null;this._bottomDom=null;super.destruct();}};kijs.gui.Dom=class kijs_gui_Dom extends kijs.Observable{constructor(config={}){super(false);this._cls=[];this._disableEnterBubbeling=false;this._disableEscBubbeling=false;this._html=undefined;this._htmlDisplayType='html',this._node=null;this._nodeEventListeners={};this._defaultConfig={};this._disabled=false;this._nodeAttribute={};this._left=undefined;this._top=undefined;this._width=undefined;this._height=undefined;this._nodeTagName='div';this._style={};this._toolTip=null;Object.assign(this._defaultConfig,{});this._configMap={cls:{fn:'function',target:this.clsAdd},disabled:true,disableEnterBubbeling:{target:'disableEnterBubbeling'},disableEscBubbeling:{target:'disableEscBubbeling'},eventMap:{fn:'assign'},html:true,htmlDisplayType:true,left:true,top:true,width:true,height:true,nodeAttribute:{fn:'assign'},nodeTagName:true,on:{fn:'assignListeners'},style:{fn:'assign'},toolTip:{target:'toolTip'}};this._eventMap={blur:{nodeEventName:'blur',useCapture:false},change:{nodeEventName:'change',useCapture:false},click:{nodeEventName:'click',useCapture:false},dblClick:{nodeEventName:'dblclick',useCapture:false},drag:{nodeEventName:'drag',useCapture:false},dragEnd:{nodeEventName:'dragend',useCapture:false},dragEnter:{nodeEventName:'dragenter',useCapture:false},dragExit:{nodeEventName:'dragexit',useCapture:false},dragLeave:{nodeEventName:'dragleave',useCapture:false},dragOver:{nodeEventName:'dragover',useCapture:false},dragStart:{nodeEventName:'dragstart',useCapture:false},drop:{nodeEventName:'drop',useCapture:false},focus:{nodeEventName:'focus',useCapture:false},mouseDown:{nodeEventName:'mousedown',useCapture:false},mouseEnter:{nodeEventName:'mouseenter',useCapture:false},mouseLeave:{nodeEventName:'mouseleave',useCapture:false},mouseMove:{nodeEventName:'mousemove',useCapture:false},mouseUp:{nodeEventName:'mouseup',useCapture:false},scroll:{nodeEventName:'scroll',useCapture:false},touchStart:{nodeEventName:'touchstart',useCapture:false},wheel:{nodeEventName:'wheel',useCapture:false},input:{nodeEventName:'input',useCapture:false},keyDown:{nodeEventName:'keydown',useCapture:false},keyUp:{nodeEventName:'keyup',useCapture:false},enterPress:{nodeEventName:'keydown',keys:[kijs.keys.ENTER],shiftKey:null,ctrlKey:null,altKey:null,usecapture:false},enterEscPress:{nodeEventName:'keydown',keys:[kijs.keys.ENTER,kijs.keys.ESC],shiftKey:null,ctrlKey:null,altKey:null,usecapture:false},escPress:{nodeEventName:'keydown',keys:[kijs.keys.ESC],shiftKey:null,ctrlKey:null,altKey:null,usecapture:false},spacePress:{nodeEventName:'keydown',keys:[kijs.keys.SPACE],shiftKey:null,ctrlKey:null,altKey:null,usecapture:false}};if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config);}}
get disabled(){if(this._node){return!!this._node.disabled;}else{return this._disabled;}}
set disabled(val){this._disabled=!!val;if(this._node){this._node.disabled=!!val;}
if(this._toolTip){this._toolTip.disabled=!!val;}}
get disableEnterBubbeling(){return this._disableEnterBubbeling;}
set disableEnterBubbeling(val){this._disableEnterBubbeling=val;if(val){this.on('enterPress',this._onKeyPressStopBubbeling,this);}else{this.off('enterPress',this._onKeyPressStopBubbeling,this);}}
get disableEscBubbeling(){return this._disableEscBubbeling;}
set disableEscBubbeling(val){this._disableEscBubbeling=val;if(val){this.on('escPress',this._onKeyPressStopBubbeling,this);}else{this.off('escPress',this._onKeyPressStopBubbeling,this);}}
get hasLeft(){if(this._node){return!kijs.isEmpty(this._node.style.left);}else{return!kijs.isEmpty(this._left);}}
get hasHeight(){if(this._node){return!kijs.isEmpty(this._node.style.height);}else{return!kijs.isEmpty(this._height);}}
get hasTop(){if(this._node){return!kijs.isEmpty(this._node.style.top);}else{return!kijs.isEmpty(this._top);}}
get hasWidth(){if(this._node){return!kijs.isEmpty(this._node.style.width);}else{return!kijs.isEmpty(this._width);}}
get height(){if(this._node){return this._node.offsetHeight;}else{return this._height;}}
set height(val){if(kijs.isEmpty(val)){val=null;}
if(val!==null&&!kijs.isNumeric(val)){throw new kijs.Error('set height(x). x must be numeric.');}
this._height=val;if(this._node){if(!kijs.isEmpty(val)){val+='px';}
this._node.style.height=val;}}
get html(){return this._html;}
set html(val){this._html=val;if(this._node){kijs.Dom.setInnerHtml(this._node,this._html,this._htmlDisplayType);}}
get htmlDisplayType(){return this._htmlDisplayType;}
set htmlDisplayType(val){this._htmlDisplayType=val;}
get isEmpty(){return kijs.isEmpty(this.html);}
get isRendered(){return!!this._node;}
get left(){if(this._node){return this._node.offsetLeft;}else{return this._left;}}
set left(val){if(kijs.isEmpty(val)){val=null;}
if(val!==null&&!kijs.isNumeric(val)){throw new kijs.Error('set left(x). x must be numeric.');}
this._left=val;if(this._node){if(!kijs.isEmpty(val)){val+='px';}
this._node.style.left=val;}}
get node(){return this._node;}
set node(val){this._node=val;}
get nodeTagName(){return this._nodeTagName;}
set nodeTagName(val){this._nodeTagName=val;if(!this._node){this._nodeTagName=val;}else if(this._node.tagName.toLowerCase()!==val){throw new kijs.Error(`Property "nodeTagName" can not be set. The node has allready been rendered.`);}}
get style(){if(this._node){return this._node.style;}else{return this._style;}}
set style(val){if(!this._node){this._style=val;}else{throw new kijs.Error(`Property "style" can not be set. The node has allready been rendered.`);}}
get toolTip(){return this._toolTip;}
set toolTip(val){if(kijs.isEmpty(val)){if(this._toolTip){this._toolTip.destruct();}
this._toolTip=null;}else if(val instanceof kijs.gui.ToolTip){this._toolTip=val;}else if(kijs.isObject(val)){if(this._toolTip){this._toolTip.applyConfig(val);}else{this._toolTip=new kijs.gui.ToolTip(val);}}else if(kijs.isArray(val)){if(val.length>1){let tmp='<ul>';kijs.Array.each(val,function(v){tmp+='<li>'+v+'</li>';},this);tmp+='</ul>';val=tmp;}else if(val.length===1){val=val[0];}else{val='';}
if(this._toolTip){this._toolTip.html=val;}else{this._toolTip=new kijs.gui.ToolTip({html:val});}}else if(kijs.isString(val)){if(this._toolTip){this._toolTip.html=val;}else{this._toolTip=new kijs.gui.ToolTip({html:val});}}else{throw new kijs.Error(`Unkown toolTip format`);}
if(this._toolTip){this._toolTip.target=this;}}
get top(){if(this._node){return this._node.offsetTop;}else{return this._top;}}
set top(val){if(kijs.isEmpty(val)){val=null;}
if(val!==null&&!kijs.isNumeric(val)){throw new kijs.Error('set top(x). x must be numeric.');}
this._top=val;if(this._node){if(!kijs.isEmpty(val)){val+='px';}
this._node.style.top=val;}}
get width(){if(this._node){return this._node.offsetWidth;}else{return this._width;}}
set width(val){if(kijs.isEmpty(val)){val=null;}
if(val!==null&&!kijs.isNumeric(val)){throw new kijs.Error('set width(x). x must be numeric.');}
this._width=val;if(this._node){if(!kijs.isEmpty(val)){val+='px';}
this._node.style.width=val;}}
alignToTarget(targetNode,targetPos,pos,allowSwapX,allowSwapY,offsetX,offsetY,swapOffset=true){targetPos=targetPos||'bl';pos=pos||'tl';if(targetNode instanceof kijs.gui.Element){targetNode=targetNode.dom;}
if(allowSwapX===undefined){allowSwapX=true;}
if(allowSwapY===undefined){allowSwapY=true;}
offsetX=offsetX||0;offsetY=offsetY||0;const swapOffsetFactor=swapOffset?-1:1;const b=kijs.Dom.getAbsolutePos(document.body);const e=kijs.Dom.getAbsolutePos(this._node);const t=kijs.Dom.getAbsolutePos(targetNode);let rect=kijs.Grafic.alignRectToRect(e,t,targetPos,pos,offsetX,offsetY);const overlap=kijs.Grafic.rectsOverlap(rect,b);let posSwap,targetPosSwap;let rectSwap,overlapSwap;let fit=true;let setHeight=false;let setWidth=false;if(!overlap.fitY){fit=false;if(allowSwapY){posSwap=null;if(pos.indexOf('t')!==-1&&targetPos.indexOf('b')!==-1){posSwap=pos.replace('t','b');targetPosSwap=targetPos.replace('b','t');}else if(pos.indexOf('b')!==-1&&targetPos.indexOf('t')!==-1){posSwap=pos.replace('b','t');targetPosSwap=targetPos.replace('t','b');}
if(posSwap){rectSwap=kijs.Grafic.alignRectToRect(e,t,targetPosSwap,posSwap,offsetX,offsetY*swapOffsetFactor);overlapSwap=kijs.Grafic.rectsOverlap(rectSwap,b);if(overlapSwap.fitY){rect=rectSwap;fit=true;}}}
if(!fit){if(rect.h>b.h){rect.h=b.h;setHeight=true;}
if(pos.indexOf('t')!==-1){rect.y=b.h-rect.h;}else{rect.y=0;}
fit=true;}}
if(!overlap.fitX){fit=false;if(allowSwapX){posSwap=null;if(pos.indexOf('l')!==-1&&targetPos.indexOf('r')!==-1){posSwap=pos.replace('l','r');targetPosSwap=targetPos.replace('r','l');}else if(pos.indexOf('r')!==-1&&targetPos.indexOf('l')!==-1){posSwap=pos.replace('r','l');targetPosSwap=targetPos.replace('l','r');}
if(posSwap){rectSwap=kijs.Grafic.alignRectToRect(e,t,targetPosSwap,posSwap,offsetX*swapOffsetFactor,offsetY);overlapSwap=kijs.Grafic.rectsOverlap(rectSwap,b);if(overlapSwap.fitX){rectSwap.y=rect.y;rect=rectSwap;fit=true;}}}
if(!fit){if(rect.w>b.w){rect.w=b.w;setWidth=true;}
if(pos.indexOf('l')!==-1){rect.x=b.w-rect.w;}else if(pos.indexOf('r')!==-1){rect.x=0;}
fit=true;}}
this.left=rect.x;this.top=rect.y;if(setWidth){this.width=rect.w;}
if(setHeight){this.height=rect.h;}
return{pos:posSwap?posSwap:pos,targetPos:targetPosSwap?targetPosSwap:targetPos};}
applyConfig(config={}){kijs.Object.assignConfig(this,config,this._configMap);}
clsAdd(cls){if(!cls){return;}
if(!kijs.isArray(cls)){cls=cls.split(' ');}
this._cls=kijs.Array.concatUnique(this._cls,cls);this._clsApply();}
clsHas(cls){return kijs.Array.contains(this._cls,cls);}
clsRemove(cls){if(!cls){return;}
if(!kijs.isArray(cls)){cls=cls.split(' ');}
kijs.Array.removeMultiple(this._cls,cls);this._clsApply();}
clsRemoveAll(){this._cls=[];this._clsApply();}
clsToggle(cls){if(!cls){return;}
const newCls=[];if(!kijs.isArray(cls)){cls=cls.split(' ');}
kijs.Array.each(this._cls,function(cl){if(kijs.Array.contains(cls,cl)){kijs.Array.remove(cls,cl);}else{newCls.push(cl);}},this);if(cls){this._cls=newCls.concat(cls);}
this._clsApply();}
focus(alsoSetIfNoTabIndex=false){if(this._node){if(alsoSetIfNoTabIndex){this._node.focus();return this._node;}else{const node=kijs.Dom.getFirstFocusableNode(this._node);if(node){node.focus();}
return node;}}else{return false;}}
nodeAttributeGet(name){if(kijs.isEmpty(name)){return null;}
if(this._node){return this._node[name];}else{if(this._nodeAttribute.hasOwnProperty(name)){return this._nodeAttribute[name];}else{return null;}}}
nodeAttributeSet(name,value){if(kijs.isEmpty(name)){return;}
if(kijs.isEmpty(value)){if(this._nodeAttribute.hasOwnProperty(name)){delete this._nodeAttribute[name];}}else{this._nodeAttribute[name]=value;}
if(this._node){this._node[name]=value;if(kijs.isEmpty(value)){this._node.removeAttribute(name);}}}
nodeAttributeHas(name){if(this._node){return kijs.isEmpty(this._nodeAttribute[name]);}else{return!!this._nodeAttribute.hasOwnProperty(name);}}
on(names,callback,context){const eventsCountBefore=Object.keys(this._events).length;super.on(names,callback,context);const eventsCountAfter=Object.keys(this._events).length;if(this._node&&eventsCountAfter-eventsCountBefore){this._nodeEventListenersAppy();}}
off(names,callback,context){const eventsCountBefore=Object.keys(this._events).length;super.off(names,callback,context);const eventsCountAfter=Object.keys(this._events).length;if(this._node&&eventsCountAfter-eventsCountBefore){this._nodeEventListenersAppy();}}
raiseEvent(name,e={}){Object.assign(e,{dom:this,eventName:name});return super.raiseEvent(name,e);}
render(){if(!this._node){this._node=document.createElement(this._nodeTagName);if(!kijs.isEmpty(this._style)){Object.assign(this._node.style,this._style);}
if(!kijs.isEmpty(this._width)){this.width=this._width;}
if(!kijs.isEmpty(this._height)){this.height=this._height;}
if(!kijs.isEmpty(this._top)){this.top=this._top;}
if(!kijs.isEmpty(this._left)){this.left=this._left;}
this._nodeAttributeApply();this.disabled=this._disabled;}
if(kijs.isDefined(this._html)){kijs.Dom.setInnerHtml(this._node,this._html,this._htmlDisplayType);}
this._clsApply();this._nodeEventListenersAppy();}
renderTo(targetNode,insert,insertPosition='before'){const firstRender=!this.isRendered;this.render();if(insert){if(insertPosition==='before'){targetNode.insertBefore(this._node,insert);}else if(insertPosition==='after'){targetNode.insertBefore(this._node,insert.nextSibling);}else{throw new kijs.Error('invalid insert position for renderTo');}}else{targetNode.appendChild(this._node);}}
scrollIntoView(){this._node.scrollIntoView();}
unrender(){if(this._node){if(!kijs.isEmpty(this._nodeEventListeners)){kijs.Dom.removeAllEventListenersFromContext(this);}
kijs.Dom.removeAllChildNodes(this._node);if(this._node!==document.body&&this._node.parentNode){this._node.parentNode.removeChild(this._node);}}
this._node=null;if(this._toolTip){this._toolTip.unrender();}}
_clsApply(){if(this._node&&(this._node.className||!kijs.isEmpty(this._cls))){this._node.className=this._cls?this._cls.join(' '):'';}}
_nodeAttributeApply(){kijs.Object.each(this._nodeAttribute,function(name,value){this._node[name]=value;if(kijs.isEmpty(value)){this._node.removeAttribute(name);}},this);}
_nodeEventListenersAppy(){const kijsEvents=Object.keys(this._events);if(!kijs.isEmpty(this._nodeEventListeners)){kijs.Dom.removeAllEventListenersFromContext(this);}
kijs.Array.each(kijsEvents,function(kijsEvent){if(this._eventMap[kijsEvent]){const nodeEventName=this._eventMap[kijsEvent].nodeEventName;const useCapture=!!this._eventMap[kijsEvent].useCapture;if(!kijs.Dom.hasEventListener(nodeEventName,this._node,this,useCapture)){kijs.Dom.addEventListener(nodeEventName,this._node,this._onNodeEvent,this,useCapture);}}else{throw new kijs.Error(`kijsEvent "${kijsEvent}" is not mapped`);}},this);}
_onKeyPressStopBubbeling(e){e.nodeEvent.stopPropagation();}
_onNodeEvent(e){let ret=true;kijs.Object.each(this._eventMap,function(eventName,val){if(val.nodeEventName!==e.nodeEventName||!!val.useCapture!==!!e.useCapture){return;}
if(!kijs.isEmpty(val.keys)){const keys=kijs.isArray(val.keys)?val.keys:[val.keys];if(!kijs.Array.contains(keys,e.nodeEvent.keyCode)){return;}}
if(!kijs.isEmpty(val.shiftKey)){if(!!val.shiftKey!==!!e.nodeEvent.shiftKey){return;}}
if(!kijs.isEmpty(val.ctrlKey)){if(!!val.ctrlKey!==!!e.nodeEvent.ctrlKey){return;}}
if(!kijs.isEmpty(val.altKey)){if(!!val.altKey!==!!e.nodeEvent.altKey){return;}}
e.dom=this;e.eventName=eventName;if(this.raiseEvent(eventName,e)===false){ret=false;}},this);return ret;}
destruct(){this.unrender();if(this._toolTip){this._toolTip.destruct();}
this._cls=null;this._configMap=null;this._eventMap=null;this._node=null;this._nodeAttribute=null;this._nodeEventListeners=null;this._style=null;this._toolTip=null;super.destruct();}};kijs.gui.Element=class kijs_gui_Element extends kijs.Observable{constructor(config={}){super(false);this._afterResizeDeferHandle=null;this._afterResizeDelay=300;this._dom=new kijs.gui.Dom();this._name=null;this._parentEl=null;this._visible=true;this._lastSize=null;this._waitMaskEl=null;this._waitMaskCount=0;this._waitMaskTargetDomProperty='dom';this._preventAfterResize=false;this._defaultConfig={};this._eventForwards={};Object.assign(this._defaultConfig,{});this._configMap={afterResizeDelay:true,cls:{fn:'function',target:this._dom.clsAdd,context:this._dom},disableEnterBubbeling:{target:'disableEnterBubbeling',context:this._dom},disableEscBubbeling:{target:'disableEscBubbeling',context:this._dom},nodeTagName:{target:'nodeTagName',context:this._dom},defaults:{fn:'manual'},height:{target:'height'},html:{target:'html',context:this._dom},htmlDisplayType:{target:'htmlDisplayType',context:this._dom},left:{target:'left'},name:true,nodeAttribute:{target:'nodeAttribute',context:this._dom},on:{fn:'assignListeners'},parent:{target:'parent'},style:{fn:'assign',target:'style',context:this._dom},toolTip:{target:'toolTip'},top:{target:'top'},visible:true,displayWaitMask:{target:'displayWaitMask'},waitMaskTargetDomProperty:{target:'waitMaskTargetDomProperty'},width:{target:'width'},xtype:{fn:'manual'}};this._eventForwardsAdd('click',this._dom);this._eventForwardsAdd('dblClick',this._dom);this._eventForwardsAdd('drag',this._dom);this._eventForwardsAdd('dragOver',this._dom);this._eventForwardsAdd('dragStart',this._dom);this._eventForwardsAdd('dragLeave',this._dom);this._eventForwardsAdd('dragEnd',this._dom);this._eventForwardsAdd('drop',this._dom);this._eventForwardsAdd('focus',this._dom);this._eventForwardsAdd('mouseDown',this._dom);this._eventForwardsAdd('mouseEnter',this._dom);this._eventForwardsAdd('mouseLeave',this._dom);this._eventForwardsAdd('mouseMove',this._dom);this._eventForwardsAdd('mouseUp',this._dom);this._eventForwardsAdd('touchStart',this._dom);this._eventForwardsAdd('wheel',this._dom);this._eventForwardsAdd('keyDown',this._dom);this._eventForwardsAdd('keyUp',this._dom);this._eventForwardsAdd('keyPress',this._dom);this._eventForwardsAdd('enterPress',this._dom);this._eventForwardsAdd('enterEscPress',this._dom);this._eventForwardsAdd('escPress',this._dom);this._eventForwardsAdd('spacePress',this._dom);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get afterResizeDelay(){return this._afterResizeDelay;}
set afterResizeDelay(val){this._afterResizeDelay=val;}
get displayWaitMask(){return!kijs.isEmpty(this._waitMaskEl);}
set displayWaitMask(val){if(val){if(kijs.isEmpty(this._waitMaskEl)){this._waitMaskEl=new kijs.gui.Mask({displayWaitIcon:true,target:this,targetDomProperty:this._waitMaskTargetDomProperty});this._waitMaskCount=1;if(this.isRendered){this._waitMaskEl.show();}}}else{if(!kijs.isEmpty(this._waitMaskEl)){this._waitMaskEl.destruct();this._waitMaskEl=null;this._waitMaskCount=0;}}}
get dom(){return this._dom;}
get isRendered(){return!!this._dom.isRendered;}
get node(){return this._dom.node;}
get nodeTagName(){return this._dom.nodeTagName;}
get height(){return this._dom.height;}
set height(val){this._dom.height=val;if(this._hasSizeChanged(val)){this._raiseAfterResizeEvent(true);}}
get html(){return this._dom.html;}
set html(val){this._dom.html=val;}
get htmlDisplayType(){return this._dom.htmlDisplayType;}
set htmlDisplayType(val){this._dom.htmlDisplayType=val;}
get isEmpty(){return this._dom.isEmpty;}
get left(){return this._dom.left;}
set left(val){this._dom.left=val;}
get lowerElement(){if(!this._parentEl||!this._parentEl.elements||kijs.isEmpty(this.top)){return null;}
let curTop=null,lowerEl=null;kijs.Array.each(this._parentEl.elements,function(el){if(!kijs.isEmpty(el.top)&&el.left===this.left&&el!==this){if(el.top>this.top&&(curTop===null||el.top<curTop)){lowerEl=el;curTop=el.top;}}},this);return lowerEl;}
get name(){return this._name;}
set name(val){this._name=val;}
get next(){if(!this._parentEl||!this._parentEl.elements){return null;}
let index=-1;for(let i=0;i<this._parentEl.elements.length;i++){if(this._parentEl.elements[i]===this){index=i+1;break;}}
if(index>-1&&this._parentEl.elements[index]){return this._parentEl.elements[index];}else{return null;}}
get parent(){return this._parentEl;}
set parent(val){if(val!==this._parentEl){if(this._parentEl){this._parentEl.off('afterResize',this._onParentAfterResize,this);this._parentEl.off('childElementAfterResize',this._onParentChildElementAfterResize,this);}
this._parentEl=val;this._parentEl.on('afterResize',this._onParentAfterResize,this);this._parentEl.on('childElementAfterResize',this._onParentChildElementAfterResize,this);this.applyConfig();}}
get previous(){if(!this._parentEl||!this._parentEl.elements){return null;}
let index=-1;for(let i=0;i<this._parentEl.elements.length;i++){if(this._parentEl.elements[i]===this){index=i-1;break;}}
if(index>-1&&this._parentEl.elements[index]){return this._parentEl.elements[index];}else{return null;}}
get style(){return this._dom.style;}
get toolTip(){return this._dom.toolTip;}
set toolTip(val){this._dom.toolTip=val;};get top(){return this._dom.top;}
set top(val){this._dom.top=val;}
get upperElement(){if(!this._parentEl||!this._parentEl.elements||kijs.isEmpty(this.top)){return null;}
let curTop=null,upperEl=null;kijs.Array.each(this._parentEl.elements,function(el){if(!kijs.isEmpty(el.top)&&el.left===this.left&&el!==this){if(el.top<this.top&&(curTop===null||el.top>curTop)){upperEl=el;curTop=el.top;}}},this);return upperEl;}
get visible(){return this._visible;}
set visible(val){const changed=!!this._visible!==!!val;this._visible=!!val;if(this._visible){this._dom.clsRemove('kijs-hidden');}else{this._dom.clsAdd('kijs-hidden');}
if(changed){this.raiseEvent('changeVisibility',{visible:this._visible});}}
get waitMaskTargetDomProperty(){return this._waitMaskTargetDomProperty;}
set waitMaskTargetDomProperty(val){this._waitMaskTargetDomProperty=val;if(!kijs.isEmpty(this._waitMaskEl)){this._waitMaskEl.targetDomProperty=val;}}
get width(){return this._dom.width;}
set width(val){this._dom.width=val;if(this._hasSizeChanged(null,val)){this._raiseAfterResizeEvent(true);}}
get xtype(){if(kijs.isString(this.constructor.name)&&!kijs.isEmpty(this.constructor.name)){return this.constructor.name.replace(/_/g,'.');}else{const proto=this;if(!proto.__xtype){let results=/\s*class\s([a-zA-Z0-9_]+)(\sextends\s[a-zA-Z0-9_.]+)?\s*{/.exec(this.constructor.toString());if(results&&results.length>0){proto.__xtype=results[1].trim().replace(/_/g,'.');}}
if(!proto.__xtype){let results=/\s*function\s([a-zA-Z0-9_]+)\s*\(/.exec(this.constructor.toString());if(results&&results.length>0){proto.__xtype=results[1].trim().replace(/_/g,'.');}}
if(proto.__xtype){return proto.__xtype;}else{throw new kijs.Error(`xtype can not be determined`);}}}
applyConfig(config={},preventEvents=false){const prevAfterRes=this._preventAfterResize;if(preventEvents){this._preventAfterResize=true;}
kijs.Object.assignConfig(this,config,this._configMap);if(preventEvents){this._preventAfterResize=prevAfterRes;}
Object.seal(this);}
focus(alsoSetIfNoTabIndex=false){return this._dom.focus(alsoSetIfNoTabIndex);}
on(names,callback,context){names=kijs.isArray(names)?names:[names];kijs.Array.each(names,function(name){if(this._eventForwards[name]){kijs.Array.each(this._eventForwards[name],function(forward){forward.target.on(forward.targetEventName,this._onForwardEvent,this);},this);}},this);super.on(names,callback,context);}
raiseEvent(name,e={}){Object.assign(e,{element:this,eventName:name});if(kijs.isEmpty(e.raiseElement)){e.raiseElement=this;}
return super.raiseEvent(name,e);}
render(superCall){this._dom.render();if(kijs.isDefined(this._visible)){this.visible=this._visible;}
if(this._waitMaskEl){kijs.defer(function(){if(this._waitMaskEl){this._waitMaskEl.show();}},300,this);}
if(!superCall){this.raiseEvent('afterRender');}}
renderTo(targetNode,insert,insertPosition='before'){const firstRender=!this.isRendered;this.render();if(insert){if(insertPosition==='before'){targetNode.insertBefore(this._dom.node,insert);}else if(insertPosition==='after'){targetNode.insertBefore(this._dom.node,insert.nextSibling);}else{throw new kijs.Error('invalid insert position for renderTo');}}else{targetNode.appendChild(this._dom.node);}
if(firstRender){this.raiseEvent('afterFirstRenderTo');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._dom.unrender();}
up(name){if(!kijs.isEmpty(name)&&this.parent){if(this.parent.name===name){return this.parent;}else if(this.parent.up){return this.parent.up(name);}}
return null;}
upX(xtype){if(!kijs.isEmpty(xtype)&&this.parent){if(this.parent.xtype===xtype){return this.parent;}else if(this.parent.upX){return this.parent.upX(xtype);}}
return null;}
waitMaskAdd(){this._waitMaskCount++;if(!this._waitMaskEl){this.displayWaitMask=true;}
return this._waitMaskEl;}
waitMaskRemove(){if(this._waitMaskEl&&this._waitMaskCount){this._waitMaskCount--;if(this._waitMaskCount<=0){this.displayWaitMask=false;}}}
_eventForwardsAdd(eventName,target,targetEventName){if(!targetEventName){targetEventName=eventName;}
if(!this._eventForwardsHas(eventName,target,targetEventName)){this._eventForwards[eventName]=this._eventForwards[eventName]||[];const forward={target:target,targetEventName:targetEventName};this._eventForwards[eventName].push(forward);}}
_eventForwardsHas(eventName,target,targetEventName){if(!targetEventName){targetEventName=eventName;}
let ret=false;if(!kijs.isEmpty(this._eventForwards[eventName])){kijs.Array.each(this._eventForwards[eventName],function(forward){if(forward.target===target&&forward.targetEventName===targetEventName){ret=true;return;}},this);}
return ret;}
_eventForwardsRemove(eventName,target,targetEventName){if(!targetEventName){targetEventName=eventName;}
let forwardToDelete=null;if(!kijs.isEmpty(this._eventForwards[eventName])){kijs.Array.each(this._eventForwards[eventName],function(forward){if(forward.target===target&&forward.targetEventName===targetEventName){forwardToDelete=forward;return;}},this);}
if(forwardToDelete){kijs.Array.remove(this._eventForwards[eventName],forwardToDelete);}}
_hasSizeChanged(height=null,width=null){if(!kijs.isObject(this._lastSize)){return true;}
if(height===null){height=this.height;}
if(width===null){width=this.width;}
if(height!==this._lastSize.h||width!==this._lastSize.w){return true;}
return false;}
_raiseAfterResizeEvent(useDelay=false,e={}){if(this._preventAfterResize){return;}
if(useDelay){if(this._afterResizeDeferHandle){window.clearTimeout(this._afterResizeDeferHandle);}
this._afterResizeDeferHandle=kijs.defer(function(){this._afterResizeDeferHandle=null;if(this._hasSizeChanged()){this._lastSize={h:this.height,w:this.width};this.raiseEvent('afterResize',e);}},this._afterResizeDelay,this);}else{if(this._hasSizeChanged()){this._lastSize={h:this.height,w:this.width};this.raiseEvent('afterResize',e);}}}
_onForwardEvent(e){let ret=true;kijs.Object.each(this._eventForwards,function(eventName,forwards){kijs.Array.each(forwards,function(forward){const eventContextProperty=forward.target instanceof kijs.gui.Dom?'context':'element';if(forward.target===e[eventContextProperty]&&forward.targetEventName===e.eventName){e.element=this;if(this.raiseEvent(eventName,e)===false){ret=false;}}},this);},this);return ret;}
_onParentAfterResize(e){this._raiseAfterResizeEvent(false,e);}
_onParentChildElementAfterResize(e){this._raiseAfterResizeEvent(false,e);}
destruct(superCall){this._preventAfterResize=true;if(this._afterResizeDeferHandle){window.clearTimeout(this._afterResizeDeferHandle);}
if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._parentEl){this._parentEl.off(null,null,this);}
if(this._dom){this._dom.destruct();}
if(this._waitMaskEl){this._waitMaskEl.destruct;}
this._afterResizeDeferHandle=null;this._dom=null;this._parentEl=null;this._eventForwards=null;this._configMap=null;this._lastSize=null;this._waitMaskEl=null;super.destruct();}};kijs.gui.Rpc=class kijs_gui_Rpc extends kijs.Rpc{do(facadeFn,data,fn,context,cancelRunningRpcs,waitMaskTarget,waitMaskTargetDomProperty='dom',ignoreWarnings,fnBeforeMessages){let waitMask;if(waitMaskTarget==='none'){waitMask=null;}else if(waitMaskTarget instanceof kijs.gui.Element){waitMask=waitMaskTarget.waitMaskAdd();}else{waitMask=new kijs.gui.Mask({displayWaitIcon:true,target:waitMaskTarget,targetDomProperty:waitMaskTargetDomProperty});waitMask.show();}
super.do(facadeFn,data,function(response,request){if(request.responseArgs&&request.responseArgs.waitMask){if(request.responseArgs.waitMask.target instanceof kijs.gui.Element){request.responseArgs.waitMask.target.waitMaskRemove();}else{request.responseArgs.waitMask.destruct();}}
if(!response.canceled){if(fnBeforeMessages&&kijs.isFunction(fnBeforeMessages)){fnBeforeMessages.call(context||this,response||null);}
if(response.errorMsg){let err=this._getMsg(response.errorMsg,kijs.getText('Fehler'));kijs.gui.MsgBox.error(err.title,err.msg);if(response.errorMsg.cancelCb!==false){return;}}
if(response.warningMsg){let warn=this._getMsg(response.warningMsg,kijs.getText('Warnung'));kijs.gui.MsgBox.warning(warn.title,warn.msg,function(e){if(e.btn==='ok'){this.do(facadeFn,data,fn,context,cancelRunningRpcs,waitMaskTarget,waitMaskTargetDomProperty,true);}},this);return;}
if(response.infoMsg){let info=this._getMsg(response.infoMsg,kijs.getText('Info'));kijs.gui.MsgBox.info(info.title,info.msg);}
if(response.cornerTipMsg){let info=this._getMsg(response.cornerTipMsg,kijs.getText('Info'));kijs.gui.CornerTipContainer.show(info.title,info.msg,'info');}
if(fn&&kijs.isFunction(fn)){fn.call(context||this,response.responseData||null);}}},this,cancelRunningRpcs,{ignoreWarnings:!!ignoreWarnings},{waitMask:waitMask});}
_getMsg(msg,defaultTitle){let returnMsg={msg:'',title:''};if(kijs.isString(msg)||kijs.isArray(msg)){returnMsg.msg=msg;returnMsg.title=defaultTitle;}else if(kijs.isObject(msg)){returnMsg.msg=msg.msg;returnMsg.title=msg.title?msg.title:defaultTitle;}
return returnMsg;}};kijs.gui.ToolTip=class kijs_gui_ToolTip extends kijs.Observable{constructor(config={}){super(false);this._disabled=false;this._dom=new kijs.gui.Dom();this._followPointer=false;this._offsetX=10;this._offsetY=10;this._target=null;this._defaultConfig={};Object.assign(this._defaultConfig,{});this._configMap={cls:{fn:'function',target:this._dom.clsAdd,context:this._dom},disabled:true,followPointer:true,html:{target:'html',context:this._dom},htmlDisplayType:{target:'htmlDisplayType',context:this._dom},offsetX:true,offsetY:true,on:{fn:'assignListeners'},target:{target:'target'},style:{fn:'assign',target:'style',context:this._dom}};this._dom.clsAdd('kijs-tooltip');if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config);}}
get disabled(){return this._disabled;}
set disabled(val){this._disabled=!!val;if(this._disabled){this.hide();}}
get dom(){return this._dom;}
get html(){return this._dom.html;}
set html(val){this._dom.html=val;}
get isEmpty(){return this._dom.isEmpty;}
get target(){return this._target;}
set target(val){if(this._target!==val){this._target=val;this._bindEventsToTarget();}}
applyConfig(config={}){kijs.Object.assignConfig(this,config,this._configMap);}
hide(){this.unrender();}
render(superCall){this._dom.render();if(!superCall){this.raiseEvent('afterRender');}}
show(x,y){let updatePos=false;if(!this._dom.node){this.render();}
if(this._dom.node.parentNode!==document.body){document.body.appendChild(this._dom.node);kijs.Dom.addEventListener('mousemove',document.body,this._onMouseMoveOnBody,this);updatePos=true;}
if(this._followPointer){updatePos=true;}
if(updatePos&&kijs.isDefined(x)){if(this._offsetX){x+=this._offsetX;}
if(x+this._dom.node.offsetWidth>window.innerWidth){x=Math.abs(window.innerWidth-this._dom.node.offsetWidth-5);}
this._dom.style.left=x+'px';}
if(updatePos&&kijs.isDefined(y)){if(this._offsetY){y+=this._offsetY;}
if(y+this._dom.node.offsetHeight>window.innerHeight){y=Math.abs(window.innerHeight-this._dom.node.offsetHeight-5);}
this._dom.style.top=y+'px';}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
kijs.Dom.removeEventListener('mousemove',document.body,this);this._dom.unrender();}
_bindEventsToTarget(){this._target.on('mouseMove',this._onMouseMoveTarget,this);this._target.on('mouseLeave',this._onMouseLeave,this);}
_onMouseMoveOnBody(e){if(this._target){let mouseX=e.nodeEvent.clientX,mouseY=e.nodeEvent.clientY;let top=kijs.Dom.getAbsolutePos(this._target.node).y,left=kijs.Dom.getAbsolutePos(this._target.node).x,width=this._target.width,height=this._target.height;if(width&&height){if(mouseX<left||mouseX>left+width||mouseY<top||mouseY>top+height){this.hide();}}else{this.hide();}}else{this.hide();}}
_onMouseMoveTarget(e){if(!this.disabled){this.show(e.nodeEvent.clientX,e.nodeEvent.clientY);}}
_onMouseLeave(e){this.hide();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._target){this._target.off(null,null,this);}
if(this._dom){this._dom.destruct();}
this._dom=null;this._target=null;super.destruct(true);}};kijs.gui.grid.columnConfig.ColumnConfig=class kijs_gui_grid_columnConfig_ColumnConfig extends kijs.Observable{constructor(config={}){super(false);if(kijs.isObject(config)){throw new kijs.Error('do not create a instance of kijs.gui.grid.columnConfig.ColumnConfig directly');}
this._caption='';this._editable=false;this._visible=true;this._hideable=true;this._resizable=true;this._sortable=true;this._valueField='';this._width=100;this._cellXtype=null;this._filterXtype=null;this._headerCellXtype=null;this._cellConfig=null;this._filterConfig=null;this._defaultConfig={};this._grid=null;Object.assign(this._defaultConfig,{});this._configMap={grid:true,cellXtype:true,filterXtype:true,headerCellXtype:true,caption:{target:'caption'},editable:true,visible:true,hideable:true,resizable:true,sortable:true,valueField:true,width:true,cellConfig:{target:'cellConfig'},filterConfig:{target:'filterConfig'}};if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
if(this._cellConfig===null){this.cellConfig=this._cellXtype;}
if(this.filterConfig===null){this.filterConfig=this._filterXtype;}}
get caption(){return this._caption;}
set caption(val){this._caption=val;this.raiseEvent('change',{columnConfig:this,caption:val});}
get cellConfig(){let cCnf=this._cellConfig?kijs.Object.clone(this._cellConfig):{};cCnf.columnConfig=this;if(!cCnf.xtype){cCnf.xtype=this._cellXtype;}
return cCnf;}
set cellConfig(val){if(kijs.isString(val)){this._cellConfig={xtype:val};}else if(kijs.isObject(val)){this._cellConfig=val;}}
get editable(){return this._editable;}
set editable(val){this._editable=!!val;this.raiseEvent('change',{columnConfig:this,editable:!!val});}
get filterConfig(){let cCnf=this._filterConfig||{xtype:this._filterXtype};cCnf.columnConfig=this;return cCnf;}
set filterConfig(val){if(kijs.isString(val)){this._filterConfig={xtype:val};}else if(kijs.isObject(val)){this._filterConfig=val;if(!this._filterConfig.xtype){this._filterConfig.xtype=this._cellXtype;}
this._filterConfig.columnConfig=this;}}
get grid(){return this._grid;}
set grid(val){this._grid=val;}
get visible(){return this._visible;}
set visible(val){if(!val&&!this.hideable){return;}
this._visible=!!val;this.raiseEvent('change',{columnConfig:this,visible:!!val});}
get hideable(){return this._hideable;}
set hideable(val){this._hideable=!!val;this.raiseEvent('change',{columnConfig:this,hideable:!!val});}
get position(){if(this._grid){return this._grid.columnConfigs.indexOf(this);}
return false;}
set position(val){if(this._grid){let curPos=this.position;if(!kijs.isInteger(val)){throw new kijs.Error('invalid position value');}
if(val!==curPos){kijs.Array.move(this._grid.columnConfigs,curPos,val);this.raiseEvent('change',{columnConfig:this,position:this.position});}}}
get resizable(){return this._resizable;}
set resizable(val){this._resizable=!!val;this.raiseEvent('change',{columnConfig:this,resizable:!!val});}
get sortable(){return this._sortable;}
set sortable(val){this._sortable=!!val;this.raiseEvent('change',{columnConfig:this,sortable:!!val});}
get valueField(){return this._valueField;}
get width(){return this._width;}
set width(val){if(!kijs.isNumeric(val)){throw new kijs.Error('invalid width value for columnConfig');}
this._width=val;this.raiseEvent('change',{columnConfig:this,width:val});}
applyConfig(config={},preventEvents=false){const prevAfterRes=this._preventAfterResize;if(preventEvents){this._preventAfterResize=true;}
kijs.Object.assignConfig(this,config,this._configMap);if(preventEvents){this._preventAfterResize=prevAfterRes;}}};kijs.gui.Button=class kijs_gui_Button extends kijs.gui.Element{constructor(config={}){super(false);this._captionDom=new kijs.gui.Dom({cls:'kijs-caption',nodeTagName:'span'});this._iconEl=new kijs.gui.Icon({parent:this});this._icon2El=new kijs.gui.Icon({parent:this,cls:'kijs-icon2'});this._badgeDom=new kijs.gui.Dom({cls:'kijs-badge',nodeTagName:'span'});this._dom.nodeTagName='button';this._dom.nodeAttributeSet('type','button');this._dom.clsAdd('kijs-button');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{badgeText:{target:'html',context:this._badgeDom},badgeCls:{fn:'function',target:this._badgeDom.clsAdd,context:this._badgeDom},badgeTextHtmlDisplayType:{target:'htmlDisplayType',context:this._badgeDom},badgeStyle:{fn:'assign',target:'style',context:this._badgeDom},caption:{target:'html',context:this._captionDom},captionCls:{fn:'function',target:this._captionDom.clsAdd,context:this._captionDom},captionHtmlDisplayType:{target:'htmlDisplayType',context:this._captionDom},captionStyle:{fn:'assign',target:'style',context:this._captionDom},icon:{target:'icon'},iconChar:{target:'iconChar',context:this._iconEl},iconCls:{target:'iconCls',context:this._iconEl},iconColor:{target:'iconColor',context:this._iconEl},icon2:{target:'icon2'},icon2Char:{target:'iconChar',context:this._icon2El},icon2Cls:{target:'iconCls',context:this._icon2El},icon2Color:{target:'iconColor',context:this._icon2El},isDefault:{target:'isDefault'},disabled:{prio:100,target:'disabled'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get badgeText(){return this._badgeDom.html;}
set badgeText(val){this._badgeDom.html=val;if(this.isRendered){this.render();}}
get badgeDom(){return this._badgeDom;}
get badgeTextHtmlDisplayType(){return this._badgeDom.htmlDisplayType;}
set badgeTextHtmlDisplayType(val){this._badgeDom.htmlDisplayType=val;}
get caption(){return this._captionDom.html;}
set caption(val){this._captionDom.html=val;if(this.isRendered){this.render();}}
get captionDom(){return this._captionDom;}
get captionHtmlDisplayType(){return this._captionDom.htmlDisplayType;}
set captionHtmlDisplayType(val){this._captionDom.htmlDisplayType=val;}
get disabled(){return this._dom.disabled;}
set disabled(val){if(val){this._dom.clsAdd('kijs-disabled');}else{this._dom.clsRemove('kijs-disabled');}
this._dom.disabled=val;}
get icon(){return this._iconEl;}
set icon(val){if(kijs.isEmpty(val)){this._iconEl.iconChar=null;this._iconEl.iconCls=null;this._iconEl.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Icon){this._iconEl.destruct();this._iconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._iconEl.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "icon" is not valid.`);}}
get iconChar(){return this._iconEl.iconChar;}
set iconChar(val){this._iconEl.iconChar=val;if(this.isRendered){this.render();}}
get iconCls(){return this._iconEl.iconCls;}
set iconCls(val){this._iconEl.iconCls=val;if(this.isRendered){this.render();}}
get iconColor(){return this._iconEl.iconColor;}
set iconColor(val){this._iconEl.iconColor=val;if(this.isRendered){this.render();}}
get icon2(){return this._icon2El;}
set icon2(val){if(kijs.isEmpty(val)){this._icon2El.iconChar=null;this._icon2El.iconCls=null;this._icon2El.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Icon){this._icon2El.destruct();this._icon2El=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._icon2El.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "icon2" is not valid.`);}}
get icon2Char(){return this._icon2El.iconChar;}
set icon2Char(val){this._icon2El.iconChar=val;if(this.isRendered){this.render();}}
get icon2Cls(){return this._icon2El.iconCls;}
set icon2Cls(val){this._icon2El.iconCls=val;if(this.isRendered){this.render();}}
get icon2Color(){return this._icon2El.iconColor;}
set icon2Color(val){this._icon2El.iconColor=val;if(this.isRendered){this.render();}}
get isDefault(){return this._dom.clsHas('kijs-default');}
set isDefault(val){if(val){this._dom.clsAdd('kijs-default');}else{this._dom.clsRemove('kijs-default');}}
get isEmpty(){return this._captionDom.isEmpty&&this._iconEl.isEmpty&&this._icon2El.isEmpty&&this._badgeDom.isEmpty;}
render(superCall){super.render(true);if(!this._iconEl.isEmpty){this._iconEl.renderTo(this._dom.node);}else{this._iconEl.unrender();}
if(!this._captionDom.isEmpty){this._captionDom.renderTo(this._dom.node);}else{this._captionDom.unrender();}
if(!this._badgeDom.isEmpty){this._badgeDom.renderTo(this._dom.node);}else{this._badgeDom.unrender();}
if(!this._icon2El.isEmpty){this._icon2El.renderTo(this._dom.node);}else{this._icon2El.unrender();}
if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._iconEl.unrender();this._icon2El.unrender();this._captionDom.unrender();this._badgeDom.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._badgeDom){this._badgeDom.destruct();}
if(this._captionDom){this._captionDom.destruct();}
if(this._iconEl){this._iconEl.destruct();}
if(this._icon2El){this._icon2El.destruct();}
this._badgeDom=null;this._captionDom=null;this._iconEl=null;super.destruct(true);}};kijs.gui.Container=class kijs_gui_Container extends kijs.gui.Element{constructor(config={}){super(false);this._innerDom=new kijs.gui.Dom();this._defaults={};this._elements=[];this._dom.clsAdd('kijs-container');this._innerDom.clsAdd('kijs-container-inner');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{autoScroll:{target:'autoScroll'},defaults:true,html:{target:'html',context:this._innerDom},htmlDisplayType:{target:'htmlDisplayType',context:this._innerDom},innerCls:{fn:'function',target:this._innerDom.clsAdd,context:this._innerDom},innerStyle:{fn:'assign',target:'style',context:this._innerDom},elements:{prio:1000,fn:'function',target:this.add,context:this}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get autoScroll(){return this._innerDom.clsHas('kijs-autoscroll');}
set autoScroll(val){if(val){this._innerDom.clsAdd('kijs-autoscroll');}else{this._innerDom.clsRemove('kijs-autoscroll');}}
get defaults(){return this._defaults;}
set defaults(val){this._defaults=val;}
get elements(){return this._elements;}
get firstChild(){if(this._elements.length>0){return this._elements[0];}
return null;}
get html(){return this._innerDom.html;}
set html(val){this._innerDom.html=val;}
get htmlDisplayType(){return this._innerDom.htmlDisplayType;}
set htmlDisplayType(val){this._innerDom.htmlDisplayType=val;}
get innerDom(){return this._innerDom;}
get lastChild(){if(this._elements.length>0){return this._elements[this._elements.length-1];}
return null;}
get isEmpty(){return this._innerDom.isEmpty&&kijs.isEmpty(this._elements);}
add(elements,index=null){if(!kijs.isArray(elements)){elements=[elements];}
const newElements=[];for(let i=0,len=elements.length;i<len;i++){let el=this._getInstanceForAdd(elements[i]);if(el&&!kijs.Array.contains(this._elements,el)){el.on('afterResize',this._onChildElementAfterResize,this);newElements.push(el);}}
elements=null;if(this.raiseEvent('beforeAdd',{elements:newElements})===false){return;}
kijs.Array.each(newElements,function(el){if(kijs.isInteger(index)){this._elements.splice(index,0,el);}else{this._elements.push(el);}},this);if(this._innerDom.node){this.render();}
this.raiseEvent('add',{elements:newElements});}
down(name){const ret=this.getElementsByName(name,-1,true);if(!kijs.isEmpty(ret)){return ret[0];}else{return null;}}
downX(xtype){const ret=this.getElementsByXtype(xtype,-1,true);if(!kijs.isEmpty(ret)){return ret[0];}else{return null;}}
getElements(deep=-1){let ret=[];kijs.Array.each(this._elements,function(el){ret.push(el);},this);if(deep!==0){if(deep>0){deep--;}
kijs.Array.each(this._elements,function(el){if(kijs.isFunction(el.getElements)){let retSub=el.getElements(deep);if(!kijs.isEmpty(retSub)){ret=ret.concat(retSub);}}},this);}
return ret;}
getElementsByName(name,deep=-1,breakOnFirst=false){let ret=[];if(kijs.isEmpty(name)){return[];}
kijs.Array.each(this._elements,function(el){if(el.name===name){ret.push(el);if(breakOnFirst){return false;}}},this);if(!breakOnFirst||kijs.isEmpty(ret)){if(deep&&deep!==0){if(deep>0){deep--;}
kijs.Array.each(this._elements,function(el){if(kijs.isFunction(el.getElementsByName)){let retSub=el.getElementsByName(name,deep,breakOnFirst);if(!kijs.isEmpty(retSub)){ret=ret.concat(retSub);if(breakOnFirst){return false;}}}},this);}}
return ret;}
getElementsByXtype(xtype,deep=-1,breakOnFirst=false){let ret=[];if(kijs.isEmpty(xtype)){return[];}
kijs.Array.each(this._elements,function(el){if(el.xtype===xtype){ret.push(el);if(breakOnFirst){return false;}}},this);if(!breakOnFirst||kijs.isEmpty(ret)){if(deep&&deep!==0){if(deep>0){deep--;}
kijs.Array.each(this._elements,function(el){if(kijs.isFunction(el.getElementsByXtype)){let retSub=el.getElementsByXtype(xtype,deep,breakOnFirst);if(!kijs.isEmpty(retSub)){ret=ret.concat(retSub);if(breakOnFirst){return false;}}}},this);}}
return ret;}
hasChild(element){return kijs.Array.contains(this._elements,element);}
remove(elements){if(!kijs.isArray(elements)){elements=[elements];}
const removeElements=[];for(let i=0,len=elements.length;i<len;i++){if(kijs.Array.contains(this._elements,elements[i])){removeElements.push(elements[i]);}}
elements=null;if(this.raiseEvent('beforeRemove',{elements:removeElements})===false){return;}
kijs.Array.each(removeElements,function(el){el.off(null,null,this);if(el.unrender){el.unrender();}
kijs.Array.remove(this._elements,el);},this);if(this.dom){this.render();}
this.raiseEvent('remove');}
removeAll(preventRender){if(this.raiseEvent('beforeRemove',{elements:this._elements})===false){return;}
kijs.Array.each(this._elements,function(el){el.off(null,null,this);if(el.unrender){el.unrender();}},this);kijs.Array.clear(this._elements);if(this.dom&&!preventRender){this.render();}
this.raiseEvent('remove');}
render(superCall){super.render(true);this._innerDom.renderTo(this._dom.node);kijs.Array.each(this._elements,function(el){el.renderTo(this._innerDom.node);},this);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
kijs.Array.each(this._elements,function(el){el.unrender();},this);this._innerDom.unrender();super.unrender(true);}
_getInstanceForAdd(obj){if(obj instanceof kijs.gui.Element){obj.parent=this;}else if(kijs.isObject(obj)){if(!kijs.isEmpty(this._defaults)){this._defaults.skipUnknownConfig=true;kijs.Object.assignDeep(obj,this._defaults,false);}
if(!kijs.isString(obj.xtype)){throw new kijs.Error(`config missing "xtype".`);}
const constr=kijs.gui.getClassFromXtype(obj.xtype);if(!kijs.isFunction(constr)){throw new kijs.Error(`Unknown xtype "${obj.xtype}".`);}
obj.parent=this;obj=new constr(obj);}else{throw new kijs.Error(`kijs.gui.Container: invalid element.`);}
return obj;}
_onChildElementAfterResize(e){this.raiseEvent('childElementAfterResize',{childElement:e.element});}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._elements){kijs.Array.each(this._elements,function(el){if(el&&el.destruct){el.destruct();}},this);}
if(this._innerDom){this._innerDom.destruct();}
this._defaults=null;this._elements=null;this._innerDom=null;super.destruct(true);}};kijs.gui.DataViewElement=class kijs_gui_DataViewElement extends kijs.gui.Element{constructor(config={}){super(false);this._dataRow={};this._index=null;this._selected=false;this._dom.clsAdd('kijs-dataviewelement');this._dom.nodeAttributeSet('draggable',true);Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{dataRow:true,disabled:{target:'disabled',context:this._dom},index:true,selected:{target:'selected'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.applyConfig(config);}
get dataRow(){return this._dataRow;}
set dataRow(val){this._dataRow=val;}
get disabled(){return this._dom.disabled;}
set disabled(val){this._dom.disabled=val;}
get index(){return this._index;}
set index(val){this._index=val;}
get selected(){return this._dom.clsHas('kijs-selected');}
set selected(val){if(val){this._dom.clsAdd('kijs-selected');}else{this._dom.clsRemove('kijs-selected');}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._dataRow=null;super.destruct(true);}};kijs.gui.DatePicker=class kijs_gui_DatePicker extends kijs.gui.Element{constructor(config={}){super(false);this._startWeekday=1;this._showWeekNumbers=true;this._weekSelect=false;this._showCalendar=true;this._visibleMonthDate=kijs.Date.getFirstOfMonth(new Date());this._value=new Date();this._rangeFrom=null;this._rangeTo=null;this._nextBtn=new kijs.gui.Button({iconChar:'&#xf138',on:{click:this._onNextBtnClick,context:this}});this._previousBtn=new kijs.gui.Button({iconChar:'&#xf137',on:{click:this._onPreviousBtnClick,context:this}});this._headerBar=new kijs.gui.PanelBar({cls:'kijs-headerbar-center',elementsLeft:[this._previousBtn],elementsRight:[this._nextBtn],on:{click:this._onHeaderBarClick,context:this}});this._calendarDom=new kijs.gui.Dom({cls:'kijs-datepicker-calendar',on:{mouseLeave:this._onCalendarMouseLeave,wheel:this._onCalendarWheel,context:this}});this._gridColumns=[];for(let y=0;y<7;y++){let rows=[];let colDom=new kijs.gui.Dom();for(let x=0;x<8;x++){rows.push({x:x,y:y,dom:new kijs.gui.Dom({on:{mouseEnter:this._onDateMouseEnter,click:this._onDateMouseClick,context:this}}),isHeader:y===0,isWeekNr:x===0,date:null});}
this._gridColumns.push({y:y,dom:colDom,rows:rows});}
this._yearMonthDom=new kijs.gui.Dom({cls:'kijs-datepicker-monthyearselector'});this._monthDom=new kijs.gui.Dom({cls:'kijs-datepicker-monthselector'});this._yearDom=new kijs.gui.Dom({cls:'kijs-datepicker-yearselector'});this._monthSelector=[];for(let m=0;m<12;m++){this._monthSelector.push({month:m,dom:new kijs.gui.Dom({html:kijs.Date.months_short[m],on:{click:this._onMonthSelectorClick,context:this}})});}
this._yearSelector=[];this._yearSelector.push({dir:'up',dom:new kijs.gui.Dom({cls:'kijs-btn-up',html:'▴',on:{click:this._onYearSelectorUpClick,context:this}})});for(let y=0;y<5;y++){this._yearSelector.push({year:(new Date()).getFullYear()-2+y,dom:new kijs.gui.Dom({html:(new Date()).getFullYear()-2+y,on:{click:this._onYearSelectorClick,wheel:this._onYearSelectorWheel,context:this}})});}
this._yearSelector.push({dir:'down',dom:new kijs.gui.Dom({cls:'kijs-btn-down',html:'▾',on:{click:this._onYearSelectorDownClick,context:this}})});this._todayBtn=new kijs.gui.Button({parent:this,caption:kijs.getText('Heute'),on:{click:this._onTodayButtonClick,context:this}});this._dom.clsAdd('kijs-datepicker');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{rangeFrom:true,rangeTo:true,value:{target:'value'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get value(){return this._value;}
set value(val){this._value=kijs.Date.create(val);this._visibleMonthDate=kijs.Date.getFirstOfMonth(this._value);this._calculateCalendar();}
get inputField(){let p=this;while(p.parent){if(p.parent instanceof kijs.gui.field.Field){return p.parent;}
p=p.parent;}}
render(superCall){super.render(true);this._headerBar.renderTo(this._dom.node);this._calculateCalendar();this._calculateMonthYearPicker();if(this._showCalendar){this._yearMonthDom.unrender();this._calendarDom.renderTo(this._dom.node);kijs.Array.each(this._gridColumns,function(column){column.dom.renderTo(this._calendarDom.node);kijs.Array.each(column.rows,function(row){row.dom.renderTo(column.dom.node);},this);},this);}else{this._calendarDom.unrender();this._yearMonthDom.renderTo(this._dom.node);this._monthDom.renderTo(this._yearMonthDom.node);this._yearDom.renderTo(this._yearMonthDom.node);for(let i=0;i<this._monthSelector.length;i++){this._monthSelector[i].dom.renderTo(this._monthDom.node);}
for(let i=0;i<this._yearSelector.length;i++){this._yearSelector[i].dom.renderTo(this._yearDom.node);}}
if(!this._todayBtn.isEmpty){this._todayBtn.renderTo(this._dom.node);}else{this._todayBtn.unrender();}
if(!superCall){this.raiseEvent('afterRender');}
let ip=this.inputField;if(ip){ip.on('keyUp',this._onInputKeyUp,this);}}
_calculateMonthYearPicker(){for(let i=0;i<this._monthSelector.length;i++){this._monthSelector[i].dom.html=kijs.Date.months_short[this._monthSelector[i].month];if(this._visibleMonthDate&&this._visibleMonthDate.getMonth()===this._monthSelector[i].month){this._monthSelector[i].dom.clsAdd('kijs-value');}else{this._monthSelector[i].dom.clsRemove('kijs-value');}}
for(let i=1;i<this._yearSelector.length-1;i++){this._yearSelector[i].dom.html=this._yearSelector[i].year;if(this._visibleMonthDate&&this._visibleMonthDate.getFullYear()===this._yearSelector[i].year){this._yearSelector[i].dom.clsAdd('kijs-value');}else{this._yearSelector[i].dom.clsRemove('kijs-value');}}}
_calculateCalendar(rangeTo=null){let offset;let day,firstDay,lastDay,monthIndex;rangeTo=rangeTo?rangeTo:this._rangeTo;this._headerBar.html=kijs.Date.format(this._visibleMonthDate,'F Y');monthIndex=this._visibleMonthDate.getMonth();firstDay=kijs.Date.clone(this._visibleMonthDate);offset=firstDay.getDay()-this._startWeekday;if(offset<0)offset+=7;firstDay=kijs.Date.addDays(firstDay,offset*-1);lastDay=kijs.Date.getLastOfMonth(this._visibleMonthDate);offset=this._startWeekday-lastDay.getDay()-1;if(offset<0)offset+=7;lastDay=kijs.Date.addDays(lastDay,offset);for(let i=0;i<this._gridColumns[0].rows.length;i++){let fldDom=this._gridColumns[0].rows[i].dom;fldDom.clsAdd('kijs-head');if(i===0){fldDom.clsAdd('kijs-weekno');fldDom.html=this._showWeekNumbers?'&nbsp;':'';}else{let wdNo=(i-1)+this._startWeekday;if(wdNo>6){wdNo-=7;}
fldDom.html=kijs.Date.weekdays_short[wdNo];if(wdNo===0||wdNo===6){fldDom.clsAdd('kijs-weekend');}else{fldDom.clsRemove('kijs-weekend');}}}
day=kijs.Date.clone(firstDay);for(let i=1;i<this._gridColumns.length;i++){if(this._weekSelect){this._gridColumns[i].dom.clsAdd('kijs-weekselect');this._gridColumns[i].dom.clsRemove('kijs-dayselect');}else{this._gridColumns[i].dom.clsAdd('kijs-dayselect');this._gridColumns[i].dom.clsRemove('kijs-weekselect');}
for(let x=1;x<8;x++){let fldDom=this._gridColumns[i].rows[x].dom;this._gridColumns[i].rows[x].date=kijs.Date.clone(day);fldDom.html=kijs.Date.format(day,'j');if(day.getMonth()!==monthIndex){fldDom.clsAdd('kijs-outofmonth');}else{fldDom.clsRemove('kijs-outofmonth');}
if(kijs.Date.getDatePart(day).getTime()===kijs.Date.getDatePart(new Date()).getTime()){fldDom.clsAdd('kijs-today');}else{fldDom.clsRemove('kijs-today');}
if(day.getDay()===0||day.getDay()===6){fldDom.clsAdd('kijs-weekend');}else{fldDom.clsRemove('kijs-weekend');}
if(this._value instanceof Date&&kijs.Date.getDatePart(day).getTime()===kijs.Date.getDatePart(this._value).getTime()){fldDom.clsAdd('kijs-value');}else{fldDom.clsRemove('kijs-value');}
if(this._rangeFrom&&rangeTo&&kijs.Date.getDatePart(day).getTime()===kijs.Date.getDatePart(this._rangeFrom).getTime()){fldDom.clsAdd('kijs-range-start');}else{fldDom.clsRemove('kijs-range-start');}
if(this._rangeFrom&&rangeTo&&kijs.Date.getDatePart(day).getTime()===kijs.Date.getDatePart(rangeTo).getTime()){fldDom.clsAdd('kijs-range-end');}else{fldDom.clsRemove('kijs-range-end');}
if(this._rangeFrom&&rangeTo&&kijs.Date.getDatePart(day).getTime()>kijs.Date.getDatePart(this._rangeFrom).getTime()&&kijs.Date.getDatePart(day).getTime()<kijs.Date.getDatePart(rangeTo).getTime()){fldDom.clsAdd('kijs-range-between');}else{fldDom.clsRemove('kijs-range-between');}
if(x===1){this._gridColumns[i].rows[0].dom.html=this._showWeekNumbers?parseInt(kijs.Date.format(day,'W')):'';this._gridColumns[i].rows[0].dom.clsAdd('kijs-weekno');}
day.setDate(day.getDate()+1);}}}
_getElementByDom(dom){for(let y=0;y<this._gridColumns.length;y++){for(let x=0;x<this._gridColumns[y].rows.length;x++){if(dom===this._gridColumns[y].rows[x].dom||dom===this._gridColumns[y].rows[x].dom.dom){return this._gridColumns[y].rows[x];}}}
for(let i=0;i<this._monthSelector.length;i++){if(this._monthSelector[i].dom===dom||this._monthSelector[i].dom.dom===dom){return this._monthSelector[i];}}
for(let i=0;i<this._yearSelector.length;i++){if(this._yearSelector[i].dom===dom||this._yearSelector[i].dom.dom===dom){return this._yearSelector[i];}}
return null;}
_setYearPicker(year){year-=2;for(let i=1;i<this._yearSelector.length-1;i++){this._yearSelector[i].year=year;year++;}}
_onNextBtnClick(){this._visibleMonthDate.setMonth(this._visibleMonthDate.getMonth()+1);this._setYearPicker(this._visibleMonthDate.getFullYear());this._calculateCalendar();this._calculateMonthYearPicker();}
_onPreviousBtnClick(){this._visibleMonthDate.setMonth(this._visibleMonthDate.getMonth()-1);this._setYearPicker(this._visibleMonthDate.getFullYear());this._calculateCalendar();this._calculateMonthYearPicker();}
_onDateMouseClick(e){let dt=this._getElementByDom(e.dom);if(dt&&dt.date instanceof Date){this.value=dt.date;}
if(this.inputField){this.inputField.focus();}
this.raiseEvent('dateChanged',this.value);}
_onDateMouseEnter(e){let dt=this._getElementByDom(e.dom);if(!dt.isHeader&&!dt.isWeekNr&&dt.date instanceof Date){this._calculateCalendar(dt.date);}}
_onCalendarMouseLeave(){this._calculateCalendar();}
_onInputKeyUp(e){if(this._dom.node&&kijs.Array.contains(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'],e.nodeEvent.key)){e.nodeEvent.preventDefault();if(this.value instanceof Date){switch(e.nodeEvent.key){case'ArrowUp':this.value=kijs.Date.addDays(this.value,-7);break;case'ArrowDown':this.value=kijs.Date.addDays(this.value,7);break;case'ArrowLeft':this.value=kijs.Date.addDays(this.value,-1);break;case'ArrowRight':this.value=kijs.Date.addDays(this.value,1);break;}
this.raiseEvent('dateChanged',this.value);}}else if(this._dom.node&&e.nodeEvent.key==='Enter'){this.raiseEvent('dateSelected',this.value);}}
_onCalendarWheel(e){if(e.nodeEvent.deltaY<0){this._onPreviousBtnClick();}else{this._onNextBtnClick()}}
_onHeaderBarClick(){this._showCalendar=!this._showCalendar;this.render();}
_onTodayButtonClick(e){this._value=kijs.Date.getDatePart(new Date());this._visibleMonthDate=kijs.Date.getFirstOfMonth(this._value);this._setYearPicker(this._visibleMonthDate.getFullYear());this._calculateCalendar();this._calculateMonthYearPicker();if(this.inputField){this.inputField.focus();}
this.raiseEvent('dateChanged',this.value);this.raiseEvent('dateSelected',this.value);}
_onMonthSelectorClick(e){let m=this._getElementByDom(e.dom);if(m.month||m.month===0){this._visibleMonthDate.setMonth(m.month);this._calculateCalendar();this._calculateMonthYearPicker();}
if(this.inputField){this.inputField.focus();}}
_onYearSelectorClick(e){let y=this._getElementByDom(e.dom);if(y.year){this._visibleMonthDate.setFullYear(y.year);this._calculateCalendar();this._calculateMonthYearPicker();}
if(this.inputField){this.inputField.focus();}}
_onYearSelectorUpClick(){for(let i=1;i<this._yearSelector.length-1;i++){this._yearSelector[i].year--;}
this._calculateCalendar();this._calculateMonthYearPicker();if(this.inputField){this.inputField.focus();}}
_onYearSelectorDownClick(){for(let i=1;i<this._yearSelector.length-1;i++){this._yearSelector[i].year++;}
this._calculateCalendar();this._calculateMonthYearPicker();if(this.inputField){this.inputField.focus();}}
_onYearSelectorWheel(e){if(e.nodeEvent.deltaY<0){this._onYearSelectorUpClick();}else{this._onYearSelectorDownClick();}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._headerBar.unrender();this._calendarDom.unrender();this._todayBtn.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._headerBar){this._headerBar.destruct();}
if(this._calendarDom){this._calendarDom.destruct();}
if(this._todayBtn){this._todayBtn.destruct();}
this._nextBtn=null;this._previousBtn=null;this._headerBar=null;this._calendarDom=null;this._todayBtn=null;super.destruct(true);}};kijs.gui.Icon=class kijs_gui_Icon extends kijs.gui.Element{constructor(config={}){super(false);this._iconCls=null;this._dom.nodeTagName='span';this._dom.clsAdd('kijs-icon');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{disabled:{target:'disabled'},iconChar:{target:'html',context:this._dom},iconCls:{target:'iconCls'},iconColor:{target:'iconColor'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disabled(){return this._dom.clsHas('kijs-disabled');}
set disabled(val){if(val){this._dom.clsAdd('kijs-disabled');}else{this._dom.clsRemove('kijs-disabled');}
this._dom.disabled=!!val;}
get iconChar(){return this._dom.html;}
set iconChar(val){this._dom.html=val;}
get iconCls(){return this._iconCls;}
set iconCls(val){if(kijs.isEmpty(val)){val=null;}
if(!kijs.isString&&!val){throw new kijs.Error(`config "iconCls" is not a string`);}
if(this._iconCls){this._dom.clsRemove(this._iconCls);}
this._iconCls=val;if(this._iconCls){this._dom.clsAdd(this._iconCls);}}
get iconColor(){return this._dom.style.color;}
set iconColor(val){this._dom.style.color=val;}
get isEmpty(){return kijs.isEmpty(this._dom.html)&&kijs.isEmpty(this._iconCls);}};kijs.gui.Mask=class kijs_gui_Mask extends kijs.gui.Element{constructor(config={}){super(false);this._iconEl=new kijs.gui.Icon({parent:this});this._textEl=new kijs.gui.Dom({cls:'kijs-mask-text'});this._targetX=null;this._targetDomProperty='dom';this._dom.clsAdd('kijs-mask');Object.assign(this._defaultConfig,{target:document.body});Object.assign(this._configMap,{displayWaitIcon:{target:'displayWaitIcon'},icon:{target:'icon'},iconChar:{target:'iconChar',context:this._iconEl},iconCls:{target:'iconCls',context:this._iconEl},iconColor:{target:'iconColor',context:this._iconEl},target:{target:'target'},text:{target:'html',context:this._textEl},targetDomProperty:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get displayWaitIcon(){return this._iconEl.iconChar==='&#xf110;';}
set displayWaitIcon(val){if(val){this.iconChar='&#xf110;';this._iconEl.dom.clsAdd('kijs-pulse');}else{this.iconChar=null;this._iconEl.dom.clsRemove('kijs-pulse');}}
get icon(){return this._iconEl;}
set icon(val){if(kijs.isEmpty(val)){this._iconEl.iconChar=null;this._iconEl.iconCls=null;this._iconEl.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Icon){this._iconEl.destruct();this._iconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._iconEl.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "icon" is not valid.`);}}
get iconChar(){return this._iconEl.iconChar;}
set iconChar(val){this._iconEl.iconChar=val;if(this.isRendered){this.render();}}
get iconCls(){return this._iconEl.iconCls;}
set iconCls(val){this._iconEl.iconCls=val;if(this.isRendered){this.render();}}
get iconColor(){return this._iconEl.iconColor;}
set iconColor(val){this._iconEl.iconColor=val;if(this.isRendered){this.render();}}
get isEmpty(){return this._iconEl.isEmpty;}
get parentNode(){if(this._targetX instanceof kijs.gui.Element){if(this._targetX[this._targetDomProperty].node.parentNode){return this._targetX[this._targetDomProperty].node.parentNode;}else{return this._targetX[this._targetDomProperty].node;}}else{return this._targetX;}}
get target(){return this._targetX;}
set target(val){if(!kijs.isEmpty(this._targetX)){if(this._targetX instanceof kijs.gui.Element){this._targetX.off('afterResize',this._onTargetElAfterResize,this);this._targetX.off('changeVisibility',this._onTargetElChangeVisibility,this);this._targetX.off('destruct',this._onTargetElDestruct,this);}}
if(val instanceof kijs.gui.Element){this._targetX=val;this._targetX.on('afterResize',this._onTargetElAfterResize,this);this._targetX.on('changeVisibility',this._onTargetElChangeVisibility,this);this._targetX.on('destruct',this._onTargetElDestruct,this);}else if(val===document.body||kijs.isEmpty(val)){this._targetX=document.body;}else{throw new kijs.Error(`Unkown format on config "target"`);}}
get targetDomProperty(){return this._targetDomProperty;};set targetDomProperty(val){this._targetDomProperty=val;};get targetNode(){if(this._targetX instanceof kijs.gui.Element){return this._targetX[this._targetDomProperty].node;}else{return this._targetX;}}
get text(){return this._textEl.html;}
set text(val){this._textEl.html=val;}
render(superCall){super.render(true);this._updateMaskPosition();if(!this._iconEl.isEmpty){this._iconEl.renderTo(this._dom.node);}else{this._iconEl.unrender();}
this._textEl.renderTo(this._dom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._iconEl.unrender();this._textEl.unrender();super.unrender(true);}
show(){this.renderTo(this.parentNode);}
_updateMaskPosition(){if(this._targetX instanceof kijs.gui.Element){this.top=this._targetX[this._targetDomProperty].top;this.left=this._targetX[this._targetDomProperty].left;this.height=this._targetX[this._targetDomProperty].height;this.width=this._targetX[this._targetDomProperty].width;}}
_onTargetElAfterResize(e){this._updateMaskPosition();}
_onTargetElChangeVisibility(e){this._updateMaskPosition();this.visible=e.visible;}
_onTargetElDestruct(e){this.destruct();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._targetX instanceof kijs.gui.Element){this._targetX.off(null,null,this);}
if(this._iconEl){this._iconEl.destruct();}
if(this._textEl){this._textEl.destruct();}
super.destruct(true);this._iconEl=null;this._targetX=null;}};kijs.gui.ProgressBar=class kijs_gui_ProgressBar extends kijs.gui.Element{constructor(config={}){super(false);this._percent=0;this._showPercent=true;this._fileUpload=null;this._fileUploadId=null;this._captionDom=new kijs.gui.Dom();this._bottomCaptionDom=new kijs.gui.Dom();this._fieldDom=new kijs.gui.Dom();this._barDom=new kijs.gui.Dom();this._textDom=new kijs.gui.Dom();this._dom.clsAdd('kijs-progressbar');this._captionDom.clsAdd('kijs-progressbar-caption');this._bottomCaptionDom.clsAdd('kijs-progressbar-caption-bottom');this._fieldDom.clsAdd('kijs-progressbar-field');this._barDom.clsAdd('kijs-progressbar-bar');this._textDom.clsAdd('kijs-progressbar-text');Object.assign(this._defaultConfig,{percent:0,showPercent:true});Object.assign(this._configMap,{showPercent:true,caption:{target:'html',context:this._captionDom},bottomCaption:{target:'html',context:this._bottomCaptionDom},percent:{target:'percent'},fileUpload:{target:'fileUpload'},fileUploadId:{target:'fileUploadId'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get caption(){return this._captionDom.html;}
set caption(val){this._captionDom.html=val;}
get bottomCaption(){return this._bottomCaptionDom.html;}
set bottomCaption(val){this._bottomCaptionDom.html=val;}
get percent(){return this._percent;}
set percent(val){this.setProgress(val);}
get fileUpload(){return this._fileUpload;}
set fileUpload(val){this.bindFileUpload(val);}
get fileUploadId(){return this._fileUploadId;}
set fileUploadId(val){this._fileUploadId=val;}
bindFileUpload(fileUpload,uploadId=null){if(!(fileUpload instanceof kijs.FileUpload)){throw new kijs.Error('Upload Dialog must be of type kijs.FileUpload');}
if(this._fileUpload instanceof kijs.FileUpload){this._fileUpload.off(null,null,this);}
this._fileUpload=fileUpload;if(uploadId!==null){this._fileUploadId=uploadId;}
fileUpload.on('progress',this._onFileUploadProgress,this);fileUpload.on('upload',this._onFileUploadUpload,this);}
setProgress(percent){percent=window.parseInt(percent);if(window.isNaN(percent)||percent<0||percent>100){throw new kijs.Error('percent must be numeric between 0 and 100');}
this._percent=percent;this._textDom.html=this._showPercent?this._percent+'%':'';if(this._barDom.node){this._barDom.node.style.width=this._percent+'%';}
if(this._showPercent&&this._textDom.node){if(this._barDom.width>=this._textDom.width+3||this._percent===100){this._textDom.node.style.opacity=1;}else{this._textDom.node.style.opacity=0;}}}
render(superCall){super.render(true);this._captionDom.renderTo(this._dom.node);this._fieldDom.renderTo(this._dom.node);this._bottomCaptionDom.renderTo(this._dom.node);this._barDom.renderTo(this._fieldDom.node);if(this._showPercent){this._textDom.renderTo(this._fieldDom.node);}
this._barDom.node.style.width=this._percent+'%';if(this._showPercent&&(this._barDom.width>=this._textDom.width+3||this._percent===100)){this._textDom.node.style.opacity=1;}
if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._barDom.unrender();this._textDom.unrender();super.unrender(true);}
_onFileUploadProgress(ud,e,id,percent){if(this._fileUploadId===null){this._fileUploadId=id;}
if(kijs.isInteger(percent)&&this._fileUploadId===id){this.setProgress(percent);}}
_onFileUploadUpload(ud,resp,error,id){if(this._fileUploadId===id){this.setProgress(100);}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._fileUpload instanceof kijs.FileUpload){this._fileUpload.off(null,null,this);}
this._captionDom.destruct();this._bottomCaptionDom.destruct();this._fieldDom.destruct();this._barDom.destruct();this._textDom.destruct();this._captionDom=null;this._bottomCaptionDom=null;this._fieldDom=null;this._barDom=null;this._textDom=null;super.destruct(true);}};kijs.gui.Resizer=class kijs_gui_Resizer extends kijs.gui.Element{constructor(config={}){super(false);this._initialPos=null;this._targetEl=null;this._targetMaxHeight=null;this._targetMaxWidth=null;this._targetMinHeight=null;this._targetMinWidth=null;this._overlayDom=new kijs.gui.Dom({cls:'kijs-resizer-overlay'});this._dom.clsAdd('kijs-resizer');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{target:{target:'_targetEl'},targetMaxHeight:true,targetMaxWidth:true,targetMinHeight:true,targetMinWidth:true});this.on('mouseDown',this._onMouseDown,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get target(){return this._targetEl;}
get targetMaxHeight(){return this._targetMaxHeight;}
set targetMaxHeight(val){this._targetMaxHeight=val;}
get targetMaxWidth(){return this._targetMaxWidth;}
set targetMaxWidth(val){this._targetMaxWidth=val;}
get targetMinHeight(){return this._targetMinHeight;}
set targetMinHeight(val){this._targetMinHeight=val;}
get targetMinWidth(){return this._targetMinWidth;}
set targetMinWidth(val){this._targetMinWidth=val;}
_getMinMaxSize(){const ret={wMin:null,wMax:null,hMin:null,hMax:null};let parentNode;const isWindow=!!this._targetEl.targetNode;if(isWindow){parentNode=this._targetEl.targetNode;}else{parentNode=this._targetEl.dom.node.parentNode;}
if(isWindow){ret.wMax=parentNode.clientWidth+parentNode.offsetLeft-this._targetEl.left;ret.hMax=parentNode.clientHeight+parentNode.offsetTop-this._targetEl.top;}else{switch(parentNode.style.overflowX){case'visible':case'scroll':case'auto':ret.wMax=null;break;case'hidden':default:ret.wMax=parentNode.clientWidth-this._targetEl.left;}
switch(parentNode.style.overflowY){case'visible':case'scroll':case'auto':ret.hMax=null;break;case'hidden':default:ret.hMax=parentNode.clientHeight-this._targetEl.top;}}
if(!kijs.isEmpty(this._targetMaxWidth)){if(ret.wMax===null||this._targetMaxWidth<ret.wMax){ret.wMax=this._targetMaxWidth;}}
if(!kijs.isEmpty(this._targetMaxHeight)){if(ret.hMax===null||this._targetMaxHeight<ret.hMax){ret.hMax=this._targetMaxHeight;}}
if(!kijs.isEmpty(this._targetMinWidth)){if(ret.wMin===null||this._targetMinWidth<ret.wMin){ret.wMin=this._targetMinWidth;}}
if(!kijs.isEmpty(this._targetMinHeight)){if(ret.hMin===null||this._targetMinHeight<ret.hMin){ret.hMin=this._targetMinHeight;}}
return ret;}
_onMouseDown(e){this._initialPos={x:e.nodeEvent.clientX,y:e.nodeEvent.clientY,w:this._targetEl.width,h:this._targetEl.height};this._overlayDom.top=this._targetEl.top;this._overlayDom.left=this._targetEl.left;this._overlayDom.width=this._targetEl.width;this._overlayDom.height=this._targetEl.height;this._overlayDom.render();this._targetEl.dom.node.parentNode.appendChild(this._overlayDom.node);kijs.Dom.addEventListener('mousemove',document,this._onMouseMove,this);kijs.Dom.addEventListener('mouseup',document,this._onMouseUp,this);}
_onMouseMove(e){let w=this._initialPos.w+(e.nodeEvent.clientX-this._initialPos.x);let h=this._initialPos.h+(e.nodeEvent.clientY-this._initialPos.y);const minMaxSize=this._getMinMaxSize();if(minMaxSize.wMin!==null&&w<minMaxSize.wMin){w=minMaxSize.wMin;}
if(minMaxSize.hMin!==null&&h<minMaxSize.hMin){h=minMaxSize.hMin;}
if(minMaxSize.wMax!==null&&w>minMaxSize.wMax){w=minMaxSize.wMax;}
if(minMaxSize.hMax!==null&&h>minMaxSize.hMax){h=minMaxSize.hMax;}
this._overlayDom.width=w;this._overlayDom.height=h;}
_onMouseUp(e){kijs.Dom.removeEventListener('mousemove',document,this);kijs.Dom.removeEventListener('mouseup',document,this);let w=this._initialPos.w+(e.nodeEvent.clientX-this._initialPos.x);let h=this._initialPos.h+(e.nodeEvent.clientY-this._initialPos.y);const minMaxSize=this._getMinMaxSize();if(minMaxSize.wMin!==null&&w<minMaxSize.wMin){w=minMaxSize.wMin;}
if(minMaxSize.hMin!==null&&h<minMaxSize.hMin){h=minMaxSize.hMin;}
if(minMaxSize.wMax!==null&&w>minMaxSize.wMax){w=minMaxSize.wMax;}
if(minMaxSize.hMax!==null&&h>minMaxSize.hMax){h=minMaxSize.hMax;}
this._targetEl.width=w;this._targetEl.height=h;this._overlayDom.unrender();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._overlayDom){this._overlayDom.destruct();}
this._initialPos=null;this._overlayDom=null;this._targetEl=null;super.destruct(true);}};kijs.gui.Splitter=class kijs_gui_Splitter extends kijs.gui.Element{constructor(config={}){super(false);this._overlayDom=new kijs.gui.Dom();this._initialPos=null;this._targetPos=null;this._targetEl=null;Object.assign(this._defaultConfig,{targetPos:'left'});Object.assign(this._configMap,{target:{target:'target'},targetPos:{target:'targetPos'}});this.on('mouseDown',this._onMouseDown,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get direction(){if(this._targetPos==='left'||this._targetPos==='right'){return'horizontal';}else if(this._targetPos==='top'||this._targetPos==='bottom'){return'vertical';}else{throw new kijs.Error(`unknown targetPos`);}}
get target(){if(!this._targetEl){this.target=this._detectTarget();if(!this._targetEl){throw new kijs.Error(`config missing "target"`);}}
return this._targetEl;}
set target(val){if(!val instanceof kijs.gui.Element){throw new kijs.Error(`Unkown format on config "target"`);}
this._targetEl=val;}
get targetPos(){return this._targetPos;}
set targetPos(val){if(!kijs.Array.contains(['top','right','left','bottom'],val)){throw new kijs.Error(`unknown targetPos`);}
this._targetPos=val;this._dom.clsRemove(['kijs-splitter-horizontal','kijs-splitter-vertical']);this._dom.clsAdd('kijs-splitter-'+this.direction);this._overlayDom.clsRemove(['kijs-splitter-overlay-horizontal','kijs-splitter-overlay-vertical']);this._overlayDom.clsAdd('kijs-splitter-overlay-'+this.direction);}
_detectTarget(){let targetEl=null;if(this._targetPos==='left'||this._targetPos==='top'){targetEl=this.previous;}else if(this._targetPos==='right'||this._targetPos==='bottom'){targetEl=this.next;}
return targetEl;}
_updateOverlayPosition(xAbs,yAbs){const parentPos=kijs.Dom.getAbsolutePos(this._dom.node.parentNode);const newPos={x:xAbs-parentPos.x,y:yAbs-parentPos.x};if(this.direction==='horizontal'){this._overlayDom.left=newPos.x;}else{this._overlayDom.top=newPos.y;}}
_onMouseDown(e){if(this.direction==='horizontal'){this._initialPos=e.nodeEvent.clientX;}else{this._initialPos=e.nodeEvent.clientY;}
this._updateOverlayPosition(e.nodeEvent.clientX,e.nodeEvent.clientY);this._overlayDom.render();this._dom.node.parentNode.appendChild(this._overlayDom.node);kijs.Dom.addEventListener('mousemove',document,this._onMouseMove,this);kijs.Dom.addEventListener('mouseup',document,this._onMouseUp,this);}
_onMouseMove(e){this._updateOverlayPosition(e.nodeEvent.clientX,e.nodeEvent.clientY);}
_onMouseUp(e){kijs.Dom.removeEventListener('mousemove',document,this);kijs.Dom.removeEventListener('mouseup',document,this);this._overlayDom.unrender();let offset;if(this.direction==='horizontal'){offset=e.nodeEvent.clientX-this._initialPos;}else{offset=e.nodeEvent.clientY-this._initialPos;}
switch(this._targetPos){case'top':this.target.height=this.target.height+offset;break;case'right':this.target.width=this.target.width-offset;break;case'bottom':this.target.height=this.target.height-offset;break;case'left':this.target.width=this.target.width+offset;break;}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._overlayDom){this._overlayDom.destruct();}
this._overlayDom=null;this._targetEl=null;super.destruct(true);}};kijs.gui.TimePicker=class kijs_gui_TimePicker extends kijs.gui.Element{constructor(config={}){super(false);this._hasSeconds=false;this._separator;this._hour=0;this._minute=0;this._second=0;this._canvas=null;this._canvasSize=null;this._clockRadius=null;this._clockColor='#f6f6f6';this._clockMode=1;this._distance={hourAm:32,hourPm:12,minute:20,second:20};this._headerBar=new kijs.gui.PanelBar({cls:'kijs-headerbar-center'});this._timeDom=new kijs.gui.Dom({cls:'kijs-inputcontainer'});this._inputHourDom=new kijs.gui.Dom({cls:'kijs-hour',nodeTagName:'input',nodeAttribute:{maxLength:2},on:{blur:this._onTimeBlur,change:this._onTimeChange,click:this._onTimeClick,focus:this._onTimeFocus,keyUp:this._onTimeKeyUp,context:this}});this._inputMinuteDom=new kijs.gui.Dom({cls:'kijs-minute',nodeTagName:'input',nodeAttribute:{maxLength:2},on:{blur:this._onTimeBlur,change:this._onTimeChange,click:this._onTimeClick,focus:this._onTimeFocus,keyUp:this._onTimeKeyUp,context:this}});this._inputSecondDom=new kijs.gui.Dom({cls:'kijs-second',nodeTagName:'input',nodeAttribute:{maxLength:2},on:{blur:this._onTimeBlur,change:this._onTimeChange,click:this._onTimeClick,focus:this._onTimeFocus,keyUp:this._onTimeKeyUp,context:this}});this._canvasContainerDom=new kijs.gui.Dom({cls:'kijs-canvascontainer'});this._canvasDom=new kijs.gui.Dom({nodeTagName:'canvas',on:{mouseMove:this._onCanvasMouseMove,mouseLeave:this._onCanvasMouseLeave,click:this._onCanvasMouseClick,context:this}});this._nowBtn=new kijs.gui.Button({parent:this,on:{click:this._onNowButtonClick,context:this}});this._dom.clsAdd('kijs-timepicker');Object.assign(this._defaultConfig,{headerText:kijs.getText('Uhrzeit'),nowText:kijs.getText('Jetzt'),separator:':',value:'00:00'});Object.assign(this._configMap,{nowText:{target:'caption',context:this._nowBtn},headerText:{target:'html',context:this._headerBar},value:{target:'value'},hasSeconds:true,separator:true,clockColor:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get hasSeconds(){return this._hasSeconds;}
set hasSeconds(val){this._hasSeconds=!!val;}
get value(){let val='';val+=this._zeroPad(this._hour)+this._separator+this._zeroPad(this._minute);if(this._hasSeconds){val+=this._separator+this._zeroPad(this._second);}
return val;}
set value(val){val=kijs.toString(val);val=val.split(this._separator);this._hour=val[0]?parseInt(val[0]):0;this._minute=val[1]?parseInt(val[1]):0;this._second=val[2]&&this._hasSeconds?parseInt(val[2]):0;this._clockMode=1;if(this._hour===24){this._hour=0;}
if(this._minute===60){this._minute=0;}
if(this._second===60){this._second=0;}
if(this._hour>23||this._hour<0){throw new kijs.Error('invalid time: hour');}
if(this._minute>60||this._minute<0){throw new kijs.Error('invalid time: minute');}
if(this._second>60||this._second<0){throw new kijs.Error('invalid time: second');}
if(this._dom.node){this.paint();}
if(this._inputHourDom.node){this._inputHourDom.node.value=this._zeroPad(this._hour);}
if(this._inputMinuteDom.node){this._inputMinuteDom.node.value=this._zeroPad(this._minute);}
if(this._inputSecondDom.node){this._inputSecondDom.node.value=this._zeroPad(this._second);}
return;}
render(superCall){super.render(true);if(!this._headerBar.isEmpty){this._headerBar.renderTo(this._dom.node);}else{this._headerBar.unrender();}
this._timeDom.renderTo(this._dom.node);this._inputHourDom.renderTo(this._timeDom.node);new kijs.gui.Dom({nodeTagName:'span',html:this._separator}).renderTo(this._timeDom.node);this._inputMinuteDom.renderTo(this._timeDom.node);if(this._hasSeconds){new kijs.gui.Dom({nodeTagName:'span',html:this._separator}).renderTo(this._timeDom.node);this._inputSecondDom.renderTo(this._timeDom.node);}else{this._inputSecondDom.unrender();}
this._canvasContainerDom.renderTo(this._dom.node);this._canvasDom.renderTo(this._canvasContainerDom.node);this._canvas=this._canvasDom.node.getContext('2d');if(this._nowBtn.caption){this._nowBtn.renderTo(this._dom.node);}else{this._nowBtn.unrender();}
if(this._inputHourDom.node){this._inputHourDom.node.value=this._zeroPad(this._hour);}
if(this._inputMinuteDom.node){this._inputMinuteDom.node.value=this._zeroPad(this._minute);}
if(this._inputSecondDom.node){this._inputSecondDom.node.value=this._zeroPad(this._second);}
if(!superCall){this.raiseEvent('afterRender');}
kijs.defer(function(){this.paint();},10,this);}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._headerBar.unrender();this._inputHourDom.unrender();this._inputMinuteDom.unrender();this._inputSecondDom.unrender();this._timeDom.unrender();this._canvasDom.unrender();this._canvasContainerDom.unrender();this._nowBtn.unrender();super.unrender(true);}
paint(pointerPos=null){this._canvasSize=Math.min(this._canvasContainerDom.width,this._canvasContainerDom.height);if(this._canvasSize===0||!this._canvasDom.node){return;}
this._canvasDom.node.width=this._canvasSize;this._canvasDom.node.height=this._canvasSize;this._clockRadius=this._canvasSize/2-1;this._canvas.clearRect(0,0,this._canvasSize,this._canvasSize);this._drawBackground();if(pointerPos===null&&this._clockMode===1){pointerPos=this._degreeByHour(this._hour);}
if(pointerPos===null&&this._clockMode===2){pointerPos=this._degreeByMinute(this._minute);}
if(pointerPos===null&&this._clockMode===3){pointerPos=this._degreeBySecond(this._second);}
this._drawPointer(pointerPos.degree,pointerPos.distance);if(this._clockMode===1){this._drawHours();}
if(this._clockMode===2){this._drawMinutes();}
if(this._clockMode===3){this._drawSeconds();}}
_drawBackground(){this._canvas.beginPath();this._canvas.fillStyle=this._clockColor;this._canvas.arc((this._canvasSize/2),(this._canvasSize/2),this._clockRadius,0,Math.PI*2);this._canvas.fill();}
_drawHours(){for(let i=1;i<=24;i++){let dist=i<=12?this._distance.hourAm:this._distance.hourPm;let deg=i<=12?i*30:(i*30)-360;let size=i<=12?15:10;let text=i!=24?i:'00';this._addTextToArc(text,size,deg,dist);}}
_drawMinutes(){for(let i=0;i<12;i++){let text=i!=0?i*5:'00';this._addTextToArc(text,15,(i*30),this._distance.minute);}}
_drawSeconds(){for(let i=0;i<12;i++){let text=i!=0?i*5:'00';this._addTextToArc(text,15,(i*30),this._distance.second);}}
_drawPointer(degree,distance){let coords=this._degreeToCoordinates(degree,distance);this._canvas.beginPath();this._canvas.strokeStyle='#d9e7fd';this._canvas.lineWidth=2.0;this._canvas.moveTo(this._clockRadius,this._clockRadius);this._canvas.lineTo(coords.x,coords.y);this._canvas.stroke();this._canvas.beginPath();this._canvas.fillStyle='#d9e7fd';this._canvas.arc(coords.x,coords.y,12,0,Math.PI*2);this._canvas.fill();}
_addTextToArc(text,fontSize,degree,distance){let coords=this._degreeToCoordinates(degree,distance);this._canvas.font=fontSize+'px Arial,sans-serif';this._canvas.fillStyle='#000';let measure=this._canvas.measureText(text);this._canvas.fillText(text,coords.x-(measure.width/2),coords.y+(fontSize/2));}
_degreeToCoordinates(degree,distance){degree=degree+90;let a=(this._clockRadius-distance)*Math.sin(degree*((Math.PI)/180));let b=Math.sqrt(Math.pow((this._clockRadius-distance),2)-Math.pow(a,2));let x=0,y=0;if(degree<=270){x=(this._canvasSize/2)+b,y=(this._canvasSize/2)-a;}else{x=(this._canvasSize/2)-b,y=(this._canvasSize/2)-a;}
return{x:x,y:y};}
_degreeByHour(hour){let ret={degree:0,distance:0};ret.distance=hour<13&&hour>0?this._distance.hourAm:this._distance.hourPm;if(hour>11){hour-=12;}
ret.degree=hour*30;return ret;}
_degreeByMinute(minute){return{degree:minute/60*360,distance:this._distance.minute};}
_degreeBySecond(second){return{degree:second/60*360,distance:this._distance.second};}
_coordinatesToDegree(ox,oy){let x=ox-(this._canvasSize/2);let y=(this._canvasSize/2)-oy;let c=Math.sqrt(Math.pow(y,2)+Math.pow(x,2));let distance=this._clockRadius-c;let alphaRad=Math.asin(y/c);let degree=90-(alphaRad/(Math.PI/180));if(ox<(this._canvasSize/2)){degree=(180-degree)+180;}
return{degree:degree,distance:distance};}
_onCanvasMouseMove(e){let x=e.nodeEvent.layerX,y=e.nodeEvent.layerY,pointerPos={};let dg=this._coordinatesToDegree(x,y);pointerPos.degree=Math.round(dg.degree/30)*30;if(this._clockMode===1){pointerPos.distance=dg.distance>((this._distance.hourAm+this._distance.hourPm)/2)?this._distance.hourAm:this._distance.hourPm;}else if(this._clockMode===2){pointerPos.distance=this._distance.minute;}else if(this._clockMode===3){pointerPos.distance=this._distance.second;}else{throw new kijs.Error('invalid clock mode');}
this.paint(pointerPos);}
_onCanvasMouseLeave(){this.paint();}
_onCanvasMouseClick(e){let x=e.nodeEvent.layerX,y=e.nodeEvent.layerY;let dg=this._coordinatesToDegree(x,y);if(dg.distance<0){return;}
dg.degree=Math.round(dg.degree/30)*30;if(this._clockMode===1){let hour=12/360*dg.degree;if(dg.distance<((this._distance.hourAm+this._distance.hourPm)/2)){if(hour!==0){hour+=12;}}else if(hour===0){hour+=12;}
this._hour=hour;this._inputHourDom.node.value=this._zeroPad(this._hour);this._inputMinuteDom.focus();}else if(this._clockMode===2){let min=60/360*dg.degree;this._minute=min===60?0:min;this._inputMinuteDom.node.value=this._zeroPad(this._minute);if(this._inputSecondDom.node){this._inputSecondDom.focus();}else{this._inputMinuteDom.focus();this.raiseEvent('change',{value:this.value});}}else if(this._clockMode===3){let sec=60/360*dg.degree;this._second=sec===60?0:sec;if(this._inputSecondDom.node){this._inputSecondDom.node.value=this._zeroPad(this._second);this._inputSecondDom.focus();}
this.raiseEvent('change',{value:this.value});}}
_onTimeKeyUp(e){let type,fld=e.context;if(fld===this._inputHourDom){type='hour';}
if(fld===this._inputMinuteDom){type='minute';}
if(fld===this._inputSecondDom){type='second';}
fld.node.value=fld.node.value.replace(/[^0-9]/,'');if(type==='hour'){if(fld.node.value.match(/^[3-9]$/)){fld.node.value='0'+fld.node.value;}
if(fld.node.value.match(/^[0-9]+$/)&&parseInt(fld.node.value)>23){fld.node.value='00';}}else{if(fld.node.value.match(/^[0-9]+$/)&&parseInt(fld.node.value)>59){fld.node.value='00';}}
if(kijs.isString(e.nodeEvent.key)&&e.nodeEvent.key.match(/^[0-9]$/)){if(fld.node.value.length===2){switch(type){case'hour':this._inputMinuteDom.focus();this._inputMinuteDom.node.select();break;case'minute':if(this._inputSecondDom.node){this._inputSecondDom.focus();this._inputSecondDom.node.select();}
break;case'second':break;}}}else if(e.nodeEvent.key==='Backspace'&&fld.node.value===''&&(type==='minute'||type==='second')){switch(type){case'minute':this._inputHourDom.focus();break;case'second':this._inputMinuteDom.focus();break;}}}
_onTimeClick(e){e.context.node.select();}
_onTimeFocus(e){let fld=e.context;if(fld===this._inputHourDom){this._clockMode=1;}
if(fld===this._inputMinuteDom){this._clockMode=2;}
if(fld===this._inputSecondDom){this._clockMode=3;}
this.paint();}
_onTimeBlur(e){let fld=e.context;if(fld.node.value.match(/^[0-9]$/)){fld.node.value='0'+fld.node.value;}}
_onTimeChange(e){let fld=e.context;if(fld===this._inputHourDom){this._hour=parseInt(fld.node.value);}
if(fld===this._inputMinuteDom){this._minute=fld.node.value?parseInt(fld.node.value):0;if(!this._hasSeconds&&fld.node.value!==''){this.raiseEvent('change',{value:this.value});}}
if(fld===this._inputSecondDom){this._second=fld.node.value?parseInt(fld.node.value):0;if(fld.node.value!==''){this.raiseEvent('change',{value:this.value});}}
this.paint();}
_onNowButtonClick(){let time=new Date();this.value=''+time.getHours()+this._separator+time.getMinutes()+this._separator+time.getSeconds();this.raiseEvent('change',{value:this.value});}
_zeroPad(number,lenght=2){number=kijs.toString(number);while(number.length<lenght){number='0'+number;}
return number;}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._headerBar){this._headerBar.destruct();}
if(this._inputHourDom){this._inputHourDom.destruct();}
if(this._inputMinuteDom){this._inputMinuteDom.destruct();}
if(this._inputSecondDom){this._inputSecondDom.destruct();}
if(this._timeDom){this._timeDom.destruct();}
if(this._canvasDom){this._canvasDom.destruct();}
if(this._canvasContainerDom){this._canvasContainerDom.destruct();}
if(this._nowBtn){this._nowBtn.destruct();}
this._headerBar=null;this._inputHourDom=null;this._inputMinuteDom=null;this._inputSecondDom=null;this._timeDom=null;this._canvasDom=null;this._canvasContainerDom=null;this._nowBtn=null;super.destruct(true);}};kijs.gui.grid.Filter=class kijs_gui_grid_Filter extends kijs.gui.Element{constructor(config={}){super(false);this._dom.nodeTagName='tr';this._filters=[];this._filterReloadDefer=null;Object.assign(this._defaultConfig,{cls:'kijs-grid-filter',visible:false});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get filters(){let filters=[];for(let i=0;i<this._filters.length;i++){filters.push(this._filters[i].filter);}
return filters;}
get grid(){return this.parent;}
getFilters(){let filters=[];kijs.Array.each(this.filters,function(filter){if(filter.isFiltered){filters.push(filter.filter);}},this);return filters;}
reset(){kijs.Array.each(this.filters,function(filter){filter.reset();},this);}
_createFilters(){let newColumnConfigs=[];kijs.Array.each(this.grid.columnConfigs,function(columnConfig){let exist=false;for(let i=0;i<this._filters.length;i++){if(this._filters[i].columnConfig===columnConfig){exist=true;break;}}
if(!exist){newColumnConfigs.push(columnConfig);}},this);kijs.Array.each(newColumnConfigs,function(columnConfig){let filterConfig=columnConfig.filterConfig;let constr=kijs.getObjectFromNamespace(filterConfig.xtype);if(!constr){throw new kijs.Error('invalid filter xtype for column '+columnConfig.caption);}
columnConfig.on('change',this._onColumnConfigChange,this);filterConfig.parent=this;delete filterConfig.xtype;let filter=new constr(filterConfig);filter.on('filter',this._onFilter,this);this._filters.push({columnConfig:columnConfig,filter:filter});},this);}
_sortFilters(){this._filters.sort(function(a,b){if(a.columnConfig.position<b.columnConfig.position){return-1;}
if(a.columnConfig.position>b.columnConfig.position){return 1;}
return 0;});}
_onColumnConfigChange(e){if('visible'in e||'width'in e){kijs.Array.each(this.filters,function(filter){if(e.columnConfig===filter.columnConfig){filter.render();return false;}},this);}
if('position'in e){this.render();}}
_onFilter(e){if(this._filterReloadDefer){window.clearTimeout(this._filterReloadDefer);this._filterReloadDefer=null;}
this._filterReloadDefer=kijs.defer(function(){this.grid.reload();},20,this);}
render(superCall){super.render(true);this._createFilters();this._sortFilters();kijs.Array.each(this.filters,function(filter){filter.renderTo(this._dom.node);},this);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
kijs.Array.each(this.filters,function(filter){filter.unrender();},this);super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
kijs.Array.each(this.filters,function(filter){filter.columnConfig.off('change',this._onColumnConfigChange,this);filter.destruct();},this);this._filters=null;if(this._dataRow){this._dataRow=null;}
super.destruct(true);}};kijs.gui.grid.Grid=class kijs_gui_grid_Grid extends kijs.gui.Element{constructor(config={}){super(false);this._rpc=null;this._rows=[];this._columnConfigs=[];this._primaryKeys=[];this._facadeFnLoad=null;this._facadeFnSave=null;this._facadeFnArgs=null;this._facadeFnBeforeMsgFn=null;this._waitMaskTarget=null;this._waitMaskTargetDomProperty=null;this._autoLoad=true;this._remoteDataLoaded=0;this._remoteDataLimit=50;this._remoteDataStep=50;this._remoteDataTotal=null;this._getRemoteMetaData=true;this._isLoading=false;this._remoteSort=null;this._lastSelectedRow=null;this._currentRow=null;this._selectType='single';this._focusable=true;this._editable=false;this._filterable=false;this._intersectionObserver=null;this._dom.clsAdd('kijs-grid');this._topDom=new kijs.gui.Dom({cls:'kijs-top'});this._middleDom=new kijs.gui.Dom({cls:'kijs-center'});this._bottomDom=new kijs.gui.Dom({cls:'kijs-bottom'});this._tableContainerDom=new kijs.gui.Dom({cls:'kijs-tablecontainer',on:{scroll:this._onTableScroll,context:this}});this._tableDom=new kijs.gui.Dom({nodeTagName:'table'});this._headerContainerDom=new kijs.gui.Dom({cls:'kijs-headercontainer'});this._headerDom=new kijs.gui.Dom({nodeTagName:'table'});this._footerContainerDom=new kijs.gui.Dom({cls:'kijs-footercontainer'});this._footerDom=new kijs.gui.Dom({nodeTagName:'table'});this._leftContainerDom=new kijs.gui.Dom({cls:'kijs-leftcontainer'});this._leftDom=new kijs.gui.Dom({nodeTagName:'table'});this._rightContainerDom=new kijs.gui.Dom({cls:'kijs-rightcontainer'});this._rightDom=new kijs.gui.Dom({nodeTagName:'table'});this._headerLeftContainerDom=new kijs.gui.Dom({cls:'kijs-headercontainer-left'});this._headerLeftDom=new kijs.gui.Dom({nodeTagName:'table'});this._headerRightContainerDom=new kijs.gui.Dom({cls:'kijs-headercontainer-right'});this._headerRightDom=new kijs.gui.Dom({nodeTagName:'table'});this._footerLeftContainerDom=new kijs.gui.Dom({cls:'kijs-footercontainer-left'});this._footerLeftDom=new kijs.gui.Dom({nodeTagName:'table'});this._footerRightContainerDom=new kijs.gui.Dom({cls:'kijs-footercontainer-right'});this._footerRightDom=new kijs.gui.Dom({nodeTagName:'table'});this._header=new kijs.gui.grid.Header({parent:this});this._filter=new kijs.gui.grid.Filter({parent:this});Object.assign(this._defaultConfig,{waitMaskTarget:this,waitMaskTargetDomProperty:'dom'});Object.assign(this._configMap,{autoLoad:true,rpc:true,facadeFnLoad:true,facadeFnSave:true,facadeFnArgs:true,facadeFnBeforeMsgFn:true,waitMaskTarget:true,waitMaskTargetDomProperty:true,columnConfigs:{fn:'function',target:this.columnConfigAdd,context:this},primaryKeys:{target:'primaryKeys'},data:{target:'data'},editable:true,focusable:true,filterable:true,filterVisible:{target:'filterVisible'},selectType:{target:'selectType'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.on('keyDown',this._onKeyDown,this);}
get columnConfigs(){return this._columnConfigs;}
get current(){return this._currentRow;}
set current(cRow){if(!cRow&&!kijs.isEmpty(this._rows)){if(this._currentRow&&kijs.Array.contains(this._rows,this._currentRow)){cRow=this._currentRow;}
if(!cRow){let sel=this.getSelected();if(!kijs.isEmpty(sel)){if(kijs.isArray(sel)){sel=sel[0];}
cRow=sel;}}
if(!cRow){cRow=this._rows[0];}}
this._currentRow=cRow;kijs.Array.each(this._rows,function(row){if(row===cRow){row.dom.clsAdd('kijs-current');}else{row.dom.clsRemove('kijs-current');}
if(this._focusable&&row===cRow){cRow.dom.nodeAttributeSet('tabIndex',0);}else{row.dom.nodeAttributeSet('tabIndex',undefined);}},this);}
set data(val){if(!kijs.isArray(val)){val=[val];}
this.rowsRemoveAll();this.rowsAdd(val);}
get data(){let dataRows=[];kijs.Array.each(this._rows,function(row){dataRows.push(row.dataRow);},this);return dataRows;}
get editable(){return this._editable;}
set editable(val){this._editable=!!val;}
get facadeFnArgs(){return this._facadeFnArgs;}
set facadeFnArgs(val){this._facadeFnArgs=val;}
get firstRow(){if(this._rows.length>0){return this._rows[0];}
return null;}
get filter(){return this._filter;}
get filterable(){return this._filterable;}
set filterable(val){this._filterable=!!val;}
get filterVisible(){return this._filter.visible;}
set filterVisible(val){this._filter.visible=!!val;}
get lastRow(){if(this._rows.length>0){return this._rows[this._rows.length-1];}
return null;}
set primaryKeys(val){if(!kijs.isArray(val)){val=[val];}
kijs.Array.each(val,function(k){if(!kijs.isString(k)){throw new kijs.Error('invalid primary key');}},this);this._primaryKeys=val;}
get primaryKeys(){return this._primaryKeys;}
get rows(){return this._rows;}
get selectType(){return this._selectType;}
set selectType(val){if(!kijs.Array.contains(['single','multi','simple','none'],val)){throw new kijs.Error('invalid value for selectType');}
this._selectType=val;}
clearSelections(preventSelectionChange){this.unSelect(this._rows,preventSelectionChange);}
columnConfigAdd(columnConfigs){if(!kijs.isArray(columnConfigs)){columnConfigs=[columnConfigs];}
kijs.Array.each(columnConfigs,function(columnConfig){let inst=this._getInstance(columnConfig,'kijs.gui.grid.columnConfig.Text',kijs.gui.grid.columnConfig.ColumnConfig);inst.grid=this;this._columnConfigs.push(inst);},this);if(this.isRendered){this.render();}}
getColumnConfigByValueField(valueField){let cC=null;kijs.Array.each(this._columnConfigs,function(columnConfig){if(columnConfig.valueField===valueField){cC=columnConfig;return false;}},this);return cC;}
getSelected(){let ret=[];for(let i=0;i<this._rows.length;i++){if(this._rows[i].selected){ret.push(this._rows[i]);}}
if(this._selectType==='none'){return null;}else if(this._selectType==='single'){return ret.length?ret[0]:[];}else{return ret;}}
getSelectedIds(){let rows=this.getSelected(),hasPrimarys=this._primaryKeys.length>0,multiPrimarys=this._primaryKeys.length>1;if(!kijs.isArray(rows)){rows=[rows];}
if(!hasPrimarys){return rows;}else if(!multiPrimarys){let ids=[],primaryKey=this._primaryKeys[0];kijs.Array.each(rows,function(row){ids.push(row.dataRow[primaryKey]);},this);return ids;}else{let ids=[];kijs.Array.each(rows,function(row){let idRow={};kijs.Array.each(this._primaryKeys,function(pk){idRow[pk]=row.dataRow[pk];},this);ids.push(idRow);},this);return ids;}}
reload(restoreSelection=true){let selected=this.getSelectedIds();return this._remoteLoad(true).then((response)=>{if(selected&&restoreSelection){this.selectByIds(selected,false,true);}
return response;});}
rowsAdd(rows,startOffset=null){if(!kijs.isArray(rows)){rows=[rows];}
let renderStartOffset=this._rows.length,newRows=0,rowPos=0,offsets=[];kijs.Array.each(rows,function(row){let currentPos=null;if(row instanceof kijs.gui.grid.Row){row.parent=this;this._rows.push(row);currentPos=this._rows.length-1;}else{let pRow=this._getRowByPrimaryKey(row);if(pRow){pRow.updateDataRow(row);currentPos=this._rows.indexOf(pRow);}else{newRows++;this._rows.push(new kijs.gui.grid.Row({parent:this,dataRow:row,on:{click:this._onRowClick,dblClick:this._onRowDblClick,context:this}}));currentPos=this._rows.length-1;}}
if(startOffset!==null&&currentPos!==(startOffset+rowPos)){kijs.Array.move(this._rows,currentPos,startOffset+rowPos);}
offsets.push(startOffset+rowPos);rowPos++;},this);if(offsets.length>0){renderStartOffset=kijs.Array.min(offsets);}
if(this.isRendered&&this._rows.length>renderStartOffset){this._renderRows(renderStartOffset);}
return newRows;}
rowsRemove(rows){if(!kijs.isArray(rows)){rows=[rows];}
kijs.Array.each(rows,function(delRow){if(delRow instanceof kijs.gui.grid.Row){kijs.Array.remove(this._rows,delRow);delRow.destruct();}else{kijs.Array.each(this._rows,function(row){if(row.dataRow===delRow){this.rowsRemove([row]);}},this);}},this);}
rowsRemoveAll(){while(this._rows.length>0){this.rowsRemove(this._rows[0]);}}
select(rows,keepExisting=false,preventEvent=false){if(kijs.isEmpty(rows)){rows=[];}
if(!kijs.isArray(rows)){rows=[rows];}
if(!preventEvent){let beforeSelectionChangeArgs={rows:rows,keepExisting:keepExisting,cancel:false};this.raiseEvent('beforeSelectionChange',beforeSelectionChangeArgs);if(beforeSelectionChangeArgs.cancel===true){return;}}
if(!keepExisting){this.clearSelections(true);}
kijs.Array.each(rows,function(row){row.selected=true;},this);if(!preventEvent){this.raiseEvent('selectionChange',{rows:rows,unSelect:false});}}
selectByFilters(filters,keepExisting,preventSelectionChange){if(kijs.isEmpty(filters)){filters=[];}
if(kijs.isObject(filters)){filters=[filters];}
for(let i=0;i<filters.length;i++){if(kijs.isObject(filters[i])){filters[i]=[filters[i]];}}
const selRows=[];if(!kijs.isEmpty(filters)){kijs.Array.each(this._rows,function(row){const dataRow=row.dataRow;kijs.Array.each(filters,function(filterFields){let ok=false;kijs.Array.each(filterFields,function(filterField){if(kijs.isEmpty(filterField.value)||kijs.isEmpty(filterField.field)){throw new kijs.Error(`Unkown filter format.`);}
if(filterField.value===dataRow[filterField.field]){ok=true;}else{ok=false;return false;}},this);if(ok){selRows.push(row);return false;}},this);},this);}
this.select(selRows,keepExisting,preventSelectionChange);this._currentRow=null;this.current=null;}
selectByIds(ids,keepExisting=false,preventEvent=false){let hasPrimarys=this._primaryKeys.length>0,multiPrimarys=this._primaryKeys.length>1,rows=[];if(!kijs.isArray(ids)){ids=[ids];}
if(!hasPrimarys||!ids){return;}
if(!multiPrimarys&&!kijs.isObject(ids[0])){let pk=this._primaryKeys[0];for(let i=0;i<ids.length;i++){let val=ids[i];ids[i]={};ids[i][pk]=val;}}
for(let i=0;i<ids.length;i++){if(kijs.isObject(ids[i])){let match=false;kijs.Array.each(this._rows,function(row){match=true;for(let idKey in ids[i]){if(row.dataRow[idKey]!==ids[i][idKey]){match=false;}}
if(match){rows.push(row);}},this);}}
this.select(rows,keepExisting,preventEvent);}
sort(field,direction='ASC'){direction=direction.toUpperCase();if(!kijs.Array.contains(['ASC','DESC'],direction)){throw new kijs.Error('invalid value for sort direction');}
let columnConfig=null;kijs.Array.each(this._columnConfigs,function(cC){if(cC.valueField===field){columnConfig=cC;return false;}},this);if(columnConfig===null){throw new kijs.Error('invalid sort field name');}
this._remoteSort={field:field,direction:direction};this._remoteLoad(true);}
_getInstance(configOrInstance,defaultXType,requiredClass=null){let inst=null;if(kijs.isObject(configOrInstance)&&configOrInstance.constructor===window.Object){configOrInstance.xtype=configOrInstance.xtype||defaultXType;let constructor=kijs.getObjectFromNamespace(configOrInstance.xtype);if(constructor===false){throw new kijs.Error('invalid xtype '+configOrInstance.xtype);}
delete configOrInstance.xtype;inst=new constructor(configOrInstance);}else if(kijs.isObject(configOrInstance)){inst=configOrInstance;}
if(requiredClass!==null){if(!kijs.isObject(inst)||!(inst instanceof requiredClass)){throw new kijs.Error('instance not from class '+requiredClass.name);}}
return inst;}
_getRowByPrimaryKey(data){let rowMatch=null;if(this._primaryKeys&&this._primaryKeys.length>0){kijs.Array.each(this._rows,function(row){let primMatch=true;kijs.Array.each(this._primaryKeys,function(primaryKey){if(data[primaryKey]!==row.dataRow[primaryKey]){primMatch=false;return false;}},this);if(primMatch){rowMatch=row;return false;}},this);}
return rowMatch;}
_remoteLoad(force=false){return new Promise((resolve)=>{if(this._facadeFnLoad&&this._rpc&&!this._isLoading&&(this._remoteDataLoaded<this._remoteDataLimit||force)){this._isLoading=true;let args={};args.sort=this._remoteSort;args.getMetaData=this._getRemoteMetaData;args.filter=this._filter.getFilters();if(force){args.start=0;args.limit=this._remoteDataLimit;}else{args.start=this._remoteDataLoaded;args.limit=this._remoteDataLimit-this._remoteDataLoaded;if(this._remoteDataTotal!==null&&this._remoteDataLoaded>=this._remoteDataTotal){this._isLoading=false;return;}}
if(kijs.isObject(this._facadeFnArgs)){args=Object.assign(args,this._facadeFnArgs);}
let showWaitMask=force||this._remoteDataLoaded===0;this._rpc.do(this._facadeFnLoad,args,function(response){this._remoteProcess(response,args,force);resolve(response);},this,true,showWaitMask?this._waitMaskTarget:'none',this._waitMaskTargetDomProperty,false,this._facadeFnBeforeMsgFn);}});}
_remoteProcess(response,args,force){if(kijs.isArray(response.columns)){kijs.Array.clear(this._columnConfigs);this.columnConfigAdd(response.columns);this._getRemoteMetaData=false;}
if(response.primaryKeys){this.primaryKeys=response.primaryKeys;}
if(force){this.rowsRemoveAll();this._remoteDataLoaded=0;}
if(kijs.isArray(response.rows)){let addedRowsCnt=0;if(response.rows.length>0){addedRowsCnt=this.rowsAdd(response.rows,args.start);}
this._remoteDataLoaded+=addedRowsCnt;if(this._remoteDataLoaded>this._remoteDataLimit){this._remoteDataLimit=this._remoteDataLoaded;}}
if(kijs.isInteger(response.count)){this._remoteDataTotal=response.count;}else{if(response.rows&&response.rows.length<args.limit){this._remoteDataTotal=args.start+response.rows.length;}}
this.raiseEvent('afterLoad',response);this._isLoading=false;}
_renderRows(offset=0){for(let i=offset;i<this._rows.length;i++){this._rows[i].renderTo(this._tableDom.node);}
this._setIntersectionObserver();}
_selectRow(row,shift,ctrl){if(!row){return;}
switch(this._selectType){case'single':shift=false;ctrl=false;break;case'multi':break;case'simple':ctrl=true;break;case'none':default:return;}
if(shift&&this._lastSelectedRow){if(!ctrl){this.clearSelections(true);}
this.selectBetween(this._lastSelectedRow,row);}else{if(!ctrl){this.clearSelections(true);}
if(row.selected){this.unSelect(row);if(row===this._lastSelectedRow){this._lastSelectedRow=null;}}else{this.select(row,true);this._lastSelectedRow=row;}}}
_setIntersectionObserver(){if(window.IntersectionObserver){if(!this._intersectionObserver||this._intersectionObserver.root!==this._tableContainerDom.node){this._intersectionObserver=new IntersectionObserver(this._onIntersect.bind(this),{root:this._tableContainerDom.node,rootMargin:'100px',threshold:0});}
if(this._intersectionObserver){this._intersectionObserver.disconnect();if(this._rows.length>0){this._intersectionObserver.observe(this._rows[this._rows.length-1].node);}}}}
unSelect(rows,preventSelectionChange){if(!kijs.isArray(rows)){rows=[rows];}
kijs.Array.each(rows,function(row){row.selected=false;},this);if(!preventSelectionChange){this.raiseEvent('selectionChange',{rows:rows,unSelect:true});}}
selectBetween(row1,row2,preventSelectionChange){let found=false;let rows=[];kijs.Array.each(this._rows,function(row){if(!found){if(row===row1){found='row1';}else if(row===row2){found='row2';}}
if(found){rows.push(row);}
if((found==='row1'&&row===row2)||(found==='row2'&&row===row1)){return false;}},this);if(!kijs.isEmpty(rows)){this.select(rows,true,preventSelectionChange);}}
_onKeyDown(e){let keyCode=e.nodeEvent.keyCode,ctrl=e.nodeEvent.ctrlKey,shift=e.nodeEvent.shiftKey;if(!this.disabled){let targetRow=null;if(this._currentRow){switch(keyCode){case kijs.keys.DOWN_ARROW:targetRow=this._currentRow.next;break;case kijs.keys.UP_ARROW:targetRow=this._currentRow.previous;break;case kijs.keys.SPACE:targetRow=this._currentRow;break;}}
if(targetRow){this.current=targetRow;if(this._focusable){targetRow.focus();}
if(this.selectType!=='simple'||shift||ctrl||keyCode===kijs.keys.SPACE){this._selectRow(this._currentRow,shift,ctrl);}
e.nodeEvent.preventDefault();}}}
_onRowClick(e){let row=e.element,ctrl=e.nodeEvent.ctrlKey,shift=e.nodeEvent.shiftKey;if(!this.disabled){this.current=row;if(this._focusable){row.focus();}
this._selectRow(this._currentRow,shift,ctrl);}
this.raiseEvent('rowClick',e);}
_onRowDblClick(e){this.raiseEvent('rowDblClick',e);}
_onTableScroll(e){let scrollTop=e.dom.node.scrollTop;let scrollLeft=e.dom.node.scrollLeft;this._headerContainerDom.node.scrollLeft=scrollLeft;this._footerContainerDom.node.scrollLeft=scrollLeft;this._leftContainerDom.node.scrollTop=scrollTop;this._rightContainerDom.node.scrollTop=scrollTop;}
_onIntersect(intersections){if(intersections.length>0){kijs.Array.each(intersections,function(intersection){if(intersection.isIntersecting){this._remoteDataLimit+=this._remoteDataStep;this._remoteLoad();}},this);}}
render(superCall){super.render(true);this._topDom.renderTo(this._dom.node);this._middleDom.renderTo(this._dom.node);this._bottomDom.renderTo(this._dom.node);this._headerLeftContainerDom.renderTo(this._topDom.node);this._headerContainerDom.renderTo(this._topDom.node);this._headerRightContainerDom.renderTo(this._topDom.node);this._leftContainerDom.renderTo(this._middleDom.node);this._tableContainerDom.renderTo(this._middleDom.node);this._rightContainerDom.renderTo(this._middleDom.node);this._footerLeftContainerDom.renderTo(this._bottomDom.node);this._footerContainerDom.renderTo(this._bottomDom.node);this._footerRightContainerDom.renderTo(this._bottomDom.node);this._headerLeftDom.renderTo(this._headerLeftContainerDom.node);this._headerDom.renderTo(this._headerContainerDom.node);this._headerRightDom.renderTo(this._headerRightContainerDom.node);this._leftDom.renderTo(this._leftContainerDom.node);this._tableDom.renderTo(this._tableContainerDom.node);this._rightDom.renderTo(this._rightContainerDom.node);this._footerLeftDom.renderTo(this._footerLeftContainerDom.node);this._footerDom.renderTo(this._footerContainerDom.node);this._footerRightDom.renderTo(this._footerRightContainerDom.node);this._header.renderTo(this._headerDom.node);this._filter.renderTo(this._headerDom.node);this._renderRows();if(!superCall){this.raiseEvent('afterRender');}
if(this._autoLoad){this._remoteLoad();}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._header.unrender();this._filter.unrender();this._footerLeftDom.unrender();this._footerDom.unrender();this._footerRightDom.unrender();this._leftDom.unrender();this._tableDom.unrender();this._rightDom.unrender();this._headerLeftDom.unrender();this._headerDom.unrender();this._headerRightDom.unrender();this._footerLeftContainerDom.unrender();this._footerContainerDom.unrender();this._footerRightContainerDom.unrender();this._leftContainerDom.unrender();this._tableContainerDom.unrender();this._rightContainerDom.unrender();this._headerLeftContainerDom.unrender();this._headerContainerDom.unrender();this._headerRightContainerDom.unrender();this._topDom.unrender();this._middleDom.unrender();this._bottomDom.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._header.destruct();this._filter.destruct();this._footerLeftDom.destruct();this._footerDom.destruct();this._footerRightDom.destruct();this._leftDom.destruct();this._tableDom.destruct();this._rightDom.destruct();this._headerLeftDom.destruct();this._headerDom.destruct();this._headerRightDom.destruct();this._footerLeftContainerDom.destruct();this._footerContainerDom.destruct();this._footerRightContainerDom.destruct();this._leftContainerDom.destruct();this._tableContainerDom.destruct();this._rightContainerDom.destruct();this._headerLeftContainerDom.destruct();this._headerContainerDom.destruct();this._headerRightContainerDom.destruct();this._topDom.destruct();this._middleDom.destruct();this._bottomDom.destruct();this._header=null;this._filter=null;this._footerLeftDom=null;this._footerDom=null;this._footerRightDom=null;this._leftDom=null;this._tableDom=null;this._rightDom=null;this._headerLeftDom=null;this._headerDom=null;this._headerRightDom=null;this._footerLeftContainerDom=null;this._footerContainerDom=null;this._footerRightContainerDom=null;this._leftContainerDom=null;this._tableContainerDom=null;this._rightContainerDom=null;this._headerLeftContainerDom=null;this._headerContainerDom=null;this._headerRightContainerDom=null;this._topDom=null;this._middleDom=null;this._bottomDom=null;super.destruct(true);}};kijs.gui.grid.Header=class kijs_gui_grid_Header extends kijs.gui.Element{constructor(config={}){super(false);this._dom.nodeTagName='tr';this._cells=[];Object.assign(this._defaultConfig,{cls:'kijs-grid-header'});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get cells(){let cells=[];for(let i=0;i<this._cells.length;i++){cells.push(this._cells[i].cell);}
return cells;}
get grid(){return this.parent;}
_createCells(){let newColumnConfigs=[];kijs.Array.each(this.grid.columnConfigs,function(columnConfig){let exist=false;for(let i=0;i<this._cells.length;i++){if(this._cells[i].columnConfig===columnConfig){exist=true;break;}}
if(!exist){newColumnConfigs.push(columnConfig);}},this);kijs.Array.each(newColumnConfigs,function(columnConfig){let cell=new kijs.gui.grid.HeaderCell({parent:this,columnConfig:columnConfig});columnConfig.on('change',this._onColumnConfigChange,this);cell.loadFromColumnConfig();this._cells.push({columnConfig:columnConfig,cell:cell});},this);}
_sortCells(){this._cells.sort(function(a,b){if(a.columnConfig.position<b.columnConfig.position){return-1;}
if(a.columnConfig.position>b.columnConfig.position){return 1;}
return 0;});}
_onColumnConfigChange(e){if('visible'in e||'width'in e||'caption'in e||'resizable'in e||'sortable'in e){kijs.Array.each(this.cells,function(cell){if(e.columnConfig===cell.columnConfig){if(e.caption){cell.caption=e.caption;}else{cell.render();}
return false;}},this);}
if('position'in e){this.render();}}
render(superCall){super.render(true);this._createCells();this._sortCells();kijs.Array.each(this.cells,function(cell){cell.renderTo(this._dom.node);},this);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
kijs.Array.each(this.cells,function(cell){cell.unrender();},this);super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
kijs.Array.each(this.cells,function(cell){cell.destruct();},this);this._cells=null;if(this._dataRow){this._dataRow=null;}
super.destruct(true);}};kijs.gui.grid.HeaderCell=class kijs_gui_grid_HeaderCell extends kijs.gui.Element{constructor(config={}){super(false);this._dom.nodeTagName='td';this._columnConfig=null;this._initialPos=0;this._splitterMove=false;this._dom.nodeAttributeSet('draggable',true);kijs.DragDrop.addDragEvents(this,this._dom);kijs.DragDrop.addDropEvents(this,this._dom);this.on('ddStart',this._onDdStart,this);this.on('ddOver',this._onDdOver,this);this.on('ddDrop',this._onDdDrop,this);this._captionContainerDom=new kijs.gui.Dom({cls:'kijs-caption'});this._captionDom=new kijs.gui.Dom({nodeTagName:'span',htmlDisplayType:'code'});this._sortDom=new kijs.gui.Dom({nodeTagName:'span',cls:'kijs-sort',htmlDisplayType:'code'});this._menuButtonEl=new kijs.gui.MenuButton({parent:this,elements:[{name:'btn-sort-asc',caption:kijs.getText('Aufsteigend sortieren'),iconChar:'&#xf15d',on:{click:function(){this.header.grid.sort(this.columnConfig.valueField,'ASC');this._menuButtonEl.menuCloseAll();},context:this}},{name:'btn-sort-desc',caption:kijs.getText('Absteigend sortieren'),iconChar:'&#xf15e',on:{click:function(){this.header.grid.sort(this.columnConfig.valueField,'DESC');this._menuButtonEl.menuCloseAll();},context:this}},{name:'btn-columns',caption:kijs.getText('Spalten')+'...',iconChar:'&#xf0db',on:{click:function(){(new kijs.gui.grid.columnWindow({parent:this})).show();this._menuButtonEl.menuCloseAll();},context:this}},{name:'btn-filters',caption:kijs.getText('Filter')+'...',iconChar:'&#xf0b0',on:{click:function(){this.parent.grid.filter.visible=!this.parent.grid.filter.visible;this._menuButtonEl.menuCloseAll();},context:this}}]});this._splitterDom=new kijs.gui.Dom({cls:'kijs-splitter',on:{mouseDown:this._onSplitterMouseDown,context:this}});this._overlayDom=new kijs.gui.Dom({cls:'kijs-splitter-overlay'});Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{columnConfig:true,sort:{target:'sort'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get caption(){return this._captionDom.html;}
set caption(val){this.setCaption(val);}
get columnConfig(){return this._columnConfig;}
set columnConfig(val){this._columnConfig=val;}
get header(){return this.parent;}
get index(){if(this.header){return this.header.cells.indexOf(this);}
return null;}
get sort(){if(this._sortDom.html===String.fromCharCode(0xf0dd)){return'DESC';}else if(this._sortDom.html===String.fromCharCode(0xF0de)){return'ASC';}
return null;}
set sort(val){if(val==='DESC'){this._sortDom.html=String.fromCharCode(0xf0dd);}else if(val==='ASC'){this._sortDom.html=String.fromCharCode(0xF0de);}else{this._sortDom.html='';}}
setCaption(caption,updateColumnConfig=true){this._captionDom.html=caption;if(updateColumnConfig){this._columnConfig.caption=caption;}
if(this.isRendered){this.render();}}
loadFromColumnConfig(){let c=this._columnConfig.caption;this.setCaption(c,false);this._menuButtonEl.spinbox.down('btn-filters').visible=!!this.parent.grid.filterable;}
_updateOverlayPosition(xAbs,yAbs){const parentPos=kijs.Dom.getAbsolutePos(this.parent.grid.dom.node);const newPos={x:xAbs-parentPos.x,y:yAbs-parentPos.x};this._overlayDom.left=newPos.x;}
_onDdStart(e){if(this._splitterMove){return false;}}
_onDdOver(e){if(this._splitterMove||this.header.cells.indexOf(e.sourceElement)===-1||e.sourceElement.columnConfig.sortable===false){e.position.allowAbove=false;e.position.allowBelow=false;e.position.allowLeft=false;e.position.allowOnto=false;e.position.allowRight=false;}else{e.position.allowAbove=false;e.position.allowBelow=false;e.position.allowLeft=true;e.position.allowOnto=false;e.position.allowRight=true;}}
_onDdDrop(e){let tIndex=this.header.cells.indexOf(e.targetElement);let sIndex=this.header.cells.indexOf(e.sourceElement);let pos=e.position.position;if(!this._splitterMove&&tIndex!==-1&&sIndex!==-1&&tIndex!==sIndex&&(pos==='left'||pos==='right')){if(pos==='right'){tIndex+=1;}
this.header.grid.columnConfigs[sIndex].position=tIndex;}}
_onSplitterMouseDown(e){if(!this._columnConfig.resizable){return;}
this._splitterMove=true;this._initialPos=e.nodeEvent.clientX;this._updateOverlayPosition(e.nodeEvent.clientX,e.nodeEvent.clientY);this._overlayDom.render();this.parent.grid.dom.node.appendChild(this._overlayDom.node);kijs.Dom.addEventListener('mousemove',document,this._onSplitterMouseMove,this);kijs.Dom.addEventListener('mouseup',document,this._onSplitterMouseUp,this);}
_onSplitterMouseMove(e){this._updateOverlayPosition(e.nodeEvent.clientX,e.nodeEvent.clientY);}
_onSplitterMouseUp(e){kijs.Dom.removeEventListener('mousemove',document,this);kijs.Dom.removeEventListener('mouseup',document,this);this._overlayDom.unrender();let offset=e.nodeEvent.clientX-this._initialPos;if(this._columnConfig.resizable){this._columnConfig.width=Math.max(this._columnConfig.width+offset,40);}
this._splitterMove=false;}
render(superCall){super.render(true);this._captionContainerDom.renderTo(this._dom.node);this._captionDom.renderTo(this._captionContainerDom.node);this._sortDom.renderTo(this._captionContainerDom.node);this._menuButtonEl.renderTo(this._dom.node);this._splitterDom.renderTo(this._dom.node);this._dom.width=this._columnConfig.width;this.visible=this._columnConfig.visible;if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._captionDom.unrender();this._captionContainerDom.unrender();this._menuButtonEl.unrender();this._splitterDom.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._captionDom.destruct();this._captionContainerDom.destruct();this._menuButtonEl.destruct();this._splitterDom.destruct();this._captionDom=null;this._menuButtonEl=null;this._splitterDom=null;super.destruct(true);}};kijs.gui.grid.Row=class kijs_gui_grid_Row extends kijs.gui.Element{constructor(config={}){super(false);this._dom.nodeTagName='tr';this._dataRow=null;this._cells=[];Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{dataRow:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get cells(){let cells=[];for(let i=0;i<this._cells.length;i++){cells.push(this._cells[i].cell);}
return cells;}
get current(){return!!this._dom.clsHas('kijs-current');}
set current(val){if(val){this._dom.clsAdd('kijs-current');}else{this._dom.clsRemove('kijs-current');}}
get grid(){return this.parent;}
get dataRow(){return this._dataRow;}
set dataRow(val){this._dataRow=val;}
get impair(){return this.rowIndex%2===0;}
get isDirty(){let isDirty=false;kijs.Array.each(this._cells,function(cell){if(cell.isDirty){isDirty=true;return false;}},this);return isDirty;}
get next(){let i=this.rowIndex+1;if(i>this.grid.rows.length-1){return null;}
return this.grid.rows[i];}
get previous(){let i=this.rowIndex-1;if(i<0){return null;}
return this.grid.rows[i];}
get rowIndex(){return this.grid.rows.indexOf(this);}
get selected(){return!!this._dom.clsHas('kijs-selected');}
set selected(val){if(val){this._dom.clsAdd('kijs-selected');}else{this._dom.clsRemove('kijs-selected');}}
updateDataRow(newDataRow){let isChanged=false;if(this.isRendered){kijs.Array.each(this.grid.columnConfigs,function(columnConfig){if(newDataRow[columnConfig.valueField]!==this.dataRow[columnConfig.valueField]){isChanged=true;return false;}},this);}
this.dataRow=newDataRow;if(isChanged){this.render();}}
_createCells(){let newColumnConfigs=[];kijs.Array.each(this.grid.columnConfigs,function(columnConfig){let exist=false;for(let i=0;i<this._cells.length;i++){if(this._cells[i].columnConfig===columnConfig){exist=true;break;}}
if(!exist){newColumnConfigs.push(columnConfig);}},this);kijs.Array.each(newColumnConfigs,function(columnConfig){let cellConfig=columnConfig.cellConfig;let constr=kijs.getObjectFromNamespace(cellConfig.xtype);if(!constr){throw new kijs.Error('invalid cell xtype for column '+columnConfig.caption);}
columnConfig.on('change',this._onColumnConfigChange,this);cellConfig.parent=this;delete cellConfig.xtype;let cell=new constr(cellConfig);cell.loadFromDataRow();this._cells.push({columnConfig:columnConfig,cell:cell});},this);}
_sortCells(){this._cells.sort(function(a,b){if(a.columnConfig.position<b.columnConfig.position){return-1;}
if(a.columnConfig.position>b.columnConfig.position){return 1;}
return 0;});}
_onColumnConfigChange(e){if('visible'in e||'width'in e){kijs.Array.each(this.cells,function(cell){if(e.columnConfig===cell.columnConfig){cell.render();return false;}},this);}
if('position'in e){this.render();}}
render(superCall){super.render(true);this._createCells();this._sortCells();kijs.Array.each(this.cells,function(cell){cell.renderTo(this._dom.node);},this);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
kijs.Array.each(this.cells,function(cell){cell.unrender();},this);super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
kijs.Array.each(this.cells,function(cell){cell.columnConfig.off('change',this._onColumnConfigChange,this);cell.destruct();},this);this._cells=null;this._dataRow=null;super.destruct(true);}};kijs.gui.grid.cell.Cell=class kijs_gui_grid_cell_Cell extends kijs.gui.Element{constructor(config={}){super(false);this._dom.nodeTagName='td';this._originalValue=null;this._columnConfig=null;this._editorXType='kijs.gui.field.Text';this._editorArgs=null;Object.assign(this._defaultConfig,{htmlDisplayType:'code'});Object.assign(this._configMap,{columnConfig:true,editorXType:true,editorArgs:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this._dom.on('dblClick',this._onDblClick,this);}
get columnConfig(){return this._columnConfig;}
set columnConfig(val){this._columnConfig=val;}
get isDirty(){return this._originalValue!==this.value;}
set isDirty(val){if(val===false){this._originalValue=this.value;}else{this._originalValue=null;}}
get originalValue(){return this._originalValue;}
get row(){return this.parent;}
get value(){return this._dom.html;}
set value(val){this.setValue(val);}
resetValue(silent=false){this.setValue(this.originalValue,silent);}
setValue(value,silent=false,markDirty=true,updateDataRow=true){this._setDomHtml(value);if(updateDataRow){this._setRowDataRow(value);}
if(!markDirty){this.isDirty=false;}
if(!silent){this.raiseEvent('change',{value:this.value});}
if(this.isRendered){this.render();}}
loadFromDataRow(){let vF=this._columnConfig.valueField;if(this.row&&this.row.dataRow&&kijs.isDefined(this.row.dataRow[vF])){this.setValue(this.row.dataRow[vF],true,false,false);}}
_getEditorArgs(){return{labelHide:true,value:this.value,parent:this,on:{blur:this._onFieldBlur,keyDown:function(e){e.nodeEvent.stopPropagation();},click:function(e){e.nodeEvent.stopPropagation();},context:this}};}
_setDomHtml(value){this._dom.html=value;}
_setRowDataRow(value){let vF=this._columnConfig.valueField;if(this.row){this.row.dataRow[vF]=value;}}
_onDblClick(e){if(this.row.grid.editable){let editor=kijs.getObjectFromNamespace(this._editorXType);if(!editor){throw new kijs.Error('invalid xtype for cell editor');}
let eArgs=this._getEditorArgs();if(kijs.isObject(this._editorArgs)){eArgs=Object.assign(eArgs,this._editorArgs);}
let edInst=new editor(eArgs);kijs.Dom.removeAllChildNodes(this._dom.node);edInst.renderTo(this._dom.node);}}
_onFieldBlur(e){let fld=e.element;let val=fld.value;fld.unrender();this.setValue(val);}
render(superCall){super.render(true);this._dom.width=this._columnConfig.width;this.visible=this._columnConfig.visible;if(this.isDirty){this._dom.clsAdd('kijs-grid-cell-dirty');}else{this._dom.clsRemove('kijs-grid-cell-dirty');}
if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
super.destruct(true);}};kijs.gui.grid.columnConfig.Checkbox=class kijs_gui_grid_columnConfig_Checkbox extends kijs.gui.grid.columnConfig.ColumnConfig{constructor(config={}){super(false);this._cellXtype='kijs.gui.grid.cell.Checkbox';this._filterXtype='kijs.gui.grid.filter.Checkbox';this._disabled=false;Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{disabled:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.cellConfig={disabled:this._disabled};}};kijs.gui.grid.columnConfig.Date=class kijs_gui_grid_columnConfig_Date extends kijs.gui.grid.columnConfig.ColumnConfig{constructor(config={}){super(false);this._cellXtype='kijs.gui.grid.cell.Date';this._filterXtype='kijs.gui.grid.filter.Date';this._hasTime=false;this._format='d.m.Y';Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{hasTime:true,format:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.cellConfig={hasTime:this._hasTime,format:this._format};}};kijs.gui.grid.columnConfig.Icon=class kijs_gui_grid_columnConfig_Icon extends kijs.gui.grid.columnConfig.ColumnConfig{constructor(config={}){super(false);this._cellXtype='kijs.gui.grid.cell.Icon';this._filterXtype='kijs.gui.grid.filter.Icon';this._iconCharField=null;this._iconClsField=null;this._iconColorField=null;this._iconsCnt=null;this._captionField=null;Object.assign(this._defaultConfig,{iconsCnt:155});Object.assign(this._configMap,{iconCharField:true,iconClsField:true,iconColorField:true,iconsCnt:true,captionField:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get captionField(){return this._captionField;}
set captionField(val){this._captionField=val;}
get iconCharField(){return this._iconCharField;}
set iconCharField(val){this._iconCharField=val;}
get iconClsField(){return this._iconClsField;}
set iconClsField(val){this._iconClsField=val;}
get iconColorField(){return this._iconColorField;}
set iconColorField(val){this._iconColorField=val;}
get iconsCnt(){return this._iconsCnt;}
set iconsCnt(val){this._iconsCnt=val;}
get valueField(){return this._valueField;}
set valueField(val){this._valueField=val;}};kijs.gui.grid.columnConfig.Number=class kijs_gui_grid_columnConfig_Number extends kijs.gui.grid.columnConfig.ColumnConfig{constructor(config={}){super(false);this._cellXtype='kijs.gui.grid.cell.Number';this._filterXtype='kijs.gui.grid.filter.Number';this._decimalPrecision=null;this._decimalPoint='.';this._decimalThousandSep='\'';this._numberStyles=[];this._unitBefore='';this._unitAfter='';Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{decimalPrecision:true,decimalPoint:true,decimalThousandSep:true,numberStyles:true,unitBefore:true,unitAfter:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.cellConfig={decimalPrecision:this._decimalPrecision,decimalPoint:this._decimalPoint,decimalThousandSep:this._decimalThousandSep,numberStyles:this._numberStyles,unitBefore:this._unitBefore,unitAfter:this._unitAfter};}};kijs.gui.grid.columnConfig.Text=class kijs_gui_grid_columnConfig_Text extends kijs.gui.grid.columnConfig.ColumnConfig{constructor(config={}){super(false);this._cellXtype='kijs.gui.grid.cell.Text';this._filterXtype='kijs.gui.grid.filter.Text';Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}};kijs.gui.grid.filter.Filter=class kijs_gui_grid_filter_Filter extends kijs.gui.Element{constructor(config={}){super(false);this._dom.nodeTagName='td';this._columnConfig;this._filter={};this._searchContainer=new kijs.gui.Dom();this._removeFilterIcon=new kijs.gui.Dom({cls:'kijs-grid-filter-reset'});this._menuButton=new kijs.gui.MenuButton({parent:this,icon2Char:'&#xf0b0',elements:this._getMenuButtons()});Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{columnConfig:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get columnConfig(){return this._columnConfig;}
get filter(){return{type:'',valueField:this._columnConfig.valueField};}
get isFiltered(){return false;}
reset(){this._applyToGrid();}
_applyToGrid(){this.raiseEvent('filter',this.filter);}
_getDefaultMenuButtons(){return[{caption:kijs.getText('Filter löschen'),iconChar:'&#xf00d',on:{click:function(){this.reset();this._menuButton.menuCloseAll();},context:this}},{caption:kijs.getText('Alle Filter löschen'),iconChar:'&#xf00d',on:{click:function(){this.parent.reset();this._menuButton.menuCloseAll();},context:this}}];}
_getMenuButtons(){return this._getDefaultMenuButtons();}
render(superCall){super.render(true);this._searchContainer.renderTo(this._dom.node);this._removeFilterIcon.renderTo(this._dom.node);this._menuButton.renderTo(this._removeFilterIcon.node);this._dom.width=this._columnConfig.width;this.visible=this._columnConfig.visible;if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._searchContainer.unrender();this._removeFilterIcon.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._searchContainer.destruct();this._removeFilterIcon.destruct();this._searchContainer=null;this._removeFilterIcon=null;super.destruct(true);}};kijs.gui.ButtonGroup=class kijs_gui_ButtonGroup extends kijs.gui.Container{constructor(config={}){super(false);this._captionDom=new kijs.gui.Dom({cls:'kijs-caption',nodeTagName:'span'});this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-buttongroup');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{caption:{target:'html',context:this._captionDom},captionCls:{fn:'function',target:this._captionDom.clsAdd,context:this._captionDom},captionHtmlDisplayType:{target:'htmlDisplayType',context:this._captionDom},captionStyle:{fn:'assign',target:'style',context:this._captionDom}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get caption(){return this._captionDom.html;}
set caption(val){this._captionDom.html=val;if(this.isRendered){this.render();}}
get captionDom(){return this._captionDom;}
get captionHtmlDisplayType(){return this._captionDom.htmlDisplayType;}
set captionHtmlDisplayType(val){this._captionDom.htmlDisplayType=val;}
get isEmpty(){return this._captionDom.isEmpty&&kijs.isEmpty(this._elements);}
render(superCall){super.render(true);if(!this._captionDom.isEmpty){this._captionDom.renderTo(this._dom.node,this._innerDom.node);}else{this._captionDom.unrender();}
if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._captionDom.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._captionDom){this._captionDom.destruct();}
this._captionDom=null;super.destruct(true);}};kijs.gui.ContainerStack=class kijs_gui_ContainerStack extends kijs.gui.Container{constructor(config={}){super(false);this._activeElOnConstruct=null;this._animationTypes=['none','fade','slideLeft','slideRight','slideTop','slideBottom'];this._afterAnimationDefer=null;this._defaultAnimation='none';this._defaultDuration=500;this._domElements=[];this._topZIndex=1;this._dom.clsAdd('kijs-containerstack');Object.assign(this._defaultConfig,{activeEl:0});Object.assign(this._configMap,{defaultAnimation:{target:'defaultAnimation'},defaultDuration:{target:'defaultDuration'},activeEl:{target:'_activeElOnConstruct'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
if(this._elements.length>0&&this._activeElOnConstruct!==null){this.activateAnimated(this._activeElOnConstruct,'none');}}
get activeEl(){return this._getTopElement();}
set activeEl(val){this.activateAnimated(val);}
get defaultAnimation(){return this._defaultAnimation;}
set defaultAnimation(val){if(!kijs.Array.contains(this._animationTypes,val)){throw new kijs.Error(`config "defaultAnimation" is not valid.`);}
this._defaultAnimation=val;}
get defaultDuration(){return this._defaultDuration;}
set defaultDuration(val){this._defaultDuration=val;};add(elements,index=null){super.add(elements,index);this._setSubElementsVisible();}
activateAnimated(el,animation=null,duration=null){animation=animation||this._defaultAnimation;duration=duration||this._defaultDuration;let activeEl=this.activeEl;if(!kijs.Array.contains(this._animationTypes,animation)){throw new kijs.Error(`animation type not valid.`);}
if(kijs.isInteger(el)){el=this._elements[el];}else if(kijs.isString(el)){el=this.getElementsByName(el,0,true).shift();}
if(!el||!kijs.Array.contains(this._elements,el)){throw new kijs.Error(`element for animated activation not found.`);}
if(activeEl===el){return;}
duration=animation==='none'?0:duration;let dom=this._getDomOfElement(el);kijs.Array.each(this._animationTypes,function(at){dom.clsRemove(['kijs-animation-'+at.toLowerCase(),'kijs-animation-'+at.toLowerCase()+'-out']);},this);dom.clsAdd('kijs-animation-'+animation.toLowerCase());dom.style.animationDuration=duration+'ms';this._topZIndex++;dom.style.zIndex=this._topZIndex;el.visible=true;if(activeEl){let activeDom=this._getDomOfElement(activeEl);kijs.Array.each(this._animationTypes,function(at){activeDom.clsRemove(['kijs-animation-'+at.toLowerCase(),'kijs-animation-'+at.toLowerCase()+'-out']);},this);activeDom.clsAdd('kijs-animation-'+animation.toLowerCase()+'-out');activeDom.style.animationDuration=duration+'ms';}
if(this._afterAnimationDefer){window.clearTimeout(this._afterAnimationDefer);}
this._afterAnimationDefer=kijs.defer(function(){this._afterAnimationDefer=null;this._setSubElementsVisible();this._removeAllAnimationClasses();},duration,this);if(this._innerDom.node){this.render();}}
remove(elements){if(!kijs.isArray(elements)){elements=[elements];}
super.remove(elements);kijs.Array.each(elements,function(element){kijs.Array.removeIf(this._domElements,function(domEl){if(domEl.element===element){domEl.dom.unrender();domEl.dom.destruct();return true;}},this);},this);this._setSubElementsVisible();}
removeAll(preventRender){super.removeAll(preventRender);kijs.Array.each(this._domElements,function(domEl){domEl.dom.unrender();domEl.dom.destruct();},this);kijs.Array.clear(this._domElements);}
render(superCall){kijs.gui.Element.prototype.render.call(this,arguments);this._innerDom.renderTo(this._dom.node);kijs.Array.each(this._elements,function(element){let dom=this._getDomOfElement(element);dom.renderTo(this._innerDom.node);element.renderTo(dom.node);},this);if(!superCall){this.raiseEvent('afterRender');}}
_getDomOfElement(element){for(let i=0;i<this._domElements.length;i++){if(this._domElements[i].element===element){return this._domElements[i].dom;}}
let newDom=new kijs.gui.Dom({cls:['kijs-containerstack-element'],style:{zIndex:0}});this._domElements.push({element:element,dom:newDom});return newDom;}
_getTopElement(){let topIndex=0,topElement=null;kijs.Array.each(this._elements,function(element){let domEl=this._getDomOfElement(element);if(kijs.isNumeric(domEl.style.zIndex)&&parseInt(domEl.style.zIndex)>=topIndex){topIndex=parseInt(domEl.style.zIndex);topElement=element;}},this);return topElement;}
_setSubElementsVisible(){let topEl=this._getTopElement();kijs.Array.each(this._elements,function(element){if(element!==topEl&&kijs.isBoolean(element.visible)){element.visible=false;}else if(element===topEl&&kijs.isBoolean(element.visible)){element.visible=true;}},this);}
_removeAllAnimationClasses(){kijs.Array.each(this._elements,function(element){kijs.Array.each(this._animationTypes,function(at){this._getDomOfElement(element).clsRemove(['kijs-animation-'+at.toLowerCase(),'kijs-animation-'+at.toLowerCase()+'-out']);},this);},this);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
kijs.Array.each(this._innerDomStack,function(dom){dom.destruct();},this);this._innerDomStack=null;super.destruct(true);}};kijs.gui.CornerTipContainer=class kijs_gui_CornerTipContainer extends kijs.gui.Container{constructor(config={}){super(false);this._dismissDelay=null;this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-cornertipcontainer');Object.assign(this._defaultConfig,{dismissDelay:5000,width:230});Object.assign(this._configMap,{dismissDelay:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
static show(caption,html,icon='alert'){let instance=kijs_gui_CornerTipContainer._singletonInstance;if(!instance){instance=new kijs.gui.CornerTipContainer();instance.renderTo(document.body);kijs_gui_CornerTipContainer._singletonInstance=instance;}
switch(icon){case'alert':instance.alert(caption,html);break;case'info':instance.info(caption,html);break;case'warning':instance.warning(caption,html);break;case'error':instance.error(caption,html);break;default:throw new kijs.Error(`Unknown value on argument "icon"`);}}
get dismissDelay(){return this._dismissDelay;}
set dismissDelay(val){this._dismissDelay=val;}
alert(caption,msg){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg});}
error(caption,msg){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,icon:{iconChar:'&#xf06a',style:{color:'#be6280'}}});}
info(caption,msg){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,icon:{iconChar:'&#xf05a',style:{color:'#4398dd'}}});}
show(config){const elements=[];if(config.icon){if(!(config.icon instanceof kijs.gui.Icon)){config.icon.xtype='kijs.gui.Icon';}
elements.push(config.icon);}
elements.push({xtype:'kijs.gui.Element',html:config.msg,htmlDisplayType:'html',cls:'kijs-msgbox-inner'});const tip=new kijs.gui.Panel({caption:config.caption,iconChar:config.iconChar?config.iconChar:'',closable:true,shadow:true,elements:elements,on:{destruct:this._onCornerTipDestruct,context:this}});this.add(tip);if(this._dismissDelay){kijs.defer(function(){if(tip){tip.destruct();}},this._dismissDelay,this);}}
warning(caption,msg){if(kijs.isArray(msg)){msg=this._convertArrayToHtml(msg);}
this.show({caption:caption,msg:msg,icon:{iconChar:'&#xf071',style:{color:'#ff9900'}}});}
_convertArrayToHtml(messages){if(messages.length===1){return messages[0];}
let ret='<ul>';kijs.Array.each(messages,function(msg){ret+='<li>'+msg+'</li>';},this);ret+='</ul>';return ret;}
_onCornerTipDestruct(e){this.remove(e.element);}
destruct(){super.destruct();}};kijs.gui.DataView=class kijs_gui_DataView extends kijs.gui.Container{constructor(config={}){super(false);this._currentEl=null;this._lastSelectedEl=null;this._data=[];this._facadeFnLoad=null;this._facadeFnArgs={};this._filters=[];this._focusable=true;this._rpc=null;this._selectType='none';this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-dataview');Object.assign(this._defaultConfig,{focusable:true,selectType:'single'});Object.assign(this._configMap,{autoLoad:{target:'autoLoad'},data:{target:'data'},disabled:{target:'disabled'},facadeFnLoad:true,facadeFnArgs:true,focusable:{target:'focusable'},rpc:{target:'rpc'},selectType:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.on('keyDown',this._onKeyDown,this);this.on('elementClick',this._onElementClick,this);}
get autoLoad(){return this.hasListener('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}
set autoLoad(val){if(val){this.on('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}else{this.off('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}}
get current(){return this._currentEl;}
set current(el){if(!el&&!kijs.isEmpty(this._elements)){if(this._currentEl&&kijs.Array.contains(this._elements,this._currentEl)){el=this._currentEl;}
if(!el){let sel=this.getSelected();if(!kijs.isEmpty(sel)){if(kijs.isArray(sel)){sel=sel[0];}
el=sel;}}
if(!el){el=this._elements[0];}}
this._currentEl=el;kijs.Array.each(this._elements,function(elem){if(elem===el){elem.dom.clsAdd('kijs-current');}else{elem.dom.clsRemove('kijs-current');}
if(this._focusable&&elem===el){el.dom.nodeAttributeSet('tabIndex',0);}else{elem.dom.nodeAttributeSet('tabIndex',undefined);}},this);}
get data(){return this._data;}
set data(val){this._data=val;this._createElements(this._data);this.current=null;}
get disabled(){return this._dom.clsHas('kijs-disabled');}
set disabled(val){if(val){this._dom.clsAdd('kijs-disabled');}else{this._dom.clsRemove('kijs-disabled');}
kijs.Array.each(this._elements,function(el){if('disabled'in el){el.disabled=!!val;}},this);}
get facadeFnArgs(){return this._facadeFnArgs;}
set facadeFnArgs(val){this._facadeFnArgs=val;}
get facadeFnLoad(){return this._facadeFnLoad;}
set facadeFnLoad(val){this._facadeFnLoad=val;}
get filters(){return this._filters;}
set filters(val){if(!val){this._filters=[];}else{if(!kijs.isArray(val)){val=[val];}
kijs.Array.each(val,function(filter){if(!kijs.isObject(filter)||!('field'in filter)||!('value'in filter)||!kijs.isString(filter.field)||!kijs.isString(filter.value)){throw new kijs.Error(`invalid argument for filters in kijs.gui.DataView`);}
if(!('compare'in filter)||!kijs.Array.contains(['begin','part','end','full'],filter.compare)){filter.compare='begin';}},this);this._filters=val;}}
get focusable(){return this._focusable;}
set focusable(val){this._focusable=val;if(val){}else{}}
get rpc(){return this._rpc;}
set rpc(val){if(val instanceof kijs.gui.Rpc){this._rpc=val;}else if(kijs.isString(val)){if(this._rpc){this._rpc.url=val;}else{this._rpc=new kijs.gui.Rpc({url:val});}}else{throw new kijs.Error(`Unkown format on config "rpc"`);}}
get selectType(){return this._selectType;}
set selectType(val){this._selectType=val;}
applyFilters(filters){this.filters=filters;if(this.isRendered){this._createElements(this._data);this.render();}}
addData(data){if(!kijs.isArray(data)){data=[data];}
this._data=kijs.Array.concat(this._data,data);this._createElements(data,false);}
clearSelections(preventSelectionChange){this.unSelect(this._elements,preventSelectionChange);}
createElement(dataRow,index){let html='';html+='<div>';html+=' <span class="label">Nr. '+index+'</span>';html+='</div>';kijs.Object.each(dataRow,function(key,val){html+='<div>';html+=' <span class="label">'+key+': </span>';html+=' <span class="value">'+val+'</span>';html+='</div>';},this);return new kijs.gui.DataViewElement({dataRow:dataRow,html:html});}
getSelected(){let ret=[];for(let i=0,len=this._elements.length;i<len;i++){if(this._elements[i].selected){ret.push(this._elements[i]);}}
if(this._selectType==='none'){return null;}else if(this._selectType==='single'){return ret.length?ret[0]:null;}else{return ret;}}
load(args){return new Promise((resolve)=>{if(kijs.isObject(this._facadeFnArgs)&&!kijs.isEmpty(this._facadeFnArgs)){if(kijs.isObject(args)){Object.assign(args,this._facadeFnArgs);}else if(kijs.isArray(args)){args.push(kijs.Object.clone(this._facadeFnArgs));}else{args=kijs.Object.clone(this._facadeFnArgs);}}
this._rpc.do(this._facadeFnLoad,args,function(response){this.data=response.rows;if(!kijs.isEmpty(response.selectFilters)){this.selectByFilters(response.selectFilters);}
resolve(this.data);this.raiseEvent('afterLoad',{response:response});},this,true,this,'dom',false);});}
select(elements,keepExisting=false,preventSelectionChange=false){if(kijs.isEmpty(elements)){elements=[];}
if(!kijs.isArray(elements)){elements=[elements];}
if(!keepExisting){this.clearSelections(true);}
var changed=false;kijs.Array.each(elements,function(el){changed=changed||!el.selected;el.selected=true;},this);this._currentEl=null;this.current=null;if(!preventSelectionChange&&changed){this.raiseEvent('selectionChange',{elements:elements,unSelect:false});}}
selectByFilters(filters,keepExisting,preventSelectionChange){if(kijs.isEmpty(filters)){filters=[];}
if(kijs.isObject(filters)){filters=[filters];}
for(let i=0;i<filters.length;i++){if(kijs.isObject(filters[i])){filters[i]=[filters[i]];}}
const selElements=[];if(!kijs.isEmpty(filters)){kijs.Array.each(this._elements,function(el){if(el instanceof kijs.gui.DataViewElement){const row=el.dataRow;kijs.Array.each(filters,function(filterFields){let ok=false;kijs.Array.each(filterFields,function(filterField){if(kijs.isEmpty(filterField.value)||kijs.isEmpty(filterField.field)){throw new kijs.Error(`Unkown filter format.`);}
if(filterField.value===row[filterField.field]){ok=true;}else{ok=false;return false;}},this);if(ok){selElements.push(el);return false;}},this);}},this);}
this.select(selElements,keepExisting,preventSelectionChange);this._currentEl=null;this.current=null;}
selectByIndex(indexes,keepExisting=false,preventSelectionChange=false){if(!kijs.isArray(indexes)){indexes=[indexes];}
let selectElements=[];kijs.Array.each(indexes,function(index){kijs.Array.each(this.elements,function(element){if(element.index===index){selectElements.push(element);return false;}},this);},this);this.select(selectElements,keepExisting,preventSelectionChange);}
selectBetween(el1,el2,preventSelectionChange=false){let found=false;let elements=[];kijs.Array.each(this._elements,function(el){if(!found){if(el===el1){found='el1';}else if(el===el2){found='el2';}}
if(found){elements.push(el);}
if((found==='el1'&&el===el2)||(found==='el2'&&el===el1)){return false;}},this);if(!kijs.isEmpty(elements)){this.select(elements,true,preventSelectionChange);}}
unSelect(elements,preventSelectionChange){if(!kijs.isArray(elements)){elements=[elements];}
kijs.Array.each(elements,function(el){if('selected'in el){el.selected=false;}},this);this.current=null;if(!preventSelectionChange){this.raiseEvent('selectionChange',{elements:elements,unSelect:true});}}
_createElements(data,removeElements=true){let selectIndex=null;if(this._currentEl&&this._currentEl instanceof kijs.gui.DataViewElement&&kijs.isDefined(this._currentEl.index)){selectIndex=this._currentEl.index;}
if(this.elements&&removeElements){this.removeAll(true);this._currentEl=null;}
let newElements=[];for(let i=0,len=data.length;i<len;i++){if(this._filterMatch(data[i])){continue;}
const newEl=this.createElement(data[i],i);newEl.index=i;newEl.parent=this;newEl.on('click',function(e){return this.raiseEvent('elementClick',e);},this);newEl.on('dblClick',function(e){return this.raiseEvent('elementDblClick',e);},this);newEl.on('focus',function(e){return this.raiseEvent('elementFocus',e);},this);newEl.on('dragStart',function(e){return this.raiseEvent('elementDragStart',e);},this);newEl.on('dragOver',function(e){return this.raiseEvent('elementDragOver',e);},this);newEl.on('drag',function(e){return this.raiseEvent('elementDrag',e);},this);newEl.on('dragLeave',function(e){return this.raiseEvent('elementDragLeave',e);},this);newEl.on('dragEnd',function(e){return this.raiseEvent('elementDragEnd',e);},this);newEl.on('drop',function(e){return this.raiseEvent('elementDrop',e);},this);newElements.push(newEl);}
this.add(newElements);if(selectIndex!==null){this.selectByIndex(selectIndex,!removeElements,!removeElements);}}
_filterMatch(record){let filterMatch=false;kijs.Array.each(this.filters,function(filter){if(!kijs.isDefined(record[filter.field])){filterMatch=true;}
let rgx;if(filter.compare==='begin'){rgx=new RegExp('^'+kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)),'i');}else if(filter.compare==='part'){rgx=new RegExp(kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)),'i');}else if(filter.compare==='end'){rgx=new RegExp(kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value))+'$','i');}else if(filter.compare==='full'){rgx=new RegExp('^'+kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value))+'$','i');}else{throw new kijs.Error(`invalid value for filter.compare in kijs.gui.DataView`);}
if(!kijs.toString(record[filter.field]).match(rgx)){filterMatch=true;}},this);return filterMatch;}
_selectEl(el,shift,ctrl){if(!el){return;}
switch(this._selectType){case'single':shift=false;ctrl=false;break;case'multi':break;case'simple':ctrl=true;break;case'none':default:return;}
if(shift&&this._lastSelectedEl){if(!ctrl){this.clearSelections(true);}
this.selectBetween(this._lastSelectedEl,el);}else{if(!ctrl){this.clearSelections(true);}
if(el.selected){this.unSelect(el);if(el===this._lastSelectedEl){this._lastSelectedEl=null;}}else{this.select(el,true);this._lastSelectedEl=el;}}}
_onAfterFirstRenderTo(e){this.load();}
_onElementClick(e){if(!this.disabled){this.current=e.raiseElement;if(this._focusable){e.raiseElement.focus();}
this._selectEl(this._currentEl,e.nodeEvent.shiftKey,e.nodeEvent.ctrlKey);}}
_onKeyDown(e){if(!this.disabled){switch(e.nodeEvent.keyCode){case kijs.keys.LEFT_ARROW:if(this._currentEl){const prev=this._currentEl.previous;if(prev){this.current=prev;if(this._focusable){prev.focus();}}
if(e.nodeEvent.shiftKey||(!e.nodeEvent.ctrlKey&&(this.selectType==='single'||this.selectType==='multi'))){this._selectEl(this._currentEl,e.nodeEvent.shiftKey,e.nodeEvent.ctrlKey);}}
e.nodeEvent.preventDefault();break;case kijs.keys.UP_ARROW:if(this._currentEl&&this._elements){let found=false;kijs.Array.each(this._elements,function(el){if(found){if(el.top<this._currentEl.top&&el.left===this._currentEl.left){this.current=el;if(this._focusable){el.focus();}
return false;}}else{if(el===this._currentEl){found=true;}}},this,true);if(e.nodeEvent.shiftKey||(!e.nodeEvent.ctrlKey&&(this._selectType==='single'||this._selectType==='multi'))){this._selectEl(this._currentEl,e.nodeEvent.shiftKey,e.nodeEvent.ctrlKey);}}
e.nodeEvent.preventDefault();break;case kijs.keys.RIGHT_ARROW:if(this._currentEl){const next=this._currentEl.next;if(next){this.current=next;if(this._focusable){next.focus();}}
if(e.nodeEvent.shiftKey||(!e.nodeEvent.ctrlKey&&(this._selectType==='single'||this._selectType==='multi'))){this._selectEl(this._currentEl,e.nodeEvent.shiftKey,e.nodeEvent.ctrlKey);}}
e.nodeEvent.preventDefault();break;case kijs.keys.DOWN_ARROW:if(this._currentEl&&this._elements){let found=false;kijs.Array.each(this._elements,function(el){if(found){if(el.top>this._currentEl.top&&el.left===this._currentEl.left){this.current=el;if(this._focusable){el.focus();}
return false;}}else{if(el===this._currentEl){found=true;}}},this);if(e.nodeEvent.shiftKey||(!e.nodeEvent.ctrlKey&&(this._selectType==='single'||this._selectType==='multi'))){this._selectEl(this._currentEl,e.nodeEvent.shiftKey,e.nodeEvent.ctrlKey);}}
e.nodeEvent.preventDefault();break;case kijs.keys.SPACE:this._selectEl(this._currentEl,e.nodeEvent.shiftKey,e.nodeEvent.ctrlKey);break;}}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._currentEl=null;this._lastSelectedEl=null;this._data=null;this._rpc=null;super.destruct(true);}};kijs.gui.DropZone=class kijs_gui_DropZone extends kijs.gui.Container{constructor(config={}){super(false);this._dragOverCls='kijs-dragover';this._dragOverForbiddenCls='kijs-dragover-forbidden';this._contentTypes=[];this._validMediaTypes=['application','audio','example','image','message','model','multipart','text','video'];this._dom.clsAdd('kijs-dropzone');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{dragOverCls:true,dragOverForbiddenCls:true,contentTypes:{target:'contentTypes'}});this._eventForwardsRemove('dragEnter',this._dom);this._eventForwardsRemove('dragOver',this._dom);this._eventForwardsRemove('dragLeave',this._dom);this._eventForwardsRemove('drop',this._dom);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this._dom.on('dragEnter',this._onDragEnter,this);this._dom.on('dragOver',this._onDragOver,this);this._dom.on('dragLeave',this._onDragLeave,this);this._dom.on('drop',this._onDrop,this);}
get contentTypes(){return this._contentTypes;}
set contentTypes(val){if(!kijs.isArray(val)){val=[val];}
kijs.Array.each(val,function(contentType){let parts=contentType.toLowerCase().split('/',2);if(!kijs.Array.contains(this._validMediaTypes,parts[0])){throw new kijs.Error('invalid content type "'+contentType+'"');}
this._contentTypes.push(parts.join('/'));},this);}
_checkMime(dataTransferItems){for(let i=0;i<dataTransferItems.length;i++){if(dataTransferItems[i].type){let parts=dataTransferItems[i].type.split('/',2);if(!kijs.Array.contains(this._contentTypes,parts[0])&&!kijs.Array.contains(this._contentTypes,parts.join('/'))){return false;}}}
return true;}
_onDragEnter(e){this._dom.clsAdd(this._dragOverCls);this.raiseEvent('dragEnter',e);}
_onDragOver(e){e.nodeEvent.preventDefault();if(e.nodeEvent.dataTransfer&&e.nodeEvent.dataTransfer.items&&this._contentTypes.length>0){if(!this._checkMime(e.nodeEvent.dataTransfer.items)){this._dom.clsAdd(this._dragOverForbiddenCls);}}
this._dom.clsAdd(this._dragOverCls);this.raiseEvent('dragOver',e);}
_onDragLeave(e){this._dom.clsRemove(this._dragOverCls);this._dom.clsRemove(this._dragOverForbiddenCls);this.raiseEvent('dragLeave',e);}
_onDrop(e){e.nodeEvent.preventDefault();this._dom.clsRemove(this._dragOverCls);this._dom.clsRemove(this._dragOverForbiddenCls);let valid=true;if(e.nodeEvent.dataTransfer&&e.nodeEvent.dataTransfer.items&&this._contentTypes.length>0){if(!this._checkMime(e.nodeEvent.dataTransfer.items)){valid=false;}}
e.validMime=valid;this.raiseEvent('drop',e);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
super.destruct(true);}};kijs.gui.MenuButton=class kijs_gui_MenuButton extends kijs.gui.Button{constructor(config={}){super(false);this._spinbox=new kijs.gui.SpinBox({cls:['kijs-flexcolumn','kijs-menubutton-spinbox'],parent:this,target:this,ownerNodes:[this]});this._direction=null;this._expandOnHover=null;this._expandTimer=null;Object.assign(this._defaultConfig,{});if(kijs.isObject(config)){if(kijs.isObject(config.defaults)&&!kijs.isDefined(config.defaults.xtype)){config.defaults.xtype='kijs.gui.Button';}else if(!kijs.isDefined(config.defaults)){config.defaults={xtype:'kijs.gui.Button'};}}
Object.assign(this._configMap,{direction:{target:'direction',context:this},expandOnHover:{target:'expandOnHover',context:this},autoScroll:{target:'autoScroll',context:this._spinbox},defaults:{target:'defaults',context:this._spinbox,prio:1},elements:{target:'elements',prio:2},html:{target:'html',context:this._spinbox},htmlDisplayType:{target:'htmlDisplayType',context:this._spinbox},innerCls:{target:'innerCls',context:this._spinbox},innerStyle:{target:'innerStyle',context:this._spinbox}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
if(this._direction===null){if(this.upX('kijs.gui.MenuButton')){this.direction='right';}else{this.direction='down';}}
if(this._expandOnHover===null){if(this.upX('kijs.gui.MenuButton')){this.expandOnHover=true;}else{this.expandOnHover=false;}}
this.on('click',this._onBtnClick,this);}
get direction(){return this._direction;}
set direction(val){let iconChar=this._getIconChar(val);if(!iconChar){throw new kijs.Error('invalid argument for direction attribute');}
if(!this.icon2Char){this.icon2Char=iconChar;}
this._direction=val;switch(val){case'left':this._spinbox.ownPos='tr';this._spinbox.targetPos='tl';this._spinbox.offsetX=-5;break;case'right':this._spinbox.ownPos='tl';this._spinbox.targetPos='tr';this._spinbox.offsetX=-5;break;case'up':this._spinbox.ownPos='bl';this._spinbox.targetPos='tl';this._spinbox.offsetX=0;break;case'down':this._spinbox.ownPos='tl';this._spinbox.targetPos='bl';this._spinbox.offsetX=0;break;}}
get elements(){return this._spinbox.elements;}
set elements(val){this._spinbox.removeAll();this.add(val);}
get expandOnHover(){return this._expandOnHover;}
set expandOnHover(val){if(val){this.on('mouseEnter',this._onMouseEnter,this);this.on('mouseLeave',this._onMouseLeave,this);}else{this.off('mouseEnter',this._onMouseEnter,this);this.off('mouseLeave',this._onMouseLeave,this);}
this._expandOnHover=!!val;}
get spinbox(){return this._spinbox;}
add(elements){if(!kijs.isArray(elements)){elements=[elements];}
let newElements=[];kijs.Array.each(elements,function(element){if(kijs.isString(element)&&element==='-'){newElements.push(new kijs.gui.Element({name:'<hr>',cls:'separator',html:'<hr />'}));}else if(kijs.isString(element)){newElements.push(new kijs.gui.Element({html:element}));}else{newElements.push(element);}});this._spinbox.add(newElements);}
menuClose(){this._spinbox.close();if(this._expandTimer){window.clearTimeout(this._expandTimer);this._expandTimer=null;}
let p=this.parent;while(p){if(p instanceof kijs.gui.MenuButton){p.spinbox.ownerNodeRemove(this._spinbox);}
p=p.parent;}}
menuCloseAll(){let m=this,p=this.parent;while(p){if(p instanceof kijs.gui.MenuButton){m=p;}
p=p.parent;}
m.menuClose();}
menuShow(){this._spinbox.show();let p=this.parent;while(p){if(p instanceof kijs.gui.MenuButton){p.spinbox.ownerNodeAdd(this._spinbox);}
p=p.parent;}}
remove(elements){if(!kijs.isArray(elements)){elements=[elements];}
const removeElements=[];for(let i=0,len=elements.length;i<len;i++){if(elements[i]==='-'){for(let y=0;y<this.elements.length;y++){if(this.elements[y].name==='<hr>'){removeElements.push(this.elements[y]);}};}else if(kijs.Array.contains(this.elements,elements[i])){removeElements.push(elements[i]);}}
elements=null;if(this.raiseEvent('beforeRemove',{elements:removeElements})===false){return;}
kijs.Array.each(removeElements,function(el){el.off(null,null,this);if(el.unrender){el.unrender();}
kijs.Array.remove(this.elements,el);},this);if(this.dom){this.render();}
this.raiseEvent('remove');}
removeAll(preventRender){if(this.raiseEvent('beforeRemove',{elements:this.elements})===false){return;}
kijs.Array.each(this.elements,function(el){el.off(null,null,this);if(el.unrender){el.unrender();}},this);kijs.Array.clear(this.elements);if(this.dom&&!preventRender){this.render();}
this.raiseEvent('remove');}
render(superCall){super.render(true);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this.menuClose();super.unrender(true);}
_onBtnClick(){if(this._spinbox.dom.node){this.menuClose();}else{this.menuShow();}}
_onMouseEnter(){if(!this._expandTimer){this._expandTimer=kijs.defer(function(){if(!this._spinbox.dom.node){this.menuShow();}},500,this);}}
_onMouseLeave(){if(this._expandTimer){window.clearTimeout(this._expandTimer);this._expandTimer=null;}}
_getIconChar(direction){switch(direction){case'left':return'&#xf104';case'right':return'&#xf105';case'up':return'&#xf106';case'down':return'&#xf107';}
return'';}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._spinbox){this._spinbox.destruct();}
this._spinbox=null;super.destruct(true);}};kijs.gui.Panel=class kijs_gui_Panel extends kijs.gui.Container{constructor(config={}){super(false);this._headerBarEl=new kijs.gui.PanelBar({cls:'kijs-headerbar',parent:this,on:{click:this._onHeaderBarClick,dblClick:this._onHeaderBarDblClick,context:this}});this._headerEl=new kijs.gui.Container({cls:'kijs-header',parent:this});this._footerEl=new kijs.gui.Container({cls:'kijs-footer',parent:this});this._footerBarEl=new kijs.gui.PanelBar({cls:'kijs-footerbar',parent:this});this._collapseHeight=null;this._collapseWidth=null;this._domPos=null;this._closeButtonEl=null;this._collapseButtonEl=null;this._maximizeButtonEl=null;this._collapsible=false;this._resizerEl=null;this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-panel');Object.assign(this._defaultConfig,{collapseHeight:50,collapseWidth:50});Object.assign(this._configMap,{caption:{target:'html',context:this._headerBarEl},headerBarElements:{fn:'function',target:this._headerBarEl.containerRightEl.add,context:this._headerBarEl.containerRightEl},headerBarStyle:{fn:'assign',target:'style',context:this._headerBarEl.dom},iconChar:{target:'iconChar',context:this._headerBarEl},iconCls:{target:'iconCls',context:this._headerBarEl},iconColor:{target:'iconColor',context:this._headerBarEl},headerCls:{fn:'function',target:this._headerEl.dom.clsAdd,context:this._headerEl.dom},headerElements:{fn:'function',target:this._headerEl.add,context:this._headerEl},headerStyle:{fn:'assign',target:'style',context:this._headerEl.dom},footerCls:{fn:'function',target:this._footerEl.dom.clsAdd,context:this._footerEl.dom},footerElements:{fn:'function',target:this._footerEl.add,context:this._footerEl},footerStyle:{fn:'assign',target:'style',context:this._footerEl.dom},footerCaption:{target:'html',context:this._footerBarEl},footerBarElements:{fn:'function',target:this._footerBarEl.containerLeftEl.add,context:this._footerBarEl.containerLeftEl},footerBarStyle:{fn:'assign',target:'style',context:this._footerBarEl.dom},resizable:{target:'resizable'},shadow:{target:'shadow'},collapseHeight:true,collapseWidth:true,collapsePos:{prio:1001,target:'collapsePos'},collapsible:{prio:1002,target:'collapsible'},collapseButton:{prio:1003,target:'collapseButton'},collapsed:{prio:1004,target:'collapsed'},maximizable:{prio:1010,target:'maximizable'},maximizeButton:{prio:1011,target:'maximizeButton'},maximized:{prio:1012,target:'maximized'},closable:{prio:1013,target:'closable'},closeButton:{prio:1014,target:'closeButton'}});this.on('enterPress',this._onEnterPress,this);this.on('escPress',this._onEscPress,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get closable(){return!!this._closeButtonEl;}
set closable(val){if(val){if(!this._closeButtonEl){this.closeButton={iconChar:'&#xf00d'};}}else{if(this._closeButtonEl){this.closeButton=null;}}}
get closeButton(){return this._closeButtonEl;}
set closeButton(val){if(kijs.isEmpty(val)){this._headerBarEl.containerRightEl.remove(this._closeButtonEl);this._closeButtonEl=null;}else if(val instanceof kijs.gui.Button){if(this._closeButtonEl){this._headerBarEl.containerRightEl.remove(this._closeButtonEl);}
this._closeButtonEl=val;this._closeButtonEl.on('click',this._onCloseClick,this);this._headerBarEl.containerRightEl.add(this._closeButtonEl);}else if(kijs.isObject(val)){if(this._closeButtonEl){this._closeButtonEl.applyConfig(val);}else{this._closeButtonEl=new kijs.gui.Button(val);this._closeButtonEl.on('click',this._onCloseClick,this);this._headerBarEl.containerRightEl.add(this._closeButtonEl);}}else{throw new kijs.Error(`Unkown format on config "closeButton"`);}
if(this.isRendered){this.render();}}
get collapsible(){if(this._collapseButtonEl){return this._collapsible;}else{return false;}}
set collapsible(val){const validePos=['top','right','bottom','left'];if(kijs.isEmpty(val)||val===false){val=false;this._collapsible=false;}else{if(kijs.Array.contains(validePos,val)){this._collapsible=val;}else{throw new kijs.Error(`Unkown pos on config "collapsible"`);}}
if(val){if(!this._collapseButtonEl){this.collapseButton={iconChar:this._getCollapseIconChar()};}}else{if(this._collapseButtonEl){this.collapseButton=null;}}}
get collapseButton(){return this._collapseButtonEl;}
set collapseButton(val){if(kijs.isEmpty(val)){this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);this._collapseButtonEl=null;}else if(val instanceof kijs.gui.Button){if(this._collapseButtonEl){this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);}
this._collapseButtonEl=val;this._collapseButtonEl.on('click',this._onCollapseClick,this);this._headerBarEl.containerRightEl.add(this._collapseButtonEl);}else if(kijs.isObject(val)){if(this._collapseButtonEl){this._collapseButtonEl.applyConfig(val);}else{this._collapseButtonEl=new kijs.gui.Button(val);this._collapseButtonEl.on('click',this._onCollapseClick,this);this._headerBarEl.containerRightEl.add(this._collapseButtonEl);}}else{throw new kijs.Error(`Unkown format on config "collapseButton"`);}
if(this.isRendered){this.render();}}
get collapsed(){return this._dom.clsHas('kijs-collapse-top')||this._dom.clsHas('kijs-collapse-right')||this._dom.clsHas('kijs-collapse-bottom')||this._dom.clsHas('kijs-collapse-left');}
set collapsed(val){if(val){this.collapse();}else{this.expand();}}
get collapseHeight(){return this._collapseHeight;}
set collapseHeight(val){this._collapseHeight=val;}
get draggable(){return false;}
get footer(){return this._footerEl;}
get footerBar(){return this._footerBarEl;}
get header(){return this._headerEl;}
get headerBar(){return this._headerBarEl;}
get height(){return super.height;}
set height(val){let doFn=false;if(kijs.Array.contains(['top','bottom'],this.collapsible)&&kijs.isNumber(this._collapseHeight)){if(val<=this._collapseHeight){doFn='collapse';}else if(this.collapsed){doFn='expand';}}
if(doFn==='collapse'){if(!this.collapsed){this.collapse();}}else if(doFn==='expand'){this.expand(val);}else{super.height=val;}}
get maximizable(){return!!this._closeButtonEl;}
set maximizable(val){if(val){if(!this._maximizeButtonEl){this.maximizeButton=new kijs.gui.Button({iconChar:this._getMaximizeIconChar()});}}else{if(this._maximizeButtonEl){this.maximizeButton=null;}}}
get maximizeButton(){return this._maximizeButtonEl;}
set maximizeButton(val){if(kijs.isEmpty(val)){this._headerBarEl.containerRightEl.remove(this._maximizeButtonEl);this._maximizeButtonEl=null;}else if(val instanceof kijs.gui.Button){if(this._maximizeButtonEl){this._headerBarEl.containerRightEl.remove(this._maximizeButtonEl);}
this._maximizeButtonEl=val;this._maximizeButtonEl.on('click',this._onMaximizeClick,this);this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);}else if(kijs.isObject(val)){if(this._maximizeButtonEl){this._maximizeButtonEl.applyConfig(val);}else{this._maximizeButtonEl=new kijs.gui.Button(val);this._maximizeButtonEl.on('click',this._onMaximizeClick,this);this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);}}else{throw new kijs.Error(`Unkown format on config "maximizeButton"`);}
if(this.isRendered){this.render();}}
get maximized(){return this._dom.clsHas('kijs-maximize');}
set maximized(val){if(val){this.maximize();}else{this.restore();}}
get resizable(){return!!this._resizerEl;}
set resizable(val){if(!!val!==!!this._resizerEl){if(this._resizerEl){this._resizerEl.destruct();this._resizerEl=null;}else{this._resizerEl=new kijs.gui.Resizer({target:this});if(this._dom.node){this._resizerEl.renderTo(this._dom.node);}}}}
get shadow(){this._dom.clsHas('kijs-shadow');}
set shadow(val){if(val){this._dom.clsAdd('kijs-shadow');}else{this._dom.clsRemove('kijs-shadow');}}
get width(){return super.width;}
set width(val){let doFn=false;if(kijs.Array.contains(['left','right'],this.collapsible)&&kijs.isNumber(this._collapseWidth)){if(val<=this._collapseWidth){doFn='collapse';}else if(this.collapsed){doFn='expand';}}
if(doFn==='collapse'){if(!this.collapsed){this.collapse();}}else if(doFn==='expand'){this.expand(val);}else{super.width=val;}}
close(preventEvent=false){if(!preventEvent){this.raiseEvent('close');}
if(this._parentEl&&this._parentEl instanceof kijs.gui.Container&&this._parentEl.hasChild(this)){this._parentEl.remove(this);}else{this.unrender();}}
collapse(direction){const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;if(this.maximized){this.restore();}
if(direction){this._collapsible=direction;}
if(!this._collapsible){this._collapsible='top';}
this._dom.clsRemove(['kijs-collapse-top','kijs-collapse-right','kijs-collapse-bottom','kijs-collapse-left']);switch(this._collapsible){case'top':this._dom.clsAdd('kijs-collapse-top');break;case'right':this._dom.clsAdd('kijs-collapse-right');break;case'bottom':this._dom.clsAdd('kijs-collapse-bottom');break;case'left':this._dom.clsAdd('kijs-collapse-left');break;}
if(this._collapseButtonEl){this._collapseButtonEl.iconChar=this._getCollapseIconChar();}
this._preventAfterResize=prevAfterRes;this._raiseAfterResizeEvent(true);}
expand(size){const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;this._dom.clsRemove(['kijs-collapse-top','kijs-collapse-right','kijs-collapse-bottom','kijs-collapse-left']);if(this._collapseButtonEl){this._collapseButtonEl.iconChar=this._getCollapseIconChar();}
if(!kijs.isEmpty(size)){switch(this._collapsible){case'top':case'bottom':if(size>this._collapseHeight){this.height=size;}
break;case'right':case'left':if(size>this._collapseWidth){this.width=size;}
break;}}
this._preventAfterResize=prevAfterRes;this._raiseAfterResizeEvent(true);}
focus(alsoSetIfNoTabIndex=false){if(alsoSetIfNoTabIndex){return super.focus(alsoSetIfNoTabIndex);}else{let node=this._innerDom.focus(false);if(!node&&!this._footerEl.isEmpty&&this._footerEl.isRendered){node=this._footerEl.focus(alsoSetIfNoTabIndex);}
if(!node){node=super.focus(alsoSetIfNoTabIndex);}
return node;}
if(alsoSetIfNoTabIndex){this._dom.node.focus();}else{const node=kijs.Dom.getFirstFocusableNode(this._node);if(node){node.focus();}}}
maximize(){if(this.maximized){return;}
const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;if(this.collapsed){this.expand();}
if(this.isRendered){this._domPos={parent:this._dom.node.parentNode,nextSibling:this._dom.node.nextSibling};document.body.appendChild(this._dom.node);}
this._dom.clsAdd('kijs-maximize');if(this._maximizeButtonEl){this._maximizeButtonEl.iconChar=this._getMaximizeIconChar();}
this._preventAfterResize=prevAfterRes;this._raiseAfterResizeEvent(true);}
render(superCall){super.render(true);if(!this._headerBarEl.isEmpty){this._headerBarEl.renderTo(this._dom.node,this._innerDom.node);}else{this._headerBarEl.unrender();}
if(!this._headerEl.isEmpty){this._headerEl.renderTo(this._dom.node,this._innerDom.node);}else{this._headerEl.unrender();}
if(!this._footerEl.isEmpty){this._footerEl.renderTo(this._dom.node);}else{this._footerEl.unrender();}
if(!this._footerBarEl.isEmpty){this._footerBarEl.renderTo(this._dom.node);}else{this._footerBarEl.unrender();}
if(this._resizerEl){this._resizerEl.renderTo(this._dom.node);}
if(!superCall){this.raiseEvent('afterRender');}}
renderTo(targetNode,insertBefore){if(this.maximized&&kijs.isEmpty(this._domPos)){this._domPos={parent:targetNode,nextSibling:insertBefore};targetNode=document.body;insertBefore=null;}
super.renderTo(targetNode,insertBefore);}
restore(){if(!this.maximized){return;}
const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;if(this._domPos.nextSibling){this._domPos.parent.insertBefore(this._dom.node,this._domPos.nextSibling);}else{this._domPos.parent.appendChild(this._dom.node);}
this._dom.clsRemove('kijs-maximize');if(this._maximizeButtonEl){this._maximizeButtonEl.iconChar=this._getMaximizeIconChar();}
this._preventAfterResize=prevAfterRes;this._raiseAfterResizeEvent(true);}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._headerBarEl.unrender();this._headerEl.unrender();this._footerEl.unrender();this._footerBarEl.unrender();if(this._resizerEl){this._resizerEl.unrender();}
super.unrender(true);}
_getMaximizeIconChar(){let char='';if(this.maximized){char='&#xf2d2';}else{char='&#xf2d0';}
return char;}
_getCollapseIconChar(){let char='';if(this.collapsed){switch(this._collapsible){case'top':char='&#xf0d7';break;case'right':char='&#xf0d9';break;case'bottom':char='&#xf0d8';break;case'left':char='&#xf0da';break;}}else{switch(this._collapsible){case'top':char='&#xf0d8';break;case'right':char='&#xf0da';break;case'bottom':char='&#xf0d7';break;case'left':char='&#xf0d9';break;}}
return char;}
_onCloseClick(e){this.close();}
_onCollapseClick(e){if(this.collapsed){this.expand();}else{this.collapse();}}
_onEscPress(e){if(this.closable){this.close();}}
_onEnterPress(e){if(this._footerEl){kijs.Array.each(this._footerEl.elements,function(el){if(el instanceof kijs.gui.Button&&el.dom&&el.isDefault){if(document.activeElement!==el.dom.node){el.raiseEvent('click');}
return;}},this);}}
_onHeaderBarClick(e){if(this.collapsible&&!this.maximized&&!this.draggable){if(this.collapsed){this.expand();}else{this.collapse();}}}
_onHeaderBarDblClick(e){if(this.maximizable&&this.draggable){if(this.maximized){this.restore();}else{this.maximize();}}else if(this.maximizable&&this.maximized){this.restore();}}
_onMaximizeClick(e){if(this.maximized){this.restore();}else{this.maximize();}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._headerBarEl){this._headerBarEl.destruct();}
if(this._headerEl){this._headerEl.destruct();}
if(this._footerEl){this._footerEl.destruct();}
if(this._footerBarEl){this._footerBarEl.destruct();}
if(this._resizerEl){this._resizerEl.destruct();}
this._domPos=null;this._headerBarEl=null;this._headerEl=null;this._footerEl=null;this._footerBarEl=null;this._closeButtonEl=null;this._collapseButtonEl=null;this._maximizeButtonEl=null;this._resizerEl=null;super.destruct(true);}};kijs.gui.PanelBar=class kijs_gui_PanelBar extends kijs.gui.Container{constructor(config={}){super(false);this._iconEl=new kijs.gui.Icon({parent:this});this._containerLeftEl=new kijs.gui.Container({cls:'kijs-container-left',parent:this});this._containerLeftEl.dom.clsRemove('kijs-container');this._containerRightEl=new kijs.gui.Container({cls:'kijs-container-right',parent:this});this._containerRightEl.dom.clsRemove('kijs-container');this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-panelbar');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{icon:{target:'icon'},iconChar:{target:'iconChar',context:this._iconEl},iconCls:{target:'iconCls',context:this._iconEl},iconColor:{target:'iconColor',context:this._iconEl},elementsLeft:{fn:'function',target:this._containerLeftEl.add,context:this._containerLeftEl},elementsRight:{fn:'function',target:this._containerRightEl.add,context:this._containerRightEl}});this._eventForwardsRemove('click',this._dom);this._eventForwardsAdd('click',this._innerDom);this._eventForwardsAdd('click',this._iconEl.dom);this._eventForwardsRemove('dblClick',this._dom);this._eventForwardsAdd('dblClick',this._innerDom);this._eventForwardsAdd('dblClick',this._iconEl.dom);this._eventForwardsRemove('mouseDown',this._dom);this._eventForwardsAdd('mouseDown',this._innerDom);this._eventForwardsAdd('mouseDown',this._iconEl.dom);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get icon(){return this._iconEl;}
set icon(val){if(kijs.isEmpty(val)){this._iconEl.iconChar=null;this._iconEl.iconCls=null;this._iconEl.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Icon){this._iconEl.destruct();this._iconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._iconEl.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "icon" is not valid.`);}}
get iconChar(){return this._iconEl.iconChar;}
set iconChar(val){this._iconEl.iconChar=val;if(this.isRendered){this.render();}}
get iconCls(){return this._iconEl.iconCls;}
set iconCls(val){this._iconEl.iconCls=val;if(this.isRendered){this.render();}}
get iconColor(){return this._iconEl.iconColor;}
set iconColor(val){this._iconEl.iconColor=val;if(this.isRendered){this.render();}}
get isEmpty(){return super.isEmpty&&this._iconEl.isEmpty&&this._containerLeftEl.isEmpty&&this._containerRightEl.isEmpty;}
get containerLeftEl(){return this._containerLeftEl;}
get containerRightEl(){return this._containerRightEl;}
render(superCall){super.render(true);if(!this._iconEl.isEmpty){this._iconEl.renderTo(this._dom.node,this._innerDom.node);}else{this._iconEl.unrender();}
if(!this._containerLeftEl.isEmpty){this._containerLeftEl.renderTo(this._dom.node,this._innerDom.node);}else{this._containerLeftEl.unrender();}
if(!this._containerRightEl.isEmpty){this._containerRightEl.renderTo(this._dom.node);}else{this._containerRightEl.unrender();}
if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._iconEl.unrender();this._containerLeftEl.unrender();this._containerRightEl.unrender();super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._iconEl){this._iconEl.destruct();}
if(this._containerLeftEl){this._containerLeftEl.destruct();}
if(this._containerRightEl){this._containerRightEl.destruct();}
this._iconEl=null;this._containerLeftEl=null;this._containerRightEl=null;super.destruct(true);}};kijs.gui.SpinBox=class kijs_gui_SpinBox extends kijs.gui.Container{constructor(config={}){super(false);this._ownPos='tl';this._targetPos='bl';this._allowSwapX=true;this._allowSwapY=true;this._autoSize='min';this._offsetX=0;this._offsetY=0;this._ownerNodes=[this._dom];this._openOnInput=true;this._preventHide=false;this._targetEl=null;this._targetDomProperty='dom';this._autoWidth=true;this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-spinbox');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{allowSwapX:true,allowSwapY:true,autoSize:{target:'autoSize'},offsetX:true,offsetY:true,ownPos:true,openOnInput:true,targetPos:true,target:{target:'target'},targetDomProperty:true,ownerNodes:{fn:'appendUnique',target:'_ownerNodes'}});this.on('keyDown',this._onElKeyDown,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get allowSwapX(){return this._allowSwapX;}
set allowSwapX(val){this._allowSwapX=!!val;}
get allowSwapY(){return this._allowSwapY;}
set allowSwapY(val){this._allowSwapY=!!val;}
get autoSize(){return this._autoSize;}
set autoSize(val){if(kijs.Array.contains(['min','max','fit','none'],val)){this._autoSize=val;}else{throw new kijs.Error(`Unkown format on config "autoSize"`);}}
get offsetX(){return this._offsetX;}
set offsetX(val){this._offsetX=val;}
get offsetY(){return this._offsetY;}
set offsetY(val){this._offsetY=val;}
get ownPos(){this._ownPos;}
set ownPos(val){if(kijs.Array.contains(['tl','t','tr','l','c','r','bl','b','br'],val)){this._ownPos=val;}else{throw new kijs.Error(`Unkown format on config "pos"`);}}
get openOnInput(){return this._openOnInput;}
set openOnInput(val){this._openOnInput=val;}
get target(){return this._targetEl;}
set target(val){if(!kijs.isEmpty(this._targetEl)){this._targetEl.off('input',this._onTargetElInput,this);this._targetEl.off('keyDown',this._onElKeyDown,this);}
if(val instanceof kijs.gui.Element){this._targetEl=val;this._targetEl.on('input',this._onTargetElInput,this);this._targetEl.on('keyDown',this._onElKeyDown,this);}else{throw new kijs.Error(`Unkown format on config "target"`);}}
get targetDomProperty(){return this._targetDomProperty;};set targetDomProperty(val){this._targetDomProperty=val;};get targetNode(){return this._targetEl[this._targetDomProperty].node;}
get targetPos(){this._targetPos;}
set targetPos(val){if(kijs.Array.contains(['tl','t','tr','l','c','r','bl','b','br'],val)){this._targetPos=val;}else{throw new kijs.Error(`Unkown format on config "targetPos"`);}}
set width(val){this._autoWidth=kijs.isNumeric(val)?false:true;super.width=val;}
close(){this.unrender();this.raiseEvent('close');}
ownerNodeAdd(ownerNode){if(!kijs.Array.contains(this._ownerNodes,ownerNode)){this._ownerNodes.push(ownerNode);}
if(ownerNode instanceof kijs.gui.Element){ownerNode=ownerNode.dom;}
if(ownerNode instanceof kijs.gui.Dom){ownerNode=ownerNode.node;}
if(ownerNode){kijs.Dom.addEventListener('mousedown',ownerNode,this._onNodeMouseDown,this);kijs.Dom.addEventListener('resize',ownerNode,this._onNodeResize,this);kijs.Dom.addEventListener('wheel',ownerNode,this._onNodeWheel,this);}}
ownerNodeRemove(ownerNode,removeFromObservedNodes=true){if(removeFromObservedNodes){kijs.Array.remove(this._ownerNodes,ownerNode);}
if(ownerNode instanceof kijs.gui.Element){ownerNode=ownerNode.dom;}
if(ownerNode instanceof kijs.gui.Dom){ownerNode=ownerNode.node;}
if(ownerNode){kijs.Dom.removeEventListener('mousedown',ownerNode,this);kijs.Dom.removeEventListener('resize',ownerNode,this);kijs.Dom.removeEventListener('wheel',ownerNode,this);}}
show(){this.renderTo(document.body);this._calculateWidth();this._adjustPositionToTarget(true);this._raiseAfterResizeEvent(true);this._targetEl.focus();kijs.Dom.addEventListener('mousedown',document.body,this._onBodyMouseDown,this);kijs.Dom.addEventListener('resize',window,this._onWindowResize,this);kijs.Dom.addEventListener('wheel',window,this._onWindowWheel,this);kijs.Array.each(this._ownerNodes,function(ownerNode){this.ownerNodeAdd(ownerNode);},this);this.raiseEvent('show');}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
kijs.Dom.removeEventListener('mousedown',document.body,this);kijs.Dom.removeEventListener('resize',window,this);kijs.Dom.removeEventListener('wheel',window,this);kijs.Array.each(this._ownerNodes,function(ownerNode){this.ownerNodeRemove(ownerNode,false);},this);super.unrender(true);}
_adjustPositionToTarget(preventEvents=false){const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;if(this._autoSize!=='none'){if((this._targetPos.indexOf('t')!==-1||this._targetPos.indexOf('b')!==-1)&&(this._ownPos.indexOf('t')!==-1||this._ownPos.indexOf('b')!==-1)){const width=this._targetEl.spinBoxWidth;switch(this._autoSize){case'min':this.style.minWidth=width+'px';break;case'max':this.style.maxWidth=width+'px';break;case'fit':this.style.width=width+'px';break;}}else if((this._targetPos.indexOf('l')!==-1||this._targetPos.indexOf('r')!==-1)&&(this._ownPos.indexOf('l')!==-1||this._ownPos.indexOf('r')!==-1)){let height=this._targetEl.spinBoxHeight;switch(this._autoSize){case'min':this.style.minHeight=height+'px';break;case'max':this.style.maxHeight=height+'px';break;case'fit':this.style.height=height+'px';break;}}}
const positions=this._dom.alignToTarget(this.targetNode,this._targetPos,this._ownPos,this._allowSwapX,this._allowSwapY,this._offsetX,this._offsetY);let cls='';if(positions.targetPos.indexOf('t')!==-1&&positions.pos.indexOf('b')!==-1){cls='kijs-pos-top';}else if(positions.targetPos.indexOf('b')!==-1&&positions.pos.indexOf('t')!==-1){cls='kijs-pos-bottom';}else if(positions.targetPos.indexOf('l')!==-1&&positions.pos.indexOf('r')!==-1){cls='kijs-pos-left';}else if(positions.targetPos.indexOf('r')!==-1&&positions.pos.indexOf('l')!==-1){cls='kijs-pos-right';}
this._dom.clsRemove(['kijs-pos-top','kijs-pos-bottom','kijs-pos-left','kijs-pos-right']);if(cls){this._dom.clsAdd(cls);}
this._preventAfterResize=prevAfterRes;if(!preventEvents&&this._hasSizeChanged()){this._raiseAfterResizeEvent(true);}}
_calculateWidth(){if(this._autoWidth){this._dom.node.style.overflow='hidden';this._dom.width=null;let pos=kijs.Dom.getAbsolutePos(this._dom.node);let sbw=kijs.Dom.getScrollbarWidth();let w=pos.w+sbw+10;if(kijs.Navigator.isFirefox){w+=7;}
this._dom.width=w;this._dom.node.style.overflow='auto';}}
_onBodyMouseDown(e){if(!this._preventHide){this.close();}
this._preventHide=false;}
_onWindowResize(e){if(!this._preventHide){this.close();}
this._preventHide=false;}
_onWindowWheel(e){if(!this._preventHide){this.close();}
this._preventHide=false;}
_onNodeMouseDown(e){this._preventHide=true;}
_onNodeResize(e){this._preventHide=true;}
_onNodeWheel(e){this._preventHide=true;}
_onTargetElInput(e){if(this._openOnInput&&!this.isRendered){this.show();}}
_onElKeyDown(e){switch(e.nodeEvent.keyCode){case kijs.keys.ESC:case kijs.keys.TAB:this.close();break;case kijs.keys.F4:if(this.isRendered){this.close();}else{this.show();}
break;case kijs.keys.DOWN_ARROW:if(!this.isRendered){this.show();}
break;default:if(kijs.isString(e.nodeEvent.key)&&e.nodeEvent.key.length===1){if(!this.isRendered){this.show();}}
break;}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._targetEl){this._targetEl.off(null,null,this);}
this._targetEl=null;this._ownerNodes=null;super.destruct(true);}};kijs.gui.ViewPort=class kijs_gui_ViewPort extends kijs.gui.Container{constructor(config={}){super(false);this._dom.node=document.body;this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-viewport');Object.assign(this._defaultConfig,{disableDrop:true,disableContextMenu:false});Object.assign(this._configMap,{disableDrop:{target:'disableDrop'},disableContextMenu:{target:'disableContextMenu'}});kijs.Dom.addEventListener('resize',window,this._onWindowResize,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
set disableContextMenu(val){if(val===true){kijs.Dom.addEventListener('contextmenu',document.body,function(e){e.nodeEvent.preventDefault();},this);}else if(val===false){kijs.Dom.removeEventListener('contextmenu',document.body,this);}else{throw new kijs.Error('invalid value for property "disableContextMenu" in kijs.gui.ViewPort');}}
get disableContextMenu(){return kijs.Dom.hasEventListener('contextmenu',document.body,this);}
set disableDrop(val){if(val===true){kijs.Dom.addEventListener('dragover',window,function(e){e.nodeEvent.preventDefault();},this);kijs.Dom.addEventListener('drop',window,function(e){e.nodeEvent.preventDefault();},this);}else if(val===false){kijs.Dom.removeEventListener('dragover',window,this);kijs.Dom.removeEventListener('drop',window,this);}else{throw new kijs.Error('invalid value for property "disableDrop" in kijs.gui.ViewPort');}}
get disableDrop(){return kijs.Dom.hasEventListener('dragover',window,this)&&kijs.Dom.hasEventListener('drop',window,this);}
render(superCall){super.render(true);this._innerDom.render();this._dom.node.appendChild(this._innerDom.node);kijs.Array.each(this._elements,function(el){el.renderTo(this._innerDom.node);},this);if(!superCall){this.raiseEvent('afterRender');}
this._raiseAfterResizeEvent(true);}
_onWindowResize(e){this._raiseAfterResizeEvent(true,e);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
kijs.Dom.removeEventListener('resize',window,this);super.destruct(true);}};kijs.gui.field.Field=class kijs_gui_field_Field extends kijs.gui.Container{constructor(config={}){super(false);this._labelHide=false;this._inputId=kijs.uniqId('kijs_-_input_');this._inputWrapperDom=new kijs.gui.Dom({cls:'kijs-inputwrapper'});this._labelDom=new kijs.gui.Dom({cls:'kijs-label',nodeTagName:'label',nodeAttribute:{htmlFor:this._inputId}});this._spinIconEl=new kijs.gui.Icon({parent:this,iconChar:'&#xf0d7',cls:'kijs-icon-spindown',visible:false});this._errorIconEl=new kijs.gui.Icon({parent:this,iconChar:'&#xf05a',cls:'kijs-icon-error',toolTip:new kijs.gui.ToolTip({cls:'kijs-error'}),visible:false});this._errors=[];this._helpIconEl=new kijs.gui.Icon({parent:this,iconChar:'&#xf059',cls:'kijs-icon-help',toolTip:new kijs.gui.ToolTip({cls:'kijs-help'}),visible:false});this._spinBoxEl=null;this._maxLength=null;this._required=false;this._submitValue=true;this._originalValue=null;this._dom.clsRemove('kijs-container');this._dom.clsAdd('kijs-field');Object.assign(this._defaultConfig,{isDirty:false});Object.assign(this._configMap,{disabled:{target:'disabled'},label:{target:'html',context:this._labelDom},labelCls:{fn:'function',target:this._labelDom.clsAdd,context:this._labelDom},labelHide:true,labelHtmlDisplayType:{target:'htmlDisplayType',context:this._labelDom},labelStyle:{fn:'assign',target:'style',context:this._labelDom},labelWidth:{target:'labelWidth'},value:{target:'value',prio:1000},errorIcon:{target:'errorIcon'},errorIconChar:{target:'errorIconChar',context:this._errorIconEl},errorIconCls:{target:'errorIconCls',context:this._errorIconEl},errorIconColor:{target:'errorIconColor',context:this._errorIconEl},helpIcon:{target:'helpIcon'},helpIconChar:{target:'helpIconChar',context:this._helpIconEl},helpIconCls:{target:'helpIconCls',context:this._helpIconEl},helpIconColor:{target:'helpIconColor',context:this._helpIconEl},helpText:{target:'helpText'},isDirty:{target:'isDirty',prio:1001},maxLength:true,readOnly:{target:'readOnly'},required:true,submitValue:true,spinIcon:{target:'spinIcon'},spinIconChar:{target:'iconChar',context:this._spinIconEl},spinIconCls:{target:'iconCls',context:this._spinIconEl},spinIconColor:{target:'iconColor',context:this._spinIconEl},spinIconVisible:{target:'visible',context:this._spinIconEl}});this._spinIconEl.on('click',this._onSpinButtonClick,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disabled(){return this._dom.clsHas('kijs-disabled');}
set disabled(val){if(val){this._dom.clsAdd('kijs-disabled');}else{this._dom.clsRemove('kijs-disabled');}
this._spinIconEl.disabled=val;this._errorIconEl.disabled=val;this._helpIconEl.disabled=val;if(this._spinBoxEl&&'disabled'in this._spinBoxEl){this._spinBoxEl.disabled=val;}
const buttons=this.getElementsByXtype('kijs.gui.Button',1);kijs.Array.each(buttons,function(button){button.disabled=val;},this);}
get errorIcon(){return this._errorIconEl;}
set errorIcon(val){if(kijs.isEmpty(val)){this._errorIconEl.iconChar=null;this._errorIconEl.iconCls=null;this._errorIconEl.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Icon){this._errorIconEl.destruct();this._errorIconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._errorIconEl.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "errorIcon" is not valid.`);}}
get errorIconChar(){return this._errorIconEl.iconChar;}
set errorIconChar(val){this._errorIconEl.iconChar=val;if(this.isRendered){this.render();}}
get errorIconCls(){return this._errorIconEl.iconCls;}
set errorIconCls(val){this._errorIconEl.iconCls=val;if(this.isRendered){this.render();}}
get errorIconColor(){return this._errorIconEl.iconColor;}
set errorIconColor(val){this._errorIconEl.iconColor=val;if(this.isRendered){this.render();}}
get helpIcon(){return this._helpIconEl;}
set helpIcon(val){if(kijs.isEmpty(val)){this._helpIconEl.iconChar=null;this._helpIconEl.iconCls=null;this._helpIconEl.iconColor=null;}else if(val instanceof kijs.gui.Icon){this._helpIconEl.destruct();this._helpIconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._helpIconEl.applyConfig(val);if(this.isRendered){this._helpIconEl.render();}}else{throw new kijs.Error(`config "helpIcon" is not valid.`);}}
get helpIconChar(){return this._helpIconEl.iconChar;}
set helpIconChar(val){this._helpIconEl.iconChar=val;}
get helpIconCls(){return this._helpIconEl.iconCls;}
set helpIconCls(val){this._helpIconEl.iconCls=val;}
get helpIconColor(){return this._helpIconEl.iconColor;}
set helpIconColor(val){this._helpIconEl.iconColor=val;if(this.isRendered){this.render();}}
get helpText(){return this._helpIconEl.toolTip.html;}
set helpText(val){this._helpIconEl.toolTip=val;this._helpIconEl.visible=!kijs.isEmpty(this._helpIconEl.toolTip.html);}
get inputWrapperDom(){return this._inputWrapperDom;}
get isDirty(){return this._originalValue!==this.value;}
set isDirty(val){if(val){this._originalValue=this.value===null?'':null;}else{this._originalValue=this.value;}}
get label(){return this._labelDom.html;}
set label(val){this._labelDom.html=val;}
get labelHide(){return this._labelHide;}
set labelHide(val){this._labelHide=val;if(this.isRendered){if(val){this._labelDom.renderTo(this._dom.node,this._inputWrapperDom.node);}else{this._labelDom.unrender();}}}
get labelDom(){return this._labelDom;}
get labelHtmlDisplayType(){return this._labelDom.htmlDisplayType;}
set labelHtmlDisplayType(val){this._labelDom.htmlDisplayType=val;}
get labelWidth(){return this._labelDom.width;}
set labelWidth(val){this._labelDom.width=val;}
get readOnly(){return this._dom.clsHas('kijs-readonly');}
set readOnly(val){if(val){this._dom.clsAdd('kijs-readonly');}else{this._dom.clsRemove('kijs-readonly');}}
get required(){return this._required;}
set required(val){this._required=!!val;}
get spinBoxHeight(){return this._inputWrapperDom.height;}
get spinBoxWidth(){let width=this._inputWrapperDom.width;if(this._spinIconEl.visible){width+=this._spinIconEl.width;}
return width;}
get spinIcon(){return this._spinIconEl;}
set spinIcon(val){if(kijs.isEmpty(val)){this._spinIconEl.iconChar=null;this._spinIconEl.iconCls=null;this._spinIconEl.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Button){this._spinIconEl.destruct();this._spinIconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._spinIconEl.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "spinIcon" is not valid.`);}}
get spinIconChar(){return this._spinIconEl.iconChar;}
set spinIconChar(val){this._spinIconEl.iconChar=val;if(this.isRendered){this.render();}}
get spinIconCls(){return this._spinIconEl.iconCls;}
set spinIconCls(val){this._spinIconEl.iconCls=val;if(this.isRendered){this.render();}}
get spinIconColor(){return this._spinIconEl.iconColor;}
set spinIconColor(val){this._spinIconEl.iconColor=val;if(this.isRendered){this.render();}}
get spinIconVisible(){return!!this._spinIconEl.visible;}
set spinIconVisible(val){this._spinIconEl.visible=!!val;if(this.isRendered){this.render();}}
get submitValue(){return this._submitValue;}
set submitValue(val){this._submitValue=!!val;}
get value(){return null;}
set value(val){}
addValidateErrors(errors){if(!errors){return;}
if(!kijs.isArray(errors)){errors=[errors];}
this._errors=this._errors.concat(errors);this._displayErrors();}
render(superCall){super.render(true);if(!this._labelHide){this._labelDom.renderTo(this._dom.node,this._innerDom.node);}else{this._labelDom.unrender();}
this._inputWrapperDom.renderTo(this._dom.node,this._innerDom.node);this._spinIconEl.renderTo(this._dom.node,this._innerDom.node);this._helpIconEl.renderTo(this._dom.node);this._errorIconEl.renderTo(this._dom.node);if(!superCall){this.raiseEvent('afterRender');}}
reset(){this.value=this._originalValue;}
markInvalid(msg=null){this._errors=[];if(kijs.isString(msg)&&msg){this._errors.push(msg);}
this._displayErrors();}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._labelDom.unrender();this._inputWrapperDom.unrender();if(this._spinBoxEl){this._spinBoxEl.unrender();}
this._spinIconEl.unrender();this._errorIconEl.unrender();this._helpIconEl.unrender();super.unrender(true);}
validate(){this._errors=[];if(this.visible){this._validationRules(this.value);}
this._displayErrors();return kijs.isEmpty(this._errors);}
_displayErrors(){if(!kijs.isEmpty(this._errors)){this._dom.clsAdd('kijs-error');this._errorIconEl.toolTip=this._errors;this._errorIconEl.visible=true;}else{this._dom.clsRemove('kijs-error');this._errorIconEl.visible=false;}}
_validationRules(value){if(this._required){if(kijs.isEmpty(value)){this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));}}
if(!kijs.isEmpty(this._maxLength)){if(!kijs.isEmpty(value)&&value.length>this._maxLength){this._errors.push(kijs.getText('Dieses Feld darf maximal %1 Zeichen enthalten','',this._maxLength));}}}
_onSpinButtonClick(e){if(this.disabled||this.readOnly){return;}
if(this._spinBoxEl){if(this._spinBoxEl.isRendered){this._spinBoxEl.close();}else{this._spinBoxEl.show();}}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._labelDom){this._labelDom.destruct();}
if(this._inputWrapperDom){this._inputWrapperDom.destruct();}
if(this._spinBoxEl){this._spinBoxEl.destruct();}
if(this._spinIconEl){this._spinIconEl.destruct();}
if(this._errorIconEl){this._errorIconEl.destruct();}
if(this._helpIconEl){this._helpIconEl.destruct();}
this._errors=null;this._labelDom=null;this._inputWrapperDom=null;this._spinBoxEl=null;this._spinIconEl=null;this._errorIconEl=null;this._helpIconEl=null;super.destruct(true);}};kijs.gui.grid.cell.Checkbox=class kijs_gui_grid_cell_Checkbox extends kijs.gui.grid.cell.Cell{constructor(config={}){super(false);this._checked=false;this._disabled=false;this._dom.clsAdd('kijs-grid-cell-checkbox');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{disabled:{target:'disabled'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this._dom.on('click',this._onClick,this);}
get value(){return this._checked;}
set value(val){super.value=val;}
get disabled(){return this._disabled;}
set disabled(val){if(val){this._dom.clsAdd('kijs-disabled');}else{this._dom.clsRemove('kijs-disabled');}
this._disabled=!!val;}
setValue(value,silent=false,markDirty=true,updateDataRow=true){value=(value===true||value===1||value==='1');this._checked=value;return super.setValue(value,silent,markDirty,updateDataRow);}
_getEditorArgs(){let eArgs=super._getEditorArgs();eArgs.hasTime=this._hasTime;eArgs.displayFormat=this._format;return eArgs;}
_setDomHtml(value){if(value===true||value===1||value==='1'){this._dom.html=String.fromCharCode(0xf046);}else{this._dom.html=String.fromCharCode(0xf096);}}
_onClick(){if(this._disabled){return;}
let value=this.value;this.value=!(value===true||value===1||value==='1');}
_onDblClick(){return;}};kijs.gui.grid.cell.Date=class kijs_gui_grid_cell_Date extends kijs.gui.grid.cell.Cell{constructor(config={}){super(false);this._editorXType='kijs.gui.field.Date';this._hasTime=false;this._format='d.m.Y';Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{hasTime:true,format:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
_getEditorArgs(){let eArgs=super._getEditorArgs();eArgs.hasTime=this._hasTime;eArgs.displayFormat=this._format;return eArgs;}
_setDomHtml(value){let date=kijs.Date.create(value);if(kijs.isDate(date)){this._dom.html=kijs.Date.format(date,this._format);}else{this._dom.html=value;}}};kijs.gui.grid.cell.Icon=class kijs_gui_grid_cell_Icon extends kijs.gui.grid.cell.Cell{constructor(config={}){super(false);this._iconCls=null;this._icon=null;this._originalIcon=null;this._iconColor=null;this._caption=null;this._dom.clsAdd('kijs-icon');this.dom.clsAdd('kijs-grid-cell-icon');Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{iconChar:true,iconCls:{target:this._iconCls},iconColor:{target:'iconColor'},iconCharField:true,iconClsField:true,iconColorField:true,caption:{target:'caption'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get icon(){return this._icon;}
get originalIcon(){return this._originalIcon;}
set caption(val){this._caption=val;}
get caption(){return this._caption;}
set iconColor(val){this._dom.style.color=val;this._iconColor=val;}
get iconColor(){return this._iconColor;}
loadFromDataRow(){super.loadFromDataRow();if(this.row&&this.row.dataRow&&kijs.isDefined(this.row.dataRow[this.columnConfig.iconColorField])){this._iconColor=this.row.dataRow[this.columnConfig.iconColorField];this._dom.style.color=this._iconColor;}
let value=null;if(!value&&this.row&&this.row.dataRow&&kijs.isDefined(this.row.dataRow[this.columnConfig.iconCharField])){value=this.row.dataRow[this.columnConfig.iconCharField];}else if(!value&&this.row&&this.row.dataRow&&kijs.isDefined(this.row.dataRow[this.columnConfig.iconClsField])){value=this.row.dataRow[this.columnConfig.iconClsField];}
this._caption=this.row.dataRow[this.columnConfig.valueField];this._setDomHtml(value);}
_setDomHtml(value){this._originalIcon=value;if(kijs.isInteger(value)){value=String.fromCodePoint(value);}else if(kijs.isString(value)){value=kijs.String.htmlentities_decode(value);}
this._icon=value;this._dom.html=this._icon;}
_iconCls(val){if(kijs.isEmpty(val)){val=null;}
if(!kijs.isString&&!val){throw new kijs.Error(`config "iconCls" is not a string`);}
if(this._iconCls){this._dom.clsRemove(this._iconCls);}
this._iconCls=val;if(this._iconCls){this._dom.clsAdd(this._iconCls);}}};kijs.gui.grid.cell.Number=class kijs_gui_grid_cell_Number extends kijs.gui.grid.cell.Cell{constructor(config={}){super(false);this._numValue=null;this._editorXType='kijs.gui.field.Number';this._decimalPrecision=null;this._decimalPoint='.';this._decimalThousandSep='\'';this._numberStyles=[];this._unitBefore='';this._unitAfter='';Object.assign(this._defaultConfig,{cls:'kijs-grid-cell-number'});Object.assign(this._configMap,{decimalPrecision:true,decimalPoint:true,decimalThousandSep:true,numberStyles:{target:'numberStyles'},unitBefore:true,unitAfter:true});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get numberStyles(){return this._numberStyles;}
set numberStyles(val){if(!kijs.isArray(val)){val=[val];}
this._numberStyles=val;}
get value(){return this._numValue;}
set value(val){super.value=val;}
setValue(value,silent=false,markDirty=true,updateDataRow=true){let num=parseFloat(value);if(kijs.isNumber(num)){this._numValue=num;}else{this._numValue=value;}
super.setValue(this._numValue,silent,markDirty,updateDataRow);}
_getEditorArgs(){let eArgs=super._getEditorArgs();eArgs.allowDecimals=this._decimalPrecision>0;eArgs.alwaysDisplayDecimals=this._decimalPrecision>0;eArgs.decimalPrecision=this._decimalPrecision;eArgs.decimalSeparator=this._decimalPoint;eArgs.thousandsSeparator=this._decimalThousandSep;return eArgs;}
_setDomHtml(value){let num=parseFloat(value);if(kijs.isNumber(num)){this._dom.html=this._unitBefore+kijs.Number.format(num,this._decimalPrecision,this._decimalPoint,this._decimalThousandSep)+this._unitAfter;let numberStyle=this._getNumberStyle(num);for(let styleKey in numberStyle){this._dom.style[styleKey]=numberStyle[styleKey];}}else if(value){this._dom.html=this._unitBefore+kijs.toString(value)+this._unitAfter;}else{this._dom.html=value;}}
_getNumberStyle(number){let style={};kijs.Array.each(this._numberStyles,function(numberStyle){let from=kijs.isNumber(numberStyle.from)?numberStyle.from:Number.MIN_VALUE,to=kijs.isNumber(numberStyle.to)?numberStyle.to:Number.MAX_VALUE;if(number>=from&&number<=to){for(let key in numberStyle){if(key!=='from'&&key!=='to'){style[key]=numberStyle[key];}}}},this);return style;}};kijs.gui.grid.cell.Text=class kijs_gui_grid_cell_Text extends kijs.gui.grid.cell.Cell{constructor(config={}){super(false);Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}};kijs.gui.grid.filter.Checkbox=class kijs_gui_grid_filter_Checkbox extends kijs.gui.grid.filter.Filter{constructor(config={}){super(false);this._checkedType='';this._searchContainer.clsAdd('kijs-icon');this._compare=null;Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get filter(){return Object.assign(super.filter,{type:'checkbox',checkbox:this._compare});}
get isFiltered(){return this._compare!==null;}
reset(){this._compare='';super.reset();}
_applyToGrid(){if(this._compare==='checked'){this._searchContainer.html=String.fromCharCode(0xf046);}else if(this._compare==='unchecked'){this._searchContainer.html=String.fromCharCode(0xf096);}else{this._searchContainer.html='';}
super._applyToGrid();}
_getMenuButtons(){return kijs.Array.concat(this._getDefaultMenuButtons(),['-',{name:'btn_compare_checked',caption:kijs.getText('Alle angewählten'),iconChar:'&#xf096',on:{click:this._onFilterChange,context:this}},{caption:kijs.getText('Alle nicht angewählten'),name:'btn_compare_unchecked',iconChar:'&#xf096',on:{click:this._onFilterChange,context:this}}]);}
_onFilterChange(e){if(e.element.name==='btn_compare_checked'){this._compare='checked';}else if(e.element.name==='btn_compare_unchecked'){this._compare='unchecked';}
kijs.Array.each(e.element.parent.elements,function(element){if(element.name===e.element.name){element.iconChar='&#xf046';}else if(kijs.Array.contains(['btn_compare_checked','btn_compare_unchecked'],element.name)){element.iconChar='&#xf096';}});this._applyToGrid();}};kijs.gui.grid.filter.Icon=class kijs_gui_grid_filter_Icon extends kijs.gui.grid.filter.Filter{constructor(config={}){super(false);this._compare='begin';this._searchField=new kijs.gui.field.Text({disabled:true});this._checkboxGroup=null;Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.parent.grid.on('afterLoad',this._onAfterLoad,this);}
get filter(){return Object.assign(super.filter,{type:'icon',icons:this._checkboxGroup?this._checkboxGroup.value:null});}
get isFiltered(){return this._checkboxGroup?this._checkboxGroup.value?true:false:false;}
reset(){if(this._checkboxGroup){this._checkboxGroup.checkedAll=true;}
super.reset();}
_checkIcons(){let icons=[];let iconsCheck=[];let dataCnt=this._checkboxGroup?this._checkboxGroup.data.length:0;if(dataCnt<=this.columnConfig.iconsCnt){kijs.Array.each(this.parent.grid.rows,function(row){kijs.Array.each(row.cells,function(cell){if(cell.columnConfig.iconCharField===this.columnConfig.iconCharField){let contains=false;if(icons.length>0){kijs.Array.each(icons,function(value){if(value.id===cell.originalIcon&&value.icon===cell.icon&&value.color===cell.iconColor&&value.caption===cell.caption){contains=true;}},this);}
if(this._checkboxGroup&&!contains){kijs.Array.each(this._checkboxGroup.data,function(data){if(data.id===cell.originalIcon&&data.icon===cell.icon&&data.color===cell.iconColor&&data.caption===cell.caption){contains=true;}},this);}
if(!contains){icons.push({id:cell.originalIcon,icon:cell.icon,color:cell.iconColor,caption:cell.caption});iconsCheck.push(cell.originalIcon);}}},this);},this);}
return[icons,iconsCheck,dataCnt];}
_onAfterLoad(){;let checkIcons=this._checkIcons();let icons=checkIcons[0];let iconsCheck=checkIcons[1];let dataCnt=checkIcons[2];if(this._checkboxGroup===null&&dataCnt+icons.length<=this.columnConfig.iconsCnt){this._checkboxGroup=new kijs.gui.field.CheckboxGroup({name:'icons',valueField:'id',iconCharField:'icon',iconColorField:'color',captionField:'caption',data:icons,cls:'kijs-filter-icon-checkboxgroup',checkedAll:true,on:{change:this._onFilterChange,context:this}});this._menuButton.add(['-',this._checkboxGroup]);}else if(this._checkboxGroup&&icons.length>0){if(dataCnt+icons.length<=this.columnConfig.iconsCnt){this._checkboxGroup.addData(icons);this._checkboxGroup.checkedValues=iconsCheck;}else{this._menuButton.remove(['-',this._checkboxGroup]);this._checkboxGroup=null;}}}
_onFilterChange(){this._applyToGrid();}
_onKeyDown(e){e.nodeEvent.stopPropagation();if(e.nodeEvent.key==='Enter'){e.nodeEvent.preventDefault();this._applyToGrid();}}
render(superCall){super.render(true);this._searchField.renderTo(this._searchContainer.node);if(!superCall){this.raiseEvent('afterRender');}}};kijs.gui.grid.filter.Text=class kijs_gui_grid_filter_Text extends kijs.gui.grid.filter.Filter{constructor(config={}){super(false);this._compare='begin';this._searchField=new kijs.gui.field.Text({on:{change:function(){this._applyToGrid();},keyDown:this._onKeyDown,context:this}});Object.assign(this._defaultConfig,{placeholder:kijs.getText('Suche')+'...'});Object.assign(this._configMap,{placeholder:{target:'placeholder'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get filter(){return Object.assign(super.filter,{type:'text',search:this._searchField.value,compare:this._compare});}
get isFiltered(){return this._searchField.value!=='';}
get placeholder(){return this._searchField.placeholder;}
set placeholder(val){this._searchField.placeholder=val;}
reset(){this._searchField.value='';super.reset();}
_getMenuButtons(){return kijs.Array.concat(this._getDefaultMenuButtons(),['-',{name:'btn_compare_begin',caption:kijs.getText('Feldanfang'),iconChar:'&#xf046',on:{click:this._onCompareBtnClick,context:this}},{caption:kijs.getText('Beliebiger Teil'),name:'btn_compare_part',iconChar:'&#xf096',on:{click:this._onCompareBtnClick,context:this}},{caption:kijs.getText('Ganzes Feld'),name:'btn_compare_full',iconChar:'&#xf096',on:{click:this._onCompareBtnClick,context:this}}]);}
_onCompareBtnClick(e){this._menuButton.menuCloseAll();if(e.element.name==='btn_compare_begin'){this._compare='begin';}else if(e.element.name==='btn_compare_part'){this._compare='part';}else if(e.element.name==='btn_compare_full'){this._compare='full';}
kijs.Array.each(e.element.parent.elements,function(element){if(element.name===e.element.name){element.iconChar='&#xf046';}else if(kijs.Array.contains(['btn_compare_begin','btn_compare_part','btn_compare_full'],element.name)){element.iconChar='&#xf096';}});}
_onKeyDown(e){e.nodeEvent.stopPropagation();if(e.nodeEvent.key==='Enter'){e.nodeEvent.preventDefault();this._applyToGrid();}}
render(superCall){super.render(true);this._searchField.renderTo(this._searchContainer.node);if(!superCall){this.raiseEvent('afterRender');}}};kijs.gui.FormPanel=class kijs_gui_FormPanel extends kijs.gui.Panel{constructor(config={}){super(false);this._data={};this._facadeFnLoad=null;this._facadeFnSave=null;this._fields=null;this._rpc=null;this._rpcArgs={};this._errorMsg=kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt')+'.';Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{autoLoad:{target:'autoLoad'},data:{target:'data',prio:2000},errorMsg:true,facadeFnLoad:true,facadeFnSave:true,rpc:{target:'rpc'},rpcArgs:true});this.on('add',this._observChilds,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get autoLoad(){return this.hasListener('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}
set autoLoad(val){if(val){this.on('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}else{this.off('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}}
get data(){let data={};if(kijs.isEmpty(this._fields)){this.searchFields();}
if(!kijs.isEmpty(this._fields)){kijs.Array.each(this._fields,function(field){if(field.submitValue!==false){data[field.name]=field.value;}else{delete this._data[field.name];}},this);}
Object.assign(this._data,data);return this._data;}
set data(val){this._data=val;if(this._fields===null){this.searchFields();}
if(!kijs.isEmpty(this._fields)){kijs.Array.each(this._fields,function(field){if(field.name in this._data){field.value=this._data[field.name];field.isDirty=false;}},this);}}
get disabled(){if(kijs.isEmpty(this.fields)){this.searchFields();}
let fieldCnt=0,disabledCnt=0;kijs.Array.each(this.fields,function(element){if(element instanceof kijs.gui.field.Field){fieldCnt++;if(element.disabled){disabledCnt++;}}},this);return disabledCnt>(fieldCnt/2);}
set disabled(value){if(kijs.isEmpty(this.fields)){this.searchFields();}
kijs.Array.each(this.fields,function(element){if(element instanceof kijs.gui.field.Field){element.disabled=!!value;}},this);}
get fields(){if(kijs.isEmpty(this._fields)){this.searchFields();}
return this._fields;}
get facadeFnLoad(){return this._facadeFnLoad;}
set facadeFnLoad(val){this._facadeFnLoad=val;}
get facadeFnSave(){return this._facadeFnSave;}
set facadeFnSave(val){this._facadeFnSave=val;}
get isDirty(){if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){if(this._fields[i].isDirty){return true;}}
return false;}
set isDirty(val){if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){this._fields[i].isDirty=!!val;}}
get isEmpty(){let empty=true;if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){if(!this._fields[i].isEmpty){empty=false;}}
return empty;}
get readOnly(){if(kijs.isEmpty(this.fields)){this.searchFields();}
let readOnly=0;kijs.Array.each(this.fields,function(element){if(element instanceof kijs.gui.field.Field){if(element.readOnly){readOnly++;}}},this);if(readOnly>(this.fields.length/2)){return true;}else{return false;}}
set readOnly(value){if(kijs.isEmpty(this.fields)){this.searchFields();}
kijs.Array.each(this.fields,function(element){if(element instanceof kijs.gui.field.Field){element.readOnly=value;}},this);}
get rpc(){return this._rpc;}
set rpc(val){if(val instanceof kijs.gui.Rpc){this._rpc=val;}else if(kijs.isString(val)){if(this._rpc){this._rpc.url=val;}else{this._rpc=new kijs.gui.Rpc({url:val});}}else{throw new kijs.Error(`Unkown format on config "rpc"`);}}
clear(){if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){if(this._fields[i].xtype!=='kijs.gui.field.Display'){this._fields[i].value=null;}}
this._data={};this.resetValidation();}
load(args=null,searchFields=false,resetValidation=false){return new Promise((resolve,reject)=>{if(this._facadeFnLoad){if(!kijs.isObject(args)){args={};}
args=Object.assign(args,this._rpcArgs);this._rpc.do(this._facadeFnLoad,args,function(response){if(response.form){this.removeAll();this.add(response.form);}
if(searchFields||response.form||kijs.isEmpty(this._fields)){this.searchFields();}
if(response.formData){this.data=response.formData;}
if(resetValidation){this.resetValidation();}
this.isDirty=false;this.raiseEvent('afterLoad',{response:response});resolve(response);},this,true,this,'dom',false,this._onRpcBeforeMessages);}});}
reset(){if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){this._fields[i].reset();}
this.raiseEvent('change');}
resetValidation(){if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){if(kijs.isFunction(this._fields[i].markInvalid)){this._fields[i].markInvalid();}}}
save(searchFields=false,args=null){return new Promise((resolve,reject)=>{if(!kijs.isObject(args)){args={};}
if(searchFields||kijs.isEmpty(this._fields)){this.searchFields();}
let ok=this.validate();args.formData=this.data;if(ok){this._rpc.do(this.facadeFnSave,args,function(response){this.isDirty=false;this.raiseEvent('afterSave',{response:response});resolve(response);},this,false,this,'dom',false,this._onRpcBeforeMessages);}else{kijs.gui.MsgBox.error(kijs.getText('Fehler'),kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt')+'.');}});}
searchFields(parent=this){let ret=[];for(let i=0;i<parent.elements.length;i++){let el=parent.elements[i];if(el instanceof kijs.gui.field.Field&&!kijs.isEmpty(el.name)){ret.push(el);}else if(el instanceof kijs.gui.Container){ret=ret.concat(this.searchFields(el));}}
if(parent===this){this._fields=ret;}
return ret;}
validate(){let ret=true;if(kijs.isEmpty(this._fields)){this.searchFields();}
for(let i=0;i<this._fields.length;i++){if(!this._fields[i].validate()){ret=false;}}
return ret;}
_observChilds(){kijs.Array.each(this.getElements(),function(el){if(el instanceof kijs.gui.Container&&!(el instanceof kijs.gui.field.Field)){if(!el.hasListener('add',this._onChildAdd,this)){el.on('add',this._onChildAdd,this);}}else if(el instanceof kijs.gui.field.Field){if(!el.hasListener('change',this._onChildChange,this)){el.on('change',this._onChildChange,this);}}},this);}
_onRpcBeforeMessages(response){if(response.responseData&&!kijs.isEmpty(response.responseData.fieldErrors)){if(!kijs.isEmpty(this._fields)){kijs.Array.each(this._fields,function(field){if(response.responseData.fieldErrors[field.name]){field.addValidateErrors(response.responseData.fieldErrors[field.name]);}},this);}
if(kijs.isEmpty(response.errorMsg)&&!kijs.isEmpty(this._errorMsg)){response.errorMsg=this._errorMsg;}}}
_onAfterFirstRenderTo(e){this.load();}
_onChildAdd(){this._observChilds();}
_onChildChange(e){this.raiseEvent('change',e);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._data=null;this._fields=null;this._rpc=null;super.destruct(true);}};kijs.gui.ListView=class kijs_gui_ListView extends kijs.gui.DataView{constructor(config={}){super(false);this._captionField=null;this._captionHtmlDisplayType='html';this._valueField=null;this._iconCharField=null;this._iconClsField=null;this._iconColorField=null;this._toolTipField=null;this._showCheckBoxes=false;this._value=null;this._ddSort=false;this._dom.clsRemove('kijs-dataview');this._dom.clsAdd('kijs-listview');Object.assign(this._defaultConfig,{selectType:'single'});Object.assign(this._configMap,{captionField:true,iconCharField:true,iconClsField:true,iconColorField:true,showCheckBoxes:true,toolTipField:true,valueField:true,ddSort:true,value:{target:'value'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
this.applyConfig(config);this.on('afterLoad',this._onAfterLoad,this);}
get captionField(){return this._captionField;}
set captionField(val){this._captionField=val;}
get ddSort(){return this._ddSort;}
set ddSort(val){this._ddSort=!!val;}
get iconCharField(){return this._iconCharField;}
set iconCharField(val){this._iconCharField=val;}
get iconClsField(){return this._iconClsField;}
set iconClsField(val){this._iconClsField=val;}
get iconColorField(){return this._iconColorField;}
set iconColorField(val){this._iconColorField=val;}
get showCheckBoxes(){return this._showCheckBoxes;}
set showCheckBoxes(val){this._showCheckBoxes=val;}
get toolTipField(){return this._toolTipField;}
set toolTipField(val){this._toolTipField=val;}
get valueField(){return this._valueField;}
set valueField(val){this._valueField=val;}
get value(){let val=null;if(this._valueField){let selElements=this.getSelected();if(kijs.isArray(selElements)){val=[];kijs.Array.each(selElements,function(el){val.push(el.dataRow[this._valueField]);},this);}else if(!kijs.isEmpty(selElements)){val=selElements.dataRow[this._valueField];}}
return val;}
set value(val){if(kijs.isEmpty(this._valueField)){throw new kijs.Error(`Es wurde kein "valueField" definiert.`);}
this._value=val;let filters=[];if(kijs.isArray(val)){kijs.Array.each(val,function(v){filters.push({field:this._valueField,value:v});},this);}else if(!kijs.isEmpty(val)){filters={field:this._valueField,value:val};}
this.selectByFilters(filters,false,true);}
createElement(dataRow,index){let html='';html+='<span class="kijs-icon';if(!kijs.isEmpty(this._iconClsField)&&!kijs.isEmpty(dataRow[this._iconClsField])){html+=' '+dataRow[this._iconClsField];}
html+='"';if(!kijs.isEmpty(this._iconColorField)&&!kijs.isEmpty(dataRow[this._iconColorField])){html+=' style="color:'+dataRow[this._iconColorField]+'"';}
html+='>';if(!kijs.isEmpty(this._iconCharField)&&!kijs.isEmpty(dataRow[this._iconCharField])){html+=dataRow[this._iconCharField];}
html+='</span>';html+='<span class="kijs-caption">';if(!kijs.isEmpty(this._captionField)&&!kijs.isEmpty(dataRow[this._captionField])){html+=dataRow[this._captionField];}
html+='</span>';let toolTip='';if(!kijs.isEmpty(this._toolTipField)&&!kijs.isEmpty(dataRow[this._toolTipField])){toolTip=dataRow[this._toolTipField];}
let cls='';if(this._showCheckBoxes){switch(this._selectType){case'single':cls='kijs-display-options';break;case'simple':case'multi':cls='kijs-display-checkboxes';break;}}
let dve=new kijs.gui.DataViewElement({dataRow:dataRow,html:html,toolTip:toolTip,cls:cls});kijs.DragDrop.addDragEvents(dve,dve.dom);kijs.DragDrop.addDropEvents(dve,dve.dom);dve.on('ddOver',this._onDdOver,this);dve.on('ddDrop',this._onDdDrop,this);return dve;}
_onAfterLoad(e){if(!kijs.isEmpty(this._value)){this.value=this._value;}}
_onDdDrop(e){let tIndex=this._elements.indexOf(e.targetElement);let sIndex=this._elements.indexOf(e.sourceElement);let pos=e.position.position;if(this.raiseEvent('ddDrop',e)===false){return;}
if(this._ddSort&&tIndex!==-1&&sIndex!==-1&&tIndex!==sIndex&&(pos==='above'||pos==='below')){if(pos==='below'){tIndex+=1;}
kijs.Array.move(this._elements,sIndex,tIndex);if(this.isRendered){this.render();}}}
_onDdOver(e){if(!this._ddSort||this._elements.indexOf(e.sourceElement)===-1||this.raiseEvent('ddOver',e)===false){e.position.allowAbove=false;e.position.allowBelow=false;e.position.allowLeft=false;e.position.allowOnto=false;e.position.allowRight=false;}else{e.position.allowAbove=true;e.position.allowBelow=true;e.position.allowLeft=false;e.position.allowOnto=false;e.position.allowRight=false;}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._value=null;super.destruct(true);}};kijs.gui.Window=class kijs_gui_Window extends kijs.gui.Panel{constructor(config={}){super(false);this._resizeDeferHandle=null;this._dragInitialPos=null;this._modalMaskEl=null;this._draggable=false;this._resizeDelay=300;this._targetX=null;this._targetDomProperty='dom';this._dom.clsAdd('kijs-window');Object.assign(this._defaultConfig,{draggable:true,target:document.body,closable:true,maximizable:true,resizable:true,shadow:true});Object.assign(this._configMap,{draggable:{target:'draggable'},modal:{target:'modal'},resizeDelay:true,target:{target:'target'},targetDomProperty:true});this.on('mouseDown',this._onMouseDown,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get draggable(){return this._draggable;}
set draggable(val){if(val&&!this._draggable){this._headerBarEl.on('mouseDown',this._onHeaderBarMouseDown,this);}else if(!val&&this._draggable){this._headerBarEl.off('mouseDown',this._onHeaderBarMouseDown,this);kijs.Dom.removeEventListener('mousemove',document,this);kijs.Dom.removeEventListener('mouseup',document,this);}
this._draggable=!!val;}
get modal(){return!kijs.isEmpty(this._modalMaskEl);}
set modal(val){if(val){if(kijs.isEmpty(this._modalMaskEl)){this._modalMaskEl=new kijs.gui.Mask({target:this.target,targetDomProperty:this.targetDomProperty});}}else{if(!kijs.isEmpty(this._modalMaskEl)){this._modalMaskEl.destruct();}}}
get parentNode(){if(this._targetX instanceof kijs.gui.Element){return this._targetX[this._targetDomProperty].node.parentNode;}else{return this._targetX;}}
get resizeDelay(){return this._resizeDelay;}
set resizeDelay(val){this._resizeDelay=val;}
get target(){return this._targetX;}
set target(val){if(!kijs.isEmpty(this._targetX)){if(this._targetX instanceof kijs.gui.Element){this._targetX.off('afterResize',this._onTargetElAfterResize,this);this._targetX.off('changeVisibility',this._onTargetElChangeVisibility,this);this._targetX.off('destruct',this._onTargetElDestruct,this);}else if(this._targetX===document.body){kijs.Dom.removeEventListener('resize',window,this);}}
if(val instanceof kijs.gui.Element){this._targetX=val;this._targetX.on('afterResize',this._onTargetElAfterResize,this);this._targetX.on('changeVisibility',this._onTargetElChangeVisibility,this);this._targetX.on('destruct',this._onTargetElDestruct,this);}else if(val===document.body||val===null){this._targetX=document.body;kijs.Dom.addEventListener('resize',window,this._onWindowResize,this);}else{throw new kijs.Error(`Unkown format on config "target"`);}}
get targetDomProperty(){return this._targetDomProperty;};set targetDomProperty(val){this._targetDomProperty=val;};get targetNode(){if(this._targetX instanceof kijs.gui.Element){return this._targetX[this._targetDomProperty].node;}else{return this._targetX;}}
center(preventEvents=false){const targetNode=this.targetNode;const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;this.left=targetNode.offsetLeft+(targetNode.offsetWidth-this.width)/2;this.top=targetNode.offsetTop+(targetNode.offsetHeight-this.height)/2;this._preventAfterResize=prevAfterRes;if(!preventEvents&&this._hasSizeChanged()){this._raiseAfterResizeEvent(true);}}
restore(){if(!this.maximized){return;}
const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;super.restore();if(!this._dom.hasLeft||!this._dom.hasTop){this.center(true);}
this._adjustPositionToTarget(true);this._preventAfterResize=prevAfterRes;this._raiseAfterResizeEvent(true);}
show(){if(this._modalMaskEl){this._modalMaskEl.renderTo(this.parentNode);new kijs.gui.LayerManager().setActive(this._modalMaskEl);}
this.renderTo(this.parentNode);if(!this.maximized){if(!this._dom.hasLeft||!this._dom.hasTop){this.center(true);}else{this._adjustPositionToTarget(true);}}
this._raiseAfterResizeEvent(true);this.toFront();}
toFront(){if(this._dom.node&&this._dom.node.parentNode&&(!this.resizer||(this.resizer&&!this.resizer.domOverlay))){new kijs.gui.LayerManager().setActive(this);}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
if(this._modalMaskEl){this._modalMaskEl.unrender();}
super.unrender(true);}
_adjustPositionToTarget(preventEvents=false){const targetNode=this.targetNode;const prevAfterRes=this._preventAfterResize;this._preventAfterResize=true;let left=this.left;let top=this.top;let width=this.width;let height=this.height;if(width>targetNode.offsetWidth){width=targetNode.offsetWidth;}
if(height>targetNode.offsetHeight){height=targetNode.offsetHeight;}
this.width=width;this.height=height;if(left+width>targetNode.offsetLeft+targetNode.offsetWidth){left=targetNode.offsetLeft+(targetNode.offsetWidth-width);}
if(left<0){left=0;}
if(top+height>targetNode.offsetTop+targetNode.offsetHeight){top=targetNode.offsetTop+(targetNode.offsetHeight-height);}
if(top<0){top=0;}
this.left=left;this.top=top;this._preventAfterResize=prevAfterRes;if(!preventEvents&&this._hasSizeChanged()){this._raiseAfterResizeEvent(true);}}
_onHeaderBarMouseDown(e){this.toFront();if(this.maximized){return;}
this._dragInitialPos={mouseX:e.nodeEvent.clientX,mouseY:e.nodeEvent.clientY,windowX:this.left,windowY:this.top,windowTransition:this.style.transition?this.style.transition:''};this.style.transition='none';kijs.Dom.addEventListener('mousemove',document,this._onDocumentMouseMove,this);kijs.Dom.addEventListener('mouseup',document,this._onDocumentMouseUp,this);}
_onDocumentMouseMove(e){if(kijs.isEmpty(this._dragInitialPos)){return;}
let x=this._dragInitialPos.windowX+(e.nodeEvent.clientX-this._dragInitialPos.mouseX);let y=this._dragInitialPos.windowY+(e.nodeEvent.clientY-this._dragInitialPos.mouseY);if(x<0){x=0;}
if(y<0){y=0;}
const targetNode=this.targetNode;if(x<targetNode.offsetLeft){x=targetNode.offsetLeft;}
if((x+this._dom.width)>(targetNode.offsetLeft+targetNode.offsetWidth)){x=targetNode.offsetLeft+targetNode.offsetWidth-this._dom.width;}
if(y<targetNode.offsetTop){y=targetNode.offsetTop;}
if((y+this._dom.height)>(targetNode.offsetTop+targetNode.offsetHeight)){y=targetNode.offsetTop+targetNode.offsetHeight-this._dom.height;}
this.left=x;this.top=y;}
_onDocumentMouseUp(e){kijs.Dom.removeEventListener('mousemove',document,this);kijs.Dom.removeEventListener('mouseup',document,this);if(kijs.isEmpty(this._dragInitialPos)){return;}
this.dom.style.transition=this._dragInitialPos.windowTransition;this._dragInitialPos=null;}
_onMouseDown(e){this.toFront();}
_onTargetElAfterResize(e){this._adjustPositionToTarget(true);this._raiseAfterResizeEvent(false,e);}
_onTargetElChangeVisibility(e){this.visible=e.visible;}
_onTargetElDestruct(e){this.destruct();}
_onWindowResize(e){this._adjustPositionToTarget(true);this._raiseAfterResizeEvent(true,e);}
destruct(superCall){if(!superCall){this.unrender();this.raiseEvent('destruct');}
if(this._targetX===document.body){kijs.Dom.removeEventListener('resize',window,this);}
kijs.Dom.removeEventListener('mouseMove',document,this);kijs.Dom.removeEventListener('mouseUp',document,this);if(this._targetX instanceof kijs.gui.Element){this._targetX.off(null,null,this);}
if(this._resizeDeferHandle){window.clearTimeout(this._resizeDeferHandle);}
if(this._modalMaskEl){this._modalMaskEl.destruct();}
this._dragInitialPos=null;this._modalMaskEl=null;this._resizeDeferHandle=null;this._targetX=null;super.destruct(true);}};kijs.gui.field.Checkbox=class kijs_gui_field_Checkbox extends kijs.gui.field.Field{constructor(config={}){super(false);this._captionHide=false;this._checked=0;this._checkedIconChar='&#xf046';this._checkedIconCls=null;this._determinatedIconChar='&#xf147';this._determinatedIconCls=null;this._uncheckedIconChar='&#xf096';this._uncheckedIconCls=null;this._threeState=false;this._valueChecked=true;this._valueDeterminated=2;this._valueUnchecked=false;this._inputWrapperDom.nodeAttributeSet('tabIndex',0);this._checkboxIconEl=new kijs.gui.Icon({parent:this,cls:'kijs-checkbox-input'});this._iconEl=new kijs.gui.Icon({parent:this,cls:'kijs-checkbox-icon'});this._captionDom=new kijs.gui.Dom({cls:'kijs-caption',nodeTagName:'span'});this._dom.clsAdd('kijs-field-checkbox');Object.assign(this._configMap,{caption:{target:'html',context:this._captionDom},captionCls:{fn:'function',target:this._captionDom.clsAdd,context:this._captionDom},captionHide:true,captionHtmlDisplayType:{target:'htmlDisplayType',context:this._captionDom},captionStyle:{fn:'assign',target:'style',context:this._captionDom},captionWidth:{target:'captionWidth'},checkedIconChar:true,checkedIconCls:true,determinatedIconChar:true,determinatedIconCls:true,uncheckedIconChar:true,uncheckedIconCls:true,icon:{target:'icon'},iconChar:{target:'iconChar',context:this._iconEl},iconCls:{target:'iconCls',context:this._iconEl},iconColor:{target:'iconColor',context:this._iconEl},threeState:{prio:1001,target:'_threeState'},valueChecked:{prio:1002,target:'_valueChecked'},valueUnchecked:{prio:1002,target:'_valueUnchecked'},valueDeterminated:{prio:1002,target:'_valueDeterminated'},value:{prio:1003,target:'value'},checked:{prio:1004,target:'checked'}});this._eventForwardsAdd('focus',this._inputWrapperDom);this._eventForwardsAdd('blur',this._inputWrapperDom);this._inputWrapperDom.on('click',this._onClick,this);this._inputWrapperDom.on('spacePress',this._onSpacePress,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get caption(){return this._captionDom.html;}
set caption(val){this._captionDom.html=val;}
get captionHide(){return this._captionHide;}
set captionHide(val){this._captionHide=val;if(this.isRendered){if(val){this._captionDom.renderTo(this._inputWrapperDom.node,this._inputDom.node);}else{this._captionDom.unrender();}}}
get captionDom(){return this._captionDom;}
get captionHtmlDisplayType(){return this._captionDom.htmlDisplayType;}
set captionHtmlDisplayType(val){this._captionDom.htmlDisplayType=val;}
get captionWidth(){return this._captionDom.width;}
set captionWidth(val){this._captionDom.width=val;}
get checked(){return this._checked;}
set checked(val){if(val===2||val==='2'){this._checked=2;}else if(val===1||val==='1'||val===true){this._checked=1;}else if(val===0||val==='0'||val===false||kijs.isEmpty(val)){this._checked=0;}else{throw new kijs.Error(`config "checked" is not valid.`);}
this._updateCheckboxIcon();}
get checkboxIcon(){return this._checkboxIconEl;}
get icon(){return this._iconEl;}
set icon(val){if(kijs.isEmpty(val)){this._iconEl.iconChar=null;this._iconEl.iconCls=null;this._iconEl.iconColor=null;if(this.isRendered){this.render();}}else if(val instanceof kijs.gui.Icon){this._iconEl.destruct();this._iconEl=val;if(this.isRendered){this.render();}}else if(kijs.isObject(val)){this._iconEl.applyConfig(val);if(this.isRendered){this.render();}}else{throw new kijs.Error(`config "icon" is not valid.`);}}
get iconChar(){return this._iconEl.iconChar;}
set iconChar(val){this._iconEl.iconChar=val;if(this.isRendered){this.render();}}
get iconCls(){return this._iconEl.iconCls;}
set iconCls(val){this._iconEl.iconCls=val;if(this.isRendered){this.render();}}
get iconColor(){return this._iconEl.iconColor;}
set iconColor(val){this._iconEl.iconColor=val;if(this.isRendered){this.render();}}
get inputWrapperDom(){return this._inputWrapperDom;}
get isEmpty(){return kijs.isEmpty(this._checked===0);}
get threeState(){return this._threeState;}
set threeState(val){this._threeState=val;}
get value(){switch(this._checked){case 0:return this._valueUnchecked;case 1:return this._valueChecked;case 2:return this._valueDeterminated;}}
set value(val){if(val===this._valueUnchecked||val===false||val===0||val==='0'){this._checked=0;}else if(val===this._valueChecked||val===true||val===1||val==='1'){this._checked=1;}else if(val===this._valueDeterminated||val===2){this._checked=2;}else if(val===null){this._checked=0;}else{throw new kijs.Error(`config "value" is not valid.`);}
this._updateCheckboxIcon();this.validate();}
get valueChecked(){return this._valueChecked;}
set valueChecked(val){this._valueChecked=val;}
get valueDeterminated(){return this._valueDeterminated;}
set valueDeterminated(val){this._valueDeterminated=val;}
get valueUnchecked(){return this._valueUnchecked;}
set valueUnchecked(val){this._valueUnchecked=val;}
render(superCall){super.render(true);this._checkboxIconEl.renderTo(this._inputWrapperDom.node);this._updateCheckboxIcon();if(!this._iconEl.isEmpty){this._iconEl.renderTo(this._inputWrapperDom.node);}else{this._iconEl.unrender();}
if(!this._captionHide){this._captionDom.renderTo(this._inputWrapperDom.node);}else{this._captionDom.unrender();}
if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._checkboxIconEl.unrender();this._iconEl.unrender();this._captionDom.unrender();super.unrender(true);}
_updateCheckboxIcon(){let cls,iconChar,iconCls;switch(this._checked){case 0:cls='kijs-unchecked';iconChar=this._uncheckedIconChar;iconCls=this._uncheckedIconCls;break;case 1:cls='kijs-checked';iconChar=this._checkedIconChar;iconCls=this._checkedIconCls;break;case 2:cls='kijs-determinated';iconChar=this._determinatedIconChar;iconCls=this._determinatedIconCls;break;}
this._dom.clsRemove(['kijs-checked','kijs-determinated','kijs-unchecked']);this._dom.clsAdd(cls);this._checkboxIconEl.iconChar=iconChar;this._checkboxIconEl.iconCls=iconCls;}
_onClick(e){if(!this.readOnly&&!this.disabled){const oldChecked=this._checked;const oldValue=this.value;this._checked++;if(this._threeState){if(this._checked>2){this._checked=0;}}else{if(this._checked>1){this._checked=0;}}
this._updateCheckboxIcon();this._checkboxIconEl.focus();this.validate();this.raiseEvent(['input','change'],{oldChecked:oldChecked,checked:this._checked,oldValue:oldValue,value:this.value});}}
_onSpacePress(e){if(!this.readOnly&&!this.disabled){const oldChecked=this._checked;const oldValue=this.value;this._checked++;if(this._threeState){if(this._checked>2){this._checked=0;}}else{if(this._checked>1){this._checked=0;}}
this._updateCheckboxIcon();this.validate();this.raiseEvent(['input','change'],{oldChecked:oldChecked,checked:this._checked,oldValue:oldValue,value:this.value});}
e.nodeEvent.preventDefault();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._checkboxIconEl){this._checkboxIconEl.destruct();}
if(this._iconEl){this._iconEl.destruct();}
if(this._captionDom){this._captionDom.destruct();}
this._checkboxIconEl=null;this._iconEl=null;this._captionDom=null;super.destruct(true);}};kijs.gui.field.Combo=class kijs_gui_field_Combo extends kijs.gui.field.Field{constructor(config={}){super(false);this._minChars=null;this._minSelectCount=null;this._maxSelectCount=null;this._caption=null;this._oldCaption=null;this._oldValue=null;this._value='';this._keyUpDefer=null;this._remoteSort=false;this._forceSelection=true;this._firstLoaded=false;this._showPlaceholder=true;this._selectFirst=false;this._inputDom=new kijs.gui.Dom({disableEscBubbeling:true,nodeTagName:'input',nodeAttribute:{id:this._inputId}});this._listViewEl=new kijs.gui.ListView({cls:'kijs-field-combo',autoLoad:false,focusable:false});this._spinBoxEl=new kijs.gui.SpinBox({target:this,targetDomProperty:'inputWrapperDom',ownerNodes:[this._inputWrapperDom,this._spinIconEl.dom],openOnInput:true,elements:[this._listViewEl],style:{maxHeight:'400px'}});this._dom.clsAdd('kijs-field-combo');Object.assign(this._defaultConfig,{spinIconVisible:true,minChars:'auto',valueField:'value',captionField:'caption'});Object.assign(this._configMap,{autoLoad:{target:'autoLoad'},remoteSort:true,showPlaceholder:true,forceSelection:true,selectFirst:true,showCheckBoxes:{target:'showCheckBoxes',context:this._listViewEl},selectType:{target:'selectType',context:this._listViewEl},facadeFnLoad:{target:'facadeFnLoad',context:this._listViewEl},facadeFnArgs:{target:'facadeFnArgs',context:this._listViewEl},rpc:{target:'rpc',context:this._listViewEl},minChars:{target:'minChars',prio:2},captionField:{target:'captionField',context:this._listViewEl},iconCharField:{target:'iconCharField',context:this._listViewEl},iconClsField:{target:'iconClsField',context:this._listViewEl},iconColorField:{target:'iconColorField',context:this._listViewEl},toolTipField:{target:'toolTipField',context:this._listViewEl},valueField:{target:'valueField',context:this._listViewEl},minSelectCount:true,maxSelectCount:true,data:{prio:1000,target:'data'},value:{prio:1001,target:'value'}});this._eventForwardsAdd('input',this._inputDom);this._eventForwardsAdd('blur',this._inputDom);this._eventForwardsAdd('keyDown',this._inputDom);this._eventForwardsAdd('afterLoad',this._listViewEl);this._inputDom.on('keyUp',this._onInputKeyUp,this);this._inputDom.on('keyDown',this._onInputKeyDown,this);this._inputDom.on('change',this._onInputChange,this);this._spinBoxEl.on('click',this._onSpinBoxClick,this);this._listViewEl.on('click',this._onListViewClick,this);this._listViewEl.on('afterLoad',this._onListViewAfterLoad,this);this._spinBoxEl.on('show',this._onSpinBoxShow,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get autoLoad(){return this.hasListener('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}
set autoLoad(val){if(val){this.on('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}else{this.off('afterFirstRenderTo',this._onAfterFirstRenderTo,this);}}
get captionField(){return this._listViewEl.captionField;}
set captionField(val){this._listViewEl.captionField=val;}
get valueField(){return this._listViewEl.valueField;}
set valueField(val){this._listViewEl.valueField=val;}
set data(val){this._listViewEl.data=val;if(this._selectFirst){this.value=this._listViewEl.data[0].value;}}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;if(val){this._inputDom.nodeAttributeSet('disabled',true);}else{this._inputDom.nodeAttributeSet('disabled',false);}
this._listViewEl.disabled=!!val;}
get facadeFnArgs(){return this._listViewEl.facadeFnArgs;}
set facadeFnArgs(val){this._listViewEl.facadeFnArgs=val;}
get facadeFnLoad(){return this._listViewEl.facadeFnLoad;}
set facadeFnLoad(val){this._listViewEl.facadeFnLoad=val;}
get inputDom(){return this._inputDom;}
get minChars(){return this._minChars;}
set minChars(val){if(val==='auto'){if(this._listViewEl.facadeFnLoad){this._minChars=4;}else{this._minChars=0;}}else if(kijs.isInteger(val)&&val>0){this._minChars=val;}else{throw new kijs.Error(`invalid argument for parameter minChars in kijs.gui.field.Combo`);}}
get isEmpty(){return kijs.isEmpty(this.value);}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;this._listViewEl.disabled=!!val;if(val){this._inputDom.nodeAttributeSet('readOnly',true);}else{this._inputDom.nodeAttributeSet('readOnly',false);}}
get rpc(){return this._listViewEl.rpc;}
set rpc(val){this._listViewEl.rpc=val;}
get value(){return this._value;}
set value(val){let valueIsInStore=val===''||val===null||this._isValueInStore(val);this._oldCaption=this._caption;this._oldValue=this._value;this._caption=this._getCaptionFromValue(val);this._value=val;this._listViewEl.value=val;if(this._remoteSort){if(!valueIsInStore&&this._firstLoaded){this.load(null,true);}
if(this._value===''||this._value===null){}}
this._inputDom.nodeAttributeSet('value',this._caption);}
get oldValue(){return this._oldValue;}
load(args=null,forceLoad=false,query=null){args=kijs.isObject(args)?args:{};args.remoteSort=!!this._remoteSort;this._firstLoaded=true;if(this._remoteSort){args.query=kijs.toString(query);args.value=this.value;if(forceLoad||args.query.length>=this._minChars){this._listViewEl.load(args).then(()=>{if(query===null&&this._isValueInStore(this.value)){this.value=this._value;}});}else{this._listViewEl.data=[];this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten','',this._minChars)+'.');}}else{this._listViewEl.load(args);}}
render(superCall){super.render(true);this._inputDom.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._inputDom.unrender();super.unrender(true);}
_addPlaceholder(text){if(this._showPlaceholder){if(this._listViewEl.down('kijs-gui-field-combo-placeholder')){this._listViewEl.down('kijs-gui-field-combo-placeholder').html=text;}else{this._listViewEl.add({xtype:'kijs.gui.Container',name:'kijs-gui-field-combo-placeholder',cls:'kijs-placeholder',html:text,htmlDisplayType:'code'});}}}
_getCaptionFromValue(val){let found=false;let caption=null;kijs.Array.each(this._listViewEl.data,function(row){if(row[this.valueField]===val){found=true;caption=row[this.captionField];return false;}},this);if(!found){caption=val;}
return kijs.toString(caption);}
_isValueInStore(val){let found=false;kijs.Array.each(this._listViewEl.data,function(row){if(row[this.valueField]===val){found=true;return false;}},this);return found;}
_setProposal(key){let inputVal=this._inputDom.nodeAttributeGet('value'),matchVal='';inputVal=kijs.toString(inputVal).trim();if(inputVal&&key!=='Backspace'&&key!=='Delete'){kijs.Array.each(this._listViewEl.data,function(row){if(kijs.isString(row[this.captionField])&&row[this.captionField].toLowerCase()===inputVal.toLowerCase()){matchVal=row[this.captionField];return false;}},this);if(matchVal===''){kijs.Array.each(this._listViewEl.data,function(row){let caption=row[this.captionField];if(kijs.isString(row[this.captionField])&&inputVal.length<=caption.length&&caption.substr(0,inputVal.length).toLowerCase()===inputVal.toLowerCase()){matchVal=row[this.captionField];return false;}},this);}
if(matchVal){this._inputDom.nodeAttributeSet('value',matchVal);if(matchVal.length!==inputVal.length){this._inputDom.node.setSelectionRange(inputVal.length,matchVal.length);}}
this._listViewEl.applyFilters({field:this.captionField,value:inputVal});}else if(key==='Backspace'||key==='Delete'){this._listViewEl.applyFilters({field:this.captionField,value:inputVal});}else{this._listViewEl.applyFilters(null);}}
_setScrollPositionToSelection(){let sel=this._listViewEl.getSelected();if(kijs.isObject(sel)&&sel instanceof kijs.gui.DataViewElement){if(kijs.isNumber(sel.top)&&this._spinBoxEl.isRendered){let spH=this._spinBoxEl.dom.height,spSt=this._spinBoxEl.dom.node.scrollTop;let minScrollValue=sel.top;let maxScrollValue=sel.top-spH+sel.height;if(this._spinBoxEl.dom.node.scrollTop===0||this._spinBoxEl.dom.node.scrollTop>minScrollValue){this._spinBoxEl.dom.node.scrollTop=minScrollValue;}else if(this._spinBoxEl.dom.node.scrollTop<maxScrollValue){this._spinBoxEl.dom.node.scrollTop=maxScrollValue+5;}}}}
_validationRules(value){if(this._required){if(kijs.isEmpty(value)){this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));}}
if(this._forceSelection&&!this._remoteSort&&!kijs.isEmpty(value)){let match=false;kijs.Array.each(this._listViewEl.data,function(row){if(row[this.valueField]===value){match=true;return false;}},this);if(!match){this._errors.push(kijs.getText('Der Wert "%1" ist nicht in der Liste enthalten','',value)+'.');}}
if(!kijs.isEmpty(this._minSelectCount)&&this._minSelectCount>=0){if(kijs.isArray(value)){if(kijs.isEmpty(value)&&this._minSelectCount>0||value.length<this._minSelectCount){this._errors.push(kijs.getText('Min. %1 Datensätze müssen ausgewählt werden','',this._minSelectCount));}}}
if(!kijs.isEmpty(this._maxSelectCount)&&this._maxSelectCount>0){if(kijs.isArray(value)){if(value.length>this._maxSelectCount){this._errors.push(kijs.getText('Max. %1 Datensätze dürfen ausgewählt werden','',this._maxSelectCount));}}}}
_onAfterFirstRenderTo(e){this.load(null,this.value!=='');}
_onInputKeyDown(e){if(this._listViewEl.getSelected()){this._listViewEl._onKeyDown(e);}else if(e.nodeEvent.key==='ArrowDown'){let indx=this._listViewEl.elements.length>0&&kijs.isDefined(this._listViewEl.elements[0].index)?this._listViewEl.elements[0].index:null;if(indx!==null){this._listViewEl.selectByIndex(indx);}}
if(e.nodeEvent.key==='ArrowDown'||e.nodeEvent.key==='ArrowUp'){this._setScrollPositionToSelection();}
if(e.nodeEvent.key==='Enter'){let dataViewElement=this._listViewEl.getSelected();this._spinBoxEl.close();if(dataViewElement&&dataViewElement instanceof kijs.gui.DataViewElement){let newVal=dataViewElement.dataRow[this.valueField];let changed=newVal!==this.value;this.value=newVal;if(changed){this.raiseEvent('change');}}
e.nodeEvent.stopPropagation();}else if(e.nodeEvent.key==='Escape'){this._spinBoxEl.close();this._listViewEl.value=this.value;e.nodeEvent.stopPropagation();}}
_onInputKeyUp(e){let specialKeys=['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','ContextMenu','Delete','Insert','Home','End','Alt','NumpadEnter','AltGraph','ContextMenu','Control','Shift','Enter','CapsLock','Tab','OS','Escape','Space'];if(kijs.Array.contains(specialKeys,e.nodeEvent.code)||kijs.Array.contains(specialKeys,e.nodeEvent.key)){return;}
if(this._keyUpDefer){window.clearTimeout(this._keyUpDefer);this._keyUpDefer=null;}
this._keyUpDefer=kijs.defer(function(){if(this._remoteSort){this.load(null,false,this._inputDom.nodeAttributeGet('value'));}else{this._setProposal(e.nodeEvent.key);}},this._remoteSort?1000:500,this);}
_onInputChange(e){if(this._spinBoxEl.isRendered){return;}
let inputVal=this._inputDom.nodeAttributeGet('value'),match=false,matchVal='',changed=false;inputVal=kijs.toString(inputVal).trim();if(inputVal===''){match=true;}else{kijs.Array.each(this._listViewEl.data,function(row){if(kijs.isString(row[this.captionField])&&row[this.captionField].toLowerCase()===inputVal.toLowerCase()){match=true;matchVal=row[this.valueField];return false;}},this);}
if(match&&matchVal!==this.value){this.value=matchVal;changed=true;}else if(!match&&!this._forceSelection){if(inputVal!==this.value){this.value=inputVal;changed=true;}}else{this.value=this._value;}
this.validate();if(changed){this.raiseEvent('change');}}
_onListViewAfterLoad(e){if(!this._remoteSort){this.value=this._value;}
if(this._selectFirst){this.value=this._listViewEl.data[0].value;}
if(e.response&&e.response.spinboxMessage){this._addPlaceholder(e.response.spinboxMessage);}}
_onListViewClick(e){this._spinBoxEl.close();if(this.value!==this._listViewEl.value){this.value=this._listViewEl.value;this.validate();this.raiseEvent('change');}}
_onSpinBoxClick(){this._inputDom.focus();}
_onSpinBoxShow(){this._setScrollPositionToSelection();}
_onSpinButtonClick(e){super._onSpinButtonClick(e);this._listViewEl.applyFilters();if(this._listViewEl.data.length===0){this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten','',this._minChars)+'.');}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._inputDom){this._inputDom.destruct();}
this._inputDom=null;this._listViewEl=null;this._oldValue=null;super.destruct(true);}};kijs.gui.field.DateTime=class kijs_gui_field_DateTime extends kijs.gui.field.Field{constructor(config={}){super(false);this._hasTime=true;this._hasDate=true;this._hasSeconds=false;this._timeRequired=false;this._changeBufferTimeout=null;this._destroyInterval=null;let useDefaultSpinIcon=!kijs.isDefined(config.spinIconChar);this._inputDom=new kijs.gui.Dom({disableEscBubbeling:true,nodeTagName:'input',nodeAttribute:{id:this._inputId},on:{change:this._onChange,context:this}});this._dom.clsAdd('kijs-field-datetime');this._timePicker=new kijs.gui.TimePicker({on:{change:this._onTimePickerChange,afterRender:this._onTimePickerAfterRender,context:this}});this._spBxSeparator=new kijs.gui.Element({cls:'kijs-separator'});this._datePicker=new kijs.gui.DatePicker({on:{dateSelected:this._onDatePickerSelected,dateChanged:this._onDatePickerChange,context:this}});this._spinBoxEl=new kijs.gui.SpinBox({target:this,width:383,height:260,cls:['kijs-flexrow','kijs-spinbox-datetime'],targetDomProperty:'inputWrapperDom',ownerNodes:[this._inputWrapperDom,this._spinIconEl.dom],openOnInput:false,parent:this,elements:[this._datePicker,this._spBxSeparator,this._timePicker],on:{show:this._onSpinBoxShow,context:this}});Object.assign(this._defaultConfig,{spinIconVisible:true,spinIconChar:'&#xf073',displayFormat:'d.m.Y H:i:s',valueFormat:'Y-m-d H:i:s'});Object.assign(this._configMap,{hasTime:true,hasDate:true,hasSeconds:true,timeRequired:true,displayFormat:true,valueFormat:true});this._eventForwardsAdd('blur',this._inputDom);this._eventForwardsAdd('change',this._inputDom);this._eventForwardsAdd('input',this._inputDom);this._eventForwardsRemove('enterPress',this._dom);this._eventForwardsRemove('enterEscPress',this._dom);this._eventForwardsRemove('escPress',this._dom);this._eventForwardsAdd('enterPress',this._inputDom);this._eventForwardsAdd('enterEscPress',this._inputDom);this._eventForwardsAdd('escPress',this._inputDom);this.on('input',this._onInput,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}
if(!this._hasDate&&!this._hasTime){throw new kijs.Error('hasDate and hasTime is false, nothing to display');}
if(useDefaultSpinIcon&&!this._hasDate){this.spinIconChar='&#xf017';}
if(this._hasDate){this._spinBoxEl.add(this._datePicker);this._spinBoxEl.width=187;}else{this._spinBoxEl.remove(this._datePicker);}
if(this._hasTime){this._spinBoxEl.add(this._timePicker);this._spinBoxEl.width=157;}else{this._spinBoxEl.remove(this._timePicker);}
if(this._hasDate&&this._hasTime){this._spinBoxEl.add(this._spBxSeparator);this._spinBoxEl.width=187+157+3;}else{this._spinBoxEl.remove(this._spBxSeparator);}
this._timePicker.hasSeconds=!!this._hasSeconds;}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;if(val){this._inputDom.nodeAttributeSet('disabled',true);}else{this._inputDom.nodeAttributeSet('disabled',false);}}
get hasDate(){return this._hasDate;}
set hasDate(val){this._hasDate=!!val;}
get hasSeconds(){return this._hasSeconds;}
set hasSeconds(val){this._hasSeconds=!!val;}
get hasTime(){return this._hasTime;}
set hasTime(val){this._hasTime=!!val;}
get isEmpty(){return kijs.isEmpty(this._inputDom.value);}
get inputDom(){return this._inputDom;}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val){this._inputDom.nodeAttributeSet('readonly',true);}else{this._inputDom.nodeAttributeSet('readonly',false);}}
get timeRequired(){return this._timeRequired;}
set timeRequired(val){this._timeRequired=!!val;}
get value(){let val=this._inputDom.nodeAttributeGet('value');val=this._getDateTimeByString(val);if(val instanceof Date){return this._format(this._valueFormat,val);}
return'';}
set value(val){let display='';if(kijs.isString(val)&&val!==''){val=this._getDateTimeByString(val);}
if(kijs.isInteger(val)){val=new Date(val*1000);val.timeMatch=true;}
if(val instanceof Date){display=this._format(this._displayFormat,val);}
this._inputDom.nodeAttributeSet('value',display);this.validate();}
render(superCall){super.render(true);this._inputDom.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._inputDom.unrender();super.unrender(true);}
_bufferChangeEvent(value){clearTimeout(this._changeBufferTimeout);this._changeBufferTimeout=setTimeout(this.raiseEvent,50,'change',{value:value});}
_format(format,datetime){format=this._getFormat(format,datetime);if(format!==''&&datetime instanceof Date){return kijs.Date.format(datetime,format);}
return'';}
_getFormat(format,datetime=null){let hasNoTime=false;if(datetime instanceof Date&&!this._timeRequired){if(datetime.timeMatch===false){hasNoTime=true;}}
if(!this._hasDate){format=format.replace(/[^a-zA-Z]?[dDjlFmMnWYyL][^a-zA-Z]?/gu,'').trim();}
if(!this._hasTime||hasNoTime){format=format.replace(/[^a-zA-Z]?[His][^a-zA-Z]?/gu,'').trim();}
if(!this._hasSeconds){format=format.replace(/[^a-zA-Z]?s[^a-zA-Z]?/gu,'').trim();}
return format;}
_getDateTimeByString(dateTimeStr){let year=null,month=null,day=null,hour=0,minute=0,second=0,timeMatch=false,dateTimeAr,timeStr,dateStr;dateTimeStr=kijs.toString(dateTimeStr);if(dateTimeStr.includes(" ")&&this._hasDate){dateTimeAr=dateTimeStr.split(" ");dateStr=dateTimeAr[0];if(dateTimeAr.length>1){kijs.Array.each(dateTimeAr,function(item,i){if(i>0){timeStr=timeStr+dateTimeAr[i];}});}else{timeStr=dateTimeAr[1];}}else{timeStr=dateTimeStr;dateStr=dateTimeStr;}
if(this._hasTime){dateTimeStr=dateTimeStr.replace(/([0-9]{1,2}):([0-9]{1,2})(?::([0-9]{1,2}))?/,function(match,h,i,s){timeMatch=true;h=parseInt(h);i=parseInt(i);s=s?parseInt(s):0;if(h===24){h=0;}
if(h>=0&&h<=23){hour=h;}
if(i>=0&&i<60){minute=i;}
if(s>=0&&s<60){second=s;}
return'';}).trim();if(!timeMatch&&timeStr.includes(" ")){let tm=timeStr.split(" ");if(tm){let tH=tm[0];let tI=tm[1];if(tH>=0&&tH<=24&&tI>=0&&tI<=59){hour=tH;minute=tI;timeMatch=true;}else{return false;}}else{return false;}}
if(!timeMatch&&!this._hasDate){let tm=timeStr.match(/[0-9]+/);if(tm){let tH=parseInt(tm[0]);if(tH>=0&&tH<=24){hour=tH===24?0:tH;timeMatch=true;}}}
if(!timeMatch&&kijs.isString(timeStr)){let tm=timeStr.match(/([0-9]{1,2})([0-9]{2})/);if(tm){let tH=parseInt(tm[1]);let tI=parseInt(tm[2]);if(tH>=0&&tH<=24&&tI>=0&&tI<=59){hour=tH;minute=tI;timeMatch=true;}else{return false;}}else{return false;}}}
dateStr.replace(/([0-9]{2}|[0-9]{4})-([0-9]{1,2})-([0-9]{1,2})/,function(match,Y,m,d){year=parseInt(Y);month=parseInt(m);day=parseInt(d);return match;});if(!year){let dp=dateStr.match(/([\d]+)[^\d]*([\d]*)[^\d]*([\d]*)/);day=dp&&dp[1]?parseInt(dp[1]):null;month=dp&&dp[2]?parseInt(dp[2]):null;year=dp&&dp[3]?parseInt(dp[3]):null;}
if(year!==null&&year>0&&year<30){year=2000+year;}else if(year!==null&&year>=30&&year<100){year=1900+year;}else if(year===null||year<0||year>3000){year=(new Date()).getFullYear();}
if(month===null||month===0||month>12||month<0){month=(new Date()).getMonth()+1;}
if(day===null||day<0||day===0||day>31){if(this._hasDate){return false;}else{day=(new Date()).getDate();}}
let datetime=new Date(year,month-1,day,hour,minute,second);datetime.timeMatch=timeMatch;return datetime;}
_validationRules(value){let rawValue=this._inputDom.nodeAttributeGet('value');super._validationRules(rawValue);if(rawValue!==''&&this._getDateTimeByString(rawValue)===false){this._errors.push('Ungültiges Format.');}}
_onInput(e){this.validate();}
_onChange(e){let dateTime=this._getDateTimeByString(e.nodeEvent.target.value);if(dateTime){this.value=dateTime;}
this._bufferChangeEvent(this.value);}
_onTimePickerAfterRender(){let v=this._getDateTimeByString(this.value);this._timePicker.value=v?this._format('H:i:s',v):'00:00:00';}
_onTimePickerChange(e){let v=this._getDateTimeByString(this.value)||new Date();this.value=this._format('Y-m-d',v)+' '+e.value;this._spinBoxEl.close();this.validate();this._bufferChangeEvent(this.value);}
_onDatePickerChange(e){if(e instanceof Date){let v=this._getDateTimeByString(this.value);if(!v){v=kijs.Date.getDatePart(new Date());v.timeMatch=false;}
this.value=this._format('Y-m-d',e)+' '+this._format('H:i:s',v);}
this.validate();this._bufferChangeEvent(this.value);}
_onDatePickerSelected(e){this._spinBoxEl.close();}
_onSpinBoxShow(){let v=this._getDateTimeByString(this.value);if(v&&this._hasDate){this._datePicker.value=v;}
if(v&&this._hasTime){this._timePicker.value=this._format('H:i:s',v);}}
destruct(superCall){if(this._changeBufferTimeout){if(this._destroyInterval){return;}else{this._destroyInterval=setInterval(this.destruct,10,superCall);}}
if(this._destroyInterval){clearInterval(this._destroyInterval);}
if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._inputDom){this._inputDom.destruct();}
this._inputDom=null;super.destruct(true);}};kijs.gui.field.Display=class kijs_gui_field_Display extends kijs.gui.field.Field{constructor(config={}){super(false);this._inputDom=new kijs.gui.Dom({nodeAttribute:{id:this._inputId,cls:'kijs-displayvalue'},on:{click:this._onDomClick,context:this}});this._trimValue=true;this._dom.clsAdd('kijs-field-display');Object.assign(this._defaultConfig,{htmlDisplayType:'html',submitValue:false,link:false,linkType:'auto'});Object.assign(this._configMap,{trimValue:true,link:true,linkType:true,htmlDisplayType:{target:'htmlDisplayType',context:this._inputDom}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;if(val){this._inputDom.nodeAttributeSet('disabled',true);}else{this._inputDom.nodeAttributeSet('disabled',false);}}
get htmlDisplayType(){return this._inputDom.htmlDisplayType;}
set htmlDisplayType(val){this._inputDom.htmlDisplayType=val;}
get isEmpty(){return kijs.isEmpty(this._inputDom.html);}
get inputDom(){return this._inputDom;}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val){this._inputDom.nodeAttributeSet('readonly',true);}else{this._inputDom.nodeAttributeSet('readonly',false);}}
get trimValue(){return this._trimValue;}
set trimValue(val){this._trimValue=val;}
get value(){let val=this._inputDom.html;return val===null?'':val;}
set value(val){this._inputDom.html=val;this._setLinkClass();}
render(superCall){super.render(true);this._inputDom.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}
this._setLinkClass();}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._inputDom.unrender();super.unrender(true);}
validate(){return true;}
_setLinkClass(){let autoLinkType=this._getLinkType(this.value);if(this._link&&((this._linkType==='auto'&&autoLinkType!==false)||this._linkType===autoLinkType)){this._inputDom.clsAdd('kijs-link');}else{this._inputDom.clsRemove('kijs-link');}}
_getLinkType(value){value=kijs.toString(value);if(value.match(/^\s*\+?[0-9\s]+$/i)){return'tel';}
if(value.match(/^[^@]+@[\w\-\.àáâãäåæçèéêëìíîïðñòóôõöøœùúûüýÿ]+\.[a-z]{2,}$/i)){return'mail';}
if(value.match(/^[\w\-\.àáâãäåæçèéêëìíîïðñòóôõöøœùúûüýÿ]+\.[a-z]{2,}$/i)){return'web';}
return false;}
_openLink(link,type){if(type==='tel'){window.open('tel:'+link.replace(/[^\+0-9]/i,''),'_self');}else if(type==='mail'){window.open('mailto:'+link,'_self');}else if(type==='web'&&link.match(/^(http|ftp)s?:\/\//i)){window.open(link,'_blank');}else if(type==='web'){window.open('http://'+link,'_blank');}}
_onDomClick(){if(this._link&&!this.disabled&&!this.readOnly){let linkType=this._linkType==='auto'?this._getLinkType(this.value):this._linkType;this._openLink(kijs.toString(this.value),linkType);}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._inputDom){this._inputDom.destruct();}
this._inputDom=null;super.destruct(true);}};kijs.gui.field.Editor=class kijs_gui_field_Editor extends kijs.gui.field.Field{constructor(config={}){super(false);this._aceEditor=null;this._aceEditorNode=null;this._mode=null;this._theme=null;this._value=null;this._dom.clsAdd('kijs-field-editor');Object.assign(this._configMap,{mode:true,theme:true});this.on('input',this._onInput,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;if(val||this._dom.clsHas('kijs-readonly')){this._aceEditor.setReadOnly(true);}else{this._aceEditor.setReadOnly(false);}}
get isEmpty(){return kijs.isEmpty(this.value);}
get mode(){return this._mode;}
set mode(val){this._mode=val;}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val||this._dom.clsHas('kijs-disabled')){this._aceEditor.setReadOnly(true);}else{this._aceEditor.setReadOnly(false);}}
get theme(){return this._theme;}
set theme(val){this._theme=val;}
get trimValue(){return this._trimValue;}
set trimValue(val){this._trimValue=val;}
get value(){if(this._aceEditor){return this._aceEditor.getValue();}else{return this._value;}}
set value(val){this._value=val;if(this._aceEditor){this._aceEditor.setValue(val,1);}}
render(superCall){super.render(true);if(!this._aceEditor){this._aceEditorNode=document.createElement('div');this._inputWrapperDom.node.appendChild(this._aceEditorNode);this._aceEditor=ace.edit(this._aceEditorNode);let inputNode=this._aceEditorNode.firstChild;inputNode.id=this._inputId;kijs.defer(function(){var _this=this;this._aceEditor.getSession().on('change',function(){_this.raiseEvent(['input','change']);});},200,this);}
this._aceEditor.setHighlightActiveLine(false);if(this._theme){this._aceEditor.setTheme('ace/theme/'+this._theme);}
if(this._mode){this._aceEditor.session.setMode('ace/mode/'+this._mode);}
this.value=this._value;if(!superCall){this.raiseEvent('afterRender');}}
_onInput(e){this.validate();}
_validationRules(value){super._validationRules(value);if(this._aceEditor){const annot=this._aceEditor.getSession().getAnnotations();for(let key in annot){if(annot.hasOwnProperty(key)){this._errors.push("'"+annot[key].text+"'"+' in Zeile '+(annot[key].row+1));}}}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
this._aceEditor=null;this._aceEditorNode=null;super.destruct(true);}};kijs.gui.field.ListView=class kijs_gui_field_ListView extends kijs.gui.field.Field{constructor(config={}){super(false);this._minSelectCount=null;this._maxSelectCount=null;this._oldValue=[];this._listView=new kijs.gui.ListView({});this._dom.clsAdd('kijs-field-listview');Object.assign(this._configMap,{autoLoad:{target:'autoLoad',context:this._listView},ddSort:{target:'ddSort',context:this._listView},showCheckBoxes:{target:'showCheckBoxes',context:this._listView},selectType:{target:'selectType',context:this._listView},facadeFnLoad:{target:'facadeFnLoad',context:this._listView},rpc:{target:'rpc',context:this._listView},captionField:{target:'captionField',context:this._listView},iconCharField:{target:'iconCharField',context:this._listView},iconClsField:{target:'iconClsField',context:this._listView},iconColorField:{target:'iconColorField',context:this._listView},toolTipField:{target:'toolTipField',context:this._listView},valueField:{target:'valueField',context:this._listView},minSelectCount:true,maxSelectCount:true,data:{prio:1000,target:'data',context:this._listView},value:{prio:1001,target:'value'}});this._listView.on('selectionChange',this._onListViewSelectionChange,this);this._eventForwardsAdd('ddOver',this._listView);this._eventForwardsAdd('ddDrop',this._listView.dom);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get autoLoad(){return this._listView.autoLoad;}
set autoLoad(val){this._listView.autoLoad=val;}
get data(){return this._listView.data;}
set data(val){this._listView.data=val;}
get captionField(){return this._listView.captionField;}
set captionField(val){this._listView.captionField=val;}
get valueField(){return this._listView.valueField;}
set valueField(val){this._listView.valueField=val;}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;this._listView.disabled=val||this._dom.clsHas('kijs-readonly');}
get elements(){return this._listView.elements;}
get facadeFnLoad(){return this._listView.facadeFnLoad;}
set facadeFnLoad(val){this._listView.facadeFnLoad=val;}
get isEmpty(){return kijs.isEmpty(this.value);}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;this._listView.disabled=val||this._dom.clsHas('kijs-disabled');}
get rpc(){return this._listView.rpc;}
set rpc(val){this._listView.rpc=val;}
get value(){return this._listView.value;}
set value(val){this._listView.value=val;this._oldValue=this._listView.value;}
addData(data){this._listView.addData(data);}
load(args){this._listView.load(args);}
render(superCall){super.render(true);this._listView.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._listView.unrender();super.unrender(true);}
_validationRules(value){super._validationRules(value);if(!kijs.isEmpty(this._minSelectCount)){const minSelectCount=this._minSelectCount;if(kijs.isArray(value)){if(value.length<minSelectCount){this._errors.push(`Min. ${minSelectCount} müssen ausgewählt werden`);}}else if(kijs.isEmpty(value)&&minSelectCount>0){this._errors.push(`Min. ${minSelectCount} müssen ausgewählt werden`);}}
if(!kijs.isEmpty(this._maxSelectCount)){const maxSelectCount=this._maxSelectCount;if(kijs.isArray(value)){if(value.length>maxSelectCount){this._errors.push(`Max. ${maxSelectCount} dürfen ausgewählt werden`);}}else if(!kijs.isEmpty(value)&&maxSelectCount<1){this._errors.push(`Max. ${maxSelectCount} dürfen ausgewählt werden`);}}}
_onAfterFirstRenderTo(e){this.load();}
_onListViewSelectionChange(e){const val=this.value;this.raiseEvent(['input','change'],{oldValue:this._oldValue,value:val});this._oldValue=val;this.validate();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._listView){this._listView.destruct();}
this._listView=null;this._oldValue=null;super.destruct(true);}};kijs.gui.field.Memo=class kijs_gui_field_Memo extends kijs.gui.field.Field{constructor(config={}){super(false);this._inputDom=new kijs.gui.Dom({disableEnterBubbeling:true,disableEscBubbeling:true,nodeTagName:'textarea',nodeAttribute:{id:this._inputId}});this._trimValue=true;this._dom.clsAdd('kijs-field-memo');Object.assign(this._configMap,{trimValue:true,placeholder:{target:'placeholder'}});this._eventForwardsAdd('blur',this._inputDom);this._eventForwardsAdd('change',this._inputDom);this._eventForwardsAdd('focus',this._inputDom);this._eventForwardsAdd('input',this._inputDom);this._eventForwardsRemove('enterPress',this._dom);this._eventForwardsRemove('enterEscPress',this._dom);this._eventForwardsRemove('escPress',this._dom);this._eventForwardsAdd('enterPress',this._inputDom);this._eventForwardsAdd('enterEscPress',this._inputDom);this._eventForwardsAdd('escPress',this._inputDom);this.on('input',this._onInput,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=val;if(val){this._inputDom.nodeAttributeSet('readOnly',true);}else{this._inputDom.nodeAttributeSet('readOnly',false);}}
get isEmpty(){return kijs.isEmpty(this._inputDom.value);}
get inputDom(){return this._inputDom;}
get placeholder(){this._inputDom.nodeAttributeGet('placeholder');}
set placeholder(val){this._inputDom.nodeAttributeSet('placeholder',val);}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val||this._dom.clsHas('kijs-disabled')){this._inputDom.nodeAttributeSet('readOnly',true);}else{this._inputDom.nodeAttributeSet('readOnly',false);}}
get trimValue(){return this._trimValue;}
set trimValue(val){this._trimValue=val;}
get value(){let val=this._inputDom.nodeAttributeGet('value');if(this._trimValue&&kijs.isString(val)){val=val.trim();}
return val===null?'':val;}
set value(val){this._inputDom.nodeAttributeSet('value',val);this.validate();}
render(superCall){super.render(true);this._inputDom.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._inputDom.unrender();super.unrender(true);}
_onInput(e){this.validate();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._inputDom){this._inputDom.destruct();}
this._inputDom=null;super.destruct(true);}};kijs.gui.field.Password=class kijs_gui_field_Password extends kijs.gui.field.Field{constructor(config={}){super(false);this._inputDom=new kijs.gui.Dom({disableEscBubbeling:true,nodeTagName:'input',nodeAttribute:{id:this._inputId,type:'password'}});this._disableBrowserSecurityWarning=false;this._passwordChar='•';this._trimValue=false;this._value=null;this._dom.clsAdd('kijs-field-password');Object.assign(this._defaultConfig,{disableBrowserSecurityWarning:'auto'});Object.assign(this._configMap,{disableBrowserSecurityWarning:{prio:-1,target:'disableBrowserSecurityWarning'},passwordChar:true,trimValue:true,placeholder:{target:'placeholder'}});this._eventForwardsAdd('blur',this._inputDom);this._eventForwardsAdd('change',this._inputDom);this._eventForwardsRemove('enterPress',this._dom);this._eventForwardsRemove('enterEscPress',this._dom);this._eventForwardsRemove('escPress',this._dom);this._eventForwardsAdd('enterPress',this._inputDom);this._eventForwardsAdd('enterEscPress',this._inputDom);this._eventForwardsAdd('escPress',this._inputDom);this._inputDom.on('input',this._onDomInput,this);this.on('input',this._onInput,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disableBrowserSecurityWarning(){return this._disableBrowserSecurityWarning;}
set disableBrowserSecurityWarning(val){if(val==='auto'){val=kijs.Navigator.isFirefox&&window.isSecureContext===false;}
if(val){this._inputDom.nodeAttributeSet('type','text');this._inputDom.on('keyUp',this._onKeyUp,this);this._inputDom.on('mouseUp',this._onMouseUp,this);this._inputDom.on('input',this._onInput,this);}else{this._inputDom.nodeAttributeSet('type','password');this._inputDom.off('keyUp',this._onKeyUp,this);this._inputDom.off('mouseUp',this._onMouseUp,this);this._inputDom.off('input',this._onInput,this);}
this._disableBrowserSecurityWarning=!!val;}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;if(val){this._inputDom.nodeAttributeSet('disabled',true);}else{this._inputDom.nodeAttributeSet('disabled',false);}}
get isEmpty(){return kijs.isEmpty(this._inputDom.value);}
get inputDom(){return this._inputDom;}
get passwordChar(){return this._passwordChar;}
set passwordChar(val){this._passwordChar=val;}
get placeholder(){this._inputDom.nodeAttributeGet('placeholder');}
set placeholder(val){this._inputDom.nodeAttributeSet('placeholder',val);}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val){this._inputDom.nodeAttributeSet('readonly',true);}else{this._inputDom.nodeAttributeSet('readonly',false);}}
get trimValue(){return this._trimValue;}
set trimValue(val){this._trimValue=val;}
get value(){let val;if(this._disableBrowserSecurityWarning){val=this._value;}else{val=this._inputDom.nodeAttributeGet('value');}
if(this._trimValue&&kijs.isString(val)){val=val.trim();}
return val===null?'':val;}
set value(val){if(this._disableBrowserSecurityWarning){let oldValue=this.value;this._value=val;this._inputDom.nodeAttributeSet('value',kijs.isEmpty(val)?'':val.replace(/./g,this._passwordChar));if(this._value!==oldValue){this.raiseEvent('change',{eventName:'change',value:val,oldValue:oldValue},this);}}else{this._inputDom.nodeAttributeSet('value',val);}
this.validate();}
render(superCall){super.render(true);this._inputDom.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._inputDom.unrender();super.unrender(true);}
_reposCursor(){const val=this._inputDom.node.value;const len=val.length;if(this._inputDom.node.selectionStart===0&&this._inputDom.node.selectionEnd===len){}else if(this._inputDom.node.selectionStart===len&&this._inputDom.node.selectionEnd===len){}else{this._inputDom.node.selectionStart=0;this._inputDom.node.selectionEnd=len;}}
_onInput(e){this.validate();}
_onDomInput(e){if(this._disableBrowserSecurityWarning){const val=this._inputDom.node.value;const len=val.length;this._value=kijs.isEmpty(this._value)?'':this._value;var newChars=kijs.String.replaceAll(val,this._passwordChar,'');if(val===''){this.value='';}else if(val.substr(0,1)!==this._passwordChar){this.value=newChars;}else if(val.substr(len-1,1)!==this._passwordChar){const oldChars=this._value.substr(0,len-newChars.length);this.value=oldChars+newChars;}else if(len<this._value.length){this.value=this._value.substr(0,len);}}
e.eventName='input';return this.raiseEvent('input',e,this);}
_onKeyUp(e){this._reposCursor();}
_onMouseUp(e){kijs.defer(this._reposCursor,10,this);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._inputDom){this._inputDom.destruct();}
this._inputDom=null;super.destruct(true);}};kijs.gui.field.Text=class kijs_gui_field_Text extends kijs.gui.field.Field{constructor(config={}){super(false);this._inputDom=new kijs.gui.Dom({disableEscBubbeling:true,nodeTagName:'input',nodeAttribute:{id:this._inputId}});this._trimValue=true;this._dom.clsAdd('kijs-field-text');Object.assign(this._configMap,{trimValue:true,placeholder:{target:'placeholder'}});this._eventForwardsAdd('blur',this._inputDom);this._eventForwardsAdd('change',this._inputDom);this._eventForwardsAdd('focus',this._inputDom);this._eventForwardsAdd('input',this._inputDom);this._eventForwardsRemove('enterPress',this._dom);this._eventForwardsRemove('enterEscPress',this._dom);this._eventForwardsRemove('escPress',this._dom);this._eventForwardsAdd('enterPress',this._inputDom);this._eventForwardsAdd('enterEscPress',this._inputDom);this._eventForwardsAdd('escPress',this._inputDom);this.on('input',this._onInput,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get disabled(){return super.disabled;}
set disabled(val){super.disabled=!!val;if(val||this._dom.clsHas('kijs-disabled')){this._inputDom.nodeAttributeSet('disabled',true);}else{this._inputDom.nodeAttributeSet('disabled',false);}}
get isEmpty(){return kijs.isEmpty(this._inputDom.value);}
get inputDom(){return this._inputDom;}
get placeholder(){this._inputDom.nodeAttributeGet('placeholder');}
set placeholder(val){this._inputDom.nodeAttributeSet('placeholder',val);}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val){this._inputDom.nodeAttributeSet('readOnly',true);}else{this._inputDom.nodeAttributeSet('readOnly',false);}}
get trimValue(){return this._trimValue;}
set trimValue(val){this._trimValue=val;}
get value(){let val=this._inputDom.nodeAttributeGet('value');if(this._trimValue&&kijs.isString(val)){val=val.trim();}
return val===null?'':val;}
set value(val){this._inputDom.nodeAttributeSet('value',val);this.validate();}
render(superCall){super.render(true);this._inputDom.renderTo(this._inputWrapperDom.node);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
this._inputDom.unrender();super.unrender(true);}
_onInput(e){this.validate();}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
if(this._inputDom){this._inputDom.destruct();}
this._inputDom=null;super.destruct(true);}};kijs.gui.grid.filter.Number=class kijs_gui_grid_filter_Number extends kijs.gui.grid.filter.Text{constructor(config={}){super(false);this._compare='equal';Object.assign(this._defaultConfig,{placeholder:kijs.getText('Filtern')+'...'});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get filter(){return Object.assign(super.filter,{type:'number',search:this._searchField.value,compare:this._compare});}
_getMenuButtons(){return kijs.Array.concat(this._getDefaultMenuButtons(),['-',{name:'btn_compare_equal',caption:kijs.getText('Gleich'),iconChar:'&#xf046',on:{click:this._onCompareBtnClick,context:this}},{name:'btn_compare_unequal',caption:kijs.getText('Ungleich'),iconChar:'&#xf096',on:{click:this._onCompareBtnClick,context:this},},{caption:kijs.getText('Kleiner als'),name:'btn_compare_smaller',iconChar:'&#xf096',on:{click:this._onCompareBtnClick,context:this}},{caption:kijs.getText('Grösser als'),name:'btn_compare_bigger',iconChar:'&#xf096',on:{click:this._onCompareBtnClick,context:this}}]);}
_onCompareBtnClick(e){this._menuButton.menuCloseAll();if(e.element.name==='btn_compare_equal'){this._compare='equal';}else if(e.element.name==='btn_compare_unequal'){this._compare='unequal';}else if(e.element.name==='btn_compare_smaller'){this._compare='smaller';}else if(e.element.name==='btn_compare_bigger'){this._compare='bigger';}
kijs.Array.each(e.element.parent.elements,function(element){if(element.name===e.element.name){element.iconChar='&#xf046';}else if(kijs.Array.contains(['btn_compare_equal','btn_compare_unequal','btn_compare_smaller','btn_compare_bigger'],element.name)){element.iconChar='&#xf096';}});}};kijs.gui.FileUpload=class kijs_gui_FileUpload extends kijs.gui.Window{constructor(config={}){super(false);this._fileUpload=null;this._uploads=[];this._autoClose=true;this._uploadRunning=true;this._dom.clsAdd('kijs-uploadwindow');Object.assign(this._defaultConfig,{caption:kijs.getText('Upload'),iconChar:'&#xf093',fileUpload:null,closable:false,maximizable:false,resizable:false,modal:true,width:250,autoClose:true,innerStyle:{padding:'10px'},footerStyle:{padding:'10px'},footerElements:[{xtype:'kijs.gui.Button',caption:'OK',isDefault:true,on:{click:function(){if(this._uploadRunning!==true&&this._dom.node){this.unrender();}},context:this}}]});Object.assign(this._configMap,{fileUpload:{target:'fileUpload'},autoClose:true});this.on('mouseDown',this._onMouseDown,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get fileUpload(){return this._fileUpload;}
set fileUpload(val){if(this._fileUpload instanceof kijs.FileUpload){this._fileUpload.off(null,null,this);}
this._fileUpload=val;if(kijs.isDefined(val)){if(!(val instanceof kijs.FileUpload)){throw new kijs.Error('fileUpload must be of type kijs.FileUpload');}
this._fileUpload.on('startUpload',this._onStartUpload,this);this._fileUpload.on('failUpload',this._onFailUpload,this);this._fileUpload.on('upload',this._onUpload,this);this._fileUpload.on('endUpload',this._onEndUpload,this);}}
showFileOpenDialog(multiple=null,directory=null){if(!(this._fileUpload instanceof kijs.FileUpload)){this._fileUpload=new kijs.FileUpload();}
this._fileUpload.showFileOpenDialog(multiple,directory);}
_getUploadProgressBar(uploadId){for(let i=0;i<this._uploads.length;i++){if(this._uploads[i].uploadId===uploadId){return this._uploads[i].progressBar;}}
return null;}
_onStartUpload(ud,filename,filedir,filetype,uploadId){let progressBar=new kijs.gui.ProgressBar({caption:kijs.String.htmlspecialchars(filename),fileUpload:this._fileUpload,fileUploadId:uploadId,style:{marginBottom:'10px'}});this._uploads.push({progressBar:progressBar,uploadId:uploadId});this.add(progressBar);if(!this._dom.node){this.show();}
this.center();this._uploadRunning=true;}
_onFailUpload(ud,filename,filetype){this._autoClose=false;}
_onUpload(ud,response,errorMsg,uploadId){let pg=this._getUploadProgressBar(uploadId);if(errorMsg&&pg){this._autoClose=false;pg.bottomCaption='<span class="error">'+kijs.String.htmlspecialchars(errorMsg)+'</span>';}}
_onEndUpload(){this._uploadRunning=false;if(this._autoClose){kijs.defer(function(){if(this._dom.node){this.unrender();}},1000,this);}}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
super.destruct(true);}};kijs.gui.field.CheckboxGroup=class kijs_gui_field_CheckboxGroup extends kijs.gui.field.ListView{constructor(config={}){super(false);this._dom.clsRemove('kijs-field-listview');this._dom.clsAdd('kijs-field-checkboxgroup');Object.assign(this._defaultConfig,{showCheckBoxes:true,selectType:'simple'});Object.assign(this._configMap,{checkedAll:{target:'checkedAll',prio:1001}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get checkedAll(){return this.value.length===this.data.length?true:false;}
set checkedAll(val){let ids=[];if(val){kijs.Array.each(this.data,function(row){ids.push(row.id);},this);this.value=ids;}else{this.value=[];}}
get checkedValues(){return this.value.length?this.value:[];}
set checkedValues(val){let value=this.value;if(!kijs.isArray(val)){val=[val];}
kijs.Array.each(val,function(v){if(kijs.Array.contains(value,v)){kijs.Array.remove(value,v);}else{value.push(v);}},this);this.value=value;}};kijs.gui.field.Number=class kijs_gui_field_Number extends kijs.gui.field.Text{constructor(config={}){super(false);this._dom.clsAdd('kijs-field-number');this._allowDecimals=false;this._alwaysDisplayDecimals=false;this._decimalPrecision=2;this._decimalSeparator='.';this._minValue=null;this._maxValue=null;this._thousandsSeparator='';Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{allowDecimals:true,alwaysDisplayDecimals:true,decimalPrecision:{target:'decimalPrecision'},decimalSeparator:true,minValue:{target:'minValue'},maxValue:{target:'maxValue'},thousandsSeparator:true});this.on('blur',this._onBlur,this);if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get allowDecimals(){return this._allowDecimals;}
set allowDecimals(val){this._allowDecimals=!!val;}
get alwaysDisplayDecimals(){return this._alwaysDisplayDecimals;}
set alwaysDisplayDecimals(val){this._alwaysDisplayDecimals=!!val;}
get decimalPrecision(){return this._decimalPrecision;}
set decimalPrecision(val){this._decimalPrecision=kijs.isNumeric(val)?parseInt(val):2;}
get maxValue(){return this._maxValue;}
set maxValue(val){this._maxValue=val===null?null:parseFloat(val);}
get minValue(){return this._minValue;}
set minValue(val){this._minValue=val===null?null:parseFloat(val);}
get value(){let val=super.value,nr=null;if(val!==null){nr=kijs.Number.parse(val,this._decimalPrecision,this._decimalSeparator,this._thousandsSeparator);}
return nr!==null?nr:val;}
set value(val){if(!kijs.isNumber(val)&&kijs.isString(val)){val=kijs.Number.parse(val,this._decimalPrecision,this._decimalSeparator,this._thousandsSeparator);}
if(kijs.isNumber(val)){super.value=kijs.Number.format(val,(this._alwaysDisplayDecimals?this._decimalPrecision:null),this._decimalSeparator,this._thousandsSeparator);}else if(val===null){super.value='';}else{super.value=val;}}
_validationRules(originalValue){super._validationRules(originalValue);let value=kijs.toString(originalValue);if(value.trim()!==''){if(this._thousandsSeparator!==''){value=kijs.String.replaceAll(value,this._thousandsSeparator,'');}
if(this._decimalSeparator!=='.'&&this._decimalSeparator!==''){value=kijs.String.replaceAll(value,this._decimalSeparator,'.');}
value=value.replace(/[^\-0-9\.]/,'');if(this._allowDecimals){value=window.parseFloat(value);}else{value=window.parseInt(value);}
if(window.isNaN(value)){this._errors.push(kijs.getText('%1 ist keine gültige Nummer','',originalValue));}else{if(this._minValue!==null&&value<this._minValue){this._errors.push(kijs.getText('Der minimale Wert für dieses Feld ist %1','',this._minValue));}
if(this._maxValue!==null&&value>this._maxValue){this._errors.push(kijs.getText('Der maximale Wert für dieses Feld ist %1','',this._maxValue));}}}}
_onBlur(){let val=this.value;if(super.value!==val){this.value=val;}}
render(superCall){super.render(true);if(!superCall){this.raiseEvent('afterRender');}}
unrender(superCall){if(!superCall){this.raiseEvent('unrender');}
super.unrender(true);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
super.destruct(true);}};kijs.gui.field.OptionGroup=class kijs_gui_field_OptionGroup extends kijs.gui.field.ListView{constructor(config={}){super(false);this._dom.clsRemove('kijs-field-listview');this._dom.clsAdd('kijs-field-optiongroup');Object.assign(this._defaultConfig,{showCheckBoxes:true,selectType:'single'});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}};kijs.gui.field.Range=class kijs_gui_field_Range extends kijs.gui.field.Text{constructor(config={}){super(false);this._inputDom.nodeAttributeSet('type','range');this._dom.clsRemove('kijs-field-text');this._dom.clsAdd('kijs-field-range');Object.assign(this._configMap,{min:{target:'min'},max:{target:'max'},step:{target:'step'}});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get isEmpty(){return false;}
set min(val){this._inputDom.nodeAttributeSet('min',val);}
get min(){return this._inputDom.nodeAttributeGet('min');}
set max(val){this._inputDom.nodeAttributeSet('max',val);}
get max(){return this._inputDom.nodeAttributeGet('max');}
set step(val){this._inputDom.nodeAttributeSet('step',val);}
get step(){return this._inputDom.nodeAttributeGet('step');}
get readOnly(){return super.readOnly;}
set readOnly(val){super.readOnly=!!val;if(val){this._inputDom.nodeAttributeSet('disabled',true);}else{this._inputDom.nodeAttributeSet('disabled',false);}}};kijs.gui.grid.columnWindow=class kijs_gui_grid_columnWindow extends kijs.gui.Window{constructor(config={}){super(false);this._dom.clsAdd('kijs-columnwindow');Object.assign(this._defaultConfig,{caption:'Spalten',iconChar:'&#xf0db',closable:true,maximizable:false,autoScroll:true,resizable:false,modal:true,width:200,innerStyle:{padding:'10px'},footerStyle:{padding:'10px'},footerElements:[{xtype:'kijs.gui.Button',caption:'OK',isDefault:true,on:{click:this._onOkClick,context:this}}]});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get grid(){return this.parent.header.grid;}
show(){let data=[];let values=[];kijs.Array.each(this.grid.columnConfigs,function(columnConfig){data.push({valueField:columnConfig.valueField,caption:columnConfig.caption});if(columnConfig.visible){values.push(columnConfig.valueField);}},this);this.add({xtype:'kijs.gui.field.CheckboxGroup',name:'fields',valueField:'valueField',captionField:'caption',data:data,value:values,ddSort:true});this.down('fields').on('ddOver',this._onDdOver,this);this.down('fields').on('change',this._onCheckChange,this);super.show();}
_onOkClick(){let flds=this.down('fields').value;kijs.Array.each(this.grid.columnConfigs,function(columnConfig){columnConfig.visible=kijs.Array.contains(flds,columnConfig.valueField);},this);let elements=this.down('fields').elements;for(let i=0;i<elements.length;i++){let vF=elements[i].dataRow.valueField;let columnConfig=this.grid.getColumnConfigByValueField(vF);if(columnConfig){columnConfig.position=i;}}
this.destruct();}
_onDdOver(e){const vF=e.sourceElement?e.sourceElement.dataRow.valueField:null;let columnConfig=this.grid.getColumnConfigByValueField(vF);let allowDd=columnConfig?columnConfig.sortable:false;return allowDd;}
_onCheckChange(e){let unchecked=kijs.Array.diff(e.oldValue,e.value);kijs.Array.each(unchecked,function(valueField){let columnConfig=this.grid.getColumnConfigByValueField(valueField);if(!columnConfig.hideable){kijs.defer(function(){let flds=this.down('fields').value;flds.push(valueField);this.down('fields').value=flds;},20,this);}},this);}
destruct(superCall){if(!superCall){this.unrender(superCall);this.raiseEvent('destruct');}
super.destruct(true);}};kijs.gui.grid.filter.Date=class kijs_gui_grid_filter_Date extends kijs.gui.grid.filter.Number{constructor(config={}){super(false);Object.assign(this._defaultConfig,{});Object.assign(this._configMap,{});if(kijs.isObject(config)){config=Object.assign({},this._defaultConfig,config);this.applyConfig(config,true);}}
get filter(){return Object.assign(super.filter,{type:'date'});}};kijs.Error=class kijs_Error extends Error{constructor(message,fileName,lineNumber){super(message,fileName,lineNumber);}};if(typeof Object.assign!=='function'){Object.defineProperty(Object,"assign",{value:function assign(target,varArgs){'use strict';if(target===null){throw new TypeError('Cannot convert undefined or null to object');}
var to=Object(target);for(var index=1;index<arguments.length;index++){var nextSource=arguments[index];if(nextSource!==null){for(var nextKey in nextSource){if(Object.prototype.hasOwnProperty.call(nextSource,nextKey)){to[nextKey]=nextSource[nextKey];}}}}
return to;},writable:true,configurable:true});}