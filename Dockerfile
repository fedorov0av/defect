# Базовый образ
FROM python:3.10-alpine

# Копирование исходных файлов в контейнер
COPY app/ /defects/app/
COPY db/ /defects/db/
COPY templates/ /defects/templates/
COPY utils/ /defects/utils/
COPY cert/ /defects/cert/
COPY create_db.py defects/
COPY config.py defects/
COPY main.py defects/
COPY .env defects/

# Копирование requirements.txt и установка зависимостей
COPY requirements.txt /defects/requirements.txt
RUN apk update && apk upgrade && apk add mc && apk add vim && apk add nano && \
    pip install --no-cache-dir --upgrade -r /defects/requirements.txt && \
    rm -rf /defects/requirements.txt

# установка таймзоны
ENV TZ=Europe/Istanbul

# Установка рабочей директории
WORKDIR /defects

# Открытие порта
EXPOSE 80 443
#EXPOSE 4000
# Команда запуска приложения
#CMD ["uvicorn", "main:app", "--workers", "9", "--host", "0.0.0.0", "--port", "4000", "--ssl-keyfile", "cert/private.key", "--ssl-certfile", "cert/defect-journal.akkuyu.local.cer"]
CMD ["uvicorn", "main:app", "--workers", "9", "--host", "0.0.0.0", "--port", "443", "--ssl-keyfile", "cert/private.key", "--ssl-certfile", "cert/defect-journal.akkuyu.local.cer"]