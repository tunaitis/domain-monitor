import React, { FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import Alert from "../components/Alert"
import { useRealm } from "../contexts/Realm"

function LogIn() {
  const { logIn } = useRealm()
  const [error, setError] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isBusy, setBusy] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)

    setPassword("")
    const err = await logIn(email, password)
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
        <h3 className="mb-4 text-center">Sign In</h3>
        <p className="text-muted text-center mb-5">
          Don't have an account yet? <a href="/register">Sign up here</a>
        </p>
        <Alert text={error} onClose={() => setError("")} />
        <div className="form-floating mb-4">
          <input
            type="email"
            className="form-control"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            disabled={isBusy ? true : undefined}
            required
          />
          <label htmlFor="email" className="text-muted">
            Email
          </label>
        </div>
        <div className="form-floating mb-5">
          <input
            type="password"
            className="form-control"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            disabled={isBusy ? true : undefined}
            required
          />
          <label htmlFor="password" className="text-muted">
            Password
          </label>
        </div>
        <div>
          <button
            className="btn btn-primary btn-lg w-100"
            type="submit"
            disabled={isBusy ? true : undefined}
          >
            Sign In
          </button>
        </div>
      </div>
    </form>
  )
}

export default LogIn
