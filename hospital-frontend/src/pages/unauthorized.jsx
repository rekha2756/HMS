// src/pages/Unauthorized.jsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>403 - Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/login">Go back to login</Link>
    </div>
  );
}