import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search, Stethoscope, Building2, MapPin, UserSearch } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

const ALL = "__all__";
const EMPTY_FILTERS = { q: "", hospital: "", specialization: ALL, department: ALL };

function DoctorFilters({ filters, onChange, specs, depts }) {
  const { t } = useLang();
  const set = (k) => (v) => onChange((f) => ({ ...f, [k]: v }));
  return (
    <div className="mb-6 grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 card-shadow sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={filters.q} onChange={(e) => set("q")(e.target.value)} placeholder={t("search_name")} className="pl-9" data-testid="doctor-search-name" />
      </div>
      <Select value={filters.specialization} onValueChange={set("specialization")}>
        <SelectTrigger data-testid="doctor-filter-specialization"><SelectValue placeholder={t("all_specializations")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("all_specializations")}</SelectItem>
          {specs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.department} onValueChange={set("department")}>
        <SelectTrigger data-testid="doctor-filter-department"><SelectValue placeholder={t("all_departments")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("all_departments")}</SelectItem>
          {depts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input value={filters.hospital} onChange={(e) => set("hospital")(e.target.value)} placeholder={t("filter_hospital")} data-testid="doctor-filter-hospital" />
    </div>
  );
}

function DoctorCard({ d }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-5 card-shadow card-shadow-hover" data-testid={`doctor-card-${d.id}`}>
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border-2 border-emerald-100">
          <AvatarImage src={d.photo || undefined} alt={d.full_name} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700"><Stethoscope className="h-6 w-6" /></AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold text-slate-900">{d.full_name}</h3>
          <p className="truncate text-sm text-emerald-700">{d.specialization}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-sm text-slate-500">
        <p className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-slate-400" /> {d.department}</p>
        <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {d.hospital}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {d.experience ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{d.experience}</Badge> : null}
        {d.qualification ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">{d.qualification}</Badge> : null}
      </div>
      <Button asChild variant="outline" className="mt-4 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
        <Link to={`/doctors/${d.id}`} data-testid={`doctor-view-${d.id}`}>{t("view_profile")}</Link>
      </Button>
    </div>
  );
}

function DoctorResults({ doctors, error, onRetry }) {
  const { t } = useLang();
  if (doctors === null) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <Button variant="outline" className="mt-3" onClick={onRetry}>{t("retry")}</Button>
      </div>
    );
  }
  if (doctors.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow" data-testid="doctors-empty">
        <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><UserSearch className="h-7 w-7" /></span>
        <h3 className="font-display text-lg font-semibold text-slate-800">{t("no_doctors")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("no_doctors_sub")}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="doctors-grid">
      {doctors.map((d) => <DoctorCard key={d.id} d={d} />)}
    </div>
  );
}

export default function Doctors() {
  const { t } = useLang();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [specs, setSpecs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [doctors, setDoctors] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/specializations").then((r) => setSpecs(r.data)).catch((e) => console.warn("Could not load specializations:", e));
    api.get("/departments").then((r) => setDepts(r.data)).catch((e) => console.warn("Could not load departments:", e));
  }, []);

  const load = useCallback(async () => {
    setError("");
    setDoctors(null);
    try {
      const params = {};
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.hospital.trim()) params.hospital = filters.hospital.trim();
      if (filters.specialization !== ALL) params.specialization = filters.specialization;
      if (filters.department !== ALL) params.department = filters.department;
      const { data } = await api.get("/doctors", { params });
      setDoctors(data);
    } catch (e) {
      setError(apiError(e));
      setDoctors([]);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("doctors_title")}</h1>
        <p className="mt-1.5 text-slate-500">{t("doctors_sub")}</p>
      </div>
      <DoctorFilters filters={filters} onChange={setFilters} specs={specs} depts={depts} />
      <DoctorResults doctors={doctors} error={error} onRetry={load} />
    </Layout>
  );
}
