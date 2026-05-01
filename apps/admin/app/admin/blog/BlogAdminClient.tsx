"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  PenTool, Plus, FileText, CheckCircle, Edit2, Eye, Search, 
  Circle, Edit, Trash2, ChevronLeft, ChevronRight, X, Upload, 
  Loader2, Save, Newspaper 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { upsertPost } from "@/app/actions.blog";
import { deletePost as deletePostAction } from "@/app/actions.blog";

export default function BlogAdminClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "dicas",
    status: "rascunho",
    tags: "",
    coverImage: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const filteredPosts = posts.filter((p) => {
    if (filter !== "todos" && p.status !== filter) return false;
    const searchLower = search.toLowerCase();
    if (
      search &&
      !p.title.toLowerCase().includes(searchLower) &&
      !p.category.toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    return true;
  });

  const openNewPostModal = () => {
    setEditingPost(null);
    setFormData({
      id: "",
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "dicas",
      status: "rascunho",
      tags: "",
      coverImage: "",
    });
    setIsModalOpen(true);
  };

  const editPost = (post: any) => {
    setEditingPost(post);
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category,
      status: post.status,
      tags: post.tags || "",
      coverImage: post.coverImage || "",
    });
    setIsModalOpen(true);
  };

  const closePostModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast("⚠️ Preencha título e conteúdo");
      return;
    }

    setIsLoading(true);
    let titleSlug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      const updatedPost = await upsertPost({
        ...formData,
        slug: titleSlug
      });
      showToast(editingPost ? "✏️ Post atualizado" : "📝 Post criado com sucesso");
      
      if (editingPost) {
        setPosts(posts.map(p => p.id === updatedPost.id ? { ...updatedPost, author: p.author } : p));
      } else {
        setPosts([{...updatedPost, author: { name: "Admin" }}, ...posts]);
      }
      closePostModal();
    } catch (err: any) {
      showToast("❌ Erro ao salvar: " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await deletePostAction(id);
        setPosts(posts.filter((p) => p.id !== id));
        showToast("🗑️ Post excluído");
      } catch (e) {
        showToast("❌ Erro ao excluir");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === "publicado").length,
    drafts: posts.filter(p => p.status === "rascunho").length,
    views: "—"
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 antialiased text-slate-800 dark:text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shadow-md">
            <PenTool className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Blog · Gerenciar Postagens</h1>
            <p className="text-sm text-slate-500">Urbano Holambra · Publique conteúdos e novidades</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={openNewPostModal} className="bg-gradient-to-br from-orange-500 to-green-500 text-white px-5 py-2.5 rounded-full font-medium shadow-md hover:opacity-90 transition-opacity flex items-center">
            <Plus className="mr-2" size={18} /> Novo Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center"><FileText className="mr-1" size={12} /> Total</span>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center"><CheckCircle className="mr-1 text-green-500" size={12} /> Publicados</span>
          <p className="text-2xl font-bold">{stats.published}</p>
        </div>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center"><Edit2 className="mr-1 text-amber-500" size={12} /> Rascunhos</span>
          <p className="text-2xl font-bold">{stats.drafts}</p>
        </div>
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 flex items-center"><Eye className="mr-1 text-blue-500" size={12} /> Visualizações</span>
          <p className="text-2xl font-bold">{stats.views}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título, categoria..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {["todos", "publicado", "rascunho", "agendado"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/5 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="py-4 px-4 whitespace-nowrap">Título</th>
                <th className="py-4 px-4 hidden md:table-cell">Categoria</th>
                <th className="py-4 px-4 hidden md:table-cell">Autor</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 hidden md:table-cell">Data</th>
                <th className="py-4 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-orange-500/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{post.title}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{post.category}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-500">{post.author?.name || "Admin"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      post.status === 'publicado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      post.status === 'rascunho' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      <Circle size={6} className={post.status === 'publicado' ? 'fill-green-500' : post.status === 'rascunho' ? 'fill-amber-500' : 'fill-blue-500'} /> {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-500 text-xs whitespace-nowrap">
                    {format(new Date(post.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editPost(post)} className="text-slate-400 hover:text-orange-500 transition-colors p-1"><Edit size={16} /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPosts.length === 0 && (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center">
              <Newspaper className="mb-3 opacity-50" size={32} />
              <p>Nenhuma postagem encontrada.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeft size={16} /></button>
        <button className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium">1</button>
        <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">2</button>
        <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRight size={16} /></button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={closePostModal}
            ></motion.div>
            
            <motion.div 
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-xl font-bold">{editingPost ? "Editar Post" : "Novo Post"}</h3>
                <button onClick={closePostModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"><X size={20} /></button>
              </div>

              <form onSubmit={savePost} className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Título <span className="text-rose-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Digite o título do post" className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Slug (URL)</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="titulo-do-post" className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Resumo</label>
                  <textarea rows={2} name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Breve resumo do post..." className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-500/50"></textarea>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Conteúdo <span className="text-rose-500">*</span></label>
                  <textarea rows={8} name="content" value={formData.content} onChange={handleChange} required placeholder="Escreva o conteúdo completo..." className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm resize-y outline-none focus:ring-2 focus:ring-orange-500/50"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Categoria</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                         <option value="dicas">🌷 Dicas</option>
                         <option value="roteiros">🗺️ Roteiros</option>
                         <option value="eventos">📅 Eventos</option>
                         <option value="gastronomia">🍽️ Gastronomia</option>
                         <option value="cultura">🎨 Cultura</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50">
                         <option value="rascunho">📝 Rascunho</option>
                         <option value="publicado">✅ Publicado</option>
                         <option value="agendado">⏰ Agendado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tags (separadas por vírgula)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="holambra, flores, turismo" className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Imagem de capa</label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                      {formData.coverImage ? (
                        <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover preview" />
                      ) : (
                        "🖼️"
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-4 py-2 rounded-lg font-medium hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-colors w-fit flex items-center">
                        <Upload className="mr-2" size={16} /> {formData.coverImage ? 'Alterar imagem' : 'Escolher imagem'}
                      </button>
                      {formData.coverImage && (
                        <button type="button" onClick={() => setFormData({...formData, coverImage: ""})} className="text-xs text-rose-500 hover:text-rose-600 text-left px-2">Remover imagem</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 shrink-0">
                  <button type="button" onClick={closePostModal} className="flex-1 py-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-xl font-medium">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-br from-orange-500 to-green-500 hover:opacity-90 transition-opacity text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center">
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                    Salvar postagem
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 bg-slate-800 dark:bg-slate-700 text-white px-5 py-3 rounded-full text-sm font-medium shadow-xl z-50 pointer-events-none whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
