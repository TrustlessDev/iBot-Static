
let AdId = 0;
let addBudgetBsOffcanvas

function initAdList() {
    setTimeout(async function() {
        $("#adList").empty();
        let adList = await callAPI("getAdList", {});
        if(adList.success) {
            for(let i = 0; i < adList.adJobs.length; i++) {
                let tmp = createAdListCard(adList.adJobs[i].id, adList.adJobs[i].title, adList.adJobs[i].state ? "playing" : "paused", adList.adJobs[i].budget, adList.adJobs[i].used);
                $("#adList").append(tmp);
            }
        }
    }, 1000);
}

function createAdListCard(adId, title, status, budget, used) {
    let percent = 1;
    if(budget == 0) {
        percent = 0;
    } else if(used == 0) {
        percent = 100;
    } else {
        percent = used / budget * 100;
        // 去除小數點
        percent = 100 - percent;
        percent = percent.toFixed(0);
    }
    // Create elements
    let card = document.createElement('div');
    card.className = "card card-style";

    let content = document.createElement('div');
    content.className = "content";

    let dFlex = document.createElement('div');
    dFlex.className = "d-flex";

    let textDiv = document.createElement('div');

    let h6 = document.createElement('h6');
    h6.id = "adId" + adId;
    h6.className = "mb-n1 opacity-80";

    let h3 = document.createElement('h3');
    h3.textContent = title;

    let iconDiv = document.createElement('div');
    iconDiv.className = "align-self-center ms-auto";

    let a = document.createElement('a');
    a.href = "#";
    a.onclick = async function() {
        let status = document.getElementById("adId" + adId).textContent;
        if(status == "廣告已暫停") { // 進行 toggle
            let cronStatus = await callAPI("startCron", {
                adId: adId
            });
            if(cronStatus.success) {
                document.getElementById("adId" + adId).textContent = "廣告投放中";
                document.getElementById("adId" + adId).classList.remove("color-red-dark");
                document.getElementById("adId" + adId).classList.add("color-green-dark");
                document.getElementById("adIconId" + adId).classList.remove("bi-play-circle-fill", "color-green-dark");
                document.getElementById("adIconId" + adId).classList.add("bi-pause-circle-fill", "color-red-dark");
            } else {
                adAlert("失敗", cronStatus.message);
            }
        } else {
            let cronStatus = await callAPI("stopCron", {
                adId: adId
            });
            if(cronStatus.success) {
                document.getElementById("adId" + adId).textContent = "廣告已暫停";
                document.getElementById("adId" + adId).classList.remove("color-green-dark");
                document.getElementById("adId" + adId).classList.add("color-red-dark");
                document.getElementById("adIconId" + adId).classList.remove("bi-pause-circle-fill", "color-red-dark");
                document.getElementById("adIconId" + adId).classList.add("bi-play-circle-fill", "color-green-dark");
            } else {
                adAlert("失敗", cronStatus.message);
            }
            
        }
    };

    let i = document.createElement('i');
    i.id = "adIconId" + adId;
    if(status === "paused") {
        i.className = "bi font-24 bi-play-circle-fill color-green-dark";
    } else if (status === "playing") {
        i.className = "bi font-24 bi-pause-circle-fill color-red-dark";
    }

    let p = document.createElement('p');
    // 塞入 HTML
    p.innerHTML = "廣告預算金額： " + budget + " <b>USDT</b> 目前已使用： " + used + " <b>USDT</b><br>剩餘預算金額： " + (budget - used) + " <b>USDT</b>";

    let cardBottom = document.createElement('div');
    cardBottom.className = "card-bottom mx-3 mb-3";

    let progress = document.createElement('div');
    progress.className = "progress rounded-xs bg-theme border";
    progress.style.height = "20px";

    let progressBar = document.createElement('div');
    progressBar.className = "progress-bar text-start ps-3 font-600 font-10";
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuemin", "0");
    progressBar.setAttribute("aria-valuemax", "100");

    let buttonRow = document.createElement('div');
    buttonRow.className = "row";

    let blankColStart = document.createElement('div');
    blankColStart.className = "col-1";

    let blankColEnd = document.createElement('div');
    blankColEnd.className = "col-1";

    let addButtonCol = document.createElement('div');
    addButtonCol.className = "col-3";

    let addButton = document.createElement('a');
    addButton.href = "#";
    addButton.className = "btn-full btn bg-green-dark";
    addButton.textContent = "儲值";
    addButton.onclick = function() { 
        showAddBudget(adId);
    };

    let removeButtonCol = document.createElement('div');
    removeButtonCol.className = "col-3 mb-4 pb-1";

    let removeButton = document.createElement('a');
    removeButton.href = "#";
    removeButton.className = "btn-full btn bg-red-dark";
    removeButton.textContent = "刪除";
    removeButton.onclick = async function() { 
        let removeStatus = await callAPI("removeAd", { adId: adId });
        if(removeStatus.success) {
            await adInfo("成功", "廣告已刪除");
            initAdList(adId);
        } else {
            await adAlert("失敗", removeStatus.message);
        }
    };

    let infoButtonCol = document.createElement('div');
    infoButtonCol.className = "col-3";

    let infoButton = document.createElement('a');
    infoButton.href = "page-ad-info.html";
    infoButton.className = "btn-full btn bg-blue-dark";
    infoButton.textContent = "效益";
    infoButton.onclick = function() {
        initAdInfo(adId);
    };

    // Add specific classes and content based on status and percent
    if (status === "paused") {
        h6.textContent = "廣告已暫停";
        h6.className += " color-red-dark";
        i.className += " bi-play-circle-fill color-green-dark";
    } else if (status === "playing") {
        h6.textContent = "廣告投放中";
        h6.className += " color-green-dark";
        i.className += " bi-pause-circle-fill color-red-dark";
    }

    if(percent < 25) {
        progress.className += " border-red-light";
        progressBar.className += " gradient-red";
    } else {
        progress.className += " border-blue-light";
        progressBar.className += " gradient-blue";
    }

    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", percent);
    progressBar.textContent = `${percent}%`;

    // Assemble card
    a.appendChild(i);
    iconDiv.appendChild(a);

    textDiv.appendChild(h6);
    textDiv.appendChild(h3);

    dFlex.appendChild(textDiv);
    dFlex.appendChild(iconDiv);

    content.appendChild(dFlex);
    content.appendChild(p);

    let br = document.createElement('br');
    content.appendChild(br);

    progress.appendChild(progressBar);
    cardBottom.appendChild(progress);

    content.appendChild(cardBottom);

    addButtonCol.appendChild(addButton);
    removeButtonCol.appendChild(removeButton);
    infoButtonCol.appendChild(infoButton);

    buttonRow.appendChild(blankColStart);
    buttonRow.appendChild(addButtonCol);
    buttonRow.appendChild(removeButtonCol);
    buttonRow.appendChild(infoButtonCol);
    buttonRow.appendChild(blankColEnd);

    card.appendChild(content);
    card.appendChild(buttonRow);

    return card;
}

async function adInfo(title, message) {
    $("#adInfoConfirm").off('click').click(function() {
        $('#ad-info').attr('hasClick', 'true');
    });
    $("#ad-info").attr("hasClick", "false");
    $("#ad-info-title").html(title);
    $("#ad-info-content").html(message);
    var offcanvasElement = document.getElementById('ad-info');
    var bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
    bsOffcanvas.show();
    while($("#ad-info").attr("hasClick") != "true") {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    bsOffcanvas.hide();
}

async function adAlert(title, message) {
    $("#adAlertConfirm").off('click').click(function() {
        $('#ad-warning').attr('hasClick', 'true');
    });
    $("#ad-warning").attr("hasClick", "false");
    $("#ad-warning-title").html(title);
    $("#ad-warning-content").html(message);
    var offcanvasElement = document.getElementById('ad-warning');
    var bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
    bsOffcanvas.show();
    while($("#ad-warning").attr("hasClick") != "true") {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    bsOffcanvas.hide();
}

function showAddBudget(adId) {
    this.AdId = adId;
    var addAdBudgetMenu = document.getElementById('menu-add-ad-budget');
    addBudgetBsOffcanvas = new bootstrap.Offcanvas(addAdBudgetMenu);
    addBudgetBsOffcanvas.show();
}

async function callAddBudget() {
    addBudgetBsOffcanvas.hide();

    let amount = $("#budgetAmount").val();
    let addStatus = await callAPI("addAdBudget", { adId: this.AdId, amount: amount });
    if(addStatus.success) {
        await adInfo("成功", "預算已添加");
        initAdList();
    } else {
        await adAlert("失敗", addStatus.message);
    }
}