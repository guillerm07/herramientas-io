// js/calculadora-sueldo-neto.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const salarioBruto = document.getElementById('salarioBruto');
    const pagas = document.getElementById('pagas');
    const comunidad = document.getElementById('comunidad');
    const situacion = document.getElementById('situacion');
    const calculateButton = document.getElementById('calculateButton');
    const resultSection = document.querySelector('.result-section');
    const netoMensual = document.getElementById('netoMensual');
    const netoAnual = document.getElementById('netoAnual');
    const irpfElement = document.getElementById('irpf');
    const seguridadSocialElement = document.getElementById('seguridadSocial');
    const numPagasElement = document.getElementById('numPagas');

    // Tablas de IRPF por comunidad (simplificadas para el ejemplo)
    const irpfTables = {
        madrid: [
            { hasta: 12450, tipo: 18.5 },
            { hasta: 17707, tipo: 21.5 },
            { hasta: 33007, tipo: 24.5 },
            { hasta: 53407, tipo: 30.5 },
            { hasta: Infinity, tipo: 43.5 }
        ],
        cataluna: [
            { hasta: 12450, tipo: 19 },
            { hasta: 17707, tipo: 22 },
            { hasta: 33007, tipo: 25 },
            { hasta: 53407, tipo: 31 },
            { hasta: Infinity, tipo: 44 }
        ],
        andalucia: [
            { hasta: 12450, tipo: 19 },
            { hasta: 17707, tipo: 22 },
            { hasta: 33007, tipo: 25 },
            { hasta: 53407, tipo: 31 },
            { hasta: Infinity, tipo: 44 }
        ]
    };

    // Función para calcular el IRPF
    function calcularIRPF(salario, comunidadSeleccionada) {
        const tramos = irpfTables[comunidadSeleccionada];
        let irpfTotal = 0;
        let salarioRestante = salario;
        let salarioAnterior = 0;

        for (const tramo of tramos) {
            if (salarioRestante > 0) {
                const baseTramo = Math.min(salarioRestante, tramo.hasta - salarioAnterior);
                irpfTotal += (baseTramo * tramo.tipo) / 100;
                salarioRestante -= baseTramo;
                salarioAnterior = tramo.hasta;
            }
        }

        return irpfTotal;
    }

    // Función para calcular la Seguridad Social
    function calcularSeguridadSocial(salario) {
        const porcentajeSS = 6.35;
        return (salario * porcentajeSS) / 100;
    }

    // Función para formatear números como moneda
    function formatCurrency(number) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }

    // Función principal de cálculo
    function calcularSueldoNeto() {
        // Validar entrada
        if (!salarioBruto.value || salarioBruto.value <= 0) {
            alert('Por favor, introduce un salario bruto válido');
            return;
        }

        // Obtener valores
        const salarioAnual = parseFloat(salarioBruto.value);
        const numPagas = parseInt(pagas.value);
        const comunidadSeleccionada = comunidad.value;

        // Calcular deducciones
        const irpfAnual = calcularIRPF(salarioAnual, comunidadSeleccionada);
        const ssAnual = calcularSeguridadSocial(salarioAnual);

        // Calcular netos
        const netoAnualValue = salarioAnual - irpfAnual - ssAnual;
        const netoMensualValue = netoAnualValue / numPagas;

        // Actualizar UI
        resultSection.style.display = 'block';
        netoMensual.textContent = formatCurrency(netoMensualValue);
        netoAnual.textContent = formatCurrency(netoAnualValue);
        irpfElement.textContent = formatCurrency(irpfAnual);
        seguridadSocialElement.textContent = formatCurrency(ssAnual);
        numPagasElement.textContent = numPagas;

        // Animar resultados
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        setTimeout(() => {
            resultSection.style.transition = 'all 0.5s ease-out';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        }, 50);
    }

    // Event Listeners
    calculateButton.addEventListener('click', calcularSueldoNeto);

    // Permitir calcular al presionar Enter en el campo de salario
    salarioBruto.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calcularSueldoNeto();
        }
    });

    // Actualizar número de pagas cuando cambie el select
    pagas.addEventListener('change', function() {
        numPagasElement.textContent = this.value;
    });

    // Validación de entrada
    salarioBruto.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });
});