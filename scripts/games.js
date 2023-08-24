async function initGames() {
    setTimeout(async function () {
        await initSite();
        await initLanguages();
        await getGames();
        mappingLang();
        closePreloader();
    }, 300);
}

async function startGame(gameId) {
    callAPI("startGame", {gameId: gameId});
    Telegram.WebApp.close();
}

async function getGames() {
    let games = (await callAPI("getGames", {})).games;

    $("#gameList").empty();
    for(let i = 0; i < games.length; i++) {
        let game = games[i];
        let gameListItem = createGameListItem(game.id, game.icon, game.name, game.description);
        $("#gameList").append(gameListItem);
    }
}

function createGameListItem(gameId, imgSrc, gameTitle, rewardDescription) {
    // 創建元素
    var colDiv = document.createElement("div");
    var cardLink = document.createElement("a");
    var cardCenterDiv = document.createElement("div");
    var iconSpan = document.createElement("span");
    var img = document.createElement("img");
    var h1 = document.createElement("h1");
    var cardBottomDiv = document.createElement("div");
    var p = document.createElement("p");
  
    // 設定屬性
    colDiv.className = "col-6 mb-n2";
    cardLink.href = "#";
    cardLink.className = "card card-style me-0";
    cardLink.style.height = "180px";
    cardLink.onclick = function() { startGame(gameId); };
    cardCenterDiv.className = "card-center";
    iconSpan.className = "icon icon-xl rounded-m shadow-bg shadow-bg-xs";
    img.src = imgSrc;
    img.style.cssText = "width:100%;height:auto;background-color: blue;";
    h1.className = "font-22 pt-3";
    h1.innerText = gameTitle;
    cardBottomDiv.className = "card-bottom";
    p.className = "font-11 mb-0 opacity-70";
    p.innerText = rewardDescription;
  
    // 組裝元素
    iconSpan.appendChild(img);
    cardCenterDiv.appendChild(iconSpan);
    cardCenterDiv.appendChild(h1);
    cardBottomDiv.appendChild(p);
    cardLink.appendChild(cardCenterDiv);
    cardLink.appendChild(cardBottomDiv);
    colDiv.appendChild(cardLink);
  
    // 返回創建的元素
    return colDiv;
  }