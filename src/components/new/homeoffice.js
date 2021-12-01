import { useState } from "react"
import {
  Form,
  Input,
  Panel,
  Button,
  FormGroup,
  ButtonGroup,
  ControlLabel,
  DateRangePicker,
  SelectPicker,
  HelpBlock,
  Checkbox,
  CheckboxGroup,
} from "rsuite"
import DayCheckbox from "./dayCheckbox"

const HomeOffice = ({ values, options }) => {
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedWeek, setSelectedWeek] = useState({ start: "", end: "" })
  const { availableManagers, successfullySent } = values
  const {
    handleManagerChange,
    handleNotesChange,
    handleWeekChange,
    handleClear,
    toggleSubmitModal,
  } = options

  return (
    <Panel
      bordered
      style={{ padding: "10px" }}
      id="which-days"
      header={
        <h4 className="form-section-heading" style={{ position: "relative" }}>
          Home Office
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ marginLeft: "15px" }}
            width={25}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </h4>
      }
    >
      <Form>
        <FormGroup>
          <ControlLabel>Week</ControlLabel>
          <DateRangePicker
            block
            oneTap
            placement="top"
            showWeekNumbers
            showOneCalendar
            hoverRange="week"
            onChange={(val) => handleWeekChange(val)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Days</ControlLabel>
          {/* <HelpBlock> */}
          {/*   Please select the days on which you would like to work at home, max */}
          {/*   of 2 per week */}
          {/* </HelpBlock> */}
          <div className="weekCheck-wrapper">
            <DayCheckbox id="ho-mon" day="monday" />
            <DayCheckbox id="ho-tue" day="tuesday" />
            <DayCheckbox id="ho-wed" day="wednesday" />
            <DayCheckbox id="ho-thu" day="thursday" />
            <DayCheckbox id="ho-fri" day="friday" />
          </div>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Manager</ControlLabel>
          <SelectPicker
            block
            data={availableManagers}
            onChange={handleManagerChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Note</ControlLabel>
          <Input
            componentClass="textarea"
            rows={3}
            placeholder="Optional Note"
            onChange={handleNotesChange}
          />
        </FormGroup>
        <FormGroup>
          <ButtonGroup justified>
            <Button
              style={{ width: "50%" }}
              onClick={handleClear}
              appearance="default"
            >
              Clear
            </Button>
            <Button
              style={{ width: "50%" }}
              onClick={toggleSubmitModal}
              disabled={successfullySent}
              appearance="primary"
            >
              Submit
            </Button>
          </ButtonGroup>
        </FormGroup>
      </Form>
      <style jsx>
        {`
          :global(.rs-checkbox-checker label) {
          }
          .weekCheck-wrapper {
            display: flex;
            justify-content: space-around;
            margin: 20px auto;
          }
        `}
      </style>
    </Panel>
  )
}

export default HomeOffice
