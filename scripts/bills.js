async function initBills() {
    setTimeout(async function() {
        await initSite();
        await initLanguages();
        let rst = await callAPI("GetBills");
        if(rst.success) {
            let bills = rst.bills.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            })
            $("#tab-sumary").empty();
            $("#tab-in").empty();
            $("#tab-out").empty();
            for(let bill of bills) {
                let sumary = createBillElement(bill.title, bill.amount, bill.symbol, bill.date, bill.hash, bill.txUrl);
                $("#tab-sumary").append(sumary);
                if(bill.amount >= 0) {
                    let inBill = createBillElement(bill.title, bill.amount, bill.symbol, bill.date, bill.hash, bill.txUrl);
                    $("#tab-in").append(inBill);
                } else {
                    let outBill = createBillElement(bill.title, bill.amount, bill.symbol, bill.date, bill.hash, bill.txUrl);
                    $("#tab-out").append(outBill);
                }
                
            }
        }
        initFootBar();
        //mappingLang();
        closePreloader();
    }, 300);
}

function setTxDetail(txType, txHash, txDate, txAmount, txUrl) {
    $("#txType").html(txType);
    if(txHash.indexOf("internal:") == 0) {
        let realHash = txHash.replace("internal:", "");
        if(realHash == "0") {
            $("#txHash").html("<a>轉帳至系統</a>");
        } else {
            $("#txHash").html("<a>內部交易</a>");
        }
    } else {
        $("#txHash").html("<a href='" + txUrl + "' target='_blank'>" + shorten(txHash, 6, 6) + "</a>");
    }
    $("#txDate").html(txDate);
    $("#txAmount").html(txAmount);
}

function shorten(str, frontLength, backLength) {
    if (str.length <= frontLength + backLength) {
        // 如果字符串的長度不超過 frontLength + backLength，則返回原字符串
        return str;
    } else {
        return str.substring(0, frontLength) + '...' + str.slice(-backLength);
    }
}

function createBillElement(title, amount, symbol, date, hash, txUrl) {
    const formatSimpleDate = function(date) {
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    let formatedDate = formatSimpleDate(new Date(date));
    const a = document.createElement('a');
    a.setAttribute('href', '#');
    a.setAttribute('data-bs-toggle', 'offcanvas');
    a.setAttribute('data-bs-target', '#menu-bill');
    a.setAttribute('onClick', "setTxDetail('" + title + "','" + hash + "','" + formatedDate + "','" + amount + " " + symbol + "','" + txUrl + "')");
    a.classList.add('d-flex', 'py-1', 'mb-2');

    const div1 = document.createElement('div');
    div1.classList.add('align-self-center');
    
    const h5 = document.createElement('h5');
    h5.classList.add('pt-1', 'mb-n1');
    h5.textContent = title;
    
    const p1 = document.createElement('p');
    p1.classList.add('mb-0', 'font-11', 'opacity-70');

    p1.textContent = formatedDate;
    
    div1.appendChild(h5);
    div1.appendChild(p1);
    
    const div2 = document.createElement('div');
    div2.classList.add('align-self-center', 'ms-auto', 'text-end');
    
    const h4 = document.createElement('h4');
    h4.classList.add('pt-1', 'mb-n1');
    h4.textContent = amount;
    
    const p2 = document.createElement('p');
    p2.classList.add('mb-0', 'font-11', 'color-red-light');
    p2.textContent = symbol;
    
    div2.appendChild(h4);
    div2.appendChild(p2);
    
    a.appendChild(div1);
    a.appendChild(div2);
    
    return a;
}