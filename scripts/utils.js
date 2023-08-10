
async function callAPI(method, params = {}) {
    let initData = Telegram.WebApp.initData;
    let resp = await fetch("https://" + site.apiUrl + "/api/callAPI", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            method: method,
            initData: initData,
            params: params
        }),
    });
    let data = await resp.json();
    return data;
}

async function initSite() {
    let url = new URL(location.href)
    if(url.host.indexOf("dev") > -1) {
        eruda.init();
    }
    let resp = await fetch("scripts/site.json", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let data = await resp.json();
    if(data[url.host]) {
        site = data[url.host];
    } else {
        site = data["127.0.0.1"];
    }
}

async function initLanguages() {
    if(!site.apiUrl) {
        await initSite();
    }
    let resp = await fetch("https://" + site.apiUrl + "/lang", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let data = await resp.json();
    lang = data;
}

function mappingLang() {
    // 取出所有 class = i18n 的元素
    let i18nList = document.getElementsByClassName("i18n");
    for(let i = 0; i < i18nList.length; i++) {
        // 取出 i18nTag 的 attribute
        let i18nTag = i18nList[i].getAttribute("i18nTag");
        // 將 i18nTag 的 attribute 值當作 key 去 lang 物件中取值
        let text = i18n(i18nTag);
        // 判斷元素類型
        if(i18nList[i].tagName == "INPUT") {
            i18nList[i].placeholder = text;
        } else {
            i18nList[i].innerHTML = text;
        }
    }
}

function i18n(key) {
    if(lang[key] ) {
        return lang[key];
    } else {
        return "[ " + key + " ]";
    }
}