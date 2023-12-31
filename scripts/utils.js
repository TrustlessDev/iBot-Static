
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

async function initSidebar() {
    $("#sidebarContent").empty();
    let sidebar = siteInfo.sidebar;
    if(sidebar) {
        for(let i = 0; i < sidebar.length; i++) {
            let rndId = getRandomText(8);
            let tmp = sidebar[i];
            let sidebarItem = "";
            if(tmp.type == "SUBMENU") {
                sidebarItem = "<a href=\"#\"" + (tmp.onclick ? (" onclick=\"" + tmp.onclick + "\"") : "") + " data-submenu=\"" + rndId + "\" class=\"list-group-item\"><i class=\"bi " + tmp.color + " shadow-bg shadow-bg-xs " + tmp.icon + "\"></i><div class=\"i18n\" i18nTag=\"" + tmp.name + "\"></div><i class=\"bi bi-plus font-18\"></i></a>";
            } else if(tmp.type == "LINK") {

            }
            $("#sidebarContent").append(sidebarItem);
            // 若是 SUBMENU 則繼續處理
            if(tmp.type == "SUBMENU") {
                let submenu = tmp.submenu;
                if(submenu.length > 0) {
                    let dataSubmenu = "<div class=\"list-submenu\" id=\"" + rndId + "\">";
                    for(let j = 0; j < submenu.length; j++) {
                        let submenuItem = submenu[j];
                        dataSubmenu += "<a href=\"" + submenuItem.link + "\" " + (submenuItem.onclick ? "onclick=\"" + submenuItem.onclick + "\"" : "") + " id=\"nav-waves\" class=\"list-group-item\">";
                        dataSubmenu += "<div class=\"ps-4 i18n\" i18nTag=\"" + submenuItem.name + "\"></div>";
                        dataSubmenu += "</a>";
                    }
                    dataSubmenu += "</div>";
                    $("#sidebarContent").append(dataSubmenu);
                }
            }
        }
        console.log("Sidebar Init Done");
        setTimeout(() => {
            submenus();
        }, 100);
    }

}

function getRandomText(n) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomText = '';
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomText += chars[randomIndex];
    }
    return randomText;
}

function darkMode() {
    var toggleDark = document.querySelectorAll('[data-toggle-theme]');
    document.getElementById('theme-check').setAttribute('content','#1f1f1f')
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light', 'detect-theme');
    for(let i = 0; i < toggleDark.length; i++){toggleDark[i].checked="checked"};
    localStorage.setItem('iBot-Theme', 'dark-mode');
}

async function initSite() {
    $("#ibot-preloader h2").html("Loading...");
    $("#ibot-preloader").show();
    let uid = Telegram.WebApp.initDataUnsafe.user.id;
    if(uid == 547539516 || uid == 1100272452 || uid == 5163930265) { 
        eruda.init();
        $(".cryptoMarket").show();
    }
    try {
        let url = new URL(location.href);
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
            alert("Site Not Found");
        }
        // Load Site Info
        let resp2 = await fetch("https://" + site.apiUrl + "/site", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        siteInfo = await resp2.json();
    } catch(e) {
        $("#ibot-preloader h2").html("Network Error");
    }
    darkMode();
    try {
        initFootBar();
    } catch(e) {}
    await initSidebar();
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

function submenus(){
    var subTrigger = document.querySelectorAll('[data-submenu]');
    if(subTrigger.length){
        var submenuActive = document.querySelectorAll('.submenu-active')[0];
            if (submenuActive){
            var subData = document.querySelectorAll('.submenu-active')[0].getAttribute('data-submenu');
            var subId = document.querySelectorAll('#'+ subData);
            var subIdNodes = document.querySelectorAll('#'+subData + ' a');
            var subChildren = subIdNodes.length
            var subHeight = subChildren * 43;
            subId[0].style.height = subHeight + 'px';
        }

        subTrigger.forEach(el => el.addEventListener('click',e => {
           const subData = el.getAttribute('data-submenu');
           var subId = document.querySelectorAll('#'+ subData);
           var subIdNodes = document.querySelectorAll('#'+subData + ' a');
           var subChildren = subIdNodes.length
           var subHeight = subChildren * 43;
           if(el.classList.contains('submenu-active')){
               subId[0].style.height = '0px';
               el.classList.remove('submenu-active');
           } else {
               subId[0].style.height = subHeight + 'px';
               el.classList.add('submenu-active');
           }
           return false
        }));
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