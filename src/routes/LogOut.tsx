import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useRealm } from "../contexts/Realm"

function LogOut() {
  const { logOut } = useRealm()
  const navigate = useNavigate()
  useEffect(() => {
    logOut()
    navigate("/login")
  }, [logOut, navigate])
  return null
}

export default LogOut
