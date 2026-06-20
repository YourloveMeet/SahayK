'use client'

import React, { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, User, ArrowLeft, Pill, Bell, Trash2, Clock, StickyNote, FileText, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { ProfileTab } from './ProfileTab'
import { CareNotesTab } from './CareNotesTab'
import { DocumentsTab } from './DocumentsTab'
import { VisitorsTab } from './VisitorsTab'
import { IncidentsTab } from './IncidentsTab'

function RadialTimePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  let initH = 12, initM = 0, initA = 'AM';
  if (value) {
    const [h, m] = value.split(':');
    const hNum = parseInt(h, 10);
    initM = parseInt(m, 10);
    initA = hNum >= 12 ? 'PM' : 'AM';
    initH = hNum % 12 || 12;
  }
  
  const [hour, setHour] = useState(initH);
  const [minute, setMinute] = useState(initM);
  const [ampm, setAmPm] = useState(initA);
  const [view, setView] = useState<'hour' | 'minute'>('hour');

  const handleSave = () => {
    let h24 = hour === 12 ? (ampm === 'AM' ? 0 : 12) : (ampm === 'AM' ? hour : hour + 12);
    onChange(`${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    setIsOpen(false);
  };

  const getDialItems = () => {
    return view === 'hour' 
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  };

  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium dark:text-white"
      >
        <span>{value ? `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} ${ampm}` : 'Select Time'}</span>
        <Clock className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[300px] bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95">
             <div className="bg-zinc-900 dark:bg-white p-6 text-white dark:text-zinc-900 flex flex-col items-center justify-center space-y-2">
               <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Select Time</div>
               <div className="flex items-end gap-2">
                 <div className="text-5xl font-black tracking-tight flex gap-1">
                   <button type="button" onClick={() => setView('hour')} className={`transition-opacity hover:opacity-100 ${view === 'hour' ? 'opacity-100' : 'opacity-50'}`}>{hour.toString().padStart(2,'0')}</button>
                   <span className="opacity-50">:</span>
                   <button type="button" onClick={() => setView('minute')} className={`transition-opacity hover:opacity-100 ${view === 'minute' ? 'opacity-100' : 'opacity-50'}`}>{minute.toString().padStart(2,'0')}</button>
                 </div>
                 <div className="flex flex-col text-sm font-bold gap-1 ml-2">
                   <button type="button" onClick={() => setAmPm('AM')} className={`transition-opacity hover:opacity-100 ${ampm === 'AM' ? 'opacity-100 text-zinc-400 dark:text-zinc-500' : 'opacity-50'}`}>AM</button>
                   <button type="button" onClick={() => setAmPm('PM')} className={`transition-opacity hover:opacity-100 ${ampm === 'PM' ? 'opacity-100 text-zinc-400 dark:text-zinc-500' : 'opacity-50'}`}>PM</button>
                 </div>
               </div>
             </div>

             <div className="p-6 flex justify-center">
               <div className="w-56 h-56 rounded-full bg-gray-50 dark:bg-black relative border-4 border-gray-100 dark:border-zinc-900 shadow-inner">
                 <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-zinc-900 dark:bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                 
                 {getDialItems().map((val, i) => {
                   const angle = (val === 12 || val === 0 ? 0 : val) * (view === 'hour' ? 30 : 6) - 90;
                   const rad = angle * (Math.PI / 180);
                   const x = Math.cos(rad) * 90;
                   const y = Math.sin(rad) * 90;
                   const isSelected = view === 'hour' ? hour === val : minute === val;

                   return (
                     <button
                       key={val}
                       type="button"
                       onClick={() => {
                         if (view === 'hour') {
                           setHour(val);
                           setView('minute');
                         } else {
                           setMinute(val);
                         }
                       }}
                       className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                         isSelected 
                           ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/30 dark:shadow-white/30' 
                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                       }`}
                       style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                     >
                       {val.toString().padStart(2, '0')}
                     </button>
                   )
                 })}
               </div>
             </div>

             <div className="p-4 flex justify-end gap-2">
               <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
               <button type="button" onClick={handleSave} className="px-4 py-2 font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">OK</button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResidentDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const residentId = resolvedParams.id
  
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'medicines' | 'reminders' | 'care_notes' | 'documents' | 'visitors' | 'incidents'>('profile')
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)

  const [newMed, setNewMed] = useState({
    medicine_name: '',
    dosage: '',
    frequency: 'Daily',
    time_of_day: ['Morning'],
    notes: ''
  })

  const [newReminder, setNewReminder] = useState<{
    title: string;
    description: string;
    reminder_type: string;
    recurring: boolean;
    recurrence_pattern: string;
    custom_days: number[];
  }>({
    title: '',
    description: '',
    reminder_type: 'Pill',
    recurring: false,
    recurrence_pattern: 'daily',
    custom_days: []
  })
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')

  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      return user
    }
  })

  // Get Resident Details
  const { data: resident, isLoading: isLoadingResident } = useQuery({
    queryKey: ['ngo', 'resident', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_residents')
        .select('*')
        .eq('id', residentId)
        .single()
      return data || null
    }
  })

  // Get Medicines
  const { data: medicines } = useQuery({
    queryKey: ['ngo', 'medicines', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('resident_medicines')
        .select('*')
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  // Get Reminders
  const { data: reminders } = useQuery({
    queryKey: ['ngo', 'reminders', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('resident_reminders')
        .select('*')
        .eq('resident_id', residentId)
        .order('due_date', { ascending: true })
      return data || []
    }
  })

  // Add Medicine Mutation
  const addMedicineMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('resident_medicines')
        .insert({
          resident_id: residentId,
          medicine_name: newMed.medicine_name,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          time_of_day: newMed.time_of_day,
          notes: newMed.notes,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'medicines', residentId] })
      setIsMedicineModalOpen(false)
      setNewMed({ medicine_name: '', dosage: '', frequency: 'Daily', time_of_day: ['Morning'], notes: '' })
    }
  })

  const deleteMedicineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('resident_medicines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngo', 'medicines', residentId] })
  })

  // Add Reminder Mutation
  const addReminderMutation = useMutation({
    mutationFn: async () => {
      // Combine date and time
      const combinedDate = new Date(`${reminderDate}T${reminderTime}`).toISOString()

      const { error } = await supabase
        .from('resident_reminders')
        .insert({
          resident_id: residentId,
          title: newReminder.title,
          description: newReminder.description,
          due_date: combinedDate,
          reminder_type: newReminder.reminder_type,
          recurring: newReminder.recurring,
          recurrence_pattern: newReminder.recurring 
            ? (newReminder.recurrence_pattern === 'custom' ? `custom:${newReminder.custom_days.join(',')}` : newReminder.recurrence_pattern)
            : null,
          created_by: userProfile?.id,
          completed: false
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'reminders', residentId] })
      setIsReminderModalOpen(false)
      setNewReminder({ title: '', description: '', reminder_type: 'Pill', recurring: false, recurrence_pattern: 'daily', custom_days: [] })
      setReminderDate('')
      setReminderTime('')
    }
  })

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('resident_reminders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngo', 'reminders', residentId] })
  })

  if (isLoadingResident) return <div className="p-8 text-center">Loading resident...</div>
  if (!resident) return <div className="p-8 text-center text-red-500">Resident not found</div>

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 relative pb-20">
      <Link href="/ngo/residents" className="inline-flex items-center gap-2 text-zinc-900 dark:text-white font-bold hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Residents
      </Link>

      <div className="backdrop-blur-xl bg-white/80 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-sm border border-gray-200 dark:border-zinc-800 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 relative">
            {resident.photo_url ? (
              <img src={resident.photo_url} alt={resident.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-zinc-900 dark:text-white" />
            )}
            {resident.status && resident.status !== 'active' && (
              <span className="absolute -bottom-2 right-0 w-4 h-4 bg-red-500 border-2 border-white dark:border-black rounded-full" title={resident.status}></span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              {resident.full_name}
              {resident.status && resident.status !== 'active' && (
                <span className="text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-md align-middle">{resident.status}</span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium text-lg">
              {resident.age ? `${resident.age} years old` : 'Age unknown'} • {resident.gender}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto relative z-10 pb-1 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'profile' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <User className="w-4 h-4" /> Profile
        </button>
        <button 
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'medicines' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Pill className="w-4 h-4" /> Medicines
        </button>
        <button 
          onClick={() => setActiveTab('reminders')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'reminders' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Bell className="w-4 h-4" /> Reminders
        </button>
        <button 
          onClick={() => setActiveTab('care_notes')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'care_notes' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <StickyNote className="w-4 h-4" /> Care Notes
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'documents' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <FileText className="w-4 h-4" /> Documents
        </button>
        <button 
          onClick={() => setActiveTab('visitors')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'visitors' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Visitors
        </button>
        <button 
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 px-3 font-bold text-sm md:text-base whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'incidents' ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Incidents
        </button>
      </div>

      <div className="relative z-10">
        {activeTab === 'profile' && <ProfileTab resident={resident} />}
        {activeTab === 'care_notes' && <CareNotesTab residentId={resident.id} />}
        {activeTab === 'documents' && <DocumentsTab residentId={resident.id} />}
        {activeTab === 'visitors' && <VisitorsTab residentId={resident.id} />}
        {activeTab === 'incidents' && <IncidentsTab residentId={resident.id} />}
        
        {activeTab === 'medicines' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescribed Medicines</h2>
              <button 
                onClick={() => setIsMedicineModalOpen(true)}
                className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Medicine
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines?.map(med => (
                <div key={med.id} className="p-5 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm relative group">
                  <button onClick={() => deleteMedicineMutation.mutate(med.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{med.medicine_name}</h3>
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-1">{med.dosage}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-200">Freq:</strong> {med.frequency}</p>
                    <p><strong className="text-gray-900 dark:text-gray-200">Time:</strong> {med.time_of_day?.join(', ')}</p>
                    {med.notes && <p className="italic text-xs mt-2">{med.notes}</p>}
                  </div>
                </div>
              ))}
              {medicines?.length === 0 && (
                <p className="text-gray-500 col-span-full">No medicines logged.</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduled Reminders</h2>
              <button 
                onClick={() => setIsReminderModalOpen(true)}
                className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Reminder
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reminders?.map(rem => (
                <div key={rem.id} className={`p-5 backdrop-blur-md rounded-2xl border shadow-sm relative group ${rem.completed ? 'bg-gray-50/50 dark:bg-black/40 border-transparent opacity-70' : 'bg-white/60 dark:bg-black/60 border-gray-200 dark:border-zinc-800'}`}>
                  <button onClick={() => deleteReminderMutation.mutate(rem.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${rem.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {rem.title}
                    {rem.completed && <span className="text-[10px] uppercase tracking-wider font-black text-zinc-700 bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded no-underline">Done</span>}
                  </h3>
                  <p className={`text-sm font-bold mt-1 ${rem.completed ? 'text-gray-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {new Date(rem.due_date!).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-gray-200">Type:</strong> {rem.reminder_type}</p>
                    {rem.recurring && <p><strong className="text-gray-900 dark:text-gray-200">Recurs:</strong> {rem.recurrence_pattern}</p>}
                    {rem.description && <p className={`mt-2 text-xs ${rem.completed && 'line-through'}`}>{rem.description}</p>}
                  </div>
                </div>
              ))}
              {reminders?.length === 0 && (
                <p className="text-gray-500 col-span-full">No reminders scheduled.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {isMedicineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Add Medicine</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Medicine Name" value={newMed.medicine_name} onChange={e => setNewMed({...newMed, medicine_name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl" />
              <input type="text" placeholder="Dosage (e.g. 500mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl" />
              <select value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <option>Daily</option><option>Weekly</option><option>As needed</option>
              </select>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">Time of Day</label>
                <div className="flex gap-2">
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg cursor-pointer">
                      <input type="checkbox" checked={newMed.time_of_day.includes(t)} onChange={e => {
                        const newTimes = e.target.checked ? [...newMed.time_of_day, t] : newMed.time_of_day.filter(x => x !== t)
                        setNewMed({...newMed, time_of_day: newTimes})
                      }} /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <textarea placeholder="Notes (optional)" value={newMed.notes} onChange={e => setNewMed({...newMed, notes: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsMedicineModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold">Cancel</button>
              <button onClick={() => addMedicineMutation.mutate()} className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold" disabled={addMedicineMutation.isPending || !newMed.medicine_name}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Reminder</h2>
                <p className="text-sm text-gray-500 mt-1">Schedule a new task or medicine.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reminder Title *</label>
                  <input type="text" placeholder="e.g. Morning Blood Pressure" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date *</label>
                    <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time *</label>
                    <RadialTimePicker value={reminderTime} onChange={setReminderTime} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</label>
                    <select value={newReminder.reminder_type} onChange={e => setNewReminder({...newReminder, reminder_type: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white">
                      <option>Pill</option><option>Doctor</option><option>Task</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Recurring?</label>
                    <label className="flex items-center h-[58px] px-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer">
                      <input type="checkbox" checked={newReminder.recurring} onChange={e => setNewReminder({...newReminder, recurring: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-white" />
                      <span className="ml-3 font-bold text-sm text-gray-700 dark:text-gray-300">Repeat Task</span>
                    </label>
                  </div>
                </div>

                {newReminder.recurring && (
                  <div className="space-y-4">
                    <div className="space-y-1.5 animate-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pattern</label>
                      <select value={newReminder.recurrence_pattern} onChange={e => setNewReminder({...newReminder, recurrence_pattern: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white">
                        <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom Days</option>
                      </select>
                    </div>

                    {newReminder.recurrence_pattern === 'custom' && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select Days</label>
                        <div className="flex justify-between gap-1">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const days = newReminder.custom_days.includes(idx) 
                                  ? newReminder.custom_days.filter(d => d !== idx)
                                  : [...newReminder.custom_days, idx];
                                setNewReminder({ ...newReminder, custom_days: days });
                              }}
                              className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${newReminder.custom_days.includes(idx) ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md shadow-zinc-900/30 dark:shadow-white/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700'}`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
                  <textarea placeholder="Optional notes..." value={newReminder.description} onChange={e => setNewReminder({...newReminder, description: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none min-h-[80px] resize-none font-medium dark:text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-zinc-800 flex gap-3">
              <button onClick={() => setIsReminderModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors dark:text-white">Cancel</button>
              <button onClick={() => addReminderMutation.mutate()} className="flex-1 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold transition-all shadow-lg shadow-zinc-900/10 disabled:opacity-50" disabled={addReminderMutation.isPending || !newReminder.title || !reminderDate || !reminderTime || (newReminder.recurring && newReminder.recurrence_pattern === 'custom' && newReminder.custom_days.length === 0)}>Save Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
