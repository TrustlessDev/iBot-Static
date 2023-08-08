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
        alert("請輸入轉帳金額");
        return;
    }
    if (transferTo == "" || transferTo == null || transferTo == undefined) {
        alert("請輸入轉帳對象" + transferTo);
        return;
    }
    if (transferCoin == 0) {
        alert("請選擇幣種");
        return;
    }
    if (transferChain == 0) {
        alert("請選擇鏈");
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

function loadMasterCoinList() {
    $.ajax({
        url: "https://" + site.apiUrl + "/api/coin/list",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data.success) {
                var coinList = data.data;
                $("#transferCoin").html("");
                $("#transferCoin").append("<option value='0'>請選擇幣種</option>");
                for (var i = 0; i < coinList.length; i++) {
                    $("#transferCoin").append("<option value='" + coinList[i].id + "'>" + coinList[i].symbol + "</option>");
                }
            }
        },
        error: function (data) {
            alert(JSON.stringify(data));
        }
    });
}

function loadChainList(masterCoinId) {
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
                $("#transferChain").html("");
                $("#transferChain").append("<option value='0'>請選擇鏈</option>");
                for (var i = 0; i < chainList.length; i++) {
                    $("#transferChain").append("<option value='" + chainList[i].chainId + "'>" + chainList[i].chainName + "</option>");
                }
            }
        },
        error: function (data) {
            alert(JSON.stringify(data));
        }
    });
}