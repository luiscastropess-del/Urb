import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Share2, Heart, MessageSquare, Info, ExternalLink, ChevronLeft } from "lucide-react";
import { getCity } from "@/app/actions.tours";

export default async function CityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const city = await getCity(resolvedParams.id);

  if (!city) {
    notFound();
  }

  // Fallback for missing images
  const coverImage = city.coverImage || `https://picsum.photos/seed/${city.name}-cover/1200/500`;
  const profileImage = city.profileImage || `https://picsum.photos/seed/${city.name}-profile/200/200`;
  
  // Safe parsing of gallery images
  let gallery: string[] = [];
  try {
    if (city.galleryImages && city.galleryImages.length > 0) {
      gallery = city.galleryImages.map((img: string) => {
        let cleaned = img.replace(/^\{|\}$/g, ''); // Removes { and }
        return cleaned;
      }).filter((img: string) => img.startsWith('http'));
    }
  } catch (e) {}

  if (gallery.length === 0) {
    gallery = [
      `https://picsum.photos/seed/${city.name}-1/600/400`,
      `https://picsum.photos/seed/${city.name}-2/600/400`,
      `https://picsum.photos/seed/${city.name}-3/600/400`,
    ];
  }

  return (
    <div className="min-h-screen h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="relative h-[40vh] md:h-[50vh] w-full shrink-0">
        <Image
          src={coverImage}
          alt={`Capa da cidade ${city.name}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-10">
          <Link href="/pacotes" className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-slate-50 dark:border-slate-950 overflow-hidden shadow-2xl shrink-0 bg-white">
            <Image
              src={profileImage}
              alt={`Perfil da cidade ${city.name}`}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 pt-2 md:pt-28 flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
             <div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                 {city.name}
               </h1>
               {city.state && (
                 <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-2 font-medium">
                   <MapPin size={16} />
                   <span>{city.state}, Brasil</span>
                 </div>
               )}
               
               <div className="flex gap-4 mt-4 text-sm">
                 <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                   <Star size={16} className="text-amber-400 fill-amber-400" />
                   <span>4.8</span>
                   <span className="text-slate-400 dark:text-slate-500 font-normal">(124 avaliações)</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                   <MessageSquare size={16} className="text-blue-500" />
                   <span>89</span>
                   <span className="text-slate-400 dark:text-slate-500 font-normal">comentários</span>
                 </div>
               </div>
             </div>
             
             <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition active:scale-95 text-center">
                  Avaliar
                </button>
                <Link href="#links" className="px-5 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition active:scale-95 flex items-center justify-center">
                  Links Úteis
                </Link>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Sobre */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Info size={24} className="text-orange-500" />
                Sobre {city.name}
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                {city.description ? (
                  <p>{city.description}</p>
                ) : (
                  <p>Descubra os encantos e a beleza de {city.name}. Esta cidade oferece uma combinação única de cultura, gastronomia e paisagens inesquecíveis, tornando-se o destino ideal para sua próxima viagem. Venha se surpreender!</p>
                )}
              </div>
            </section>

            {/* Galeria */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Galeria de Imagens</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                    <Image 
                      src={img} 
                      alt={`Galeria ${city.name} ${idx+1}`} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </section>

            {/* Avaliações e Comentários */}
            <section className="mb-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Avaliações</h2>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center">
                 <Star className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
                 <h3 className="text-slate-900 dark:text-white font-bold mb-1">Ainda não há avaliações</h3>
                 <p className="text-slate-500 text-sm">Seja o primeiro a avaliar esta cidade.</p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Links Úteis */}
            <div id="links" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4">Links Úteis</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Prefeitura Municipal
                  <ExternalLink size={16} className="text-slate-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Portal do Turismo
                  <ExternalLink size={16} className="text-slate-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Agenda Cultural
                  <ExternalLink size={16} className="text-slate-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Telefones de Emergência
                  <ExternalLink size={16} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* Estatísticas / Detalhes */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
               <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4">Informações</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <span className="text-sm text-slate-500">Estado</span>
                   <span className="font-semibold text-slate-700 dark:text-slate-300">{city.state || "SP"}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <span className="text-sm text-slate-500">População</span>
                   <span className="font-semibold text-slate-700 dark:text-slate-300">~ 100k hab.</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <span className="text-sm text-slate-500">Clima</span>
                   <span className="font-semibold text-slate-700 dark:text-slate-300">Tropical</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-slate-500">Destaque</span>
                   <span className="inline-flex px-2 py-1 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-lg uppercase">Turismo</span>
                 </div>
               </div>
            </div>

            {/* CTA */}
            <div className="relative rounded-3xl overflow-hidden p-6 aspect-square flex flex-col justify-end group">
              <Image 
                src={coverImage} 
                alt="Promo" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/90 via-orange-500/40 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="font-black text-2xl leading-tight mb-2">Visite {city.name}</h3>
                <p className="text-sm text-white/80 font-medium mb-4">Reserve um guia local agora mesmo e descubra novos roteiros.</p>
                <Link href={`/pacotes?city=${city.id}`} className="bg-white text-orange-600 w-full py-3 rounded-xl font-black block text-center active:scale-95 transition">
                  Ver Pacotes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
