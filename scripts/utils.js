let lang = {};
let site = {};

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
    let resp = await fetch("https://" + site.apiUrl + "/lang", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let data = await resp.json();
    lang = data;
}

function i18n(key) {
    if(lang[key] ) {
        return lang[key];
    } else {
        return "[ " + key + " ]";
    }
}