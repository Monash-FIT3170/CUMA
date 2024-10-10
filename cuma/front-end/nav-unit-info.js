
function addButtonFunc(){
    let button = document.getElementById("searchButton");



    button.addEventListener("click", async () => {

        if (document.getElementById("errorText").style.display === "inline"){
            toggleErrorSpan();
        }

        let uniForm = document.getElementById("search-institution");
        let unitForm = document.getElementById("search-unit");
        console.log("hi")

        let result = await Backend.Unit.retrieveUnit(uniForm.value, unitForm.value)

        if (result == undefined){
            toggleErrorSpan()
        }

        console.log(result)
    });
}

function toggleErrorSpan(){
    let span = document.getElementById("errorText");

    if (span.style.display === "none"){
        span.style.display = "inline";
    } else if (span.style.display === "inline"){
        span.style.display = "none";
    }
}

addButtonFunc()