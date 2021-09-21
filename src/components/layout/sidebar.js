import { useState } from "react"
import Link from "next/link"
import Router from "next/router"
import Image from "next/image"
import { signOut } from "next-auth/react"
import {
  Nav,
  Navbar,
  Dropdown,
  Sidenav,
  Sidebar,
  Modal,
  Icon,
  Whisper,
  Tooltip,
} from "rsuite"
import NTLogo from "../../../public/static/img/newtelco_letters.svg"
import NTLogoL from "../../../public/static/img/newtelco.svg"
import NDOLogo from "../../../public/static/img/ndo-gray.png"

const NavToggle = ({
  expand,
  onChange,
  token,
  handleSignOut,
  toggleHelpModal,
}) => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Navbar.Body>
        <Nav>
          <Dropdown
            placement="topStart"
            trigger="click"
            renderTitle={() => {
              return <Icon className="icon-style" icon="cog" />
            }}
          >
            <Dropdown.Item onClick={toggleHelpModal}>About</Dropdown.Item>
            <Dropdown.Item>
              <form
                id="signout"
                method="post"
                action="/auth/signout"
                onSubmit={handleSignOut}
              >
                <input name="_csrf" type="hidden" value={token} />
                <div className="logout-btn-wrapper">
                  <button
                    className="logout-btn"
                    type="submit"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              </form>
            </Dropdown.Item>
          </Dropdown>
        </Nav>

        <Nav pullRight>
          <Nav.Item
            onClick={onChange}
            style={{ width: 56, textAlign: "center" }}
          >
            <Icon icon={expand ? "angle-left" : "angle-right"} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  )
}
const Navigation = ({ expand, admin, token, handleToggle }) => {
  const [openModal, setOpenModal] = useState(false)

  const pageActive = (path) => {
    if (typeof window !== "undefined") {
      if (window.location !== "undefined") {
        if (path === Router.pathname) return true
      }
      return false
    }
    return false
  }

  return (
    <Sidebar
      style={{ display: "flex", flexDirection: "column", marginTop: "0px" }}
      width={expand ? 260 : 56}
      className="sidebar-wrapper"
    >
      <Sidenav.Header>
        <div
          className="sidenav-header"
          style={{ padding: expand ? "18px" : "8px" }}
        >
          {!expand ? (
            <Image src={NTLogo} alt="Logo" height={80} width={80} />
          ) : (
            <span
              style={{
                fontSize: "32px",
                fontWeight: "100",
                fontFamily: "Roboto",
                textAlign: "left",
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <img
                src={NTLogoL.src}
                alt="Logo"
                style={{
                  height: "48px",
                  width: "188px",
                  marginTop: "0px",
                  marginLeft: "5px",
                  marginRight: "10px",
                }}
              />
            </span>
          )}
        </div>
      </Sidenav.Header>
      <Sidenav
        expanded={expand}
        defaultOpenKeys={["4", "5"]}
        appearance="default"
      >
        <Sidenav.Body>
          <Nav>
            <Link passHref href="/">
              <Whisper
                trigger={expand ? "none" : "hover"}
                placement="right"
                speaker={<Tooltip>Dashboard</Tooltip>}
              >
                <Nav.Item
                  eventKey="1"
                  active={pageActive("/")}
                  icon={
                    <span
                      style={{
                        position: "absolute",
                        left: "20px",
                        top: "15px",
                      }}
                    >
                      <svg
                        fill="none"
                        width={22}
                        height={22}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                    </span>
                  }
                >
                  Dashboard
                </Nav.Item>
              </Whisper>
            </Link>
            <Link passHref href="/new">
              <Whisper
                trigger={expand ? "none" : "hover"}
                placement="right"
                speaker={<Tooltip>New Request</Tooltip>}
              >
                <Nav.Item
                  eventKey="3"
                  active={pageActive("/new")}
                  icon={
                    <span
                      style={{
                        position: "absolute",
                        left: "20px",
                        top: "15px",
                      }}
                    >
                      <svg
                        fill="none"
                        width={22}
                        height={22}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </span>
                  }
                >
                  New Request
                </Nav.Item>
              </Whisper>
            </Link>
            <Link passHref href="/user">
              <Whisper
                trigger={expand ? "none" : "hover"}
                placement="right"
                speaker={<Tooltip>My Requests</Tooltip>}
              >
                <Nav.Item
                  eventKey="2"
                  active={pageActive("/user")}
                  icon={
                    <span
                      style={{
                        position: "absolute",
                        left: "20px",
                        top: "15px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        height={22}
                        width={22}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  }
                >
                  My Requests
                </Nav.Item>
              </Whisper>
            </Link>
            {admin ? (
              <Dropdown
                eventKey="5"
                trigger="hover"
                title="Admin"
                icon={
                  <span
                    style={{
                      position: "absolute",
                      left: "20px",
                      top: "15px",
                    }}
                  >
                    <svg
                      fill="none"
                      width={22}
                      height={22}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </span>
                }
                placement="rightStart"
                activeKey={
                  typeof window !== "undefined" &&
                  Router.pathname.includes("settings")
                }
                active={
                  typeof window !== "undefined" &&
                  Router.pathname.includes("settings")
                }
              >
                <Link passHref href="/settings/admin">
                  <Dropdown.Item
                    eventKey="5-1"
                    active={pageActive("/settings/admin")}
                  >
                    Settings
                  </Dropdown.Item>
                </Link>
                <Link passHref href="/settings/reports">
                  <Dropdown.Item
                    eventKey="5-2"
                    active={
                      typeof window !== "undefined" &&
                      Router.pathname === "/settings/reports"
                    }
                  >
                    Reports
                  </Dropdown.Item>
                </Link>
              </Dropdown>
            ) : null}
          </Nav>
        </Sidenav.Body>
      </Sidenav>
      <NavToggle
        expand={expand}
        handleSignOut={() => signOut()}
        token={token}
        onChange={handleToggle}
        toggleHelpModal={() => setOpenModal(true)}
      />
      <Modal
        enforceFocus
        size="xs"
        backdrop
        show={openModal}
        onHide={() => setOpenModal(false)}
        style={{ marginTop: "150px" }}
      >
        <Modal.Header>
          <Modal.Title style={{ fontSize: "24px" }}>About</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: "20px",
              }}
            >
              <Image
                width={64}
                height={64}
                src={NDOLogo}
                alt="Newtelco Logo Gray"
              />
              <div style={{ width: "150px", lineHeight: "1.4rem" }}>
                {"Nico Domino"}
                <br />
                <b>ndomino[at]newtelco.de</b> (
                <a
                  href="https://ndo.dev?utm_source=ntvacation"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  ndo.dev
                </a>
                )
                <br />
                2019-{new Date().getFullYear()} ©
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                position: "absolute",
                width: "100%",
                bottom: "0",
              }}
            >
              <span>
                <a href="https://newtelco.com/legal-notice/">Legal</a>
              </span>
              <span>
                <a href="https://newtelco.com/data-privacy-policy/">Privacy</a>
              </span>
              <span>
                <a href="https://opensource.org/licenses/mit-license.php">
                  MIT License
                </a>
              </span>
            </div>
          </p>
        </Modal.Body>
        <Modal.Footer style={{ display: "flex", justifyContent: "center" }}>
          NewTelco GmbH
        </Modal.Footer>
      </Modal>
      <style jsx>
        {`
          :global(.sidebar-wrapper) {
            width: ${expand ? "260px" : "56px"};
            box-shadow: 10px 0 10px 1px rgba(0, 0, 0, 0.1);
            z-index: 999;
          }
          :global(.sidenav-header) {
            justify-content: ${expand ? "center" : "flex-start"} !important;
            padding: ${expand ? "18px" : "8px"};
            align-items: center;
          }
          :global(.rs-sidenav-default) {
            background-color: #fff;
          }
          :global(.rs-sidenav-header) {
            height: 56px !important;
          }
          :global(.rs-nav-item.rs-nav-item-active::before) {
            border-left: 3px solid #67b246;
            box-shadow: -2px 0px 16px 2px #67b246;
            position: absolute;
            content: "";
            height: 100%;
            width: 3px;
          }
          :global(.nav-toggle) {
            background-color: #f3f3f3 !important;
          }
          :global(.rs-modal-backdrop.in) {
            opacity: 0.8;
          }
          :global(.menu-hr) {
            border-top: 1px solid rgba(237, 237, 230, 0.9);
            width: 80%;
            margin: 0 auto;
          }
        `}
      </style>
    </Sidebar>
  )
}

export default Navigation
