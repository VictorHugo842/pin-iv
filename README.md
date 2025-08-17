🚀 Delivery App - Projeto Interdisciplinar IV
1️⃣ Visão Geral do Projeto

Este projeto consiste em um aplicativo de delivery multi-tenant, com backend em Flask e frontend em Next.js, projetado para escalar e suportar múltiplos estabelecimentos de forma segura, modular e eficiente.

O objetivo atual é demonstrar a arquitetura e a integração das tecnologias, servindo como base para a evolução do MVP do sistema.

2️⃣ Tecnologias Utilizadas
Backend

Python 3.13 + Flask: Estrutura principal do servidor e API REST.

SQLAlchemy + Flask-Migrate: ORM e migrações de banco de dados MySQL/MariaDB.

Flask-JWT-Extended: Autenticação JWT armazenada em cookies HttpOnly com proteção CSRF.

Flask-Limiter: Rate limiting por IP, prevenindo ataques de força bruta.

Redis: Cache de endpoints críticos, diminuindo latência e carga no banco.

Blueprints: Modularização dos endpoints

auth_api: login, logout, multi-tenancy e CSRF.

painel_api: endpoints protegidos por tenant.

cardapio_api: gerenciamento de cardápio.

log_api: registro centralizado de logs.

Frontend

Next.js 14 + TypeScript: Estrutura de páginas e componentes reutilizáveis.

Axios: Comunicação segura com backend via withCredentials.

Componentes Reutilizáveis: Input, Paragraph, Title, LinkText.

HOCs: withAuthTenant para proteção de rotas.

UI/UX:

Modais com scroll lock.

Loading states e tratamento centralizado de erros.

Logout seguro com CSRF token.

Fonts otimizadas (Roboto Mono + Poppins) e Material Icons via CDN.

Infraestrutura & DevOps

Docker & Docker Compose: Containers para backend, frontend, banco e Redis.

MariaDB: Banco multi-tenant.

Redis: Cache rápido.

Nginx: Reverse proxy, unificando frontends e servindo arquivos estáticos.

Rede bridge customizada e volumes persistentes para banco e node_modules.

3️⃣ Arquitetura

O sistema foi desenvolvido para ser modular e escalável:

Multi-Tenancy: Cada tenant (unidade/estabelecimento) é isolado, com dados e autenticação própria.

Segurança: JWT + CSRF + Rate limiting.

Cache inteligente: Redis para reduzir consultas repetidas.

Componentização: Blueprints no backend e componentes + HOCs no frontend.

Preparado para micro-serviços: Estrutura modular facilita adicionar notificações, filas, eventos ou novos serviços.

4️⃣ Funcionalidades Implementadas
Backend

Testes de conexão ao banco.

Testes de Redis.

Endpoints protegidos por tenant e JWT.

Frontend

Delivery Page: Dashboard principal do tenant.

Ajustes Page: Modal de perfil do estabelecimento com scroll lock e UX suave.

Logout seguro.

Tratamento de erros centralizado.

Infraestrutura

Containers rodando backend, frontend, banco, Redis e Nginx.

Comunicação entre serviços via rede customizada.

Volumes persistentes configurados.

5️⃣ Como Rodar o Projeto

Clonar repositório:

git clone <URL_DO_REPO>
cd <PASTA_DO_PROJETO>


Configurar variáveis de ambiente:

Copie o arquivo .env.example para .env e configure:

DB_HOST=db
DB_PORT=3306
DB_NAME=delivery_db
DB_USER=root
DB_PASSWORD=senha
JWT_SECRET_KEY=sua_chave_secreta
DB_VOLUME=./data/db


Subir containers via Docker Compose:

docker compose up --build


Backend: http://localhost:5000

Frontend Cardápio: http://localhost:3001

Frontend Painel: http://localhost:3002

MariaDB: localhost:3307

Redis: localhost:6379

Nginx (produção/local unificada): http://localhost

Rodar migrações:

docker compose exec backend flask db upgrade


Acessar o sistema: Abrir o navegador em http://localhost:3002 para painel administrativo.

6️⃣ Estrutura de Pastas
/backend        -> Flask + SQLAlchemy + Blueprints
/cardapio       -> Frontend Next.js (Cardápio)
/painel         -> Frontend Next.js (Painel Administrativo)
nginx/          -> Configuração do Nginx
docker-compose.yml
.env

7️⃣ Próximos Passos

Implementar CRUD completo de cardápio.

Criar autenticação e registro de clientes.

Integração com pedidos e pagamentos.

Refinar UX e UI das páginas.

Preparar para testes de escalabilidade.

Documentar endpoints com Swagger/OpenAPI.

8️⃣ Aprendizado e Conclusão

Este projeto demonstra como arquitetar uma aplicação full stack multi-tenant, integrando várias tecnologias modernas e práticas de DevOps, com foco em:

Modularidade.

Escalabilidade.

Segurança.

Facilidade de manutenção e evolução futura.

💡 Aprendizado chave: integração de backend, frontend, cache e containers é essencial para sistemas que crescem com o negócio.