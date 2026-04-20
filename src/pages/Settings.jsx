export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-3 text-sm text-slate-400">
          Use this page to configure your account preferences and application settings.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-xl">
          <h2 className="text-lg font-medium text-white">Profile</h2>
          <p className="mt-2 text-sm text-slate-400">
            Update your profile info, display name, and notification preferences.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-xl">
          <h2 className="text-lg font-medium text-white">Security</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage authentication settings and secure your account.
          </p>
        </div>
      </div>
    </div>
  );
}