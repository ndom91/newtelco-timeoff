import React from 'react'
import { Form, Radio, RadioGroup, Panel, FormGroup, InputNumber } from 'rsuite'

export default class Calculator extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      curYears: 0,
      curMonths: 0,
      daysAvailable: 0,
      displayCalc: ''
    }
  }

  handleMonthsChange = (value) => {
    let daysAvailable
    if (value < 13) {
      daysAvailable = (value / 12) * 26
    } else if (value > 12) {
      daysAvailable = 26
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
    if (value < 5 && value > 1) {
      daysAvailable = 26 + parseInt(value) - 1
    } else if (value >= 5) {
      daysAvailable = 30
    } else if (value == 1) {
      daysAvailable = 26
    } else {
      daysAvailable = 0
    }
    this.setState({
      curYears: value,
      daysAvailable
    })
  }

  handleLengthChange = (value) => {
    console.log(value)
    if (value === 'years') {
      this.setState({
        displayCalc: 'years'
      })
    } else if (value === 'months') {
      this.setState({
        displayCalc: 'months'
      })
    }
  }

  render() {
    const {
      curMonths,
      curYears,
      daysAvailable,
      displayCalc
    } = this.state

    return (
      <div className='calc-wrapper'>
        <span style={{ fontSize: '1.2rem' }}>How long have you been at <font style={{ color: '#67B246' }}>Newtelco</font>?</span>
        <Panel className='calc-panel-body' style={{ boxShadow: 'none', marginTop: '15px', marginBottom: '20px', width: '100%', padding: '0' }}>
          <RadioGroup onChange={this.handleLengthChange} name='radioList' inline appearance='picker' defaultValue='years' style={{ width: '170px' }}>
            <Radio className='calc-radio-item' value='years'>1 Year+</Radio>
            <Radio className='calc-radio-item' value='months'>1-12 Months</Radio>
          </RadioGroup>
          <Form>
            {displayCalc === 'months' ? (
              <FormGroup>
                <InputNumber name='months' inputMode='numeric' className='calc-input' onChange={this.handleMonthsChange} value={curMonths} min={0} max={12} postfix='months' />
                <Panel bordered style={{ boxShadow: 'none', height: '40px', marginTop: '15px', width: '170px' }}>
                  {curMonths !== 0 && (
                    <span className='days-available'>
                      {`${parseInt(daysAvailable)} days earned`}
                    </span>
                  )}
                </Panel>
              </FormGroup>
            ) : (
                <FormGroup>
                  <InputNumber name='years' inputMode='numeric' className='calc-input' onChange={this.handleYearsChange} value={curYears} min={0} postfix='years' />
                  <Panel bordered style={{ boxShadow: 'none', height: '40px', marginTop: '15px', width: '170px', fontWeight: '300' }}>
                    {curYears !== 0 && (
                      <span className='days-available'>
                        {`${daysAvailable} days earned`}
                      </span>
                    )}
                  </Panel>
                </FormGroup>
              )}
          </Form>
        </Panel>
        <style jsx>{`
          .calc-wrapper {
            background-color: #fff;
            border-radius: 10px;
            padding: 20px;
            margin-left: 10px;
            margin-right: 10px;
          }
          :global(.calc-radio-item) {
            padding: 5px;
          }
          :global(.calc-input) {
            width: 170px !important;
            margin-top: 15px;
          }
          :global(.calc-panel-body  .rs-panel-body) {
            padding: 0 !important;
          }
          :global(.calc-wrapper .rs-radio-group-picker .rs-radio-checker > label) {
            padding: 4px !important;
          }
          :global(.calc-wrapper .rs-radio-group-picker .rs-radio-inline) {
            margin-left: 0 !important;
          }
          .days-available {
            position: absolute;
            right: 80px;
            top: 202px;
            margin-left: 15px;
            font-size: 1.1rem;
          }
        `}
        </style>
      </div>
    )
  }
}
