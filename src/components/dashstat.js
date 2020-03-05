import React from 'react'

const DashStat = props => {
  return (
    <div className='stat-wrapper'>
      <div className='stat-value'>{props.value}</div>
      <div className='stat-label'>{props.label}</div>
      <style jsx> {`
          .stat-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
            font-family: 'Roboto';
          }
          .stat-value {
            font-size: 5rem;
            font-weight: 600;
            color: #585858;
          }
          .stat-label {
            font-size: 1.5rem;
            font-weight: 100;
            color: #585858;
          }
      `}
      </style>
    </div>
  )
}

export default DashStat
