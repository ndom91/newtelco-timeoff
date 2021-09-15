import { Notification } from "rsuite"

export const notifyInfo = (header, text) => {
  Notification.info({
    title: header,
    duration: 2000,
    description: <div className="notify-body">{text}</div>,
  })
}

export const notifyWarn = (header, text) => {
  Notification.warning({
    title: header,
    duration: 2000,
    description: <div className="notify-body">{text}</div>,
  })
}

export const notifyError = (header, text) => {
  Notification.error({
    title: header,
    duration: 3000,
    description: <div className="notify-body">{text}</div>,
  })
}

export const notifySuccess = (header, text) => {
  Notification.success({
    title: header,
    duration: 3000,
    description: <div className="notify-body">{text}</div>,
  })
}
