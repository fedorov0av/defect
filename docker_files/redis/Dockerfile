# Базовый образ
#FROM redis:7.2.4-alpine
FROM spectralwind/customredis

# Копируем файл конфигурации Redis без сохранения данных на диск
COPY redis.conf /usr/local/etc/redis/redis.conf

# установка таймзоны
ENV TZ=Europe/Istanbul

# Перезаписываем команду CMD для запуска Redis с нашим файлом конфигурации
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]