/**
 * Sistema de Certificação MRS - CertificateManager
 * Gerencia a emissão, validação e controle de certificados
 */

class CertificateManager {
    constructor(username, progressManager) {
        if (!username || !progressManager) {
            throw new Error('CertificateManager requer username e progressManager.');
        }
        
        this.username = username;
        this.progressManager = progressManager;
        this.certificateData = null;
        this.API_URL = `http://localhost:3002/api/certificates/${this.username}`;
        this.VALIDATION_URL = 'http://localhost:8000/validate.html';
        this.isAdmin = this.progressManager.role === 'admin' || this.username.toLowerCase() === 'admin';
    }

    /**
     * Verifica se o usuário pode receber um certificado
     */
    canIssueCertificate() {
        // Admin pode emitir certificado para qualquer usuário
        if (this.isAdmin) {
            return true;
        }

        // Verifica se todos os 8 módulos foram concluídos
        const completedModules = Object.values(this.progressManager.progress.modules || {})
            .filter(module => module.status === 'completed').length;
        
        // Verifica se a avaliação final foi aprovada
        const finalEvaluation = this.progressManager.progress.final_evaluation;
        const finalPassed = finalEvaluation && finalEvaluation.status === 'passed' && finalEvaluation.score >= 70;
        
        return completedModules === 8 && finalPassed;
    }

    /**
     * Gera um novo certificado
     */
    async generateCertificate() {
        console.log('=== INICIANDO GERAÇÃO DO CERTIFICADO ===');
        console.log('Verificando elegibilidade...');
        
        if (!this.canIssueCertificate()) {
            console.log('❌ Usuário não é elegível para o certificado');
            throw new Error('Usuário não atende aos critérios para emissão do certificado.');
        }
        
        console.log('✅ Usuário é elegível para o certificado');

        try {
            // Gera dados do certificado
            console.log('Criando dados do certificado...');
            const certificateData = this.createCertificateData();
            console.log('Dados do certificado criados:', certificateData);
            
            // Salva no backend
            console.log('Salvando certificado no backend...');
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certificateData)
            });

            console.log(`Resposta do backend: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('Erro do backend:', errorData);
                
                if (response.status === 409 && errorData.certificate) {
                    // Se já existe um certificado, retorna o existente
                    console.log(`✅ Certificado já existe no servidor: ${errorData.certificate.validationCode}`);
                    this.certificateData = errorData.certificate;
                    return errorData.certificate;
                }
                throw new Error(`Erro ao salvar certificado no servidor: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
            }

            const savedCertificate = await response.json();
            console.log('Certificado salvo com sucesso:', savedCertificate);
            
            this.certificateData = savedCertificate;
            
            console.log(`✅ Certificado gerado com sucesso: ${savedCertificate.validationCode}`);
            return savedCertificate;

        } catch (error) {
            console.error('❌ Erro ao gerar certificado:', error);
            throw error;
        }
    }

    /**
     * Cria os dados do certificado
     */
    createCertificateData() {
        const finalEvaluation = this.progressManager.progress.final_evaluation;
        const completedModules = Object.values(this.progressManager.progress.modules)
            .filter(module => module.status === 'completed').length;
        
        const validationCode = this.generateValidationCode();
        const issuedDate = new Date().toISOString();
        
        return {
            username: this.username,
            issuedDate: issuedDate,
            finalScore: finalEvaluation.score || 100, // Admin pode ter score padrão
            completedModules: completedModules || 8, // Admin pode ter todos os módulos
            status: 'issued',
            validationCode: validationCode,
            digitalSignature: this.generateDigitalSignature(validationCode, issuedDate),
            downloadCount: 0,
            validationCount: 0
        };
    }

    /**
     * Gera código único de validação
     */
    generateValidationCode() {
        const year = new Date().getFullYear();
        const random1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `MRS-${year}-${random1}-${random2}`;
    }

    /**
     * Gera assinatura digital
     */
    generateDigitalSignature(validationCode, issuedDate) {
        const data = `${this.username}-${validationCode}-${issuedDate}-MRS-SECRET-2024`;
        // Simula uma assinatura digital (em produção, usar criptografia real)
        return btoa(data).substring(0, 32);
    }

    /**
     * Carrega certificado existente
     */
    async loadCertificate() {
        try {
            const response = await fetch(this.API_URL);
            if (response.ok) {
                this.certificateData = await response.json();
                return this.certificateData;
            } else if (response.status === 404) {
                // Se admin e não tem certificado, cria um automaticamente
                if (this.isAdmin) {
                    console.log('Admin sem certificado - criando automaticamente...');
                    return await this.generateCertificate();
                }
                return null; // Certificado não existe
            } else {
                throw new Error('Erro ao carregar certificado.');
            }
        } catch (error) {
            console.error('Erro ao carregar certificado:', error);
            return null;
        }
    }

    /**
     * Obtém dados do certificado atual
     */
    getCertificateData() {
        return this.certificateData;
    }

    /**
     * Verifica se o usuário tem certificado
     */
    hasCertificate() {
        // Admin sempre tem acesso ao certificado
        if (this.isAdmin) {
            return true;
        }
        return this.certificateData !== null;
    }

    /**
     * Obtém status do certificado
     */
    getCertificateStatus() {
        if (!this.certificateData) return 'not_issued';
        return this.certificateData.status;
    }

    /**
     * Incrementa contador de downloads
     */
    async incrementDownloadCount() {
        if (!this.certificateData) return;

        try {
            await fetch(`${this.API_URL}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            this.certificateData.downloadCount++;
        } catch (error) {
            console.error('Erro ao incrementar download count:', error);
        }
    }

    /**
     * Valida um certificado pelo código
     */
    async validateCertificate(validationCode) {
        try {
            const response = await fetch(`http://localhost:3002/api/certificates/validate/${validationCode}`);
            if (response.ok) {
                return await response.json();
            } else {
                return { valid: false, error: 'Certificado não encontrado' };
            }
        } catch (error) {
            return { valid: false, error: 'Erro na validação' };
        }
    }

    /**
     * Revoga um certificado (apenas admin)
     */
    async revokeCertificate(reason = '') {
        if (!this.certificateData) return false;

        try {
            const response = await fetch(`${this.API_URL}/revoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                this.certificateData.status = 'revoked';
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao revogar certificado:', error);
            return false;
        }
    }

    /**
     * Obtém estatísticas do certificado
     */
    getCertificateStats() {
        if (!this.certificateData) return null;

        return {
            issuedDate: this.certificateData.issuedDate,
            finalScore: this.certificateData.finalScore,
            completedModules: this.certificateData.completedModules,
            downloadCount: this.certificateData.downloadCount,
            validationCount: this.certificateData.validationCount,
            status: this.certificateData.status
        };
    }

    /**
     * Admin: Obtém todos os certificados
     */
    async getAllCertificates() {
        if (!this.isAdmin) {
            throw new Error('Apenas administradores podem acessar todos os certificados.');
        }

        try {
            const response = await fetch(`http://localhost:3002/api/admin/all-certificates?adminUser=${this.username}`);
            if (response.ok) {
                return await response.json();
            } else {
                const errorData = await response.text();
                throw new Error(`Erro ao carregar certificados: ${response.status} - ${errorData}`);
            }
        } catch (error) {
            console.error('Erro ao carregar certificados:', error);
            throw error;
        }
    }
}

// Exporta para uso global
window.CertificateManager = CertificateManager; 