const symbols = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "ADAUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOTUSDT",
  "DOGEUSDT",
  "SHIBUSDT",
  "LTCUSDT",
];

const coinGeckoIds = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  BNBUSDT: "binancecoin",
  ADAUSDT: "cardano",
  SOLUSDT: "solana",
  XRPUSDT: "ripple",
  DOTUSDT: "polkadot",
  DOGEUSDT: "dogecoin",
  SHIBUSDT: "shiba-inu",
  LTCUSDT: "litecoin",
};

async function fetchCryptoData() {
  const tableBody = document.getElementById("cryptoData");
  tableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

  try {
    const [binanceData, coinGeckoData] = await Promise.all([
      Promise.all(
        symbols.map((symbol) =>
          fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
          ).then((response) => response.json())
        )
      ),
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" +
          Object.values(coinGeckoIds).join(",")
      ).then((response) => response.json()),
    ]);

    const iconMap = new Map(
      coinGeckoData.map((coin) => [
        coin.symbol.toUpperCase() + "USDT",
        coin.image,
      ])
    );
    // Sort binanceData by highPrice in descending order
    binanceData.sort(
      (a, b) => parseFloat(b.highPrice) - parseFloat(a.highPrice)
    );

    tableBody.innerHTML = "";
    binanceData.forEach((crypto, index) => {
      const iconUrl = iconMap.get(crypto.symbol) || "";

      const row = `
                  <tr>
                      <td>
                          ${index++ + 1}.
                          </td>
                      <td>
                          <img src="${iconUrl}" alt="${
        crypto.symbol
      }" class="crypto-icon">
                          ${crypto.symbol}
                      </td>
                      <td>${moneyFormatter(crypto.lowPrice)}</td>
                      <td>${moneyFormatter(crypto.highPrice)}</td>
                      <td>${moneyFormatter(crypto.lastPrice)}</td>
                      <td>${moneyFormatter(crypto.volume)}</td>
                      <td class="${
                        parseFloat(crypto.priceChange) >= 0
                          ? "positive"
                          : "negative"
                      }">
                          ${moneyFormatter(crypto.priceChange)}
                      </td>
                      <td class="${
                        parseFloat(crypto.priceChangePercent) >= 0
                          ? "positive"
                          : "negative"
                      }">
                          ${moneyFormatter(crypto.priceChangePercent)}%
                      </td>
                      <td>${new Date(crypto.closeTime).toLocaleString()}</td>
                  </tr>
              `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error:", error);
    tableBody.innerHTML =
      '<tr><td colspan="8">Error fetching data. Please try again later.</td></tr>';
  }
}
// Countdown timer
function startCountdown(duration) {
  let timer = duration,
    minutes,
    seconds;
  const countdownElement = document.getElementById("countdown");

  const interval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    countdownElement.textContent = minutes + ":" + seconds;

    if (--timer < 0) {
      clearInterval(interval);
      fetchCryptoData();
      startCountdown(duration); // Restart countdown after fetching data
    }
  }, 1000);
}

// Fetch data initially and then every 60 seconds
fetchCryptoData();
startCountdown(60); // 60 seconds countdown
// setInterval(fetchCryptoData, 60000);

// money formatter
function moneyFormatter(num) {
  if (num === undefined || num === null || num === "") {
    return num;
  }

  const _number = parseFloat(num);

  // Handle exponential notation
  if (num.toString().includes("e")) {
    return _number.toFixed(7);
  }

  // Split the number into integer and decimal parts
  const parts = _number.toString().split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] || "";

  // Format the integer part with commas
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Determine how to handle the decimal part
  let formattedDecimalPart = "";
  if (decimalPart) {
    if (decimalPart.length <= 2) {
      // If there are 1 or 2 decimal places, keep them as is
      formattedDecimalPart = "." + decimalPart.padEnd(2, "0");
    } else if (decimalPart.slice(2).replace(/0+$/, "").length > 0) {
      // If there are non-zero digits after the second decimal place, keep all decimal places
      formattedDecimalPart = "." + decimalPart;
    } else {
      // Otherwise, keep only two decimal places
      formattedDecimalPart = "." + decimalPart.slice(0, 2);
    }
  } else {
    // If there's no decimal part, add .00
    formattedDecimalPart = ".00";
  }

  return formattedIntegerPart + formattedDecimalPart;
}
