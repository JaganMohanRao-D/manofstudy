import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { httpsCallable } from "firebase/functions";
import {
  Activity, ArrowUpRight, BookOpen, BriefcaseBusiness, ChevronRight, CirclePlus,
  FileText, LayoutDashboard, LoaderCircle, LogOut, Pencil, Save,
  ShieldCheck, Trash2, Wrench, X, Image as ImageIcon, Eye, EyeOff, CalendarDays,
} from "lucide-react";
import { adminFunctions } from "../../services/adminFirebase";
import { useAdminAuth } from "../../context/AdminAuthContext";
import blogArticlesData from "../../data/blogArticles.json";
import editorialArticlesData from "../../data/editorialBlogArticles.generated.json";

type Post = {
  id: string; title: string; slug: string; category: string; content: string; summary?: string;
  coverImage?: string; status: "draft" | "published"; featured?: boolean; tags?: string[];
};
type Scholarship = {
  id: string; title: string; provider: string; amount: string; eligibility: string;
  deadline: string; link: string; active: boolean;
};
type ToolItem = { id: string; name: string; description: string; icon: string; visible: boolean };
type DashboardData = {
  posts: Post[]; scholarships: Scholarship[];
  config: Record<string, any>;
};
type Tab = "overview" | "blogs" | "scholarships" | "tools" | "assets";

const getDashboardCall = httpsCallable<Record<string, never>, DashboardData>(adminFunctions, "getNaaAdminDashboard");
const saveRecordCall = httpsCallable<{ type: string; id?: string; data: any }, { id: string }>(adminFunctions, "saveNaaAdminRecord");
const deleteRecordCall = httpsCallable<{ type: string; id: string }, { id: string }>(adminFunctions, "deleteNaaAdminRecord");
const importLegacyCall = httpsCallable<{ posts: any[]; scholarships: any[] }, { postsImported: number; scholarshipsImported: number }>(adminFunctions, "importNaaAdminLegacyContent");
const DEFAULT_TOOLS: ToolItem[] = [
  { id: "ap-predictor", name: "AP College Predictor", description: "Explore AP engineering colleges using historical EAPCET allotment data.", icon: "GraduationCap", visible: true },
  { id: "ap-allotments", name: "AP EAPCET College-wise Allotments", description: "Search historical AP EAPCET allotment records by college and branch.", icon: "Building2", visible: true },
  { id: "ap-web-options", name: "EAPCET Web Options Helper", description: "Build an editable college preference list using historical closing ranks.", icon: "ListChecks", visible: true },
  { id: "roadmaps", name: "Career Roadmaps", description: "Explore semester-wise engineering learning and career roadmaps.", icon: "Route", visible: true },
  { id: "scholarships", name: "Scholarships Directory", description: "Discover scholarships and application information for students.", icon: "Award", visible: true },
  { id: "attendance", name: "Attendance Defender", description: "Plan attendance and estimate recovery margins.", icon: "CalendarCheck", visible: true },
  { id: "pdf-tools", name: "Student PDF Tools", description: "Convert, merge and manage documents in the browser.", icon: "FileText", visible: true },
  { id: "tg-predictor", name: "TG EAPCET College Predictor", description: "Explore Telangana engineering options using historical allotment data.", icon: "Map", visible: true },
];
const EMPTY_POST = { title: "", slug: "", category: "Student Guides", summary: "", coverImage: "", content: "", status: "draft" as const, featured: false, tags: "" };
const EMPTY_SCHOLARSHIP = { title: "", provider: "", amount: "", eligibility: "", deadline: "", link: "", active: true };


function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: React.ElementType }) {
  return <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-3 text-3xl font-black tracking-tight text-[#14233d]">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f3e9] text-[#9b742e]"><Icon className="h-5 w-5" /></span></div>
  </article>;
}

export default function AdminDashboard() {
  const { user, logout } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData>({ posts: [], scholarships: [], config: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [loadError, setLoadError] = useState("");
  const [postEditorOpen, setPostEditorOpen] = useState(false);
  const [scholarshipEditorOpen, setScholarshipEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [postForm, setPostForm] = useState({ ...EMPTY_POST });
  const [scholarshipForm, setScholarshipForm] = useState({ ...EMPTY_SCHOLARSHIP });
  const [tools, setTools] = useState<ToolItem[]>(DEFAULT_TOOLS);
  const [hero, setHero] = useState({ title: "Your college journey, made clearer.", subtitle: "Tools, guides and opportunities for every student." });
  const [alerts, setAlerts] = useState({ message: "", enabled: false });
  const [featuredTags, setFeaturedTags] = useState("AP EAPCET, Scholarships, Career Roadmaps");

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data: result } = await getDashboardCall({});
      setData(result);
      const savedTools = result.config?.tools?.items;
      if (Array.isArray(savedTools) && savedTools.length) setTools(savedTools);
      setHero({
        title: result.config?.hero?.title || "Your college journey, made clearer.",
        subtitle: result.config?.hero?.subtitle || "Tools, guides and opportunities for every student.",
      });
      setAlerts({
        message: result.config?.alerts?.message || "",
        enabled: result.config?.alerts?.enabled === true,
      });
      setFeaturedTags(Array.isArray(result.config?.featuredTags?.items) ? result.config.featuredTags.items.join(", ") : "AP EAPCET, Scholarships, Career Roadmaps");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);
  useEffect(() => { document.title = "Admin Dashboard | Naa College"; }, []);

  const publishedCount = useMemo(() => data.posts.filter(post => post.status === "published").length, [data.posts]);
  const activeScholarships = useMemo(() => data.scholarships.filter(item => item.active).length, [data.scholarships]);

  async function save(type: string, id: string | undefined, payload: any) {
    setSaving(true);
    try {
      await saveRecordCall({ type, ...(id ? { id } : {}), data: payload });
      await loadDashboard();
      showToast("Changes saved successfully.");
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save changes.");
      return false;
    } finally { setSaving(false); }
  }

  async function remove(type: "posts" | "scholarships", id: string) {
    if (!window.confirm("Delete this item permanently?")) return;
    setSaving(true);
    try {
      await deleteRecordCall({ type, id });
      await loadDashboard();
      showToast("Item deleted.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Delete failed.");
    } finally { setSaving(false); }
  }

  const migrationComplete = data.config?.contentMigration?.blogs === true && data.config?.contentMigration?.scholarships === true;

  async function importExistingContent() {
    if (migrationComplete) return;
    setSaving(true);
    try {
      const blogMap = new Map<string, any>();
      [...(blogArticlesData as any[]), ...(editorialArticlesData as any[])].forEach((article) => {
        const slug = String(article?.slug || "").trim().toLowerCase();
        const title = String(article?.title || "").trim();
        const content = String(article?.content || "").trim();
        if (!slug || !title || !content) return;
        blogMap.set(slug, {
          title,
          slug,
          category: String(article.category || "Student Guides"),
          content,
          summary: String(article.summary || ""),
          coverImage: /^https?:\/\//i.test(String(article.coverImage || "")) ? String(article.coverImage) : "",
          status: article.status === "published" ? "published" : "draft",
          featured: article.featured === true,
          tags: Array.isArray(article.tags) ? article.tags : [],
        });
      });

      const scholarshipResponse = await fetch("/indian_scholarships.json", { cache: "no-store" });
      if (!scholarshipResponse.ok) throw new Error("The existing scholarship directory could not be loaded.");
      const rawScholarships = await scholarshipResponse.json();
      if (!Array.isArray(rawScholarships)) throw new Error("The scholarship directory has an unexpected format.");
      const scholarshipMap = new Map<string, any>();
      rawScholarships.forEach((item: any) => {
        const title = String(item?.title || "").trim();
        const provider = String(item?.provider || "Provider not listed").trim();
        const link = String(item?.apply_link || item?.official_source_url || item?.guideline_url || "").trim();
        if (!title || !/^https?:\/\//i.test(link)) return;
        scholarshipMap.set((title + "|" + provider).toLowerCase(), {
          title,
          provider,
          amount: String(item.amount || ""),
          eligibility: String(item.eligibility || "Check the official provider portal for current eligibility."),
          deadline: String(item.deadline || ""),
          link,
          active: !/(closed|expired|ended)/i.test(String(item.status || "")),
        });
      });

      const { data: result } = await importLegacyCall({
        posts: [...blogMap.values()],
        scholarships: [...scholarshipMap.values()],
      });
      await loadDashboard();
      showToast("Imported " + result.postsImported + " blogs and " + result.scholarshipsImported + " scholarships. The CMS is now the content source.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Existing content import failed.");
    } finally {
      setSaving(false);
    }
  }

  function openNewPost() {
    setEditingId("");
    setPostForm({ ...EMPTY_POST });
    setPostEditorOpen(true);
  }
  function openEditPost(post: Post) {
    setEditingId(post.id);
    setPostForm({
      title: post.title || "", slug: post.slug || "", category: post.category || "Student Guides",
      summary: post.summary || "", coverImage: post.coverImage || "", content: post.content || "",
      status: post.status || "draft", featured: post.featured === true, tags: (post.tags || []).join(", "),
    });
    setPostEditorOpen(true);
  }
  async function submitPost(event: FormEvent) {
    event.preventDefault();
    const ok = await save("posts", editingId || undefined, {
      ...postForm,
      slug: postForm.slug || makeSlug(postForm.title),
      tags: postForm.tags.split(",").map(value => value.trim()).filter(Boolean),
    });
    if (ok) setPostEditorOpen(false);
  }

  function openNewScholarship() {
    setEditingId("");
    setScholarshipForm({ ...EMPTY_SCHOLARSHIP });
    setScholarshipEditorOpen(true);
  }
  function openEditScholarship(item: Scholarship) {
    setEditingId(item.id);
    setScholarshipForm({
      title: item.title || "", provider: item.provider || "", amount: item.amount || "",
      eligibility: item.eligibility || "", deadline: item.deadline || "", link: item.link || "",
      active: item.active !== false,
    });
    setScholarshipEditorOpen(true);
  }
  async function submitScholarship(event: FormEvent) {
    event.preventDefault();
    const ok = await save("scholarships", editingId || undefined, scholarshipForm);
    if (ok) setScholarshipEditorOpen(false);
  }

  async function saveTools() {
    const ok = await save("config", undefined, { key: "tools", value: { items: tools } });
    if (ok) showToast("Tool settings published.");
  }
  async function saveAssets() {
    const [heroOk, alertsOk, tagsOk] = await Promise.all([
      save("config", undefined, { key: "hero", value: hero }),
      save("config", undefined, { key: "alerts", value: alerts }),
      save("config", undefined, { key: "featuredTags", value: { items: featuredTags.split(",").map(v => v.trim()).filter(Boolean) } }),
    ]);
    if (heroOk && alertsOk && tagsOk) showToast("Homepage content saved.");
  }

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "blogs", label: "Blog & News", icon: BookOpen },
    { id: "scholarships", label: "Scholarships", icon: BriefcaseBusiness },
    { id: "tools", label: "Tools & Roadmaps", icon: Wrench },
    { id: "assets", label: "Banners & Assets", icon: ImageIcon },
  ];

  return <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <a href="/theone/dashboard" className="flex min-w-0 items-center gap-3"><img src="/Naa%20College%20logo.webp" alt="Naa College" className="h-10 w-10 object-contain" /><span className="min-w-0"><strong className="block truncate text-sm font-black tracking-tight text-[#14233d] sm:text-base">Naa College <span className="text-[#a77c2d]">Admin</span></strong><span className="hidden text-[11px] text-slate-500 sm:block">Content management console</span></span></a>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3"><span className="hidden max-w-[220px] truncate text-xs font-semibold text-slate-500 md:block">{user?.email}</span><a href="/" className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex">View site <ArrowUpRight className="h-3.5 w-3.5" /></a><button onClick={() => void logout()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#14233d] px-3 text-xs font-bold text-white hover:bg-[#243c61]"><LogOut className="h-3.5 w-3.5" /><span className="hidden xs:inline">Logout</span></button></div>
      </div>
    </header>

    <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[245px_minmax(0,1fr)]">
      <aside className="hidden min-h-[calc(100vh-68px)] border-r border-slate-200 bg-white p-4 lg:block">
        <p className="mb-3 px-3 pt-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Workspace</p>
        <nav className="space-y-1">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setTab(item.id)} className={"flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition " + (tab === item.id ? "bg-[#14233d] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-[#14233d]")}><Icon className="h-4 w-4 shrink-0" />{item.label}{tab === item.id && <ChevronRight className="ml-auto h-4 w-4" />}</button>; })}</nav>
        <div className="mt-8 rounded-2xl border border-[#eadfc7] bg-[#fbf8f0] p-4"><ShieldCheck className="h-5 w-5 text-[#9b742e]" /><p className="mt-3 text-xs font-extrabold text-[#6f5425]">Owner access active</p><p className="mt-1 text-[11px] leading-5 text-[#8b7957]">All changes are saved to the private Naa College content database.</p></div>
      </aside>

      <main className="min-w-0 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <nav aria-label="Admin sections" className="-mx-3 mb-6 flex gap-2 overflow-x-auto px-3 pb-2 lg:hidden">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setTab(item.id)} className={"inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold " + (tab === item.id ? "border-[#14233d] bg-[#14233d] text-white" : "border-slate-200 bg-white text-slate-600")}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[.18em] text-[#a77c2d]">NAA COLLEGE CONTROL ROOM</p><h1 className="mt-1 text-2xl font-black tracking-tight text-[#14233d] sm:text-3xl">{navItems.find(item => item.id === tab)?.label}</h1><p className="mt-1 text-sm text-slate-500">Manage your content and site settings from one place.</p></div><button onClick={() => void loadDashboard()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"><Activity className="h-4 w-4" />Refresh data</button></div>

        {loadError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span>{loadError}</span><button onClick={() => void loadDashboard()} className="font-bold underline">Retry</button></div>}
        {loading ? <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm font-semibold text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Loading dashboard data…</div> : <>
          {tab === "overview" && <section className="space-y-6">
            <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#eadfc7] bg-[#fbf8f0] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0"><h2 className="text-sm font-black text-[#6f5425]">Existing website content library</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#8b7957]">{migrationComplete ? "Your original blog and scholarship records have been migrated. The public directory now reads from the CMS." : "Import the existing static blog and scholarship data once. After migration, the CMS becomes the source of truth so you can edit or remove those records here."}</p></div>
              <button onClick={() => void importExistingContent()} disabled={saving || migrationComplete} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#14233d] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CirclePlus className="h-4 w-4" />}{migrationComplete ? "Library imported" : "Import existing library"}</button>
            </section>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total blogs" value={data.posts.length} detail={publishedCount + " published"} icon={FileText} />
              <StatCard label="Scholarships active" value={activeScholarships} detail={data.scholarships.length + " total records"} icon={BriefcaseBusiness} />
              <StatCard label="Tools configured" value={tools.length} detail={tools.filter(item => item.visible).length + " visible on site"} icon={Wrench} />
              <StatCard label="Published content" value={publishedCount + activeScholarships} detail="Blogs and active scholarships" icon={Activity} />
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-[#14233d]">Recent blog updates</h2><p className="mt-1 text-xs text-slate-500">Latest records in your content database</p></div><button onClick={() => setTab("blogs")} className="text-xs font-bold text-[#96702b]">Manage blogs →</button></div>
                {data.posts.length ? <div className="mt-4 divide-y divide-slate-100">{data.posts.slice(0, 5).map(post => <div key={post.id} className="flex min-w-0 items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{post.title}</p><p className="mt-1 text-[11px] text-slate-500">{post.category} · {post.slug}</p></div><span className={"shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold " + (post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{post.status}</span></div>)}</div> : <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No admin-managed blog posts yet.</p>}
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="font-black text-[#14233d]">Quick actions</h2><p className="mt-1 text-xs text-slate-500">Create or update site content</p><div className="mt-4 grid gap-2"><button onClick={openNewPost} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left text-sm font-bold hover:border-[#c7a45f] hover:bg-[#fbf8f0]"><CirclePlus className="h-4 w-4 text-[#9b742e]" />Create a blog post</button><button onClick={openNewScholarship} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left text-sm font-bold hover:border-[#c7a45f] hover:bg-[#fbf8f0]"><CirclePlus className="h-4 w-4 text-[#9b742e]" />Add a scholarship</button><button onClick={() => setTab("assets")} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left text-sm font-bold hover:border-[#c7a45f] hover:bg-[#fbf8f0]"><ImageIcon className="h-4 w-4 text-[#9b742e]" />Edit homepage banners</button></div></section>
            </div>
          </section>}

          {tab === "blogs" && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-[#14233d]">Blog & News Manager</h2><p className="mt-1 text-xs text-slate-500">Draft, publish and maintain editorial content.</p></div><button onClick={openNewPost} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#14233d] px-4 text-xs font-bold text-white hover:bg-[#243c61]"><CirclePlus className="h-4 w-4" />New blog</button></div>
            {data.posts.length ? <div className="space-y-3">{data.posts.map(post => <article key={post.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:p-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={"rounded-full px-2 py-1 text-[10px] font-extrabold uppercase " + (post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{post.status}</span><span className="text-[11px] text-slate-500">{post.category}</span></div><h3 className="mt-2 break-words text-sm font-extrabold text-slate-900">{post.title}</h3><p className="mt-1 break-all text-[11px] text-slate-400">/blog/{post.slug}/</p></div><div className="flex shrink-0 items-center gap-2"><button onClick={() => openEditPost(post)} aria-label={"Edit " + post.title} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" />Edit</button><button onClick={() => void remove("posts", post.id)} aria-label={"Delete " + post.title} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></article>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 px-5 py-14 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-700">No admin-managed blogs yet</p><p className="mt-1 text-xs text-slate-500">Create your first post to start building the CMS library.</p></div>}
          </section>}

          {tab === "scholarships" && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-[#14233d]">Scholarships Directory</h2><p className="mt-1 text-xs text-slate-500">Maintain scholarship details and direct application links.</p></div><button onClick={openNewScholarship} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#14233d] px-4 text-xs font-bold text-white"><CirclePlus className="h-4 w-4" />Add scholarship</button></div>
            {data.scholarships.length ? <div className="space-y-3">{data.scholarships.map(item => <article key={item.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:p-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={"rounded-full px-2 py-1 text-[10px] font-bold " + (item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{item.active ? "Active" : "Hidden"}</span><span className="text-[11px] text-slate-500">{item.provider}</span></div><h3 className="mt-2 break-words text-sm font-extrabold">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.amount || "Amount not set"} · Deadline: {item.deadline || "Not set"}</p></div><div className="flex shrink-0 items-center gap-2"><button onClick={() => openEditScholarship(item)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600"><Pencil className="h-3.5 w-3.5" />Edit</button><button onClick={() => void remove("scholarships", item.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></article>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">No admin-managed scholarship records yet.</p>}
          </section>}

          {tab === "tools" && <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-[#14233d]">Tool & Roadmap Configurator</h2><p className="mt-1 text-xs text-slate-500">Edit display names, descriptions, icons and visibility.</p></div><button onClick={() => void saveTools()} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#14233d] px-4 text-xs font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />Save tools</button></div>
              <div className="space-y-3">{tools.map((item, index) => <div key={item.id} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px] sm:items-end"><div className="min-w-0"><label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Tool name</label><input value={item.name} onChange={e => setTools(current => current.map((tool, i) => i === index ? { ...tool, name: e.target.value } : tool))} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><div className="min-w-0"><label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Description</label><input value={item.description} onChange={e => setTools(current => current.map((tool, i) => i === index ? { ...tool, description: e.target.value } : tool))} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><div className="flex items-center justify-between gap-3"><div className="min-w-0 flex-1"><label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Icon name</label><input value={item.icon} onChange={e => setTools(current => current.map((tool, i) => i === index ? { ...tool, icon: e.target.value } : tool))} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#b68b35]" /></div><button type="button" onClick={() => setTools(current => current.map((tool, i) => i === index ? { ...tool, visible: !tool.visible } : tool))} aria-label={item.visible ? "Hide tool" : "Show tool"} className={"mt-5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border " + (item.visible ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-400")}>{item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button></div></div>)}</div>
            </div>
          </section>}

          {tab === "assets" && <section className="grid min-w-0 gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><div className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-[#9b742e]" /><h2 className="font-black text-[#14233d]">Homepage Hero</h2></div><p className="mt-1 text-xs text-slate-500">Update the headline and supporting line shown in the hero area.</p><div className="mt-5 space-y-4"><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Hero title</label><input value={hero.title} onChange={e => setHero(current => ({ ...current, title: e.target.value }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><div><label className="mb-1.5 block text-xs font-bold text-slate-600">Hero subtitle</label><textarea rows={3} value={hero.subtitle} onChange={e => setHero(current => ({ ...current, subtitle: e.target.value }))} className="w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#b68b35]" /></div></div></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-[#9b742e]" /><h2 className="font-black text-[#14233d]">Alert Banner</h2></div><p className="mt-1 text-xs text-slate-500">Show a temporary counselling or admission notice.</p><label className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold"><input type="checkbox" checked={alerts.enabled} onChange={e => setAlerts(current => ({ ...current, enabled: e.target.checked }))} className="h-4 w-4 accent-[#14233d]" />Enable alert banner</label><textarea rows={3} value={alerts.message} onChange={e => setAlerts(current => ({ ...current, message: e.target.value }))} placeholder="Example: AP EAPCET counselling dates have been announced…" className="mt-3 w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#b68b35]" /></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2 sm:p-6"><h2 className="font-black text-[#14233d]">Featured Tags</h2><p className="mt-1 text-xs text-slate-500">Separate tags with commas.</p><input value={featuredTags} onChange={e => setFeaturedTags(e.target.value)} className="mt-4 h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /><div className="mt-5 flex justify-end"><button onClick={() => void saveAssets()} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14233d] px-5 text-sm font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />Save homepage content</button></div></div>
          </section>}
        </>}
      </main>
    </div>

    {postEditorOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"><section role="dialog" aria-modal="true" aria-labelledby="post-editor-title" className="max-h-[94svh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 id="post-editor-title" className="text-lg font-black text-[#14233d]">{editingId ? "Edit blog post" : "Create new blog"}</h2><p className="mt-1 text-xs text-slate-500">Write in Markdown. Preview support is available on the public blog renderer.</p></div><button onClick={() => setPostEditorOpen(false)} aria-label="Close editor" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submitPost} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-bold text-slate-600">Title</label><input required value={postForm.title} onChange={e => setPostForm(v => ({ ...v, title: e.target.value, ...(editingId ? {} : { slug: makeSlug(e.target.value) }) }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><div><label className="mb-1 block text-xs font-bold text-slate-600">Slug</label><input required value={postForm.slug} onChange={e => setPostForm(v => ({ ...v, slug: makeSlug(e.target.value) }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><div><label className="mb-1 block text-xs font-bold text-slate-600">Category</label><input required value={postForm.category} onChange={e => setPostForm(v => ({ ...v, category: e.target.value }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><div><label className="mb-1 block text-xs font-bold text-slate-600">Cover image URL</label><input type="url" value={postForm.coverImage} onChange={e => setPostForm(v => ({ ...v, coverImage: e.target.value }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div></div><div><label className="mb-1 block text-xs font-bold text-slate-600">Short summary</label><textarea rows={2} value={postForm.summary} onChange={e => setPostForm(v => ({ ...v, summary: e.target.value }))} className="w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#b68b35]" /></div><div><label className="mb-1 block text-xs font-bold text-slate-600">Content (Markdown)</label><textarea required rows={12} value={postForm.content} onChange={e => setPostForm(v => ({ ...v, content: e.target.value }))} placeholder={"## Introduction\n\nWrite your article here…"} className="w-full min-w-0 rounded-xl border border-slate-200 p-3 font-mono text-sm leading-6 outline-none focus:border-[#b68b35]" /></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-bold text-slate-600">Tags (comma separated)</label><input value={postForm.tags} onChange={e => setPostForm(v => ({ ...v, tags: e.target.value }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div><label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold"><input type="checkbox" checked={postForm.featured} onChange={e => setPostForm(v => ({ ...v, featured: e.target.checked }))} className="h-4 w-4 accent-[#14233d]" />Feature this article</label></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={postForm.status === "published"} onChange={e => setPostForm(v => ({ ...v, status: e.target.checked ? "published" : "draft" }))} className="h-4 w-4 accent-emerald-700" />Publish immediately</label><button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14233d] px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving…" : "Save blog post"}</button></div></form></section></div>}

    {scholarshipEditorOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"><section role="dialog" aria-modal="true" aria-labelledby="scholarship-editor-title" className="max-h-[94svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 id="scholarship-editor-title" className="text-lg font-black text-[#14233d]">{editingId ? "Edit scholarship" : "Add scholarship"}</h2><p className="mt-1 text-xs text-slate-500">Add verified details and an official application URL.</p></div><button onClick={() => setScholarshipEditorOpen(false)} aria-label="Close editor" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submitScholarship} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2">{([{key:"title",label:"Scholarship title"},{key:"provider",label:"Provider"},{key:"amount",label:"Amount / award"},{key:"deadline",label:"Deadline"},{key:"link",label:"Direct apply link"}] as const).map(field => <div key={field.key}><label className="mb-1 block text-xs font-bold text-slate-600">{field.label}</label><input required={field.key !== "amount" && field.key !== "deadline"} type={field.key === "link" ? "url" : "text"} value={scholarshipForm[field.key]} onChange={e => setScholarshipForm(v => ({ ...v, [field.key]: e.target.value }))} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#b68b35]" /></div>)}</div><div><label className="mb-1 block text-xs font-bold text-slate-600">Eligibility</label><textarea required rows={4} value={scholarshipForm.eligibility} onChange={e => setScholarshipForm(v => ({ ...v, eligibility: e.target.value }))} className="w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#b68b35]" /></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={scholarshipForm.active} onChange={e => setScholarshipForm(v => ({ ...v, active: e.target.checked }))} className="h-4 w-4 accent-emerald-700" />Active / visible</label><div className="flex justify-end border-t border-slate-100 pt-4"><button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14233d] px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save scholarship</button></div></form></section></div>}

    {toast && <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-[60] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-xl bg-[#14233d] px-4 py-3 text-center text-sm font-semibold text-white shadow-xl">{toast}</div>}
  </div>;
}
