exports = async function whois(name) {
  const whoiserer = require("whoiserer")
  return await whoiserer(name, { follow: 1 })
}
