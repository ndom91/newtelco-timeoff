import response from './responseMessages'
const db = require('../../../lib/db')
const escape = require('sql-template-strings')
// require("dotenv").config({ path: "./.env" });

module.exports = async (req, res) => {
  const approvalHash = req.query.h
  const action = req.query.a
  const forward = req.query.b

  if (!req.session.google) {
    req.session.save(err => {
      if (err) console.error(err)
      req.session.returnTo = req._parsedUrl.query
      // console.log('Session Before Redirect: ', req.session)
      res.redirect('/')
    })
    return
  }

  const nodemailer = require('nodemailer')
  const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
  const nodemailerDirectTransport = require('nodemailer-direct-transport')

  const checkApprovalHash = await db.query(escape`
    SELECT id, name, email, fromDate, toDate, approval_hash FROM vacations WHERE approval_hash LIKE ${approvalHash}
  `)

  if (checkApprovalHash[0].id) {
    let mailBody
    let actionLabel
    let approvalValue
    const name = checkApprovalHash[0].name
    const toDate = new Date(checkApprovalHash[0].toDate).toLocaleDateString(
      'de-DE'
    )
    const fromDate = new Date(checkApprovalHash[0].fromDate).toLocaleDateString(
      'de-DE'
    )
    const email = checkApprovalHash[0].email

    if (action === 'a') {
      mailBody = response.approval_body
      actionLabel = 'Approved'
      approvalValue = '2'
    } else if (action === 'd') {
      mailBody = response.denied_body
      actionLabel = 'Denied'
      approvalValue = '1'
    }

    mailBody = mailBody.replace('[USERNAME]', name)
    mailBody = mailBody.replace('[START]', fromDate)
    mailBody = mailBody.replace('[END]', toDate)
    mailBody = mailBody.replace(/SERVER_URL/g, process.env.SERVER_URL)

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
          pass: process.env.EMAIL_PASSWORD
        }
      })
    }

    const updateApproval = await db.query(escape`
      UPDATE vacations SET approved = ${approvalValue}, approval_datetime = ${new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')} WHERE approval_hash LIKE ${approvalHash}
    `)

    nodemailer.createTransport(nodemailerTransport).sendMail(
      {
        to: email,
        from: 'device@newtelco.de',
        subject: `[NT] Absence Response - ${actionLabel}`,
        html: mailBody
      },
      (err, info) => {
        if (err) {
          console.error('Error sending email to ' + name, err)
          if (forward != 0) {
            res.status(500).redirect(`/?a=${action}&code=500`)
          } else {
            res.status(500).json({ code: 500, msg: info })
          }
        }
        if (forward != 0) {
          res.redirect(`/?a=${action}&code=200`)
        } else {
          res.status(200).json({ code: 200, a: action })
        }
      }
    )
  } else {
    res.status(501).json({ code: 501, msg: 'Invalid Approval Hash' })
  }
}
