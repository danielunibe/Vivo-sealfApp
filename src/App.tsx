import { Component, type ErrorInfo, type ReactNode } from 'react';
import AppShell from './components/AppShell';
import { ToastContainer } from './components/ui/Toast';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  declare props: AppErrorBoundaryProps;

  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[APP] Render failed', error, info);
    try {
      (window as unknown as { __APP_RENDER_ERROR__?: string }).__APP_RENDER_ERROR__ =
        `${error instanceof Error ? error.message : String(error)} | ${info.componentStack?.slice(0, 400) || ''}`;
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return <AppRecoveryScreen onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ToastContainer />
      <AppShell />
    </AppErrorBoundary>
  );
}

function AppRecoveryScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#0d0f12] px-6 text-white">
      <div className="w-full max-w-[320px] rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto mb-4 h-14 w-14 rounded-[1.1rem] border border-emerald-300/30 bg-emerald-300/10 shadow-[0_0_24px_rgba(45,212,191,0.18)]" />
        <h1 className="text-lg font-black uppercase tracking-wide">Recuperar pantalla</h1>
        <p className="mt-2 text-sm font-semibold leading-snug text-white/65">
          Tuvimos un problema al cargar esta seccion. Tus datos siguen protegidos y puedes reintentar.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 h-12 w-full rounded-2xl bg-emerald-400 text-sm font-black uppercase tracking-widest text-black shadow-[0_12px_30px_rgba(45,212,191,0.25)] active:scale-[0.98]"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
