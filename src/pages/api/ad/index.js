import ActiveDirectory from 'activedirectory2'

module.exports = async (req, res) => {
  const config = {
    url: process.env.LDAP_URL,
    baseDN: process.env.LDAP_BASE_DN,
    username: process.env.LDAP_BIND_DN,
    password: process.env.LDAP_BIND_PW
  }
  const ad = new ActiveDirectory(config)
  ad.authenticate(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PW, function (err, auth) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err))
    } else {
      console.log('AUTH: ' + JSON.stringify(auth))
    }
  })
  const query = process.env.LDAP_USER_QUERY
  ad.findUsers(query, true, function (err, users) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err))
      res.status(500).json({ status: 500, error: err, ad, config })
      return
    }

    if ((!users) || (users.length === 0)) console.log('No users found.')

    else {
      res.status(200).json({ status: 200, users })
    }
  })
}
