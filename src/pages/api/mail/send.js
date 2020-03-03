import fetch from 'isomorphic-unfetch'
import mail from './requestMessage'
const db = require('../../../lib/db')
const escape = require('sql-template-strings')
# require('dotenv').config({ path: './.env' })

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const to = new Date(body.to).toLocaleDateString('de-DE')
  const from = new Date(body.from).toLocaleDateString('de-DE')
  const manager = body.manager
  const type = body.type.charAt(0).toUpperCase() + body.type.slice(1)
  const name = body.name
  const email = body.email
  const approvalHash = body.ah
  const dateToday = new Date().toLocaleDateString('de', { year: 'numeric', day: '2-digit', month: '2-digit' })
  const note = body.note
  let mailBody = mail
  const files = body.files

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
        subject: `[NT] New Absence - ${name}`,
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

  if (type === 'Sick') {
    mailBody = mailBody.replace('[TYPE]', `${type} Notification`)
  } else {
    mailBody = mailBody.replace('[TYPE]', `${type} Request`)
  }
  mailBody = mailBody.replace('[NAME]', name)
  if (note) {
    mailBody = mailBody.replace('[NOTE]', `<br><h3>Note:</h3>${note}`)
  } else {
    mailBody = mailBody.replace('[NOTE]', '')
  }
  mailBody = mailBody.replace('[FROM]', from)
  mailBody = mailBody.replace('[TO]', to)
  mailBody = mailBody.replace('[DATE_TODAY]', dateToday)
  mailBody = mailBody.replace(/SERVER_URL/g, process.env.SERVER_URL)
  if (files.length > 0) {
    let filesHtml = '<h3>Uploaded Files</h3>'
    files.forEach(file => {
      filesHtml += `<a target="_blank" href="${file.url}">${file.name}</a><br />`
    })
    mailBody = mailBody.replace('[FILES]', filesHtml)
  } else {
    mailBody = mailBody.replace('[FILES]', '')
  }

  if (type === 'Sick') {
    db.query(escape`
      SELECT * FROM users WHERE email LIKE ${email}
    `)
      .then(data => {
        const teamName = data[0].team
        db.query(escape`
          SELECT * FROM teams WHERE name LIKE ${teamName}
        `)
          .then(teamData => {
            const teamAddress = teamData[0].address
            fetch(`https://api.crm.newtelco.de/absence/sick?user=${encodeURIComponent(name)}`)
              .then(res => res.json())
              .then(data => {
                if (data.results.length > 0) {
                  data.results.forEach((project, index) => {
                    sickBody += `
                      <tr><td><b>DS</b></td><td>${project.id}</td></tr> 
                      <tr><td><b>Status</b></td><td>${project.status}</td></tr> 
                    `
                    if (index !== data.results.length - 1) { sickBody += '<tr><td colspan="2"><hr /></td><tr></tr>' }
                  })
                  sickBody = '<table cellpadding="10"><tr><td style="text-align: center" colspan="2"><b>Open Projects</b></td><tr>' + sickBody
                }
                sickBody = sickBody + '</table>'
                const headerText = 'Please be advised, your colleague has notified you of the following sick days.'
                mailBody = mailBody.replace('[HEADER_TEXT]', headerText)
                mailBody = mailBody.replace('[SICKBODY]', sickBody)
                mailBody = mailBody.replace('[APPROVAL_BUTTONS]', '</td><td align="center" style="border-top: 5px solid #EDEFF2; padding: 16px 8px; font-family: Helvetica, Arial, sans-serif;">')
                const sentTo = `${manager}; ${teamAddress}`
                sendMail(sentTo, mailBody, name)
              })
              .catch(err => console.error(err))
          })
      })
  } else {
    const headerText = 'Please approve or deny this request below. This user will be notified via email of your decision.'
    const approvalButtons = `<table cellpadding="10" cellmargin="0" border="0" height="60" width="178" style="border-collapse: collapse; border:5px solid #ff3232"> <tr><td bgcolor="#ff3232" valign="middle" align="center" width="174"> <div style="font-size: 24px; color: #ffffff; line-height: 1; font-weight: 700; margin: 0; padding: 0; mso-table-lspace:0; mso-table-rspace:0;"><a href="${process.env.SERVER_URL}/api/mail/response?h=${approvalHash}&a=d" style="text-decoration: none; color: #ffffff; border: 0; font-family: Arial, arial, sans-serif; mso-table-lspace:0; mso-table-rspace:0;" border="0">Deny</a> </div></td></tr></table></td><td align="center" style="border-top: 5px solid #EDEFF2; padding: 16px 8px; font-family: Helvetica, Arial, sans-serif;"><table cellpadding="10" cellmargin="0" border="0" height="60" width="178" style="border-collapse: collapse; border:5px solid #67B246"> <tr><td bgcolor="#67B246" valign="middle" align="center" width="174"> <div style="font-size: 24px; color: #ffffff; line-height: 1; font-weight: 700; margin: 0; padding: 0; mso-table-lspace:0; mso-table-rspace:0;"><a href="${process.env.SERVER_URL}/api/mail/response?h=${approvalHash}&a=a" style="text-decoration: none; color: #ffffff; border: 0; font-family: Arial, arial, sans-serif; mso-table-lspace:0; mso-table-rspace:0;" border="0">Approve</a> </div></td></tr></table>`
    mailBody = mailBody.replace('[APPROVAL_BUTTONS]', approvalButtons)
    mailBody = mailBody.replace('[SICKBODY]', '')
    mailBody = mailBody.replace('[HEADER_TEXT]', headerText)
    sendMail(manager, mailBody, name)
  }
}
