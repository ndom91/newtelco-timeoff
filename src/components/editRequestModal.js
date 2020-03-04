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
  Alert
} from 'rsuite'

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
    console.log(oldFiles, files)
    const newFiles = oldFiles.concat(files)
    console.log(newFiles)
    // console.log(typeof oldFiles, oldFiles, oldFiles[0])
    // files.forEach(file => oldFiles.push(file))
    // console.log(typeof files, files)

    fetch(`${protocol}//${host}/api/user/entries/update`, {
      method: 'POST',
      body: JSON.stringify({
        editData: editData,
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

          console.log(oldData[updateIndex])
          console.log(oldFiles)
          console.log(files)

          oldData[updateIndex].note = editData.note
          oldData[updateIndex].files = JSON.stringify(oldFiles)
          if (!fieldsDisabled) {
            oldData[updateIndex].fromDate = moment(editData.from).toISOString()
            oldData[updateIndex].toDate = moment(editData.to).toISOString()
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
          Alert.success('Update Success')
        } else {
          Alert.error('Update Failed')
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
            <FormGroup>
              <ControlLabel>Type</ControlLabel>
              <Input name='type' disabled value={editData.type} style={{ width: '300px' }} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Days from Last Year</ControlLabel>
              <InputNumber postfix='days' min={0} name='daysLastYear' inputMode='numeric' disabled={fieldsDisabled} onChange={handleLastYearChange} value={editData.lastYear} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Days from this Year</ControlLabel>
              <InputNumber postfix='days' min={0} name='daysThisYear' inputMode='numeric' disabled={fieldsDisabled} onChange={handleThisYearChange} value={editData.thisYear} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Days spent this Year</ControlLabel>
              <InputNumber postfix='days' min={0} name='daysSpent' inputMode='numeric' disabled={fieldsDisabled} onChange={handleTotalSpentChange} value={editData.spent} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Total Days Available</ControlLabel>
              <InputNumber postfix='days' min={0} name='totalDaysAvailable' inputMode='numeric' disabled={fieldsDisabled} onChange={handleTotalAvailableChange} value={editData.total} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Requested Days</ControlLabel>
              <InputNumber postfix='days' min={0} name='requestedDays' inputMode='numeric' disabled={fieldsDisabled} onChange={handleRequestedChange} value={editData.requested} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Days Remaining this Year</ControlLabel>
              <InputNumber postfix='days' min={0} name='remainingDays' inputMode='numeric' disabled={fieldsDisabled} onChange={handleRemainingChange} value={editData.remaining} />
            </FormGroup>
            <hr
              style={{
                marginTop: '40px',
                marginBottom: '40px',
                border: '0',
                borderTop: '2px solid #67b246',
                width: '75%'
              }}
            />
            <FormGroup
              style={{
                display: 'flex',
                justifyContent: 'space-around'
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
            <FormGroup>
              <hr
                style={{
                  marginTop: '40px',
                  marginBottom: '40px',
                  border: '0',
                  borderTop: '2px solid #67b246',
                  width: '75%'
                }}
              />
              <ControlLabel>Note</ControlLabel>
              <Input
                name='note'
                onChange={handleNoteChange}
                value={editData.note || ''}
                componentClass='textarea'
                rows={3}
                style={{ width: 300, resize: 'auto' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Add File</ControlLabel>
              <Panel bordered style={{ maxWidth: '300px', boxShadow: 'none' }}>
                <UploadFile
                  email={props.session.user.email}
                  csrfToken={props.session.csrfToken}
                  handleFileUploadSuccess={onFileUploadSuccess}
                />
              </Panel>
            </FormGroup>
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
    </Modal>
  )
}

export default EditModal
