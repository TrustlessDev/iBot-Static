function initProductCreatePage() {
    //Stepper
    setTimeout(async function () {
        alert(i18n("prodAdd_msg"));
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
        // 載入圖片
        $("#image-data").attr("src", "images/ad-demo.jpg");
        
    }, 400);
}