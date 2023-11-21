//Aula 02 Indicadores
//Médias Móveis

const axios = require("axios");
const crypto = require("crypto");

const API_URL = "https://testnet.binance.vision";//URL de produção: "https://api.binance.com";
const SYMBOL = "BTCUSDT";
const BUY_PRICE = 100000;
const SELL_PRICE = 100000;
const QUANTITY = "0.001";
const API_KEY = "bGGhPSsx9ZzgnnS2ZYclBsVjW1l7raAmnoN7VDZ3XWhOK2qC2Ttr7djpoyJVxmEm";//aprenda a criar as chaves: https://www.youtube.com/watch?v=-6bF6a6ecIs
const SECRET_KEY = "qAK1ZuQ2gS4XMao6psqG0NsPmsjinyFnW9M8NtmjYDtVBwoCHb2fDu6gWkTUBB5p";

let isOpened = false;

async function start() {
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    const price = parseFloat(candle[4]);
    if (!isOpened) {
        console.clear();
    }
    
    console.log("Price now: " + price);

    const sma = calcSMA(data);
    console.log("SMA now: " + sma);
    console.log("Is Opened? " + isOpened);
    if (isOpened)
        console.log("Sell Price: " + SELL_PRICE);
    else
        console.log("Buy Price: " + BUY_PRICE);

    if (price < (sma * 0.95) && !isOpened) {
        console.log("Comprar!");
        newOrder(SYMBOL, QUANTITY, "BUY");
        isOpened = true;
    }
    else if (price > (sma * 1.05) && isOpened) {
        console.log("Vender!");
        newOrder(SYMBOL, QUANTITY, "SELL");
        isOpened = false;
    }
}

function calcSMA(candles) {
    const closes = candles.map(c => parseFloat(c[4]));
    const sum = closes.reduce((a, b) => a + b);
    return sum / closes.length;
}

async function newOrder(symbol, quantity, side) {
    const order = { symbol, quantity, side };
    order.type = "MARKET";
    order.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest("hex");

    order.signature = signature;

    try {
        const { data } = await axios.post(
            API_URL + "/api/v3/order",
            new URLSearchParams(order).toString(),
            {
                headers: { "X-MBX-APIKEY": API_KEY }
            });

        console.log(data);
    } catch (err) {
        //para erros e soluções com essa API
        console.error(err.response.data);
    }
}

setInterval(start, 3000);

start();