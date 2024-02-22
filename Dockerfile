# Базовый образ
FROM python:3.10-alpine

# Копирование исходных файлов в контейнер
COPY app/ /defects/app/
COPY db/ /defects/db/
COPY templates/ /defects/templates/
COPY utils/ /defects/utils/
COPY create_db.py defects/
COPY main.py defects/

# Копирование requirements.txt и установка зависимостей
COPY requirements.txt /defects/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /defects/requirements.txt && \
    rm -rf /defects/requirements.txt

# Установка рабочей директории
WORKDIR /defects

# Открытие порта
EXPOSE 4000
# Команда запуска приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4000"]