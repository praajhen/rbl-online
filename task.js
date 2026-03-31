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

let data = [];

let block = "practice";
let trial = 0;
let score = 0;
let totalTrials = 12;

let phase = "instructions";

let startTime;
let responded = false;
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

function startPractice(){
block="practice";
trial=0;
score=0;
totalTrials=12;
nextTrial();
}

function startEasy(){
block="easy";
trial=0;
score=0;
totalTrials=10;
nextTrial();
}

function startMedium(){
block="medium";
trial=0;
score=0;
totalTrials=10;
nextTrial();
}

function startHard(){
block="hard";
trial=0;
score=0;
totalTrials=10;
nextTrial();
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

let fixTime = (block=="practice") ? 1000 : 750;
setTimeout(showStim, fixTime);
}

let currentStim;
let correctButton;

function showStim(){

document.getElementById("fixation").style.display="none";
document.getElementById("stimulus").style.display="block";

currentStim = Math.floor(Math.random()*9);

document.getElementById("stimimg").src = stimuli[currentStim];

correctButton = getCorrect(currentStim);

phase="stimulus";

responded = false;

startTime = performance.now();

let respTime = (block=="practice") ? 3000 : 1200;
responseTimer = setTimeout(noResponse, respTime);
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
clearTimeout(responseTimer);
phase="feedback";

let rt = performance.now()-startTime;

let resp = (key=="1" || key=="2" || key=="3") ? parseInt(key) : 0;

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

let fbTime = (block=="practice") ? 750 : 750;

setTimeout(()=>{
trial++;
nextTrial();
}, fbTime);

},250);

}

function noResponse(){
if(phase!="stimulus") return;
handleResponse(0);
}

function saveTrial(resp,acc,rt){

let stimName = stimuli[currentStim].split("/")[1];
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

}

function showScore(){

phase="score";

document.getElementById("feedback").style.display="none";
document.getElementById("stimulus").style.display="none";
document.getElementById("fixation").style.display="none";

document.getElementById("score").style.display="block";

let acc = Math.round(score/totalTrials*100);

document.getElementById("score").innerHTML =
"Block finished<br><br>"+
"Score: "+score+" / "+totalTrials+"<br>"+
"Accuracy: "+acc+"%<br><br>"+
"Press SPACE";

document.onkeydown = function(e){

if(e.code=="Space"){

if(block=="practice") startEasy();
else if(block=="easy") startMedium();
else if(block=="medium") startHard();
else endExperiment();

}

}

}

function endExperiment(){

document.getElementById("score").innerHTML =
"Finished<br><br>Saving data...";

saveData(data);

}