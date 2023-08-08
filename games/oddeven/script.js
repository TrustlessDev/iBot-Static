class TextAnimator {
  constructor(initResult, options) {
    this.img = new Image();   // 建立一個新的 Image 物件
    this.img.src = 'images/dice-header.png';  // 設定圖片的路徑
    this.initResult = initResult;
    this.wheelAudio = new Audio('mp3/slot-wheel.mp3');
    this.wheelAudio.loop = true;
    this.finalAudio = new Audio('mp3/slot-final.mp3');
    this.finalPlayed = false;
    this.showError = false;
    this.errorMessage = "";
    this.isInitialState = true;
    this.isAnimating = false;
    this.resultSeted = false; // 結果是否已經設定
    this.startTextIdx = 0; // 預設選擇第一個字
    this.targetTextIdx = 0; // 目標選擇的字
    this.resultText = ""; // 結果文字
    this.moveFrameIdx = 0;
    this.chars = options.chars.split("");
    this.scale = options.scale;
    this.breaks = options.breaks;
    this.endSpeed = options.endSpeed;
    this.firstLetter = options.firstLetter;
    this.delay = options.delay;
    this.tmpResult = null;

    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.onresize = () => this.resize();
    this.setText(initResult);
    this.img.onload = () => {
      let height = this.canvas.width * this.img.height / this.img.width;
      this.ctx.drawImage(this.img, 0, 0, this.canvas.width, height);
    };
    this.render();
  }

  setText(text) {
    this.text = text.split("");
    this.charMap = [];
    this.offset = [];
    this.offsetV = [];

    for (let i = 0; i < this.chars.length; i++) {
      this.charMap[this.chars[i]] = i;
    }
    for (let i = 0; i < this.text.length; i++) {
      let f = (this.isInitialState ? 1 : this.firstLetter) + (this.isInitialState ? 1 : this.delay) * i;
      this.offsetV[i] = this.endSpeed + this.breaks * f;
      this.offset[i] = -(1 + f) * (this.breaks * f + 2 * this.endSpeed) / 2;
    }
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  render() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = "#622";
    this.ctx.fillRect(0, (this.canvas.height - this.scale) / 2, this.canvas.width, this.scale);
    for (let i = 0; i < this.text.length; i++) {
      this.ctx.fillStyle = "#ccc";
      this.ctx.textBaseline = "middle";
      this.ctx.textAlign = "center";
      this.ctx.setTransform(
        1,
        0,
        0,
        1,
        Math.floor((this.canvas.width - this.scale * (this.text.length - 1)) / 2),
        Math.floor(this.canvas.height / 2)
      );
      let o = this.offset[i];
      while (o < 0) o++;
      o %= 1;
      let h = Math.ceil(this.canvas.height / 2 / this.scale);
      for (let j = -h; j < h; j++) {
        if(this.showError) {
          break;
        }
        let c = this.charMap[this.text[i]] + j - Math.floor(this.offset[i]);
        while (c < 0) c += this.chars.length;
        c %= this.chars.length;
        let s = 1 - Math.abs(j + o) / (this.canvas.height / 2 / this.scale + 1);
        this.ctx.globalAlpha = s;
        this.ctx.font = this.scale * s + "px Helvetica";
        this.ctx.fillText(this.chars[c], this.scale * i, (j + o) * this.scale);
      }
      this.offset[i] += this.offsetV[i];
      this.offsetV[i] -= this.breaks;
      if (this.offsetV[i] < this.endSpeed) {
        this.offset[i] = 0;
        this.offsetV[i] = 0;
      }
      if(this.showError) {
        break;
      }
    }

    if(this.resultSeted) { // 結果已經設定, 開始繪製包圍住最右側文字的方框
      this.wheelAudio.pause();

      this.ctx.globalAlpha = 1;
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      let txtIdx = (this.text.length - 1) - this.startTextIdx;
      let k = txtIdx;
      let tx = this.scale * k - this.scale / 2;
      let x = tx - this.moveFrameIdx;
      let y = this.offset[k] - this.scale / 2;
      let w = this.scale;
      let h = this.scale;
      let targetX = this.targetTextIdx * this.scale - this.scale / 2;

      if(this.targetTextIdx == -1) {
        if(!this.finalPlayed) {
          this.finalAudio.play();
          this.finalPlayed = true;
        }
        // 設定文字的字型和大小
        this.ctx.font = this.scale * 2 + "px Helvetica";

        const text = "槓龜";
        const textX = (this.scale * (this.text.length - 1) / 2);
        const textY = -this.scale * 2;

        // 繪製紅色槓龜的文字
        this.ctx.fillStyle = "#f00"; 
        this.ctx.fillText(text, textX, textY);

        // 設定外框的樣式
        this.ctx.strokeStyle = "#fff"; 
        this.ctx.lineWidth = 2; 

        // 繪製外框
        this.ctx.strokeText(text, textX, textY);
      } else {
        this.ctx.strokeRect(x, y, w, h);
        if(targetX < x) {
          this.moveFrameIdx += 2;
        } else {
          if(!this.finalPlayed) {
            this.finalAudio.play();
            this.finalPlayed = true;
          }
          // 設定文字的字型和大小
          this.ctx.font = this.scale * 2 + "px Helvetica";

          // 繪製藍色結果的文字
          const resultText = this.resultText;
          const resultTextX = (this.scale * (this.text.length - 1) / 2);
          const resultTextY = -this.scale * 2;

          // 繪製藍色結果的文字
          this.ctx.fillStyle = "#00f"; 
          this.ctx.fillText(resultText, resultTextX, resultTextY);

          // 設定外框的樣式
          this.ctx.strokeStyle = "#fff"; 
          this.ctx.lineWidth = 2; 

          // 繪製外框
          this.ctx.strokeText(resultText, resultTextX, resultTextY);
        }
      }
    }
    let width = this.scale * this.text.length;
    let height = width * this.img.height / this.img.width;
    this.ctx.drawImage(this.img, -25, -250, width, height);

    if (this.showError) {
      this.ctx.font = parseInt(this.scale / 2) + "px Helvetica";
      this.ctx.fillStyle = "#fff"; 
      let resultMsgX = (this.scale * (this.text.length - 1) / 2);
      let resultMsgY = this.scale * 2;
    
      let textWidth = this.ctx.measureText(this.errorMessage).width;
      let bgWidth = textWidth + 10; 
      let bgHeight = parseInt(this.scale / 2) + 5; 
    
      this.ctx.fillRect(resultMsgX - bgWidth / 2, resultMsgY - bgHeight / 2, bgWidth, bgHeight);
    
      this.ctx.font = parseInt(this.scale / 2) + "px Helvetica";
      this.ctx.fillStyle = "#f00";
      this.ctx.fillText(this.errorMessage, resultMsgX, resultMsgY);
    }
    
    if (this.resultSeted) {
      this.ctx.font = parseInt(this.scale / 2) + "px Helvetica";
      this.ctx.fillStyle = "#fff"; 
      let resultMsgX = (this.scale * (this.text.length - 1) / 2);
      let resultMsgY = this.scale * 2;
      let rstMessage = "";
      let tmpColor = "";
      if (this.tmpResult && this.tmpResult.win && this.tmpResult.win == true) {
        tmpColor = "#f00";
        rstMessage = "恭喜您贏了 " + this.tmpResult.winAmount + " USDT";
      } else {
        tmpColor = "#00f";
        rstMessage = "很抱歉您輸了!";
      }
    
      let textWidth = this.ctx.measureText(rstMessage).width;
      let bgWidth = textWidth + 10; 
      let bgHeight = parseInt(this.scale / 2) + 5; 
    
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(resultMsgX - bgWidth / 2, resultMsgY - bgHeight / 2, bgWidth, bgHeight);
      
      this.ctx.font = parseInt(this.scale / 2) + "px Helvetica";
      //this.ctx.fillStyle = "#00f";
      this.ctx.fillStyle = tmpColor;
      this.ctx.fillText(rstMessage, resultMsgX, resultMsgY);

      betLock = false;
    }

    requestAnimationFrame(() => this.render()); // 使用遞迴來持續呼叫render()
  }

  getRandomText(n) {
    let randomText = '';
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * this.chars.length);
      randomText += this.chars[randomIndex];
    }
    return randomText;
  }

  error(message) {
    this.showError = true;
    this.isAnimating = false;
    this.errorMessage = message;
    this.wheelAudio.pause();
  }

  start() {
    this.showError = false;
    this.errorMessage = "";
    this.isAnimating = true;
    this.isInitialState = false;
    this.resultSeted = false;
    this.wheelAudio.play();
    for (let i = 0; i < this.text.length; i++) {
      let f = this.firstLetter + this.delay * i;
      this.offsetV[i] = 10;
      this.offset[i] = -10;
    }
    this.render()
  }
  
  setValue(value, options = null) {
    this.tmpResult = options;
    this.setText(value);
    this.isAnimating = false;
    this.offset = [];
    this.offsetV = [];
    for (let i = 0; i < this.text.length; i++) {
      let f = this.firstLetter + this.delay * i;
      this.offsetV[i] = this.endSpeed + this.breaks * f;
      this.offset[i] = -(1 + f) * (this.breaks * f + 2 * this.endSpeed) / 2;
    }
    this.isAnimating = true;
    
    const checkAnimationStatus = () => {
      let isAnimating = false;
      for (let i = 0; i < this.text.length; i++) {
        if (this.offsetV[i] > this.endSpeed) {
          isAnimating = true;
          break;
        }
      }
      // 檢查動畫是否仍在執行
      if (isAnimating) {
        requestAnimationFrame(checkAnimationStatus);
      } else {
        // 從右到左 找出最先出現數字的字元
        this.targetTextIdx = -1;
        this.resultText = "";
        for(let i = this.text.length - 1; i >= 0; i--) {
          if(this.text[i] >= '0' && this.text[i] <= '9') {
            let rst = parseInt(this.text[i]);
            this.targetTextIdx = i;
            if(rst > 4) {
              this.resultText += "大";
            } else {
              this.resultText += "小";
            }
            if(rst % 2 == 0) {
              this.resultText += "雙";
            } else {
              this.resultText += "單";
            }
            break;
          }
        }
        // 重設動畫參數
        this.moveFrameIdx = 0;
        // 動畫已經完成
        this.resultSeted = true;
      }
    };
  
    // 開始檢查動畫狀態
    requestAnimationFrame(checkAnimationStatus);
  }
}

let animator = new TextAnimator("a1b2c3" ,{
  chars: "0123456789abcdef",
  scale: 50,
  breaks: 0.003,
  endSpeed: 0.05,
  firstLetter: 400,
  delay: 30
});
