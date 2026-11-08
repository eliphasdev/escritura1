import React, { useState } from 'react';
import { Smartphone, Download, X, CheckCircle2, Share2, Sparkles, Copy, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playClick } from '../utils/soundEffects';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If already running as installed app, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    playClick();
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopyUrl = () => {
    playClick();
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignored
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
        title="Instalar como app nativa en tu teléfono o tablet Android"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar en Android</span>
        <span className="sm:hidden">App Android</span>
      </button>

      {/* Android / Tablet Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl text-left animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-child">
                    Cómo Instalar AstroLetras en Android
                  </h3>
                  <p className="text-xs text-emerald-400 font-child font-medium">
                    Aplicación completa para tu teléfono o tablet
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  setShowGuideModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Install Button if browser triggered prompt */}
            {isInstallable && (
              <div className="mb-4">
                <button
                  onClick={async () => {
                    playClick();
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Pulsa aquí para Instalar Ahora en este Dispositivo</span>
                </button>
              </div>
            )}

            {/* Steps Container */}
            <div className="space-y-3 font-child">
              
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm shadow-amber-400/20">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Abre el menú de Google Chrome:
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    En tu teléfono o tablet Android, toca los <strong>tres puntos verticales (⋮)</strong> situados en la <strong>esquina superior derecha</strong> de la pantalla de Chrome.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-sky-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm shadow-sky-400/20">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    Elige "Instalar aplicación":
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    En el menú desplegable, selecciona <strong className="text-emerald-300">"Instalar aplicación"</strong> (o en algunos modelos figura como <strong className="text-sky-300">"Agregar a la pantalla principal"</strong>).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm shadow-emerald-400/20">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    ¡Listo para usar como app!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Aparecerá el icono de <strong>AstroLetras</strong> en la pantalla de inicio de tu tablet o teléfono. Se abrirá en pantalla completa sin barra de navegación ni distracciones para el niño.
                  </p>
                </div>
              </div>

              {/* Send URL / Share helper */}
              <div className="mt-4 p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-white block">¿Estás en tu computadora?</span>
                  <span className="text-[11px] text-slate-400">Copia el enlace para abrirlo en la tablet o teléfono de tu hijo:</span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-semibold transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? '¡Copiado!' : 'Copiar Enlace'}</span>
                </button>
              </div>

              {/* Direct APK package helper */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                  <Download className="w-4 h-4" />
                  <span>¿Deseas descargar el archivo APK directo?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Esta aplicación ya está certificada y lista con su manifiesto PWA. Puedes descargar el archivo <strong>.apk</strong> empaquetado en 1 clic a través de <strong>PWABuilder</strong> (herramienta de Microsoft y Google):
                </p>
                <a
                  href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  <span>Generar y Descargar APK en PWABuilder</span>
                </a>
              </div>

              {/* iOS hint */}
              {isIOS && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <span>En iPhone o iPad: Pulsa <strong>Compartir <Share2 className="w-3 h-3 inline" /></strong> y luego <strong>"Añadir a pantalla de inicio"</strong>.</span>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  playClick();
                  setShowGuideModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-child transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
