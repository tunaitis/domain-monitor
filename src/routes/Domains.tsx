import React, { useEffect } from "react"
import DomainInput from "../components/DomainInput"
import DomainList from "../components/DomainList"
import { DomainProvider } from "../contexts/Domain"
import { useNavigate } from "react-router-dom"
import { useRealm } from "../contexts/Realm"

function Domains() {
  const { user } = useRealm()
  const navigate = useNavigate()

  useEffect(() => {
    if (user === null) {
      navigate("/login")
      return
    }
  }, [user, navigate])

  if (user === null) {
    return <div></div>
  }

  return (
    <div>
      <DomainProvider>
        <DomainInput />
        <h4 className="mb-3">Domains</h4>
        <DomainList />
      </DomainProvider>
    </div>
  )
}

export default Domains
