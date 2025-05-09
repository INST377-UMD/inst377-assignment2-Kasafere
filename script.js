document.addEventListener("DOMContentLoaded", () => {
  // ZenQuotes API
  const quoteText = document.getElementById("quoteText");
  if (quoteText) {
    fetch("https://zenquotes.io/api/random")
      .then((res) => res.json())
      .then((data) => {
        quoteText.innerText = `"${data[0].q}" — ${data[0].a}`;
      })
      .catch(() => {
        quoteText.innerText = "Could not load quote. Try refreshing.";
      });
  }

  // Navigation Buttons
  const stocksBtn = document.getElementById("stocksBtn");
  const dogsBtn = document.getElementById("dogsBtn");
  if (stocksBtn) {
    stocksBtn.addEventListener("click", () => {
      window.location.href = "Assignment2-Stocks.html";
    });
  }
  if (dogsBtn) {
    dogsBtn.addEventListener("click", () => {
      window.location.href = "Assignment2-Dogs.html";
    });
  }

  // Dog Carousel Setup
  const dogCarousel = document.getElementById("dogCarousel");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (dogCarousel && prevBtn && nextBtn) {
    fetch("https://dog.ceo/api/breeds/image/random/10")
      .then((res) => res.json())
      .then((data) => {
        dogCarousel.innerHTML = data.message
          .map((img) => `<img src="${img}" alt="Dog" class="slide-img" />`)
          .join("");
      });

    prevBtn.addEventListener("click", () => {
      dogCarousel.scrollLeft -= 300;
    });

    nextBtn.addEventListener("click", () => {
      dogCarousel.scrollLeft += 300;
    });
  }

  // Dog Breed Buttons + Info
  const breedButtonsContainer = document.getElementById("breedButtons");
  const breedInfo = document.getElementById("breedInfo");
  const breedName = document.getElementById("breedName");
  const breedDesc = document.getElementById("breedDesc");
  const minLife = document.getElementById("minLife");
  const maxLife = document.getElementById("maxLife");

  if (breedButtonsContainer) {
    fetch("https://dogapi.dog/api/v2/breeds")
      .then((res) => res.json())
      .then((data) => {
        data.data.forEach((breed) => {
          const attr = breed.attributes;

          console.log(attr);

          const btn = document.createElement("button");
          btn.textContent = attr.name;
          btn.classList.add("breed-btn");

          btn.addEventListener("click", () => {
            breedInfo.classList.remove("hidden");
            breedName.textContent = `Name: ${attr.name || "N/A"}`;
            breedDesc.textContent = `Description: ${
              attr.description || "No description available."
            }`;

            const min = attr.life?.min;
            const max = attr.life?.max;

            minLife.textContent = min !== undefined ? min : "Not available";
            maxLife.textContent = max !== undefined ? max : "Not available";
          });

          breedButtonsContainer.appendChild(btn);
        });
      });
  }

  // Stocks Page - Chart & Reddit
  const apiKey = "RZCo52vTvXxMdHObMsV9WZ139EWopRZy";
  const stockInput = document.getElementById("stockInput");
  const rangeSelect = document.getElementById("rangeSelect");
  const lookupBtn = document.getElementById("lookupBtn");
  const stockChartCanvas = document.getElementById("stockChart");
  let stockChart = null;

  const renderChart = (labels, prices) => {
    if (stockChart) stockChart.destroy();
    stockChart = new Chart(stockChartCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "$ Stock Price",
            data: prices,
            fill: false,
            borderColor: "blue",
            tension: 0.1,
          },
        ],
      },
    });
  };

  const fetchStockData = async (ticker, days = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const from = startDate.toISOString().split("T")[0];
    const to = endDate.toISOString().split("T")[0];

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const labels = data.results.map((d) =>
        new Date(d.t).toLocaleDateString()
      );
      const prices = data.results.map((d) => d.c);

      renderChart(labels, prices);
    } catch (err) {
      alert("Failed to load stock data. Check the ticker and try again.");
    }
  };

  if (lookupBtn) {
    lookupBtn.addEventListener("click", () => {
      const ticker = stockInput.value;
      const range = parseInt(rangeSelect.value);
      if (ticker) {
        fetchStockData(ticker, range);
      }
    });
  }

  const redditTable = document
    .getElementById("redditTable")
    ?.querySelector("tbody");
  if (redditTable) {
    fetch("https://tradestie.com/api/v1/apps/reddit?date=2022-04-03")
      .then((res) => res.json())
      .then((data) => {
        const top5 = data.slice(0, 5);
        top5.forEach((stock) => {
          const tr = document.createElement("tr");

          const tickerTd = document.createElement("td");
          const link = document.createElement("a");
          link.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
          link.textContent = stock.ticker;
          link.target = "_blank";
          tickerTd.appendChild(link);

          const countTd = document.createElement("td");
          countTd.textContent = stock.no_of_comments;

          const sentimentTd = document.createElement("td");
          const icon = document.createElement("img");
          icon.src =
            stock.sentiment === "Bullish"
              ? "images/bull.png"
              : "images/bear.png";

          icon.alt = stock.sentiment;
          icon.style.width = "40px";
          icon.style.height = "40px";
          sentimentTd.appendChild(icon);

          tr.appendChild(tickerTd);
          tr.appendChild(countTd);
          tr.appendChild(sentimentTd);

          redditTable.appendChild(tr);
        });
      });
  }

  // Voice Commands
  window.activateVoice = function () {
    if (window.annyang) {
      const commands = {
        "load dog breed *name": (name) => {
          const buttons = document.querySelectorAll(".breed-btn");
          buttons.forEach((btn) => {
            if (btn.textContent.toLowerCase() === name.toLowerCase()) {
              btn.click();
            }
          });
        },
        "lookup *ticker": (ticker) => {
          fetchStockData(ticker.trim().toUpperCase(), 30);
        },
        "look up *ticker": (ticker) => {
          fetchStockData(ticker.trim().toUpperCase(), 30);
        },
        "navigate to home": () => (window.location.href = "index.html"),
        "navigate to dogs": () =>
          (window.location.href = "Assignment2-Dogs.html"),
        "navigate to stocks": () =>
          (window.location.href = "Assignment2-Stocks.html"),
        "change the color to *color": (color) => {
          document.body.style.backgroundColor = color;
        },
        hello: () => alert("Hello World"),
      };

      annyang.addCommands(commands);
      annyang.start({ autoRestart: false, continuous: false });
    }
  };

  window.deactivateVoice = function () {
    if (window.annyang) {
      annyang.abort();
    }
  };

  const startBtn = document.querySelector('button[onclick="annyang.start()"]');
  const stopBtn = document.querySelector('button[onclick="annyang.abort()"]');
  if (startBtn) startBtn.onclick = activateVoice;
  if (stopBtn) stopBtn.onclick = deactivateVoice;
});
