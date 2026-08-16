import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Mic, User as UserIcon, Settings as SettingsIcon, Briefcase, GraduationCap, Code, Rocket, CheckCircle, AlertCircle, Eye, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const PROFILE_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Elon Musk', icon: UserIcon },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'elon@mars.com', readOnly: true, icon: UserIcon },
  { key: 'education', label: 'Education', type: 'text', placeholder: 'Degree, institution, year', icon: GraduationCap },
  { key: 'experience', label: 'Professional Experience', type: 'text', placeholder: 'Roles and years', icon: Briefcase },
  { key: 'skills', label: 'Core Skills', type: 'text', placeholder: 'e.g. JavaScript, React', icon: Code },
  { key: 'pastProjects', label: 'Key Projects', type: 'text', placeholder: 'Important links or descriptions', icon: Rocket },
  { key: 'targetRole', label: 'Target Career Role', type: 'text', placeholder: 'e.g. Frontend Developer', icon: Briefcase },
]

export default function DashboardSettings() {
  const { user, authHeader, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [defaultDifficulty, setDefaultDifficulty] = useState('beginner')
  const [micTesting, setMicTesting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        education: user.education || '',
        experience: user.experience || '',
        skills: user.skills || '',
        pastProjects: user.pastProjects || '',
        targetRole: user.targetRole || '',
      })
    }
  }, [user])

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          name: form.name,
          education: form.education,
          experience: form.experience,
          skills: form.skills,
          pastProjects: form.pastProjects,
          targetRole: form.targetRole,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      await refreshProfile()
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save changes' })
    } finally {
      setSaving(false)
    }
  }

  const startMicTest = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage({ type: 'error', text: 'Microphone access is not supported in this browser.' })
      return
    }
    setMicTesting(true)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop())
        setMessage({ type: 'success', text: 'Microphone is connected and working!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      })
      .catch(() => setMessage({ type: 'error', text: 'Microphone access was denied. Please check site permissions.' }))
      .finally(() => setMicTesting(false))
  }

  if (!user) return null

  return (
    <div className="space-y-10 text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-text-muted text-sm font-medium">Manage your professional profile and interview preferences.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left: Profile Form */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Profile Information</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest border ${message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
                    }`}
                >
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {PROFILE_FIELDS.map(({ key, label, type, placeholder, readOnly, icon }) => (
                  <div key={key} className={`${key === 'targetRole' ? 'md:col-span-2' : ''}`}>
                    <Input
                      label={label}
                      type={type}
                      placeholder={placeholder}
                      readOnly={readOnly}
                      icon={icon}
                      value={form[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className={readOnly ? 'opacity-60 grayscale cursor-not-allowed bg-transparent' : ''}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                  Your profile is used to generate personalized AI interview questions. Make sure it's up to date.
                </p>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Preferences & Appearance */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-8">Preferences</h3>
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Default Difficulty</label>
                <div className="relative group">
                  <select
                    value={defaultDifficulty}
                    onChange={(e) => setDefaultDifficulty(e.target.value)}
                    className="w-full pl-5 pr-12 py-3 rounded-2xl bg-primary-bg/50 border border-border text-text-primary text-sm font-bold appearance-none hover:bg-primary-bg focus:outline-none focus:border-accent/50 transition-all cursor-pointer"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-accent">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-border">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Device Check</label>
                <button
                  type="button"
                  onClick={startMicTest}
                  disabled={micTesting}
                  className="flex items-center gap-4 w-full px-5 py-3 rounded-2xl bg-primary-bg border border-border text-text-primary text-sm font-bold hover:bg-accent-light/10 transition-all group/mic"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${micTesting ? 'bg-accent animate-pulse text-white' : 'bg-accent/10 text-accent group-hover/mic:bg-accent group-hover/mic:text-white'}`}>
                    <Mic className="w-4 h-4" />
                  </div>
                  {micTesting ? 'Testing...' : 'Test Microphone'}
                </button>
              </div>
            </div>
          </Card>

          {/* Appearance Section */}
          <Card className="p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-8">Appearance</h3>
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-primary-bg/50 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                <div className="text-sm font-bold text-text-primary capitalize">{theme} Mode</div>
              </div>
              <button
                onClick={toggleTheme}
                className="relative w-12 h-6 rounded-full bg-border transition-colors hover:bg-accent/20"
              >
                <motion.div
                  animate={{ x: theme === 'dark' ? 26 : 4 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-accent"
                />
              </button>
            </div>
          </Card>

          <Card className="p-8 bg-accent/5 border-accent/20">
            <h4 className="text-text-primary font-bold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent" />
              Privacy Note
            </h4>
            <p className="text-text-muted text-xs leading-relaxed font-medium">
              Your data is encrypted. We only use it to personalize your interview experience.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
