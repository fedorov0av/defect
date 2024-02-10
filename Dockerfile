# 
FROM python:3.10.12

# 
WORKDIR /defects

 
#COPY ./requirements.txt /code/requirements.txt

# 
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 
COPY ./app /code/app

# 
CMD ["uvicorn", "app.main:app", "--host", "192.168.1.2", "--port", "80"]