import React from 'react'

const DashStat = props => {
  return (
    <div className='stat-wrapper'>
      <div className='stat-label'>{props.label}</div>
      <div className='stat-value'>{props.value}</div>
      <style jsx> {`
          .stat-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: 'Roboto';
          }
          .stat-value {
            font-size: 4rem;
            font-weight: 100;
            color: #67b246;
          }
          .stat-label {
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
