import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * يلتقط الأخطاء في React ويمنع تعطيل التطبيق بالكامل
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("❌ Error Boundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // استخدام fallback مخصص إذا تم توفيره
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI افتراضي للخطأ
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-destructive/10">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            عذراً، حدث خطأ
                        </h2>

                        <p className="text-muted-foreground mb-6">
                            حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
                        </p>

                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                                    تفاصيل الخطأ (للمطورين)
                                </summary>
                                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3">
                            <Button onClick={this.handleReset} className="flex-1">
                                إعادة المحاولة
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="flex-1"
                            >
                                العودة
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
