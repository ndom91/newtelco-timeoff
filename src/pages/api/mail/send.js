import mail from "./requestMessage"
const db = require("../../../lib/db")
const escape = require("sql-template-strings")
const { format } = require("date-fns")

module.exports = async (req, res) => {
  const {
    to: dateTo,
    from: dateFrom,
    manager,
    type: absenceType,
    name,
    email,
    ah: approvalHash,
    note,
    days,
    files,
  } = req.body
  const to = format(new Date(dateTo), "dd.MM.yyyy")
  const from = format(new Date(dateFrom), "dd.MM.yyyy")
  const type = absenceType.charAt(0).toUpperCase() + absenceType.slice(1)
  const dateToday = new Date().toLocaleDateString("de", {
    year: "numeric",
    day: "2-digit",
    month: "2-digit",
  })
  let mailBody = mail

  const sendMail = (manager, mailBody, name) => {
    const nodemailer = require("nodemailer")
    const nodemailerSmtpTransport = require("nodemailer-smtp-transport")
    const nodemailerDirectTransport = require("nodemailer-direct-transport")

    let nodemailerTransport = nodemailerDirectTransport()
    if (
      process.env.EMAIL_SERVER &&
      process.env.EMAIL_USERNAME &&
      process.env.EMAIL_PASSWORD
    ) {
      nodemailerTransport = nodemailerSmtpTransport({
        host: process.env.EMAIL_SERVER,
        port: process.env.EMAIL_PORT || 25,
        secure: process.env.EMAIL_SECURE || true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
    }

    nodemailer.createTransport(nodemailerTransport).sendMail(
      {
        to: manager,
        from: "device@newtelco.de",
        subject: `[NT] New Absence - ${name}`,
        html: mailBody,
      },
      (err, info) => {
        if (err) {
          console.error("Error sending email to " + name, err)
          res.status(500).json({ code: 500, msg: err })
        }
        res.status(200).json({ code: 200, msg: info })
      }
    )
  }

  let sickBody = ""

  if (type === "Sick") {
    mailBody = mailBody.replace("[TYPE]", `${type} Notification`)
  } else {
    mailBody = mailBody.replace("[TYPE]", `${type} Request`)
  }
  if (note) {
    mailBody = mailBody.replace("[NOTE]", `<h2>Note:</h2><p>${note}<p>`)
  } else {
    mailBody = mailBody.replace("[NOTE]", "")
  }
  mailBody = mailBody.replace("[FROM]", from)
  mailBody = mailBody.replace("[TO]", to)
  mailBody = mailBody.replace("[DATE_TODAY]", dateToday)
  mailBody = mailBody.replace(/NEXTAUTH_URL/g, process.env.NEXTAUTH_URL)
  if (files.length > 0) {
    let filesHtml = "<h3>Uploaded Files</h3>"
    files.forEach((file) => {
      // filesHtml += `<a target="_blank" href="${file.url}">${file.name}</a><br />`
      filesHtml += `<strong>${file.name}</strong><br />`
    })
    filesHtml += `<small>For privacy reasons you can only access the above files in the admin portal</small><br/>`
    mailBody = mailBody.replace("[FILES]", filesHtml)
  } else {
    mailBody = mailBody.replace("[FILES]", "")
  }

  if (type === "Sick") {
    db.query(
      escape`
      SELECT * FROM users WHERE email LIKE ${email}
    `
    ).then((data) => {
      const teamName = data[0].team
      db.query(
        escape`
          SELECT * FROM teams WHERE name LIKE ${teamName}
        `
      ).then((teamData) => {
        const teamAddress = teamData[0].address
        fetch(
          `https://api.crm.newtelco.de/absence/sick?user=${encodeURIComponent(
            name
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.results !== "User Not Found" && data.results.length > 0) {
              data.results.forEach((project, index) => {
                sickBody += `
                      <tr><td><b>DS</b></td><td>${project.id}</td></tr>
                      <tr><td><b>Status</b></td><td>${project.status}</td></tr>
                    `
                if (index !== data.results.length - 1) {
                  sickBody += '<tr><td colspan="2"><hr /></td><tr></tr>'
                }
              })
              sickBody =
                '<table cellpadding="10"><tr><td style="text-align: center" colspan="2"><b>Open Projects</b></td><tr>' +
                sickBody
            }
            sickBody = sickBody + "</table>"
            const headerText = `Please be advised - your colleague, ${name}, will be out sick on the following days.`
            mailBody = mailBody.replace("[HEADER_TEXT]", headerText)
            mailBody = mailBody.replace("[SICKBODY]", sickBody)
            mailBody = mailBody.replace("[APPROVAL_BUTTONS]", "")
            const sentTo = `${manager}; ${teamAddress}`
            sendMail(sentTo, mailBody, name)
          })
          .catch((err) => console.error(err))
      })
    })
  } else {
    const headerText = `Please approve or deny this new ${type} request from <b>${name}</b>.<br /><br /> This user will be notified via email of your decision and upon approval the calendar entry will be created.`
    const approvalButtons = `<table border="0" cellpadding="0" cellspacing="30" role="presentation"> <tr> <td align="center" class="hover-bg-green-600" style="background-color: #67B246; border-radius: 3px;" bgcolor="#67B246"> <a href="${
      process.env.NEXTAUTH_URL
    }/api/mail/response?h=${approvalHash}&a=a${
      type === "Mobileworking" ? "&ho=true" : ""
    }" target="_blank" class="all-font-sans hover-border-green-600" style="border: 1px solid #67B246; border-radius: 2px; display: inline-block; font-size: 20px; padding: 15px 25px; color: #ffffff; text-decoration: none;">Approve</a> </td> <td align="center" class="hover-bg-red-600" style="background-color: #fa2147; border-radius: 3px;" bgcolor="#fa2147"> <a href="${
      process.env.NEXTAUTH_URL
    }/api/mail/response?h=${approvalHash}&a=d${
      type === "Mobileworking" ? "&ho=true" : ""
    }" target="_blank" class="all-font-sans hover-border-red-600" style="border: 1px solid #fa2147; border-radius: 2px; display: inline-block; font-size: 20px; padding: 15px 25px; color: #ffffff; text-decoration: none;">Deny</a> </td> </tr> </table>`
    mailBody = mailBody.replace("[APPROVAL_BUTTONS]", approvalButtons)
    if (type === "Mobileworking") {
      const selectedDays = Object.values(days).reduce((row, day) => {
        if (day) {
          row += "<td align='center'>✅</td>"
        } else {
          row += "<td align='center'>❌</td>"
        }
        return row
      }, "")

      mailBody = mailBody.replace(
        "[SICKBODY]",
        `<table border="0" cellpadding="0" cellspacing="10" role="presentation" class="all-font-sans" style="width: 90%; color: #666666;"><tr><td align='center'>Mon</td><td align='center'>Tue</td><td align='center'>Wed</td><td align='center'>Thu</td><td align='center'>Fri</td></tr>
        <tr>${selectedDays}</tr></table>`
      )
    } else {
      mailBody = mailBody.replace("[SICKBODY]", "")
    }
    mailBody = mailBody.replace("[HEADER_TEXT]", headerText)
    sendMail(manager, mailBody, name)
  }
}
