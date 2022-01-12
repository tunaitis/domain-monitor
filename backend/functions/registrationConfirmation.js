exports = ({ token, tokenId, username }) => {
  const registrationEnabled = context.values.get("registrationEnabled")
  return { status: registrationEnabled === true ? "success" : "fail" }
}
