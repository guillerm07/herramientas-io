// js/contador-de-texto.js
document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const clearButton = document.getElementById('clearButton');
    const wordSearch = document.getElementById('wordSearch');
    const sortFrequency = document.getElementById('sortFrequency');
    
    let wordFrequencyData = [];

    function updateStats() {
        const text = inputText.value;
        
        // Contadores básicos
        document.getElementById('charCount').textContent = text.length;
        document.getElementById('charNoSpaceCount').textContent = text.replace(/\s/g, '').length;
        
        // Contar palabras
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        document.getElementById('wordCount').textContent = words.length;
        
        // Palabras únicas
        const uniqueWords = new Set(words.map(word => word.toLowerCase()));
        document.getElementById('uniqueWordCount').textContent = uniqueWords.size;
        
        // Contar líneas y párrafos
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        document.getElementById('lineCount').textContent = lines.length;
        
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
        document.getElementById('paragraphCount').textContent = paragraphs.length;
        
        // Contar oraciones
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        document.getElementById('sentenceCount').textContent = sentences.length;
        
        // Promedio de palabras por oración
        const avgWords = sentences.length ? (words.length / sentences.length).toFixed(1) : 0;
        document.getElementById('avgWordsPerSentence').textContent = avgWords;
        
        // Actualizar frecuencia de palabras
        updateWordFrequency(words);
    }

    function updateWordFrequency(words) {
        // Crear objeto de frecuencia
        const frequency = {};
        words.forEach(word => {
            word = word.toLowerCase().replace(/[.,!?()'"]/g, '');
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Convertir a array para ordenamiento
        wordFrequencyData = Object.entries(frequency).map(([word, count]) => ({
            word,
            count,
            percentage: ((count / words.length) * 100).toFixed(1)
        }));

        // Ordenar y mostrar
        sortAndDisplayFrequency();
    }

    function sortAndDisplayFrequency() {
        const searchTerm = wordSearch.value.toLowerCase();
        let filteredData = wordFrequencyData;

        // Filtrar por búsqueda
        if (searchTerm) {
            filteredData = filteredData.filter(item => 
                item.word.toLowerCase().includes(searchTerm)
            );
        }

        // Ordenar según selección
        if (sortFrequency.value === 'frequency') {
            filteredData.sort((a, b) => b.count - a.count);
        } else {
            filteredData.sort((a, b) => a.word.localeCompare(b.word));
        }

        // Generar HTML de la tabla
        const tbody = document.querySelector('#frequencyTable tbody');
        tbody.innerHTML = filteredData.map(item => `
            <tr>
                <td>${item.word}</td>
                <td>${item.count}</td>
                <td>${item.percentage}%</td>
            </tr>
        `).join('');

        // Añadir efecto de resaltado si hay búsqueda
        if (searchTerm) {
            tbody.querySelectorAll('td:first-child').forEach(td => {
                td.innerHTML = td.textContent.replace(
                    new RegExp(searchTerm, 'gi'),
                    match => `<mark>${match}</mark>`
                );
            });
        }
    }

    // Event Listeners
    inputText.addEventListener('input', debounce(updateStats, 300));
    
    clearButton.addEventListener('click', () => {
        inputText.value = '';
        updateStats();
    });

    wordSearch.addEventListener('input', debounce(() => {
        sortAndDisplayFrequency();
    }, 300));

    sortFrequency.addEventListener('change', () => {
        sortAndDisplayFrequency();
    });

    // Función debounce para optimizar rendimiento
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Copiar al portapapeles
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            const text = this.querySelector('.stat-details').textContent;
            navigator.clipboard.writeText(text).then(() => {
                const notification = document.createElement('div');
                notification.className = 'copy-notification';
                notification.textContent = '¡Copiado!';
                this.appendChild(notification);
                setTimeout(() => notification.remove(), 2000);
            });
        });
    });

    // Inicializar
    updateStats();
});