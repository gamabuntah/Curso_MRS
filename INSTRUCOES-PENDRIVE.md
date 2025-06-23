# 🚀 Sistema PNSB - Uso Portátil em Pendrive

## 📋 Pré-requisitos

### No Computador de Destino:
- **Windows 10/11** (testado)
- **Node.js** instalado (versão 14 ou superior)
- **Navegador web** moderno (Chrome, Firefox, Edge)

### Instalação do Node.js:
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Siga as instruções padrão
5. Reinicie o computador se necessário

## 🎯 Como Usar

### Opção 1: Usar Diretamente do Pendrive
#### Passo 1: Inserir o Pendrive
- Conecte o pendrive no computador
- Aguarde o Windows reconhecer o dispositivo

#### Passo 2: Executar o Sistema
- Navegue até a pasta do pendrive
- **Duplo-clique** no arquivo `iniciar-sistema.bat`
- Aguarde a inicialização automática

#### Passo 3: Usar o Sistema
- O navegador abrirá automaticamente
- Faça login com:
  - **Gustavo** (usuário comum)
  - **admin** (administrador)
- Use o sistema normalmente

#### Passo 4: Parar o Sistema
- **Duplo-clique** no arquivo `parar-sistema.bat`
- Ou feche as janelas do terminal manualmente

### Opção 2: Copiar para o Computador (RECOMENDADO)
#### Passo 1: Copiar o Sistema
- Conecte o pendrive no computador
- Navegue até a pasta do pendrive
- **Duplo-clique** no arquivo `copiar-para-computador.bat`
- Digite o caminho de destino (ex: `C:\SistemaPNSB`)
- Aguarde a cópia ser concluída

#### Passo 2: Usar o Sistema Copiado
- Navegue até a pasta copiada
- **Duplo-clique** em `iniciar-sistema.bat`
- Use normalmente

#### Vantagens de Copiar para o Computador:
- ✅ **Mais rápido**: Não depende da velocidade do pendrive
- ✅ **Mais estável**: Sem problemas de conexão USB
- ✅ **Mais seguro**: Dados salvos no HD do computador
- ✅ **Atalho na área de trabalho**: Acesso mais fácil
- ✅ **Backup automático**: Sistema de backup incluído

## 🔧 Solução de Problemas

### Erro: "Node.js não encontrado"
**Solução:** Instale o Node.js no computador
1. Acesse https://nodejs.org/
2. Baixe e instale a versão LTS
3. Execute o script novamente

### Erro: "Porta já em uso"
**Solução:** Execute o `parar-sistema.bat` primeiro
- Ou reinicie o computador
- Ou feche outros programas que usem as portas 3000/8000

### Erro: "Dependências não encontradas"
**Solução:** O script instalará automaticamente
- Aguarde a instalação das dependências
- Pode demorar alguns minutos na primeira vez

### Sistema não abre no navegador
**Solução:** Acesse manualmente
- Abra o navegador
- Digite: `http://localhost:8000`

### Erro ao copiar para computador
**Solução:** 
- Verifique as permissões da pasta de destino
- Tente copiar para uma pasta diferente
- Execute como administrador se necessário

## 📁 Estrutura do Pendrive

```
Pendrive/
├── 📄 iniciar-sistema.bat          # Iniciar sistema
├── 📄 parar-sistema.bat            # Parar sistema
├── 📄 verificar-sistema.bat        # Verificar sistema
├── 📄 copiar-para-computador.bat   # Copiar para PC
├── 📄 backup-dados.bat             # Backup automático
├── 📄 config-sistema.json          # Configurações
├── 📄 INSTRUCOES-PENDRIVE.md       # Este arquivo
├── 📄 COMO-USAR-PENDRIVE.txt       # Instruções rápidas
├── 📄 README.md                    # Documentação completa
├── 📄 historico_chat.md            # Histórico
├── 📁 backend/                     # Servidor
├── 📁 public/                      # Interface
└── 📁 backup/                      # Backups (criado automaticamente)
```

## ⚡ Dicas Importantes

### ✅ Para Funcionar Bem:
- Use um pendrive de **pelo menos 4GB**
- Mantenha o pendrive conectado durante o uso (se usar diretamente)
- Feche outros programas desnecessários
- Use um computador com pelo menos 4GB de RAM
- **Recomendado**: Copie para o computador para melhor performance

### ⚠️ Limitações:
- Precisa de Node.js instalado no computador
- Funciona apenas em Windows
- Primeira execução pode ser mais lenta
- Dados são salvos no local onde o sistema está rodando

### 🔄 Backup:
- Faça backup regular do arquivo `backend/database.json`
- Use o script `backup-dados.bat` para backup automático
- Copie a pasta inteira para outro local periodicamente

### 🚀 Performance:
- **Pendrive**: Mais lento, depende da velocidade do USB
- **Computador**: Mais rápido, dados salvos no HD
- **Recomendação**: Sempre copie para o computador para uso regular

## 🆘 Suporte

### Se o sistema não funcionar:
1. Verifique se o Node.js está instalado
2. Execute `verificar-sistema.bat` para diagnóstico
3. Execute `parar-sistema.bat` e tente novamente
4. Reinicie o computador
5. Tente em outro computador

### Logs de Erro:
- Verifique as janelas do terminal que abrem
- Anote qualquer mensagem de erro
- Consulte o `historico_chat.md` para problemas conhecidos

### Copiar para Computador:
- Use `copiar-para-computador.bat` para facilitar
- Escolha uma pasta de fácil acesso
- Crie atalho na área de trabalho
- Faça backup regular dos dados

---

## 🎉 Sistema Pronto!

Após seguir estas instruções, o sistema estará funcionando perfeitamente em qualquer computador Windows com Node.js instalado!

**URLs do Sistema:**
- 🌐 Frontend: http://localhost:8000
- 🔧 Backend: http://localhost:3000

**Usuários de Teste:**
- 👤 Gustavo (usuário comum)
- 👨‍💼 admin (administrador)

**Recomendação Final:**
Para melhor performance e estabilidade, sempre copie o sistema para o computador usando `copiar-para-computador.bat`! 