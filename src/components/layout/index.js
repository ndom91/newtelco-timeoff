import { useState, useEffect } from "react"
import { Container, Content } from "rsuite"
import Navigation from "./sidebar"

const Layout = ({ user, token, children }) => {
  const [expand, setExpand] = useState(false)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const protocol = window.location.protocol
    const host = window.location.host
    const userAdmin = JSON.parse(window.localStorage.getItem("mA"))

    if (userAdmin) {
      setExpand(window.localStorage.getItem("layout-expand") === "true")
      setAdmin(userAdmin)
    } else if (!userAdmin) {
      fetch(`${protocol}//${host}/api/ldap/groups?m=${user}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.memberAdmin) {
            window.localStorage.setItem("mA", data.memberAdmin)
          }
          setAdmin(data.memberAdmin)
        })
        .catch((err) => console.error(err))
    }

    if (typeof window !== "undefined" && window.innerWidth < 600) {
      setExpand(false)
    }
  }, [])

  const onToggle = () => {
    window.localStorage.setItem("layout-expand", !expand)
    setExpand(!expand)
  }

  return (
    <div className="show-fake-browser sidebar-page wrapper">
      <Container>
        <Navigation
          user={user}
          admin={admin}
          token={token}
          expand={expand}
          handleToggle={() => onToggle()}
        />
        <Container className="wrapper">
          <Content className="content-wrapper">{children}</Content>
        </Container>
      </Container>
      <style jsx>
        {`
          :global(.rs-panel) {
            box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
              0 4px 8px rgba(90, 97, 105, 0.12),
              0 10px 10px rgba(90, 97, 105, 0.06),
              0 7px 70px rgba(90, 97, 105, 0.1);
          }
          .vacation-background {
            position: absolute;
            height: 100%;
            width: 100%;
            z-index: -10;
          }
          :global(.content-wrapper) {
            background-color: #eee;
          }
          :global(.rs-panel-default) {
            background-color: #fff;
          }
          :global(.header-wrapper) {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 10px;
            background-color: #fff;
            box-shadow: 0 0.125rem 0.625rem rgba(90, 97, 105, 0.12);
          }
          :global(.rs-sidenav-header) {
            z-index: 10;
          }
          :global(.rs-sidenav) {
            box-shadow: 0 0.125rem 9.375rem rgba(90, 97, 105, 0.1),
              0 0.25rem 0.5rem rgba(90, 97, 105, 0.12),
              0 0.9375rem 1.375rem rgba(90, 97, 105, 0.1),
              0 0.4375rem 2.1875rem rgba(165, 182, 201, 0.1);
          }
          :global(.content-wrapper) {
            padding: 20px;
            overflow-y: scroll;
            position: relative;
          }
          :global(.footer-wrapper) {
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 10px 20px;
            background-color: #f3f3f3;
            border-top: 1px solid #e1e5eb !important;
          }
          :global(.logout-btn) {
            background-color: transparent;
            padding: 0;
          }
          :global(.wrapper, .rs-container-has-sidebar) {
            height: 100vh;
          }
          :global(.wrapper) {
            max-width: 2100px;
            margin: 0 auto;
            box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.2);
          }
          :global(.rs-sidenav) {
            flex-grow: 1;
          }
          :global(.sidenav-header h3) {
            line-height: 20px;
            margin-left: 42px !important;
          }
          :global(.sidenav-header) {
            padding: 18px;
            font-size: 16px;
            height: 56px;
            background: #67b246;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            display: ${!expand ? "inline-block" : "flex"};
            width: ${!expand ? "56px" : "260px"};
            justify-content: flex-start;
            transition: all 150ms linear;
          }
          :global(.header-section-title) {
            font-size: 1.3rem;
            font-weight: 400;
          }
          :global(.icon-style) {
            width: 56px;
            height: 56px;
            line-height: 56px;
            text-align: center;
          }
          :global(.rs-btn-subtle.rs-btn-active) {
            color: #8e8e93;
          }
          :global(::-webkit-scrollbar-track) {
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
            border-radius: 10px;
            background-color: rgba(0, 0, 0, 0);
            z-index: 100;
          }
          :global(::-webkit-scrollbar) {
            width: 8px;
            height: 8px;
            background-color: transparent;
            z-index: 100;
          }
          :global(::-webkit-scrollbar-thumb) {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 100;
          }
          :global(.rs-notification-content) {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          :global(.rs-tag-green) {
            background-color: #67b246 !important;
          }
        `}
      </style>
    </div>
  )
}

export default Layout
