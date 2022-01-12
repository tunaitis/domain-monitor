import React from "react"
import ReactDOM from "react-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import { RealmProvider } from "./contexts/Realm"

const appId = process.env.REACT_APP_REALM_APP_ID

if (typeof appId !== "undefined") {
  ReactDOM.render(
    <React.StrictMode>
      <RealmProvider appId={appId}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RealmProvider>
    </React.StrictMode>,
    document.getElementById("root")
  )
} else {
  ReactDOM.render(
    <div>
      Realm Application ID is not defined. Set the Application ID using the
      REACT_APP_REALM_APP_ID environment variable and rebuild the app.
    </div>,
    document.getElementById("root")
  )
}
