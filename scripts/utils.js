
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
    // Load Site Info
    let resp2 = await fetch("https://" + site.apiUrl + "/site", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    siteInfo = await resp2.json();
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

async function initFootBar() {
    $("#footer-bar").empty();
    let footList = siteInfo.foot;
    /*
      <a href="page-games.html" onclick="initGames()"><i class="bi bi-controller"></i><span class="i18n" i18nTag="gaming">遊戲</span></a>
      <a href="page-activity.html" onclick="initNews()"><i class="bi bi-newspaper"></i><span class="i18n" i18nTag="news">新聞</span></a>
      <a href="index.html" onclick="init()" class="circle-nav-2"><i class="bi bi-house-fill"></i><span class="i18n" i18nTag="index"></span></a>
      <a href="page-payment-bill.html" onclick="initBills()"><i class="bi bi-receipt"></i><span class="i18n" i18nTag="bills">帳務資訊</span></a>
      <a href="#" data-bs-toggle="offcanvas" data-bs-target="#menu-sidebar"><i class="bi bi-three-dots"></i><span class="i18n" i18nTag="more">更多</span></a>
    */
    for(let i = 0; i < footList.length; i++) {
        let tmp = footList[i];
        let footItem = "<a href=\"" + tmp.url + "\" onclick=\"" + tmp.onclick + "\"><i class=\"bi " + tmp.icon + "\"></i><span class=\"i18n\" i18nTag=\"" + tmp.lang + "\"></span></a>";
        if(i == 2) {
            let home = "<a href=\"index.html\" onclick=\"init()\" class=\"circle-nav-2\"><i class=\"bi bi-house-fill\"></i><span class="i18n\" i18nTag=\"index\"></span></a>";
            $("#footer-bar").append(home);
        }
    }
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
        if(i18nList[i].tagName.toLowerCase() == "input" || i18nList[i].tagName.toLowerCase() == "textarea") {
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