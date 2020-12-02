let activePolls = {};
let pollingInterval = 5000;
let numberOfRows = 0;

let provincesSelectTemplate = '<select><option selected="selected" value="">Seleccionar ...</option><option value="/icpplus/citar?p=15">A Coruña</option><option value="/icpplus/citar?p=2">Albacete</option><option value="/icpco/citar?p=3">Alicante</option><option value="/icpplus/citar?p=4">Almería</option><option value="/icpplus/citar?p=1">Araba</option><option value="/icpplus/citar?p=33">Asturias</option><option value="/icpplus/citar?p=5">Ávila</option><option value="/icpplus/citar?p=6">Badajoz</option><option value="/icpplustie/citar?p=8">Barcelona</option><option value="/icpplus/citar?p=48">Bizkaia</option><option value="/icpplus/citar?p=9">Burgos</option><option value="/icpplus/citar?p=10">Cáceres</option><option value="/icpplus/citar?p=11">Cádiz</option><option value="/icpplus/citar?p=39">Cantabria</option><option value="/icpplus/citar?p=12">Castellón</option><option value="/icpplus/citar?p=51">Ceuta</option><option value="/icpplus/citar?p=13">Ciudad Real</option><option value="/icpplus/citar?p=14">Córdoba</option><option value="/icpplus/citar?p=16">Cuenca</option><option value="/icpplus/citar?p=20">Gipuzkoa</option><option value="/icpplus/citar?p=17">Girona</option><option value="/icpplus/citar?p=18">Granada</option><option value="/icpplus/citar?p=19">Guadalajara</option><option value="/icpplus/citar?p=21">Huelva</option><option value="/icpplus/citar?p=22">Huesca</option><option value="/icpco/citar?p=7">Illes Balears</option><option value="/icpplus/citar?p=23">Jaén</option><option value="/icpplus/citar?p=26">La Rioja</option><option value="/icpco/citar?p=35">Las Palmas</option><option value="/icpplus/citar?p=24">León</option><option value="/icpplus/citar?p=25">Lleida</option><option value="/icpplus/citar?p=27">Lugo</option><option value="/icpplustiem/citar?p=28">Madrid</option><option value="/icpco/citar?p=29">Málaga</option><option value="/icpplus/citar?p=52">Melilla</option><option value="/icpplus/citar?p=30">Murcia</option><option value="/icpplus/citar?p=31">Navarra</option><option value="/icpplus/citar?p=32">Orense</option><option value="/icpplus/citar?p=34">Palencia</option><option value="/icpplus/citar?p=36">Pontevedra</option><option value="/icpplus/citar?p=37">Salamanca</option><option value="/icpco/citar?p=38">S.Cruz Tenerife</option><option value="/icpplus/citar?p=40">Segovia</option><option value="/icpplus/citar?p=41">Sevilla</option><option value="/icpplus/citar?p=42">Soria</option><option value="/icpplus/citar?p=43">Tarragona</option><option value="/icpplus/citar?p=44">Teruel</option><option value="/icpplus/citar?p=45">Toledo</option><option value="/icpplus/citar?p=46">Valencia</option><option value="/icpplus/citar?p=47">Valladolid</option><option value="/icpplus/citar?p=49">Zamora</option><option value="/icpplus/citar?p=50">Zaragoza</option></select>';
const snd = new Audio("data:audio/mpeg;base64,SUQzAwAAAAAPGVRTU0UAAAALAAAATEFNRSB2My45N0NPTU0AAAd6AAAAWFhYAHByb2NfdG0gPSAiMC4yMzgiOwpkYl90bSA9ICIwIjsKcV90bSA9ICIwIjsKYXVkaW9fZHVyYXRpb24gPSAiMi4zODAiOwpkYXRlID0gIjIwMjAxMTI0XzA3OjQ2OjI3LjE5MyI7Cmhvc3QgPSAiQVBTLTIwIjsKa2JwcyA9ICI0OCI7CmtoeiA9ICIyMjA1MCI7CmxpcF9zdHJpbmcgPSAiZjA9MCZmMT0wJmYyPTEzJmYzPTYmZjQ9NSZmNT05JmY2PTEzJmY3PTkmZjg9MTEmZjk9MyZmMTA9MSZmMTE9MTImZjEyPTkmZjEzPTAmZjE0PTAmZjE1PTAmZjE2PTAmZjE3PTcmZjE4PTgmZjE5PTgmZjIwPTQmZjIxPTQmZjIyPTEyJmYyMz01JmYyND0wJmYyNT0wJmYyNj0wJmYyNz0wJmYyOD0wJmYyOT0wJm5vZnVkZ2U9MSZsaXB2ZXJzaW9uPTImb2s9MSI7CnRpbWVkX3Bob25lbWVzID0gIlAsMCw4Niw2Myx4CVAsODYsMTE2LDcxLEQJUCwxMTYsMTY2LDgxLEUJUCwxNjYsMjI2LDY0LGQJUCwyMjYsMjc2LDg4LF4JUCwyNzYsMzY2LDY1LHMJUCwzNjYsNDI2LDc3LEUJUCw0MjYsNTA2LDY1LHoJUCw1MDYsNTQ2LDU5LGQJUCw1NDYsNTk2LDg2LFIJUCw1OTYsNjY2LDgzLG0JUCw2NjYsNzA2LDc4LEUJUCw3MDYsNzk2LDczLFUJUCw3OTYsODY2LDc2LGwJUCw4NjYsOTc2LDY0LHMJUCw5NzYsMTAxNiwxMSx0CVAsMTAxNiwxMzQ2LDAseAlQLDEzNDYsMTM4NiwyOSx0CVAsMTM4NiwxNDM2LDgxLG4JUCwxNDM2LDE1MjYsOTIsVwlQLDE1MjYsMTU1Niw4MCwhCVAsMTU1NiwxNjM2LDcyLHUJUCwxNjM2LDE2NzYsNjgsRwlQLDE2NzYsMTc3Niw4OCxjCVAsMTc3NiwxODg2LDc3LGwJUCwxODg2LDE5NDYsODIsSQlQLDE5NDYsMTk3Niw3MCxuCVAsMTk3NiwyMDE2LDcseAlQLDIwMTYsMjM1NiwwLHgiOwp0ZXh0ID0gIkNpdGFzIGRpc3BvbmlibGVzLiChRGFsZSBjYfFhISAiOwoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCgr/82DEAB2jWlgtQxgADCIAMDfRBCI7u7u7uhfEAABPru7u6Ju7v+7u4G77noiFuiIiIiI7u7/uiIiIif//Ed3f+uAACf/u7u7no78RE//iIiO7gYt3/iIhddERERER3dz/0TcOBgYt0RE9EAHd3d3cDAAAAAAAARwIfE4Pg+CAIBiCYfWAZDMYDIYDAZDAYDAUA4U/LQVuhhdy06//82LEGCTLXupfjWkDhyxUEn/DmDWJXvwrRGxKxz/6BOIYngrf+FXHcXywZiaG+r1f5KD+IwiQzw7wWsFt///C7iVl8tLSQHANgtyaE7ACIE8////0wLgEgF4EkB2DIHIIQOYAbYAT4ArgrgJIDY/////wDfEWMgCTHuXRhxMxOy+aMOMc7n3iKkoifwAKAhT1SETpQCbUGoptqhcu//NixBQiS7aWDcMwAd5ynRj3iqx8bXLxn/+ff9/yUZNftr5NvdtG1cHTB7tZ4hH2u3dePTGHdCXibVMYZlf7O13/tv/H+p7RBHH6GUlfOSx4S2qy8+XswifcFAEcabSB0PT72wiUspeRC6jbzoy9MjpRbZb/+Pv+f9/ylNxRPlOv/VU/k4YADyglEIUosOVAzfl4wnDpiXMpyZISyP/zYsQaI/uWlZIZk8k1JCc2V2NDt65YZlOiW4dGcSTExuUNlETB7Xgi38ljDHtFGYZUzsNKUK+nTqLTuxchzQ5MIFDOBoJGJp92xkNuPl588ZknE5RlMsA0H4swjnNi2dJ/CoycXuovbuGo9moxrbcWOvN8oZD3ToFdh1TkBxAdKAP0SSOiacIBJ1ExXJkae1DlmLIr5D8y6vhl2q3/82DEGiIjrqJTQ0AA7cmqeLmo6+L64trvvuEiTrK0RE/6ibo1nj5i6mYlZ0dttu6bi7GxMt91bmEC5oZGElDOZ4+h/3XPDcpZFqRMSERRAudRRweqMEyKlFA0LNtblC5x2xqGSgnJy0D5IGnGD6kd3EzSpSGG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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYMT/AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYsT/AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82LE/wAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NgxP8AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTdVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NixP8AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYsT/AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82LE/wAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NgxP8AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTdVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NixP8AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYsT/AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82LE/wAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NgxP8AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTdVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NixP8AAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zYsT/AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45N1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82LE/wAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
//TODO => Add mute and unmute buttons to each row so that it can be silenced.

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
        switch (i) {
            case 0:
                newCell.innerHTML = provincesSelectTemplate;
                newCell.firstElementChild.addEventListener('change', (e) => {
                    populateProcedureSelect(e.target.value, newRow.id);
                });
                newCell.classList.add('medium');
                break;
            case 1:
                newCell.classList.add('large');
                break;
            case 2:
                newCell.classList.add('medium');
                break;
            case 3:
                newCell.classList.add('small');
                newCell.innerHTML = '<button disabled>' + '+' + '</button>'
                newCell.addEventListener('click', function () {
                    populateTableRow();
                })
                break;
            case 4:
                newCell.classList.add('small');
                newCell.innerHTML = '<button disabled>' + '-' + '</button>'
                newCell.addEventListener('click', function () {
                    removeTableRow(newRow);
                })
                break;
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
            if (e.target.value > -1) {

                let provinceSelect = document.querySelector('#' + rowId + ' td:nth-child(1) select');
             //   https://sede.administracionespublicas.gob.es/icpplustieb/acInfo?p=8&tramite=4010
                //value="/icpplustie/citar?p=8"
                provinceSelect.parentElement.innerText = provinceSelect.options[provinceSelect.selectedIndex].text
                let procedureSelect = e.target;
                let linkAddress = 'https://sede.administracionespublicas.gob.es' + provinceSelect.value.replace('citar', 'acInfo;jsessionid=0') + '&tramite=' + procedureSelect.value;
                procedureSelect.parentElement.innerHTML =`<a href="${linkAddress}" target="_blank">${procedureSelect.options[procedureSelect.selectedIndex].text}</a>`;
                document.querySelector('#' + rowId + ' td:nth-child(3)').innerText = 'Inicializando';
                document.querySelector('#' + rowId + ' td:nth-child(4) button').disabled = rowId === "row4";
                document.querySelector('#' + rowId + ' td:nth-child(5) button').disabled = false;
                activePolls[rowId] = {provincePath: provincePath, procedureCode: e.target.value};
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
        } else {
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
            targetCell.style.border = '1px solid ' + statusColor;
            if (areThereOffices) {
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

