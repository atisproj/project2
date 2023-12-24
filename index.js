const fromCur = document.querySelector(".from select");
const toCur = document.querySelector(".to select");
const getBtn = document.querySelector("form button");
const exIcon = document.querySelector("form .reverse");
const amount = document.querySelector(".amount input");
const exRateTxt = document.querySelector("form .result");
const method = document.querySelector(".method select");
const maxRes = document.querySelector("form .reserv");
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

for (let i in method_List) {
    const selected = (method_List[i] === 'Alipay') ? "selected" : "";
    method.insertAdjacentHTML("beforeend", `<option value="${method_List[i]}" ${selected}>${method_List[i]}</option>`);
}


// Function max Reserve

async function getMaxReserve() {
    maxRes.innerText = "Max колчиество"
    try{
        const coord = maxReserveList[toCur.value];
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/15dKus_k2TI23_sBnYQjWOfACfijZsk7xJ4CsVMFLMMs/values/sheet3!${coord}?key=AIzaSyB-dszV5PwFcT5yXw-ZQ5dwA3l4YCMfeJE`);
        const resRes = await response.json()
        console.log(resRes)
        maxRes.innerText = "Max: " + resRes.values[0][0];
    } catch(error){
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
            console.log(resStr)
            exchangeRate = parseFloat(resStr.values[0][0]);
        }
        const totalExRate = (amountVal * exchangeRate).toFixed(2);
        exRateTxt.innerText = `${amountVal} ${fromCur.value} = ${totalExRate} ${toCur.value}`;
    } catch (error) {
        exRateTxt.innerText = "Что-то пошло не так...";
    }
}

//https://coinicons-api.vercel.app/api/icon/usdt

// Event listeners for button and exchange icon click

window.addEventListener("load", getExchangeRate);
window.addEventListener("load", getMaxReserve)
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