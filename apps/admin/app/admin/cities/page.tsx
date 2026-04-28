"use client";

import { useState, useEffect } from "react";
import { 
  Building2, Plus, Search, Edit2, Trash2, MapPin, 
  Image as ImageIcon, MoreVertical, X, Check, Camera
} from "lucide-react";
import { getCities, createCity, updateCity, deleteCity } from "@/app/actions.cities";
import { useToast } from "@/components/ToastProvider";

export default function AdminCitiesPage() {
  const { showToast } = useToast();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    description: "",
    profileImage: "",
    coverImage: "",
    galleryImages: [] as string[],
    featured: false
  });
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadCities = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getCities();
      setCities(data);
    } catch (e) {
      showToast("Erro ao carregar cidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (city?: any) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        name: city.name || "",
        state: city.state || "",
        description: city.description || "",
        profileImage: city.profileImage || "",
        coverImage: city.coverImage || "",
        galleryImages: city.galleryImages || [],
        featured: city.featured || false
      });
    } else {
      setEditingCity(null);
      setFormData({
        name: "", state: "", description: "", profileImage: "", coverImage: "", galleryImages: [], featured: false
      });
    }
    setNewGalleryUrl("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Nome da cidade é obrigatório");
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingCity) {
        await updateCity(editingCity.id, formData);
        showToast("Cidade atualizada com sucesso");
      } else {
        await createCity(formData);
        showToast("Cidade adicionada com sucesso");
      }
      closeModal();
      loadCities(true);
    } catch (e) {
      showToast("Erro ao salvar cidade");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover a cidade ${name}?`)) return;
    try {
      await deleteCity(id);
      showToast("Cidade removida");
      loadCities(true);
    } catch (e) {
      showToast("Erro ao remover cidade");
    }
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim() && !formData.galleryImages.includes(newGalleryUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, newGalleryUrl.trim()]
      }));
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter(img => img !== url)
    }));
  };

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.state && c.state.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
      {/* HEADER */}
      <header className="px-5 md:px-8 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-white">
               <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gerenciamento de Cidades</h1>
              <p className="text-sm text-slate-500 font-medium">Cadastre e configure o perfil das cidades</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cidades..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md"
            >
              <Plus size={16} /> Nova Cidade
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-slate-500">Carregando cidades...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
             <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhuma cidade encontrada</h3>
             <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                Você ainda não tem cidades cadastradas ou nenhuma corresponde à sua busca.
             </p>
             <button 
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition"
             >
                <Plus size={16} /> Adicionar primeira cidade
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCities.map(city => (
              <div key={city.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group">
                 {/* Cover */}
                 <div className="h-32 bg-slate-200 dark:bg-slate-700 relative">
                    {city.coverImage ? (
                      <img src={city.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon size={32} className="opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-3">
                       <div className="h-12 w-12 rounded-full border-2 border-white bg-slate-100 overflow-hidden shrink-0 shadow-lg">
                         {city.profileImage ? (
                           <img src={city.profileImage} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                           <Building2 className="w-full h-full p-2 text-slate-400" />
                         )}
                       </div>
                       <div>
                         <h3 className="font-bold text-white leading-tight drop-shadow-md">{city.name}</h3>
                         <p className="text-xs text-slate-200 font-medium drop-shadow-md flex items-center gap-1">
                           <MapPin size={10} /> {city.state || "Estado"}
                         </p>
                       </div>
                    </div>
                    {city.featured && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                        Destaque
                      </span>
                    )}
                 </div>
                 
                 <div className="p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[40px] mb-4">
                       {city.description || "Nenhuma descrição fornecida para esta cidade."}
                    </p>
                    <div className="flex border-t border-slate-100 dark:border-slate-700 pt-4 gap-2">
                      <button 
                         onClick={() => handleOpenModal(city)}
                         className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition"
                      >
                         <Edit2 size={16} /> Editar
                      </button>
                      <button 
                         onClick={() => handleDelete(city.id, city.name)}
                         className="px-3 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 rounded-lg text-sm transition"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL EDIT/CREATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                   {editingCity ? <Edit2 className="text-emerald-500" size={20} /> : <Plus className="text-emerald-500" size={20} />}
                   {editingCity ? "Editar Cidade" : "Nova Cidade"}
                 </h2>
                 <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition">
                   <X size={20} />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Imagens Capa e Perfil - Preview interativo */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 group">
                  {/* Capa */}
                  <div className="h-40 bg-slate-200 dark:bg-slate-800 w-full relative">
                     {formData.coverImage ? (
                       <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                         <ImageIcon size={32} />
                         <span className="text-xs font-semibold">Capa (URL)</span>
                       </div>
                     )}
                     {/* Overlay do input de capa */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <input 
                          type="text" 
                          placeholder="URL da Imagem de Capa" 
                          value={formData.coverImage}
                          onChange={e => setFormData({...formData, coverImage: e.target.value})}
                          className="w-full max-w-sm px-4 py-2 bg-white/90 text-sm rounded border-none focus:ring-2 focus:ring-emerald-500"
                        />
                     </div>
                  </div>
                  
                  {/* Perfil */}
                  <div className="absolute -bottom-8 left-6 w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden z-10 group/profile cursor-pointer shadow-lg">
                     {formData.profileImage ? (
                       <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-400">
                         <Camera size={24} />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/profile:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                        <input 
                          type="text" 
                          placeholder="URL do Perfil" 
                          value={formData.profileImage}
                          onChange={e => setFormData({...formData, profileImage: e.target.value})}
                          className="w-full px-1 py-1 bg-white/90 text-[10px] rounded border-none text-center"
                        />
                     </div>
                  </div>
                </div>

                {/* Espaçamento para o avatar */}
                <div className="h-4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                     <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Nome da Cidade *</label>
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                       placeholder="Ex: Holambra"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Estado / UF</label>
                     <input 
                       type="text" 
                       value={formData.state}
                       onChange={e => setFormData({...formData, state: e.target.value})}
                       className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                       placeholder="Ex: SP"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Descrição Completa</label>
                   <textarea 
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                     className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none"
                     placeholder="Escreva sobre a história, cultura e atrações desta cidade..."
                   ></textarea>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                   <input 
                     type="checkbox" 
                     id="featured"
                     checked={formData.featured}
                     onChange={e => setFormData({...formData, featured: e.target.checked})}
                     className="w-5 h-5 accent-amber-500 rounded border-gray-300 cursor-pointer"
                   />
                   <label htmlFor="featured" className="text-sm font-semibold text-amber-900 dark:text-amber-500 cursor-pointer select-none">
                      Destacar esta cidade na página inicial ou em listas
                   </label>
                </div>

                {/* Galeria de Imagens */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                   <h3 className="font-bold mb-3 flex items-center gap-2">
                     <ImageIcon size={18} className="text-indigo-500" /> Galeria de Imagens
                   </h3>
                   <div className="flex gap-2 mb-4">
                     <input 
                       type="text" 
                       value={newGalleryUrl}
                       onChange={e => setNewGalleryUrl(e.target.value)}
                       placeholder="URL da imagem..."
                       className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                     />
                     <button 
                       onClick={handleAddGalleryImage}
                       className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition whitespace-nowrap"
                     >
                       Adicionar
                     </button>
                   </div>
                   
                   {formData.galleryImages.length > 0 ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.galleryImages.map((img, idx) => (
                           <div key={idx} className="relative group rounded-lg overflow-hidden h-24 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <button 
                                   onClick={() => handleRemoveGalleryImage(img)}
                                   className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                   ) : (
                     <p className="text-sm text-slate-500 italic">Nenhuma imagem na galeria ainda.</p>
                   )}
                </div>

              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 rounded-b-2xl">
                 <button 
                   onClick={closeModal}
                   className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 shadow-sm"
                 >
                   {isSaving ? "Salvando..." : <><Check size={16} /> Salvar Cidade</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
