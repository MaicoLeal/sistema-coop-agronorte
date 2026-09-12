import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetData = () => {
    StorageService.resetToSeed();
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-on-surface">
          <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 bg-error-container text-on-error-container rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Ocorreu uma instabilidade na interface</h2>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Um erro inesperado foi interceptado com segurança. Você pode tentar recarregar a visualização ou restaurar os dados de demonstração da cooperativa.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-left font-mono text-[11px] text-error overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Novamente
              </button>
              <button
                onClick={this.handleResetData}
                className="w-full sm:flex-1 bg-primary hover:bg-primary-container text-on-primary font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar DEMO
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
