(function () {
    var CLAVE = "guia-perfumeria-pasos";
    var CLAVE_TAB = "guia-perfumeria-pestana";
    var sinMov = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var guardados = {};

    try {
        guardados = JSON.parse(localStorage.getItem(CLAVE)) || {};
    } catch (e) {
        guardados = {};
    }

    /* ---------- Ayudas ---------- */
    function centro(el) {
        var r = el.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
    }

    function salpicar(x, y, emojis, n, alcance) {
        if (sinMov) return;
        for (var i = 0; i < n; i++) {
            var p = document.createElement("span");
            var ang = Math.random() * 6.28;
            var d = alcance * (0.5 + Math.random() * 0.7);
            p.className = "gota";
            p.textContent = emojis[i % emojis.length];
            p.style.left = x + "px";
            p.style.top = y + "px";
            p.style.setProperty("--dx", Math.cos(ang) * d + "px");
            p.style.setProperty("--dy", Math.sin(ang) * d - 20 + "px");
            document.body.appendChild(p);
            setTimeout((function (el) { return function () { el.remove(); }; })(p), 900);
        }
    }

    /* ---------- Frasco con luz ---------- */
    var svg = document.querySelector(".frasco");
    if (svg) {
        var NS = "http://www.w3.org/2000/svg";
        var caja = document.createElement("div");
        var halo = document.createElement("div");
        var rayos = document.createElement("div");
        var i;

        caja.className = "frasco-caja";
        caja.setAttribute("role", "button");
        caja.setAttribute("tabindex", "0");
        caja.setAttribute("aria-label", "Rociar perfume");
        halo.className = "halo";
        rayos.className = "rayos";

        svg.parentNode.insertBefore(caja, svg);
        caja.appendChild(halo);
        caja.appendChild(rayos);
        caja.appendChild(svg);

        for (i = 0; i < 7; i++) {
            var ch = document.createElement("span");
            ch.className = "chispa";
            ch.textContent = "✦";
            ch.style.left = (i % 2 ? 78 + Math.random() * 40 : -40 + Math.random() * 30) + "%";
            ch.style.top = Math.random() * 100 + "%";
            ch.style.fontSize = 12 + Math.random() * 14 + "px";
            ch.style.animationDelay = Math.random() * 2.8 + "s";
            caja.appendChild(ch);
        }

        for (i = 0; i < 6; i++) {
            var c = document.createElementNS(NS, "circle");
            c.setAttribute("class", "burbuja");
            c.setAttribute("cx", 38 + Math.random() * 44);
            c.setAttribute("cy", 132);
            c.setAttribute("r", 2 + Math.random() * 2.5);
            c.style.animationDelay = i * 0.45 + "s";
            svg.appendChild(c);
        }

        var rociar = function () {
            svg.classList.remove("rociando");
            void svg.getBoundingClientRect();
            svg.classList.add("rociando");
            caja.classList.add("brilla");
            setTimeout(function () { caja.classList.remove("brilla"); }, 400);
            var p = centro(caja);
            salpicar(p[0], p[1] - 30, ["✨", "💖", "🌸", "🌿"], 14, 120);
        };

        caja.addEventListener("click", rociar);
        caja.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                rociar();
            }
        });
    }

    /* ---------- Casillas para marcar cada paso ---------- */
    var casillas = [];

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
                alCambiar(casilla);
            });

            etiqueta.appendChild(casilla);
            etiqueta.appendChild(texto);
            item.appendChild(etiqueta);
            casillas.push(casilla);
        });
    });

    /* ---------- Pestañas horizontales ---------- */
    var tarjetas = [].slice.call(document.querySelectorAll("main .tarjeta"));
    var tabs = [];
    var estado = [];
    var actual = -1;
    var barraFija = document.querySelector(".progreso");
    var nav = document.createElement("nav");

    nav.className = "tabs";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Secciones de la guía");
    if (barraFija) barraFija.appendChild(nav);

    function seccionCompleta(k) {
        var inputs = tarjetas[k].querySelectorAll("ol.pasos input");
        return inputs.length > 0 && [].every.call(inputs, function (x) { return x.checked; });
    }

    function todoListo() {
        return casillas.length > 0 && casillas.every(function (c) { return c.checked; });
    }

    function crearBoton(texto, clase, fn) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn-nav " + clase;
        b.textContent = texto;
        b.addEventListener("click", fn);
        return b;
    }

    tarjetas.forEach(function (t, k) {
        var h = t.querySelector("h2");
        var ic = t.querySelector(".icono");
        var copia = h.cloneNode(true);
        var quitar = copia.querySelector(".icono");
        if (quitar) quitar.remove();

        var nombre = copia.textContent.trim();
        if (nombre.indexOf(":") !== -1) nombre = nombre.split(":").pop().trim();
        nombre = nombre.replace(/\.$/, "");

        var tab = document.createElement("button");
        var tIco = document.createElement("span");
        var tTxt = document.createElement("span");

        tab.type = "button";
        tab.className = "tab";
        tab.setAttribute("role", "tab");
        tIco.className = "t-ico";
        tIco.textContent = ic ? ic.textContent : "•";
        tTxt.className = "t-txt";
        tTxt.textContent = nombre;
        tab.title = nombre;
        tab.appendChild(tIco);
        tab.appendChild(tTxt);
        tab.addEventListener("click", function () { mostrar(k, true); });
        nav.appendChild(tab);
        tabs.push(tab);

        var pie = document.createElement("div");
        pie.className = "nav-pie";
        if (k > 0) pie.appendChild(crearBoton("← Anterior", "", function () { mostrar(k - 1, true); }));
        if (k < tarjetas.length - 1) pie.appendChild(crearBoton("Siguiente →", "sig", function () { mostrar(k + 1, true); }));
        if (pie.children.length) t.appendChild(pie);
    });

    function mostrar(k, desplazar) {
        if (k < 0 || k >= tarjetas.length || k === actual) return;
        var dir = k > actual ? "der" : "izq";
        var primera = actual === -1;

        tarjetas.forEach(function (t, j) {
            t.hidden = j !== k;
            t.classList.remove("entra-der", "entra-izq");
        });
        if (!primera) tarjetas[k].classList.add("entra-" + dir);

        tabs.forEach(function (b, j) {
            b.classList.toggle("activa", j === k);
            b.setAttribute("aria-selected", j === k ? "true" : "false");
        });

        nav.scrollTo({
            left: tabs[k].offsetLeft - nav.clientWidth / 2 + tabs[k].clientWidth / 2,
            behavior: sinMov ? "auto" : "smooth"
        });

        actual = k;
        try { localStorage.setItem(CLAVE_TAB, String(k)); } catch (e) {}

        if (desplazar) {
            var principal = document.querySelector("main");
            var y = principal.getBoundingClientRect().top + window.scrollY - 150;
            if (window.scrollY > y) {
                window.scrollTo({ top: y, behavior: sinMov ? "auto" : "smooth" });
            }
        }
    }

    // Flechas del teclado
    document.addEventListener("keydown", function (e) {
        var t = e.target;
        var escribiendo = t && (t.tagName === "TEXTAREA" || t.tagName === "SELECT" ||
            (t.tagName === "INPUT" && t.type !== "checkbox"));
        if (escribiendo || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "ArrowRight") mostrar(actual + 1, true);
        if (e.key === "ArrowLeft") mostrar(actual - 1, true);
    });

    // Deslizar con el dedo en el celular
    var x0 = 0, y0 = 0;
    document.addEventListener("touchstart", function (e) {
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
        if (e.target.closest && e.target.closest("pre, .tabs")) return;
        var dx = e.changedTouches[0].clientX - x0;
        var dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 80 && Math.abs(dy) < 50) {
            mostrar(actual + (dx < 0 ? 1 : -1), true);
        }
    }, { passive: true });

    /* ---------- Barra de progreso ---------- */
    var yaCelebro = false;

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

        tabs.forEach(function (tab, k) {
            tab.classList.toggle("hecha", seccionCompleta(k));
        });

        if (total && hechos === total && !yaCelebro) {
            yaCelebro = true;
            lluviaDeFlores();
        }
        if (hechos < total) {
            yaCelebro = false;
        }
    }

    function alCambiar(casilla) {
        var k = tarjetas.indexOf(casilla.closest(".tarjeta"));
        var antes = estado[k];

        actualizarProgreso();
        estado[k] = seccionCompleta(k);

        // Al terminar una sección: chispas y el botón "Siguiente" late
        if (estado[k] && !antes && !todoListo()) {
            var p = centro(casilla);
            salpicar(p[0], p[1], ["🌸", "✨", "💖"], 10, 90);
            var sig = tarjetas[k].querySelector(".btn-nav.sig");
            if (sig) sig.classList.add("latir");
        }
    }

    function lluviaDeFlores() {
        if (sinMov) return;
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

    /* ---------- Botón de copiar ---------- */
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

    function copiarTexto(texto) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(texto);
        }
        return new Promise(function (ok, no) {
            var ta = document.createElement("textarea");
            ta.value = texto;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy") ? ok() : no(); } catch (e) { no(); }
            ta.remove();
        });
    }

    document.querySelectorAll(".codigo").forEach(function (bloque) {
        var boton = bloque.querySelector(".copiar");
        var codigo = bloque.querySelector("code");

        ponerBoton(boton, ICONO_COPIAR, "Copiar código");

        boton.addEventListener("click", function () {
            copiarTexto(codigo.textContent).then(function () {
                ponerBoton(boton, ICONO_LISTO, "¡Copiado!");
                boton.classList.add("listo");
                var p = centro(boton);
                salpicar(p[0], p[1], ["✨", "💖", "🌸"], 9, 70);
                setTimeout(function () {
                    ponerBoton(boton, ICONO_COPIAR, "Copiar código");
                    boton.classList.remove("listo");
                }, 1800);
            }).catch(function () {
                ponerBoton(boton, ICONO_COPIAR, "Selecciona y copia");
            });
        });
    });

    /* ---------- Inicio ---------- */
    tarjetas.forEach(function (t, k) { estado[k] = seccionCompleta(k); });
    actualizarProgreso();

    var inicio = 0;
    try {
        var guardada = parseInt(localStorage.getItem(CLAVE_TAB), 10);
        if (guardada >= 0 && guardada < tarjetas.length) inicio = guardada;
    } catch (e) {}
    mostrar(inicio, false);
})();