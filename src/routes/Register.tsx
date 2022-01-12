import React, { FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import Alert from "../components/Alert"
import { useRealm } from "../contexts/Realm"

function Register() {
  const { createUser, logIn } = useRealm()
  const [error, setError] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("")
  const [isBusy, setBusy] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    setError("")
    setBusy(true)

    e.preventDefault()
    if (password !== passwordConfirmation) {
      setBusy(false)
      setError("passwords do not match")
      return
    }

    let err = await createUser(email, password)
    if (err !== null) {
      setBusy(false)
      setError(err.message)
      return
    }

    err = await logIn(email, password)
    if (err !== null) {
      setBusy(false)
      setError(err.message)
      return
    }
    navigate("/")
  }
  return (
    <form className="row justify-content-center" onSubmit={handleSubmit}>
      <div className="col-12 col-sm-7 col-md-7">
        <h3 className="mb-4 text-center">Create Account</h3>
        <p className="text-muted text-center mb-5">
          Already have an account? <a href="/login">Sign in here</a>
        </p>
        <Alert text={error} onClose={() => setError("")} />
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBusy ? true : undefined}
            required
          />
          <label htmlFor="email" className="text-muted">
            Email
          </label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBusy ? true : undefined}
            required
          />
          <label htmlFor="password" className="text-muted">
            Password
          </label>
        </div>
        <div className="form-floating mb-5">
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            placeholder="confirm password"
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={isBusy ? true : undefined}
            required
          />
          <label htmlFor="confirmPassword" className="text-muted">
            Confirm password
          </label>
        </div>
        <div className="mb-3">
          <button
            className="btn btn-primary w-100 btn-lg"
            disabled={isBusy ? true : undefined}
          >
            Create Account
          </button>
        </div>
      </div>
    </form>
  )
}

export default Register
