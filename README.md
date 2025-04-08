
# 📦 Sistema de Monitoramento de Entregadores em Tempo Real

Este projeto permite o gerenciamento e visualização em tempo real da localização de entregadores em um mapa interativo. Construído com foco em simplicidade e rapidez para fins de prototipagem e testes de conceito.

---

## 🧠 Arquitetura do Projeto

### Frontend (Angular)
- **Angular 18** .
- **Componentização modular**: separação clara entre filtros e mapa.
- **Comunicação em tempo real com o backend** via WebSocket.
- Consome a API REST para cadastro, busca e atualização de entregadores.

### Backend (Node.js)
- **Node.js com Express** para gerenciamento de rotas REST.
- **SQLite** como banco de dados leve e embutido.
- **WebSocket com Socket.IO** para envio em tempo real da localização dos entregadores ativos.
- Script de simulação envia novas localizações a cada segundo.

---

## ▶️ Como Rodar o Projeto

### 🔧 Backend

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   node server.js
   ```

> O servidor estará disponível em `http://localhost:3000`

---

### 🌐 Frontend

1. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Rode o servidor de desenvolvimento:
   ```bash
   ng serve
   ```

> A aplicação estará acessível em `http://localhost:4200`

---

## 🧪 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express**
- **SQLite** (banco leve e simples)
- **Socket.IO** (WebSocket)
- **UUID** para geração de IDs únicos
- **Body-parser** e **CORS**

### Frontend
- **Angular 18**
- **RxJS**, **HttpClient**
- **Angular Services** para comunicação REST e WebSocket
- **Google Maps** (ou alternativa) para visualização dos pontos

---

## 📡 Rotas da API

Todas começam com `/api/entregadores`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/` | Cria um novo entregador |
| `GET` | `/` | Lista todos os entregadores (filtro opcional por status) |
| `GET` | `/:id` | Busca entregador por ID |
| `PUT` | `/:id/localizacao` | Atualiza a localização do entregador |
| `PUT` | `/:id/status` | Atualiza o status (ex: "ativo", "inativo") |

### Exemplo de criação:
```json
POST /api/entregadores
{
  "nome": "Lucas",
  "pontoInicio": { "latitude": -23.5, "longitude": -46.6 },
  "pontoFim": { "latitude": -23.55, "longitude": -46.65 },
  "pontosParada": [
    { "latitude": -23.51, "longitude": -46.61 },
    { "latitude": -23.52, "longitude": -46.62 }
  ]
}
```

### Resposta esperada:
```json
{
  "id": "uuid-gerado",
  "nome": "Lucas",
  "pontoInicio": {...},
  "pontoFim": {...},
  "pontosParada": [...],
  "status": "inativo"
}
```

---

## 🔄 Comunicação em Tempo Real

- O backend emite eventos via WebSocket com o evento `localizacaoAtualizada`.
- Frontend escuta o evento e atualiza dinamicamente a posição no mapa.
- Outro evento importante: `Status Atualizado` (quando o status do entregador muda).

---

## 💬 Por que essa stack?

Essa stack foi escolhida com base em critérios de **facilidade de implementação**, **leveza** e **rapidez de desenvolvimento**:

- **Node.js + SQLite**: ideal para prototipagem rápida sem necessidade de setup complexo de banco de dados.
- **Socket.IO**: WebSocket fácil de usar com fallback e suporte completo.
- **Angular**: estrutura robusta e organizada para desenvolvimento de aplicações SPA com componentes reutilizáveis.
- Separação clara entre **camadas de lógica**, facilitando manutenção e testes.
