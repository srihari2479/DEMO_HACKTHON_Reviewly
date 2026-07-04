# Use official Python lightweight image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=7860

# Set working directory
WORKDIR /code

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user for HF Spaces (required by Hugging Face platform)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set working directory inside home
WORKDIR $HOME/app

# Copy application files, ensuring correct ownership
COPY --chown=user . .

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
