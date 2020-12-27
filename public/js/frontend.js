const urlParams = new URLSearchParams(window.location.search);
let serverMsg = urlParams.get('info');
if (serverMsg) {
    let text = window.atob(serverMsg);
    const length = text.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = text.charCodeAt(i);
    }
    const decoder = new TextDecoder();
   serverMsg = decoder.decode(bytes);

    const errorMessage = document.getElementById("serverMessage");
    errorMessage.innerText = serverMsg;
    errorMessage.style.display = "block";
}