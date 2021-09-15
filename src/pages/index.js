import { useEffect, useState } from "react"
import { Container, Content, Panel } from "rsuite"
import { getSession } from "next-auth/react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Layout from "../components/layout/index"
import RequireLogin from "../components/requiredLogin"
import DashStat from "../components/dashstat"
import Subheader from "../components/content-subheader"
import { notifyInfo, notifyWarn } from "../lib/notify"

const Calendar = dynamic(() => import("../components/gcalendar"), {
  ssr: false,
})

const Wrapper = ({ session }) => {
  const [dashboard, setDashboard] = useState({
    lastYear: 0,
    thisYear: 0,
    spent: 0,
    available: 0,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host
      const protocol = window.location.protocol
      let params = new URL(document.location).searchParams
      const approvalCompleted = params.get("b")
      const approvalHash = params.get("h")
      const action = params.get("a")
      const code = params.get("code")

      if (approvalCompleted === "0") {
        if (window.location.search) {
          fetch(`/api/mail/checkApproval?hash=${approvalHash}&a=${action}`)
            .then((resp) => resp.json())
            .then((data) => {
              const approvalStatus = data.status
              if (approvalStatus === 0) {
                fetch(`/api/mail/response?h=${approvalHash}&a=${action}&b=0`)
                  .then((resp) => resp.json())
                  .then((data) => {
                    const code = data.code
                    const action = data.a
                    if (code === 200 && action === "a") {
                      notifyInfo("Absence Successfully Approved")
                    } else if (code === 200 && action === "d") {
                      notifyInfo("Absence Successfully Denied")
                    } else if (code === 500) {
                      notifyWarn("Error Responding to Request")
                    }
                  })
                  .catch((err) => console.error(err))
              } else {
                notifyInfo("Request already answered")
              }
            })
            .catch((err) => console.error(err))
        }
      } else {
        if (session) {
          if (code === "200" && action === "a") {
            notifyInfo("Absence Successfully Approved")
          } else if (code === "200" && action === "d") {
            notifyInfo("Absence Successfully Denied")
          } else if (code === "500") {
            notifyWarn("Error Responding to Request")
          }
          fetch(
            `${protocol}//${host}/api/user/entries/dashboard?u=${encodeURIComponent(
              session.user.email
            )}`
          )
            .then((resp) => resp.json())
            .then((data) => {
              if (data.userEntries[0]) {
                const user = data.userEntries[0]
                setDashboard({
                  lastYear: user.resturlaubVorjahr || 0,
                  thisYear: user.jahresurlaubInsgesamt || 0,
                  spent: user.jahresUrlaubAusgegeben || 0,
                  available: user.resturlaubJAHR || 0,
                })
              }
            })
            .catch((err) => console.error(err))
        }
      }
    }
  }, [])

  const list = { hidden: { opacity: 1 } }
  const item = { hidden: { y: [-50, 0], opacity: [0, 1] } }

  if (session) {
    return (
      <Layout user={session.user.email} token={session.csrfToken}>
        <Container>
          <Subheader
            header="Absence Management"
            subheader="Current Vacations"
          />
          <motion.div
            initial
            staggerChildren
            animate="hidden"
            transition={{
              ease: "easeIn",
              duration: 2,
              staggerChildren: 0.15,
            }}
            variants={list}
            className="stat-wrapper"
          >
            <motion.div variants={item} whileHover={{ scale: 1.03 }}>
              <Panel className="stat-panel">
                <DashStat
                  value={dashboard.lastYear}
                  type="lastYear"
                  label="From Last Year"
                />
              </Panel>
            </motion.div>
            <motion.div variants={item} whileHover={{ scale: 1.03 }}>
              <Panel className="stat-panel">
                <DashStat
                  value={dashboard.thisYear}
                  type="thisYear"
                  label="Earned this Year"
                />
              </Panel>
            </motion.div>
            <motion.div variants={item} whileHover={{ scale: 1.03 }}>
              <Panel className="stat-panel">
                <DashStat
                  value={dashboard.spent}
                  type="spent"
                  label="Spent this Year"
                />
              </Panel>
            </motion.div>
            <motion.div variants={item} whileHover={{ scale: 1.03 }}>
              <Panel className="stat-panel">
                <DashStat
                  value={dashboard.available}
                  type="available"
                  label="Total Available"
                />
              </Panel>
            </motion.div>
          </motion.div>
          <Panel bordered>
            <Content>
              <Calendar />
            </Content>
          </Panel>
        </Container>
        <style jsx>
          {`
            :global(.stat-wrapper) {
              display: flex;
              justify-content: space-around;
              max-height: 160px;
              margin-bottom: 40px;
              list-style: none;
            }
            :global(.stat-wrapper .rs-panel) {
              width: 260px;
              max-width: 250px;
              max-height: 135px;
              margin: 15px;
              border-radius: 20px;
              background: #ffffff;
              box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(1)) {
              background-color: #358772 !important;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(2)) {
              background-color: #592941 !important;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(3)) {
              background-color: #cf8051 !important;
            }
            :global(.sstat-wrapper > .rs-panel:nth-child(4)) {
              background-color: #c24c61 !important;
            }
            :global(.dx-scheduler-appointment) {
              background-color: #67b246;
            }
            :global(.dx-button-mode-contained.dx-button-default) {
              background-color: #4c8532;
            }
          `}
        </style>
      </Layout>
    )
  } else {
    return <RequireLogin />
  }
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context),
    },
  }
}

export default Wrapper
