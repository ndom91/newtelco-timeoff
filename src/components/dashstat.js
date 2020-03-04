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
          }
          .stat-value {
            font-size: 5rem;
            font-weight: 600;
            color: #fff;
          }
          .stat-label {
            font-size: 1.5rem;
            font-weight: 200;
            color: #fff;
          }
      `}
      </style>
    </div>
  )
}

export default DashStat
