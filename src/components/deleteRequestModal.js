import React from "react"
import { notifySuccess, notifyError } from "../lib/notify"
import { Button, ButtonToolbar, ButtonGroup, Modal, Table } from "rsuite"

const { Column, HeaderCell, Cell } = Table

const DeleteModal = (props) => {
  console.log(props)
  const handleSubmitDelete = () => {
    const deleteId = props.toDelete
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/user/entries/delete?id=${deleteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.deleteQuery.affectedRows > 0) {
          notifySuccess("Request Deleted")
        } else {
          notifyError("Error Deleting Request")
        }
        const newRowData = props.rowData.filter((row) => row.id !== deleteId)
        props.setRowData(newRowData)
        props.toggleDeleteModal()
        props.gridApi.refreshCells()
      })
      .catch((err) => console.error(err))
  }

  return (
    <Modal
      enforceFocus
      size="sm"
      backdrop
      show={props.open}
      onHide={props.toggleDeleteModal}
      style={{ marginTop: "150px" }}
    >
      <Modal.Header>
        <Modal.Title style={{ textAlign: "center", fontSize: "24px" }}>
          Confirm Submit
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span
          style={{ textAlign: "center", display: "block", fontWeight: "600" }}
        >
          Are you sure you want to delete this request?
        </span>
        <Table
          showHeader={false}
          autoHeight
          bordered={false}
          data={props.data}
          style={{ margin: "20px 50px" }}
        >
          <Column width={200} align="left">
            <HeaderCell>Field: </HeaderCell>
            <Cell dataKey="title" />
          </Column>
          <Column width={250} align="left">
            <HeaderCell>Value: </HeaderCell>
            <Cell dataKey="value" />
          </Column>
        </Table>
      </Modal.Body>
      <Modal.Footer style={{ display: "flex", justifyContent: "center" }}>
        <ButtonToolbar style={{ width: "100%" }}>
          <ButtonGroup
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button
              onClick={props.toggleDeleteModal}
              style={{ width: "33%", fontSize: "16px" }}
              appearance="default"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDelete}
              style={{ width: "33%", fontSize: "16px" }}
              appearance="primary"
            >
              Confirm
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteModal
