(function() {
    const lat = -12.0593143;
    const lng = -77.0435163;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);

    let markers = new L.FeatureGroup().addTo(mapa)

    let propiedades = [];

    // Filtro
    const filtros = {
        categoria: '',
        precio: '',
        estado: ''
    }

    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');
    const estadoSelect = document.querySelector('#estados');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa)

    // Filtrado categoria ,precio y estado
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value
        filtrePropiedades();
    })

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value
        filtrePropiedades();
    })

    preciosSelect.addEventListener('change', e => {
        filtros.estado = +e.target.value
        filtrePropiedades();
    })

    const getPropiedades = async () => {
        try {
            const url = '/api/propiedades'
            const respuesta = await fetch(url)
            propiedades = await respuesta.json()
            
            showPropiedades(propiedades)
        } catch (error) {
            console.log(error)
        }
    }

    const showPropiedades = propiedades => {

        //Limpiar markers
        markers.clearLayers()

        propiedades.forEach(propiedad => {
            // Agregar los pines

            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-cyan-600 font-bold">${propiedad.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-3">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad.imagen}" alt="Imagen de la propiedad {propiedad.titulo}">
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-cyan-600 block p-2 text-center font-bold uppercas">Ver Propiedad</a>
                `)

            markers.addLayer(marker)
        });
    }

    // Metodo Chaining para filtrado avanzado
    const filtrePropiedades = () => {
        const result = propiedades.filter(filtreByCategory).filter(filtreByPrice)
        showPropiedades(result)
    }

    const filtreByCategory = (propiedad) => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad
    const filtreByPrice = (propiedad) => filtros.precio ? propiedad.precioId === filtros.precio : propiedad


    getPropiedades()
})()