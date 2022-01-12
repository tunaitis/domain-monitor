import React from "react"
import { useDomain } from "../contexts/Domain"
import DomainListItem from "./DomainListItem"

function DomainList() {
  const { state } = useDomain()

  if (state.isLoading) {
    return <div>Loading...</div>
  }

  if (state.domains.length === 0) {
    return <div>No domains yet</div>
  }

  return (
    <div className="row">
      {state.domains.map((d) => (
        <DomainListItem key={d._id} domain={d} />
      ))}
    </div>
  )
}

export default DomainList
