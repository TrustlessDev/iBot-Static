function initAdInfo(adId) {
    setTimeout(async function() {
        await initSite();
        await initLanguages();
        loadAdRedPacketInfo(adId);
        initFootBar();
        mappingLang();
    }, 300);
}

async function loadAdRedPacketInfo(adId) {
    let tmp = await callAPI("loadAdRedPacketInfo", { adId: adId });
    if(tmp.success) {
        let addList = tmp.adRedpackets;
        let totalLimit = 0;
        let totalAmount = 0;
        let totalReceivers = 0;
        let totalReceiveAmount = 0;
        for(let i=0;i<addList.length;i++) {
            let redpacket = addList[i];
            totalLimit += redpacket.limit;
            let amountInfo = calcAdInfo(redpacket.amount, redpacket.limit);
            totalAmount += amountInfo.eachAmount * redpacket.limit;
            totalReceivers += redpacket.receivers;
            totalReceiveAmount += redpacket.receivers * amountInfo.eachAmount;
            let elem = createRedPacketListCard(redpacket.id, redpacket.chatName, redpacket.amount, redpacket.limit, redpacket.receivers, redpacket.users);
            $("#adInfoList").append(elem);
        }
        $(".totalRedPacketInfo").text(totalReceivers + " / " + totalLimit + " 包");
        $(".totalRedPacketAmountInfo").text(totalReceiveAmount.toFixed(4) + " / " +  totalAmount.toFixed(4) + " USDT");
    }
}

function createRedPacketListCard(redPacketId, title, amount, limit, received, users) {
    let amountInfo = calcAdInfo(amount, limit);
    let percent = 1;
    if(received == 0) {
        percent = 0;
    } else if(received >= limit) {
        percent = 100;
    } else {
        percent = received / limit * 100;
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

    let h5 = document.createElement('h5');
    h5.id = "redpacketId" + redPacketId;
    h5.className = "mb-n1 opacity-80 color-green-dark";
    h5.textContent = "群組人數：" + users + " 人";

    let h3 = document.createElement('h3');
    h3.textContent = title;

    let p = document.createElement('p');
    // 塞入 HTML
    p.innerHTML = "紅包金額： " + amountInfo.eachAmount + " <b>USDT</b> 領取進度： " + received + "/" + limit + " <b>包</b>";
    p.innerHTML += "<br>剩餘金額： " + (limit-received) * amountInfo.eachAmount + " <b>USDT</b>";

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

    textDiv.appendChild(h5);
    textDiv.appendChild(h3);

    dFlex.appendChild(textDiv);

    content.appendChild(dFlex);
    content.appendChild(p);

    let br = document.createElement('br');
    content.appendChild(br);

    progress.appendChild(progressBar);
    cardBottom.appendChild(progress);

    content.appendChild(cardBottom);

    card.appendChild(content);

    return card;
}

function calcAdInfo(amount, limit) {
    let sourceFee = parseFloat((amount * 0.05).toFixed(4)); // 手續費
    let realBadge = amount - sourceFee; // 實際發放總額
    let realEachAmount = Math.floor(realBadge / limit * 10000) / 10000;
    let realTotalAmount = (realEachAmount * limit).toFixed(4); // 實際發放總額
    let eatAmount = (parseFloat(realTotalAmount) + sourceFee - amount).toFixed(4); // 零頭損耗
    return {
        fee: sourceFee + eatAmount,
        eachAmount: realEachAmount
    };
}