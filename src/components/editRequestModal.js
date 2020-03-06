import React, { useState, useEffect } from 'react'
import UploadFile from '../components/uploadfile'
import BarLoader from 'react-spinners/ClipLoader'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import {
  Button,
  ButtonToolbar,
  ButtonGroup,
  Panel,
  Modal,
  Form,
  Input,
  FormGroup,
  ControlLabel,
  DatePicker,
  InputNumber,
  Notification
} from 'rsuite'

const notifySuccess = (header, text) => {
  Notification.success({
    title: header,
    duration: 2000,
    description: <div className='notify-body'>{text}</div>
  })
}

const notifyError = (header, text) => {
  Notification.error({
    title: header,
    duration: 3000,
    description: <div className='notify-body'>{text}</div>
  })
}

const EditModal = props => {
  const openEditModal = props.open
  const [loading, setLoading] = useState(false)
  const [fieldsDisabled, setEditable] = useState(false)
  const [editData, setData] = useState([''])
  const [files, setFiles] = useState([])

  useEffect(() => {
    setData(props.data)
  }, [])

  const onFileUploadSuccess = (newFiles) => {
    if (Array.isArray(newFiles)) {
      newFiles.forEach(newFile => {
        setFiles([...files, newFile])
      })
    } else {
      setFiles([...files, newFiles])
    }
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

    const oldData = props.rowData
    const updateIndex = oldData.findIndex(entry => entry.id === editData.id)
    const oldFiles = JSON.parse(oldData[updateIndex].files)
    const newFiles = oldFiles.concat(files)

    const toSubmitData = editData
    toSubmitData.from = moment(editData.from).format('YYYY-MM-DD')
    toSubmitData.to = moment(editData.to).format('YYYY-MM-DD')
    console.log(toSubmitData)

    fetch(`${protocol}//${host}/api/user/entries/update`, {
      method: 'POST',
      body: JSON.stringify({
        editData: toSubmitData,
        files: newFiles
      }),
      headers: {
        'X-CSRF-TOKEN': props.session.csrfToken
      }
    })
      .then(data => data.json())
      .then(data => {
        if (data.updateQuery.affectedRows === 1) {
          const oldData = props.rowData
          const updateIndex = oldData.findIndex(entry => entry.id === editData.id)
          const oldFiles = JSON.parse(oldData[updateIndex].files)
          files.forEach(file => oldFiles.push(file))

          // console.log(oldData[updateIndex])
          // console.log(oldFiles)
          // console.log(files)

          oldData[updateIndex].note = editData.note
          oldData[updateIndex].files = JSON.stringify(oldFiles)
          if (!fieldsDisabled) {
            oldData[updateIndex].fromDate = moment(editData.from).format('DD.MM.YYYY')
            oldData[updateIndex].toDate = moment(editData.to).format('DD.MM.YYYY')
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
          notifySuccess('Update Success')
        } else {
          notifyError('Update Failed')
          props.toggleEditModal()
        }
      })
      .catch(err => console.error(err))
  }

  return (
    <Modal enforceFocus size='sm' backdrop show={openEditModal} onHide={props.toggleEditModal} style={{ marginTop: '40px' }}>
      <Modal.Header>
        <Modal.Title style={{ textAlign: 'center', fontSize: '24px' }}>Edit Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className='edit-loader-wrapper'>
            <BarLoader width={80} height={3} color='#575757' loading={loading} />
          </div>
        ) : (
          <Form layout='horizontal'>
            <div
              style={{
                border: '1px solid #ececec',
                borderRadius: '10px',
                padding: '20px',
                width: '80%',
                margin: '0 auto',
                marginBottom: '20px'
              }}
            >
              <FormGroup className='stacked-input'>
                <ControlLabel>Type</ControlLabel>
                <Input name='type' disabled value={editData.type} style={{ width: '300px' }} />
              </FormGroup>
              <FormGroup className='stacked-input'>
                <ControlLabel>Days from Last Year</ControlLabel>
                <InputNumber postfix='days' min={0} name='daysLastYear' inputMode='numeric' disabled={fieldsDisabled} onChange={handleLastYearChange} value={editData.lastYear} />
              </FormGroup>
              <FormGroup className='stacked-input'>
                <ControlLabel>Days from this Year</ControlLabel>
                <InputNumber postfix='days' min={0} name='daysThisYear' inputMode='numeric' disabled={fieldsDisabled} onChange={handleThisYearChange} value={editData.thisYear} />
              </FormGroup>
              <FormGroup className='stacked-input'>
                <ControlLabel>Days spent this Year</ControlLabel>
                <InputNumber postfix='days' min={0} name='daysSpent' inputMode='numeric' disabled={fieldsDisabled} onChange={handleTotalSpentChange} value={editData.spent} />
              </FormGroup>
              <FormGroup className='stacked-input'>
                <ControlLabel>Total Days Available</ControlLabel>
                <InputNumber postfix='days' min={0} name='totalDaysAvailable' inputMode='numeric' disabled={fieldsDisabled} onChange={handleTotalAvailableChange} value={editData.total} />
              </FormGroup>
              <FormGroup className='stacked-input'>
                <ControlLabel>Requested Days</ControlLabel>
                <InputNumber postfix='days' min={0} name='requestedDays' inputMode='numeric' disabled={fieldsDisabled} onChange={handleRequestedChange} value={editData.requested} />
              </FormGroup>
              <FormGroup className='stacked-input'>
                <ControlLabel>Days Remaining this Year</ControlLabel>
                <InputNumber postfix='days' min={0} name='remainingDays' inputMode='numeric' disabled={fieldsDisabled} onChange={handleRemainingChange} value={editData.remaining} />
              </FormGroup>
            </div>
            <FormGroup
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                backgroundColor: '#ececec82',
                borderRadius: '10px',
                padding: '20px',
                width: '80%',
                margin: '0 auto',
                marginBottom: '30px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '40%',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ControlLabel style={{ textAlign: 'center' }}>From</ControlLabel>
                <DatePicker showWeekNumbers oneTap name='from' type='date' onChange={handleFromDateChange} value={editData.from} disabled={fieldsDisabled} />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '40%',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ControlLabel style={{ textAlign: 'center' }}>To</ControlLabel>
                <DatePicker showWeekNumbers oneTap name='to' type='date' onChange={handleToDateChange} value={editData.to} disabled={fieldsDisabled} />
              </div>
            </FormGroup>
            <div
              style={{
                border: '1px solid #ececec',
                borderRadius: '10px',
                padding: '20px',
                width: '80%',
                margin: '0 auto',
                marginBottom: '20px'
              }}
            >
              <FormGroup
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <ControlLabel style={{ textAlign: 'center' }}>Note</ControlLabel>
                <Input
                  name='note'
                  onChange={handleNoteChange}
                  value={editData.note || ''}
                  componentClass='textarea'
                  rows={3}
                  style={{ width: '100%', resize: 'auto' }}
                />
              </FormGroup>
              <FormGroup
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Panel style={{ maxWidth: '300px', boxShadow: 'none' }}>
                  <UploadFile
                    email={props.session.user.email}
                    csrfToken={props.session.csrfToken}
                    handleFileUploadSuccess={onFileUploadSuccess}
                  />
                </Panel>
              </FormGroup>
            </div>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonToolbar style={{ width: '100%' }}>
          <ButtonGroup style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button onClick={props.toggleEditModal} style={{ width: '33%', fontSize: '16px' }} appearance='default'>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} style={{ width: '33%', fontSize: '16px' }} appearance='primary'>
              Confirm
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </Modal.Footer>
      <style jsx>{`
        :global(.stacked-input) {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        :global(.stacked-input > .rs-control-label) {
          width: 100% !important;
          text-align: center !important;
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
