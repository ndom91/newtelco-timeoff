import { useState } from "react"

const DayCheckbox = ({ day }) => {
  const [checked, setChecked] = useState(false)
  return (
    <div className="day-checkbox">
      <div className="check-image">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 checked"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#67b246"
          width={32}
          onClick={() => setChecked(!checked)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 unchecked"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width={32}
          onClick={() => setChecked(!checked)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <input
        className="day-input"
        type="checkbox"
        name={day}
        value={day}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <label className="check-label">{day.substring(0, 3)}</label>
      <style jsx>{`
        .day-checkbox {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 1px;
          margin: 2px;
        }
        .day-checkbox:hover {
          cursor: pointer;
        }
        .check-image {
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
        }
        .unchecked {
          color: #ccc;
          display: ${checked ? "none" : "block"};
          opacity: ${checked ? "0" : "1"}:;
        }
        .checked {
          display: ${checked ? "block" : "none"};
          opacity: ${checked ? "1" : "0"}:;
        }
        .checked,
        .unchecked {
          transition: opacity 250ms ease-in-out;
        }
        .check-label {
          text-: center;
          text-transform: uppercase;
        }
        .day-input {
          display: none;
        }
        :global(.alert-enter) {
          opacity: 0;
        }
        :global(.alert-enter-active) {
          opacity: 1;
          transition: opacity 200ms ease-in-out;
        }
        :global(.alert-exit) {
          opacity: 1;
        }
        :global(.alert-exit-active) {
          opacity: 0;
          transition: opacity 200ms ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default DayCheckbox
