import { fs } from 'fs'
import formidable from 'formidable'
import { google } from 'googleapis'

export const config = {
  api: {
    bodyParser: false
  }
}

module.exports = async (req, res) => {
  // const test = req.pipe(createWriteStream(`./tmp/${req.query.fn}`))
  // form.parse(req, function (err, fields, files) {
  //   if (err) console.error(err)
  //   console.log(files, fields)
  //   // res.end()
  // })
  const stream = require('stream')
  const fileObject = req.body
  const bufferStream = new stream.PassThrough()
  bufferStream.end(fileObject.buffer)
  const serviceAccount = require('./serviceacct.json')
  // const jWTClient = new google.auth.JWT(
  //   serviceAccount.client_email,
  //   null,
  //   serviceAccount.private_key,
  //   ['https://www.googleapis.com/auth/drive.file']
  // )
  // const client = await google.auth.getClient({
  //   keyFile: './serviceacct.json',
  //   scopes: 'https://www.googleapis.com/auth/drive.file'
  // })
  const auth = new google.auth.GoogleAuth({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: 'https://www.googleapis.com/auth/drive.file'
  })
  const authClient = await auth.getClient()

  google.drive({ version: 'v3', auth: authClient })
    .files.create({
      media: {
        mimeType: 'application/pdf',
        body: bufferStream
      },
      requestBody: {
        name: 'test.pdf',
        mimeType: 'application/pdf',
        parents: ['1KhdyTRkPyiOtRNRFk2gBIQrAW8VSPz5e'] // ID of the folder that you created.
      },
      fields: 'id'
    }).then(function (resp) {
      console.log(resp, 'resp')
    }).catch(function (error) {
      console.log(error)
    })

  // const form = new formidable.IncomingForm()
  // form.parse(req, function (err, fields, files) {
  //   if (err) console.error(err)
  //   console.log(files)
  //   res.end()
  // })
  // const form = new formidable.IncomingForm()
  // form.parse(req, function (err, fields, files) {
  //   if (err) console.error(err)
  //   form.on('file', function (name, file) {
  //     console.log(file)
  //   })
  //   // res.writeHead(200, { 'content-type': 'text/plain' })
  //   // res.write('received upload:\n\n')
  //   // res.end(util.inspect({ fields: fields, files: files }))
  //   res.status(200).json({ fields: fields, files: files })
  // })
  // // form.on('fileBegin', function (name, file) {
  // //   file.path = './tmp/' + file.name
  // // })
  res.status(200).json({ req: req })
}
