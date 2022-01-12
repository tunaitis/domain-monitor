import React from "react"
import logo from "../logo.svg"
import { useRealm } from "../contexts/Realm"
import "./Header.css"

function Header() {
  const { user } = useRealm()
  return (
    <nav className="navbar navbar-expand-sm navbar-light mb-4">
      <div className="d-flex justify-content-between align-items-center w-100">
        <a href="/" className="navbar-brand">
          <img src={logo} height="32" alt="Logo" />
          <span className="fs-4 ms-2">Domain Monitor</span>
        </a>
        <div className="">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                href="https://github.com/tunaitis/domain-monitor"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            {user !== null ? (
              <li className="nav-item">
                <a href="/logout" className="nav-link">
                  Sign Out
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Header
