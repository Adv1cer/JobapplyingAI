'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Send, ArrowLeft, Plus, Trash2, Save, Loader2, CheckCircle2,
  User, GraduationCap, Briefcase, Wrench, Globe, Target,
} from 'lucide-react';
import { api, resumeApi } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface Education { school: string; degree: string; field: string; startYear: string; endYear: string; gpa?: string; }
interface WorkHistory { company: string; position: string; startDate: string; endDate: string; description: string; }
interface Language { language: string; level: string; }
interface ResumeData {
  firstName: string; lastName: string; phone: string; email: string; summary: string;
  education: Education[]; workHistory: WorkHistory[];
  skills: string[]; languages: Language[];
  desiredPosition: string; desiredSalaryMin: string; desiredSalaryMax: string; desiredProvince: string;
}

const LANG_LEVELS = ['Native', 'Fluent', 'Intermediate', 'Basic'];
const THAI_PROVINCES = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'เชียงใหม่', 'ชลบุรี', 'ขอนแก่น', 'ภูเก็ต', 'นครราชสีมา', 'สุราษฎร์ธานี', 'Remote'];

const empty: ResumeData = {
  firstName: '', lastName: '', phone: '', email: '', summary: '',
  education: [], workHistory: [], skills: [], languages: [],
  desiredPosition: '', desiredSalaryMin: '', desiredSalaryMax: '', desiredProvince: '',
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

export default function ResumesPage() {
  const router = useRouter();
  const [form, setForm] = useState<ResumeData>(empty);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ResumeData & { education: any; workHistory: any; skills: any; languages: any }>('/resume')
      .then((d) => {
        setForm({
          firstName: d.firstName ?? '',
          lastName: d.lastName ?? '',
          phone: d.phone ?? '',
          email: (d as any).email ?? '',
          summary: d.summary ?? '',
          education: Array.isArray(d.education) && d.education.length ? d.education : [],
          workHistory: Array.isArray(d.workHistory) && d.workHistory.length ? d.workHistory : [],
          skills: Array.isArray(d.skills) && d.skills.length ? d.skills : [],
          languages: Array.isArray(d.languages) && d.languages.length ? d.languages : [],
          desiredPosition: d.desiredPosition ?? '',
          desiredSalaryMin: d.desiredSalaryMin ? String(d.desiredSalaryMin) : '',
          desiredSalaryMax: d.desiredSalaryMax ? String(d.desiredSalaryMax) : '',
          desiredProvince: d.desiredProvince ?? '',
        });
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  function setField<K extends keyof ResumeData>(key: K, val: ResumeData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  // Education helpers
  function addEdu() { setField('education', [...form.education, { school: '', degree: '', field: '', startYear: '', endYear: '' }]); }
  function updateEdu(i: number, k: keyof Education, v: string) {
    const next = [...form.education]; next[i] = { ...next[i], [k]: v }; setField('education', next);
  }
  function removeEdu(i: number) { setField('education', form.education.filter((_, idx) => idx !== i)); }

  // Work history helpers
  function addWork() { setField('workHistory', [...form.workHistory, { company: '', position: '', startDate: '', endDate: '', description: '' }]); }
  function updateWork(i: number, k: keyof WorkHistory, v: string) {
    const next = [...form.workHistory]; next[i] = { ...next[i], [k]: v }; setField('workHistory', next);
  }
  function removeWork(i: number) { setField('workHistory', form.workHistory.filter((_, idx) => idx !== i)); }

  // Skills helpers
  function addSkill() {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setField('skills', [...form.skills, s]);
    setSkillInput('');
  }
  function removeSkill(s: string) { setField('skills', form.skills.filter((x) => x !== s)); }

  // Language helpers
  function addLang() { setField('languages', [...form.languages, { language: '', level: 'Intermediate' }]); }
  function updateLang(i: number, k: keyof Language, v: string) {
    const next = [...form.languages]; next[i] = { ...next[i], [k]: v }; setField('languages', next);
  }
  function removeLang(i: number) { setField('languages', form.languages.filter((_, idx) => idx !== i)); }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await resumeApi.save({
        ...form,
        desiredSalaryMin: form.desiredSalaryMin ? Number(form.desiredSalaryMin) : null,
        desiredSalaryMax: form.desiredSalaryMax ? Number(form.desiredSalaryMax) : null,
      });
      setSaved(true);

      const sessionId = result?.reanalyzeSession;
      if (sessionId) {
        // Re-analysis queued — redirect to dashboard so user sees live animation there
        setTimeout(() => router.push('/dashboard'), 1200);
      } else {
        // No existing matches to reanalyze — just show saved state briefly
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      alert(err.message ?? 'Save failed');
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden md:inline">SmartMatch AI</span>
          </div>
          <span className="text-gray-300 hidden md:inline">/</span>
          <span className="text-sm text-gray-600 font-medium hidden sm:inline">My Resume</span>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2 shrink-0 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'บันทึกแล้ว ✓' : 'บันทึก'}</span>
        </Button>
      </div>

      {/* Redirect banner — shown while waiting to navigate to dashboard */}
      {saved && (
        <div className="flex items-center gap-3 px-6 py-3 text-sm border-b bg-green-50 border-green-100 text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          บันทึก Resume แล้ว — กำลังไปยัง Dashboard เพื่อวิเคราะห์งานด้วย Resume ใหม่…
          <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <SectionHeader icon={User} title="ข้อมูลส่วนตัว" />
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">ชื่อ</Label>
              <Input placeholder="สมชาย" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">นามสกุล</Label>
              <Input placeholder="ใจดี" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">เบอร์โทรศัพท์</Label>
              <Input placeholder="08X-XXX-XXXX" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">อีเมล (สำหรับจดหมายสมัครงาน)</Label>
              <Input type="email" placeholder="yourname@email.com" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">สรุปโปรไฟล์ (Professional Summary)</Label>
              <textarea
                rows={3}
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background resize-none"
                placeholder="นักพัฒนา Full Stack มีประสบการณ์ 3 ปี เชี่ยวชาญ React, Node.js..."
                value={form.summary}
                onChange={(e) => setField('summary', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <SectionHeader icon={GraduationCap} title="การศึกษา" />
          <div className="space-y-4">
            {form.education.map((edu, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">การศึกษาที่ {i + 1}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500" onClick={() => removeEdu(i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-xs text-gray-400 mb-1 block">สถาบัน</Label>
                    <Input placeholder="มหาวิทยาลัยเกษตรศาสตร์" value={edu.school} onChange={(e) => updateEdu(i, 'school', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">วุฒิการศึกษา</Label>
                    <Input placeholder="ปริญญาตรี" value={edu.degree} onChange={(e) => updateEdu(i, 'degree', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">สาขา</Label>
                    <Input placeholder="วิศวกรรมซอฟต์แวร์" value={edu.field} onChange={(e) => updateEdu(i, 'field', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">ปีเริ่มต้น</Label>
                    <Input placeholder="2560" value={edu.startYear} onChange={(e) => updateEdu(i, 'startYear', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">ปีจบ (หรือ ปัจจุบัน)</Label>
                    <Input placeholder="2564" value={edu.endYear} onChange={(e) => updateEdu(i, 'endYear', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">GPA (ไม่บังคับ)</Label>
                    <Input placeholder="3.50" value={edu.gpa ?? ''} onChange={(e) => updateEdu(i, 'gpa', e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={addEdu}>
              <Plus className="w-3.5 h-3.5" />เพิ่มการศึกษา
            </Button>
          </div>
        </div>

        {/* Work History */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <SectionHeader icon={Briefcase} title="ประวัติการทำงาน" />
          <div className="space-y-4">
            {form.workHistory.map((w, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">ประสบการณ์ที่ {i + 1}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500" onClick={() => removeWork(i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">บริษัท</Label>
                    <Input placeholder="บริษัท ABC จำกัด" value={w.company} onChange={(e) => updateWork(i, 'company', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">ตำแหน่ง</Label>
                    <Input placeholder="Frontend Developer" value={w.position} onChange={(e) => updateWork(i, 'position', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">เริ่มงาน</Label>
                    <Input type="month" value={w.startDate} onChange={(e) => updateWork(i, 'startDate', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">สิ้นสุด (ว่างถ้าปัจจุบัน)</Label>
                    <Input type="month" value={w.endDate} onChange={(e) => updateWork(i, 'endDate', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-xs text-gray-400 mb-1 block">รายละเอียดงาน / ความสำเร็จ</Label>
                    <textarea
                      rows={3}
                      className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background resize-none"
                      placeholder="พัฒนา feature ใหม่ด้วย React / ลด load time 40%..."
                      value={w.description}
                      onChange={(e) => updateWork(i, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={addWork}>
              <Plus className="w-3.5 h-3.5" />เพิ่มประสบการณ์
            </Button>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <SectionHeader icon={Wrench} title="ทักษะ (Skills)" />
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="เช่น React, Python, SQL, Figma…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              className="text-sm"
            />
            <Button variant="outline" onClick={addSkill} className="gap-1 shrink-0">
              <Plus className="w-4 h-4" />Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-red-500 text-blue-400">✕</button>
              </span>
            ))}
            {form.skills.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีทักษะ — พิมพ์แล้วกด Enter หรือ Add</p>}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <SectionHeader icon={Globe} title="ภาษา" />
          <div className="space-y-3">
            {form.languages.map((l, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Input placeholder="ภาษาไทย / English / 日本語" value={l.language}
                  onChange={(e) => updateLang(i, 'language', e.target.value)} className="h-9 text-sm flex-1" />
                <select className="h-9 text-sm border border-input rounded-md px-3 bg-background"
                  value={l.level} onChange={(e) => updateLang(i, 'level', e.target.value)}>
                  {LANG_LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                </select>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-red-500" onClick={() => removeLang(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={addLang}>
              <Plus className="w-3.5 h-3.5" />เพิ่มภาษา
            </Button>
          </div>
        </div>

        {/* Job Preferences */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <SectionHeader icon={Target} title="ตำแหน่งงานที่ต้องการ" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <Label className="text-xs text-gray-500 mb-1.5 block">ตำแหน่งงานที่ต้องการ</Label>
              <Input placeholder="Frontend Developer / Full Stack Engineer" value={form.desiredPosition}
                onChange={(e) => setField('desiredPosition', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">เงินเดือนขั้นต่ำ (บาท)</Label>
              <Input type="number" placeholder="30000" value={form.desiredSalaryMin}
                onChange={(e) => setField('desiredSalaryMin', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">เงินเดือนสูงสุด (บาท)</Label>
              <Input type="number" placeholder="80000" value={form.desiredSalaryMax}
                onChange={(e) => setField('desiredSalaryMax', e.target.value)} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label className="text-xs text-gray-500 mb-1.5 block">จังหวัดที่ต้องการทำงาน</Label>
              <select className="w-full h-10 text-sm border border-input rounded-md px-3 bg-background"
                value={form.desiredProvince} onChange={(e) => setField('desiredProvince', e.target.value)}>
                <option value="">เลือกจังหวัด</option>
                {THAI_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Save button bottom */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={saving} size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2 px-8 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'บันทึกแล้ว ✓' : 'บันทึก Resume'}
          </Button>
        </div>
      </div>
    </div>
  );
}
