# 📁 Red Raccoon CTF Platform 

Bienvenidos a la plataforma de CTF de Red Raccoon, una plataforma que tiene como objetivo, brindar máquinas vulnerables que puedan ser explotadas para practicar habilidades relacionadas con la seguridad informática y el hacking ético.

## Instalación 

Lo primero que debemos realizar es descargar el repositorio en una carpeta del sistema operativo que este utilizando **(Recomendable usar Linux)**

```bash

giut clone https://github.com/dak0t4a/Red-Raccoon-CTF---Project
cd Red-Raccoon-CTF---Project/ 
```
### Instalación de la base de datos.

1. Debemos instalar primero el motor de base de datos a utilizar **mysql**

```bash
sudo apt install mariadb
service mysql start
```

2. Definir el usuario y contraseña en la base de datos.
```bash
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'toor';
CREATE DATABASE ctf_platform;
```

3. Importar el archivo de la base de datos.

```bash
mysql -u root -p ctf_platform < ctf_platform.sql
```

### Creación de la máquina objetivo (Docker)

1. Instalar docker
```bash
sudo apt install docker.io 
sudo systemctl start docker 
sudo systemctl enable docker
sudo systemctl start docker
```

3. Dentro de la misma carpeta de **Red-Raccoon-CTF---Project** creamos una imagen de docker

```bash
docker build -t ctf_images .
```

2. Creamos el contenedor de docker en segundo plano 

```bash
docker run -dit --name server ctf_images
docker stop server
```

### Instalar dependencias.

1. El backend del proyecto, se encuentra programado en nodejs, por lo que es necesario agregar una serie de dependencias para que pueda funcionar correctamente.

```bash
sudo apt install nodejs npm
npm init -y 
npm install express dockerode
npm install mysql2 bcrypt body-parser express-session
```

*Nota: El proceso de la instalación de dependencias puede ser un poco tardado, solo es necesario ser paciente*
### Ejecutar proyecto

1. Una vez instalados todos los requisitos solo será necesario ejecutar el siguiente comando

```bash
node index.js
```

2. Ahora puede visualizar el proyecto colocando en su navegador **http://localhost:3000

# Imágenes del proyecto

## Página de inicio

![image](https://github.com/user-attachments/assets/b866fac9-af59-4d85-b843-38c893a01a16)

## Retos
![image](https://github.com/user-attachments/assets/2da282ce-5cb7-42b4-ab49-d9eefcca3525)



## Descripción de retos

![image](https://github.com/user-attachments/assets/e8686e4f-0c8b-482f-84e1-664f94cc1a30)



## Dashboard

![image](https://github.com/user-attachments/assets/9e671e4a-f216-48f6-931b-dbb6de3b37b9)

# Créditos

Este proyecto es propiedad intelectual y desarrollado para fines académicos por:

>Dakota y Daisuki ♡

# ¡Happy Hacking! 
