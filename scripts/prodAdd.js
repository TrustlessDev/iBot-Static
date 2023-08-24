function initAddProductPage() {
    //Stepper
    setTimeout(async function () {
        await loadJS("scripts/utils.js");
        await initSite();
        try {
            var stepperAdd = document.querySelectorAll('.stepper-add');
            var stepperSub = document.querySelectorAll('.stepper-sub');
            if(stepperAdd.length){
                stepperAdd.forEach(el => el.addEventListener('click', event => {
                    var currentValue = el.parentElement.querySelector('input').value;
                    el.parentElement.querySelector('input').value = +currentValue + 1;
                }))

                stepperSub.forEach(el => el.addEventListener('click', event => {
                    var currentValue = el.parentElement.querySelector('input').value;
                    if(currentValue > 1) {
                        el.parentElement.querySelector('input').value = +currentValue - 1;
                    }
                }))
            }
        }catch(e) {
            console.log(e);
        }
        // 載入圖片
        $("#image-data").attr("src", "images/ad-demo.jpg");
        closePreloader();
    }, 400);
}