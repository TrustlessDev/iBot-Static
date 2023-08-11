async function initNews() {
    setTimeout(async () => {
        await initSite();
        await initLanguages();
        refreshCategoriesNews();
        initFootBar();
        mappingLang();
        closePreloader();
    }, 300);
}

async function refreshCategoriesNews() {
    await appendToNewsBlock("#recent", []);
    await appendToNewsBlock("#crypto", ["Web3.0","Web3",i18n("crypto_market"),i18n("blockchain_applications"),i18n("binance"),i18n("unlock_token"),i18n("cryptocurrency"),i18n("mining"),i18n("bitcoin"),i18n("miner"),i18n("blockchain_events")]);
    await appendToNewsBlock("#market", [i18n("crypto_market"), i18n("financial_market"),i18n("nasdaq")]);
}

async function appendToNewsBlock(selector, filter) {
    let news = await getNews(filter);
    for(let i=0;i<news.length;i++) {
        if(i!=0) {
            $(selector).append("<div class=\"divider my-2 opacity-50\"></div>");
        }
        let ele = createNewsPageElement(news[i].providerIcon, news[i].title, news[i].link, news[i].date);
        $(selector).append(ele);
    }
}

async function getNews(filter = []) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://" + site.apiUrl + "/api/news",
            data: JSON.stringify({}),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function(rtv){
                if(rtv.success) {
                    let data = rtv.data.items.map((item) => {
                        //alert(item.guid);
                        return {
                            title: item.title,
                            link: item.link,
                            date: item.isoDate,
                            categories: item.categories,
                            providerIcon: item.providerIcon
                        };
                    });
                    if(filter.length > 0) {
                        data = data.filter((item) => {
                            let found = false;
                            for(let i=0;i<item.categories.length;i++) {
                                if(filter.indexOf(item.categories[i]) != -1) {
                                    found = true;
                                    break;
                                }
                            }
                            return found;
                        });
                    }
                    resolve(data);
                } else {
                    reject();
                }
            },
            error: function(xhr, ajaxOptions, thrownError){
                reject();
            }
        });
    });
}

function createNewsPageElement(providerIcon, title, url, date) {
    // Create <a> element
    let a = document.createElement('a');
    a.href = url;
    a.target = "_blank";
    a.className = "d-flex py-1";

    // Create first <div> inside <a>
    let div1 = document.createElement('div');
    div1.className = "align-self-center";

    let img = document.createElement('img');
    img.width = "32";
    img.src = providerIcon;

    div1.appendChild(img);

    // Create second <div> inside <a>
    let div2 = document.createElement('div');
    div2.className = "align-self-center ps-1";

    let h5 = document.createElement('h5');
    h5.className = "pt-1 mb-n1";
    h5.textContent = title;

    let p = document.createElement('p');
    p.className = "mb-0 font-11 opacity-50";
    p.textContent = new Date(date);

    let span = document.createElement('span');
    span.className = "copyright-year";

    p.appendChild(span);
    div2.appendChild(h5);
    div2.appendChild(p);

    // Append div1 and div2 to <a>
    a.appendChild(div1);
    a.appendChild(div2);
    
    return a;
}