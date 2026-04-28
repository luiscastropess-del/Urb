"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Moon,
  Bell,
  Search,
  Heart,
  MapPin,
  ArrowDownWideNarrow,
  PenLine,
  FolderPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPlaces, getFavorites } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Favorite, Place } from "@prisma/client";

export default function FavoritesPage() {
  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("Todos");

  const fetchFavs = () => {
    getFavorites().then(setFavorites);
  }

  useEffect(() => {
    fetchFavs();
  }, []);

  const handleToggle = async (placeId: string) => {
    const { toggleFavorite } = await import('@/app/actions');
    const res = await toggleFavorite({ placeId });
    if(res.status === 'removed') {
        showToast('💔 Removido dos favoritos');
    }
    fetchFavs();
  };

  const collections = Array.from(new Set(favorites.map(f => f.collection || "Geral")));
  
  const filteredFavorites = favorites.filter((f) => {
    const searchMatch = !searchTerm || (f.place?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const collectionMatch = selectedCollection === "Todos" || (f.collection || "Geral") === selectedCollection;
    return searchMatch && collectionMatch;
  });

  const handleCreateCollection = async () => {
    const name = window.prompt("Nome da nova coleção:");
    if (name) {
      showToast('✅ Coleção pronta para uso! Salve um local nela.');
      setSelectedCollection(name);
    }
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shadow-lg">
              <Heart className="text-white fill-white" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <MapPin className="text-orange-500" size={12} />
                <span className="text-sm font-medium">Holambra, SP 🌷</span>
              </div>
              <h1 className="text-xl font-bold">Favoritos</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <Moon className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
            <button
              onClick={() => showToast("🔔 Notificações")}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <Bell className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar nos seus favoritos..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/50 outline-none"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 feed-scroll px-5">
        <div className="flex items-center justify-between mt-4 mb-3">
          <p className="text-sm text-slate-500">
            <span>{favorites.length}</span> lugares salvos
          </p>
          <div className="flex gap-4">
            <button className="text-sm font-medium text-orange-500 flex items-center gap-1">
              <ArrowDownWideNarrow size={14} /> Recentes
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`text-sm font-medium flex items-center gap-1 ${editMode ? "text-orange-500" : "text-slate-500"}`}
            >
              <PenLine size={14} /> Editar
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scroll-x pb-3 mb-2 hide-scroll cursor-pointer">
          <span 
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm ${selectedCollection === 'Todos' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            onClick={() => setSelectedCollection('Todos')}
          >
            🌷 Todos
          </span>
          {collections.map(col => (
             <span key={col} onClick={() => setSelectedCollection(col as string)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCollection === col ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {col as string}
             </span>
          ))}
        </div>

        {/* Lista de Favoritos */}
        <div className="space-y-3 mb-8">
          {filteredFavorites.length === 0 ? (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-6 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-500">Nenhum favorito encontrado.</p>
            </div>
          ) : (
            filteredFavorites.map((f) => (
              <FavoriteItem
                key={f.id}
                placeId={f.place?.id}
                emoji={f.place?.emoji}
                name={f.place?.name}
                rating={f.place?.rating}
                address={f.place?.address}
                date={new Date().toLocaleDateString()}
                note={f.note}
                profileImage={f.place?.profileImage}
                coverImage={f.place?.coverImage}
                onToggle={() => handleToggle(f.placeId)}
              />
            ))
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              Minhas coleções
            </h3>
            <button className="text-xs text-orange-500 font-medium flex items-center gap-1" onClick={handleCreateCollection}>
              <FolderPlus size={14} /> Criar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {collections.map((col, idx) => {
               const colFavs = favorites.filter(f => f.collection === col);
               return (
                 <div key={idx} onClick={() => setSelectedCollection(col as string)} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 rounded-2xl p-3 cursor-pointer shadow-sm transition hover:border-orange-500">
                   <div className="h-20 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-2xl mb-2">
                     {idx % 2 === 0 ? '🌷🌸' : '👨‍👩‍👧‍👦'}
                   </div>
                   <h4 className="font-semibold text-sm truncate">{col as string}</h4>
                   <p className="text-xs text-slate-500">{colFavs.length} lugares</p>
                 </div>
               )
            })}
            
            {collections.length === 0 && (
                <div className="col-span-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
                    <p className="text-sm text-slate-500">Você ainda não organizou coleções.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoriteItem({ placeId, emoji, name, rating, address, date, note, coverImage, profileImage, onToggle }: any) {
  const router = useRouter();
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-sm cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => router.push(`/place/${placeId}`)}>
      <div className="flex gap-3">
        <div className="h-16 w-16 min-w-[4rem] rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl overflow-hidden relative">
          {(profileImage || coverImage) ? (
            <img src={profileImage || coverImage} className="w-full h-full object-cover" />
          ) : emoji}
        </div>
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex justify-between items-start">
            <h4 className="font-bold truncate max-w-[80%]">{name}</h4>
            <button className="text-rose-500" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              <Heart size={16} className="fill-rose-500" />
            </button>
          </div>
          <p className="text-sm font-medium text-amber-500 mb-1">★ {rating}</p>
          <p className="text-xs text-slate-500 truncate">
            <MapPin size={10} className="inline mr-1" />
            {address}
          </p>
          {note && (
            <p className="text-xs text-slate-400 mt-1 truncate">📝 {note}</p>
          )}
        </div>
      </div>
    </div>
  );
}
