const Docker = require('dockerode');
const docker = new Docker();

let currentContainer = null;

// Nombre del contenedor que se va a utilizar
const containerName = 'server';

// Función para iniciar el contenedor
const startContainer = async () => {
    try {
        // Buscar el contenedor existente por nombre
        const containers = await docker.listContainers({ all: true });
        const existingContainer = containers.find(c => c.Names.includes(`/${containerName}`));

        if (existingContainer) {
            // Si el contenedor ya está en ejecución, solo lo arrancamos
            const container = docker.getContainer(existingContainer.Id);
            await container.start();
            currentContainer = container.id;

            const containerInfo = await container.inspect();
            const containerIP = containerInfo.NetworkSettings.IPAddress;

            return { containerId: container.id, ip: containerIP };
        } else {
            // Si no existe, lo creamos como nuevo
            const container = await docker.createContainer({
    	    Image: 'salchipapa',  // Asegúrate de que esta imagen esté construida
            name: containerName,  // Asignar un nombre al contenedor
         });


            // Arrancamos el contenedor recién creado
            await container.start();
            currentContainer = container.id;

            const containerInfo = await container.inspect();
            const containerIP = containerInfo.NetworkSettings.IPAddress;

            return { containerId: container.id, ip: containerIP };
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Función para detener el contenedor
const stopContainer = async () => {
    try {
        if (!currentContainer) {
            throw new Error('No hay contenedores en ejecución');
        }

        const container = docker.getContainer(currentContainer);
        await container.stop();
        currentContainer = null;

        return { message: 'Contenedor detenido' };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { startContainer, stopContainer };
