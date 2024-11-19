// js/calculadora-interes-compuesto.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const capitalInicial = document.getElementById('capitalInicial');
    const aportacionMensual = document.getElementById('aportacionMensual');
    const interes = document.getElementById('interes');
    const anos = document.getElementById('anos');
    const frecuenciaInteres = document.getElementById('frecuenciaInteres');
    const calculateButton = document.getElementById('calculateButton');
    const resultSection = document.querySelector('.result-section');
    
    // Elementos de resultado
    const capitalFinal = document.getElementById('capitalFinal');
    const interesesGenerados = document.getElementById('interesesGenerados');
    const totalAportado = document.getElementById('totalAportado');
    const resultTable = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
    
    // Contexto para el gráfico
    let growthChart = null;

    // Función para formatear números como moneda
    function formatCurrency(number) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }

    // Función para calcular el interés compuesto
    function calcularInteresCompuesto() {
        // Validar entrada
        if (!validarEntradas()) {
            alert('Por favor, completa todos los campos correctamente');
            return;
        }

        // Obtener valores
        const capital = parseFloat(capitalInicial.value);
        const aportacion = parseFloat(aportacionMensual.value);
        const tasaInteres = parseFloat(interes.value) / 100;
        const periodo = parseInt(anos.value);
        const frecuencia = parseInt(frecuenciaInteres.value);

        // Arrays para el gráfico
        const labels = [];
        const dataCapital = [];
        const dataIntereses = [];
        const dataAportaciones = [];

        // Variables para el cálculo
        let capitalActual = capital;
        let totalAportaciones = capital;
        let aportacionesAnuales = aportacion * 12;
        
        // Limpiar tabla
        resultTable.innerHTML = '';

        // Calcular año por año
        for (let year = 1; year <= periodo; year++) {
            // Calcular intereses del año
            const interesAnual = capitalActual * tasaInteres;
            capitalActual += interesAnual + aportacionesAnuales;
            totalAportaciones += aportacionesAnuales;

            // Guardar datos para el gráfico
            labels.push(`Año ${year}`);
            dataCapital.push(capitalActual);
            dataIntereses.push(capitalActual - totalAportaciones);
            dataAportaciones.push(totalAportaciones);

            // Añadir fila a la tabla
            const row = resultTable.insertRow();
            row.innerHTML = `
                <td>Año ${year}</td>
                <td>${formatCurrency(capitalActual)}</td>
                <td>${formatCurrency(capitalActual - totalAportaciones)}</td>
                <td>${formatCurrency(totalAportaciones)}</td>
            `;
        }

        // Actualizar resultados
        capitalFinal.textContent = formatCurrency(capitalActual);
        interesesGenerados.textContent = formatCurrency(capitalActual - totalAportaciones);
        totalAportado.textContent = formatCurrency(totalAportaciones);

        // Mostrar resultados
        resultSection.style.display = 'block';

        // Actualizar gráfico
        actualizarGrafico(labels, dataCapital, dataIntereses, dataAportaciones);
    }

    // Función para validar entradas
    function validarEntradas() {
        return capitalInicial.value > 0 &&
               aportacionMensual.value >= 0 &&
               interes.value > 0 &&
               interes.value <= 100 &&
               anos.value > 0 &&
               anos.value <= 50;
    }

    // Función para actualizar el gráfico
    function actualizarGrafico(labels, dataCapital, dataIntereses, dataAportaciones) {
        // Destruir gráfico anterior si existe
        if (growthChart) {
            growthChart.destroy();
        }

        // Crear nuevo gráfico
        const ctx = document.getElementById('growthChart').getContext('2d');
        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Capital Total',
                        data: dataCapital,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Intereses Generados',
                        data: dataIntereses,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Total Aportado',
                        data: dataAportaciones,
                        borderColor: '#64748b',
                        backgroundColor: 'rgba(100, 116, 139, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatCurrency(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Event Listeners
    calculateButton.addEventListener('click', calcularInteresCompuesto);

    // Permitir calcular al presionar Enter
    [capitalInicial, aportacionMensual, interes, anos].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calcularInteresCompuesto();
            }
        });
    });

    // Validación de entrada
    capitalInicial.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
    });

    aportacionMensual.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
    });

    interes.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
        if (this.value > 100) this.value = 100;
    });

    anos.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 50) this.value = 50;
    });
});