import React, { useState } from "react"
import { Dropdown } from "react-bootstrap"
import "./DomainListItem.css"
import { Domain, useDomain } from "../contexts/Domain"
import classNames from "classnames"

const daysLeft = function (date: Date): string {
  const now = new Date()
  if (date > now) {
    return (
      Math.round(Math.abs((date.getTime() - now.getTime()) / 86400000)) +
      " days"
    )
  }
  return "available"
}

interface DomainListItemProps {
  domain: Domain
}

function DomainListItem({ domain }: DomainListItemProps) {
  const [isBusy, setBusy] = useState(false)
  const { updateDomain, removeDomain } = useDomain()

  const handleUpdate = async () => {
    setBusy(true)
    await updateDomain(domain)
    setBusy(false)
  }
  const handleRemove = async () => {
    setBusy(true)
    await removeDomain(domain)
  }

  return (
    <div className="col-12 col-sm-6 col-md-4 mb-3">
      <div
        className={classNames("card", {
          "bg-success bg-opacity-10": new Date() > domain.current.expiry,
        })}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 text-truncate" title={domain.name}>
              {isBusy ? (
                <span
                  className="spinner-border spinner-border-sm text-secondary me-1"
                  role="status"
                />
              ) : null}
              {domain.name}
            </h6>
            <Dropdown>
              <Dropdown.Toggle variant="vertical-ellipsis">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="ellipsis-v"
                  className=""
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 512"
                  height="24"
                >
                  <path
                    fill="#777"
                    d="M32 224c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM0 136c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32-32 14.3-32 32zm0 240c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32-32 14.3-32 32z"
                  />
                </svg>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={handleUpdate}>
                  Update Now
                  <br />
                  <span className="text-black small text-opacity-50">
                    Last updated:
                    <br /> {domain.updated.toLocaleString()}
                  </span>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleRemove}>Remove</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="text-muted small">
            {daysLeft(domain.current.expiry)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DomainListItem
