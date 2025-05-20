FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependências e TypeScript
RUN npm install
RUN npm install -g typescript

# Gerar cliente Prisma
RUN npm run db:generate

# Copiar código fonte
COPY src ./src/

# Compilar TypeScript
RUN tsc --skipLibCheck

# Configurar variáveis de ambiente e iniciar
ENV NODE_ENV=production
CMD npm run db:migrate && npm start