const whoiser = require("whoiser")
module.exports = async function whoiserer(name, options) {

    let whoisData = {}
    try {
        const whoiserResponse = await whoiser.domain(name, options)
        whoisData = whoiserResponse[Object.keys(whoiserResponse)[0]]
    } catch (e) {
        return e;
    }

    const isAvailable = (() => {
        if (Object.keys(whoisData).length === 0) {
            return true
        }

        const text = whoisData["text"]
        if (!/\S/.test(text) || /not found|no match/i.test(text)) {
            return true
        }

        const status = whoisData["Domain Status"]
        if (
            Array.isArray(status) &&
            (status.length === 0 ||
                status.includes("available") ||
                status.includes("free"))
        ) {
            return true
        }

        return false
    })()

    return {
        name,
        isAvailable,
        expiry: whoisData.hasOwnProperty("Expiry Date")
            ? new Date(Date.parse(whoisData["Expiry Date"]))
            : undefined,
        created: whoisData.hasOwnProperty("Created Date")
            ? new Date(Date.parse(whoisData["Created Date"]))
            : undefined,
        updated: whoisData.hasOwnProperty("Updated Date")
            ? new Date(Date.parse(whoisData["Updated Date"]))
            : undefined,
        status: whoisData["Domain Status"],
        nameServer: whoisData["Name Server"],
    }
};