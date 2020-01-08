
require('dotenv').config({ path: './.env' })

module.exports = async (req, res) => {
  const to = new Date(req.query.to).toLocaleDateString('de-DE')
  const from = new Date(req.query.from).toLocaleDateString('de-DE')
  const manager = req.query.manager
  const type = req.query.type.charAt(0).toUpperCase() + req.query.type.slice(1)
  const name = req.query.name
  const dateToday = new Date().toLocaleDateString('de', { year: 'numeric', day: '2-digit', month: '2-digit' })
  const note = ''

  const nodemailer = require('nodemailer')
  const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
  const nodemailerDirectTransport = require('nodemailer-direct-transport')

  // check DB if approvalHash is correct
  // send mail to requesting User informing of decision.

  const mailBody = ''

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
      to: manager,
      from: 'device@newtelco.de',
      subject: `New Absence Request - ${name}`,
      html: mailBody
    }, (err, info) => {
      if (err) {
        console.error('Error sending email to ' + name, err)
        res.status(500).json({ code: 500, msg: err })
      }
      res.status(200).json({ code: 200, msg: info })
    })
}
