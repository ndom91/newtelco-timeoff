export const Dashboard = props => {
  return (
    <span
      style={{
        position: 'absolute',
        left: '20px',
        top: '8px'
      }}
    >
      <svg fill='none' width={props.width || 36} height={props.height || 36} viewBox='0 0 24 24' stroke='currentColor' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' /></svg>
    </span>
  )
}

export const New = props => {
  return (
    <span
      style={{
        position: 'absolute',
        left: '20px',
        top: '8px'
      }}
    >
      <svg fill='none' width={props.width || 36} height={props.height || 36} viewBox='0 0 24 24' stroke='currentColor' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>
    </span>
  )
}

export const User = props => {
  return (
    <span
      style={{
        position: 'absolute',
        left: '20px',
        top: '8px'
      }}
    >
      <svg fill='none' width={props.width || 36} height={props.height || 36} viewBox='0 0 24 24' stroke='currentColor' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' /></svg>
    </span>
  )
}

export const Team = props => {
  return (
    <span
      style={{
        position: 'absolute',
        left: '20px',
        top: '8px'
      }}
    >
      <svg fill='none' width={props.width || 36} height={props.height || 36} viewBox='0 0 24 24' stroke='currentColor' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' /></svg>
    </span>
  )
}

export const Settings = props => {
  return (
    <span
      style={{
        position: 'absolute',
        left: '20px',
        top: '8px'
      }}
    >
      <svg fill='none' width={props.width || 36} height={props.height || 36} viewBox='0 0 24 24' stroke='currentColor' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' /></svg>
    </span>
  )
}
