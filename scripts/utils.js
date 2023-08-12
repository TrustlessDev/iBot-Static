
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

function closePreloader() {
    $("#preloader").hide();
    $("#ibot-preloader").hide();
}

async function initSite() {
    $("#ibot-preloader h2").html("Loading...");
    $("#ibot-preloader").show();
    try {
        let url = new URL(location.href);
        let resp = await fetch("scripts/site.json", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        let data = await resp.json();
        alert(url.host);
        eruda.init();
        if(data[url.host]) {
            site = data[url.host];
        } else {
            eruda.init();
        }
        // Load Site Info
        let resp2 = await fetch("https://" + site.apiUrl + "/site", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        siteInfo = await resp2.json();
        if(siteInfo.dev) {
            eruda.init();
        }
    } catch(e) {
        $("#ibot-preloader h2").html("Network Error");
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

function initFootBar() {
    $(".footer-bar").empty();
    let footList = siteInfo.foot;
    for(let i = 0; i < footList.length; i++) {
        let tmp = footList[i];
        let footItem = "<a href=\"" + tmp.url + "\" " + (tmp.onclick ? "onclick=\"" + tmp.onclick + "\"" : "") + " " + (tmp.bsToggle ? "data-bs-toggle=\"" + tmp.bsToggle + "\"" : "") + " " + (tmp.bsTarget ? "data-bs-target=\"" + tmp.bsTarget + "\"" : "") + "><i class=\"bi " + tmp.icon + "\"></i><span class=\"i18n\" i18nTag=\"" + tmp.lang + "\"></span></a>";
        $(".footer-bar").append(footItem);
        if(i == 1) {
            let home = "<a href=\"index.html\" onclick=\"init()\" class=\"circle-nav-2\"><i class=\"bi bi-house-fill\"></i><span class=\"i18n\" i18nTag=\"index\"></span></a>";
            $(".footer-bar").append(home);
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

function i18n(key, replacements) {
    let text = lang[key] || "[ " + key + " ]";
    if (replacements) {
        for (let placeholder in replacements) {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        }
    }
    return text;
}