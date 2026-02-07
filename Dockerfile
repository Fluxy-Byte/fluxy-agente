# Imagem base Node
FROM node:20-alpine

# Diretório da aplicação
WORKDIR /app

# Copia package.json e lock
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o resto do projeto
COPY . .

# Inicia conexão com bancos de dados
RUN npx prisma generate --schema=prisma/postgres.prisma

# Compila o TypeScript
# RUN npm run dev

# Expõe a porta do Express (mude se usar outra)
EXPOSE 5096

# Inicia a aplicação
CMD ["npm", "run", "dev"] 