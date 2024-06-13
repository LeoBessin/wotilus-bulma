import moment from "moment";
import 'moment/dist/locale/fr';
import { Chart, CategoryScale, TimeScale, BarController, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';

let curState;
let statePosition;
let curNode;
let endDate;
let startDate = moment.now();
let timelineArray = [];
let stateObject = {
    undefined: {
        image: "watch.svg",
        color: "info"
    },
    "work": {
        image: "tool.svg",
        color: "success"
    },
    "drive": {
        image: "life-buoy.svg",
        color: "warning"
    },
}
moment.locale('fr');

function init(appNode, position) {
    statePosition = position;
    curNode = appNode;
    const button = document.createElement("button");
    button.className = `button has-background-${stateObject[curState].color} custom-opacity-60 has-text-white
    custom-absolute custom-position-${position} custom-size-button custom-rounded-button custom-hover-scale 
    custom-size-60px m-0 p-0 custom-shadow`;
    button.id = "wotilusButton";
    button.innerHTML = `<img src='${stateObject[curState].image}' class="custom-size-2-3" alt="state logo"/><span class="badge is-danger"></span>`;

    button.addEventListener("click", () => {
        createScreen(appNode);
    })
    appNode.appendChild(button);
}
function mapTime(timeArray){
    if (timeArray.length === 0) {
        return -1;
    }
    let i = 1;
    let arrayToReturn = []
    timeArray.forEach((el) => {
        let date = new Date(el.time).getTime();
        let name = el.state;
        let color = name === "Travail" ? "rgb(0,255,93)" : name === "Conduite" ? "rgb(126,0,255)" : "rgb(0,112,255)";
        let dateEnd;
        if (i === timeArray.length) {
            if(endDate){
                dateEnd = endDate
            }else{
                dateEnd = new Date().getTime();
            }
        } else {
            dateEnd = new Date(timeArray[i].time).getTime();
        }
        const data = name==="Travail"?[[date, dateEnd],[],[]]:name==="Conduite"?[[],[date, dateEnd],[]]:[[],[],[date, dateEnd]];
        arrayToReturn.push({ label: name, data: data, backgroundColor: color })
        i++;
    })
    console.log(arrayToReturn)
    return arrayToReturn

}

function createScreen(appNode) {
    const screen = document.createElement("div");
    const closeButton = document.createElement("div");
    const choiceContainer = document.createElement("div");
    const choice1 = document.createElement("div");
    const choice2 = document.createElement("div");
    const choice3 = document.createElement("div");
    const stopButton = document.createElement("button");
    const validButton = document.createElement("button");
    const chartElement = document.createElement("canvas");
    stopButton.className = "button is-danger is-rounded custom-hover-scale has-text-white-bis custom-fit-content m-2";
    validButton.className = "button is-primary is-rounded custom-hover-scale has-text-white-bis custom-fit-content m-2";
    stopButton.innerHTML = "Terminer la journée";
    validButton.innerHTML = "Valider la journée";
    stopButton.addEventListener("click", () => {
        if (!endDate){
            endDate = moment.now();
            reset()
        }
    })
    chartElement.id = "chart";
    screen.className = `custom-fullscreen custom-absolute custom-position-0  has-background-${stateObject[curState].color}
    is-display-flex is-flex-direction-column is-justify-content-center is-align-items-center`;
    screen.id = "wotilusScreen"
    closeButton.className = "custom-position-top-right custom-absolute custom-hover-scale";
    closeButton.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"has-text-light\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"#fff\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></svg>"
    closeButton.addEventListener("click", () => {
        reset();
    })
    choiceContainer.className = "is-flex is-flex-direction-column has-text-white-bis";
    choice1.innerHTML = "<p class='title has-text-white-bis custom-hover-scale'>Travail</p>";
    choice2.innerHTML = "<p class='title has-text-white-bis custom-hover-scale'>Conduite</p>";
    choice3.innerHTML = "<p class='title has-text-white-bis custom-hover-scale'>Pause</p>";
    choice1.addEventListener("click", () => {
        curState = "work";
        timelineArray.push({state: "Travail", time: moment.now()});
        reset();
    });
    choice2.addEventListener("click", () => {
        curState = "drive";
        timelineArray.push({state: "Conduite", time: moment.now()});
        reset();
    });
    choice3.addEventListener("click", () => {
        curState = undefined;
        timelineArray.push({state: "Pause", time: moment.now()});
        reset();
    })
    choiceContainer.innerHTML = "<p class='title has-text-white-bis'>Que voulez-vous faire?</p>";
    switch (curState) {
        case undefined:
            choiceContainer.appendChild(choice1);
            choiceContainer.appendChild(choice2);
            break;
        case "work":
            choiceContainer.appendChild(choice2);
            choiceContainer.appendChild(choice3);
            break;
        case "drive":
            choiceContainer.appendChild(choice1);
            choiceContainer.appendChild(choice3);
            break;

    }
    screen.appendChild(closeButton);
    if (timelineArray[0]){
        screen.appendChild(chartElement);
        if (!endDate){
            screen.appendChild(stopButton);
        } else{
            screen.appendChild(validButton);
        }
    }
    screen.appendChild(choiceContainer);
    appNode.appendChild(screen);
    console.log(`timelineArray: ${JSON.stringify(timelineArray)}`);
    if(timelineArray[0]){
        Chart.register(CategoryScale, TimeScale, BarController, BarElement, ChartDataLabels);
        const labels = ["Travail", "Conduite", "Pause"];
        const modelData = {
            labels: labels,
            datasets: mapTime(timelineArray)
        };
        new Chart(document.getElementById("chart"), {
            type: 'bar',
            data: modelData,
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        ticks:{
                            color: "white",
                            source: 'data',
                            callback: function(value, index, values) {
                                return moment(value).format("HH:mm:ss");
                            },
                            maxRotation: 60,
                            minRotation: 60
                        },
                        adapters: {
                            date: {
                                locale: fr
                            },
                        },
                        min: timelineArray.length?timelineArray[0].time:startDate,
                    },
                    y:{
                        stacked:true,
                        ticks:{
                            color: "white",
                        }
                    },
                },
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            let date1 = moment(value[0]);
                            let date2 = moment(value[1]);
                            return moment(date2.diff(date1)).subtract(1,"hours").format("HH:mm:ss");
                        },
                        color: "white",
                    },
                },
                animation: {
                    duration: 500
                },
                responsive: true,
            }
        });
    }
}

function reset() {
    document.getElementById("wotilusScreen").remove();
    document.getElementById("wotilusButton").remove();
    init(curNode, statePosition);
}

export {init};