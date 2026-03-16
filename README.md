<div align="center">

# HFModelo

### A evolução da modelagem de dados: do prompt de texto ao diagrama visual.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blueviolet.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![React Flow](https://img.shields.io/badge/React%20Flow-11.11-FF0072)](https://reactflow.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

<br/>

> **HFModelo** é uma ferramenta web moderna, open-source e executada **100% localmente** para design e modelagem de bancos de dados relacionais. Inspirado no clássico *brModelo*, ele eleva a produtividade ao permitir que você gere diagramas Entidade-Relacionamento (ER) instantaneamente via **Inteligência Artificial**, ou construa sua arquitetura manualmente em um canvas interativo.

<br/>

![HFModelo Banner](https://raw.githubusercontent.com/mhaffz/HFModelo/master/src/public/banner.svg)

</div>

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### 🤖 Geração via IA (Text-to-Diagram)
Descreva sua base de dados em linguagem natural e deixe a IA gerar o modelo completo em JSON automaticamente — pronto para ser renderizado no canvas.

</td>
<td width="50%">

### 🖱️ Canvas Interativo (Drag-and-Drop)
Interface fluida construída sobre o **React Flow 11**: arraste tabelas, conecte chaves estrangeiras e visualize cardinalidades em tempo real.

</td>
</tr>
<tr>
<td width="50%">

### 📐 Notação Clássica
Suporte completo às cardinalidades no formato `(0,n)` e `(1,1)`, com identificação clara de **Chaves Primárias (PK)** e **Chaves Estrangeiras (FK)**.

</td>
<td width="50%">

### 🔒 100% Local e Seguro
O frontend roda direto na sua máquina. Sem telemetria, sem nuvem. Seu modelo de dados permanece **sob seu controle**.

</td>
</tr>
<tr>
<td width="50%">

### 💾 Persistência Local
Utiliza **IndexedDB** via `idb-keyval` para salvar seus diagramas diretamente no navegador — sem necessidade de servidor ou conta.

</td>
<td width="50%">

### ⚡ Build Moderno
Stack 100% moderno com **Vite 6**, **TypeScript 5.6** e **Tailwind CSS 3** para uma experiência de desenvolvimento rápida e tipagem segura.

</td>
</tr>
</table>

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework UI** | React | 18.3 |
| **Canvas / Diagramas** | React Flow | 11.11 |
| **Linguagem** | TypeScript | 5.6 |
| **Bundler** | Vite | 6.2 |
| **Estilos** | Tailwind CSS | 3.4 |
| **Gerenciamento de Estado** | Zustand | 5.0 |
| **Persistência Local** | idb-keyval (IndexedDB) | 6.2 |
| **Ícones** | Lucide React | 0.525 |
| **IDs Únicos** | uuid | 11.1 |

---

## 🖥️ Pré-requisitos

Se você está partindo do zero, configure o ambiente antes de rodar o HFModelo:

| Ferramenta | Versão Mínima | Descrição | Link |
|---|---|---|---|
| **Node.js** | 18+ | Motor que roda o React e gerencia os pacotes | [nodejs.org](https://nodejs.org/) |
| **npm** | 8+ | Gerenciador de pacotes (incluso no Node.js) | — |
| **Git** | qualquer | Para clonar o repositório | [git-scm.com](https://git-scm.com/) |

> 💡 Recomendamos usar a versão **LTS** do Node.js para maior estabilidade.

---

## 🚀 Instalação e Execução

Abra o terminal e siga os passos:

```bash
# 1. Clone o repositório
git clone https://github.com/mhaffz/HFModelo.git
cd HFModelo

# 2. Instale as dependências
npm install

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no seu navegador — e seja bem-vindo ao HFModelo! 🎉

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Compila TypeScript e gera o bundle de produção |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint para análise estática do código |

---

## 🧠 Como Usar a Geração por IA

```
1. Na barra lateral esquerda, localize a caixa "Crie com IA"
2. Descreva o banco de dados que você imagina em linguagem natural
3. Clique em "Gerar Diagrama"
4. Aguarde a IA retornar o esquema em JSON
5. Ajuste os nós manualmente no canvas conforme precisar
```

**Exemplo de prompt:**

> *"Preciso de um modelo para um sistema de e-commerce. Quero as tabelas de Cliente, Produto, Pedido e Itens do Pedido. Um cliente pode ter vários pedidos."*

A IA retornará um esquema estruturado em JSON que o sistema lerá e renderizará instantaneamente na tela. Seus diagramas são salvos automaticamente no **IndexedDB** do navegador.

---

## 📁 Estrutura do Projeto

```
HFModelo/
├── src/                  # Código-fonte principal
│   ├── public/           # Arquivos estáticos (imagens, SVGs)
│   │   └── banner.svg    # Banner do projeto
│   └── ...               # Componentes, hooks, stores, etc.
├── index.html            # Entry point HTML
├── vite.config.ts        # Configuração do Vite
├── tsconfig.json         # Configuração do TypeScript
├── tailwind.config.js    # Configuração do Tailwind CSS
├── postcss.config.js     # Configuração do PostCSS
└── package.json          # Dependências e scripts
```

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Sinta-se à vontade para abrir **Issues** com bugs ou sugestões. Para enviar código:

```bash
# 1. Faça um fork e clone o projeto
git clone https://github.com/mhaffz/HFModelo.git

# 2. Instale as dependências
npm install

# 3. Crie sua branch de feature
git checkout -b feature/MinhaNovaFeature

# 4. Faça suas alterações e garanta que não há erros
npm run lint

# 5. Commit suas alterações
git commit -m "feat: adiciona MinhaNovaFeature"

# 6. Push para a branch
git push origin feature/MinhaNovaFeature

# 7. Abra um Pull Request 🚀
```

> 💡 Utilize a convenção [Conventional Commits](https://www.conventionalcommits.org/) nas suas mensagens de commit.

---

## 📄 Licença

Distribuído sob a licença **AGPL-3.0**. Consulte o arquivo [`LICENSE`](LICENSE) para mais detalhes.

> ⚠️ Qualquer software que interaja com este projeto pela rede e modifique seu código-fonte **deve também ser open-source** sob a mesma licença.

---

<div align="center">

Feito com ❤️ para a comunidade de desenvolvedores brasileiros.

**[⭐ Dê uma estrela se este projeto te ajudou!](https://github.com/mhaffz/HFModelo)**

</div>