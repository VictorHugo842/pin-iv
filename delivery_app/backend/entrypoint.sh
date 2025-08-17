#!/bin/sh
set -e  # Para o script se algum comando falhar

echo "=== Início do entrypoint ==="

# 1️⃣ Espera real pelo banco
echo "Aguardando o banco de dados ficar pronto..."
until mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" >/dev/null 2>&1; do
    echo "Banco ainda não pronto, tentando novamente em 2s..."
    sleep 2
done
echo "Banco pronto!"

# 2️⃣ Inicializa o diretório de migrações se necessário
echo "Verificando diretório de migrações..."
if [ ! -d "migrations" ]; then
    flask db init
    echo "Diretório de migrações inicializado."
else
    echo "Diretório de migrações já existe."
fi

# 3️⃣ Aplica apenas migrações existentes
echo "Aplicando migrações existentes..."
flask db upgrade
echo "Migrações aplicadas com sucesso."

# 4️⃣ Inicia a aplicação
echo "Iniciando aplicação..."
if [ "$FLASK_DEBUG" = "1" ]; then
    flask run --host=0.0.0.0
else
    gunicorn app:app --bind 0.0.0.0:5000
fi

echo "=== Entrypoint finalizado ==="
