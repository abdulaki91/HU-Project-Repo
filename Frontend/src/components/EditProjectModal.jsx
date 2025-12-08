import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { Textarea } from "./Textarea";
import useEditResource from "../hooks/useEditResource";

export default function EditProjectModal({
  project,
  open,
  onClose,
  invalidateKey = ["projects"],
}) {
  const [form, setForm] = useState({});
  const editMutation = useEditResource("project/update", invalidateKey);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        course: project.course || "",
        batch: project.batch || "",
        tags:
          (project.tags && Array.isArray(project.tags)
            ? project.tags.join(", ")
            : typeof project.tags === "string"
            ? project.tags
            : "") || "",
      });
    } else {
      setForm({});
    }
  }, [project]);

  if (!open) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((p) => ({ ...p, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;
    try {
      const payload = {
        id: project.id,
        title: form.title,
        description: form.description,
        course: form.course,
        batch: form.batch,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      await editMutation.mutateAsync(payload);
      onClose(true);
    } catch (err) {
      console.error("Failed to update project", err);
      onClose(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl p-6 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={form.course || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                value={form.batch || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={form.tags || ""} onChange={handleChange} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
