import React, { useState } from "react";
import CreateUser from "./CreateUser";

function Dashboard({ user }) {

  const [showForm, setShowForm] = useState(false);

  const canCreateUser = ["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"]
    .includes(user.role);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome {user.username}</h2>
      <h3>Role: {user.role}</h3>

      {/* Only allowed roles */}
      {canCreateUser && (
        <>
          <button onClick={() => setShowForm(true)}>
            Create User
          </button>

          <br /><br />

          {showForm && <CreateUser user={user} />}
        </>
      )}

      {/* Others → only view */}
      {!canCreateUser && (
        <h4>You have access only to your module</h4>
      )}
    </div>
  );
}

export default Dashboard;