// ===== SAVE URL (needed for sendBeacon) =====
const SAVE_URL = "https://script.google.com/macros/s/AKfycbxexZL8LKzHiJ1OxEEqiX-E3nn-4R2Zy3jLrA5M1sRlplAPhRtn5GzgD2cDfPil3xZm/exec";

let participant = Date.now();

let stimuli = [
"stimuli/circle_red.bmp",
"stimuli/circle_green.bmp",
"stimuli/circle_blue.bmp",
"stimuli/square_red.bmp",
"stimuli/square_green.bmp",
"stimuli/square_blue.bmp",
"stimuli/triangle_red.bmp",
"stimuli/triangle_green.bmp",
"stimuli/triangle_blue.bmp"
];

let data = [];   // MUST be before beforeunload

// ===== SAFE EXIT SAVE =====
window.addEventListener("beforeunload", function () {
if(data.length > 0){
navigator.sendBeacon(
SAVE_URL,
JSON.stringify([data[data.length-1]])
);
}
});

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

document.addEventListener("keydown", keyHandler);

function keyHandler(e){

if(phase=="instructions" && e.code=="Space"){
startPractice();
return;
}

if(phase=="stimulus" && !responded){
responded = true;
handleResponse(e.key);
}

}

function makeStimOrder(nTrials){

stimOrder=[];
stimIndex=0;

let reps=Math.floor(nTrials/9);
let extra=nTrials%9;

for(let r=0;r<reps;r++){
for(let s=0;s<9;s++){
stimOrder.push(s);
}
}

for(let s=0;s<extra;s++){
stimOrder.push(s);
}

for(let i=stimOrder.length-1;i>0;i--){
let j=Math.floor(Math.random()*(i+1));
[stimOrder[i],stimOrder[j]]=[stimOrder[j],stimOrder[i]];
}

}

function makeBlockOrder(){

let orders=[
["easy","medium","hard"],
["easy","hard","medium"],
["medium","easy","hard"],
["medium","hard","easy"],
["hard","easy","medium"],
["hard","medium","easy"]
];

let id=Math.floor(Math.random()*orders.length);
blockOrder=orders[id];
blockIndex=0;

}

function startPractice(){
block="practice";
trial=0;
score=0;
totalTrials=15;
makeBlockOrder();
makeStimOrder(totalTrials);
nextTrial();
}

function startEasy(){
block="easy";
trial=0;
score=0;
totalTrials=90;
makeStimOrder(totalTrials);
nextTrial();
}

function startMedium(){
block="medium";
trial=0;
score=0;
totalTrials=117;
makeStimOrder(totalTrials);
nextTrial();
}

function startHard(){
block="hard";
trial=0;
score=0;
totalTrials=117;
makeStimOrder(totalTrials);
nextTrial();
}

function startNextBlock(){

let next=blockOrder[blockIndex];
blockIndex++;

if(next=="easy") startEasy();
if(next=="medium") startMedium();
if(next=="hard") startHard();

}

function nextTrial(){

if(trial>=totalTrials){
showScore();
return;
}

phase="fixation";

document.getElementById("instructions").style.display="none";
document.getElementById("score").style.display="none";
document.getElementById("feedback").style.display="none";
document.getElementById("stimulus").style.display="none";
document.getElementById("fixation").style.display="block";

let fixTime=(block=="practice")?1000:750;
setTimeout(showStim,fixTime);

}

let currentStim;
let correctButton;

function showStim(){

document.getElementById("fixation").style.display="none";
document.getElementById("stimulus").style.display="block";

currentStim=stimOrder[stimIndex];
stimIndex++;

document.getElementById("stimimg").src=stimuli[currentStim];

correctButton=getCorrect(currentStim);

phase="stimulus";

responded=false;

startTime=performance.now();

let respTime=(block=="practice")?3000:1200;
setTimeout(noResponse,respTime);

}

function getCorrect(idx){

if(block=="easy" || block=="practice"){
if(idx<=2) return 1;
if(idx<=5) return 2;
return 3;
}

if(block=="medium"){
let map=[1,2,3,2,3,1,3,1,2];
return map[idx];
}

if(block=="hard"){
if(idx<=2) return 1;
if(idx<=5) return 2;
return 3;
}

}

function handleResponse(key){

phase="feedback";

let rt = performance.now()-startTime;

let resp = (key=="1"||key=="2"||key=="3") ? parseInt(key) : 0;

let acc = (resp==correctButton)?1:0;

if(block=="hard"){
let r=Math.random();
if(r<0.2) acc=1-acc;
}

if(acc==1) score++;

saveTrial(resp,acc,rt);

document.getElementById("stimulus").style.display="none";

setTimeout(()=>{

document.getElementById("feedback").style.display="block";
document.getElementById("feedback").innerText = acc?"Correct":"Incorrect";

setTimeout(()=>{

document.getElementById("feedback").style.display="none";

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

function saveTrial(resp,acc,rt){

let stimName=stimuli[currentStim].split("/")[1];
let shape = stimName.split("_")[0];
let color = stimName.split("_")[1].replace(".bmp","");

data.push({
participant:participant,
block:block,
trial:trial,
stimulus:currentStim+1,
shape:shape,
color:color,
correct_button:correctButton,
response:resp,
accuracy:acc,
rt:rt,
feedback:acc,
score:score
});

// ===== SAFE SAVING =====

// practice → save every trial
if(block=="practice"){
saveData([data[data.length-1]]);
}

// experiment → save every 5 trials
else if(data.length % 5 === 0){
saveData([data[data.length-1]]);
}

}

function showScore(){

phase="score";

// save full block
saveData(data);

document.getElementById("feedback").style.display="none";
document.getElementById("stimulus").style.display="none";
document.getElementById("fixation").style.display="none";

document.getElementById("score").style.display="block";

let acc=Math.round(score/totalTrials*100);

document.getElementById("score").innerHTML=
"Block finished<br><br>"+
"Score: "+score+" / "+totalTrials+"<br>"+
"Accuracy: "+acc+"%<br><br>"+
"Press SPACE";

document.onkeydown=function(e){

if(e.code=="Space"){

if(block=="practice"){
startNextBlock();
}
else if(blockIndex < blockOrder.length){
startNextBlock();
}
else{
endExperiment();
}

}

}

}

function endExperiment(){

document.getElementById("score").innerHTML=
"Finished<br><br>Saving data...";

saveData(data);

}