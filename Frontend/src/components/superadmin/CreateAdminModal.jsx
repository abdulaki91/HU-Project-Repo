import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { Button } from "../../components/Button";
import { X } from "lucide-react";

export const CreateAdminModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New Admin
          </h2>
          <button onClick={onClose}>
            <X className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input placeholder="Admin name" />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="admin@university.edu" />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="Create a password" />
          </div>

          <Button className="w-full mt-4">Create Admin</Button>
        </form>
      </div>
    </div>
  );
};
