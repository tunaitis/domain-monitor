import React from "react"

interface ErrorProps {
  text: string
  onClose: () => void
}

function Alert({ text, onClose }: ErrorProps) {
  if (text === "") {
    return null
  }

  text = text.charAt(0).toUpperCase() + text.slice(1)

  return (
    <div className="mb-4 alert alert-warning alert-dismissible">
      {text}
      <button type="button" className="btn-close" onClick={onClose} />
    </div>
  )
}

export default Alert
