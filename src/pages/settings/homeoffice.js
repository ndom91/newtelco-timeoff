import React, { useState } from "react"
import Layout from "../../components/layout/index"
import { eachDayOfInterval, parseISO, format, isSameISOWeek } from "date-fns"
import { getSession } from "next-auth/react"
import RequireLogin from "../../components/requiredLogin"
import Subheader from "../../components/content-subheader"
import "react-tabs/style/react-tabs.css"
import {
  Container,
  Header,
  Button,
  Panel,
  Content,
  SelectPicker,
  FormGroup,
  ControlLabel,
  Whisper,
  Tooltip,
  Calendar,
} from "rsuite"

const calcDaysSelected = (days, weekFrom, weekTo) => {
  const daysSelected = []
  const daysInWeek = eachDayOfInterval({
    start: parseISO(weekFrom),
    end: parseISO(weekTo),
  })
  daysInWeek.slice(2).forEach((day) => {
    if (days[format(day, "iii").toLowerCase()]) {
      daysSelected.push(day)
    }
  })
  return daysSelected
}

const approvedMap = {
  1: "Denied",
  2: "Approved",
  0: "Pending",
}

const HomeOffice = ({ session, data }) => {
  const [homeoffice, setHomeoffice] = useState(data.homeoffice)
  const [selectedTeam, setSelectedTeam] = useState(1)

  let userAdmin = false
  if (typeof window !== "undefined") {
    userAdmin = JSON.parse(window.localStorage.getItem("mA"))
  }

  const handleTeamChange = async (teamId) => {
    const teamName = data.team.teamInfos.find((team) => team.id === teamId).name
    const teamHomeoffice = await fetch(`/api/homeoffice?team=${teamName}`)
    const teamHomeofficeData = await teamHomeoffice.json()
    setHomeoffice(teamHomeofficeData)
    setSelectedTeam(teamId)
  }

  const downloadTable = async () => {
    const csvContent = homeoffice
      .map((row) => {
        const {
          approved,
          approvedDatetime,
          weekFrom,
          weekTo,
          days,
          email,
          manager,
          submittedBy,
          submittedDatetime,
        } = row
        const daysSelected = calcDaysSelected(
          JSON.parse(days),
          weekFrom,
          weekTo
        )
        console.log("DAYSSELECTED", daysSelected)
        return daysSelected
          .map((selectedDay) => {
            return [
              approvedMap[approved],
              approvedDatetime,
              parseISO(weekFrom),
              parseISO(weekTo),
              selectedDay,
              email,
              manager,
              submittedBy,
              submittedDatetime,
            ]
          })
          .join("\n")
      })
      .join("\n")
      .replace(
        /^/,
        "approved,approvedDateTime,weekFrom,weekTo,selectedDay,userEmail,manager,submittedBy,submittedDateTime\n"
      )

    const link = document.createElement("a")
    link.setAttribute(
      "href",
      `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`
    )
    const teamName = data.team.teamInfos.find(
      (team) => team.id === selectedTeam
    ).name
    link.setAttribute("download", `${teamName}_homeofficeExport.csv`)
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const homeofficeCalendarCell = (date) => {
    return homeoffice.map((week) => {
      if (isSameISOWeek(new Date(week.weekTo), new Date(date))) {
        const days = JSON.parse(week.days)
        const dayVal = days[format(new Date(date), "EEE").toLowerCase()]
        if (dayVal) {
          return (
            <>
              <div className="homeoffice-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#67B246"
                  style={{
                    opacity: week.approved === 0 ? "0.5" : "1.0",
                    marginRight: "5px",
                  }}
                  width="16"
                  height="16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <p className="homeoffice-username">{week.name}</p>
                {week.approved === 0 && (
                  <Whisper speaker={<Tooltip>Awaiting Approval</Tooltip>}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{
                        marginLeft: "5px",
                      }}
                      width="18"
                      height="18"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </Whisper>
                )}
              </div>
            </>
          )
        }
      }
    })
  }

  if (session && userAdmin) {
    return (
      <Layout user={session.user.email} token={session.csrfToken}>
        <Container className="settings-admin-container">
          <Subheader header="Administration" subheader="Homeoffice" />
          <Panel bordered>
            <Header className="user-content-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <FormGroup>
                  <ControlLabel>Team</ControlLabel>
                  <SelectPicker
                    onChange={(e) => handleTeamChange(e)}
                    value={selectedTeam}
                    style={{ width: "100%" }}
                    searchable={false}
                    cleanable={false}
                    data={data.team.teamInfos.map((team) => {
                      return { label: team.name, value: team.id }
                    })}
                  />
                </FormGroup>
                <FormGroup>
                  <Button onClick={downloadTable} appearance="primary">
                    Download Team CSV
                  </Button>
                </FormGroup>
              </div>
            </Header>
            <Content className="user-grid-wrapper">
              <div className="ag-theme-material user-grid">
                <Calendar bordered renderCell={homeofficeCalendarCell} />
              </div>
            </Content>
          </Panel>
        </Container>
        <style jsx>
          {`
            @media screen and (max-width: 500px) {
              :global(.wrapper) {
                width: 100%;
              }
              :global(.settings-admin-container) {
                width: 80%;
              }
              :global(.person-panel-body .rs-panel-body) {
                padding: 20px !important;
              }
            }
            :global(.loading) {
              animation: rotating 1.5s linear infinite;
              @keyframes rotating {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            }
            :global(.rs-row) {
              padding: 10px;
            }
            :global(.rs-col) {
              padding: 10px;
            }
            :global(.rs-form-group > *) {
              margin: 5px;
            }
            :global(.settings-admin-container > .rs-panel) {
              margin: 10px;
            }
            :global(.rs-btn-ghost) {
              transition: box-shadow 250ms ease-in-out;
            }
            :global(.rs-btn-ghost:hover) {
              box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.15);
            }
            :global(.user-content-header:focus) {
              outline: none;
            }
            :global(.homeoffice-wrapper) {
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            :global(.homeoffice-username) {
              font-size: 0.8rem;
              color: #67b246;
            }
          `}
        </style>
      </Layout>
    )
  } else {
    return (
      <Layout user={session.user.email} token={session.csrfToken}>
        <RequireLogin />
      </Layout>
    )
  }
}

export async function getServerSideProps({ req }) {
  const host = req && (req.headers["x-forwarded-host"] ?? req.headers["host"])
  let protocol = "https"
  if (host.includes("localhost")) {
    protocol = "http"
  }

  const homeofficeRes = await fetch(`${protocol}://${host}/api/homeoffice`)
  const teamRes = await fetch(`${protocol}://${host}/api/team`)
  const homeoffice = await homeofficeRes.json()
  const team = await teamRes.json()

  return {
    props: {
      session: await getSession({ req }),
      data: {
        homeoffice,
        team,
      },
    },
  }
}

export default HomeOffice
