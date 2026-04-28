"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Server, 
  Database, 
  Clock, 
  CloudUpload, 
  FileArchive, 
  X, 
  Play, 
  CheckCircle2, 
  History, 
  Loader2, 
  AlertCircle,
  Code2
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getUpdateHistory, processServerUpdate } from "./actions";

export default function ServerUpdatePage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [updateResult, setUpdateResult] = useState<any>(null);

  // Opções
  const [createBackup, setCreateBackup] = useState(true);
  const [runMigrations, setRunMigrations] = useState(true);
  const [pushToGithub, setPushToGithub] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getUpdateHistory();
      setHistory(data);
    } catch (e) {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".zip")) {
        showToast("⚠️ Apenas arquivos .zip são permitidos");
        return;
      }
      setSelectedFile(file);
      showToast(`📦 ${file.name} selecionado`);
    }
  };

  const startUpdate = async () => {
    if (!selectedFile) return;

    setIsUpdating(true);
    setUpdateResult(null);
    setLogs(["[SISTEMA] Iniciando processo de atualização..."]);
    setProgress(10);
    setCurrentStep("Preparando ambiente...");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("backup", String(createBackup));
    formData.append("migrate", String(runMigrations));
    formData.append("pushToGithub", String(pushToGithub));

    try {
      // Simulação visual de passos enquanto o servidor processa
      const progressInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return p + 2;
        });
      }, 500);

      const result = await processServerUpdate(formData);
      clearInterval(progressInterval);

      if (result.success) {
        setProgress(100);
        setUpdateResult(result);
        setLogs(result.logs?.split("\n") || []);
        showToast("✅ Servidor atualizado com sucesso!");
        loadHistory();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setIsUpdating(false);
      showToast(`❌ Erro: ${error.message}`);
      setLogs(prev => [...prev, `[ERRO] ${error.message}`]);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 relative w-full overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4 pl-12 sm:pl-0">
          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700">
            <Server className="text-orange-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Atualização do Servidor</h1>
            <p className="text-sm text-slate-500">Urbano Holambra · Painel Administrativo</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4 feed-scroll">
        
        {/* Status do Servidor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Code2 size={12} /> <span>Versão atual</span>
            </div>
            <p className="text-lg font-bold">v2.4.1</p>
            <p className="text-[10px] text-slate-500">Build 2026.04.20</p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Database size={12} /> <span>Banco de dados</span>
            </div>
            <div className="text-lg font-bold text-green-500 flex items-center gap-1">Online <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div></div>
            <p className="text-[10px] text-slate-500">Prisma · PostgreSQL</p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold mb-1">
              <Clock size={12} /> <span>Último update</span>
            </div>
            <p className="text-lg font-bold truncate">
              {history[0]?.createdAt ? new Date(history[0].createdAt).toLocaleDateString('pt-BR') : "Nenhum"}
            </p>
            <p className="text-[10px] text-slate-500">
              {history[0]?.version ? `v${history[0].version}` : "v2.4.1"}
            </p>
          </div>
        </div>

        {/* Área de Upload e Configs */}
        {!updateResult && (
          <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700 rounded-3xl p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CloudUpload className="text-orange-500" size={20} /> Enviar pacote de atualização
            </h3>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer transition-colors hover:border-orange-500 hover:bg-orange-500/5 group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".zip" 
                className="hidden" 
              />
              <FileArchive className="mx-auto text-slate-400 group-hover:text-orange-500 transition-colors mb-3" size={40} />
              <p className="text-sm font-bold">Arraste ou clique para selecionar</p>
              <p className="text-xs text-slate-500 mt-1">Arquivo .zip · Máximo 100MB</p>
              <button className="mt-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-5 py-2 rounded-full text-xs font-bold transition">
                Selecionar arquivo
              </button>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                      <FileArchive className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{formatSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-rose-500 transition">
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={createBackup} 
                    onChange={e => setCreateBackup(e.target.checked)}
                    className="accent-orange-500 w-5 h-5 rounded-md" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Criar backup automático</p>
                  <p className="text-[10px] text-slate-500">Gera um snapshot preventivo antes de sobrescrever.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={runMigrations} 
                    onChange={e => setRunMigrations(e.target.checked)}
                    className="accent-green-500 w-5 h-5 rounded-md" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Gerenciar banco (Prisma)</p>
                  <p className="text-[10px] text-slate-500">Aplica mudanças no esquema se o zip contiver novo schema.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={pushToGithub} 
                    onChange={e => setPushToGithub(e.target.checked)}
                    className="accent-blue-500 w-5 h-5 rounded-md" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Sincronizar com GitHub</p>
                  <p className="text-[10px] text-slate-500">Faz o commit automático dos arquivos no repositório Urban2.</p>
                </div>
              </label>
            </div>

            <button 
              disabled={!selectedFile || isUpdating}
              onClick={startUpdate}
              className="w-full mt-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 disabled:grayscale disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
              {isUpdating ? "Instalando..." : "Iniciar Atualização Global"}
            </button>
          </div>
        )}

        {/* Progresso Dinâmico */}
        {isUpdating && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-2xl animate-in zoom-in-95">
             <div className="flex items-center gap-3 mb-4">
                <Loader2 className="text-orange-500 animate-spin" size={24} />
                <h3 className="font-bold text-lg text-white">Atualização em curso...</h3>
             </div>
             
             <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                   <span>{currentStep || "Subindo pacote para o servidor"}</span>
                   <span className="text-orange-500">{progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                   ></div>
                </div>
             </div>

             <div className="bg-black/50 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-slate-400 border border-slate-800">
                {logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${log.includes('ERRO') ? 'text-rose-500' : log.includes('sucesso') ? 'text-green-500' : ''}`}>
                    {log}
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Resultado Final */}
        {updateResult && (
          <div className="bg-white/70 dark:bg-slate-800/70 border-2 border-green-500 dark:border-green-500/50 rounded-3xl p-6 mb-6 shadow-lg animate-in zoom-in-95">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center overflow-hidden">
                    <CheckCircle2 className="text-green-600" size={28} />
                </div>
                <div>
                   <h3 className="font-bold text-xl">Sistema Atualizado!</h3>
                   <p className="text-sm text-slate-500">Build finalizada em {updateResult.duration}</p>
                </div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-5">
                <p className="text-xs text-slate-500 italic mb-2">Logs do processo:</p>
                <pre className="text-[10px] font-mono whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                  {updateResult.logs}
                </pre>
             </div>
             <button 
              onClick={() => location.reload()} 
              className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
             >
                Concluir e Reiniciar Cache
             </button>
          </div>
        )}

        {/* Histórico de Atualizações */}
        <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <History className="text-slate-400" size={18} /> Histórico de atualizações
          </h3>
          <div className="space-y-3">
            {history.length > 0 ? history.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                   <div className={`h-10 w-10 rounded-full flex items-center justify-center ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                      <FileArchive size={18} />
                   </div>
                   <div>
                      <p className="text-sm font-bold">v{log.version}</p>
                      <p className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                      {log.status === 'SUCCESS' ? 'Sucesso' : 'Falha'}
                   </span>
                   <p className="text-[10px] text-slate-400 mt-1">{log.duration || ""}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400 italic">Nenhum registro de atualização.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
