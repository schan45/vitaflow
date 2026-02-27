export default function Contact() {
  return (
    <div className="p-6 pb-28 space-y-6">
      <h1 className="text-2xl font-semibold">
        Contact Us
      </h1>

      <div className="bg-slate-800 p-5 rounded-2xl">
        <p>Email:</p>
        <p className="text-blue-400">
          support@vitaflow.ai
        </p>
      </div>

      <div className="bg-slate-800 p-5 rounded-2xl">
        <p>Phone:</p>
        <p className="text-slate-400">
          +36 30 123 4567
        </p>
      </div>
    </div>
  );
}