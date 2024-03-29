import Router from "next/router"
import { useEffect } from "react"
import { getProviders, useSession, signIn } from "next-auth/react"
import NewtelcoSvg from "../../components/newtelcosvg"
import anime from "animejs"
import { Container, Content, Footer, FlexboxGrid, Panel, Button } from "rsuite"

export default function SignIn({ providers, params }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const animateText = () => {
    anime({
      targets: ".path0, .path1",
      strokeDashoffset: [anime.setDashoffset, 3],
      easing: "easeInOutSine",
      duration: 3500,
      delay: function (_, i) {
        return i * 250
      },
      direction: "alternate",
      loop: false,
    })
  }

  useEffect(() => {
    if (!loading && session) {
      const { approvalHash, action, completed } = params

      Router.push(`/?h=${approvalHash}&a=${action}&b=${completed}`)
    }
    animateText()
  }, [session, loading])

  return (
    <div className="show-fake-browser login-page">
      <Container className="login-wrapper">
        <Content className="login-content-wrapper">
          <FlexboxGrid justify="center" className="login-grid-wrapper">
            <NewtelcoSvg />
            <FlexboxGrid.Item justify="center">
              <Panel
                header={<h3 className="login-text-header">Absences</h3>}
                bordered
                shaded
              >
                <SignInButtons providers={providers} />
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
        <Footer className="login-footer-wrapper">
          NewTelco {new Date().getFullYear()}
        </Footer>
      </Container>
      <style jsx>
        {`
          @media screen and (max-width: 500px) {
            :global(.login-grid-wrapper > svg) {
              max-width: 85%;
            }
            :global(.google-signin-btn svg) {
              width: 8.5em;
              margin-right: 5px;
            }
          }
          .vacation-background {
            position: absolute;
            height: 100%;
            width: 100%;
            z-index: -10;
          }
          .text-center {
            margin: 100px 0 50px 0;
          }
          :global(.rs-panel-heading) {
            background-color: #e8e8e8;
            color: #a7a7a7;
          }
          :global(.rs-panel-body) {
            background-color: #fff;
          }
          :global(.rs-panel-bordered) {
            margin-top: 50px;
            box-shadow: 0 2px 0 rgba(90, 97, 105, 0.11),
              0 4px 8px rgba(90, 97, 105, 0.12),
              0 10px 10px rgba(90, 97, 105, 0.06),
              0 7px 70px rgba(90, 97, 105, 0.1);
          }
          :global(.login-grid-wrapper) {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 100px;
          }
          :global(#signin) {
            margin-top: 10px;
          }
          :global(.newtelco-svg) {
            margin: 30px 0;
          }
          :global(.login-page) {
            display: flex;
            flex-direction: column;
          }
          :global(.login-wrapper) {
            height: 100vh;
          }
          :global(.login-text-header) {
            font-weight: 200;
          }
          :global(.login-content-wrapper) {
            background-color: transparent;
            flex-grow: 1;
          }
          :global(.login-footer-wrapper) {
            height: 56px;
            display: flex;
            padding: 10px 30px;
            align-items: center;
            background-color: #e4e4e4;
            font-family: "Roboto", Helvetica;
            font-weight: 300;
          }
          :global(a.btn-outline-secondary:hover) {
            text-decoration: none;
          }
          #email::placeholder {
            opacity: 0.4;
          }
        `}
      </style>
    </div>
  )
}

const SignInButtons = ({ providers }) => {
  return (
    <>
      {Object.values(providers).map((provider) => {
        return (
          <Button
            style={{
              width: "100%",
              height: "40px",
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "10px 0",
              padding: "0 50px",
            }}
            key={provider.name}
            onClick={() => signIn(provider.id)}
            className="google-signin-btn"
            appearance="primary"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="currentColor"
              width="1.2em"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginRight: "10px",
                padding: "1px",
              }}
            >
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span style={{ flexGrow: "4" }}>Sign in with {provider.name}</span>
          </Button>
        )
      })}
    </>
  )
}

SignIn.getInitialProps = async (context) => {
  const query = context.query
  const approvalHash = query.h
  const action = query.a
  const completed = query.b
  return {
    providers: await getProviders(context),
    params: {
      approvalHash,
      action,
      completed,
    },
  }
}
