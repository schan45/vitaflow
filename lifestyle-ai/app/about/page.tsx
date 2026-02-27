import Link from "next/link";

export default function About() {
  return (
    <div className="p-6 pb-28 space-y-8">

      <div>
        <h1 className="text-2xl font-semibold">
          About VitaFlow
        </h1>
        <p className="text-slate-400 mt-2">
          Prevention-first AI lifestyle medicine platform.
        </p>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl">
        <p className="text-sm text-slate-300">
          70–80% of chronic diseases can be prevented or significantly
          improved through structured lifestyle changes.
        </p>

        <p className="text-sm text-slate-400 mt-4">
          VitaFlow combines artificial intelligence, behavioral science,
          and clinical alignment to help users stay consistent and reduce
          long-term health risks.
        </p>
      </div>

      <div className="space-y-4">

        <Link href="/partners">
          <div className="bg-slate-800 rounded-2xl p-4">
            Partners →
          </div>
        </Link>

        <Link href="/contact">
          <div className="bg-slate-800 rounded-2xl p-4">
            Contact →
          </div>
        </Link>

      </div>

    </div>
  );
}
