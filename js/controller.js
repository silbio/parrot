
    let pollingActive = false;
    let pollingInterval;
    let numberOfRows = 0;
    let provincesSelectTemplate = '<select><option selected="selected" value="">Seleccionar ...</option><option value="/icpplus/citar?p=15">A Coruña</option><option value="/icpplus/citar?p=2">Albacete</option><option value="/icpco/citar?p=3">Alicante</option><option value="/icpplus/citar?p=4">Almería</option><option value="/icpplus/citar?p=1">Araba</option><option value="/icpplus/citar?p=33">Asturias</option><option value="/icpplus/citar?p=5">Ávila</option><option value="/icpplus/citar?p=6">Badajoz</option><option value="/icpplustie/citar?p=8">Barcelona</option><option value="/icpplus/citar?p=48">Bizkaia</option><option value="/icpplus/citar?p=9">Burgos</option><option value="/icpplus/citar?p=10">Cáceres</option><option value="/icpplus/citar?p=11">Cádiz</option><option value="/icpplus/citar?p=39">Cantabria</option><option value="/icpplus/citar?p=12">Castellón</option><option value="/icpplus/citar?p=51">Ceuta</option><option value="/icpplus/citar?p=13">Ciudad Real</option><option value="/icpplus/citar?p=14">Córdoba</option><option value="/icpplus/citar?p=16">Cuenca</option><option value="/icpplus/citar?p=20">Gipuzkoa</option><option value="/icpplus/citar?p=17">Girona</option><option value="/icpplus/citar?p=18">Granada</option><option value="/icpplus/citar?p=19">Guadalajara</option><option value="/icpplus/citar?p=21">Huelva</option><option value="/icpplus/citar?p=22">Huesca</option><option value="/icpco/citar?p=7">Illes Balears</option><option value="/icpplus/citar?p=23">Jaén</option><option value="/icpplus/citar?p=26">La Rioja</option><option value="/icpco/citar?p=35">Las Palmas</option><option value="/icpplus/citar?p=24">León</option><option value="/icpplus/citar?p=25">Lleida</option><option value="/icpplus/citar?p=27">Lugo</option><option value="/icpplustiem/citar?p=28">Madrid</option><option value="/icpco/citar?p=29">Málaga</option><option value="/icpplus/citar?p=52">Melilla</option><option value="/icpplus/citar?p=30">Murcia</option><option value="/icpplus/citar?p=31">Navarra</option><option value="/icpplus/citar?p=32">Orense</option><option value="/icpplus/citar?p=34">Palencia</option><option value="/icpplus/citar?p=36">Pontevedra</option><option value="/icpplus/citar?p=37">Salamanca</option><option value="/icpco/citar?p=38">S.Cruz Tenerife</option><option value="/icpplus/citar?p=40">Segovia</option><option value="/icpplus/citar?p=41">Sevilla</option><option value="/icpplus/citar?p=42">Soria</option><option value="/icpplus/citar?p=43">Tarragona</option><option value="/icpplus/citar?p=44">Teruel</option><option value="/icpplus/citar?p=45">Toledo</option><option value="/icpplus/citar?p=46">Valencia</option><option value="/icpplus/citar?p=47">Valladolid</option><option value="/icpplus/citar?p=49">Zamora</option><option value="/icpplus/citar?p=50">Zaragoza</option></select>';
    populateWelcomeMessage();
    populateTableRow();

    function populateWelcomeMessage() {
    connect(window.location.origin + "/user").then(function (response) {
        const user = JSON.parse(response).user;
        document.getElementById("welcome-message").innerText = `Bienvenido ${user.username}!!`;
    }).catch(function (err) {
        console.error(err);
    })


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

    function populateProcedureSelect(provinceCode, rowId) {
    let procedureCell = document.querySelector('#' + rowId + ' td:nth-child(2)');
    procedureCell.innerText = 'Obteniendo Datos'
    connect(window.location.origin + `/getProcedures?province=${provinceCode}&rowId=${rowId}`).then((select) => {
    select = JSON.parse(select).options;
    procedureCell.innerHTML = select;
    procedureCell.firstElementChild.addEventListener('change', function (e) {
    document.querySelector('#' + rowId + ' td:nth-child(1) select').disabled = true;
    document.querySelector('#' + rowId + ' td:nth-child(2) select').disabled = true;
    document.querySelector('#' + rowId + ' td:nth-child(3)').innerText = 'Inicializando';
    document.querySelector('#' + rowId + ' td:nth-child(4) button').disabled = false;
    document.querySelector('#' + rowId + ' td:nth-child(5) button').disabled = false;
    connect(window.location.origin + `/iterate?province=${provinceCode}&procedure=${e.target.value}&rowId=${rowId}`).then(() => {
    if (!pollingActive) {
    pollingActive = true;
    startPolling();
}
});

});
});
}

    function removeTableRow(ele) {

    connect(window.location.origin + '/stopIteration?rowId=' + ele.id).then(() => {
        if (ele.parentElement.getElementsByTagName('tr').length === 1) {
            clearInterval(pollingInterval);
            pollingActive = false;
        }
        ele.parentElement.removeChild(ele);
    })

}

    function startPolling() {
    pollingInterval = setInterval(() => {
        if (pollingActive) {
            connect(window.location.origin + `/pollStatus`).then((status) => {
                let rowStatus = JSON.parse(status);

                if (Object.keys(rowStatus).length === 0) {
                    clearInterval(pollingInterval);
                    pollingActive = false;
                }
                for (let rowId in rowStatus) {
                    if (rowStatus.hasOwnProperty(rowId)) {
                        let statusMsg = rowStatus[rowId] ? rowStatus[rowId] : 'En proceso';
                        let statusColor = rowStatus[rowId] ? 'green' : 'red'
                        let targetCell = document.querySelector('#' + rowId + ' td:nth-child(3)');
                        targetCell.innerText = statusMsg;
                        targetCell.style.background = statusColor;
                        if (rowStatus[rowId]) {
                            connect(window.location.origin + `/iterate?province=${provinceCode}&procedure=${e.target.value}&rowId=${rowId}`).then(() => {
                                if (!pollingActive) {
                                    pollingActive = true;
                                    startPolling();
                                }
                            });
                        }
                    }
                }
            });
        }
    }, 5000)

}

    function connect(url) {
    return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
    if (req.readyState === 4 && req.status === 200) {
    resolve(req.response);
}
};
    req.onerror = function (err) {
    reject(err);
}
    req.open("GET", url, true);
    req.send();
})
}

