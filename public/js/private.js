const urlParams = new URLSearchParams(window.location.search);
const info = urlParams.get('info');
let errorMsg = ''
let msgColor =  '#E91E63';
switch (info) {
    case 'success' :
        errorMsg = 'Contraseña Actualizada con éxito';
        msgColor = '#48c71a';
        break;
    case  'oldPasswordFail':
        errorMsg = 'Contraseña anterior errónea, por favor, inténtelo de nuevo';
        break;
    case 'noMatch':
        errorMsg = 'La nueva contraseña no coincide con el campo de verificación, por favor, inténtelo de nuevo';
        break;
    case 'samePassword':
        errorMsg = 'La nueva contraseña es igual que la anterior, por favor, inténtelo de nuevo';
        break;
}

if (info) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.innerText = errorMsg;
    errorMessage.style.color = msgColor;
    errorMessage.style.display = "block";
}