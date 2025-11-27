import { useState } from "react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Label } from "../components/Label";

export default function SuperAdminCreateAdmin() {
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  const createAdmin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/superadmin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, department, password }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl mb-4 font-semibold">Create New Admin</h1>

      <form onSubmit={createAdmin} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Department</Label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button className="w-full" type="submit">
          Create Admin
        </Button>
      </form>
    </div>
  );
}
