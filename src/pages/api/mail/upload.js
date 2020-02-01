import { createWriteStream, fs } from 'fs'
// import formidable from 'formidable'

const IncomingForm = require('formidable').IncomingForm

module.exports = async (req, res) => {
  const form = new IncomingForm()

  form.on('file', (field, file) => {
    // Do something with the file
    // e.g. save it to the database
    // you can access it using file.path
    console.log(field)
  })
  form.on('end', () => {
    const response = res.json()
    console.log('resp', response)
  })
  form.parse(req)
  console.log(form)
}

export const config = {
  api: {
    bodyParser: false
  }
}
