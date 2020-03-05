import React from 'react'

const DashStat = props => {
  return (
    <div className='stat-wrapper'>
      <div className='stat-label'>{props.label}</div>
      <div className='stat-value'>{props.value}</div>
      <style jsx> {`
          .stat-wrapper {
            display: inline-block;
            position: relative;
            align-items: center;
            justify-content: space-between;
            font-family: 'Raleway';
            height: 100px;
            width: 220px;
          }
          .stat-value {
            position: absolute;
            font-size: 5rem;
            font-weight: 100;
            color: #67b246;
            right: 10px;
            bottom: 10px;
            z-index: 2;
          }
          .stat-label {
            position: absolute;
            left: 2px;
            font-family: 'Roboto';
            z-index: 3;
            bottom: 0px;
            font-size: 1.3rem;
            font-weight: 100;
            color: #585858;
          }
      `}
      </style>
    </div>
  )
}

export default DashStat
