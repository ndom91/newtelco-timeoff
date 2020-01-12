// import { createWriteStream } from 'fs'
import formidable from 'formidable'

module.exports = async (req, res) => {
  // const test = req.pipe(createWriteStream(`./tmp/${req.query.fn}`))
  const form = new formidable.IncomingForm()
  // form.parse(req, function (err, fields, files) {
  //   if (err) console.error(err)
  //   console.log(files, fields)
  //   // res.end()
  // })
  form.on('fileBegin', function (name, file) {
    file.path = './tmp/' + file.name
  })
  res.status(200).json({ msg: 'success!' })
}
