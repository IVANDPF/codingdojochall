let inputVal;
let options ;

function getInputValue(){
    inputVal = document.getElementById("numberOptions").value;
    // Container <div> where dynamic content will be placed
    const container = document.getElementById("dynamicDiv");
    // Clear previous contents of the container
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    if(inputVal <2 ){
        alert("You must specify two or more options");
    } else {

        const x = document.getElementById("myDIV");
        x.style.display = "block"

        for (let i=0;i<inputVal;i++){
            container.appendChild(document.createTextNode("option " + (i+1)));
            const input = document.createElement("input");
            input.type = "text";
            input.className = "form-control options";
            input.name = "option" + i;
            input.id = "option" + i;
            input.required;
            container.appendChild(input);
            // Append a line break
            container.appendChild(document.createElement("br"));
        }
    }
}

function submitedPoll(){
    options = '';
    for (let j = 0; j < inputVal; j++) {

        if (document.getElementById("option" + (j)).value) {
            if (document.getElementById("option" + (j)).value !== null || document.getElementById("option" + (j)).value !== '') {
                options = options + document.getElementById("option" + (j)).value + ";";
                console.log(options, 'options1');
                if (j === (inputVal - 1)) {
                    document.getElementById("options").value = options.slice(0, -1);
                    console.log(options, 'options2');
                    document.getElementById("newpoll").submit();
                } else {
                    event.preventDefault();
                }
            }
        } else {
            event.preventDefault();
            alert('Please complete all fields');
        }

    }
}
