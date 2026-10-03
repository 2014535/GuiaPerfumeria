var CLAVE = "guia-perfumeria-pasos";
var guardados = {};

try {
    guardados = JSON.parse(localStorage.getItem(CLAVE)) || {};
} catch (e) {
    guardados = {};
}

var casillas = [];
var yaCelebro = false;

// Casillas para marcar cada paso como hecho
document.querySelectorAll("ol.pasos").forEach(function (lista, i) {
    lista.classList.add("con-js");

    lista.querySelectorAll(":scope > li").forEach(function (item, j) {
        var id = i + "-" + j;
        var etiqueta = document.createElement("label");
        var casilla = document.createElement("input");
        var texto = document.createElement("span");

        casilla.type = "checkbox";
        casilla.checked = !!guardados[id];

        while (item.firstChild) {
            texto.appendChild(item.firstChild);
        }

        casilla.addEventListener("change", function () {
            guardados[id] = casilla.checked;
            try {
                localStorage.setItem(CLAVE, JSON.stringify(guardados));
            } catch (e) {
                // Si no se puede guardar, la página sigue funcionando
            }
            actualizarProgreso();
        });

        etiqueta.appendChild(casilla);
        etiqueta.appendChild(texto);
        item.appendChild(etiqueta);
        casillas.push(casilla);
    });
});

// Barra de progreso con mensajes de ánimo
function actualizarProgreso() {
    var total = casillas.length;
    var hechos = casillas.filter(function (c) { return c.checked; }).length;
    var porcentaje = total ? Math.round((hechos / total) * 100) : 0;
    var mensaje;

    if (hechos === 0) {
        mensaje = "¡Empecemos! 🌱";
    } else if (porcentaje < 50) {
        mensaje = "¡Buen comienzo! 💪";
    } else if (porcentaje < 100) {
        mensaje = "¡Vas muy bien! 🌸";
    } else {
        mensaje = "¡Lo lograste! 🎉";
    }

    document.getElementById("relleno").style.width = porcentaje + "%";
    document.getElementById("textoProgreso").textContent =
        "Llevas " + hechos + " de " + total + " pasos · " + mensaje;

    if (total && hechos === total && !yaCelebro) {
        yaCelebro = true;
        lluviaDeFlores();
    }
    if (hechos < total) {
        yaCelebro = false;
    }
}

// Lluvia de flores y corazones
function lluviaDeFlores() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }
    var emojis = ["🌸", "🌿", "✨", "💖", "🌷"];

    for (var i = 0; i < 40; i++) {
        var pieza = document.createElement("span");
        pieza.className = "confeti";
        pieza.textContent = emojis[i % emojis.length];
        pieza.style.left = Math.random() * 100 + "vw";
        pieza.style.fontSize = 18 + Math.random() * 20 + "px";
        pieza.style.animationDelay = Math.random() * 1.5 + "s";
        document.body.appendChild(pieza);

        (function (el) {
            setTimeout(function () { el.remove(); }, 5500);
        })(pieza);
    }
}

actualizarProgreso();

// Botón de copiar con icono
var ICONO_COPIAR =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="2" width="6" height="4" rx="1"/>' +
    '<path d="M9 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/></svg>';

var ICONO_LISTO =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="20 6 9 17 4 12"/></svg>';

function ponerBoton(boton, icono, texto) {
    boton.innerHTML = icono + "<span>" + texto + "</span>";
}

document.querySelectorAll(".codigo").forEach(function (bloque) {
    var boton = bloque.querySelector(".copiar");
    var codigo = bloque.querySelector("code");

    ponerBoton(boton, ICONO_COPIAR, "Copiar");

    boton.addEventListener("click", function () {
        navigator.clipboard.writeText(codigo.textContent).then(function () {
            ponerBoton(boton, ICONO_LISTO, "¡Copiado!");
            boton.classList.add("listo");
            setTimeout(function () {
                ponerBoton(boton, ICONO_COPIAR, "Copiar");
                boton.classList.remove("listo");
            }, 1800);
        }).catch(function () {
            ponerBoton(boton, ICONO_COPIAR, "Selecciona y copia");
        });
    });
});