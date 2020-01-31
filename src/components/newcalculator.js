import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Form, FormGroup, ControlLabel, FormControl } from 'rsuite'
import 'react-tabs/style/react-tabs.css'

export default class Calculator extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      curYears: 0,
      curMonths: 0,
      daysAvailable: 0
    }
  }

  handleMonthsChange = (value) => {
    let daysAvailable
    if (value < 13) {
      daysAvailable = (value / 12) * 26
    } else if (value > 12) {
      daysAvailable = 'Invalid'
    } else {
      daysAvailable = 0
    }
    this.setState({
      curMonths: value,
      daysAvailable
    })
  }

  handleYearsChange = (value) => {
    let daysAvailable
    if (value < 5) {
      daysAvailable = 26 + parseInt(value)
    } else if (value >= 5) {
      daysAvailable = 30
    } else {
      daysAvailable = 0
    }
    console.log(value, daysAvailable)
    this.setState({
      curYears: value,
      daysAvailable
    })
  }

  render () {
    const {
      curMonths,
      curYears,
      daysAvailable
    } = this.state

    return (
      <div className='calc-wrapper'>
        <span style={{ fontSize: '1.2rem' }}>How long have you been at Newtelco?</span>
        <Tabs style={{ marginTop: '15px' }}>
          <TabList>
            <Tab>Less than 1 Year</Tab>
            <Tab>More than 1 Year</Tab>
          </TabList>
          <TabPanel>
            <Form>
              <FormGroup>
                <ControlLabel>How many Months?</ControlLabel>
                <FormControl name='months' inputMode='numeric' className='calc-input' onChange={this.handleMonthsChange} value={curMonths} />
                {curMonths !== 0 && (
                  <span className='days-available'>
                    {`${parseInt(daysAvailable)} days earned`}
                  </span>
                )}
              </FormGroup>
            </Form>
          </TabPanel>
          <TabPanel>
            <Form>
              <FormGroup>
                <ControlLabel>How many Years?</ControlLabel>
                <FormControl name='years' inputMode='numeric' className='calc-input' onChange={this.handleYearsChange} value={curYears} />
                {curYears !== 0 && (
                  <span className='days-available'>
                    {`${daysAvailable} days earned`}
                  </span>
                )}
              </FormGroup>
            </Form>
          </TabPanel>
        </Tabs>
        <style jsx>{`
          .calc-wrapper {
            position: absolute;
            height: 200px;
            width: 400px;
            right: 10px;
            top: 50%;
            background-color: #fff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 0 rgba(90,97,105,.25), 0 4px 8px rgba(90,97,105,.52), 0 10px 10px rgba(90,97,105,.16), 0 7px 70px rgba(90,97,105,.2);
          }
          :global(.calc-input) {
            max-width: 100px !important;
          }
          .days-available {
            margin-left: 65px;
            font-size: 1.2rem;
          }
        `}
        </style>
      </div>
    )
  }
}