const BACKEND = "https://YOUR_BACKEND_URL"

const PRODUCTS = [
  { id: 'A1', name: 'COLA', price: 20 },
  { id: 'A2', name: 'LAYS', price: 15 },
  { id: 'B1', name: 'KITKAT', price: 25 },
  { id: 'B2', name: 'WATER', price: 10 },
]

let cart = {}

// Render products
function renderProducts() {
  const el = document.getElementById("products")

  el.innerHTML = PRODUCTS.map(p => `
    <div class="card ${cart[p.id] ? 'selected' : ''}"
         onclick="toggle('${p.id}')">
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
    </div>
  `).join('')
}

// Toggle item
function toggle(id) {
  if (cart[id]) delete cart[id]
  else cart[id] = 1

  update()
}

// Update UI
function update() {
  renderProducts()

  const cartEl = document.getElementById("cart")

  const items = PRODUCTS.filter(p => cart[p.id])

  if (items.length === 0) {
    cartEl.innerHTML = "No items"
  } else {
    cartEl.innerHTML = items.map(p =>
      `<div>${p.name} x${cart[p.id]}</div>`
    ).join('')
  }

  const total = getTotal()
  document.getElementById("total").innerText = total

  document.getElementById("payBtn").disabled = total === 0
}

// Total
function getTotal() {
  return PRODUCTS.reduce((sum, p) =>
    sum + (cart[p.id] ? p.price * cart[p.id] : 0), 0)
}

// Reset
function resetCart() {
  cart = {}
  update()
}

// 💳 PAYMENT
async function payNow() {
  const amount = getTotal()

  // Step 1: create order
  const res = await fetch(`${BACKEND}/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  })

  const order = await res.json()

  // Step 2: open Razorpay
  const options = {
    key: "YOUR_RAZORPAY_KEY",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    handler: async function (response) {

      // Step 3: verify payment
      await fetch(`${BACKEND}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...response,
          cart
        })
      })

      alert("✅ Payment successful!\nDispensing...")

      resetCart()
    }
  }

  const rzp = new Razorpay(options)
  rzp.open()
}

// Init
update()