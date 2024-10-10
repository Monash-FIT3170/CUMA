
function addButtonFunc(){
    let button = document.getElementById("searchButton");



    button.addEventListener("click", async () => {
        let uniForm = document.getElementById("search-institution");
        let unitForm = document.getElementById("search-unit");
        console.log("hi")

        let result = await Backend.Unit.retrieveUnit(uniForm.value, unitForm.value)

        console.log(result)
    });
}

addButtonFunc()