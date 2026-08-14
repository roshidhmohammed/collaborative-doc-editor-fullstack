export default function Loading() {
  return (
    <div className="h-[110vh] bg-slate-900 w-full">
      {/* Header */}
      <div className=" text-center">
        {/* "New document" */}
        <div className="  w-40 animate-pulse rounded-md bg-slate-900" />

        {/* "Create your next idea" */}
        <div className="mx-auto  h-9 w-72 animate-pulse rounded-md bg-slate-900 sm:h-10 sm:w-80" />

        {/* Description */}
        <div className="mx-auto mt-4 space-y-2">
          <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-slate-900" />
          <div className="mx-auto h-4 w-4/5 max-w-sm animate-pulse rounded bg-slate-900" />
        </div>
      </div>

      {/* Form */}
      <div className="w-full space-y-6">
        {/* Form field */}
        <div className="space-y-2">
          {/* Label */}
          <div className="h-4 w-72 animate-pulse rounded bg-slate-900" />

          {/* Input */}
          <div className="h-12 w-full animate-pulse rounded-md border border-slate-900 bg-slate-900/80" />
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <div className="h-11 w-32 animate-pulse rounded-full bg-slate-900" />
        </div>
      </div>
    </div>
  );
}
