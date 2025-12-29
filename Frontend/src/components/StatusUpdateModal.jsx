import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Label } from "./Label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./Select";

export default function StatusUpdateModal({
  open,
  project,
  onClose,
  onSubmit,
}) {
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (project) {
      setStatus(project.status || "pending");
    }
  }, [project]);

  if (!open || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(project.id, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl p-8 dark:bg-slate-800 dark:border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold mb-6 dark:text-white text-center">
          Update Project Status
        </h3>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="text-md font-semibold mb-4 dark:text-slate-200">
              Project Details
            </h4>
            <div className="space-y-4">
              <div>
                <Label className="dark:text-slate-200 font-medium">Title</Label>
                <p className="text-slate-700 dark:text-slate-300 mt-1 text-sm">
                  {project.title}
                </p>
              </div>

              <div>
                <Label className="dark:text-slate-200 font-medium">
                  Description
                </Label>
                <p className="text-slate-700 dark:text-slate-300 mt-1 text-sm line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="dark:text-slate-200 font-medium">
                    Course
                  </Label>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 text-sm">
                    {project.course}
                  </p>
                </div>
                <div>
                  <Label className="dark:text-slate-200 font-medium">
                    Batch
                  </Label>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 text-sm">
                    {project.batch}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <Label className="dark:text-slate-200 font-medium text-md">
              New Status
            </Label>
            <Select value={status} onValueChange={setStatus} className="mt-2">
              <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                <SelectItem value="pending" className="dark:text-white">
                  Pending
                </SelectItem>
                <SelectItem value="approved" className="dark:text-white">
                  Approved
                </SelectItem>
                <SelectItem value="rejected" className="dark:text-white">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-6">
            Update Status
          </Button>
        </div>
      </Card>
    </div>
  );
}
