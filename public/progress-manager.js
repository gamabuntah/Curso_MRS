/**
 * Sistema de Progresso MRS - Gerenciador Discreto com Backend
 */

class ProgressManager {
    constructor(username, role = 'user') {
        if (!username) {
            throw new Error('ProgressManager requer um nome de usuário.');
        }
        this.username = username;
        this.role = role;
        this.progress = {};
        this.API_URL = `https://curso-mrs.onrender.com/api/progress/${this.username}`;
        this.localCacheKey = `progress_${this.username}`;
        this.syncTimeout = null;
    }

    /**
     * Inicializa o sistema de progresso, carregando os dados do backend.
     * Esta função agora é assíncrona.
     */
    async init() {
        const localProgress = this.getLocalProgress();
        const backendProgress = await this.loadBackendProgress();

        this.progress = this.mergeProgress(backendProgress, localProgress);

        this.updateModuleAvailability();
        
        await this.saveProgress(); // Salva o estado mesclado e sincronizado
        console.log("Sistema de progresso inicializado e sincronizado.", this.progress);
        return this;
    }

    mergeProgress(backend, local) {
        if (!local || Object.keys(local).length === 0) return backend;
        if (!backend || Object.keys(backend).length === 0) return local;

        // A versão com a data de atualização mais recente é a "verdadeira"
        const lastUpdateBackend = new Date(backend.lastUpdated || 0);
        const lastUpdateLocal = new Date(local.lastUpdated || 0);

        return lastUpdateLocal > lastUpdateBackend ? local : backend;
    }

    getLocalProgress() {
        try {
            const data = localStorage.getItem(this.localCacheKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Erro ao carregar progresso local:", e);
            return {};
        }
    }

    setLocalProgress() {
        try {
            this.progress.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.localCacheKey, JSON.stringify(this.progress));
        } catch (e) {
            console.error("Erro ao salvar progresso local:", e);
        }
    }

    async loadBackendProgress() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) return this.getDefaultProgress();
            return await response.json();
        } catch (e) {
            console.error('Falha ao carregar progresso do backend. Usando cache local se disponível.', e);
            return this.getLocalProgress() || this.getDefaultProgress();
        }
    }

    /**
     * Salva o progresso no backend
     */
    async saveProgress() {
        this.setLocalProgress(); // Sempre salva localmente primeiro

        clearTimeout(this.syncTimeout);

        this.syncTimeout = setTimeout(async () => {
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.progress)
                });

                if (response.ok) {
                    console.log("Progresso sincronizado com o backend com sucesso!");
                    // Opcional: notificar o usuário
                    this.showSyncNotification(true);
                } else {
                    throw new Error(`Status: ${response.status}`);
                }

            } catch (e) {
                console.warn('Backend offline. Progresso salvo localmente.', e.message);
                this.showSyncNotification(false);
            }
        }, 1000); // Debounce de 1 segundo para evitar múltiplas chamadas
    }
    
    showSyncNotification(isSuccess) {
        const notification = document.createElement('div');
        notification.className = `sync-notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = isSuccess ? '✓ Progresso salvo!' : '⚠️ Progresso salvo localmente. Sincronizando...';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    }

    getDefaultProgress() {
        const modules = {};
        for (let i = 1; i <= 7; i++) {
            modules[i.toString()] = { 
                status: i === 1 ? 'available' : 'locked', 
                score: null, 
                date: null, 
                audioCompleted: false
            };
        }
        return {
            modules,
            final_evaluation: { status: 'locked', score: null, date: null },
            certificate: { issued: false, date: null, final_score: null },
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Atualiza a disponibilidade dos módulos baseado no progresso
     */
    updateModuleAvailability() {
        const modules = this.progress.modules || {};
        for (let i = 1; i <= 7; i++) {
            const moduleId = i.toString();
            const prevModuleId = (i - 1).toString();

            if (i === 1 && modules[moduleId].status === 'locked') {
                modules[moduleId].status = 'available';
            }
            
            if (i > 1) {
                const prevModule = modules[prevModuleId];
                if (prevModule && prevModule.status === 'completed' && modules[moduleId].status === 'locked') {
                    modules[moduleId].status = 'available';
                }
            }
        }
    }

    /**
     * Registra conclusão de um quiz de módulo
     */
    async completeQuiz(moduleId, score) {
        const module = this.progress.modules[moduleId];
        if (!module) return;

        const percentage = score;
        const quizPassed = percentage >= 70;
        
        module.score = percentage;
        module.date = new Date().toISOString();

        // A lógica de conclusão agora depende do áudio também
        if (quizPassed && module.audioCompleted) {
            module.status = 'completed';
        } else if (quizPassed) {
            module.status = 'available'; // Quiz passado, mas áudio pendente. Mantém disponível.
        } else {
            module.status = 'failed';
        }

        // Atualiza disponibilidade dos próximos módulos
        this.updateModuleAvailability();
        await this.saveProgress();

        // Atualiza indicadores visuais
        this.updateVisualIndicators();
    }

    /**
     * Marca o áudio de um módulo como concluído
     */
    async markAudioAsCompleted(moduleId) {
        const module = this.progress.modules[moduleId];
        if (module && !module.audioCompleted) {
            module.audioCompleted = true;
            
            // Verifica se o quiz já foi passado para completar o módulo
            if (module.score >= 70) {
                module.status = 'completed';
                this.updateModuleAvailability();
            }

            await this.saveProgress();
            this.updateVisualIndicators();
            console.log(`Áudio do Módulo ${moduleId} concluído.`);
        }
    }

    /**
     * Registra tentativa da avaliação final
     */
    async completeFinalEvaluation(score) {
        const percentage = score;
        const status = percentage >= 70 ? 'passed' : 'failed';
        
        this.progress.final_evaluation.status = status;
        this.progress.final_evaluation.score = percentage;
        this.progress.final_evaluation.date = new Date().toISOString();

        // Se aprovado, emite certificado
        if (status === 'passed') {
            this.progress.certificate.issued = true;
            this.progress.certificate.date = new Date().toISOString();
            this.progress.certificate.final_score = percentage;
        }

        await this.saveProgress();
        this.updateVisualIndicators();
    }

    /**
     * Obtém o status de um módulo
     */
    getModuleStatus(moduleId) {
        const module = this.progress.modules[moduleId];
        if (!module) return 'locked';
        
        // Retorna um status especial para UI se o quiz foi passado mas o áudio não
        if (module.score >= 70 && !module.audioCompleted) {
            return 'audio_pending';
        }
        
        return module.status || 'locked';
    }

    /**
     * Obtém a pontuação de um módulo
     */
    getModuleScore(moduleId) {
        return this.progress.modules[moduleId]?.score || null;
    }

    /**
     * Calcula a porcentagem de progresso geral
     */
    getOverallProgress() {
        const completedModules = Object.values(this.progress.modules || {}).filter(m => m.status === 'completed').length;
        return (completedModules / 8) * 100;
    }

    /**
     * Retorna o status de conclusão detalhado.
     * @returns {{completedModules: number, finalEvaluation: {status: string, score: number}}}
     */
    getCompletionStatus() {
        const completedModules = Object.values(this.progress.modules || {})
            .filter(module => module.status === 'completed').length;
        
        const finalEvaluation = this.progress.final_evaluation || { status: 'locked', score: 0 };
        
        return { completedModules, finalEvaluation };
    }

    /**
     * Verifica se um módulo pode ser acessado
     */
    canAccessModule(moduleId) {
        if (this.role === 'admin') return true;
        const status = this.getModuleStatus(moduleId);
        return status === 'available' || status === 'completed' || status === 'audio_pending';
    }

    /**
     * Verifica se a avaliação final pode ser acessada
     */
    canAccessFinalEvaluation() {
        if (this.role === 'admin') return true;
        const completedModules = Object.values(this.progress.modules || {})
            .filter(module => module.status === 'completed').length;
        return completedModules >= 6;
    }

    /**
     * Reseta o progresso do usuário
     */
    async resetProgress() {
        this.progress = this.getDefaultProgress();
        await this.saveProgress();
        this.updateVisualIndicators();
        console.log('Progresso resetado com sucesso.');
    }

    /**
     * Atualiza indicadores visuais na interface
     */
    updateVisualIndicators() {
        // Dispara um evento customizado para notificar a interface
        const event = new CustomEvent('progressUpdated', {
            detail: { progress: this.progress }
        });
        document.dispatchEvent(event);
        
        // Atualiza o indicador de progresso se existir
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            const progress = this.getOverallProgress();
            progressIndicator.textContent = `${Math.round(progress)}%`;
        }
    }

    /**
     * Obtém dados para geração de certificado
     */
    getCertificateData() {
        const completionStatus = this.getCompletionStatus();
        const finalEvaluation = this.progress.final_evaluation;
        
        return {
            username: this.username,
            completedModules: completionStatus.completedModules,
            finalScore: finalEvaluation.score,
            finalStatus: finalEvaluation.status,
            issueDate: this.progress.certificate.date || new Date().toISOString(),
            certificateIssued: this.progress.certificate.issued
        };
    }
}

// Exporta para uso global
window.ProgressManager = ProgressManager; 

// Validações específicas para MRS
function validarProgressoMRS(moduloAtual) {
    if (moduloAtual < 1 || moduloAtual > 7) {
        console.error('Módulo inválido para MRS:', moduloAtual);
        return false;
    }
    return true;
}

function calcularProgressoMRS(modulosCompletos) {
    return Math.round((modulosCompletos / 7) * 100);
}

function verificarConclusaoMRS(modulosCompletos) {
    return modulosCompletos >= 7;
}
