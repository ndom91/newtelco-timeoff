require('dotenv').config({ path: './.env' })

module.exports = async (req, res) => {
  const to = req.query.to
  const from = req.query.from
  const days = req.query.days
  const manager = req.query.manager
  const type = req.query.type
  const name = req.query.name

  const nodemailer = require('nodemailer')
  const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
  const nodemailerDirectTransport = require('nodemailer-direct-transport')

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
      subject: `Requested Vacation - ${name}`,
      text: `Use the link below to sign in:\n\n${to}\n\n`,
      html: `<p>Use the link below to sign in:</p><p>${from}</p>`
    }, (err) => {
      if (err) {
        console.error('Error sending email to ' + name, err)
      }
    })
  res.status(200).json({ msg: 'Success!' })
}
