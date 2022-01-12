import React, { FormEvent, useState } from "react"
import { Button } from "react-bootstrap"
import Alert from "./Alert"
import { useDomain } from "../contexts/Domain"

function DomainInput() {
  const { addDomain } = useDomain()
  const [value, setValue] = useState("")
  const [isBusy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!value) return
    setBusy(true)
    const err = await addDomain(value)
    if (err !== null) {
      setError(err.message)
      setBusy(false)
      return
    }
    setBusy(false)
    setValue("")
  }

  return (
    <div>
      <Alert text={error} onClose={() => setError("")} />
      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="d-flex">
          <div className="form-floating w-100">
            <input
              type="text"
              className="form-control form-control-lg"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              disabled={isBusy ? true : undefined}
              placeholder="domain name"
            />
            <label className="mb-2 text-muted" htmlFor="domain">
              Add a domain
            </label>
          </div>
          <Button
            variant="primary"
            className="ms-3 px-4"
            type="submit"
            disabled={isBusy ? true : undefined}
          >
            Add
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DomainInput
