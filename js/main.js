/*
  ============================================================
  HOMEGROWN — main.js
  ============================================================

  Este archivo maneja la lógica del carrito de compras.

  CONCEPTOS QUE VAS A APRENDER ACÁ:
  - Cómo seleccionar elementos del HTML con JavaScript
  - Cómo escuchar eventos del usuario (clicks)
  - Cómo guardar y modificar datos en un array de objetos
  - Cómo actualizar el HTML dinámicamente (DOM manipulation)
  - Cómo usar localStorage para que el carrito persista
    aunque el usuario recargue la página

  ============================================================
*/
const WHATSAPP_NUMERO = '5493585703953'; // 👈 CAMBIÁ por tu número

/* ============================================================
   1. SELECCIÓN DE ELEMENTOS DEL DOM
   
   querySelector y getElementById son los métodos más
   comunes para "agarrar" un elemento del HTML.
   
   - getElementById busca por el atributo id=""
   - querySelector acepta cualquier selector CSS
   ============================================================ */

const btnCarrito      = document.getElementById('btnCarrito');
const cerrarCarrito   = document.getElementById('cerrarCarrito');
const carritoPanel    = document.getElementById('carritoPanel');
const overlay         = document.getElementById('overlay');
const carritoLista    = document.getElementById('carritoLista');
const carritoCount    = document.getElementById('carritoCount');
const carritoTotal    = document.getElementById('carritoTotal');

/*
  querySelectorAll devuelve TODOS los elementos que coincidan
  con el selector, como una lista (NodeList).
  En este caso, agarra todos los botones "Agregar".
*/
const botonesAgregar  = document.querySelectorAll('.btn-agregar');


/* ============================================================
   2. EL "ESTADO" DEL CARRITO
   
   Guardamos los productos en un array de objetos.
   Cada objeto tiene: nombre, precio y cantidad.
   
   Ejemplo:
   [
     { nombre: "Hoodie Marrón", precio: 6800, cantidad: 1 },
     { nombre: "Hoodie Negro",  precio: 6800, cantidad: 2 }
   ]
   
   Intentamos cargar el carrito desde localStorage,
   si no hay nada guardado, empezamos con un array vacío [].
   ============================================================ */
let carrito = cargarCarritoGuardado();

/*
  Esta función lee el carrito guardado en localStorage.
  
  localStorage es como un "cuaderno" del navegador:
  guarda texto de forma permanente para ese sitio.
  
  Como localStorage solo guarda texto, usamos:
  - JSON.stringify() para convertir un objeto/array a texto
  - JSON.parse() para convertir el texto de vuelta a objeto/array
*/
function cargarCarritoGuardado() {
  const guardado = localStorage.getItem('homegrown-carrito');

  // Si hay algo guardado, lo parseamos. Si no, devolvemos array vacío.
  if (guardado) {
    return JSON.parse(guardado);
  }
  return [];
}

/*
  Esta función guarda el carrito actual en localStorage.
  La llamamos cada vez que el carrito cambia.
*/
function guardarCarrito() {
  localStorage.setItem('homegrown-carrito', JSON.stringify(carrito));
}


/* ============================================================
   3. FUNCIÓN PRINCIPAL: AGREGAR UN PRODUCTO AL CARRITO
   
   Recibe el nombre y precio del producto.
   Busca si ya existe en el carrito, y si existe
   incrementa la cantidad. Si no existe, lo agrega.
   ============================================================ */
function agregarAlCarrito(nombre, precio) {

  /*
    Array.find() busca en el array y devuelve el primer elemento
    que cumpla la condición. Si no encuentra nada, devuelve undefined.
  */
  const productoExistente = carrito.find(function(item) {
    return item.nombre === nombre;
  });

  if (productoExistente) {
    // Ya existe: solo aumentamos la cantidad
    productoExistente.cantidad += 1;
  } else {
    // No existe: lo agregamos como nuevo objeto al array
    // El método push() agrega un elemento al final del array
    carrito.push({
      nombre:   nombre,
      precio:   precio,
      cantidad: 1
    });
  }

  guardarCarrito();  // Guardamos en localStorage
  actualizarUI();    // Actualizamos lo que se ve en pantalla
  abrirCarrito();    // Abrimos el panel para que el usuario vea lo que agregó
}


/* ============================================================
   4. FUNCIÓN: QUITAR UN PRODUCTO DEL CARRITO
   
   Recibe el nombre del producto y lo elimina del array.
   Array.filter() crea un NUEVO array con solo los elementos
   que NO coincidan con ese nombre.
   ============================================================ */
function quitarDelCarrito(nombre) {
  carrito = carrito.filter(function(item) {
    return item.nombre !== nombre;
  });

  guardarCarrito();
  actualizarUI();
}


/* ============================================================
   5. FUNCIÓN: ACTUALIZAR LA INTERFAZ
   
   Esta es la función más importante del carrito.
   Cada vez que el carrito cambia, la llamamos para
   que el HTML refleje el estado actual.
   
   El patrón es: borramos todo y lo volvemos a dibujar.
   Es simple y fácil de entender para empezar.
   ============================================================ */
function actualizarUI() {
  // ----- 5a. Actualizamos el contador del botón de nav -----
  /*
    reduce() recorre el array y "acumula" un resultado.
    Acá suma todas las cantidades de todos los items.
    
    El 0 al final es el valor inicial del acumulador.
  */
  const totalItems = carrito.reduce(function(acum, item) {
    return acum + item.cantidad;
  }, 0);

  carritoCount.textContent = totalItems;


  // ----- 5b. Vaciamos la lista del carrito -----
  /*
    innerHTML = '' borra todo el contenido HTML de un elemento.
    Es la forma más rápida de vaciar un contenedor.
  */
  carritoLista.innerHTML = '';


  // ----- 5c. Dibujamos cada item del carrito -----
  if (carrito.length === 0) {
    /*
      Si el carrito está vacío, mostramos un mensaje.
      Asignamos directamente HTML con innerHTML.
    */
    carritoLista.innerHTML = `
      <li style="color: var(--color-texto-suave); text-align: center; padding: 2rem 0;">
        Tu carrito está vacío.
      </li>
    `;
  } else {
    /*
      forEach recorre cada item del array y ejecuta
      una función para cada uno.
    */
    carrito.forEach(function(item) {
      /*
        Creamos un elemento <li> de forma programática.
        document.createElement() crea un elemento HTML nuevo
        sin agregarlo todavía al DOM.
      */
      const li = document.createElement('li');
      li.classList.add('carrito-item');

      /*
        Template literals (los backticks ``) nos permiten
        insertar variables dentro del HTML con ${variable}.
        Son mucho más cómodos que concatenar strings.
      */
      li.innerHTML = `
        <div class="carrito-item__info">
          <p>${item.nombre}</p>
          <span>x${item.cantidad} — $${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
        </div>
        <button class="carrito-item__quitar" data-nombre="${item.nombre}">
          Quitar
        </button>
      `;

      /*
        appendChild agrega el elemento al final del contenedor.
        Así "pintamos" cada item en el HTML.
      */
      carritoLista.appendChild(li);
    });
  }


  // ----- 5d. Actualizamos el total de dinero -----
  const totalPrecio = carrito.reduce(function(acum, item) {
    return acum + (item.precio * item.cantidad);
  }, 0);

  carritoTotal.textContent = '$' + totalPrecio.toLocaleString('es-AR');


  // ----- 5e. Asignamos eventos a los botones "Quitar" -----
  /*
    Como los botones "Quitar" los generamos dinámicamente,
    tenemos que agregarles el evento DESPUÉS de crearlos.
    
    querySelectorAll dentro de carritoLista busca solo
    dentro de ese elemento, no en todo el HTML.
  */
  const botonesQuitar = carritoLista.querySelectorAll('.carrito-item__quitar');

  botonesQuitar.forEach(function(btn) {
    btn.addEventListener('click', function() {
      /*
        dataset nos da acceso a los atributos data-* del HTML.
        data-nombre="Hoodie Marrón" → btn.dataset.nombre
      */
      const nombre = btn.dataset.nombre;
      quitarDelCarrito(nombre);
    });
  });
}


/* ============================================================
   6. FUNCIONES PARA ABRIR Y CERRAR EL CARRITO
   ============================================================ */
function abrirCarrito() {
  carritoPanel.classList.add('carrito--abierto');
  overlay.classList.add('overlay--visible');
  /*
    aria-hidden="false" es importante para accesibilidad:
    le indica a los lectores de pantalla que el panel
    ahora es visible.
  */
  carritoPanel.setAttribute('aria-hidden', 'false');
}

function cerrarPanelCarrito() {
  carritoPanel.classList.remove('carrito--abierto');
  overlay.classList.remove('overlay--visible');
  carritoPanel.setAttribute('aria-hidden', 'true');
}


/* ============================================================
   7. ASIGNACIÓN DE EVENTOS (Event Listeners)
   
   addEventListener(evento, función) dice:
   "cuando pase ESTE evento en ESTE elemento, ejecutá ESTA función"
   
   Eventos comunes:
   - 'click': cuando el usuario hace click
   - 'submit': cuando se envía un formulario
   - 'change': cuando cambia el valor de un input
   - 'keydown': cuando se presiona una tecla
   ============================================================ */

// Click en el botón "Carrito" de la nav → abrir panel
btnCarrito.addEventListener('click', abrirCarrito);

// Click en el botón "✕" del panel → cerrar panel
cerrarCarrito.addEventListener('click', cerrarPanelCarrito);

// Click en el overlay oscuro → cerrar panel
overlay.addEventListener('click', cerrarPanelCarrito);


/*
  Iteramos sobre todos los botones "Agregar" y les
  asignamos el mismo tipo de evento.
  
  Usamos dataset para leer los atributos data-nombre y data-precio
  que pusimos en el HTML: data-nombre="Hoodie Marrón" data-precio="6800"
*/
botonesAgregar.forEach(function(btn) {
  // Si el botón tiene el atributo disabled, no hacemos nada
  if (btn.disabled) return;

  btn.addEventListener('click', function() {
    const nombre = btn.dataset.nombre;
    /*
      parseInt convierte el texto "6800" al número 6800.
      Siempre que leas datos del HTML van a llegar como texto (string),
      así que hay que convertirlos si los vas a usar como números.
    */
    const precio = parseInt(btn.dataset.precio, 10);

    agregarAlCarrito(nombre, precio);
  });
});


/* ============================================================
   8. INICIALIZACIÓN
   
   Cuando la página carga, actualizamos la UI con los datos
   que podría haber en localStorage de una visita anterior.
   ============================================================ */
actualizarUI();

function finalizarCompra() {
  if (carrito.length === 0) return;

  const lineasProductos = carrito.map(function(item) {
    const subtotal = (item.precio * item.cantidad).toLocaleString('es-AR');
    return `• ${item.nombre} x${item.cantidad} — $${subtotal}`;
  });

  const totalPrecio = carrito.reduce(function(acum, item) {
    return acum + (item.precio * item.cantidad);
  }, 0);

  const mensaje =
    `¡Hola Homegrown! Quiero hacer el siguiente pedido:\n\n` +
    lineasProductos.join('\n') +
    `\n\n*Total: $${totalPrecio.toLocaleString('es-AR')}*\n\n` +
    `¿Cómo coordino el pago y el envío?`;

  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  actualizarUI();
}

carritoPanel.addEventListener('click', function(evento) {
  const btnFinalizar = evento.target.closest('.btn-finalizar');
  const btnVaciar    = evento.target.closest('.btn-vaciar');

  if (btnFinalizar) finalizarCompra();
  if (btnVaciar)    vaciarCarrito();
});
