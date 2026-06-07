export default function Dashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="glass-card rounded-3xl p-10 max-w-lg w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-cyan-400 pcc-display">Welcome to your dashboard</h1>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <p className="text-lg mb-2">
            Hello, <span className="font-semibold text-purple-300">{user.displayName || user.email || "User"}</span>!
          </p>
          <p className="text-sm text-slate-400">Logged in with: {user.email}</p>
        </div>

        <button
          onClick={onLogout}
          className="mt-6 px-6 py-2 rounded-xl text-sm border border-white/20 hover:border-red-400 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
