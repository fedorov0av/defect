# Базовый образ
FROM python:3.11-alpine

# Установка рабочей директории
WORKDIR /defects

# Копирование requirements.txt и установка зависимостей
COPY requirements.txt ./requirements.txt
RUN apk update && apk upgrade && apk add mc && apk add vim && apk add nano && \
    pip install --no-cache-dir --upgrade -r ./requirements.txt && \
    rm -rf ./requirements.txt

# Копирование исходных файлов в контейнер
COPY app/ ./app/
COPY db/ ./db/
COPY templates/ ./templates/
COPY utils/ ./utils/
COPY cert/ ./cert/
COPY create_db.py ./
COPY config.py ./
COPY main.py ./
COPY .env ./

# установка таймзоны
ENV TZ=Europe/Istanbul

# Открытие порта
EXPOSE 443
# Команда запуска приложения
CMD ["uvicorn", "main:app", "--workers", "9", "--host", "0.0.0.0", "--port", "443", "--ssl-keyfile", "cert/private.key", "--ssl-certfile", "cert/defect-journal.akkuyu.local.cer"]