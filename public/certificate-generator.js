/**
 * Sistema de Certificação MRS - CertificateGenerator
 * Gera PDFs dos certificados com design profissional
 */

class CertificateGenerator {
    constructor(certificateData) {
        this.data = certificateData;
        this.pdf = null;
        this.pageWidth = 297; // A4 landscape width in mm
        this.pageHeight = 210; // A4 landscape height in mm
        this.margin = 15;
    }

    /**
     * Gera o PDF do certificado
     */
    async generate() {
        console.log('=== INICIANDO GERAÇÃO DO PDF ===');
        
        if (!this.data) {
            throw new Error("Dados do certificado não fornecidos.");
        }
        
        console.log('Dados do certificado:', this.data);
        
        try {
            console.log('Verificando jsPDF...');
            if (typeof window.jspdf === 'undefined') {
                throw new Error("jsPDF não está disponível");
            }
            
            console.log('Criando instância do jsPDF...');
            const { jsPDF } = window.jspdf;
            this.pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            console.log('jsPDF criado com sucesso');

            console.log('Criando layout do certificado...');
            this.createCertificateLayout();
            console.log('Layout criado com sucesso');

            console.log('Gerando blob do PDF...');
            const pdfOutput = this.pdf.output('blob');
            console.log(`PDF gerado com sucesso. Tamanho: ${pdfOutput.size} bytes`);
            
            return pdfOutput;

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    /**
     * Cria o layout do certificado
     */
    createCertificateLayout() {
        console.log('Iniciando criação do layout...');
        
        try {
            // Configurações de fonte
            console.log('Configurando fonte...');
            this.pdf.setFont('helvetica');

            // Adiciona borda decorativa
            console.log('Adicionando borda decorativa...');
            this.addDecorativeBorder();

            // Adiciona cabeçalho
            console.log('Adicionando cabeçalho...');
            this.addHeader();

            // Adiciona conteúdo principal
            console.log('Adicionando conteúdo principal...');
            this.addMainContent();

            // Adiciona rodapé
            console.log('Adicionando rodapé...');
            this.addFooter();

            // Adiciona QR Code
            console.log('Adicionando QR Code...');
            this.addQRCode();

            // Adiciona marca d'água
            console.log('Adicionando marca d\'água...');
            this.addWatermark();
            
            console.log('Layout criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar layout:', error);
            throw error;
        }
    }

    /**
     * Adiciona borda decorativa
     */
    addDecorativeBorder() {
        const borderWidth = 2;
        const borderColor = [41, 128, 185]; // Azul profissional
        
        this.pdf.setDrawColor(...borderColor);
        this.pdf.setLineWidth(borderWidth);
        this.pdf.rect(borderWidth/2, borderWidth/2, this.pageWidth - borderWidth, this.pageHeight - borderWidth);
        
        // Borda interna
        this.pdf.setLineWidth(0.5);
        this.pdf.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);
    }

    /**
     * Adiciona cabeçalho do certificado
     */
    addHeader() {
        const centerX = this.pageWidth / 2;
        
        // Título principal
        this.pdf.setFontSize(34);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(39, 68, 114); // Azul escuro
        this.pdf.text('CERTIFICADO DE CONCLUSÃO', centerX, 35, { align: 'center' });
        
        // Subtítulo
        this.pdf.setFontSize(16);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(52, 73, 94); // Cinza azulado
        this.pdf.text('Curso de Capacitação sobre a', centerX, 48, { align: 'center' });

        this.pdf.setFontSize(20);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text('PESQUISA NACIONAL DE SANEAMENTO BÁSICO (MRS)', centerX, 58, { align: 'center'});

        // Linha decorativa
        this.pdf.setDrawColor(39, 68, 114);
        this.pdf.setLineWidth(0.5);
        this.pdf.line(this.margin, 68, this.pageWidth - this.margin, 68);
    }

    /**
     * Adiciona conteúdo principal
     */
    addMainContent() {
        const centerX = this.pageWidth / 2;
        const startY = 85;

        // Texto "Certificamos que"
        this.pdf.setFontSize(18);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text('Certificamos que', centerX, startY, { align: 'center' });

        // Nome do participante
        this.pdf.setFontSize(28);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(39, 68, 114);
        this.pdf.text(this.data.username.toUpperCase(), centerX, startY + 15, { align: 'center' });

        // Texto de conclusão
        const conclusionText = `concluiu com êxito o curso de capacitação, cumprindo a carga horária de 40 horas e obtendo a nota final de ${this.data.finalScore}%, estando apto(a) a participar da coleta de dados da MRS.`;
        
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(52, 73, 94);
        const splitText = this.pdf.splitTextToSize(conclusionText, this.pageWidth - (this.margin * 2) - 20);
        this.pdf.text(splitText, centerX, startY + 30, { align: 'center' });
        
        // Data de conclusão
        const issuedDate = new Date(this.data.issuedDate);
        const formattedDate = `Concluído em: ${issuedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        this.pdf.setFontSize(11);
        this.pdf.text(formattedDate, centerX, startY + 55, { align: 'center' });
    }
    
    /**
     * Adiciona rodapé
     */
    addFooter() {
        const footerY = this.pageHeight - 35;
        
        // Linha da assinatura (exemplo)
        const signatureLineY = footerY - 5;
        this.pdf.setLineWidth(0.3);
        this.pdf.line(this.pageWidth / 2 - 40, signatureLineY, this.pageWidth / 2 + 40, signatureLineY);
        this.pdf.setFontSize(10);
        this.pdf.text('Coordenação Geral', this.pageWidth / 2, signatureLineY + 5, { align: 'center' });


        // Código de validação
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(39, 68, 114);
        this.pdf.text(`Código de Validação:`, 20, this.pageHeight - 20);
        this.pdf.setFont('courier', 'normal');
        this.pdf.text(`${this.data.validationCode}`, 60, this.pageHeight - 20);
        
        // Texto de validação
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.setTextColor(149, 165, 166);
        this.pdf.text('A autenticidade deste certificado pode ser verificada no portal do curso ou através do QR Code.', 20, this.pageHeight - 15);
    }

    /**
     * Adiciona QR Code
     */
    addQRCode() {
        const qrSize = 30; // mm
        const qrX = this.pageWidth - this.margin - qrSize;
        const qrY = this.pageHeight - this.margin - qrSize;

        // Cria elemento temporário para QR Code
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px'; // Esconde fora da tela
        document.body.appendChild(tempDiv);
        
        const validationUrl = `${window.location.origin}/validate.html?code=${this.data.validationCode}`;

        try {
             const qr = new QRCode(tempDiv, {
                text: validationUrl,
                width: 128, // pixels
                height: 128, // pixels
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            // O qrcode.js gera um <canvas> ou <img>. Precisamos pegar o resultado.
            const canvas = tempDiv.querySelector('canvas');
            const img = tempDiv.querySelector('img');

            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                this.pdf.addImage(imgData, 'PNG', qrX, qrY, qrSize, qrSize);
            } else if (img) {
                // Se for uma imagem (fallback do qrcode.js), precisamos carregá-la primeiro
                // Para simplificar, assumimos que sempre gerará um canvas.
                // O código para manipulação de imagem seria mais complexo e assíncrono.
                 this.pdf.addImage(img.src, 'PNG', qrX, qrY, qrSize, qrSize);
            }
        } catch (e) {
            console.error("Erro ao gerar QR Code:", e);
        } finally {
            document.body.removeChild(tempDiv);
        }
    }

    /**
     * Adiciona marca d'água
     */
    addWatermark() {
        this.pdf.setFontSize(80);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(240, 240, 240); // Cinza muito claro
        this.pdf.text('MRS', this.pageWidth / 2, this.pageHeight / 2 + 20, {
            angle: 45,
            align: 'center'
        });
    }

    /**
     * Inicia o download do PDF
     */
    downloadPDF(filename = `certificado-mrs-${this.data.username}.pdf`) {
        this.pdf.save(filename);
    }

    /**
     * Retorna o PDF como um Blob
     */
    getPDFBlob() {
        return this.pdf.output('blob');
    }
}

// Exporta para uso global
window.CertificateGenerator = CertificateGenerator; 