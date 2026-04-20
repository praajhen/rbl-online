let participant = Date.now();

let stimuli = [
"stimuli/circle_red.bmp",       //0
"stimuli/circle_green.bmp",     //1
"stimuli/circle_blue.bmp",      //2
"stimuli/square_red.bmp",       //3
"stimuli/square_green.bmp",     //4
"stimuli/square_blue.bmp",      //5
"stimuli/triangle_red.bmp",     //6
"stimuli/triangle_green.bmp",   //7
"stimuli/triangle_blue.bmp"     //8
];

let data = [];

/* ================= SAVE ON EXIT ================= */

window.addEventListener("beforeunload", function () {

if(data.length > 0){

const url =
"https://script.google.com/macros/s/AKfycbxexZL8LKzHiJ1OxEEqiX-E3nn-4R2Zy3jLrA5M1sRlplAPhRtn5GzgD2cDfPil3xZm/exec";

navigator.sendBeacon(
url,
JSON.stringify([data[data.length-1]])
);

}

});

/* ================= GLOBALS ================= */

let block = "practice";
let trial = 0;
let score = 0;
let totalTrials = 18;

let phase = "instructions";

let startTime;
let responded = false;

let stimOrder = [];
let stimIndex = 0;

let blockOrder = [];
let blockIndex = 0;

let currentStim = 0;
let correctButton = 0;

/* ================= KEYBOARD ================= */

document.addEventListener("keydown", keyHandler);

function keyHandler(e){

if(phase=="instructions" && e.code=="Space"){
startPractice();
return;
}

if(phase=="stimulus" && !responded){
responded = true;
handleResponse(e.key);
return;
}

if((phase=="score" || phase=="blockstart" || phase=="mainstart") && e.code=="Space"){
continueFlow();
return;
}

}

/* ================= ORDERS ================= */

function makeStimOrder(nTrials){

stimOrder = [];
stimIndex = 0;

let reps = Math.floor(nTrials/9);
let extra = nTrials % 9;

/* balanced repetitions */
for(let r=0;r<reps;r++){
for(let s=0;s<9;s++){
stimOrder.push(s);
}
}

for(let s=0;s<extra;s++){
stimOrder.push(s);
}

/* shuffle */
for(let i=stimOrder.length-1;i>0;i--){
let j=Math.floor(Math.random()*(i+1));
[stimOrder[i],stimOrder[j]]=[stimOrder[j],stimOrder[i]];
}

/* remove immediate repeats */
for(let i=1;i<stimOrder.length;i++){

if(stimOrder[i]===stimOrder[i-1]){

for(let j=i+1;j<stimOrder.length;j++){

if(
stimOrder[j]!==stimOrder[i] &&
stimOrder[j]!==stimOrder[i-1]
){
[stimOrder[i],stimOrder[j]] =
[stimOrder[j],stimOrder[i]];
break;
}

}

}

}

}

function makeBlockOrder(){

let orders = [
["easy","medium","hard"],
["easy","hard","medium"],
["medium","easy","hard"],
["medium","hard","easy"],
["hard","easy","medium"],
["hard","medium","easy"]
];

blockOrder = orders[Math.floor(Math.random()*orders.length)];
blockIndex = 0;

}

/* ================= START BLOCKS ================= */

function startPractice(){

block = "practice";
trial = 0;
score = 0;
totalTrials = 18;

makeBlockOrder();
makeStimOrder(totalTrials);

nextTrial();

}

function startEasy(){

block = "easy";
trial = 0;
score = 0;
totalTrials = 135;

makeStimOrder(totalTrials);
nextTrial();

}

function startMedium(){

block = "medium";
trial = 0;
score = 0;
totalTrials = 243;

makeStimOrder(totalTrials);
nextTrial();

}

function startHard(){

block = "hard";
trial = 0;
score = 0;
totalTrials = 243;

makeStimOrder(totalTrials);
nextTrial();

}

function startNextBlock(){

let next = blockOrder[blockIndex];
let shownBlock = blockIndex + 1;

hideAll();

document.getElementById("score").style.display="block";

document.getElementById("score").innerHTML =
"Block " + shownBlock + " of 3<br><br>" +
"Try to discover the rule using feedback.<br><br>" +
"Press SPACE";

phase = "blockstart";

window.nextBlockName = next;

blockIndex++;

}

/* ================= FLOW ================= */


function continueFlow(){
 
    if(phase=="mainstart"){
startNextBlock();
return;
}

/* when block intro screen is shown */
if(phase=="blockstart"){

if(window.nextBlockName=="easy") startEasy();
if(window.nextBlockName=="medium") startMedium();
if(window.nextBlockName=="hard") startHard();

return;
}

/* after practice finished screen */
if(block=="practice"){

hideAll();

document.getElementById("score").style.display="block";

document.getElementById("score").innerHTML =
"Practice finished.<br><br>" +
"The main task begins now.<br><br>" +
"Press SPACE";

phase = "mainstart";
return;
}

/* after each completed block */
if(blockIndex < blockOrder.length){
startNextBlock();
return;
}

/* finished all blocks */
endExperiment();

}

/* ================= TRIAL ================= */

function nextTrial(){

if(trial >= totalTrials){
showScore();
return;
}

phase = "fixation";

hideAll();
document.getElementById("fixation").style.display="block";

let fixTime = (block=="practice") ? 1000 : 750;

setTimeout(showStimulus, fixTime);

}

function showStimulus(){

hideAll();

document.getElementById("stimulus").style.display="block";

currentStim = stimOrder[stimIndex];
stimIndex++;

document.getElementById("stimimg").src = stimuli[currentStim];

correctButton = getCorrect(currentStim);

phase = "stimulus";
responded = false;

startTime = performance.now();

let respTime = (block=="practice") ? 3000 : 1200;

setTimeout(noResponse, respTime);

}

/* ================= RULES ================= */

function getCorrect(idx){

/* EASY + PRACTICE */
if(block=="easy" || block=="practice"){

if(idx<=2) return 1;   // circles
if(idx<=5) return 2;   // squares
return 3;             // triangles

}

/* MEDIUM = Presentation exact */
if(block=="medium"){

/* circles */
if(idx==0) return 1;   // circle_red
if(idx==1) return 1;   // circle_green
if(idx==2) return 2;   // circle_blue

/* squares */
if(idx==3) return 2;   // square_red
if(idx==4) return 2;   // square_green
if(idx==5) return 3;   // square_blue

/* triangles */
if(idx==6) return 3;   // triangle_red
if(idx==7) return 3;   // triangle_green
if(idx==8) return 1;   // triangle_blue

}

/* HARD = probabilistic */
if(block=="hard"){

let r = Math.random();

/* circles */
if(idx<=2){
return (r<=0.80)?1:2;
}

/* squares */
if(idx<=5){
return (r<=0.80)?2:1;
}

/* triangles */
return (r<=0.80)?3:2;

}

}

/* ================= RESPONSE ================= */

function handleResponse(key){

phase = "feedback";

let rt = Math.round(performance.now() - startTime);

let resp =
(key=="1" || key=="2" || key=="3")
? parseInt(key)
: 0;

let acc = (resp==correctButton)?1:0;

if(acc==1) score++;

saveTrial(resp,acc,rt);

hideAll();

/* pre-feedback gap = 250 ms */
setTimeout(()=>{

document.getElementById("feedback").style.display="block";
document.getElementById("feedback").innerText =
acc ? "Correct" : "Incorrect";

/* feedback duration = 750 ms */
setTimeout(()=>{

document.getElementById("feedback").style.display="none";

/* ITI */
let isi;

if(block=="practice"){
isi = 800;
}else{
isi = 600 + Math.random()*300;
}

setTimeout(()=>{

trial++;
nextTrial();

}, isi);

},750);

},250);

}

function noResponse(){

if(phase!="stimulus") return;

handleResponse(0);

}

/* ================= SAVE ================= */

function saveTrial(resp,acc,rt){

let stimName = stimuli[currentStim].split("/")[1];

let shape = stimName.split("_")[0];
let color = stimName.split("_")[1].replace(".bmp","");

data.push({

participant: participant,
block: block,
trial: trial+1,
stimulus: currentStim+1,
shape: shape,
color: color,
correct_button: correctButton,
response: resp,
accuracy: acc,
rt: rt,
feedback: acc,
score: score

});

/* batch every 5 */
if(data.length % 5 === 0){
saveData(data.slice(-5));
}

}

/* ================= SCORE ================= */

function showScore(){

phase = "score";

saveData(data);

hideAll();

document.getElementById("score").style.display="block";

let acc = Math.round(score/totalTrials*100);

document.getElementById("score").innerHTML =

"Block finished<br><br>" +
"Score: " + score + " / " + totalTrials + "<br>" +
"Accuracy: " + acc + "%<br><br>" +
"Press SPACE";

}

/* ================= END ================= */

function endExperiment(){

hideAll();

document.getElementById("score").style.display="block";

document.getElementById("score").innerHTML =
"Finished<br><br>Saving data...";

saveData(data);

}

/* ================= HELPERS ================= */

function hideAll(){

document.getElementById("instructions").style.display="none";
document.getElementById("score").style.display="none";
document.getElementById("feedback").style.display="none";
document.getElementById("stimulus").style.display="none";
document.getElementById("fixation").style.display="none";

}