let lang = {};
let site = {};

async function callAPI(method, params = {}) {
    let initData = Telegram.WebApp.initData;
    let resp = await fetch("/api/callAPI", {
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
    let resp = await fetch("scripts/site.json", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let data = await resp.json();
    site = data[url.host];
}

async function initLanguages() {
    let resp = await fetch("/lang", {
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