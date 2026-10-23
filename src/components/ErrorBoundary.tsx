import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi gangguan kecil saat memuat halaman.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[MerdekaKids ErrorBoundary]:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 via-amber-50/40 to-emerald-50 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner">
              🌿
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MerdekaKids • Pelindung Layar Pintar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
              Ups! Cincau Sedang Merapikan Mainan
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
              Jangan khawatir petualang cilik, progres bintang dan karyamu tetap aman tersimpan. Yuk muat ulang halaman ini!
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Lanjutkan Petualangan</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
