'use client';

import { useState, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Shield, ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Guest, GovernmentDoc } from './guests-list';

type DocType = 'NIN' | 'Passport' | 'Driver License' | 'Voter ID';

interface AddGuestModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<Guest, 'id' | 'totalStays' | 'lastVisit' | 'totalRevenue' | 'stayHistory' | 'stayComments'>) => void;
}

const DOC_TYPES: DocType[] = ['NIN', 'Passport', 'Driver License', 'Voter ID'];

export default function AddGuestModal({ onClose, onSubmit }: AddGuestModalProps) {
  const [basicData, setBasicData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
  });
  const [showDocs, setShowDocs] = useState(false);
  const [docs, setDocs] = useState<GovernmentDoc[]>([]);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = (field: string, value: string) =>
    setBasicData((prev) => ({ ...prev, [field]: value }));

  const addDoc = () =>
    setDocs((prev) => [...prev, { type: 'NIN', number: '', photoDataUrl: undefined }]);

  const removeDoc = (i: number) =>
    setDocs((prev) => prev.filter((_, idx) => idx !== i));

  const updateDoc = (i: number, patch: Partial<GovernmentDoc>) =>
    setDocs((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const handlePhotoUpload = (i: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => updateDoc(i, { photoDataUrl: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...basicData, governmentDocs: docs });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Add New Guest</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in guest details to register</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1">
          <form id="add-guest-form" onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Basic Info */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Information</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'First Name', field: 'firstName', placeholder: 'Emeka', required: true },
                  { label: 'Last Name', field: 'lastName', placeholder: 'Okafor', required: true },
                ].map(({ label, field, placeholder, required }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={(basicData as any)[field]}
                      onChange={(e) => set(field, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      placeholder={placeholder}
                      required={required}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={basicData.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    placeholder="emeka@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={basicData.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      placeholder="+234-803-000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Country</label>
                    <input
                      type="text"
                      value={basicData.country}
                      onChange={(e) => set('country', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      placeholder="Nigeria"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Government Documents — Optional */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDocs(!showDocs)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shield size={15} className="text-emerald-400" />
                  <span className="text-sm font-medium text-foreground">Government Documents</span>
                  <span className="text-[10px] font-medium bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                  {docs.length > 0 && (
                    <span className="text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full">
                      {docs.length} added
                    </span>
                  )}
                </div>
                {showDocs ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {showDocs && (
                <div className="border-t border-border px-4 py-4 bg-secondary/20 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Collecting government-issued ID is required for guest verification. Documents are securely stored and only accessible to authorized staff.
                  </p>

                  {docs.map((doc, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document {i + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeDoc(i)}
                          className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Type</label>
                          <select
                            value={doc.type}
                            onChange={(e) => updateDoc(i, { type: e.target.value as DocType })}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          >
                            {DOC_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Number</label>
                          <input
                            type="text"
                            value={doc.number}
                            onChange={(e) => updateDoc(i, { number: e.target.value })}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="e.g. NIN12345678"
                          />
                        </div>
                      </div>
                      {/* Photo upload */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Photo (optional)</label>
                        {doc.photoDataUrl ? (
                          <div className="relative">
                            <img
                              src={doc.photoDataUrl}
                              alt="Document preview"
                              className="w-full max-h-32 object-contain rounded-lg border border-border bg-black/20"
                            />
                            <button
                              type="button"
                              onClick={() => updateDoc(i, { photoDataUrl: undefined })}
                              className="absolute top-2 right-2 p-1 bg-card border border-border rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileRefs.current[i]?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                          >
                            <ImageIcon size={14} />
                            Click to upload photo
                          </button>
                        )}
                        <input
                          ref={(el) => { fileRefs.current[i] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(i, e.target.files?.[0] ?? null)}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addDoc}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-primary/30 rounded-xl text-xs text-primary hover:bg-primary/5 transition-all font-medium"
                  >
                    <Plus size={14} />
                    Add Document
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-guest-form"
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Register Guest
          </button>
        </div>
      </div>
    </div>
  );
}
