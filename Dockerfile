# Usa una imagen base de Ubuntu
FROM ubuntu:latest

ENV DEBIAN_FRONTEND noninteractive

# Actualiza los repositorios e instala Apache2 y SSH
RUN apt update && apt install -y apache2 \ 
	openssh-server

# Crea el directorio para SSH
RUN mkdir /var/run/sshd

# Expón los puertos 80 (HTTP) y 22 (SSH)
EXPOSE 80 22

# Comando para iniciar Apache2 y SSH
ENTRYPOINT service apache2 start && service ssh start && /bin/bash
