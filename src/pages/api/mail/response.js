import response from './responseMessages'
const db = require('../../../lib/db')
const escape = require('sql-template-strings')
require('dotenv').config({ path: './.env' })

module.exports = async (req, res) => {
  const approvalHash = req.query.h
  const action = req.query.a

  const nodemailer = require('nodemailer')
  const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
  const nodemailerDirectTransport = require('nodemailer-direct-transport')

  const checkApprovalHash = await db.query(escape`
    SELECT id, name, email, fromDate, toDate, approval_hash FROM vacations WHERE approval_hash LIKE ${approvalHash}
  `)

  if (checkApprovalHash[0].id) {
    let mailBody
    let actionLabel
    const name = checkApprovalHash[0].name
    const toDate = new Date(checkApprovalHash[0].toDate).toLocaleDateString('de-DE')
    const fromDate = new Date(checkApprovalHash[0].fromDate).toLocaleDateString('de-DE')
    const email = checkApprovalHash[0].email

    if (action === 'a') {
      mailBody = response.approval_body
      actionLabel = 'Approved'
    } else if (action === 'd') {
      mailBody = response.denied_body
      actionLabel = 'Denied'
    }

    mailBody = mailBody.replace('[USERNAME]', name)
    mailBody = mailBody.replace('[START]', fromDate)
    mailBody = mailBody.replace('[END]', toDate)
    mailBody = mailBody.replace(/SERVER_URL/g, process.env.SERVER_URL)

    let nodemailerTransport = nodemailerDirectTransport()
    if (process.env.EMAIL_SERVER && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      nodemailerTransport = nodemailerSmtpTransport({
        host: process.env.EMAIL_SERVER,
        port: process.env.EMAIL_PORT || 25,
        secure: process.env.EMAIL_SECURE || true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      })
    }

    nodemailer
      .createTransport(nodemailerTransport)
      .sendMail({
        to: email,
        from: 'device@newtelco.de',
        subject: `[NT] Absence Response - ${actionLabel}`,
        html: mailBody
      }, (err, info) => {
        if (err) {
          console.error('Error sending email to ' + name, err)
          res.status(500).json({ code: 500, msg: err })
        }
        res.status(200).json({ code: 200, msg: info })
      })
  } else {
    res.status(501).json({ code: 501, msg: 'Invalid Approval Hash' })
  }
}
