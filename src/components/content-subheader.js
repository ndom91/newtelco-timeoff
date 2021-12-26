const Subheader = (props) => {
  return (
    <div
      style={{
        textAlign: "left",
        width: "100%",
        marginLeft: "20px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ fontWeight: "100" }}>{props.header}</h3>
      <h5>{props.subheader}</h5>
    </div>
  )
}

export default Subheader
