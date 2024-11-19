// js/limpiar-urls.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const parametersInput = document.getElementById('parametersInput');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Checkboxes
    const removeHashCheckbox = document.getElementById('removeHash');
    const removeWWWCheckbox = document.getElementById('removeWWW');
    const forceHTTPSCheckbox = document.getElementById('forceHTTPS');
    const removeTrailingSlashCheckbox = document.getElementById('removeTrailingSlash');
    const decodePathCheckbox = document.getElementById('decodePath');
    const skipEmptyCheckbox = document.getElementById('skipEmpty');
    const removeDuplicatesCheckbox = document.getElementById('removeDuplicates');
    const sortUrlsCheckbox = document.getElementById('sortUrls');
    
    // Contadores
    const urlCount = document.querySelector('.url-count');
    const processedCount = document.querySelector('.processed-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Botones de parámetros comunes
    const parameterTags = document.querySelectorAll('.parameter-tag');

    // Función para limpiar una URL
    function cleanUrl(url) {
        try {
            // Verificar si la URL es válida
            if (!url.trim()) return '';
            
            // Intentar crear un objeto URL
            let urlObj;
            try {
                urlObj = new URL(url);
            } catch (e) {
                // Si falla, intentar añadiendo https://
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    urlObj = new URL('https://' + url);
                } else {
                    throw e;
                }
            }

            // Forzar HTTPS si está activado
            if (forceHTTPSCheckbox.checked) {
                urlObj.protocol = 'https:';
            }

            // Eliminar www si está activado
            if (removeWWWCheckbox.checked) {
                urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
            }

            // Decodificar ruta si está activado
            if (decodePathCheckbox.checked) {
                urlObj.pathname = decodeURIComponent(urlObj.pathname);
            }

            // Eliminar parámetros especificados
            const paramsToRemove = parametersInput.value
                .split(',')
                .map(p => p.trim())
                .filter(p => p);

            if (paramsToRemove.length > 0) {
                const params = new URLSearchParams(urlObj.search);
                paramsToRemove.forEach(param => {
                    params.delete(param);
                });
                urlObj.search = params.toString();
            }

            // Eliminar fragmento si está activado
            if (removeHashCheckbox.checked) {
                urlObj.hash = '';
            }

            // Construir la URL limpia
            let cleanedUrl = urlObj.toString();

            // Eliminar barra final si está activado
            if (removeTrailingSlashCheckbox.checked) {
                cleanedUrl = cleanedUrl.replace(/\/$/, '');
            }

            return cleanedUrl;
        } catch (error) {
            console.error('Error al limpiar URL:', url, error);
            return url; // Devolver la URL original si hay error
        }
    }

    // Función principal para procesar las URLs
    function processUrls() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algunas URLs', 'error');
            return;
        }

        // Dividir el texto en líneas
        let urls = inputText.value.split('\n');
        const originalCount = urls.length;

        // Filtrar líneas vacías si está activado
        if (skipEmptyCheckbox.checked) {
            urls = urls.filter(url => url.trim());
        }

        // Limpiar cada URL
        urls = urls.map(cleanUrl).filter(url => url);

        // Eliminar duplicados si está activado
        if (removeDuplicatesCheckbox.checked) {
            urls = [...new Set(urls)];
        }

        // Ordenar URLs si está activado
        if (sortUrlsCheckbox.checked) {
            urls.sort();
        }

        // Actualizar texto de salida
        outputText.value = urls.join('\n');

        // Actualizar contadores
        updateCounters(originalCount, urls.length);

        showNotification('¡URLs limpiadas con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(original, processed) {
        urlCount.textContent = `${original} URLs`;
        processedCount.textContent = `${processed} procesadas`;
        remainingCount.textContent = `${processed} URLs`;
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        parametersInput.value = '';
        updateCounters(0, 0);
        // Desactivar todos los parameter-tags
        parameterTags.forEach(tag => tag.classList.remove('active'));
        showNotification('Campos limpiados', 'success');
    }

    // Función para copiar al portapapeles
    function copyToClipboard() {
        if (!outputText.value) {
            showNotification('No hay URLs para copiar', 'error');
            return;
        }

        navigator.clipboard.writeText(outputText.value)
            .then(() => {
                showNotification('¡URLs copiadas al portapapeles!', 'success');
            })
            .catch(() => {
                showNotification('Error al copiar las URLs', 'error');
            });
    }

    // Función para mostrar notificaciones
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

    // Actualizar contador de URLs al escribir
    inputText.addEventListener('input', function() {
        const urls = this.value.split('\n').filter(url => url.trim());
        urlCount.textContent = `${urls.length} URLs`;
    });

    // Event Listeners
    processButton.addEventListener('click', processUrls);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Manejar clics en parameter-tags
    parameterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const params = this.dataset.params;
            const currentParams = new Set(
                parametersInput.value
                    .split(',')
                    .map(p => p.trim())
                    .filter(p => p)
            );

            // Toggle los parámetros
            params.split(',').forEach(param => {
                if (currentParams.has(param)) {
                    currentParams.delete(param);
                } else {
                    currentParams.add(param);
                }
            });

            // Actualizar input y estado visual
            parametersInput.value = Array.from(currentParams).join(', ');
            this.classList.toggle('active');
        });
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para procesar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processUrls();
        }
        
        // Ctrl/Cmd + Shift + C para copiar
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyToClipboard();
        }
    });

    // Ajustar altura del textarea de salida para que coincida con el de entrada
    function matchTextareaHeights() {
        outputText.style.height = `${inputText.offsetHeight}px`;
    }

    // Observer para cambios en la altura del textarea de entrada
    const resizeObserver = new ResizeObserver(matchTextareaHeights);
    resizeObserver.observe(inputText);
});