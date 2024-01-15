const fromCur = document.querySelector(".from select");
const toCur = document.querySelector(".to select");
const getBtn = document.querySelector("form .button");
const exIcon = document.querySelector("form .reverse");
const amount = document.querySelector(".amount input");
const exRateTxt = document.querySelector("form .result");
const methodGet = document.querySelector(".method .select-method");
let methodSend = '';
const maxRes = document.querySelector("form .reserv");
const fileInput = document.querySelector('.inputHid');
const form = document.querySelector('form');
let imgData = '';
// Event listener for currency dropdowns (select)

[fromCur, toCur].forEach((select, i) => {
    for (let curCode in currencyList) {
        const selected = (i === 0 && curCode === "RUB") || (i === 1 && curCode === "CNY") ? "selected" : "";
        select.insertAdjacentHTML("beforeend", `<option value="${curCode}" ${selected}>${curCode}</option>`);
    }
    select.addEventListener("change", () => {
        const code = select.value;
        const imgTag = select.parentElement.querySelector("img");
        imgTag.src = `https://coinicons-api.vercel.app/api/icon/${currencyList[code]}`;
    });
    select.addEventListener('change', getExchangeRate)
    select.addEventListener('change', getMaxReserve)
});

const changeMethodGet = () => {
    const v = toCur.value
    const url = 'https://asdasdasdasdq.tilda.ws/payment'
    let path = ''
    if (v == 'USDT' || v == 'BTC' || v == 'ETH') {
        methodGet.innerText = 'Crypto address';
        path = 'usdt_bep20';
    } else if (v == 'CNY') {
        methodGet.innerText = 'Alipay';
        path = 'ali';
    } else if (v == 'RUB') {
        methodGet.innerText = 'Bank card';
        path = 'bank2';
    }
    form.action = url + path;
}

const changeMethodSend = () => {
    const v = fromCur.value
    if (v == 'USDT' || v == 'BTC' || v == 'ETH') {
        methodSend = 'Crypto address';
    } else if (v == 'CNY') {
        methodSend = 'Alipay';
    } else if (v == 'RUB') {
        methodSend = 'Bank card';
    }
}

toCur.addEventListener('change', changeMethodGet)
fromCur.addEventListener('change', changeMethodSend)


// Function max Reserve

async function getMaxReserve() {
    maxRes.innerText = "Max колчиество"
    try {
        const coord = maxReserveList[toCur.value];
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/15dKus_k2TI23_sBnYQjWOfACfijZsk7xJ4CsVMFLMMs/values/sheet3!${coord}?key=AIzaSyB-dszV5PwFcT5yXw-ZQ5dwA3l4YCMfeJE`);
        const resRes = await response.json()
        maxRes.innerText = "Max: " + resRes.values[0][0] + " " + toCur.value;
    } catch (error) {
        maxRes.innerText = "Что-то пошло не так...";
    }
}

// Function to get exchange rate from api

async function getExchangeRate() {
    const amountVal = amount.value || 1;
    exRateTxt.innerText = "Получаем обменный курс...";
    try {
        let exchangeRate;
        if (fromCur.value == toCur.value) {
            exchangeRate = 1;
        } else {
            const para = fromCur.value + toCur.value;
            const coord = cuurencyRate[para];
            if (!coord) {
                exRateTxt.innerText = "Данная валютная пара отсутствует"
                return
            };
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/15dKus_k2TI23_sBnYQjWOfACfijZsk7xJ4CsVMFLMMs/values/${coord}?key=AIzaSyB-dszV5PwFcT5yXw-ZQ5dwA3l4YCMfeJE`);
            const resStr = await response.json()
            exchangeRate = parseFloat(resStr.values[0][0]);
        }
        const totalExRate = (amountVal * exchangeRate).toFixed(2);
        exRateTxt.innerText = `${amountVal} ${fromCur.value} = ${totalExRate} ${toCur.value}`;
        if (totalExRate > parseFloat(maxRes.innerText.slice(5))) {
            if (!document.querySelector('.style')) {
                maxRes.style.opacity = "100%";
                getBtn.disabled = 'disabled';
                const css = `
            .container form .button, .container .convert-box .to .select-input{
                color: red;
                border: 1px solid red;
                background: none;
            }
            .container form .button:hover, .container .convert-box .to .select-input:hover{
                border: 1px solid red;
                background: none;
            }`;
                let style = document.createElement('style');
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                style.classList.add('style')
                document.getElementsByTagName('head')[0].appendChild(style);
            }

        } else {
            const style = document.querySelector('.style')
            maxRes.style.opacity = "0%";
            if (style) {
                style.parentElement.removeChild(style);
                getBtn.disabled = false;
            }
        }

    } catch (error) {
        exRateTxt.innerText = "Что-то пошло не так...";
    }
}

//https://coinicons-api.vercel.app/api/icon/usdt

// Event listeners for button and exchange icon click


window.addEventListener("load", getExchangeRate);
window.addEventListener("load", getMaxReserve)
window.addEventListener('load', changeMethodGet)
window.addEventListener('load', changeMethodSend)
amount.addEventListener('input', getExchangeRate)

exIcon.addEventListener("click", () => {
    [fromCur.value, toCur.value] = [toCur.value, fromCur.value];
    [fromCur, toCur].forEach((select) => {
        const code = select.value;
        const imgTag = select.parentElement.querySelector("img");
        imgTag.src = `https://coinicons-api.vercel.app/api/icon/${currencyList[code]}`;
    });
    getExchangeRate();
});

fileInput.addEventListener('input', (p) => {
    const file = p.target.files[0]
    let imgRead = new FileReader()
    imgRead.onload = (e) => {
        imgData = e.target.result.split('base64,')[1];
    }
    imgRead.readAsDataURL(file);
})

getBtn.addEventListener('click', async () => {
    const file = document.getElementById('fileInput')
    const fileUrl = window.URL.createObjectURL(file.files[0])
    const sumClient = exRateTxt.innerText.slice(exRateTxt.innerText.indexOf('=') + 2)
    const url = `https://script.google.com/macros/s/AKfycbxNdWI1c0hxR6n13lxtVGP_K7MEq_X5kWM2nCjyTURie2hgDQ9RhiaFQW8-qX4p4sr3/exec?sumGet=${amount.value + ' ' + fromCur.value}&methodSend=${methodGet.innerText}&methodGet=${methodSend}&data=${imgData}&sumClient=${sumClient}`;
    await fetch(url, {
        method: 'POST',
        body: {}
    })
})

fileInput.addEventListener('input', () => {
    const text = fileInput.parentElement.querySelector('.input__file-button-text');
    if (fileInput.files.length == 0) {
        text.innerText = 'Выберите файл'
    } else {
        text.innerText = 'Файл выбран'
    }
})