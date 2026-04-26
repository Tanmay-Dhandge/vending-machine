function convertCart(cart) {
  return Object.keys(cart).map(id => ({
    slot: id,
    qty: cart[id]
  }))
}

module.exports = { convertCart }