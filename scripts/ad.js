let allGroups = [];
let groupPages = 1;
let groupPage = 1;
let createAdLock = false;

function initAdPage() {
    //Stepper
    setTimeout(async function () {
        await initSite();
        await initLanguages();
        var stepperAdd = document.querySelectorAll('.stepper-add');
        var stepperSub = document.querySelectorAll('.stepper-sub');
        if(stepperAdd.length){
            stepperAdd.forEach(el => el.addEventListener('click', event => {
                var currentValue = el.parentElement.querySelector('input').value;
                el.parentElement.querySelector('input').value = +currentValue + 1;
                updateTable();
                updateCalculation();
            }))

            stepperSub.forEach(el => el.addEventListener('click', event => {
                var currentValue = el.parentElement.querySelector('input').value;
                if(currentValue > 1) {
                    el.parentElement.querySelector('input').value = +currentValue - 1;
                }
                updateTable();
                updateCalculation();
            }))
        }
        // 載入圖片
        $("#image-data").attr("src", "images/ad-demo.jpg");
        // 設定監控 selectFrequence 下拉選單的變化
        $("#selectFrequence").change(function() {
            let frequence = $("#selectFrequence").val();
            if(frequence == 1440) {
                $("#cronTime").show();
            } else {
                $("#cronTime").hide();
            }
            updateCalculation();
        });
        // 載入群組
        await loadGroups();
        // 初始化表格
        updateTable();
        // 載入語言
        mappingLang();
        closePreloader();
    }, 300);
}

function updateCalculation() {
    let frequence = $("#selectFrequence").val();
    let times = {
        15: 96,
        30: 48,
        60: 24,
        120: 12,
        240: 6,
        480: 3,
        720: 2,
        1440: 1
    };
    $(".dailyCount").text(times[frequence] + i18n("times"));
    // 取得選擇的群組數
    let groupCount = allGroups.filter(group => group.checked).length;
    let amount = $("#redpacketAmount").val();
    let total = groupCount * amount;
    $(".eachTotalAmount").text(total + " USDT");

    $(".dailyTotalAmount").text(total * times[frequence] + " USDT");
}

async function createAd() {
    if(createAdLock) {
        adAlert(i18n("error"), i18n("ad_do_not_click_repeatedly"));
    }
    createAdLock = true;
    await adInfo(i18n("ad_tip"), i18n("ad_being_created"));
    let adData = getAdData();
    if(adData.adTitle == "") {
        adAlert(i18n("error"), i18n("enter_ad_title"));
        return;
    }
    if(adData.groupIds.length == 0) {
        adAlert(i18n("error"), i18n("ad_select_group"));
        return;
    }
    if(adData.adContent == "") {
        adAlert(i18n("error"), i18n("ad_enter_content"));
        return;
    }
    let rst = await callAPI("createAd", adData);
    if(rst.success) {
        await adInfo(i18n("ad_tip"), i18n("ad_created_successfully"));
        Telegram.WebApp.close();
    } else {
        adAlert(i18n("error"), rst.message);
    }
    createAdLock = false;
}

function getAdData() {
    let img = document.getElementById('image-data');
    let imgData = getBase64Image(img); // 取得圖片的 Base64 字串
    // 取出 Textarea 的值
    let adTitle = $("#adTitle").val(); // 取得廣告標題
    let adContent = $("#adText").val(); // 取得廣告內容
    let adLink1 = $("#adUrl1").val(); // 取得廣告連結1
    let adButton1 = $("#adButton1").val(); // 取得廣告按鈕1
    let adLink2 = $("#adUrl2").val(); // 取得廣告連結2
    let adButton2 = $("#adButton2").val(); // 取得廣告按鈕2
    let amount = $("#redpacketAmount").val(); // 取得廣告紅包總金額
    let limit = $("#redpacketLimit").val(); // 取得廣告紅包數量
    let groupIds = allGroups.filter(group => group.checked).map(group => group.id); // 取得選擇的群組 id
    let frequence = $("#selectFrequence").val(); // 取得廣告頻率
    let dayTime = $("#redpacketTime").val(); // 取得排程時間
    return {
        img: imgData,
        adTitle: adTitle,
        adContent: adContent,
        adButton1: adButton1,
        adLink1: adLink1,
        adButton2: adButton2,
        adLink2: adLink2,
        amount: amount,
        limit: limit,
        groupIds: groupIds,
        frequence: frequence,
        dayTime: dayTime
    }
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

function getBase64Image(img) {
    // 建立一個空的 <canvas> 元素
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // 將圖片繪製到 canvas 上
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // 取得圖片的 data URL 格式的 Base64 字串
    var dataURL = canvas.toDataURL("image/png");

    return dataURL;
}

async function loadGroups() {
    let groups = (await callAPI("loadGroups", {})).groups;
    let adminGroups = groups.filter(group => group.isAdmin && group.users > 0);
    // 由 users 數量排序 由大到小
    allGroups = adminGroups.sort((a, b) => b.users - a.users);
    // 群組內新增一個 checked 的 attribute, 預設為 false
    allGroups.forEach(group => group.checked = false);
    // 計算群組頁數
    groupPages = Math.ceil(allGroups.length / 10);
    
    // 顯示群組
    $("#groupTable").html("");

    // 顯示群組分頁
    $("#groupPagination").html("");
    for(let i = 1; i <= groupPages; i++) {
        let pagination = "<a href=\"#\" class=\"btn btn-3d bg-blue-light border-blue-dark\" onclick=\"showGroups(" + i + ")\">" + i + "</a>";
        $("#groupPagination").append(pagination);
    }

    // 顯示群組 從 groupPage 頁開始
    showGroups(groupPage);
}

function showGroups(page) {
    // 顯示群組
    $("#groupTable").html("");
    // 計算群組頁數
    groupPages = Math.ceil(allGroups.length / 10);
    // 顯示群組 從 groupPage 頁開始
    for(let i = (page - 1) * 10; i < page * 10; i++) {
        if(i >= allGroups.length) {
            break;
        }
        let group = allGroups[i];
        // 判斷是否為本頁最後一行
        let isFinalRow = i == page * 10 - 1;
        let tr = createTableRow(group.id, group.title, group.users, group.checked, isFinalRow);
        $("#groupTable").append(tr);
    }
}

function createTableRow(groupId, groupName, groupUsers, checked = false, isFinalRow = false) {
    // Create the elements
    const tr = document.createElement('tr');

    const td1 = document.createElement('td');
    const div1 = document.createElement('div');
    div1.classList.add("align-self-center", "ms-auto");
    if(isFinalRow) {
        td1.classList.add("border-0");
    }

    const div2 = document.createElement('div');
    div2.classList.add("form-switch", "ios-switch", "switch-green", "switch-xs");

    const input = document.createElement('input');
    input.type = "checkbox";
    input.classList.add("ios-input");
    input.id = "group-switch-" + groupId;
    input.checked = checked;

    // 綁定事件
    input.addEventListener('change', (event) => {
        let checked = event.target.checked;
        let group = allGroups.find(group => group.id == groupId);
        group.checked = checked;
        // 統計已選擇的群組數量
        let selectedGroups = allGroups.filter(group => group.checked);
        // 統計已選擇的群組人數
        let selectedUsers = selectedGroups.reduce((sum, group) => sum + group.users, 0);
        let adMessage = i18n("ad_select_group_now", {
            groupCount: selectedGroups.length,
            userCount: selectedUsers
          });
        $("#selectedGroupInfo").html(adMessage);
        updateCalculation();
    });

    const label = document.createElement('label');
    label.classList.add("custom-control-label");
    label.htmlFor = "group-switch-" + groupId;

    const td2 = document.createElement('td');
    td2.textContent = groupName;
    if(isFinalRow) {
        td2.classList.add("border-0");
    }

    const td3 = document.createElement('td');
    td3.textContent = groupUsers;
    if(isFinalRow) {
        td3.classList.add("border-0");
    }

    // Append the elements
    div2.append(input, label);
    div1.appendChild(div2);
    td1.appendChild(div1);

    tr.append(td1, td2, td3);

    return tr;
}


function updateTable() {
    let limit = $("#redpacketLimit").val(); // 總數量
    let amount = $("#redpacketAmount").val(); // 總金額
    let sourceFee = parseFloat((amount * 0.05).toFixed(4)); // 手續費
    let eachAmount = (amount / limit).toFixed(4); // 每個紅包金額
    let realBadge = amount - sourceFee; // 實際發放總額
    // realEachAmount 要無條件捨去到小數點第四位
    let realEachAmount = Math.floor(realBadge / limit * 10000) / 10000;
    let realTotalAmount = (realEachAmount * limit).toFixed(4); // 實際發放總額
    let eatAmount = (parseFloat(realTotalAmount) + sourceFee - amount).toFixed(4); // 零頭損耗
    $(".redpacketCount").html(limit);
    $(".redpacketAmount").html(parseFloat(amount) + " <b>USDT</b>");
    $(".sourcePerPacket").html(parseFloat(eachAmount) + " <b>USDT</b>");
    $(".redpacketFeeFrom").html(parseFloat(amount) + " <b>USDT</b> * 0.05");
    $(".redpacketFee").html(parseFloat(sourceFee) + " <b>USDT</b>");
    $(".realEachAmount").html(parseFloat(realEachAmount) + " <b>USDT</b>");
    $(".realTotalAmount").html(parseFloat(realTotalAmount) + " <b>USDT</b>");
    $(".eatAmount").html(parseFloat(eatAmount) + " <b>USDT</b>");
    
    if(realEachAmount < 0.01) {
        $("#lowAlert").show();
        $("#btnCreateAd").hide();
    } else {
        $("#lowAlert").hide();
        $("#btnCreateAd").show();
    }

}

function inputValidation() {
    var amount = $("#redpacketAmount").val();
    var limit = $("#redpacketLimit").val();
    if(amount < 1) {
        adAlert(i18n("ad_amount_min"));
        amount = 1;
        $("#redpacketAmount").val(amount);
    }
    if(limit < 1) {
        adAlert(i18n("ad_limit_min"));
        limit = 1;
        $("#redpacketLimit").val(limit);
    }
    return {
        amount: amount,
        limit: limit
    }
}