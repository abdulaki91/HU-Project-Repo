import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import useEditResource from "../hooks/useEditResource";
import { useOutletContext } from "react-router-dom";

export function Settings() {
  const { userData } = useOutletContext();
  const [userInfo, setUserInfo] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    batch: "",
    department: "",
  });

  useEffect(() => {
    if (userData) setUserInfo((prev) => ({ ...prev, ...userData }));
  }, [userData]);

  const editUser = useEditResource("user/update", "user-me");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userInfo.id) {
      alert("Unable to update: user id not available yet.");
      return;
    }
    const payload = {
      id: userInfo.id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      batch: userInfo.batch,
      department: userInfo.department,
    };

    editUser.mutate(payload, {
      onSuccess: () => {
        // optionally navigate back or show toast; leaving as-is
      },
    });
  };

  return (
    <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="text-slate-900 dark:text-white mb-6">Account Settings</h3>
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="dark:text-slate-200">
              First Name
            </Label>
            <Input
              id="firstName"
              value={userInfo.firstName}
              onChange={handleInputChange}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="dark:text-slate-200">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={userInfo.lastName}
              onChange={handleInputChange}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="dark:text-slate-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={userInfo.email}
            onChange={handleInputChange}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="batch" className="dark:text-slate-200">
              Batch
            </Label>
            <Input
              id="batch"
              value={userInfo.batch}
              onChange={handleInputChange}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="dark:text-slate-200">
              Department
            </Label>
            <Input
              id="department"
              value={userInfo.department}
              onChange={handleInputChange}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Card>
  );
}
