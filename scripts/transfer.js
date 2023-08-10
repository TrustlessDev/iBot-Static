async function transfer() {
    //let transferType = $("#transferType").val();
    let transferAmount = $("#transferAmount").val();
    let transferTo = $("#transferTo").val();
    let transferCoin = $("#transferCoin").val();
    let transferChain = $("#transferChain").val();
    /*
    if (transferType == 0) {
        alert("請選擇轉帳類型");
        return;
    }
    */
    if (transferAmount == "" || transferAmount == null || transferAmount == undefined || isNaN(transferAmount) || transferAmount <= 0) {
        alert(i18n("transfer_amount"));
        return;
    }
    if (transferTo == "" || transferTo == null || transferTo == undefined) {
        alert(i18n("transfer_to_who") + transferTo);
        return;
    }
    if (transferCoin == 0) {
        alert(i18n("select_currency_prompt"));
        return;
    }
    if (transferChain == 0) {
        alert(i18n("select_chain_prompt"));
        return;
    }

    callAPI("Transfer", {
      //transferType: transferType,
      transferAmount: transferAmount,
      transferTo: transferTo,
      transferCoin: transferCoin,
      transferChain: transferChain
    });
    Telegram.WebApp.close();
}

function loadMasterCoinList(selector) {
    $.ajax({
        url: "https://" + site.apiUrl + "/api/coin/list",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data.success) {
                var coinList = data.data;
                $(selector).html("");
                $(selector).append("<option value='0'>" + i18n("choose_currency") + "</option>");
                for (var i = 0; i < coinList.length; i++) {
                    $(selector).append("<option value='" + coinList[i].id + "'>" + coinList[i].symbol + "</option>");
                }
            }
        },
        error: function (data) {
            alert(JSON.stringify(data));
        }
    });
}

function loadChainList(masterCoinId, selector) {
    $("#transferChain").html("");
    $.ajax({
        url: "https://" + site.apiUrl + "/api/chain/list",
        type: "POST",
        dataType: "json",
        data: {
            masterCoinId: masterCoinId
        },
        success: function (data) {
            if (data.success) {
                var chainList = data.data;
                $(selector).html("");
                $(selector).append("<option value='0'>" + i18n("select_chain_prompt") + "</option>");
                for (var i = 0; i < chainList.length; i++) {
                    $(selector).append("<option value='" + chainList[i].chainId + "'>" + chainList[i].chainName + "</option>");
                }
            }
        },
        error: function (data) {
            alert(JSON.stringify(data));
        }
    });
}