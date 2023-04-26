`use strict`;

const nombreLista = document.querySelector(`.nombreLista`);
let nombreListaValue;
const botonCrearLista = document.querySelector(`.crearLista`);
const seleccionarLista = document.querySelector(`.listasDisponibles`);
const botonVerLista = document.querySelector(`.verLista`);
const contenedor = document.querySelector(`.contenedor`);
let tablaInterior = ``;
let IDBRequest;
let numero;
let ID;

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

const crearOpciones = ()=> {
    indexedDB.databases().then(databases => {
        databases.forEach(database => {
            seleccionarLista.innerHTML += `<option value="${database.name}">${database.name}</option>`;
        });
        }).catch(error => {
        console.error("Failed to retrieve IndexedDB databases:", error);
    });
};

crearOpciones();

botonVerLista.addEventListener("click", async ()=>{
    nombreListaValue = seleccionarLista.options[seleccionarLista.selectedIndex].value;
    await crearLista()
    leerObjetos();
});

const crearLista = ()=>{
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
            db.createObjectStore("notas", {
            autoIncrement: true,
            });
        });
    });
};

botonCrearLista.addEventListener("click",async()=>{
    nombreListaValue = nombreLista.value;
    await crearLista();
    leerObjetos();
    crearOpciones();
});

const getIDBData = (mode)=> {
    const db = IDBRequest.result;
    const IDBTransaction = db.transaction("notas",mode);
    const objectStore = IDBTransaction.objectStore("notas");
    return objectStore;
};

const addObjeto = objeto => {
    const IDBData = getIDBData("readwrite");
    let addRequest = IDBData.add(objeto);
    return new Promise ((resolve,reject)=>{
        addRequest.onsuccess = ()=>{
            numero = addRequest.result;
            resolve();
        };
        addRequest.onerror = ()=> {
            reject();
        }
    })
};

const modifyObjeto = (key,newValue) => {
    const IDBData = getIDBData("readwrite");
    // const request = IDBData.get(key);
    // request.onsuccess = function(event) {
    //     const data = event.target.result;
    //     data.calificaciones = newValue;
    //     IDBData.put(data);
    IDBData.put(key,newValue);
};

const deleteObjeto = (key) => {
    const IDBData = getIDBData("readwrite");
    IDBData.delete(key);
};

const leerObjetos = ()=>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    let tabla = creadorTabla();
    cursor.addEventListener("success",()=>{
        if(cursor.result) {
            let resultado = cursor.result.value;
            ID = cursor.result.key;
            let tableRow = document.createElement("tr");
            let tdNombre = document.createElement("td");
            tdNombre.textContent = `${resultado.nombre}`;
            let tdApellido = document.createElement("td");
            tdApellido.textContent = `${resultado.apellido}`;
            let tdNotas = document.createElement("td");
            tdNotas.setAttribute("contenteditable","true");
            tdNotas.textContent = `${resultado.calificaciones}`;
            let tdSuma = document.createElement("td");
            tdSuma.textContent = `${resultado.suma}`;
            let tdPromedio = document.createElement("td");
            tdPromedio.textContent = `${resultado.promedio}`;
            let tdBotones = document.createElement("td");
            let botonModificar = document.createElement("button");
            botonModificar.setAttribute("type","button");
            botonModificar.setAttribute("class","modificar imposible");
            botonModificar.setAttribute("value",`${ID}`);
            botonModificar.textContent = "Modificar";
            let botonEliminar = document.createElement("button");
            botonEliminar.setAttribute("type","button");
            botonEliminar.setAttribute("class","eliminar");
            botonEliminar.setAttribute("value",`${ID}`);
            botonEliminar.textContent = "Eliminar";
            tdBotones.appendChild(botonModificar);
            tdBotones.appendChild(botonEliminar);
            tableRow.appendChild(tdNombre);
            tableRow.appendChild(tdApellido);
            tableRow.appendChild(tdNotas);
            tableRow.appendChild(tdSuma);
            tableRow.appendChild(tdPromedio);
            tableRow.appendChild(tdBotones);
            tabla.appendChild(tableRow);

            tdNotas.addEventListener("keyup",()=>{
                botonModificar.classList.replace("imposible","posible");
            })

            botonModificar.addEventListener("click",()=>{
                if (botonModificar.className.includes("imposible") != true) {
                    console.log(parseInt(botonModificar.value));
                    console.log(tdNotas.textContent);
                    modifyObjeto(parseInt(botonModificar.value),tdNotas.textContent);
                    botonModificar.classList.replace("posible","imposible");
                }
            })

            botonEliminar.addEventListener("click",()=>{
                let confirmar = confirm(`¿Seguro que deseas eliminar este estudiante?`);
                if (confirmar) {
                    deleteObjeto(parseInt(botonEliminar.value));
                    tabla.removeChild(tableRow);
                }
            })
            

            cursor.result.continue();
        } else {
                contenedor.appendChild(creadorFragmento());
                contenedor.appendChild(tabla);
            };
    });
};

contenedor.addEventListener("click",async function (event){
    let confirmarEstudiante = event.target;
    let nombreEstudiante = document.querySelector(`.nombreEstudiante`).value;
    let apellidoEstudiante = document.querySelector(`.apellidoEstudiante`).value;
    let notasEstudiante = document.querySelector(`.notasEstudiante`).value.split(" ");
    let suma = 0;
    notasEstudiante.forEach(nota => {
        suma += parseFloat(nota);
    });
    let promedio = (suma / notasEstudiante.length).toFixed(2);
    let objetoEstudiante = {nombre: `${nombreEstudiante}`,apellido:`${apellidoEstudiante}`,calificaciones:`${notasEstudiante}`,suma:`${suma}`,promedio:`${promedio}`};
    if (confirmarEstudiante.matches(`.agregarEstudiante`)) {
            await addObjeto(objetoEstudiante);
            let tableRow = document.createElement("tr");
            let tdNombre = document.createElement("td");
            tdNombre.textContent = `${nombreEstudiante}`;
            let tdApellido = document.createElement("td");
            tdApellido.textContent = `${apellidoEstudiante}`;
            let tdNotas = document.createElement("td");
            tdNotas.setAttribute("contenteditable","true");
            tdNotas.textContent = `${notasEstudiante}`;
            let tdSuma = document.createElement("td");
            tdSuma.textContent = `${suma}`;
            let tdPromedio = document.createElement("td");
            tdPromedio.textContent = `${promedio}`;
            let tdBotones = document.createElement("td");
            let botonModificar = document.createElement("button");
            botonModificar.setAttribute("type","button");
            botonModificar.setAttribute("class","modificar imposible");
            botonModificar.setAttribute("value",`${numero}`);
            botonModificar.textContent = "Modificar";
            let botonEliminar = document.createElement("button");
            botonEliminar.setAttribute("type","button");
            botonEliminar.setAttribute("class","eliminar");
            botonEliminar.setAttribute("value",`${numero}`);
            botonEliminar.textContent = "Eliminar";
            tdBotones.appendChild(botonModificar);
            tdBotones.appendChild(botonEliminar);
            tableRow.appendChild(tdNombre);
            tableRow.appendChild(tdApellido);
            tableRow.appendChild(tdNotas);
            tableRow.appendChild(tdSuma);
            tableRow.appendChild(tdPromedio);
            tableRow.appendChild(tdBotones);
            document.querySelector(`.tabla`).appendChild(tableRow);

            tdNotas.addEventListener("keyup",()=>{
                botonModificar.classList.replace("imposible","posible");
            })

            botonModificar.addEventListener("click",()=>{
                if (botonModificar.className.includes("imposible") != true) {
                    modifyObjeto({calificaciones: tdNotas.textContent},parseInt(numero));
                    botonModificar.classList.replace("posible","imposible");
                }
            })

            botonEliminar.addEventListener("click",()=>{
                let confirmar = confirm(`¿Seguro que deseas eliminar este estudiante?`);
                if (confirmar) {
                    deleteObjeto(parseInt(botonEliminar.value));
                    document.querySelector(`.tabla`).removeChild(tableRow);
                }
            })
    };
});