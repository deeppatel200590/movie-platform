import React from "react";
import AdminNavbar from "./AdminNavbar";
import FeachMovie from "./FeachMovie";


const Admin = () => {
  return(
    <div className="overflow-x-auto">
        <AdminNavbar />
        <FeachMovie />
    </div>
  )
}

export default Admin;