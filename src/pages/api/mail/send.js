import fetch from 'isomorphic-unfetch'
import mail from './requestMessage'
require('dotenv').config({ path: './.env' })

module.exports = async (req, res) => {
  const to = new Date(req.query.to).toLocaleDateString('de-DE')
  const from = new Date(req.query.from).toLocaleDateString('de-DE')
  const manager = req.query.manager
  const type = req.query.type.charAt(0).toUpperCase() + req.query.type.slice(1)
  const name = req.query.name
  const approvalHash = req.query.ah
  const dateToday = new Date().toLocaleDateString('de', { year: 'numeric', day: '2-digit', month: '2-digit' })
  const note = ''
  let mailBody = mail

  const sendMail = (manager, mailBody, name) => {
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
        subject: `[NT] New Absence Request - ${name}`,
        html: mailBody
        // attachments: [
        //   {
        //     name: fileName,
        //     path: `./tmp/${fileName}`
        //   }
        // ]
      }, (err, info) => {
        if (err) {
          console.error('Error sending email to ' + name, err)
          res.status(500).json({ code: 500, msg: err })
        }
        // put approvalHash in DB
        res.status(200).json({ code: 200, msg: info })
      })
  }

  let sickBody = ''

  mailBody = mailBody.replace('[TYPE]', type)
  mailBody = mailBody.replace('[NAME]', name)
  mailBody = mailBody.replace('[NOTE]', note)
  mailBody = mailBody.replace('[FROM]', from)
  mailBody = mailBody.replace('[TO]', to)
  mailBody = mailBody.replace('[DATE_TODAY]', dateToday)
  mailBody = mailBody.replace(/SERVER_URL/g, process.env.SERVER_URL)
  mailBody = mailBody.replace(/APPROVAL_HASH/g, approvalHash)

  if (type === 'Sick') {
    fetch(`https://api.crm.newtelco.de/absence/sick?user=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        data.results.forEach(project => {
          sickBody += `
            <tr><td><b>DS</b></td><td>${project.id}</td></tr> 
            <tr><td><b>Status</b></td><td>${project.status}</td></tr> 
            <tr><td colspan="2"><hr /></td><tr>
          `
        })
        sickBody = '<table><tr><td style="text-align: center" colspan="2"><b>Open Projects</b></td><tr>' + sickBody
        sickBody = sickBody + '</table>'

        mailBody = mailBody.replace('[SICKBODY]', sickBody)
        sendMail(manager, mailBody, name)
      })
      .catch(err => console.error(err))
  } else {
    sendMail(manager, mailBody, name)
  }
}
