const SAVE_URL = "https://script.google.com/macros/s/AKfycbxexZL8LKzHiJ1OxEEqiX-E3nn-4R2Zy3jLrA5M1sRlplAPhRtn5GzgD2cDfPil3xZm/exec";

function saveData(data){
fetch(SAVE_URL,{
method:"POST",
body:JSON.stringify(data)
})
.then(r=>console.log("saved"))
.catch(e=>console.log(e))
}