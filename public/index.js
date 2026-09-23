// public/index.js
const priceDisplay = document.getElementById("price-display");
const connectionStatus = document.getElementById("connection-status");
const form = document.querySelector("form");
const investmentAmountInput = document.getElementById("investment-amount");
const dialog = document.querySelector(".outputs");
const dialogSummary = document.getElementById("investment-summary");
const closeDialogBtn = dialog.querySelector("button");

let currentPrice = null;

// Connect to Server Sent Events for Live Pricing
const eventSource = new EventSource("/stream-prices");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  currentPrice = data.price;
  priceDisplay.textContent = currentPrice.toFixed(2);

  // Update status to Live
  connectionStatus.innerHTML = 'Live prices <span aria-hidden="true">🟢</span>';
  connectionStatus.style.color = "var(--gold)";
};

eventSource.onerror = () => {
  // Update status to Disconnected
  connectionStatus.innerHTML =
    'Disconnected <span aria-hidden="true">🔴</span>';
  connectionStatus.style.color = "#ff4c4c";
  priceDisplay.textContent = "----.--";
  currentPrice = null;
};

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(investmentAmountInput.value);

  if (!currentPrice) {
    alert("Cannot process investment while disconnected from live prices.");
    return;
  }

  try {
    const response = await fetch("/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, priceAtPurchase: currentPrice }),
    });

    if (response.ok) {
      const result = await response.json();
      dialogSummary.innerText = `You just bought ${result.ounces.toFixed(4)} ounces (ozt) for £${amount.toFixed(2)}.\nYou will receive documentation shortly.`;
      dialog.showModal();
      investmentAmountInput.value = "";
    } else {
      alert("An error occurred during purchase.");
    }
  } catch (error) {
    console.error("Purchase failed:", error);
  }
});

// Close Dialog
closeDialogBtn.addEventListener("click", () => {
  dialog.close();
});
