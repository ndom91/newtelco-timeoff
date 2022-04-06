import response from "./responseMessages"
import moment from "moment-timezone"
import { getSession } from "next-auth/react"

const db = require("../../../lib/db")
const escape = require("sql-template-strings")
const { google } = require("googleapis")

const key = require("../../../../serviceacct.json")

module.exports = async (req, res) => {
  const approvalHash = req.query.h
  const action = req.query.a
  const homeoffice = req.query.ho
  const session = await getSession({ req })

  if (!session) {
    res.writeHead(302, {
      Location: `/auth/signin?h=${approvalHash}&a=${action}&b=0`,
    })
    res.end()
    return
  }

  const nodemailer = require("nodemailer")
  const nodemailerSmtpTransport = require("nodemailer-smtp-transport")
  const nodemailerDirectTransport = require("nodemailer-direct-transport")

  let checkApprovalHash
  if (homeoffice) {
    checkApprovalHash = await db.query(escape`
      SELECT id, name, email, DATE_FORMAT(weekTo, \"%Y-%m-%d\") as toGoogle,  DATE_FORMAT(weekFrom, \"%Y-%m-%d\") as fromGoogle, weekFrom as fromDate, weekTo as toDate, submittedDatetime, manager, approvalHash FROM homeoffice WHERE approvalHash LIKE ${approvalHash}
    `)
  } else {
    checkApprovalHash = await db.query(escape`
      SELECT id, name, email, DATE_FORMAT(toDate, \"%Y-%m-%d\") as toGoogle,  DATE_FORMAT(fromDate, \"%Y-%m-%d\") as fromGoogle, fromDate, toDate, submitted_datetime, manager, approval_hash FROM vacations WHERE approval_hash LIKE ${approvalHash}
    `)
  }

  if (!checkApprovalHash[0].id) {
    res.status(501).json({ code: 501, msg: "Invalid Approval Hash" })
  }

  let mailBody
  let actionLabel
  let approvalValue
  const name = checkApprovalHash[0].name
  const manager = checkApprovalHash[0].manager
  const toDate = new Date(checkApprovalHash[0].toDate).toLocaleDateString(
    "de-DE"
  )
  const fromDate = new Date(checkApprovalHash[0].fromDate).toLocaleDateString(
    "de-DE"
  )
  const submittedOn = new Date(
    checkApprovalHash[0].submitted_datetime
  ).toLocaleString("de-DE")
  const approvedOn = new Date().toLocaleString("de-DE")
  const email = checkApprovalHash[0].email

  if (!homeoffice) {
    if (action === "a") {
      mailBody = response.approval_body
      actionLabel = "Approved"
      approvalValue = "2"
      const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ["https://www.googleapis.com/auth/calendar"]
      )

      jwtClient.authorize(function (err) {
        if (err) {
          console.error(`Error: ${err}`)
        }
      })

      const event = {
        summary: name,
        location: "",
        description: `Submitted On: ${submittedOn}

Manager: ${manager}
Approved On: ${approvedOn}

https://vacation.newtelco.de`,
        attendees: [{ email, responseStatus: "accepted", displayName: name }],
        start: {
          date: checkApprovalHash[0].fromGoogle,
          timeZone: "Europe/Berlin",
        },
        end: {
          date: moment(checkApprovalHash[0].toGoogle)
            .add(1, "days")
            .format("YYYY-MM-DD"),
          timeZone: "Europe/Berlin",
        },
      }
      const calendar = google.calendar("v3")
      calendar.events.insert(
        {
          auth: jwtClient,
          calendarId: process.env.GOOGLE_CAL_ID,
          resource: event,
        },
        function (err, response) {
          if (err) {
            console.error(`Calendar Insert Error: ${err}`)
            return
          }
          if (response.data.status === "confirmed") {
            const gCalId = response.data.id
            db.query(escape`
            UPDATE vacations SET gcal = ${gCalId} WHERE approval_hash LIKE ${approvalHash}
          `)
          }
        }
      )
    } else if (action === "d") {
      mailBody = response.denied_body
      actionLabel = "Denied"
      approvalValue = "1"
    }
  } else {
    if (action === "a") {
      mailBody = response.approval_body
      actionLabel = "Approved"
      approvalValue = "2"
    } else {
      mailBody = response.denied_body
      actionLabel = "Denied"
      approvalValue = "1"
    }
  }

  mailBody = mailBody.replace("[USERNAME]", name)
  mailBody = mailBody.replace("[START]", fromDate)
  mailBody = mailBody.replace("[END]", toDate)
  mailBody = mailBody.replace(/NEXTAUTH_URL/g, process.env.NEXTAUTH_URL)

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

  if (homeoffice) {
    await db.query(escape`
      UPDATE homeoffice SET approved = ${approvalValue}, approvedDatetime = ${new Date()} WHERE approvalHash LIKE ${approvalHash}
    `)
  } else {
    await db.query(escape`
      UPDATE vacations SET approved = ${approvalValue}, approval_datetime = ${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")} WHERE approval_hash LIKE ${approvalHash}
    `)
  }

  nodemailer.createTransport(nodemailerTransport).sendMail(
    {
      to: email,
      from: "device@newtelco.de",
      subject: `[NT] ${
        homeoffice ? "Mobile Office" : "Absence"
      } Response - ${actionLabel}`,
      html: mailBody,
    },
    (err, info) => {
      if (err) {
        console.error("Error sending email to " + name, err)
        res.status(500).json({ code: 500, msg: info })
      }
      res.writeHead(302, {
        Location: `/?a=${action}&code=200&b=1&ho=${
          homeoffice ? "true" : "false"
        }`,
      })
      res.end()
    }
  )
}
