const AD = require("activedirectory2").promiseWrapper

module.exports = async (_, res) => {
  const config = {
    url: process.env.LDAP_URL,
    baseDN: process.env.LDAP_BASE_DN,
    username: process.env.LDAP_BIND_DN,
    password: process.env.LDAP_BIND_PW,
  }
  const ad = new AD(config)
  try {
    await ad.authenticate(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PW)
    const users = await ad.findUsers(process.env.LDAP_USER_QUERY, true)

    if (!users || users.length === 0) {
      console.log("No users found.")
      res.status(500).json({ status: 500, error: err })
    }

    res.status(200).json({ status: 200, users })
  } catch (e) {
    res.status(500).json({ status: 500, error: err })
  }
}
