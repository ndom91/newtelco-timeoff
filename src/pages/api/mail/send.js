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

  const nodemailer = require('nodemailer')
  const nodemailerSmtpTransport = require('nodemailer-smtp-transport')
  const nodemailerDirectTransport = require('nodemailer-direct-transport')

  const mailBody = `<!DOCTYPE html><html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"/><style type="text/css">/* CLIENT-SPECIFIC STYLES */ body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}/* Prevent WebKit and Windows mobile changing default text sizes */ table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;}/* Remove spacing between tables in Outlook 2007 and up */ img{-ms-interpolation-mode: bicubic;}/* Allow smoother rendering of resized image in Internet Explorer */ /* RESET STYLES */ img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}table{border-collapse: collapse !important;}body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}/* iOS BLUE LINKS */ a[x-apple-data-detectors]{color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}/* MOBILE STYLES */ @media screen and (max-width: 525px){/* ALLOWS FOR FLUID TABLES */ .wrapper{width: 100% !important; max-width: 100% !important;}/* ADJUSTS LAYOUT OF LOGO IMAGE */ .logo img{margin: 0 auto !important;}/* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */ .mobile-hide{display: none !important;}.img-max{max-width: 100% !important; width: 100% !important; height: auto !important;}/* FULL-WIDTH TABLES */ .responsive-table{width: 100% !important;}/* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */ .padding{padding: 10px 5% 15px 5% !important;}.padding-meta{padding: 30px 5% 0px 5% !important; text-align: center;}.no-padding{padding: 0 !important;}.section-padding{padding: 50px 15px 50px 15px !important;}/* ADJUST BUTTONS ON MOBILE */ .mobile-button-container{margin: 0 auto; width: 100% !important;}.mobile-button{padding: 15px !important; border: 0 !important; font-size: 16px !important; display: block !important;}}/* ANDROID CENTER FIX */ div[style*="margin: 16px 0;"]{margin: 0 !important;}</style></head><body style="margin: 0 !important; padding: 0 !important;"><table border="0" cellpadding="0" cellspacing="0" style="max-width: 600px;" align="center" width="600px"><tr><td bgcolor="#ffffff" align="center" style="padding: 50px 15px 70px 15px;" class="section-padding"><!--[if (gte mso 9)|(IE)]> <table align="center" border="0" cellspacing="0" cellpadding="0" width="600"> <tr> <td align="center" valign="top" width="600"><![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="responsive-table"><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding: 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding"><table cellpadding="10" cellmargin="0" border="0" height="60" width="100%" style="font-family: Helvetica, Arial; border-collapse: collapse; border:5px solid #67B246; color: #fff; font-size: 30px;"><tr><td align="center" valign="center" bgcolor="#67B246">Absence Request</td></tr></table><h3 style="font-size: 18px; text-align:center;font-weight: 900;">New ${type} Request from ${name}</h3> <table width="90%" style="font-family: Helvetica, Arial"><tr> <td> <br/> Please approve or deny this request below. This user will be notified via email of your decision. </td></tr><tr><td style="text-align: center; height: 60px; line-height 60px;">${note}</td></tr></table><table style="margin: 0; margin-top:20px; width: 100%; font-size: 16px;" cellpadding="0" cellspacing="0"><tr><tr><td style="border-top: 5px solid #EDEFF2; border-left: 5px solid #EDEFF2; padding: 16px 8px; font-family: Helvetica, Arial, sans-serif;"><table style="font-family: Helvetica, Arial; margin: 0; width: 100%; font-size: 16px;" cellpadding="0" cellspacing="0"><tr><td><div style="color: #8c8c8c; display: inline-block; font-size: 28px; text-align: center; width: 100%; font-weight: 800; margin-bottom: 5px;">From</div></td></tr><tr><td align="center"><img style="display: block; margin: auto;" src="${process.env.SERVER_URL}/static/img/cal.png"/></td></tr><tr><td><h2 style="color: #8c8c8c; display: inline-block; text-align: center; width: 100%; font-size: 22px; font-weight: 900;" class="dateText">${from}</h2></td></tr></table></td><td style="border-top: 5px solid #EDEFF2; border-right: 5px solid #EDEFF2; padding: 16px 8px; font-family: Helvetica, Arial, sans-serif;"><table style="font-family: Helvetica, Arial; margin: 0; width: 100%; font-size: 16px;" cellpadding="0" cellspacing="0"><tr><td><div style="color: #8c8c8c; display: inline-block; font-size: 28px; text-align: center; width: 100%; font-weight: 800; margin-bottom: 5px;">To</div></td></tr><tr><td align="center"><img style="display: block; margin: auto;" src="${process.env.SERVER_URL}/static/img/cal.png"/></td></tr><tr><td><h2 style="color: #8c8c8c; display: inline-block; text-align: center; width: 100%; font-size: 22px; font-weight: 900;" class="dateText">${to}</h2></td></tr></table></td></tr></tr><tr><td align="center" style="border-top: 5px solid #EDEFF2; padding: 16px 8px; font-family: Helvetica, Arial, sans-serif;"> <table cellpadding="10" cellmargin="0" border="0" height="60" width="178" style="border-collapse: collapse; border:5px solid #ff3232"> <tr><td bgcolor="#ff3232" valign="middle" align="center" width="174"> <div style="font-size: 24px; color: #ffffff; line-height: 1; font-weight: 700; margin: 0; padding: 0; mso-table-lspace:0; mso-table-rspace:0;"><a href="${process.env.SERVER_URL}/api/mail/response?h=${approvalHash}&a=d" style="text-decoration: none; color: #ffffff; border: 0; font-family: Arial, arial, sans-serif; mso-table-lspace:0; mso-table-rspace:0;" border="0">Deny</a> </div></td></tr></table></td><td align="center" style="border-top: 5px solid #EDEFF2; padding: 16px 8px; font-family: Helvetica, Arial, sans-serif;"> <table cellpadding="10" cellmargin="0" border="0" height="60" width="178" style="border-collapse: collapse; border:5px solid #67B246"> <tr><td bgcolor="#67B246" valign="middle" align="center" width="174"> <div style="font-size: 24px; color: #ffffff; line-height: 1; font-weight: 700; margin: 0; padding: 0; mso-table-lspace:0; mso-table-rspace:0;"><a href="${process.env.SERVER_URL}/api/mail/response?h=${approvalHash}&a=a" style="text-decoration: none; color: #ffffff; border: 0; font-family: Arial, arial, sans-serif; mso-table-lspace:0; mso-table-rspace:0;" border="0">Approve</a> </div></td></tr></table></td></tr></table><br/><table cellpadding="10" cellmargin="0" border="0" height="60" width="100%" style="font-family: Helvetica, Arial; border-collapse: collapse; border:5px solid #67B246; color: #fff;"><tr><td align="center" valign="center" bgcolor="#67B246">NewTelco Gmbh <b>|</b> ${dateToday}<b> |</b> ndom91 </td></tr></table></td></tr></table></td></tr><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding: 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding"></td></tr></table></td></tr></table></td></tr></table><!--[if (gte mso 9)|(IE)]> </td></tr></table><![endif]--></td></tr></table></body></html>`

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
    }, (err, info) => {
      if (err) {
        console.error('Error sending email to ' + name, err)
        res.status(500).json({ code: 500, msg: err })
      }
      // put approvalHash in DB
      res.status(200).json({ code: 200, msg: info })
    })
}
