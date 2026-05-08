import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdminAuditLogs,
  fetchAdminChats,
  fetchAdminFiles,
  fetchAdminOverview,
  fetchAdminSettings,
  fetchAdminUsers,
  updateAdminUser,
  resetAdminUserPassword,
  deleteAdminUser,
  deleteAdminChat,
  deleteAdminFile,
} from "../api/chatApi.js";
import {
  Ban,
  Chat,
  Database,
  File,
  Lock,
  Moon,
  Refresh,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Trash,
  User,
  Users,
} from "../icons/lucide.js";

const tabs = [
  { id: "overview", label: "Overview", icon: Database },
  { id: "users", label: "Users", icon: Users },
  { id: "chats", label: "Chats", icon: Chat },
  { id: "files", label: "Files", icon: File },
  { id: "audit", label: "Audit", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

async function readJsonResponse(response) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data;
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
          {detail ? (
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {detail}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
      {text}
    </div>
  );
}

export default function AdminPage({ user, isDark, onToggleTheme, onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [files, setFiles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [userQuery, setUserQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [chatType, setChatType] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");

  const isAdmin = Boolean(user?.isAdmin || String(user?.role || "").toLowerCase() === "admin");

  const loadOverview = useCallback(async () => {
    const data = await readJsonResponse(await fetchAdminOverview());
    setOverview(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await readJsonResponse(await fetchAdminUsers(userQuery));
    setUsers(Array.isArray(data.users) ? data.users : []);
  }, [userQuery]);

  const loadChats = useCallback(async () => {
    const data = await readJsonResponse(
      await fetchAdminChats({ query: chatQuery, type: chatType }),
    );
    setChats(Array.isArray(data.chats) ? data.chats : []);
  }, [chatQuery, chatType]);

  const loadFiles = useCallback(async () => {
    const data = await readJsonResponse(await fetchAdminFiles());
    setFiles(Array.isArray(data.files) ? data.files : []);
  }, []);

  const loadAudit = useCallback(async () => {
    const data = await readJsonResponse(await fetchAdminAuditLogs());
    setAuditLogs(Array.isArray(data.logs) ? data.logs : []);
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await readJsonResponse(await fetchAdminSettings());
    setSettings(data.settings || null);
  }, []);

  const loadAll = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        loadOverview(),
        loadUsers(),
        loadChats(),
        loadFiles(),
        loadAudit(),
        loadSettings(),
      ]);
    } catch (err) {
      setError(err?.message || "Unable to load admin panel.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, loadAudit, loadChats, loadFiles, loadOverview, loadSettings, loadUsers]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (activeTab === "users") void loadUsers().catch((err) => setError(err.message));
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === "chats") void loadChats().catch((err) => setError(err.message));
  }, [activeTab, loadChats]);

  const runAction = async (key, action, refresh = loadAll) => {
    setBusyKey(key);
    setError("");
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err?.message || "Action failed.");
    } finally {
      setBusyKey("");
    }
  };

  const stats = overview?.stats || {};
  const chatTotal = useMemo(() => {
    const values = Object.values(stats.chats || {});
    return values.reduce((sum, value) => sum + Number(value || 0), 0);
  }, [stats.chats]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
          <ShieldCheck className="mx-auto text-amber-500" size={34} />
          <h1 className="mt-3 text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your account does not have permission to open the admin panel.
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.("/chat", true)}
            className="mt-5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Back to chat
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-sm font-bold">BirdX Admin</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">v2.1 workspace</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                Admin Panel
              </p>
              <h1 className="text-xl font-bold">System management</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadAll()}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              >
                <Refresh size={17} />
                Refresh
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("/chat", true)}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Chat
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {error ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <EmptyState text="Loading admin panel..." />
          ) : null}

          {!loading && activeTab === "overview" ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Users"
                  value={stats.users?.total || 0}
                  detail={`${stats.users?.admins || 0} admins, ${stats.users?.banned || 0} banned`}
                  icon={Users}
                />
                <StatCard
                  label="Chats"
                  value={chatTotal}
                  detail={`${stats.chats?.group || 0} groups, ${stats.chats?.channel || 0} channels`}
                  icon={Chat}
                />
                <StatCard
                  label="Messages"
                  value={stats.messages || 0}
                  detail="Stored chat messages"
                  icon={Database}
                />
                <StatCard
                  label="Files"
                  value={stats.files?.total || 0}
                  detail={stats.files?.label || "0 B"}
                  icon={File}
                />
              </div>

              <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                <h2 className="text-sm font-bold">Latest admin actions</h2>
                <div className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
                  {(overview?.latestAudit || []).length ? (
                    overview.latestAudit.map((log) => (
                      <div key={log.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <div>
                          <p className="font-semibold">{log.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {log.actor_username || "system"} / {log.target_type || "-"} #{log.target_id || "-"}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{log.created_at}</span>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-slate-500 dark:text-slate-400">No audit records yet.</p>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          {!loading && activeTab === "users" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    value={userQuery}
                    onChange={(event) => setUserQuery(event.target.value)}
                    placeholder="Search users"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-slate-950"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void loadUsers()}
                  className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Activity</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                      {users.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                <User size={17} />
                              </div>
                              <div>
                                <p className="font-semibold">{item.nickname || item.username}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">@{item.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.role}
                              disabled={busyKey === `role-${item.id}`}
                              onChange={(event) =>
                                runAction(
                                  `role-${item.id}`,
                                  async () => {
                                    await readJsonResponse(
                                      await updateAdminUser(item.id, { role: event.target.value }),
                                    );
                                  },
                                  loadUsers,
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold dark:border-white/10 dark:bg-slate-900"
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                            {item.envAdmin ? (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                                env
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${
                                item.banned
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                              }`}
                            >
                              {item.banned ? "banned" : "active"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {item.chat_count} chats / {item.message_count} messages
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  runAction(
                                    `ban-${item.id}`,
                                    async () => {
                                      await readJsonResponse(
                                        await updateAdminUser(item.id, { banned: !item.banned }),
                                      );
                                    },
                                    loadUsers,
                                  )
                                }
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:border-amber-300 hover:text-amber-700 dark:border-white/10 dark:text-slate-300"
                              >
                                <Ban size={14} />
                                {item.banned ? "Unban" : "Ban"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const password = window.prompt(`New password for @${item.username}`);
                                  if (!password) return;
                                  void runAction(
                                    `pass-${item.id}`,
                                    async () => {
                                      await readJsonResponse(
                                        await resetAdminUserPassword(item.id, password),
                                      );
                                    },
                                    loadUsers,
                                  );
                                }}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:text-slate-300"
                              >
                                <Lock size={14} />
                                Password
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!window.confirm(`Delete @${item.username}? This cannot be undone.`)) return;
                                  void runAction(
                                    `delete-user-${item.id}`,
                                    async () => {
                                      await readJsonResponse(await deleteAdminUser(item.id));
                                    },
                                    loadUsers,
                                  );
                                }}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                              >
                                <Trash size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {!loading && activeTab === "chats" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={chatQuery}
                  onChange={(event) => setChatQuery(event.target.value)}
                  placeholder="Search chats"
                  className="h-10 min-w-[220px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-slate-950"
                />
                <select
                  value={chatType}
                  onChange={(event) => setChatType(event.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"
                >
                  <option value="">All types</option>
                  <option value="dm">DM</option>
                  <option value="group">Group</option>
                  <option value="channel">Channel</option>
                  <option value="saved">Saved</option>
                </select>
                <button type="button" onClick={() => void loadChats()} className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white">
                  Search
                </button>
              </div>
              <div className="grid gap-3">
                {chats.length ? (
                  chats.map((chat) => (
                    <section key={chat.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                      <div>
                        <p className="font-bold">{chat.name || `${chat.type} #${chat.id}`}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {chat.type} / {chat.group_username || "no username"} / {chat.member_count} members / {chat.message_count} messages
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`Delete chat #${chat.id}?`)) return;
                          void runAction(
                            `delete-chat-${chat.id}`,
                            async () => {
                              await readJsonResponse(await deleteAdminChat(chat.id));
                            },
                            loadChats,
                          );
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                      >
                        <Trash size={15} />
                        Delete
                      </button>
                    </section>
                  ))
                ) : (
                  <EmptyState text="No chats found." />
                )}
              </div>
            </div>
          ) : null}

          {!loading && activeTab === "files" ? (
            <div className="grid gap-3">
              {files.length ? (
                files.map((file) => (
                  <section key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{file.original_name || file.stored_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {file.size_label} / {file.mime_type || file.kind || "file"} / @{file.owner_username || "unknown"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Delete file ${file.original_name || file.id}?`)) return;
                        void runAction(
                          `delete-file-${file.id}`,
                          async () => {
                            await readJsonResponse(await deleteAdminFile(file.id));
                          },
                          loadFiles,
                        );
                      }}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                    >
                      <Trash size={15} />
                      Delete
                    </button>
                  </section>
                ))
              ) : (
                <EmptyState text="No uploaded files found." />
              )}
            </div>
          ) : null}

          {!loading && activeTab === "audit" ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {auditLogs.length ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-bold">{log.action}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {log.actor_username || "system"} / {log.target_type || "-"} #{log.target_id || "-"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{log.created_at}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No audit logs yet." />
                )}
              </div>
            </div>
          ) : null}

          {!loading && activeTab === "settings" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <StatCard label="Account Creation" value={settings?.accountCreation ? "Enabled" : "Disabled"} detail="Controlled by .env" icon={Settings} />
              <StatCard label="Message Limit" value={settings?.messageMaxChars || 0} detail="Maximum characters per message" icon={Database} />
              <StatCard label="Storage Encryption" value={settings?.storageEncryption ? "Enabled" : "Disabled"} detail="Server-side storage encryption" icon={Lock} />
              <StatCard label="Bootstrap Admins" value={settings?.adminUsernames?.length || 0} detail={(settings?.adminUsernames || []).join(", ") || "No env admins"} icon={ShieldCheck} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
