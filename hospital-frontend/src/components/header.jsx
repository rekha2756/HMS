import React from "react";
import "../css/admin/header.css";

function Header({ title }) {
  return (
    <div className="header">
      <h1>{title}</h1>
      <div className="user">Admin</div>
    </div>
  );
}

export default Header;