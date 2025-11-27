export const AdminTable = () => {
  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example rows - Will be replaced by API data */}
          <AdminRow name="John Doe" email="john@uni.edu" role="admin" />
          <AdminRow name="Sara Tesfaye" email="sara@uni.edu" role="admin" />
        </tbody>
      </table>
    </div>
  );
};

const AdminRow = ({ name, email, role }) => (
  <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40">
    <td className="p-4">{name}</td>
    <td className="p-4">{email}</td>
    <td className="p-4 capitalize">{role}</td>
    <td className="p-4">
      <button className="text-indigo-600 dark:text-indigo-400 hover:underline">
        Edit
      </button>
    </td>
  </tr>
);
