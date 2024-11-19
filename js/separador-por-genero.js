// js/separador-por-genero.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const clearButton = document.getElementById('clearButton');
    const processButton = document.getElementById('processButton');
    const resultAreas = {
        masculinoSingular: document.getElementById('masculinoSingular'),
        femeninoSingular: document.getElementById('femeninoSingular'),
        masculinoPlural: document.getElementById('masculinoPlural'),
        femeninoPlural: document.getElementById('femeninoPlural'),
        noClasificados: document.getElementById('noClasificados')
    };

    // Patrones de clasificación
    const patterns = {
        masculinoSingular: [
            /^(?:el|un|este|ese|aquel)\s+\w+$/i,
            /o$/i,
            /[aeiou]dor$/i,
            /[^s]or$/i,
            /[^aeiou]er$/i,
            /[aeiou]n$/i,
            /[^aeiou]ar$/i
        ],
        femeninoSingular: [
            /^(?:la|una|esta|esa|aquella)\s+\w+$/i,
            /a$/i,
            /[aeiou]dora$/i,
            /[^s]ora$/i,
            /ción$/i,
            /sión$/i,
            /dad$/i,
            /tud$/i,
            /triz$/i
        ],
        masculinoPlural: [
            /^(?:los|unos|estos|esos|aquellos)\s+\w+$/i,
            /os$/i,
            /[aeiou]dores$/i,
            /[^s]ores$/i
        ],
        femeninoPlural: [
            /^(?:las|unas|estas|esas|aquellas)\s+\w+$/i,
            /as$/i,
            /[aeiou]doras$/i,
            /[^s]oras$/i,
            /ciones$/i,
            /siones$/i,
            /dades$/i,
            /tudes$/i,
            /trices$/i
        ]
    };

    // Excepciones conocidas
    const exceptions = {
        masculinoSingular: ['día', 'mapa', 'problema', 'tema', 'sistema', 'planeta', 'cometa'],
        femeninoSingular: ['mano', 'radio', 'foto', 'moto', 'libido'],
        masculinoPlural: ['días', 'mapas', 'problemas', 'temas', 'sistemas', 'planetas', 'cometas'],
        femeninoPlural: ['manos', 'radios', 'fotos', 'motos']
    };

    function processText() {
        if (!inputText.value.trim()) {
            showNotification('Por favor, introduce algunas palabras', 'error');
            return;
        }

        // Limpiar resultados anteriores
        Object.values(resultAreas).forEach(area => area.value = '');

        // Obtener palabras y limpiarlas
        const words = inputText.value
            .split(/[\n,]+/)
            .map(word => word.trim())
            .filter(word => word.length > 0);

        // Clasificar cada palabra
        const classified = {
            masculinoSingular: [],
            femeninoSingular: [],
            masculinoPlural: [],
            femeninoPlural: [],
            noClasificados: []
        };

        words.forEach(word => {
            let found = false;

            // Comprobar excepciones primero
            for (const [category, exceptionList] of Object.entries(exceptions)) {
                if (exceptionList.includes(word.toLowerCase())) {
                    classified[category].push(word);
                    found = true;
                    break;
                }
            }

            // Si no es una excepción, aplicar patrones
            if (!found) {
                for (const [category, patternList] of Object.entries(patterns)) {
                    if (patternList.some(pattern => pattern.test(word.toLowerCase()))) {
                        classified[category].push(word);
                        found = true;
                        break;
                    }
                }
            }

            // Si no se ha clasificado, va a no clasificados
            if (!found) {
                classified.noClasificados.push(word);
            }
        });

        // Actualizar áreas de resultado
        Object.entries(classified).forEach(([category, wordList]) => {
            resultAreas[category].value = wordList.join('\n');
        });

        showNotification('¡Texto procesado con éxito!', 'success');
    }

    function clearFields() {
        inputText.value = '';
        Object.values(resultAreas).forEach(area => area.value = '');
        showNotification('Campos limpiados', 'success');
    }

    function copyToClipboard(targetId) {
        const textarea = document.getElementById(targetId);
        if (!textarea.value) {
            showNotification('No hay texto para copiar', 'error');
            return;
        }

        navigator.clipboard.writeText(textarea.value)
            .then(() => showNotification('¡Texto copiado!', 'success'))
            .catch(() => showNotification('Error al copiar', 'error'));
    }

    function showNotification(message, type = 'success') {
        // Eliminar notificación existente si la hay
        const existingNotification = document.querySelector('.copy-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `copy-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);

    // Botones de copiar
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            copyToClipboard(button.dataset.target);
        });
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para procesar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processText();
        }
    });
});