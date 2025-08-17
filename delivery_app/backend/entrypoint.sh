#!/bin/sh

set -e  # Faz o script parar se algum comando falhar

# Aguardar o banco de dados estar acessível
echo "Aguardando o banco de dados em $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
    echo "Banco de dados ainda não está pronto. Tentando novamente em 2 segundos..."
    sleep 2
done
echo "Banco de dados está acessível!"

# Inicializar o diretório de migrações se não existir
echo "Verificando diretório de migrações..."
if [ ! -d "migrations" ]; then
    flask db init
    echo "Diretório de migrações inicializado."
else
    echo "Diretório de migrações já existe."
fi

# Verifica se há alterações no schema
echo "Verificando alterações no schema..."

# Guarda a contagem antes
before=$(ls -1 migrations/versions | wc -l)

# Roda a migração
flask db migrate -m "Auto migration"

# Compara a contagem de arquivos
after=$(ls -1 migrations/versions | wc -l)
if [ "$before" -lt "$after" ]; then
    echo "Migração criada com sucesso."
    # Aplicar as migrações somente se houve alterações
    echo "Aplicando migrações..."
    flask db upgrade
    echo "Migrações aplicadas com sucesso."
else
    echo "Não há alterações no schema. Migrações não aplicadas."
fi

# Iniciar a aplicação
if [ "$FLASK_DEBUG" = "1" ]; then
    flask run --host=0.0.0.0
else
    gunicorn app:app --bind 0.0.0.0:5000 # produção
fi