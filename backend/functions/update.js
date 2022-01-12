/* global context */
Array.prototype.forEachAsync = async function (fn) {
  for (let t of this) {
    await fn(t)
  }
}

function arraysEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

async function sendEmail(name, domain) {
  if (domain.current === null || domain.prev === null) {
    return
  }

  const smtpHost = context.values.get("smtpHost")
  const smtpUser = context.values.get("smtpUser")
  const smtpPassword = context.values.get("smtpPassword")
  const smtpFrom = context.values.get("smtpFrom")

  const nodemailer = require("nodemailer")
  if (
    smtpHost === null ||
    typeof smtpHost === "undefined" ||
    smtpUser === null ||
    typeof smtpUser === "undefined" ||
    smtpPassword === null ||
    typeof smtpPassword === "undefined" ||
    smtpFrom === null ||
    typeof smtpFrom === "undefined"
  ) {
    let missingFields = []
    if (smtpHost === null || typeof smtpHost === "undefined") {
      missingFields.push("smtpHost")
    }
    if (smtpUser === null || typeof smtpUser === "undefined") {
      missingFields.push("smtpUser")
    }
    if (smtpPassword === null || typeof smtpPassword === "undefined") {
      missingFields.push("smtpPassword")
    }
    if (smtpFrom === null || typeof smtpFrom === "undefined") {
      missingFields.push("smtpFrom")
    }
    console.error(
      `Missing properties in the SMTP configuration: ${missingFields.join(
        ","
      )}.`
    )
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  const changes = []
  if (!arraysEqual(domain.current.status, domain.prev.status)) {
    changes.push("Domain Status")
    changes.push("-------------")
    changes.push(`was: ${domain.prev.status.join(", ")}`)
    changes.push(`now: ${domain.current.status.join(", ")}`)
    changes.push("")
  }

  if (!arraysEqual(domain.current.nameServer, domain.prev.nameServer)) {
    changes.push("Name Server")
    changes.push("-------------")
    changes.push(`was: ${domain.prev.nameServer.join(", ").toLowerCase()}`)
    changes.push(`now: ${domain.current.nameServer.join(", ").toLowerCase()}`)
    changes.push("")
  }

  if (domain.current.expiry !== domain.prev.expiry) {
    changes.push("Expiry Date")
    changes.push("-------------")
    changes.push(`was: ${domain.prev.expiry}`)
    changes.push(`now: ${domain.current.expiry}`)
  }

  const text = `Hi,
  
Some information about the ${name} domain has changed:

${changes.join("\n")}

The Domain Monitor
  `

  const message = {
    from: smtpFrom,
    to: domain.notificationEmail,
    subject: "Domain information updated",
    text: text,
  }

  console.log(`Sending email to ${domain.notificationEmail}`)
  return await transporter.sendMail(message)
}

exports = async function update(updateAll) {
  const whoiserer = require("whoiserer")
  const cluster = context.services.get("mongodb-atlas")
  const collection = cluster.db("domain-monitor").collection("domains")

  const dateFrom =
    typeof updateAll !== "undefined"
      ? new Date()
      : new Date(Date.now() - 24 * 60 * 60 * 1000)

  console.log(`Updating records with the update date less than: ${dateFrom}`)

  const domains = await collection
    .find({ updated: { $lt: dateFrom } })
    .toArray()

  domains.forEachAsync(async (domain) => {
    const whoisResult = await whoiserer(domain.name, { follow: 1 })
    const current = {
      isAvailable: whoisResult.isAvailable,
      status: whoisResult.status,
      nameServer: whoisResult.nameServer,
      expiry: whoisResult.expiry,
    }

    const changed = JSON.stringify(domain.current) !== JSON.stringify(current)
    let update = changed
      ? {
          prev: domain.current,
          current: current,
          updated: new Date(),
        }
      : { updated: new Date() }

    console.log(`Updating ${domain.name}, changed = ${changed}`)

    if (changed) {
      update = { ...update, notificationSent: new Date() }
      await sendEmail(domain.notificationEmail, { ...domain, ...update })
    }

    await collection.updateOne({ _id: domain._id }, { $set: update })
  })
}
