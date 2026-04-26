const express = require('express')
const crypto = require('crypto')
const cors = require('cors')

const razorpay = require('./razorpay')
const mqttClient = require('./mqttClient')
const { convertCart } = require('./utils')

const app = express()
app.use(express.json())
app.use(cors())

// ✅ Create order
app.post('/create-order', async (req, res) => {
  const { amount } = req.body

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: "rcpt_" + Date.now()
  })

  res.json(order)
})

// ✅ Verify payment
app.post('/verify-payment', (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cart
  } = req.body

  const body = razorpay_order_id + "|" + razorpay_payment_id

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return res.status(400).send("Invalid signature")
  }

  console.log("✅ Payment Verified")

  // 🔥 Send MQTT to ESP32
  mqttClient.publish("vendbot/order", JSON.stringify({
    transactionId: razorpay_payment_id,
    items: convertCart(cart)
  }))

  res.send({ status: "success" })
})

app.listen(3000, () => console.log("🚀 Server running"))