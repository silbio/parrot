let activePolls = {};
let pollingInterval = 5000;
let numberOfRows = 0;

let provincesSelectTemplate = '<select><option selected="selected" value="">Seleccionar ...</option><option value="/icpplus/citar?p=15">A Coruña</option><option value="/icpplus/citar?p=2">Albacete</option><option value="/icpco/citar?p=3">Alicante</option><option value="/icpplus/citar?p=4">Almería</option><option value="/icpplus/citar?p=1">Araba</option><option value="/icpplus/citar?p=33">Asturias</option><option value="/icpplus/citar?p=5">Ávila</option><option value="/icpplus/citar?p=6">Badajoz</option><option value="/icpplustie/citar?p=8">Barcelona</option><option value="/icpplus/citar?p=48">Bizkaia</option><option value="/icpplus/citar?p=9">Burgos</option><option value="/icpplus/citar?p=10">Cáceres</option><option value="/icpplus/citar?p=11">Cádiz</option><option value="/icpplus/citar?p=39">Cantabria</option><option value="/icpplus/citar?p=12">Castellón</option><option value="/icpplus/citar?p=51">Ceuta</option><option value="/icpplus/citar?p=13">Ciudad Real</option><option value="/icpplus/citar?p=14">Córdoba</option><option value="/icpplus/citar?p=16">Cuenca</option><option value="/icpplus/citar?p=20">Gipuzkoa</option><option value="/icpplus/citar?p=17">Girona</option><option value="/icpplus/citar?p=18">Granada</option><option value="/icpplus/citar?p=19">Guadalajara</option><option value="/icpplus/citar?p=21">Huelva</option><option value="/icpplus/citar?p=22">Huesca</option><option value="/icpco/citar?p=7">Illes Balears</option><option value="/icpplus/citar?p=23">Jaén</option><option value="/icpplus/citar?p=26">La Rioja</option><option value="/icpco/citar?p=35">Las Palmas</option><option value="/icpplus/citar?p=24">León</option><option value="/icpplus/citar?p=25">Lleida</option><option value="/icpplus/citar?p=27">Lugo</option><option value="/icpplustiem/citar?p=28">Madrid</option><option value="/icpco/citar?p=29">Málaga</option><option value="/icpplus/citar?p=52">Melilla</option><option value="/icpplus/citar?p=30">Murcia</option><option value="/icpplus/citar?p=31">Navarra</option><option value="/icpplus/citar?p=32">Orense</option><option value="/icpplus/citar?p=34">Palencia</option><option value="/icpplus/citar?p=36">Pontevedra</option><option value="/icpplus/citar?p=37">Salamanca</option><option value="/icpco/citar?p=38">S.Cruz Tenerife</option><option value="/icpplus/citar?p=40">Segovia</option><option value="/icpplus/citar?p=41">Sevilla</option><option value="/icpplus/citar?p=42">Soria</option><option value="/icpplus/citar?p=43">Tarragona</option><option value="/icpplus/citar?p=44">Teruel</option><option value="/icpplus/citar?p=45">Toledo</option><option value="/icpplus/citar?p=46">Valencia</option><option value="/icpplus/citar?p=47">Valladolid</option><option value="/icpplus/citar?p=49">Zamora</option><option value="/icpplus/citar?p=50">Zaragoza</option></select>';
const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");



populateWelcomeMessage();
populateTableRow();
startPolling();


function removeTableRow(ele) {
    numberOfRows--;
    delete activePolls[ele.id];
    if (ele.parentElement.getElementsByTagName('tr').length === 1) {
        ele.parentElement.removeChild(ele);
        populateTableRow();
    } else {
        ele.parentElement.removeChild(ele);
    }


}

function populateTableRow() {
    let statsTableBody = document.getElementById('statsTableBody');
    let newRow = document.createElement('tr');
    newRow.id = 'row' + numberOfRows;
    numberOfRows++;
    for (let i = 0; i < 5; i++) {
        let newCell = document.createElement('td');
        if (i === 0) {
            newCell.innerHTML = provincesSelectTemplate;
            newCell.firstElementChild.addEventListener('change', (e) => {
                populateProcedureSelect(e.target.value, newRow.id);
            })
        }
        if (i < 3) {
            newCell.classList.add('large');
        } else {
            newCell.classList.add('small');
            newCell.innerHTML = '<button disabled>' + (i === 3 ? '+' : '-') + '</button>'
            newCell.addEventListener('click', function () {
                i === 3 ? populateTableRow() : removeTableRow(newRow);
            })

        }
        newRow.append(newCell);
    }
    statsTableBody.append(newRow);
}

function populateWelcomeMessage() {
    connect(window.location.origin + "/user", null).then(function (response) {
        document.getElementById("welcome-message").innerText = `Usuario ${response}`;
    }).catch(function (err) {
        console.error(err);
    })


}

function populateProcedureSelect(provincePath, rowId) {
    let procedureCell = document.querySelector('#' + rowId + ' td:nth-child(2)');
    procedureCell.innerText = 'Obteniendo Datos';
    connect(window.location.origin + '/getProcedures', JSON.stringify({
        "province": provincePath,
        "rowId": rowId
    })
).then((procedureOptions) => {

        procedureCell.innerHTML = procedureOptions;
        procedureCell.firstElementChild.addEventListener('change', function (e) {
           if(e.target.value > -1) {
                document.querySelector('#' + rowId + ' td:nth-child(1) select').disabled = true;
                document.querySelector('#' + rowId + ' td:nth-child(2) select').disabled = true;
                document.querySelector('#' + rowId + ' td:nth-child(3)').innerText = 'Inicializando';
                document.querySelector('#' + rowId + ' td:nth-child(4) button').disabled = rowId === "row4";
                document.querySelector('#' + rowId + ' td:nth-child(5) button').disabled = false;
                activePolls[rowId] = {provincePath: provincePath, procedureCode: e.target.value}
            }
        });
    });
}


function startPolling() {
    setInterval(() => {
        if (Object.keys(activePolls).length > 0) {
            connect(window.location.origin + `/pollStatus`, JSON.stringify(activePolls)).then((status) => {
                updateDashboard(JSON.parse(status));
            });
        }
        else {
            console.log('No rows to poll.')
        }
    }, pollingInterval)
}

function updateDashboard(rowStatus) {

    for (let rowId in rowStatus) {
        if (rowStatus.hasOwnProperty(rowId)) {

            let areThereOffices = rowStatus[rowId].offices.length > 0;
            let statusMsg = areThereOffices ? rowStatus[rowId].offices : 'Buscando...';
            let statusColor = areThereOffices ? 'green' : 'red'
            let targetCell = document.querySelector('#' + rowId + ' td:nth-child(3)');
            targetCell.innerText = statusMsg;
            targetCell.style.background = statusColor;
            if(areThereOffices){
                snd.play();
            }
        }
    }
}

function connect(url, body) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        const method = body === null ? "GET" : "POST";
        xhr.open(method, url, true);

//Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                resolve(xhr.response);
            }
        }
        xhr.onerror = function (err) {
            reject(err);
        }
        xhr.send(body);
    })
}

