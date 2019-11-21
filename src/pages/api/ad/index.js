import ActiveDirectory from 'activedirectory2'

module.exports = async (req, res) => {
  const config = {
    url: 'ldap://ldap.newtelco.dev:389',
    baseDN: 'ou=users,ou=frankfurt,dc=newtelco,dc=local',
    username: 'cn=jcleese,ou=technik,ou=users,ou=frankfurt,dc=newtelco,dc=local',
    password: 'N3wt3lco'
  }
  const ad = new ActiveDirectory(config)
  const query = '(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group))(memberOf=cn=GoogleUsers,ou=frankfurt,dc=newtelco,dc=local))'
  ad.findUsers(query, true, function (err, users) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err))
      return
    }

    if ((!users) || (users.length === 0)) console.log('No users found.')
    else {
      res.status(200).json({ users })
    }
  })
}
