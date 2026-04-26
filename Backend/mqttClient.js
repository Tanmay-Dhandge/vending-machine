const mqtt = require('mqtt')

const client = mqtt.connect('mqtts://366c887e88bf40c496821b5e646d3a12.s1.eu.hivemq.cloud', {
  port: 8883,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  rejectUnauthorized: true
})

client.on('connect', () => console.log("✅ MQTT Connected"))

module.exports = client