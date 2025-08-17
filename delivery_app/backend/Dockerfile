FROM python:3.13-alpine

# Instalar dependências do sistema necessárias para o mysqlclient
RUN apk update && apk add --no-cache \
    gcc \
    libc-dev \
    mariadb-dev \
    mariadb-client \
    python3-dev \
    libffi-dev \
    musl-dev

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos de dependência
COPY requirements.txt .

# Instalar dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o projeto para o container
COPY . .

# Dar permissão ao script de entrada
RUN chmod +x entrypoint.sh

# Expor a porta do Flask/Gunicorn
EXPOSE 5000

# Comando de inicialização do container
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
