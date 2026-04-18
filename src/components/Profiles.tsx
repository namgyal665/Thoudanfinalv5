import { useState, useEffect, ChangeEvent } from "react";
import { Plus, User, ChevronRight, Camera, X, Check, ArrowLeft } from "lucide-react";
import { Profile, Screen } from "../types";
import { motion } from "motion/react";

const COLORS = [
  '#1D9E75', // green
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EC4899', // pink
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#F43F5E', // coral
  '#6B7280', // gray
];

interface ProfilesProps {
  profiles: Profile[];
  screen: Screen;
  currentProfileId: string | null;
  onNavigate: (screen: Screen) => void;
  onSaveProfile: (profile: Partial<Profile>) => void;
  onDeleteProfile: (id: string) => void;
  onViewProfile: (id: string) => void;
  onEditProfile: (id: string | null) => void;
}

export function Profiles({ 
  profiles, 
  screen, 
  currentProfileId, 
  onNavigate, 
  onSaveProfile,
  onDeleteProfile,
  onViewProfile,
  onEditProfile
}: ProfilesProps) {
  const profile = profiles.find(p => p.id === currentProfileId);

  if (screen === 'profile-edit') {
    return <ProfileEditScreen 
      profile={profile} 
      onBack={() => profile ? onNavigate('profile-view') : onNavigate('profiles')}
      onSave={onSaveProfile}
    />;
  }

  if (screen === 'profile-view' && profile) {
    return <ProfileViewScreen 
      profile={profile} 
      onBack={() => onNavigate('profiles')}
      onEdit={() => onEditProfile(profile.id)}
      onDelete={() => {
        if (confirm('Delete this profile and all its stats?')) {
          onDeleteProfile(profile.id);
          onNavigate('profiles');
        }
      }}
    />;
  }

  return (
    <div className="flex flex-col h-full bg-bg-ios">
      <div className="vibrant-gradient safe-top p-6 pb-12 rounded-b-[40px] shadow-lg mb-4 text-center">
        <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter">Profiles</h2>
        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Player Management</p>
      </div>

      <div className="flex-1 scroll-container px-5 pb-32">
        <button 
          onClick={() => onEditProfile(null)}
          className="w-full bg-white p-4 rounded-2xl border border-primary/20 flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] mb-6 shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Profile
        </button>

        {profiles.length > 0 ? (
          <div className="space-y-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => onViewProfile(p.id)}
                className="vibrant-card w-full p-4 flex items-center gap-4 transition-transform active:scale-98 text-left"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0"
                  style={{ backgroundColor: COLORS[p.colorIdx] }}
                >
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg uppercase tracking-tight">{p.name}</p>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Wins</p>
                      <p className="font-bold text-primary">{p.wins}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Net</p>
                      <p className={`font-bold ${p.mw - p.ml >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {(p.mw - p.ml).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
            <User size={64} strokeWidth={1} />
            <p className="mt-4 font-bold text-lg leading-tight uppercase tracking-widest">No profiles found</p>
            <p className="text-sm mt-2 max-w-[200px]">Create profiles to track stats across games.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileViewScreen({ profile, onBack, onEdit, onDelete }: { profile: Profile, onBack: () => void, onEdit: () => void, onDelete: () => void }) {
  const netBalance = profile.mw - profile.ml;
  
  return (
    <div className="flex flex-col h-full bg-bg-ios">
      <div className="vibrant-gradient safe-top p-4 flex items-center justify-between sticky top-0 z-40">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60"><ArrowLeft size={24} /></button>
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Player Profile</h2>
        <button onClick={onEdit} className="p-2 -mr-2 text-white/60"><Camera size={20} /></button>
      </div>

      <div className="flex-1 scroll-container pb-32">
        <div className="bg-white p-8 flex flex-col items-center rounded-b-[48px] shadow-sm border-b border-gray-100 mb-6">
          <div 
            className="w-28 h-28 rounded-[36px] shadow-2xl flex items-center justify-center text-white font-bold text-4xl overflow-hidden mb-6 border-4 border-white"
            style={{ backgroundColor: COLORS[profile.colorIdx] }}
          >
            {profile.photo ? (
              <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tighter">{profile.name}</h1>
          <p className="text-text-muted mt-2 text-center text-sm font-medium px-4">{profile.bio || "Competitive THOUSAND player"}</p>
          
          <div className="flex gap-3 mt-8 w-full max-w-xs">
            <button onClick={onEdit} className="flex-1 bg-primary text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-widest shadow-md">Edit Profile</button>
            <button onClick={onDelete} className="px-5 bg-rose-50 text-rose-500 font-bold py-3 rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-widest border border-rose-100">Delete</button>
          </div>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3">
          <div className="vibrant-card p-5 flex flex-col items-center">
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Played</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter">{profile.games}</p>
          </div>
          <div className="vibrant-card p-5 flex flex-col items-center">
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Victories</p>
            <p className="text-2xl font-black text-primary tracking-tighter">{profile.wins}</p>
          </div>
          
          <div className="vibrant-card p-5 flex flex-col items-center">
             <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Won</p>
             <p className="text-lg font-bold text-primary tracking-tight">+{profile.mw.toFixed(2)}€</p>
          </div>
          <div className="vibrant-card p-5 flex flex-col items-center">
             <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Paid</p>
             <p className="text-lg font-bold text-error tracking-tight">-{profile.ml.toFixed(2)}€</p>
          </div>

          <div className="col-span-2 vibrant-gradient p-8 rounded-[36px] shadow-lg flex flex-col items-center text-white mt-2">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Overall Profit</p>
            <p className="text-4xl font-black tracking-tighter">
              {netBalance.toFixed(2)}€
            </p>
            <div className="mt-3 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
               {netBalance >= 0 ? 'In the green' : 'In the red'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileEditScreen({ profile, onBack, onSave }: { profile?: Profile, onBack: () => void, onSave: (p: Partial<Profile>) => void }) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [colorIdx, setColorIdx] = useState(profile?.colorIdx || 0);
  const [photo, setPhoto] = useState(profile?.photo || null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isNew = !profile;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="vibrant-gradient safe-top p-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60"><X size={24} /></button>
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">{isNew ? 'New Profile' : 'Edit Profile'}</h2>
        <button 
          onClick={() => {
            if (name.trim()) {
              onSave({ id: profile?.id, name, bio, colorIdx, photo });
              onBack();
            }
          }}
          disabled={!name.trim()}
          className="bg-white text-primary font-bold px-4 py-2 rounded-full text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-30"
        >
          Save
        </button>
      </div>

      <div className="flex-1 scroll-container p-6">
        <div className="flex flex-col items-center mb-10 mt-4">
          <div className="relative">
            <div 
              className="w-28 h-28 rounded-[36px] shadow-xl flex items-center justify-center text-white font-bold text-4xl overflow-hidden border-2 border-gray-50"
              style={{ backgroundColor: COLORS[colorIdx] }}
            >
              {photo ? (
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase() || <User size={40} />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-2xl shadow-xl cursor-pointer active:scale-90 transition-transform">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
            {photo && (
              <button 
                onClick={() => setPhoto(null)}
                className="absolute -top-2 -left-2 bg-error text-white p-1 rounded-full shadow-lg"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="vibrant-card p-1 pb-2">
            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 ml-4 pt-3">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="w-full bg-transparent border-none px-4 py-2 text-lg font-bold text-gray-900 focus:ring-0 outline-hidden"
              autoFocus
            />
          </div>

          <div className="vibrant-card p-1 pb-2">
            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 ml-4 pt-3">Tagline / Bio</label>
            <input 
              type="text" 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. The Poker Face"
              className="w-full bg-transparent border-none px-4 py-2 font-medium text-gray-700 focus:ring-0 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mb-4 ml-2">Avatar Color</label>
            <div className="grid grid-cols-4 gap-3 px-2">
              {COLORS.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setColorIdx(idx)}
                  className={`w-full aspect-square rounded-2xl transition-all relative ${
                    colorIdx === idx ? 'scale-110 shadow-lg' : 'opacity-40 scale-90 grayscale-[0.5]'
                  }`}
                  style={{ backgroundColor: color }}
                >
                   {colorIdx === idx && <div className="absolute inset-0 flex items-center justify-center text-white"><Check size={20} strokeWidth={3} /></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
