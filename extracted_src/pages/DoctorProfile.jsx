import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2, ArrowLeft, Stethoscope, Building2, MapPin, GraduationCap,
  Award, BadgeCheck, Clock, ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-50 bg-emerald-50/40 p-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Icon className="h-4 w-4" /></span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/doctors/${id}`).then((r) => setDoctor(r.data)).catch((e) => setError(apiError(e, "Doctor not found.")));
  }, [id]);

  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center" data-testid="doctor-profile-error">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/doctors">{t("nav_doctors")}</Link></Button>
        </div>
      </Layout>
    );
  }
  if (!doctor) {
    return <Layout><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl" data-testid="doctor-profile">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-1.5 text-slate-600" data-testid="doctor-profile-back">
          <ArrowLeft className="h-4 w-4" /> {t("nav_doctors")}
        </Button>

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white card-shadow">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={doctor.photo || undefined} alt={doctor.full_name} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700"><Stethoscope className="h-10 w-10" /></AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h1 className="font-display text-2xl font-bold text-white">{doctor.full_name}</h1>
                <p className="text-emerald-50">{doctor.specialization}</p>
                <Badge className="mt-2 gap-1 bg-white/90 text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Verified</Badge>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {doctor.bio ? (
              <div className="mb-5">
                <h2 className="mb-1.5 font-display text-base font-semibold text-slate-900">{t("about")}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Row icon={Building2} label={t("department")} value={doctor.department} />
              <Row icon={MapPin} label={t("hospital")} value={doctor.hospital} />
              <Row icon={MapPin} label={t("branch")} value={doctor.branch} />
              <Row icon={Award} label={t("experience")} value={doctor.experience} />
              <Row icon={GraduationCap} label={t("qualification")} value={doctor.qualification} />
              <Row icon={GraduationCap} label={t("college")} value={doctor.college} />
              <Row icon={ShieldCheck} label={t("reg_authority")} value={doctor.registration_authority} />
              <Row icon={Clock} label={t("consultation_info")} value={doctor.consultation_info} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
