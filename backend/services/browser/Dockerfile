FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi==0.104.1 uvicorn==0.24.0

COPY main.py .

EXPOSE 8003

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]
