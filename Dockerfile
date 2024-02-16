# Базовый образ
FROM python:3.10-alpine

# Копирование исходных файлов в контейнер
COPY . /defects

# Копирование requirements.txt и установка зависимостей
COPY requirements.txt /defects/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /defects/requirements.txt && \
    rm -rf /defects/requirements.txt

# Установка рабочей директории
WORKDIR /defects

# Открытие порта
EXPOSE 4010
 
# Команда запуска приложения
CMD ["uvicorn", "main:app", "--host", "192.168.1.126", "--port", "4010"]