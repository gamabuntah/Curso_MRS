document.addEventListener('DOMContentLoaded', async () => {
    // Pega o usuário logado e sua função do sessionStorage
    const currentUser = sessionStorage.getItem('currentUser');
    const userRole = sessionStorage.getItem('userRole');

    // Sistema de Cache para melhorar performance
    const moduleCache = new Map();
    const audioCache = new Map();
    
    // Preloader para melhor UX
    const showLoader = () => {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>Carregando...</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(26, 32, 44, 0.9); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(5px);
        `;
        document.body.appendChild(loader);
    };

    const hideLoader = () => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    };

    // Mapeamento dos elementos do DOM
    const domElements = {
        sidebarNav: document.getElementById('sidebar-nav'),
        moduleTitle: document.getElementById('module-title'),
        contentContainer: document.getElementById('content'),
        quizContainer: document.getElementById('quiz-container'),
        finalQuizContainer: document.getElementById('final-quiz-container'),
        finalScoreContainer: document.getElementById('final-score-container'),
        audioPlayer: document.getElementById('audio-player'),
        playerModuleTitle: document.getElementById('player-module-title'),
        audioElement: document.getElementById('audio-element'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        progressBar: document.getElementById('progress-bar'),
        progress: document.getElementById('progress'),
        currentTime: document.getElementById('current-time'),
        duration: document.getElementById('duration'),
        volumeBtn: document.getElementById('volume-btn'),
        volumeSlider: document.getElementById('volume-slider'),
        rewindBtn: document.getElementById('rewind-btn'),
        forwardBtn: document.getElementById('forward-btn'),
        speedBtn: document.getElementById('speed-btn'),
        progressIndicator: document.querySelector('.progress-indicator'),
        logoutBtn: document.getElementById('logout-btn'),
        sidebarFooter: document.querySelector('.sidebar-footer')
    };
    
    // Acessa os dados dos módulos e da avaliação final
    const modulos = {
      1: window.module1,
      2: window.module2,
      3: window.module3,
      4: window.module4,
      5: window.module5,
      6: window.module6,
      7: window.module7
    };
    const avaliacaoFinal = window.avaliacaoFinal;
    
    let currentModuleId = null;
    let currentQuizData = null;
    let currentQuestionIndex = 0;
    let score = 0;
    const speeds = [1, 1.25, 1.5, 2];
    let currentSpeedIndex = 0;
    let progressManager;
    let audioCompletedMarked = false;

    // Função para precarregar áudios críticos
    const preloadAudio = (src) => {
        if (audioCache.has(src)) return audioCache.get(src);
        
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = src;
        audioCache.set(src, audio);
        return audio;
    };

    // Sistema de notificações toast
    const showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `progress-toast ${type}`;
        toast.innerHTML = `<i class="fa-solid fa-info-circle"></i> ${message}`;
        
        // Adiciona ícones específicos por tipo
        if (type === 'success') {
            toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
        } else if (type === 'error') {
            toast.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${message}`;
        }
        
        document.body.appendChild(toast);
        
        // Mostra o toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove o toast após a duração especificada
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // --- FUNÇÃO PRINCIPAL E INICIALIZAÇÃO ---

    async function main() {
        showLoader();
        
        if (!currentUser) {
            hideLoader();
            window.location.href = 'login.html';
            return;
        }

        try {
            // Adiciona lógica de logout
            if(domElements.logoutBtn) {
                domElements.logoutBtn.addEventListener('click', () => {
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                });
            }
            
            // Adiciona o link do painel de admin se o usuário for admin
            if (userRole === 'admin' && domElements.sidebarFooter) {
                // Evita duplicidade do botão
                if (!domElements.sidebarFooter.querySelector('.admin-link')) {
                    const adminLink = document.createElement('a');
                    adminLink.href = 'admin.html';
                    adminLink.className = 'admin-link';
                    adminLink.innerHTML = '<i class="fa-solid fa-user-shield"></i> Painel do Admin';
                    domElements.sidebarFooter.prepend(adminLink);
                }
            }

            // Inicializa o ProgressManager com o usuário e carrega os dados
            progressManager = await new ProgressManager(currentUser, userRole).init();

            // --- INTEGRAÇÃO CERTIFICADO ---
            // Adiciona botão "Meu Certificado" se elegível
            if (domElements.sidebarFooter) {
                const certManager = new window.CertificateManager(currentUser, progressManager);
                await certManager.loadCertificate();
                // Admin sempre tem acesso, usuários normais precisam atender critérios
                const isEligible = userRole === 'admin' || certManager.canIssueCertificate() || certManager.hasCertificate();
                if (isEligible) {
                    let certLink = document.querySelector('.certificate-link');
                    if (!certLink) {
                        certLink = document.createElement('a');
                        certLink.href = '#';
                        certLink.className = 'certificate-link';
                        certLink.innerHTML = '<i class="fa-solid fa-certificate"></i> <span>Meu Certificado</span>';
                        certLink.onclick = (e) => {
                            e.preventDefault();
                            window.showCertificateModal && window.showCertificateModal();
                        };
                        domElements.sidebarFooter.prepend(certLink);
                    }
                }
            }

            if (!domElements.sidebarNav || !domElements.moduleTitle || !domElements.contentContainer) {
                console.error('Elementos essenciais do DOM não foram encontrados.');
                hideLoader();
                return;
            }
            
            populateSidebar();
            
            // Recupera o módulo salvo no sessionStorage ou usa o módulo 1 como padrão
            const savedModuleId = sessionStorage.getItem('currentModuleId') || '1';
            
            // Verifica se há um quiz final em andamento para ser retomado
            const isResumingFinalQuiz = getFinalQuizState() !== null;

            if (savedModuleId === 'final') {
                // Se o usuário está na página da avaliação final
                if (isResumingFinalQuiz) {
                    // E há um quiz para retomar, inicia o quiz diretamente
                    startFinalQuiz();
                } else {
                    // Senão, mostra a tela de introdução da avaliação
                    startFinalEvaluation();
                }
            } else {
                // Se o usuário está em qualquer outra página de módulo, apenas renderiza o módulo
                renderModule(savedModuleId);
            }

            // Atualiza o link ativo na barra lateral
            document.querySelectorAll('#sidebar-nav a').forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelector('.sidebar a[data-module="' + savedModuleId + '"]');
            if (activeLink) {
                activeLink.classList.add('active');
            }
            updateProgressIndicator();
            
            // Precarrega áudios dos módulos principais
            setTimeout(() => {
                for (let i = 1; i <= 3; i++) {
                    preloadAudio(`MRS/Audios/Curso MRS - Mod ${i}.mp3`);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
        } finally {
            hideLoader();
        }
    }

    // --- FUNÇÕES DE LÓGICA (O restante do arquivo) ---
    // (Todas as suas funções como populateSidebar, renderModule, etc. vêm aqui)
    
    // ... (cole aqui TODAS as outras funções do script.js, como populateSidebar, renderModule, etc.)
    
    function populateSidebar() {
        // Limpa a barra lateral antes de popular
        domElements.sidebarNav.innerHTML = '';

        // Ordena os módulos pelo ID numericamente
        const sortedModuleIds = Object.keys(modulos).sort((a, b) => parseInt(a) - parseInt(b));

        // Adiciona links para cada módulo ordenado
        sortedModuleIds.forEach(id => {
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('data-module', id);
            
            const titleText = modulos[id].title;

            link.innerHTML = `
                <i class="fa-solid fa-book"></i>
                <span>${titleText}</span>
            `;

            link.addEventListener('click', (e) => handleNavClick(e, link));
            domElements.sidebarNav.appendChild(link);
        });

        // Adiciona o link para a avaliação final
        const finalLink = document.createElement('a');
        finalLink.href = '#';
        finalLink.setAttribute('data-module', 'final');
        finalLink.innerHTML = `
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Avaliação Final</span>
        `;
        finalLink.addEventListener('click', (e) => handleNavClick(e, finalLink));
        domElements.sidebarNav.appendChild(finalLink);

        // Aplica classes de progresso aos links
        applyProgressClasses();
    }

    /**
     * Aplica classes de progresso aos links da barra lateral
     */
    function applyProgressClasses() {
        // Remove classes de progresso existentes
        document.querySelectorAll('#sidebar-nav a').forEach(link => {
            link.classList.remove('progress-locked', 'progress-available', 'progress-completed', 'progress-failed', 'progress-audio_pending');
        });

        // Aplica classes baseadas no status do progresso
        document.querySelectorAll('#sidebar-nav a[data-module]').forEach(link => {
            const moduleId = link.getAttribute('data-module');
            
            if (moduleId === 'final') {
                const canAccess = progressManager.canAccessFinalEvaluation();
                const status = progressManager.progress.final_evaluation.status;
                
                if (status === 'passed') {
                    link.classList.add('progress-completed');
                } else if (canAccess) {
                    link.classList.add('progress-available');
                } else {
                    link.classList.add('progress-locked');
                }
            } else {
                const status = progressManager.getModuleStatus(moduleId);
                link.classList.add(`progress-${status}`);
            }
        });

        // Atualiza indicador de progresso
        updateProgressIndicator();
    }

    /**
     * Atualiza o indicador de progresso no cabeçalho
     */
    function updateProgressIndicator() {
        if (domElements.progressIndicator) {
            const progress = progressManager.getOverallProgress();
            domElements.progressIndicator.textContent = `${progress}%`;
            
            // Adiciona classe de cor baseada no progresso
            domElements.progressIndicator.className = 'progress-indicator';
            if (progress >= 80) {
                domElements.progressIndicator.classList.add('high-progress');
            } else if (progress >= 50) {
                domElements.progressIndicator.classList.add('medium-progress');
            } else {
                domElements.progressIndicator.classList.add('low-progress');
            }
        }
    }

    /**
     * Manipula o clique nos links de navegação
     * @param {Event} e - O evento de clique
     */
    function handleNavClick(e, linkElement) {
        e.preventDefault();
        const moduleId = linkElement.getAttribute('data-module');

        // Salva o módulo atual no sessionStorage
        sessionStorage.setItem('currentModuleId', moduleId);

        // Verifica se o módulo pode ser acessado
        if (moduleId === 'final') {
            if (!progressManager.canAccessFinalEvaluation()) {
                alert('Complete pelo menos 6 módulos para acessar a Avaliação Final.');
                return;
            }
            // Chama apenas a avaliação final
            document.querySelectorAll('#sidebar-nav a').forEach(l => l.classList.remove('active'));
            linkElement.classList.add('active');
            startFinalEvaluation();
            return;
        } else {
            if (!progressManager.canAccessModule(moduleId)) {
                alert('Complete o módulo anterior para desbloquear este módulo.');
                return;
            }
        }

        // Remove a classe 'active' de todos os links e a adiciona ao clicado
        document.querySelectorAll('#sidebar-nav a').forEach(l => l.classList.remove('active'));
        linkElement.classList.add('active');

        renderModule(moduleId);
    }

    /**
     * Formata segundos para o formato "minutos:segundos"
     */
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     * Configura o player de áudio para o módulo atual
     * @param {string} audioSrc - O caminho para o arquivo de áudio
     * @param {string} moduleTitle - O título do módulo
     */
    function setupAudioPlayer(audioSrc, moduleTitle) {
        if (!audioSrc || !domElements.audioPlayer) {
            if(domElements.audioPlayer) domElements.audioPlayer.style.display = 'none';
            return;
        }

        audioCompletedMarked = false; // Reseta a flag para o novo áudio

        // Cria e adiciona o botão de fechar se ele não existir
        if (!document.getElementById('close-player-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.id = 'close-player-btn';
            closeBtn.innerHTML = '&times;'; // Símbolo de 'X'
            closeBtn.onclick = closeAudioPlayer;
            domElements.audioPlayer.appendChild(closeBtn);
        }

        domElements.playerModuleTitle.textContent = moduleTitle;
        domElements.audioPlayer.style.display = 'flex';
        
        // Usa áudio do cache se disponível para melhor performance
        if (audioCache.has(audioSrc)) {
            const cachedAudio = audioCache.get(audioSrc);
            // Se o áudio já foi carregado, usa diretamente
            if (cachedAudio.readyState >= 2) {
                domElements.audioElement.src = cachedAudio.src;
            } else {
                domElements.audioElement.src = audioSrc;
            }
        } else {
            domElements.audioElement.src = audioSrc;
            // Adiciona ao cache para futuras utilizações
            preloadAudio(audioSrc);
        }

        // Reset a velocidade para o padrão quando um novo áudio é carregado
        currentSpeedIndex = 0;
        domElements.audioElement.playbackRate = speeds[currentSpeedIndex];
        domElements.speedBtn.textContent = `${speeds[currentSpeedIndex]}x`;

        // --- Event Listeners ---
        domElements.audioElement.onloadedmetadata = () => {
            domElements.duration.textContent = formatTime(domElements.audioElement.duration);
        };

        domElements.audioElement.ontimeupdate = () => {
            const { currentTime, duration } = domElements.audioElement;
            if (isNaN(duration) || duration === 0) return;

            const progressPercent = (currentTime / duration) * 100;
            domElements.progress.style.width = `${progressPercent}%`;
            domElements.currentTime.textContent = formatTime(currentTime);

            // Marca como concluído se o usuário ouviu pelo menos 98% do áudio
            if (!audioCompletedMarked && progressPercent >= 98 && currentModuleId) {
                progressManager.markAudioAsCompleted(currentModuleId);
                audioCompletedMarked = true; // Impede que a função seja chamada múltiplas vezes
                showToast('Áudio concluído com sucesso!', 'success');
            }
        };

        // Adiciona o evento para fechar o player quando o áudio terminar
        domElements.audioElement.onended = () => {
            // Garante que o progresso seja marcado caso o usuário pule para o final
            if (!audioCompletedMarked && currentModuleId) {
                progressManager.markAudioAsCompleted(currentModuleId);
            }
            closeAudioPlayer();
        };

        domElements.rewindBtn.onclick = () => {
            domElements.audioElement.currentTime = Math.max(0, domElements.audioElement.currentTime - 10);
        };

        domElements.forwardBtn.onclick = () => {
            const duration = domElements.audioElement.duration;
            if (duration) {
                domElements.audioElement.currentTime = Math.min(duration, domElements.audioElement.currentTime + 10);
            }
        };

        domElements.playPauseBtn.onclick = () => {
            if (domElements.audioElement.paused) {
                domElements.audioElement.play();
                domElements.playPauseBtn.classList.remove('play-btn');
                domElements.playPauseBtn.classList.add('pause-btn');
            } else {
                domElements.audioElement.pause();
                domElements.playPauseBtn.classList.remove('pause-btn');
                domElements.playPauseBtn.classList.add('play-btn');
            }
        };

        domElements.progressBar.onclick = (e) => {
            const rect = domElements.progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const duration = domElements.audioElement.duration;
            if(duration) {
                domElements.audioElement.currentTime = (x / width) * duration;
            }
        };

        domElements.volumeBtn.onclick = () => {
            domElements.audioElement.muted = !domElements.audioElement.muted;
            domElements.volumeBtn.classList.toggle('muted-btn');
        };

        domElements.volumeSlider.oninput = (e) => {
            domElements.audioElement.volume = e.target.value;
            domElements.audioElement.muted = e.target.value == 0;
            domElements.volumeBtn.classList.toggle('muted-btn', domElements.audioElement.muted);
        };

        domElements.speedBtn.onclick = () => {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            const newSpeed = speeds[currentSpeedIndex];
            domElements.audioElement.playbackRate = newSpeed;
            domElements.speedBtn.textContent = `${newSpeed}x`;
        };

        domElements.audioElement.onerror = () => {
            // Mostra mensagem de erro no player
            let errorMsg = domElements.audioPlayer.querySelector('.player-error');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'player-error';
                domElements.audioPlayer.appendChild(errorMsg);
            }
            errorMsg.textContent = 'Erro ao carregar o áudio. Verifique sua conexão ou tente novamente mais tarde.';
        };
        // Remove mensagem de erro ao tentar carregar novo áudio
        domElements.audioElement.onplay = () => {
            const errorMsg = domElements.audioPlayer.querySelector('.player-error');
            if (errorMsg) errorMsg.remove();
        };

        // Força a primeira execução para garantir o estado inicial
        domElements.audioElement.play().catch(() => {
            // A reprodução automática pode ser bloqueada, o que é normal.
            // O importante é que o usuário possa iniciar com o botão de play.
        });
    }

    /**
     * Fecha e reseta o player de áudio
     */
    function closeAudioPlayer() {
        if (domElements.audioPlayer) {
            domElements.audioElement.pause();
            domElements.audioElement.src = ''; // Limpa o áudio para parar o download
            domElements.audioPlayer.style.display = 'none';
        }
    }

    // --- CONFIGURAÇÕES PARA OS DIFERENTES TIPOS DE QUIZ ---
    const quizConfigs = {
        module: {
            containerId: 'quiz-container',
            contentId: 'quiz-content',
            titleClass: 'quiz-title',
            resultsContainer: null, // Resultado é mostrado no mesmo container
            getResultsMessage: (percentage) => {
                if (percentage >= 70) return '<strong><i class="fa-solid fa-award"></i> Excelente!</strong> Você tem um ótimo conhecimento sobre o assunto.';
                if (percentage >= 50) return '<strong><i class="fa-solid fa-thumbs-up"></i> Bom trabalho!</strong> Você está no caminho certo.';
                return '<strong><i class="fa-solid fa-book-open"></i> Continue estudando.</strong> Reveja o conteúdo para fixar os conceitos.';
            },
            restartButtonText: '<i class="fa-solid fa-rotate-right"></i> Tentar Novamente'
        },
        final: {
            containerId: 'final-quiz-container',
            contentId: 'final-quiz-content',
            titleClass: 'final-quiz-title', // Pode ser estilizado de forma diferente
            resultsContainer: domElements.finalScoreContainer, // Container separado para o resultado
            getResultsMessage: (percentage) => {
                if (percentage >= 70) return '<div class="success"><h2><i class="fa-solid fa-award"></i> Parabéns! Você foi aprovado!</h2><p>Você demonstrou um excelente conhecimento sobre a MRS e o Manejo de Águas Pluviais.</p></div>';
                return '<div class="failure"><h2><i class="fa-solid fa-book-open"></i> Não foi desta vez.</h2><p>Sua pontuação foi inferior a 70%. Recomendamos que revise os módulos e tente novamente.</p></div>';
            },
            restartButtonText: '<i class="fa-solid fa-rotate-right"></i> Refazer Avaliação'
        }
    };

    /**
     * Renderiza o conteúdo principal de um módulo (título, cards, botão de quiz)
     * @param {string} moduleId - O ID do módulo a ser renderizado
     */
    function renderModule(moduleId) {
        // Verifica cache primeiro
        const cacheKey = `module_${moduleId}`;
        if (moduleCache.has(cacheKey)) {
            // LIMPEZA ANTES DO CACHE: Garante limpeza completa antes de aplicar cache
            domElements.quizContainer.innerHTML = '';
            domElements.finalQuizContainer.innerHTML = '';
            domElements.finalScoreContainer.innerHTML = '';
            
            const introContainer = document.getElementById('final-quiz-intro-container');
            if (introContainer) {
                introContainer.innerHTML = '';
                introContainer.style.display = 'none';
                introContainer.removeAttribute('style');
            }
            
            domElements.quizContainer.style.display = 'none';
            domElements.finalQuizContainer.style.display = 'none';
            domElements.finalScoreContainer.style.display = 'none';
            
            const dynamicStyles = document.querySelectorAll('style[data-final-quiz]');
            dynamicStyles.forEach(style => style.remove());
            
            // Aplica conteúdo do cache
            const cachedContent = moduleCache.get(cacheKey);
            domElements.contentContainer.innerHTML = cachedContent.html;
            domElements.contentContainer.style.display = 'block';
            domElements.moduleTitle.textContent = cachedContent.title;
            document.title = cachedContent.title;
            currentModuleId = moduleId;
            
            // Reaplica event listeners para elementos cached
            reapplyEventListeners(moduleId);
            return;
        }
        
        const moduleData = modulos[moduleId];
        if (!moduleData) {
            console.error(`Módulo ${moduleId} não encontrado.`);
            return;
        }
        
        document.title = moduleData.title; // Ajusta o título da página

        currentModuleId = moduleId;
        
        // LIMPEZA COMPLETA: Limpa todos os contêineres de conteúdo e quiz
        domElements.contentContainer.innerHTML = '';
        domElements.contentContainer.style.display = 'block'; // Garante que o conteúdo seja visível
        domElements.quizContainer.innerHTML = '';
        domElements.finalQuizContainer.innerHTML = '';
        domElements.finalScoreContainer.innerHTML = '';
        
        // LIMPEZA DA AVALIAÇÃO FINAL: Remove completamente o container de introdução
        const introContainer = document.getElementById('final-quiz-intro-container');
        if (introContainer) {
            introContainer.innerHTML = '';
            introContainer.style.display = 'none';
            // Remove estilos inline que podem ter sido aplicados
            introContainer.removeAttribute('style');
        }

        // OCULTAÇÃO DE TODOS OS CONTAINERS: Garante que todos estejam ocultos
        domElements.quizContainer.style.display = 'none';
        domElements.finalQuizContainer.style.display = 'none';
        domElements.finalScoreContainer.style.display = 'none';
        
        // LIMPEZA DE ESTILOS DINÂMICOS: Remove estilos que podem ter sido aplicados pela avaliação final
        const dynamicStyles = document.querySelectorAll('style[data-final-quiz]');
        dynamicStyles.forEach(style => style.remove());

        domElements.moduleTitle.textContent = moduleData.title;

        // Se houver áudio, cria o card de áudio clicável no topo
        if (moduleData.audio) {
            const audioCard = document.createElement('div');
            audioCard.className = 'card audio-card';
            
            // Verifica se o áudio já foi concluído para adicionar a classe
            const moduleProgress = progressManager.progress.modules[moduleId];
            if (moduleProgress && moduleProgress.audioCompleted) {
                audioCard.classList.add('audio-completed');
            }

            audioCard.innerHTML = `
                <div class="audio-card-icon-bg"><i class="fa-solid fa-volume-high"></i></div>
                <div class="audio-card-content">
                    <div class="audio-card-header"><i class="fa-solid fa-headphones"></i> Conversa Aprofundada do Módulo</div>
                    <div class="audio-card-body">Imersão completa no conteúdo através de uma conversa detalhada gerada por IA, baseada no material oficial do IBGE. Uma abordagem dinâmica e envolvente para compreender os conceitos fundamentais.</div>
                </div>
            `;
            audioCard.onclick = () => setupAudioPlayer(moduleData.audio, `Áudio do Módulo: ${moduleData.title}`);
            domElements.contentContainer.appendChild(audioCard);
        }

        // Renderiza os cards de conteúdo
        moduleData.cards.forEach(cardData => {
            const card = document.createElement('div');
            card.className = `card ${cardData.type}`;
            card.innerHTML = `<div class="card-header">${cardData.title}</div><div class="card-content">${cardData.content}</div>`;
            domElements.contentContainer.appendChild(card);
        });

        // Se houver um quiz, adiciona o botão para iniciá-lo
        if (moduleData.quiz && domElements.quizContainer) {
            // Adiciona um botão no final do conteúdo principal para iniciar o quiz
            const startQuizButton = document.createElement('button');
            startQuizButton.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Iniciar Quiz do Módulo ${moduleId}`;
            startQuizButton.className = 'start-quiz-btn';
            
            // A ação de clique irá renderizar o quiz no container de quiz
            startQuizButton.onclick = () => {
                // Mostra o container do quiz
                domElements.quizContainer.style.display = 'block';
                // Primeiro renderiza o quiz para que o container tenha conteúdo e altura
                renderQuiz(moduleData.quiz, quizConfigs.module);
                // DEPOIS, rola suavemente até o contêiner do quiz
                domElements.quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            
            domElements.contentContainer.appendChild(startQuizButton);
        }

        // Cache o conteúdo renderizado para performance
        moduleCache.set(cacheKey, {
            html: domElements.contentContainer.innerHTML,
            title: moduleData.title
        });

        // Ao final da função renderModule
        const pageContainer = document.querySelector('.page-container');
        if (pageContainer) {
            pageContainer.scrollTop = 0;
        }
    }

    /**
     * Reaplica event listeners para elementos cached
     * @param {string} moduleId - ID do módulo
     */
    function reapplyEventListeners(moduleId) {
        const moduleData = modulos[moduleId];
        
        // Reaplica listener do card de áudio se existir
        if (moduleData.audio) {
            const audioCard = domElements.contentContainer.querySelector('.audio-card');
            if (audioCard) {
                // Remove listener anterior se existir
                audioCard.onclick = null;
                audioCard.onclick = () => setupAudioPlayer(moduleData.audio, `Áudio do Módulo: ${moduleData.title}`);
            }
        }

        // Reaplica listener do botão de quiz se existir
        if (moduleData.quiz) {
            const startQuizButton = domElements.contentContainer.querySelector('.start-quiz-btn');
            if (startQuizButton) {
                startQuizButton.onclick = null;
                startQuizButton.onclick = () => {
                    domElements.quizContainer.style.display = 'block';
                    renderQuiz(moduleData.quiz, quizConfigs.module);
                    domElements.quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
            }
        }
    }

    // --- Persistência do estado do quiz final ---
    function saveFinalQuizState(index) {
        sessionStorage.setItem('quizFinalEmAndamento', 'true');
        sessionStorage.setItem('quizFinalQuestao', index);
    }
    function clearFinalQuizState() {
        sessionStorage.removeItem('quizFinalEmAndamento');
        sessionStorage.removeItem('quizFinalQuestao');
    }
    function getFinalQuizState() {
        if (sessionStorage.getItem('quizFinalEmAndamento') === 'true') {
            const idx = parseInt(sessionStorage.getItem('quizFinalQuestao'), 10);
            return isNaN(idx) ? 0 : idx;
        }
        return null;
    }

    /**
     * Renderiza um quiz (genérico para módulos e avaliação final)
     * @param {object} quizData - O objeto de dados do quiz
     * @param {object} config - O objeto de configuração do quiz (de quizConfigs)
     */
    function renderQuiz(quizData, config) {
        currentQuizData = quizData;
        // Se for o quiz final, tenta restaurar o índice salvo
        if (config.containerId === 'final-quiz-container') {
            const idx = getFinalQuizState();
            currentQuestionIndex = idx !== null ? idx : 0;
        } else {
            currentQuestionIndex = 0;
        }
        score = 0;
        const quizContainer = document.getElementById(config.containerId);
        if (!quizContainer) {
            console.error(`Quiz container #${config.containerId} not found`);
            return;
        }

        // Determina o título do quiz baseado no tipo
        const isFinal = config.containerId === 'final-quiz-container';
        const quizTitle = isFinal
            ? 'Avaliação Final'
            : `Quiz do Módulo ${currentModuleId}`;

        // Layout premium escuro, horizontal, prático
        if (isFinal) {
            quizContainer.style.background = 'linear-gradient(135deg, rgba(35,36,58,0.92) 0%, rgba(24,25,43,0.92) 100%)';
            quizContainer.style.borderRadius = '22px';
            quizContainer.style.boxShadow = '0 8px 32px 0 rgba(44,62,80,0.22), 0 1.5px 0 0 #7b68ee inset';
            quizContainer.style.border = '2px solid rgba(123,104,238,0.18)';
            quizContainer.style.backdropFilter = 'blur(8px)';
            quizContainer.style.padding = 'min(16px, 3vw) clamp(8px, 4vw, 32px)'; // padding lateral responsivo
            quizContainer.style.marginTop = '28px';
            quizContainer.style.color = '#f3f6ff';
            quizContainer.style.maxWidth = '100vw';
            quizContainer.style.width = '100%';
            quizContainer.style.marginLeft = 'auto';
            quizContainer.style.marginRight = 'auto';
            quizContainer.style.height = 'auto';
            quizContainer.style.maxHeight = '';
            quizContainer.style.overflowX = 'hidden';
        } else {
            quizContainer.style = null;
        }

        // Limpa e prepara o container
        quizContainer.innerHTML = `<h2 class="${config.titleClass}" style="${isFinal ? 'font-size:2.1rem;font-weight:900;text-align:center;background:linear-gradient(90deg,#7b68ee,#43e97b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;letter-spacing:-1px;text-shadow:0 2px 8px #23243a55;line-height:1.1;' : ''}margin-top:0;">${quizTitle}</h2><div id="${config.contentId}"></div>`;
        quizContainer.style.display = 'block';

        // Oculta o container de resultados (se houver um específico)
        if (config.resultsContainer) {
            config.resultsContainer.style.display = 'none';
        }

        showQuestion(config);
    }

    /**
     * Mostra a pergunta atual (função genérica)
     * @param {object} config - O objeto de configuração do quiz
     */
    function showQuestion(config) {
        const quizContent = document.getElementById(config.contentId);
        if (!quizContent) return;

        const isFinal = config.containerId === 'final-quiz-container';
        const questoes = currentQuizData.questoes || currentQuizData.questions || [];
        const questionData = questoes[currentQuestionIndex];
        if (!questionData) {
            showResults(config);
            return;
        }

        const pergunta = questionData.pergunta || questionData.question || '';
        const alternativas = questionData.alternativas || questionData.options || [];
        const options = alternativas.map(alt => alt.texto || alt);
        const correctAnswer = alternativas.find(alt => alt.correta)?.texto || questionData.answer || '';
        const feedback = alternativas.find(alt => alt.correta)?.feedback || questionData.feedback || '';

        // Renderização premium escura das alternativas horizontal e compacta
        let optionsHTML = '';
        options.forEach((optionText, idx) => {
            if (isFinal) {
                optionsHTML += `
                    <label class="option premium-dark-option" style="
                        display:block;
                        width:100%;
                        background:rgba(30,32,54,0.96);
                        border:2px solid #35376a;
                        color:#f3f6ff;
                        font-weight:500;
                        font-size:1.08rem;
                        margin-bottom:6px;
                        border-radius:11px;
                        box-shadow:0 1px 8px #23243a33;
                        transition:all 0.25s cubic-bezier(.4,1.3,.6,1);
                        padding:10px 16px 10px 16px;
                        cursor:pointer;
                        position:relative;
                        min-height: 18px;
                        line-height:1.5;
                        overflow:hidden;
                        text-align:left;
                        word-break:break-word;
                        white-space:normal;
                    " onmouseover="this.style.boxShadow='0 0 0 3px #7b68ee55, 0 1px 8px #23243a33';this.style.transform='scale(1.015)';" onmouseout="this.style.boxShadow='0 1px 8px #23243a33';this.style.transform='scale(1)';">
                        <input type="radio" name="question${currentQuestionIndex}" value="${optionText}" style="display:none;">
                        <span class="custom-radio" style="display:inline-block;vertical-align:middle;margin-right:10px;width:18px;height:18px;border-radius:50%;border:2px solid #7b68ee;background:#23243a;box-shadow:0 1px 2px #23243a22;position:relative;transition:border 0.2s;">
                            <span class="radio-dot" style="display:none;width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,#7b68ee 60%,#43e97b 100%);position:absolute;top:2.5px;left:2.5px;transition:all 0.25s;"></span>
                        </span>
                        <span style="vertical-align:middle;display:inline-block;line-height:1.5;max-width:calc(100% - 40px);white-space:normal;word-break:break-word;">${optionText}</span>
                    </label>
                `;
            } else {
                optionsHTML += `
                    <label class="option">
                        <input type="radio" name="question${currentQuestionIndex}" value="${optionText}">
                        ${optionText}
                    </label>
                `;
            }
        });

        quizContent.innerHTML = `
            <div class="quiz-progress" style="${isFinal ? 'background:rgba(44,62,80,0.22);color:#fff;border-radius:8px;margin-bottom:6px;font-size:1.08rem;padding:4px 0 4px 0;box-shadow:0 1px 2px #23243a22;text-align:center;' : ''}">
                <span>Questão ${currentQuestionIndex + 1} de ${questoes.length}</span>
                ${questionData.category ? `<small>Categoria: ${questionData.category}</small>` : ''}
            </div>
            <div class="question" style="${isFinal ? 'display:flex;align-items:flex-start;gap:10px;background:linear-gradient(90deg,#2d2e4a 0%,#35376a 100%);color:#fff;border-radius:9px;border-left:4px solid #7b68ee;box-shadow:0 1px 8px #7b68ee22;font-size:1.25rem;font-weight:900;padding:14px 18px;margin-bottom:6px;line-height:1.4;position:relative;text-shadow:0 1px 4px #23243a55;word-break:break-word;white-space:normal;max-width:100%;' : ''}">
                ${isFinal ? '<span style=\'font-size:1.7rem;color:#ff3366;background:linear-gradient(135deg,#ff3366 40%,#7b68ee 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shake 0.7s cubic-bezier(.36,.07,.19,.97) 1;display:inline-block;\'>❓</span>' : ''}
                <span style="display:inline-block;max-width:calc(100% - 40px);white-space:normal;word-break:break-word;">${pergunta}</span>
            </div>
            <div class="options" style="${isFinal ? 'display:flex;flex-direction:column;gap:0;margin:0 0 6px 0;' : ''}">${optionsHTML}</div>
            <div class="feedback-container"></div>
            <div class="quiz-nav"></div>
        `;

        // Adiciona eventos para seleção premium escura
        if (isFinal) {
            const optionLabels = quizContent.querySelectorAll('.premium-dark-option');
            optionLabels.forEach(label => {
                const input = label.querySelector('input');
                const radio = label.querySelector('.custom-radio');
                const dot = label.querySelector('.radio-dot');
                label.addEventListener('click', () => {
                    if (input.disabled) return;
                    // Limpa seleção visual dos outros
                    optionLabels.forEach(l => {
                        l.style.borderColor = '#35376a';
                        l.style.background = 'rgba(30,32,54,0.96)';
                        l.querySelector('.custom-radio').style.borderColor = '#7b68ee';
                        l.querySelector('.radio-dot').style.display = 'none';
                        l.style.boxShadow = '0 1px 8px #23243a33';
                    });
                    input.checked = true;
                    label.style.borderColor = 'linear-gradient(90deg,#43e97b,#7b68ee)';
                    label.style.background = 'linear-gradient(90deg,rgba(123,104,238,0.13) 0%,rgba(67,233,123,0.10) 100%)';
                    label.style.boxShadow = '0 0 0 3px #43e97b55, 0 1px 8px #23243a33';
                    radio.style.borderColor = '#43e97b';
                    dot.style.display = 'block';
                    dot.style.background = 'linear-gradient(135deg,#43e97b 60%,#7b68ee 100%)';
                    dot.style.transform = 'scale(1.2)';
                    setTimeout(()=>{dot.style.transform = 'scale(1)';}, 200);
                    handleAnswer(input.value, config);
                });
            });
        } else {
            const optionsInputs = quizContent.querySelectorAll('.option input');
            optionsInputs.forEach(option => {
                option.addEventListener('change', (event) => {
                    handleAnswer(event.target.value, config);
                });
            });
        }

        if (config.containerId === 'final-quiz-container') {
            saveFinalQuizState(currentQuestionIndex);
        }
    }

    /**
     * Manipula a resposta selecionada (função genérica)
     * @param {string} selectedValue - O valor da opção selecionada
     * @param {object} config - O objeto de configuração do quiz
     */
    function handleAnswer(selectedValue, config) {
        const quizContent = document.getElementById(config.contentId);
        const questoes = currentQuizData.questoes || currentQuizData.questions || [];
        const questionData = questoes[currentQuestionIndex];
        const alternativas = questionData.alternativas || questionData.options || [];
        const correctAnswer = alternativas.find(alt => alt.correta)?.texto || questionData.answer || '';
        const selectedAlternativa = alternativas.find(alt => alt.texto === selectedValue);
        const feedbackSelecionado = selectedAlternativa?.feedback || '';
        const feedbackContainer = quizContent.querySelector('.feedback-container');
        const quizNav = quizContent.querySelector('.quiz-nav');

        // Remove classes e ícones antigos de todas as opções
        quizContent.querySelectorAll('.options .option').forEach((label) => {
            label.classList.remove('correct-premium', 'incorrect-premium');
            const oldIcon = label.querySelector('.answer-icon-premium');
            if (oldIcon) oldIcon.remove();
        });

        // Aplica feedback visual só nas opções relevantes
        quizContent.querySelectorAll('.options .option').forEach((label) => {
            const input = label.querySelector('input');
            input.disabled = true;
            if (input.value === correctAnswer) {
                label.classList.add('correct-premium');
                label.insertAdjacentHTML('afterbegin', `<span class='answer-icon-premium'><i class="fa-solid fa-circle-check"></i></span>`);
            } else if (input.value === selectedValue) {
                label.classList.add('incorrect-premium');
                label.insertAdjacentHTML('afterbegin', `<span class='answer-icon-premium'><i class="fa-solid fa-circle-xmark"></i></span>`);
            }
        });

        // Caixa de feedback premium
        if (selectedValue === correctAnswer) {
            score++;
            feedbackContainer.innerHTML = `
                <div class="feedback correct-premium">
                    <span class="icon"><i class="fa-solid fa-circle-check"></i></span>
                    <span><strong>Resposta Correta!</strong> ${feedbackSelecionado ? `<span class='feedback-text'>${feedbackSelecionado}</span>` : ''}</span>
                </div>
            `;
        } else {
            feedbackContainer.innerHTML = `
                <div class="feedback incorrect-premium">
                    <span class="icon"><i class="fa-solid fa-circle-xmark"></i></span>
                    <span><strong>Resposta Incorreta.</strong> <span class='feedback-text'>${feedbackSelecionado ? feedbackSelecionado : ''}</span></span>
                </div>
            `;
        }

        // Botão premium
        if (currentQuestionIndex < questoes.length - 1) {
            quizNav.innerHTML = `<button class="quiz-button next-question-btn premium-btn">Próxima Pergunta <i class="fa-solid fa-arrow-right"></i></button>`;
            quizNav.querySelector('.next-question-btn').addEventListener('click', () => {
                currentQuestionIndex++;
                showQuestion(config);
            });
        } else {
            quizNav.innerHTML = `<button class="quiz-button show-results-btn premium-btn">Ver Resultado Final</button>`;
            quizNav.querySelector('.show-results-btn').addEventListener('click', () => showResults(config));
        }

        // IMPROVEMENT: Rola a tela para o botão de navegação após a resposta.
        // Usa um pequeno timeout para garantir que o DOM foi atualizado.
        setTimeout(() => {
            const navButton = quizNav.querySelector('.quiz-button');
            if (navButton) {
                navButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    /**
     * Mostra a tela de resultados (função genérica)
     * @param {object} config - O objeto de configuração do quiz
     */
    function showResults(config) {
        const quizContainer = document.getElementById(config.containerId);
        const resultsContainer = config.resultsContainer || quizContainer; // Usa container específico ou o do próprio quiz
        const contentContainer = config.resultsContainer ? resultsContainer : document.getElementById(config.contentId);
        
        // Adaptação para a estrutura atual dos módulos
        const questoes = currentQuizData.questoes || currentQuizData.questions || [];
        const totalQuestions = questoes.length;
        const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;
        
        const resultMessage = config.getResultsMessage(percentage);

        // Registra o progresso baseado no tipo de quiz
        if (config.containerId === 'final-quiz-container') {
            // Avaliação final
            progressManager.completeFinalEvaluation(parseFloat(percentage));
        } else { // Quiz de Módulo
            const percentage = (score / config.totalQuestions) * 100;
            resultsContainer.innerHTML += `<p>Sua pontuação final: ${percentage.toFixed(0)}%</p>`;
            
            progressManager.completeQuiz(config.moduleId, percentage).then(() => {
                const moduleStatus = progressManager.getModuleStatus(config.moduleId);

                if (moduleStatus === 'completed') {
                    resultsContainer.innerHTML += '<p class="quiz-passed">Parabéns, você completou os requisitos deste módulo!</p>';
                    const nextModuleId = parseInt(config.moduleId, 10) + 1;
                    if (nextModuleId <= 7) {
                        const nextModuleLink = document.querySelector(`.sidebar a[data-module='${nextModuleId}']`);
                        if(nextModuleLink) {
                            const unlockButton = document.createElement('button');
                            unlockButton.textContent = `Ir para o Módulo ${nextModuleId}`;
                            unlockButton.className = 'quiz-button';
                            unlockButton.onclick = () => {
                                // Adiciona um pequeno atraso para o usuário ler a mensagem
                                setTimeout(() => nextModuleLink.click(), 300);
                            };
                            resultsContainer.appendChild(unlockButton);
                        }
                    }
                } else if (moduleStatus === 'audio_pending') {
                    resultsContainer.innerHTML += '<p class="quiz-warning">Ótimo! Você passou no quiz. Agora ouça o áudio para completar o módulo.</p>';
                } else if (moduleStatus === 'failed') {
                    resultsContainer.innerHTML += '<p class="quiz-failed">Você não atingiu a pontuação mínima. Tente novamente!</p>';
                }

                // Atualiza a sidebar visualmente
                applyProgressClasses();
            });
        }

        // Se o resultado for em um container separado, oculta o de perguntas
        if (config.resultsContainer) {
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
        }

        contentContainer.innerHTML = `
            <div class="quiz-results final-results">
                 <h1>${config.containerId === 'final-quiz-container' ? 'Resultado da Avaliação Final' : 'Resultado do Quiz'}</h1>
                <p>Você acertou <strong>${score}</strong> de <strong>${totalQuestions}</strong> questões.</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%; background-color: ${percentage >= 70 ? '#28a745' : '#dc3545'};">
                        <span>${percentage}%</span>
                    </div>
                </div>
                <div class="final-result-message">${resultMessage}</div>
                <button class="quiz-button restart-quiz-btn">
                    ${config.restartButtonText}
                </button>
            </div>
        `;

        contentContainer.querySelector('.restart-quiz-btn').addEventListener('click', () => {
            if (config.isFinal) {
                startFinalQuiz();
            } else {
                renderQuiz(currentQuizData, { moduleId: config.moduleId, totalQuestions: config.totalQuestions });
            }
        });

        // Limpa as variáveis do quiz atual
        currentQuizData = null;
        currentQuestionIndex = 0;
        score = 0;

        clearFinalQuizState();
    }

    /**
     * Inicia a avaliação final
     */
    function startFinalEvaluation() {
        // Verifica se avaliacaoFinal está disponível
        if (!avaliacaoFinal || !avaliacaoFinal.questoes) {
            console.error('Erro: avaliacaoFinal não está disponível ou não tem a propriedade questoes');
            alert('Erro ao carregar a avaliação final. Por favor, recarregue a página.');
            return;
        }

        document.title = avaliacaoFinal.title; // Ajusta o título da página

        // Limpa containers de conteúdo do módulo e quiz do módulo
        domElements.contentContainer.innerHTML = '';
        domElements.contentContainer.style.display = 'none'; // Oculta o container de conteúdo
        domElements.quizContainer.innerHTML = '';
        domElements.quizContainer.style.display = 'none';

        // Cria/usa container de introdução
        let introContainer = document.getElementById('final-quiz-intro-container');
        if (!introContainer) {
            introContainer = document.createElement('div');
            introContainer.id = 'final-quiz-intro-container';
            domElements.finalQuizContainer.parentNode.insertBefore(introContainer, domElements.finalQuizContainer);
        }
        introContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:36px;margin-top:36px;">
                <div class="card card-premium-top" style="
                    max-width: 700px;
                    width: 100%;
                    background: rgba(245,247,255,0.85);
                    box-shadow: 0 8px 32px 0 rgba(44,62,80,0.18), 0 0 0 4px #7b68ee22;
                    border-radius: 28px;
                    padding: 44px 44px 32px 44px;
                    position: relative;
                    overflow: hidden;
                    border: 2.5px solid transparent;
                    background-clip: padding-box, border-box;
                    border-image: linear-gradient(90deg,#7b68ee,#43e97b) 1;
                    backdrop-filter: blur(6px);
                ">
                    <div style="
                        position: absolute;
                        top: 0; left: 0; right: 0; height: 18px;
                        background: linear-gradient(90deg, #7b68ee 0%, #43e97b 100%);
                        opacity: 0.18;
                        border-radius: 28px 28px 0 0;
                        z-index:1;
                    "></div>
                    <div style="display: flex; align-items: center; gap: 32px; margin-bottom: 12px;z-index:2;position:relative;">
                        <i class="fa-solid fa-graduation-cap" style="font-size: 3.5rem; color: #7b68ee; filter: drop-shadow(0 2px 12px #7b68ee55); animation: pulseIcon 1.8s infinite alternate;"></i>
                        <div>
                            <h1 style="font-size:2.5rem;margin:0 0 0.2em 0;font-weight:900;letter-spacing:-1px;background:linear-gradient(90deg,#7b68ee,#43e97b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:0 2px 8px #23243a22;">Avaliação Final do Curso</h1>
                            <p style="font-size:1.18rem;color:#444;margin:0;">Teste seus conhecimentos sobre todos os módulos do curso de Manejo de Resíduos Sólidos</p>
                        </div>
                    </div>
                    <div class="quiz-stats" style="display:flex;gap:56px;margin:28px 0 0 4px;justify-content:center;z-index:2;position:relative;">
                        <div class="stat-item" style="text-align:center;">
                            <span class="stat-number" style="font-size:2rem;font-weight:900;color:#7b68ee;">${avaliacaoFinal.questoes.length}</span><br>
                            <span class="stat-label" style="font-size:1.13rem;color:#444;">Questões</span>
                        </div>
                        <div class="stat-item" style="text-align:center;">
                            <span class="stat-number" style="font-size:2rem;font-weight:900;color:#43e97b;">70%</span><br>
                            <span class="stat-label" style="font-size:1.13rem;color:#444;">Aprovação</span>
                        </div>
                        <div class="stat-item" style="text-align:center;">
                            <span class="stat-number" style="font-size:2rem;font-weight:900;color:#7b68ee;">60 min</span><br>
                            <span class="stat-label" style="font-size:1.13rem;color:#444;">Tempo</span>
                        </div>
                    </div>
                </div>
                <div class="card card-premium-bottom" style="
                    max-width: 520px;
                    width: 100%;
                    background: linear-gradient(135deg,rgba(255,255,255,0.92) 60%,rgba(123,104,238,0.07) 100%);
                    border-radius: 22px;
                    box-shadow: 0 8px 40px 0 #43e97b22, 0 0 0 6px #7b68ee22;
                    border: 2.5px solid transparent;
                    background-clip: padding-box, border-box;
                    border-image: linear-gradient(120deg,#43e97b,#7b68ee,#43e97b) 1;
                    padding: 38px 32px 32px 32px;
                    margin-top: -18px;
                    position:relative;
                    overflow:hidden;
                    animation: glowBorder 2.5s infinite alternate;
                    backdrop-filter: blur(10px);
                ">
                    <h2 style="font-size:1.55rem;font-weight:900;margin-bottom:22px;display:flex;align-items:center;gap:14px;background:linear-gradient(90deg,#43e97b,#7b68ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:0 2px 8px #23243a22;">
                        <span style='font-size:2.1rem;color:#ffc107;animation: pulseIcon 1.8s infinite alternate;filter:drop-shadow(0 0 8px #fff2);'><i class='fa-solid fa-calendar-check'></i></span> Instruções da Avaliação
                    </h2>
                    <ul style="list-style:none;padding:0;margin:0 0 28px 0;">
                        <li style='background:rgba(67,233,123,0.07);border-radius:8px;padding:8px 0 8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;font-size:1.18rem;font-weight:900;color:#43e97b;'><i class="fa-solid fa-circle-check"></i> 50 <span style='font-weight:700;'>questões</span></li>
                        <li style='background:rgba(123,104,238,0.06);border-radius:8px;padding:8px 0 8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;font-size:1.09rem;font-weight:700;color:#888;'><i class="fa-solid fa-arrow-right-arrow-left" style='color:#7b68ee;'></i> Navegue livremente entre as <span style='font-weight:800;color:#7b68ee;'>questões</span></li>
                        <li style='background:rgba(67,233,123,0.07);border-radius:8px;padding:8px 0 8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;font-size:1.09rem;font-weight:700;color:#43e97b;'><i class="fa-solid fa-lightbulb" style='color:#43e97b;'></i> Cada questão tem <span style='font-weight:900;color:#43e97b;'>feedback educativo</span></li>
                        <li style='background:rgba(123,104,238,0.06);border-radius:8px;padding:8px 0 8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;font-size:1.09rem;font-weight:700;color:#43e97b;'><i class="fa-solid fa-trophy" style='color:#7b68ee;'></i> Aprovação com <span style='font-weight:900;color:#43e97b;'>70% ou mais</span> de acertos</li>
                        <li style='background:rgba(67,233,123,0.07);border-radius:8px;padding:8px 0 8px 12px;display:flex;align-items:center;gap:10px;font-size:1.09rem;font-weight:700;color:#43e97b;'><i class="fa-solid fa-clock" style='color:#43e97b;'></i> Tempo limite de <span style='font-weight:900;color:#43e97b;'>60 minutos</span></li>
                    </ul>
                    <div style="display:flex;justify-content:center;">
                        <button class="start-quiz-btn" style="background:linear-gradient(90deg,#7b68ee 0%,#43e97b 100%);color:#fff;font-weight:900;font-size:1.22rem;border:none;border-radius:12px;box-shadow:0 2px 16px #7b68ee33;padding:18px 48px;cursor:pointer;transition:all 0.2s;letter-spacing:0.5px;animation:pop-premium 0.7s;" onclick="window.startFinalQuiz()"><i class="fa-solid fa-play"></i> Iniciar Avaliação</button>
                    </div>
                </div>
            </div>
        `;
        introContainer.style.display = 'block';
        domElements.finalQuizContainer.style.display = 'none';
        domElements.moduleTitle.textContent = '🏆 Avaliação Final';
        domElements.audioPlayer.style.display = 'none';
        // Animações premium para os cards
        const styleCards = document.createElement('style');
        styleCards.setAttribute('data-final-quiz', 'true'); // Marca para limpeza posterior
        styleCards.innerHTML = `
        @keyframes glowBorder {0%{box-shadow:0 8px 40px 0 #43e97b22,0 0 0 6px #7b68ee22;}100%{box-shadow:0 16px 56px 0 #7b68ee33,0 0 0 12px #43e97b44;}}
        @keyframes pulseIcon {0%{filter:drop-shadow(0 0 0 #43e97b44);}100%{filter:drop-shadow(0 0 12px #43e97b88);}}
        `;
        document.head.appendChild(styleCards);
    }

    /**
     * Inicia o quiz da avaliação final
     */
    function startFinalQuiz() {
        document.getElementById('final-quiz-intro-container').style.display = 'none';
        domElements.finalQuizContainer.style.display = 'block';
        saveFinalQuizState(0);
        renderQuiz(avaliacaoFinal, quizConfigs.final);
    }

    // Torna a função startFinalQuiz global para ser chamada pelo HTML
    window.startFinalQuiz = startFinalQuiz;

    // Torna a função de atualização de indicadores global
    window.updateProgressIndicators = function(pm) {
        // Atualiza a referência ao progressManager se for passada
        if (pm) {
            progressManager = pm;
        }
        applyProgressClasses();
        // Atualiza também o estado visual do card de áudio, se visível
        if (currentModuleId && modulos[currentModuleId].audio) {
             const audioCard = domElements.contentContainer.querySelector('.audio-card');
             if (audioCard) {
                const moduleProgress = progressManager.progress.modules[currentModuleId];
                if (moduleProgress && moduleProgress.audioCompleted) {
                    audioCard.classList.add('audio-completed');
                } else {
                    audioCard.classList.remove('audio-completed');
                }
             }
        }
    };

    // --- MODAL DO CERTIFICADO ---

    window.showCertificateModal = async function() {
        // Se já existe, só exibe
        let modal = document.getElementById('certificate-modal');
        if (!modal) {
            // Carrega o HTML do modal (estático)
            const response = await fetch('certificate-modal.html');
            const html = await response.text();
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div.firstElementChild);
            // Adiciona o <style> do modal
            const style = div.querySelector('style');
            if (style) document.body.appendChild(style);
            modal = document.getElementById('certificate-modal');
        }
        modal.style.display = 'flex';

        // Carrega dados do certificado
        const currentUser = sessionStorage.getItem('currentUser');
        const userRole = sessionStorage.getItem('userRole');
        const progressManager = window.progressManager || (window.ProgressManager && new window.ProgressManager(currentUser, userRole));
        const certManager = new window.CertificateManager(currentUser, progressManager);
        await certManager.loadCertificate();
        let certData = certManager.getCertificateData();

        // Se não encontrou certificado, tenta gerar se for elegível ou se for admin
        if (!certData && (certManager.canIssueCertificate() || userRole === 'admin')) {
            try {
                console.log('[Certificado] Tentando gerar certificado para', currentUser, 'role:', userRole);
                await certManager.generateCertificate();
                await certManager.loadCertificate();
                certData = certManager.getCertificateData();
            } catch (e) {
                // Se não conseguir gerar, mostra erro
                const previewDiv = document.getElementById('certificate-preview');
                const infoDiv = document.getElementById('certificate-info');
                previewDiv.innerHTML = '<div class="loading-preview">Erro ao gerar certificado.</div>';
                infoDiv.innerHTML = '';
                return;
            }
        }

        // Preenche preview e info
        const previewDiv = document.getElementById('certificate-preview');
        const infoDiv = document.getElementById('certificate-info');
        if (!certData) {
            previewDiv.innerHTML = '<div class="loading-preview">Certificado não encontrado.</div>';
            infoDiv.innerHTML = '';
            return;
        }
        // Gera preview do PDF (imagem)
        previewDiv.innerHTML = '<div class="loading-preview">Gerando preview...</div>';
        const generator = new window.CertificateGenerator(certData);
        await generator.generate();
        // Gera imagem do PDF (primeira página)
        const pdfDataUrl = generator.pdf.output('datauristring');
        previewDiv.innerHTML = `<iframe src="${pdfDataUrl}" style="width:100%;min-height:220px;border:none;"></iframe>`;

        // Preenche info
        infoDiv.innerHTML = `
            <strong>Nome:</strong> ${certData.username}<br>
            <strong>Data de Emissão:</strong> ${new Date(certData.issuedDate).toLocaleDateString('pt-BR')}<br>
            <strong>Pontuação Final:</strong> ${certData.finalScore}%<br>
            <strong>Módulos Concluídos:</strong> ${certData.completedModules}/8<br>
            <strong>Código de Validação:</strong> <span style="font-family:monospace;">${certData.validationCode}</span><br>
            <strong>Status:</strong> ${certData.status === 'issued' ? 'Emitido' : 'Revogado'}
            ${userRole === 'admin' ? '<br><strong>Função:</strong> Administrador' : ''}
        `;

        // Botão de download
        document.getElementById('download-certificate-btn').onclick = async () => {
            await generator.generate();
            generator.downloadPDF(`certificado-${certData.username}.pdf`);
            certManager.incrementDownloadCount();
        };
        // Botão de validação
        document.getElementById('validate-certificate-btn').onclick = () => {
            window.open(`validate.html?code=${certData.validationCode}`, '_blank');
        };
        // Botão de compartilhar
        document.getElementById('share-certificate-btn').onclick = () => {
            const url = `${window.location.origin}/validate.html?code=${certData.validationCode}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Meu Certificado MRS',
                    text: 'Confira meu certificado do Curso MRS!',
                    url
                });
            } else {
                navigator.clipboard.writeText(url);
                alert('Link de validação copiado para a área de transferência!');
            }
        };
    };

    window.closeCertificateModal = function() {
        const modal = document.getElementById('certificate-modal');
        if (modal) modal.style.display = 'none';
    };

    // Adicione animação shake para o ícone de interrogação
    const style = document.createElement('style');
    style.innerHTML = `@keyframes shake {10%, 90% {transform: translateX(-1px);}20%, 80% {transform: translateX(2px);}30%, 50%, 70% {transform: translateX(-4px);}40%, 60% {transform: translateX(4px);}}`;
    document.head.appendChild(style);

    // Animações premium
    const stylePremium = document.createElement('style');
    stylePremium.innerHTML = `
    @keyframes pop-premium {0%{transform:scale(0.5);} 60%{transform:scale(1.3);} 100%{transform:scale(1);}}
    @keyframes fadeInPremium {from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    .correct-premium {background:linear-gradient(90deg,rgba(67,233,123,0.13) 0%,rgba(123,104,238,0.10) 100%)!important;border-color:#43e97b!important;box-shadow:0 0 0 3px #43e97b55, 0 1px 8px #23243a33!important;transition:all 0.2s;}
    .incorrect-premium {background:linear-gradient(90deg,rgba(255,51,102,0.13) 0%,rgba(123,104,238,0.10) 100%)!important;border-color:#ff3366!important;box-shadow:0 0 0 3px #ff336655, 0 1px 8px #23243a33!important;transition:all 0.2s;}
    .answer-icon-premium {position:absolute;left:10px;top:50%;transform:translateY(-50%) scale(1.2);font-size:1.3rem;animation:pop-premium 0.4s;}
    .feedback.correct-premium, .feedback.incorrect-premium {margin-top:10px;border-radius:12px;box-shadow:0 2px 12px #43e97b33, 0 1.5px 0 0 #43e97b22 inset;font-weight:700;font-size:1.08rem;display:flex;align-items:center;gap:12px;padding:10px 18px;animation:fadeInPremium 0.5s;backdrop-filter: blur(4px);}
    .feedback.correct-premium {background:rgba(67,233,123,0.13);border:2px solid #43e97b;color:#43e97b;}
    .feedback.incorrect-premium {background:rgba(255,51,102,0.13);border:2px solid #ff3366;color:#ff3366;}
    .feedback .icon {font-size:1.5rem;}
    .feedback-text {color:#fff;font-weight:400;}
    .premium-btn:active {transform:scale(0.97)!important;filter:brightness(0.97)!important;}
    `;
    document.head.appendChild(stylePremium);

    // --- INICIA A APLICAÇÃO ---
    await main();
}); 