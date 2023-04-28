`use strict`;

const nombreLista = document.querySelector(`.nombreLista`);
let nombreListaValue;
const botonCrearLista = document.querySelector(`.crearLista`);
const seleccionarLista = document.querySelector(`.listasDisponibles`);
const botonVerLista = document.querySelector(`.verLista`);
const contenedor = document.querySelector(`.contenedor`);
const tablaContenedor = document.querySelector(`.tablaContenedor`);
let IDBRequest;
let numero;
let llave;
let table;

const crearOpciones = ()=> {
    seleccionarLista.innerHTML = `<option selected disabled hidden> Seleccioná la lista que deseás ver</option>`;
    indexedDB.databases().then(databases => {
        databases.forEach(database => {
            seleccionarLista.innerHTML += `<option value="${database.name}">${database.name}</option>`;
        });
        }).catch(error => {
        console.error("Failed to retrieve IndexedDB databases:", error);
    });
};
crearOpciones();

const creadorFragmento = ()=>{
    let container = document.createElement("div");
    let h2 = document.createElement("h2");
    h2.textContent = `${nombreListaValue}`;    
    let form = document.createElement("form");
    form.classList.add("formularioEstudiante");
    let nombreEstudiante = document.createElement("input");
    nombreEstudiante.setAttribute("type","text");
    nombreEstudiante.setAttribute("value","");
    nombreEstudiante.setAttribute("class","nombreEstudiante");
    nombreEstudiante.setAttribute("placeholder","Ingrese nombre del estudiante.");
    let apellidoEstudiante = document.createElement("input");
    apellidoEstudiante.setAttribute("type","text");
    apellidoEstudiante.setAttribute("value","");
    apellidoEstudiante.setAttribute("class","apellidoEstudiante");
    apellidoEstudiante.setAttribute("placeholder","Ingrese apellido del estudiante.");
    let notasEstudiante = document.createElement("input");
    notasEstudiante.setAttribute("type","text");
    notasEstudiante.setAttribute("value","");
    notasEstudiante.setAttribute("class","notasEstudiante");
    notasEstudiante.setAttribute("placeholder","Ingrese notas del estudiante.");
    let agregarEstudiante = document.createElement("button");
    agregarEstudiante.setAttribute("type","button");
    agregarEstudiante.setAttribute("class","agregarEstudiante");
    agregarEstudiante.textContent = "Agregar estudiante";
    form.appendChild(nombreEstudiante);
    form.appendChild(apellidoEstudiante);
    form.appendChild(notasEstudiante);
    form.appendChild(agregarEstudiante);
    container.appendChild(h2);
    container.appendChild(form);

    agregarEstudiante.addEventListener("click", async ()=>{
        let nombreValue = nombreEstudiante.value;
        let apellidoValue = apellidoEstudiante.value;
        let notasValue = notasEstudiante.value.split(" ");
        let sumaValue = 0;
        notasValue.forEach(nota => {
            sumaValue += parseFloat(nota);
        });
        let promedioValue = (sumaValue / notasValue.length).toFixed(2);
        let objetoEstudiante = {nombre: nombreValue,apellido:apellidoValue,calificaciones:notasValue,suma:sumaValue,promedio:promedioValue};
        if (nombreValue == "" || apellidoValue == "") {
            alert(`Por favor, ingrese el nombre y el apellido del estudiante.`);
        } else {
            await addObjeto(objetoEstudiante);
            let nuevaFila = creadorFila(nombreValue,apellidoValue,notasValue,sumaValue,promedioValue,llave);
            table.appendChild(nuevaFila);
            nombreEstudiante.value= ``;
            apellidoEstudiante.value = ``;
            notasEstudiante.value = ``;
        };
    });
    return container;
};

const creadorTabla = ()=> {
    let tabla = document.createElement("table");
    tabla.setAttribute("class","tabla");
    let tablaHead = document.createElement("tr");
    let thNombre = document.createElement("th");
    thNombre.textContent = "Nombre";
    let thApellido = document.createElement("th");
    thApellido.textContent = "Apellido";
    let thNotas = document.createElement("th");
    thNotas.textContent = "Notas";
    let thSuma = document.createElement("th");
    thSuma.textContent = "Suma";
    let thPromedio = document.createElement("th");
    thPromedio.textContent = "Promedio";
    let thBotones = document.createElement("th");
    thBotones.textContent = "";
    tablaHead.appendChild(thNombre);
    tablaHead.appendChild(thApellido);
    tablaHead.appendChild(thNotas);
    tablaHead.appendChild(thSuma);
    tablaHead.appendChild(thPromedio);
    tablaHead.appendChild(thBotones);
    tabla.appendChild(tablaHead);
    return tabla;
}

const creadorFila = (nombre,apellido,calificaciones,suma,promedio,llave)=> {
    let tr = document.createElement("tr");
    let tdNombre = document.createElement("td");
    tdNombre.textContent = nombre;
    let tdApellido = document.createElement("td");
    tdApellido.textContent = apellido;
    let tdNotas = document.createElement("td");
    tdNotas.setAttribute("contenteditable","true");
    tdNotas.textContent = calificaciones;
    let tdSuma = document.createElement("td");
    tdSuma.textContent = suma;
    let tdPromedio = document.createElement("td");
    tdPromedio.textContent = promedio;
    let botonModificar = document.createElement("button");
    let tdBotones = document.createElement("td");
    botonModificar.setAttribute("type","button");
    botonModificar.setAttribute("class","modificar imposible");
    botonModificar.setAttribute("value",`${llave}`);
    botonModificar.textContent = "Modificar";
    let botonEliminar = document.createElement("button");
    botonEliminar.setAttribute("type","button");
    botonEliminar.setAttribute("class","eliminar");
    botonEliminar.setAttribute("value",`${llave}`);
    botonEliminar.textContent = "Eliminar";
    tdBotones.appendChild(botonModificar);
    tdBotones.appendChild(botonEliminar);
    tr.appendChild(tdNombre);
    tr.appendChild(tdApellido);
    tr.appendChild(tdNotas);
    tr.appendChild(tdSuma);
    tr.appendChild(tdPromedio);
    tr.appendChild(tdBotones);

    tdNotas.addEventListener("keyup",()=>{
        botonModificar.classList.replace("imposible","posible");
    });

    botonModificar.addEventListener("click",async ()=>{
        if (botonModificar.className.includes("imposible") != true) {
            let key = parseInt(botonModificar.value);
            let newValue = tdNotas.textContent.split(",");
            let nuevaFila = await modifyObjeto(key,newValue);
            tr.parentNode.replaceChild(nuevaFila, tr);
            botonModificar.classList.replace("posible","imposible");
        };
    });

    botonEliminar.addEventListener("click",()=>{
        let confirmar = confirm(`¿Seguro que deseas eliminar este estudiante?`);
        if (confirmar) {
            deleteObjeto(parseInt(botonEliminar.value));
            tr.parentNode.removeChild(tr);
        };
    });

    return tr;
};

const opcionesTabla = ()=> {
    let div = document.createElement("div");
    div.setAttribute("class","opcionesTabla");
    let eliminarTabla = document.createElement("button");
    eliminarTabla.setAttribute("type","button")
    eliminarTabla.setAttribute("value",`${nombreListaValue}`);
    eliminarTabla.innerText = `ELIMINAR TABLA`;
    eliminarTabla.addEventListener("click",()=>{
        let confirmar = confirm(`¿Está seguro que desea eliminar esta base de datos?`);
        if (confirmar) {
            let nuevoConfirmar = confirm(`Êsta acción es irreversible y se perderán todos los datos, ¿está seguro que desea continuar?`);
            if (nuevoConfirmar) {
                window.indexedDB.deleteDatabase(nombreListaValue);
                contenedor.innerHTML = ``;
                alert(`La base de datos ${nombreListaValue} ha sido eliminada satisfactoriamente`);
                location.reload();
            };
        };
    });
    div.appendChild(eliminarTabla);
    return div;
};

botonVerLista.addEventListener("click", async ()=>{
    nombreListaValue = seleccionarLista.options[seleccionarLista.selectedIndex].value;
    if (nombreListaValue != "Seleccioná la lista que deseás ver"){
            await abrirLista();
            leerObjetos();
    } else {
        alert(`Elija una tabla de las opciones. Si no hay ninguna, por favor primero cree una.`);
    }
});

botonCrearLista.addEventListener("click",async()=>{
    nombreListaValue = nombreLista.value;
    if (nombreListaValue == "Ingresa aquí el nombre de la lista que quieres crear" || nombreListaValue == "") {
        alert(`Por favor, ingrese un nombre para su tabla.`);
    } else {
        await abrirLista();
        leerObjetos();
        crearOpciones();
    }
});

const abrirLista = ()=>{
    return new Promise((resolve, reject) => {
        IDBRequest = window.indexedDB.open(`${nombreListaValue}`, 1);
        IDBRequest.addEventListener("success",()=> {
            resolve();
        });
        IDBRequest.addEventListener("error", ()=>{
            reject();
        });
        IDBRequest.addEventListener("upgradeneeded", () => {
            const db = IDBRequest.result;
            const notasStore = db.createObjectStore("notas", {
                keyPath: "id",
                autoIncrement: true
            });
            notasStore.createIndex("tituloIndex", "titulo", { unique: false });
        });
    });
};

const getIDBData = (mode)=> {
    const db = IDBRequest.result;
    const IDBTransaction = db.transaction("notas",mode);
    const objectStore = IDBTransaction.objectStore("notas");
    return objectStore;
};

const leerObjetos = ()=>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    table = creadorTabla();
    cursor.addEventListener("success",()=>{
        if(cursor.result) {
            let resultado = cursor.result.value;
            llave = cursor.result.key;
            let nuevaFila = creadorFila(resultado.nombre,resultado.apellido,resultado.calificaciones,resultado.suma,resultado.promedio,llave);
            table.appendChild(nuevaFila);
            cursor.result.continue();
        } else {
                contenedor.innerHTML = ``;
                tablaContenedor.innerHTML = ``;
                contenedor.appendChild(creadorFragmento());
                tablaContenedor.appendChild(table);
                tablaContenedor.appendChild(opcionesTabla());
            };
    });
};

const addObjeto = objeto => {
    const IDBData = getIDBData("readwrite");
    let addRequest = IDBData.add(objeto);
    return new Promise ((resolve,reject)=>{
        addRequest.onsuccess = ()=>{
            numero = addRequest.result;
            llave = numero;
            resolve();
        };
        addRequest.onerror = ()=> {
            reject();
        }
    })
};

const modifyObjeto = (key, newValue) => {
    const IDBData = getIDBData("readwrite");
    const request = IDBData.get(key);
    let suma = 0;
    newValue.forEach(nota => {
        suma += parseInt(nota)
    });
    let promedio = (suma / newValue.length).toFixed(2);
    return new Promise ((resolve,reject)=>{
        request.onsuccess = function (event) {
            const data = event.target.result;
            data.calificaciones = newValue;
            data.suma = suma;
            data.promedio = promedio;
            IDBData.put(data);
            let nuevaFila = creadorFila(data.nombre,data.apellido,data.calificaciones,data.suma,data.promedio,key);
            resolve(nuevaFila);
        };
        request.onerror = ()=> {
            reject();
        }
    })
    
};

const deleteObjeto = (key) => {
    const IDBData = getIDBData("readwrite");
    IDBData.delete(key);
};

// PARA PODER MODIFICAR UN OBJETO TUVE QUE CREAR UN PATH AL ID AL MISMO TIEMPO QUE SE CREA LA BASE DE DATOS.
// UNA VEZ HECHO ESTO, SE PUEDE LLAMAR AL OBJETO POR SU KEY Y PEDIRLE QUE LO MODIFIQUE EN VEZ DE CREAR UNO NUEVO.
// LA CREACIÓN DE HTML DE MANERA DINÁMICA DESDE JS NOS PERMITE COLOCARLE EVENTLISTENERS POR NOMBRE A CADA UNO A MEDIDA QUE SE CREAN.
// DE ESTA MANERA, NO HACE FALTA DIFERENCIAR CADA UNO POR ID O VALUE Y SE FACILITA MUCHÍSIMO EL CÓDIGO.
// LA UTILIZACIÓN DE PROMESAS JUNTO A ASYNC/AWAIT NOS PERMITE CREAR CREAR OBJETOS PARA INSERTAR EN EL HTML ESPERANDO EL TIEMPO NECESARIO PARA COMUNICARSE CON LA DB.
// PARA DEVOLVER UN OBJETO HTML, DEBEMOS CREAR UNA VARIABLE QUE SEA IGUAL A LA FUNCIÓN QUE NOS RETORNA EL OBJETO DESEADO Y LUEGO LLAMAR A LA VARIABLE DENTRO DEL RETURN(VARIABLE).