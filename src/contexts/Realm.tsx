import React, { useContext, useState } from "react"
import * as Realm from "realm-web"
import { MongoDBRealmError } from "realm-web"

interface Context {
  user: Realm.User | null
  logIn: (email: string, password: string) => Promise<Error | null>
  createUser: (email: string, password: string) => Promise<Error | null>
  logOut: () => void
}

const RealmContext = React.createContext<Context>({} as Context)

interface Props {
  children: React.ReactNode
  appId: string
}

function RealmProvider({ appId, children }: Props) {
  const app = new Realm.App({ id: appId })
  const [user, setUser] = useState<Realm.User | null>(app.currentUser)

  const logIn = async (
    email: string,
    password: string
  ): Promise<Error | null> => {
    const credentials = Realm.Credentials.emailPassword(email, password)
    try {
      await app.logIn(credentials)
      setUser(app.currentUser)
    } catch (e) {
      setUser(null)
      if (e instanceof MongoDBRealmError) {
        return new Error(e.error)
      } else if (e instanceof Error) {
        return e
      }
    }
    return null
  }

  const createUser = async (
    email: string,
    password: string
  ): Promise<Error | null> => {
    try {
      await app.emailPasswordAuth.registerUser({ email, password })
    } catch (e) {
      if (e instanceof MongoDBRealmError) {
        return new Error(e.error)
      } else if (e instanceof Error) {
        return e
      }
    }
    return null
  }

  const logOut = async () => {
    setUser(null)
    await app.currentUser?.logOut()
  }

  return (
    <RealmContext.Provider value={{ user, createUser, logIn, logOut }}>
      {children}
    </RealmContext.Provider>
  )
}

function useRealm() {
  const context = useContext(RealmContext)
  if (context == null) {
    throw new Error("useRealmApp must be used within a RealmProvider")
  }
  return context
}

export { RealmProvider, useRealm }
