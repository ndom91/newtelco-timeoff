const DashStat = (props) => {
  return (
    <div className="stat-wrapper">
      <div className="icon-wrapper">
        {props.type === "lastYear" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#eaeaea"
            height={50}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
        {props.type === "thisYear" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#eaeaea"
            height={50}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {props.type === "spent" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#eaeaea"
            height={50}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        )}
        {props.type === "available" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#eaeaea"
            height={50}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <div className="stat-label">{props.label}</div>
      <div className="stat-value">{props.value}</div>
      <style jsx>
        {`
          .stat-wrapper {
            display: inline-block;
            position: relative;
            align-items: center;
            justify-content: space-between;
            font-family: "Raleway";
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
            font-family: "Roboto";
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
