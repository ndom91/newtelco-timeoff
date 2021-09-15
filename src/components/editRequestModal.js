import React, { useState, useEffect } from "react"
import Upload from "../components/upload"
import moment from "moment-timezone"
import {
  Button,
  ButtonToolbar,
  ButtonGroup,
  Panel,
  Modal,
  Form,
  Input,
  InputGroup,
  FormGroup,
  ControlLabel,
  DatePicker,
  Notification,
} from "rsuite"

const notifySuccess = (header, text) => {
  Notification.success({
    title: header,
    duration: 2000,
    description: <div className="notify-body">{text}</div>,
  })
}

const notifyError = (header, text) => {
  Notification.error({
    title: header,
    duration: 3000,
    description: <div className="notify-body">{text}</div>,
  })
}

const EditModal = (props) => {
  const openEditModal = props.open
  const [loading, setLoading] = useState(false)
  const [fieldsDisabled, setEditable] = useState(props.fieldsDisabled || false)
  const [editData, setData] = useState([""])
  const [files, setFiles] = useState([])

  useEffect(() => {
    setData(props.data)
  }, [])

  const onFileUploadSuccess = (id, fileName, fileUrl) => {
    setFiles([...files, { id: id, url: fileUrl, name: fileName }])
  }

  const handleLastYearChange = (value) => {
    setData({ ...editData, lastYear: Number(value) })
  }

  const handleThisYearChange = (value) => {
    setData({ ...editData, thisYear: Number(value) })
  }

  const handleTotalSpentChange = (value) => {
    setData({ ...editData, spent: Number(value) })
  }

  const handleTotalAvailableChange = (value) => {
    setData({ ...editData, total: Number(value) })
  }

  const handleRequestedChange = (value) => {
    setData({ ...editData, requested: Number(value) })
  }

  const handleRemainingChange = (value) => {
    setData({ ...editData, remaining: Number(value) })
  }

  const handleNoteChange = (value) => {
    setData({ ...editData, note: value })
  }

  const handleFromDateChange = (value) => {
    setData({ ...editData, from: value })
  }

  const handleToDateChange = (value) => {
    setData({ ...editData, to: value })
  }

  const handleSubmitEdit = () => {
    const host = window.location.host
    const protocol = window.location.protocol

    const selectedRow = props.gridApi.getSelectedRows()
    const oldData = selectedRow[0]
    let oldFiles = ""
    if (oldData.files !== "") {
      oldFiles = JSON.parse(oldData.files)
    }
    let newFiles = oldFiles
    if (files.length > 0) {
      newFiles = oldFiles.concat(files)
    }

    const toSubmitData = editData
    toSubmitData.from = moment(editData.from).format("YYYY-MM-DD")
    toSubmitData.to = moment(editData.to).format("YYYY-MM-DD")

    fetch(`${protocol}//${host}/api/user/entries/update`, {
      method: "POST",
      body: JSON.stringify({
        editData: toSubmitData,
        files: newFiles,
      }),
      headers: {
        "X-CSRF-TOKEN": props.session.csrfToken,
      },
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.updateQuery.affectedRows === 1) {
          const oldData = props.rowData
          const updateIndex = oldData.findIndex(
            (entry) => entry.id === editData.id
          )

          oldData[updateIndex].note = editData.note
          oldData[updateIndex].files = JSON.stringify(newFiles)
          if (!fieldsDisabled) {
            oldData[updateIndex].fromDate = moment(editData.from).format(
              "DD.MM.YYYY"
            )
            oldData[updateIndex].toDate = moment(editData.to).format(
              "DD.MM.YYYY"
            )
            oldData[updateIndex].resturlaubVorjahr = editData.lastYear
            oldData[updateIndex].resturlaubJAHR = editData.remaining
            oldData[updateIndex].beantragt = editData.requested
            oldData[updateIndex].jahresUrlaubAusgegeben = editData.spent
            oldData[updateIndex].jahresurlaubInsgesamt = editData.thisYear
            oldData[updateIndex].restjahresurlaubInsgesamt = editData.total
          }

          props.setRowData(oldData)
          props.toggleEditModal()
          props.gridApi.refreshCells()
          notifySuccess("Update Success")
        } else {
          notifyError("Update Failed")
          props.toggleEditModal()
        }
      })
      .catch((err) => console.error(err))
  }

  return (
    <Modal
      enforceFocus
      size="sm"
      backdrop
      show={openEditModal}
      onHide={props.toggleEditModal}
      style={{ marginTop: "20px" }}
    >
      <Modal.Header>
        <Modal.Title style={{ textAlign: "center", fontSize: "24px" }}>
          Edit Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="edit-loader-wrapper">Loading...</div>
        ) : (
          <Form layout="horizontal">
            <div
              style={{
                border: "1px solid #ececec",
                borderRadius: "10px",
                padding: "20px",
                width: "90%",
                margin: "0 auto",
                marginBottom: "20px",
                display: "flex",
                flexWrap: "wrap",
                flex: "1 1",
              }}
            >
              <FormGroup className="stacked-input" style={{ width: "400px" }}>
                <ControlLabel>Type</ControlLabel>
                <Input name="type" disabled value={editData.type} />
              </FormGroup>
              <FormGroup className="stacked-input">
                <ControlLabel>Days from Last Year</ControlLabel>
                <InputGroup>
                  <Input
                    min={0}
                    step="0.5"
                    name="daysLastYear"
                    type="number"
                    disabled={fieldsDisabled}
                    onChange={handleLastYearChange}
                    value={editData.lastYear}
                  />
                  <InputGroup.Addon>days</InputGroup.Addon>
                </InputGroup>
              </FormGroup>
              <FormGroup className="stacked-input">
                <ControlLabel>Days from this Year</ControlLabel>
                <InputGroup>
                  <Input
                    type="number"
                    min={0.0}
                    step={0.5}
                    name="daysThisYear"
                    disabled={fieldsDisabled}
                    onChange={handleThisYearChange}
                    value={editData.thisYear}
                  />
                  <InputGroup.Addon>days</InputGroup.Addon>
                </InputGroup>
              </FormGroup>
              <FormGroup className="stacked-input">
                <ControlLabel>Days spent this Year</ControlLabel>
                <InputGroup>
                  <Input
                    min={0}
                    step="0.5"
                    name="daysSpent"
                    type="number"
                    disabled={fieldsDisabled}
                    onChange={handleTotalSpentChange}
                    value={editData.spent}
                  />
                  <InputGroup.Addon>days</InputGroup.Addon>
                </InputGroup>
              </FormGroup>
              <FormGroup className="stacked-input">
                <ControlLabel>Total Days Available</ControlLabel>
                <InputGroup>
                  <Input
                    min={0}
                    step="0.5"
                    name="totalDaysAvailable"
                    type="number"
                    disabled={fieldsDisabled}
                    onChange={handleTotalAvailableChange}
                    value={editData.total}
                  />
                  <InputGroup.Addon>days</InputGroup.Addon>
                </InputGroup>
              </FormGroup>
              <FormGroup className="stacked-input">
                <ControlLabel>Requested Days</ControlLabel>
                <InputGroup>
                  <Input
                    min={0}
                    step="0.5"
                    name="requestedDays"
                    type="number"
                    disabled={fieldsDisabled}
                    onChange={handleRequestedChange}
                    value={editData.requested}
                  />
                  <InputGroup.Addon>days</InputGroup.Addon>
                </InputGroup>
              </FormGroup>
              <FormGroup className="stacked-input">
                <ControlLabel>Days Remaining this Year</ControlLabel>
                <InputGroup>
                  <Input
                    min={0}
                    step="0.5"
                    name="remainingDays"
                    type="number"
                    disabled={fieldsDisabled}
                    onChange={handleRemainingChange}
                    value={editData.remaining}
                  />
                  <InputGroup.Addon>days</InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </div>
            <FormGroup
              style={{
                display: "flex",
                justifyContent: "space-around",
                border: "1px solid #ececec",
                borderRadius: "10px",
                padding: "20px",
                width: "90%",
                margin: "0 auto",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "40%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ControlLabel style={{ textAlign: "center" }}>
                  From
                </ControlLabel>
                <DatePicker
                  block
                  showWeekNumbers
                  oneTap
                  name="from"
                  type="date"
                  onChange={handleFromDateChange}
                  value={new Date(editData.from)}
                  disabled={fieldsDisabled}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "40%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ControlLabel style={{ textAlign: "center" }}>To</ControlLabel>
                <DatePicker
                  block
                  showWeekNumbers
                  oneTap
                  name="to"
                  type="date"
                  onChange={handleToDateChange}
                  value={new Date(editData.to)}
                  disabled={fieldsDisabled}
                />
              </div>
            </FormGroup>
            <div
              style={{
                border: "1px solid #ececec",
                borderRadius: "10px",
                padding: "20px",
                width: "90%",
                margin: "0 auto",
                marginBottom: "20px",
              }}
            >
              <FormGroup
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "0 auto",
                  width: "400px",
                }}
              >
                <ControlLabel style={{ textAlign: "center" }}>
                  Note
                </ControlLabel>
                <Input
                  name="note"
                  onChange={handleNoteChange}
                  value={editData.note || ""}
                  componentClass="textarea"
                  rows={3}
                  style={{ width: "100%", resize: "auto" }}
                />
              </FormGroup>
              <FormGroup
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Panel style={{ width: "100%", boxShadow: "none" }}>
                  {/* <UploadFile
                      email={props.session.user.email}
                      csrfToken={props.session.csrfToken}
                      handleFileUploadSuccess={onFileUploadSuccess}
                    /> */}
                  <Upload handleFileUploadSuccess={onFileUploadSuccess} />
                </Panel>
              </FormGroup>
            </div>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        <ButtonToolbar style={{ width: "100%" }}>
          <ButtonGroup
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={props.toggleEditModal}
              style={{ width: "33%", fontSize: "16px" }}
              appearance="default"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              style={{ width: "33%", fontSize: "16px" }}
              appearance="primary"
            >
              Confirm
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </Modal.Footer>
      <style jsx>
        {`
          :global(.stacked-input) {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 180px;
            margin: 10px 20px !important;
          }
          .input-number {
            position: absolute;
            top: -15px;
            left: -15px;
            opacity: 0.15;
            font-size: 3rem;
            font-weight: 600;
            z-index: 1;
          }
          :global(.stacked-input > .rs-control-label) {
            width: 100% !important;
            text-align: left !important;
          }
          :global(.rs-control-label) {
            font-size: 18px !mportant;
          }
          :global(.stacked-input > .rs-input-group) {
            max-width: 220px !important;
          }
          :global(.stacked-input .rs-input) {
            text-align: center;
          }
          :global(.stacked-input .rs-input-group-addon) {
          }
        `}
      </style>
    </Modal>
  )
}

export default EditModal
