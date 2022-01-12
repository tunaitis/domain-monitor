import React, { useEffect } from "react"
import { MongoDBRealmError } from "realm-web"
import { useRealm } from "./Realm"

interface State {
  domains: Domain[]
  isLoading: boolean
}

type Action =
  | { type: "add"; payload: Domain }
  | { type: "remove"; payload: Domain }
  | { type: "update"; payload: Domain }
  | { type: "load"; payload: Domain[] }
  | { type: "loading"; payload: boolean }

export interface DomainInfo {
  status: string[]
  nameServer: string[]
  expiry: Date
  isAvailable: boolean
}

export interface Domain {
  _id: string
  name: string
  userId: string

  created: Date
  updated: Date

  current: DomainInfo
  prev: DomainInfo | null

  notificationEmail: string
  notificationSent: Date
}

interface Context {
  state: State
  addDomain: (name: string) => Promise<Error | null>
  removeDomain: (domain: Domain) => void
  updateDomain: (domain: Domain) => void
}

const DomainContext = React.createContext<Context>({} as Context)

function domainReducer(state: State, action: Action) {
  switch (action.type) {
    case "add":
      const newDomains = [...state.domains, action.payload]
      newDomains.sort((a, b) => (a.current.expiry > b.current.expiry ? 1 : -1))
      return { ...state, domains: newDomains }
    case "load":
      const domains = action.payload
      domains.sort((a, b) => (a.current.expiry > b.current.expiry ? 1 : -1))
      return { ...state, domains: domains }
    case "loading":
      return { ...state, isLoading: action.payload }
    case "remove":
      const domain = action.payload
      const index = state.domains.indexOf(domain)
      const x = [...state.domains]
      x.splice(index, 1)
      return { ...state, domains: x }
    case "update":
      const updatedDomains = state.domains.map((d) => {
        if (d._id === action.payload._id) {
          return { ...d, ...action.payload }
        }
        return d
      })
      return { ...state, domains: updatedDomains }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
    }
  }
}

type DomainProviderProps = { children: React.ReactNode }

function validateDomain(name: string): Error | null {
  const match = name.match(/^([^-][A-Za-z0-9-]{1,63})\.([A-Za-z]{2,6})$/i)
  if (match === null) {
    return Error("Invalid domain name")
  }
  const allowedTld = ["com", "net", "org"]

  const [, , tld] = match

  if (!allowedTld.includes(tld)) {
    return Error(
      `Only the following TLDs are supported: ${allowedTld.join(", ")}.`
    )
  }
  return null
}

function DomainProvider({ children }: DomainProviderProps) {
  const { user } = useRealm()
  const [state, dispatch] = React.useReducer(domainReducer, {
    domains: [],
    isLoading: true,
  } as State)

  useEffect(() => {
    if (user === null) {
      return
    }

    ;(async () => {
      const domains = await user
        .mongoClient("mongodb-atlas")
        .db("domain-monitor")
        .collection<Domain>("domains")
        .find()

      dispatch({ type: "load", payload: domains })
      dispatch({ type: "loading", payload: false })
    })()
  }, [user])

  const removeDomain = async (domain: Domain) => {
    if (user === null) {
      return
    }

    await user
      .mongoClient("mongodb-atlas")
      .db("domain-monitor")
      .collection<Domain>("domains")
      .deleteOne({ _id: domain._id })

    dispatch({ type: "remove", payload: domain })
  }

  const updateDomain = async (domain: Domain) => {
    if (user === null) {
      return
    }

    const whoisResult = await user.functions.callFunction("whois", domain.name)

    const current = {
      isAvailable: whoisResult.isAvailable,
      status: whoisResult.status,
      nameServer: whoisResult.nameServer,
      expiry: whoisResult.expiry,
    } as DomainInfo

    const update =
      JSON.stringify(domain.current) !== JSON.stringify(current)
        ? {
            prev: domain.current,
            current: current,
            updated: new Date(),
          }
        : { updated: new Date() }

    await user
      .mongoClient("mongodb-atlas")
      .db("domain-monitor")
      .collection("domains")
      .updateOne({ _id: domain._id }, { $set: update })

    dispatch({ type: "update", payload: { ...domain, ...update } })
  }

  const addDomain = async (name: string): Promise<Error | null> => {
    if (user === null) {
      return null
    }

    if (state.domains.find((x) => x.name === name)) {
      return new Error(`${name} is already in the list`)
    }

    const err = validateDomain(name)
    if (err !== null) {
      return err
    }

    let whoisResult = null
    try {
      whoisResult = await user.functions.callFunction("whois", name)
    } catch (e) {
      if (e instanceof MongoDBRealmError) {
        return new Error(e.error)
      } else if (e instanceof Error) {
        return e
      }
    }

    console.log(whoisResult)

    const domain = {
      name: whoisResult.name,
      userId: user.id,
      created: new Date(),
      updated: new Date(),
      current: {
        isAvailable: whoisResult.isAvailable,
        status: whoisResult.status,
        nameServer: whoisResult.nameServer,
        expiry: whoisResult.expiry,
      } as DomainInfo,
      prev: null,
      notificationEmail: user.app.currentUser?.profile.email,
      notificationSent: new Date(),
    } as Domain

    const result = await user
      .mongoClient("mongodb-atlas")
      .db("domain-monitor")
      .collection("domains")
      .insertOne(domain)

    domain._id = result.insertedId

    dispatch({ type: "add", payload: domain })

    return null
  }

  return (
    <DomainContext.Provider
      value={{ state, addDomain, removeDomain, updateDomain }}
    >
      {children}
    </DomainContext.Provider>
  )
}

function useDomain() {
  const context = React.useContext(DomainContext)
  if (context === undefined) {
    throw new Error("useDomain must be used within a DomainProvider")
  }
  return context
}

export { DomainProvider, useDomain }
