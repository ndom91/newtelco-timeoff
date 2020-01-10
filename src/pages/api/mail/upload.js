const { google } = require('googleapis')
const fs = require('fs')

module.exports = async (req, res) => {

  const uploadFile = (data) => {
    google
      .discover('drive', 'v2')
      .execute((err, client) => {
        if (err) console.error(err)
        req = client.drive.files.list()
        console.log(req)
        req.execute(function (err, result) {
          console.log(err)
          console.log(result)
        })
      })

      const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
      });
      
      const res = await drive.files.create({
        requestBody: {
          name: 'Test',
          mimeType: 'text/plain'
        },
        media: {
          mimeType: 'text/plain',
          body: 'Hello World'
        }
      });
    // const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
    // const fileMetadata = {
    //   name: 'photo.jpg'
    // }
    // const media = {
    //   mimeType: 'image/jpeg',
    //   body: fs.createReadStream('files/photo.jpg')
    // }
    // drive.files.create({
    //   resource: fileMetadata,
    //   media: media,
    //   fields: 'id'
    // }, function (err, file) {
    //   if (err) {
    //     // Handle error
    //     console.error(err)
    //   } else {
    //     console.log('File Id: ', file.id)
    //   }
    // })
  }
}