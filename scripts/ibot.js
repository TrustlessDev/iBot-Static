
function initSplider() {
    //Image Sliders
    var splide = document.getElementsByClassName('splide');
    if(splide.length){
        var singleSlider = document.querySelectorAll('.single-slider');
        if(singleSlider.length){
            singleSlider.forEach(function(e){
                var single = new Splide( '#'+e.id, {
                    type:'loop',
                    autoplay:true,
                    interval:4000,
                    perPage: 1,
                }).mount();
                var sliderNext = document.querySelectorAll('.slider-next');
                var sliderPrev = document.querySelectorAll('.slider-prev');
                sliderNext.forEach(el => el.addEventListener('click', el => {single.go('>');}));
                sliderPrev.forEach(el => el.addEventListener('click', el => {single.go('<');}));
            });
        }

        var doubleSlider = document.querySelectorAll('.double-slider');
        if(doubleSlider.length){
            doubleSlider.forEach(function(e){
                 var double = new Splide( '#'+e.id, {
                    type:'loop',
                    autoplay:true,
                    interval:4000,
                    arrows:false,
                    perPage: 2,
                }).mount();
            });
        }

        var tripleSlider = document.querySelectorAll('.triple-slider');
        if(tripleSlider.length){
            tripleSlider.forEach(function(e){
                 var triple = new Splide( '#'+e.id, {
                    type:'loop',
                    autoplay:true,
                    interval:4000,
                    arrows:false,
                    perPage: 3,
                    perMove: 1,
                }).mount();
            });
        }

        var quadSlider = document.querySelectorAll('.quad-slider');
        if(quadSlider.length){
            quadSlider.forEach(function(e){
                 var quad = new Splide( '#'+e.id, {
                    type:'loop',
                    autoplay:true,
                    interval:4000,
                    arrows:false,
                    perPage: 4,
                    perMove: 1,
                }).mount();
            });
        }
    }
    const cards = document.getElementsByClassName('card');
    function card_extender(){
        for (let i = 0; i < cards.length; i++) {
            if(cards[i].getAttribute('data-card-height') === "cover"){
                if (window.matchMedia('(display-mode: fullscreen)').matches) {var windowHeight = window.outerHeight;}
                if (!window.matchMedia('(display-mode: fullscreen)').matches) {var windowHeight = window.innerHeight;}
                var coverHeight = windowHeight + 'px';
            }
            if(cards[i].hasAttribute('data-card-height')){
                var getHeight = cards[i].getAttribute('data-card-height');
                cards[i].style.height= getHeight +'px';
                if(getHeight === "cover"){
                    var totalHeight = getHeight
                    cards[i].style.height =  coverHeight
                }
            }
        }
    }
    if(cards.length){card_extender(); window.addEventListener("resize", card_extender);}
}

async function callCreateRedPacket() {
    var stepperAdd = document.querySelectorAll('.stepper-add');
    var stepperSub = document.querySelectorAll('.stepper-sub');
    if(stepperAdd.length){
        stepperAdd.forEach(el => el.addEventListener('click', event => {
            var currentValue = el.parentElement.querySelector('input').value;
            el.parentElement.querySelector('input').value = +currentValue + 1;
            updatePersonalRepacketInfo();
        }))

        stepperSub.forEach(el => el.addEventListener('click', event => {
            var currentValue = el.parentElement.querySelector('input').value;
            if(currentValue > 1) {
                el.parentElement.querySelector('input').value = +currentValue - 1;
            }
            updatePersonalRepacketInfo();
        }))
    }
    var createRedpacketMenu = document.getElementById('menu-create-redpacket');
    createRedpacketBsOffcanvas = new bootstrap.Offcanvas(createRedpacketMenu);
    createRedpacketBsOffcanvas.show();
    updatePersonalRepacketInfo();
}

let redPacketLock = false;

async function callSendRedPacket() {
    if(redPacketLock) {
        return;
    }
    redPacketLock = true;
    let rst = await callAPI("sendRedPacket", {
        amount: document.getElementById('personalRedpacketAmount').value,
        limit: document.getElementById('personalRedpacketLimit').value,
        text: document.getElementById('personalRedpacketText').value
    });
    if(rst.success) {
        Telegram.WebApp.close();
    } else {
        await indexAlert("發送金額過小", rst.message);
    }
}

async function indexAlert(title, message) {
    $("#indexAlertConfirm").off('click').click(function() {
        $('#index-warning').attr('hasClick', 'true');
    });
    $("#index-warning").attr("hasClick", "false");
    $("#index-warning-title").html(title);
    $("#index-warning-content").html(message);
    var offcanvasElement = document.getElementById('index-warning');
    var bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
    bsOffcanvas.show();
    while($("#index-warning").attr("hasClick") != "true") {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    bsOffcanvas.hide();
}

async function updatePersonalRepacketInfo() {
    let amount = document.getElementById('personalRedpacketAmount').value;
    let limit = document.getElementById('personalRedpacketLimit').value;
    let sourceFee = parseFloat((amount * 0.05).toFixed(4)); // 手續費
    let eachAmount = (amount / limit).toFixed(2); // 每個紅包金額
    let realBadge = amount - sourceFee; // 實際發放總額
    // realEachAmount 要無條件捨去到小數點第四位
    let realEachAmount = Math.floor(realBadge / limit * 100) / 100;
    let realTotalAmount = (realEachAmount * limit).toFixed(4); // 實際發放總額
    let eatAmount = (parseFloat(realTotalAmount) + sourceFee - amount).toFixed(4); // 零頭損耗
    $(".personalRedpacketFeeFrom").html(parseFloat(amount) + " <b>USDT</b> * 0.05");
    $(".personalRedpacketFee").html(parseFloat(sourceFee) + " <b>USDT</b>");
    $(".personalRealEachAmount").html(parseFloat(realEachAmount) + " <b>USDT</b>");
    $(".personalRealTotalAmount").html(parseFloat(realTotalAmount) + " <b>USDT</b>");
    $(".personalEatAmount").html(parseFloat(eatAmount) + " <b>USDT</b>");
    if(realEachAmount < 0.01) {
        await indexAlert("發送金額過小", "每個紅包金額不得小於 0.01 USDT");
    }
}

async function initHomeCharts() {
    let balanceChanged = await callAPI("getBalanceChanged", {});
    var options = {
        series: [{
            name: 'series1',
            data: balanceChanged
        }],
        colors:['#5D9CEC'],
        chart: {
            toolbar: {show: false},
            height: 80,
            width:150,
            type: 'area'
        },
        grid:{show:false },
        xaxis: {
            labels: {show: false,},
            axisBorder: {show: false},
            axisTicks: {show: false,}	
        },
        yaxis: {labels: {show: false}},
        dataLabels: {enabled: false},
        stroke: {width:1},
        tooltip: {enabled:false},
    };
    
    var chart = new ApexCharts(document.querySelector("#chart-balance"), options);
    chart.render();
}

async function getNews() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/news",
            data: JSON.stringify({}),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function(rtv){
                if(rtv.success) {
                    let data = rtv.data.items.map((item) => {
                        return {
                            title: item.title,
                            link: item.link,
                            date: item.isoDate
                        };
                    });
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

async function webLogin() {
    let data = await callAPI("webLogin");
    return data;
}

function byteLength(str) {
    if (window.Blob) {
        try { return new Blob([str]).size; } catch (e) {}
    }

    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
        const code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) {
            s++;
        } else if (code > 0x7ff && code <= 0xffff) {
            s+=2;
        }

        if (code >= 0xDC00 && code <= 0xDFFF) {
            i--;
        }
    }
    return s;
}

function round(val, d) {
    const k = Math.pow(10, d || 0);
    return Math.round(val * k) / k;
}