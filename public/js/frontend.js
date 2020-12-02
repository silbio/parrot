const urlParams = new URLSearchParams(window.location.search);
let serverMsg = urlParams.get('info');


if (serverMsg) {
    const errorMessage = document.getElementById("serverMessage");
    errorMessage.innerText = serverMsg;
    errorMessage.style.display = "block";
}