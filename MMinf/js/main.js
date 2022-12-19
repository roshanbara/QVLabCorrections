let data;
let options;
let chart;
let chartId;
let rho;
let av_cust_s;
let av_cust_q;
let time;
let cust;
let ar;
let sr;
let av_time_s;
let cust_total;
let av_st;

class QElement {
    constructor(element, priority) {
        this.element = element;
        this.priority = priority;
    }
}

// PriorityQueue class
class PriorityQueue {
    // An array is used to implement priority
    constructor() {
        this.items = [];
    }

    // functions to be implemented
    enqueue(element, priority) {
        var qElement = new QElement(element, priority);
        var contain = false;

        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                // Once the correct location is found it is
                // enqueued
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }

        // if the element have the highest priority
        // it is added at the end of the queue
        if (!contain) {
            this.items.push(qElement);
        }
    }
    dequeue() {
        if (this.isEmpty()) return;
        return this.items.shift();
    }
    front() {
        if (this.isEmpty()) return;
        return this.items[0].priority;
    }
    isEmpty() {
        return this.items.length == 0;
    }

    size() {
        return this.items.length;
    }
    // printPQueue()
}

window.onload = function () {
    google.charts.load("current", {
        packages: ["corechart"],
    });

    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        data = google.visualization.arrayToDataTable([
            ["Time", "Customers"],
            [0, 0],
        ]);

        options = {
            title: "No. of Customers in System vs Time",
            width: "100%",
            height: "100%",
            hAxis: {
                title: "Time",
            },
            vAxis: {
                title: "Customers",
            },
            chartArea: { width: "80%", height: "80%" },
            legend: { position: "bottom" },
        };

        chart = new google.visualization.LineChart(
            document.getElementById("chart_div")
        );

        chart.draw(data, options);
    }
};

function check(a, b) {
    if (a == "" || b == "") {
        alert("Values cannot be empty");
        return false;
    }
    if (parseFloat(a) <= 0) {
        alert("Arrival rate should be positive");
        return false;
    }
    if (parseFloat(b) <= 0) {
        alert("Service rate should be positive");
        return false;
    }
    return true;
}

function startSimulation(arrival_rate, service_rate, speed) {
    let valid = check(arrival_rate, service_rate);
    if (!valid) return;
    clearChart();
    console.log(arrival_rate);
    console.log(service_rate);
    let sTime = 0;
    let in_use = false;
    if (!arrival_rate) arrival_rate = 1.0;
    if (!service_rate) service_rate = 1.0;
    rho = parseFloat(arrival_rate) / parseFloat(service_rate);
    ar = parseFloat(arrival_rate);
    sr = parseFloat(service_rate);
    let U = Math.random();
    let nextTime = -Math.log(U) / ar;
    let aq = new PriorityQueue();
    let sq = new PriorityQueue();
    cust_total = 0;
    aq.enqueue(1, nextTime);
    chartId = setInterval(function () {
        // Service queue is not empty and next service is done before next arrival
        if (!sq.isEmpty() && ((sq.front() < aq.front()) || aq.isEmpty())) {
            time = sq.front();
            data.addRow([time, sq.size()]);
            data.addRow([time, sq.size() - 1]);
            sq.dequeue();
            cust_total++;
        } else {
            U = Math.random();
            time = aq.front();
            aq.dequeue();
            data.addRow([time, sq.size()]);
            data.addRow([time, sq.size() + 1]);
            nextTime = time - Math.log(U) / sr;
            sq.enqueue(1, nextTime);
            av_cust_s += nextTime - time;
            av_st += nextTime - time;
            av_time_s += nextTime - time;
            U = Math.random();
            nextTime = time - Math.log(U) / ar;
            aq.enqueue(1, nextTime);
        }
        // data.addRow([time, cust]);
        chart.draw(data, options);
    }, 2010 - speed);
}

function drawTable() {
    document.getElementById("table_div").style.width = "40vw";
    document.getElementById("chart_div").style.width = "40vw";
    chart.draw(data, options);
    document.getElementById("table_div").style.display = "block";
    let th_cs = rho;
    let ex_cs = av_cust_s / time;
    let th_cq = 0.0;
    let ex_cq = 0.0;
    let ex_st = av_st / (cust_total);
    let th_ts = 1 / sr;
    let ex_ts = av_time_s / cust_total;
    let th_st = 1 / sr;
    if (ar >= sr) {
        document.getElementById("th_cs").innerHTML =
            "Steady state solution does not exist";
        document.getElementById("ex_cs").innerHTML =
            ex_cs >= 0 && ex_cs != NaN
                ? ex_cs.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("th_cq").innerHTML =
            "Steady state solution does not exist";
        document.getElementById("ex_cq").innerHTML =
            ex_cq >= 0 && ex_cq != NaN
                ? ex_cq.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("th_ts").innerHTML =
            "Steady state solution does not exist";
        document.getElementById("ex_ts").innerHTML =
            ex_ts >= 0 && ex_ts != NaN
                ? ex_ts.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("th_st").innerHTML =
            "Steady state solution does not exist";
        document.getElementById("ex_st").innerHTML =
            ex_st >= 0 && ex_st != NaN
                ? ex_st.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("ex").innerHTML =
            "Time-dependent Results (Simulation time: " +
            (time.toFixed(2) >= 0
                ? time.toFixed(2)
                : "Time for simulation cannot be generated for given inputs") +
            ")";
    } else {
        document.getElementById("th_cs").innerHTML =
            th_cs >= 0 && th_cs != NaN
                ? th_cs.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("ex_cs").innerHTML =
            ex_cs >= 0 && ex_cs != NaN
                ? ex_cs.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("th_cq").innerHTML =
            th_cq >= 0 && th_cq != NaN
                ? th_cq.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("ex_cq").innerHTML =
            ex_cq >= 0 && ex_cq != NaN
                ? ex_cq.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("th_ts").innerHTML =
            th_ts >= 0 && th_ts != NaN
                ? th_ts.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("ex_ts").innerHTML =
            ex_ts >= 0 && ex_ts != NaN
                ? ex_ts.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("th_st").innerHTML =
            th_st >= 0 && th_st != NaN
                ? th_st.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("ex_st").innerHTML =
            ex_st >= 0 && ex_st != NaN
                ? ex_st.toFixed(2)
                : "Unable to calculate results";
        document.getElementById("ex").innerHTML =
            "Time-dependent Results (Simulation time: " +
            (time.toFixed(2) >= 0
                ? time.toFixed(2)
                : "Time for simulation cannot be generated for given inputs") +
            ")";
    }
}

function stopSimulation() {
    clearInterval(chartId);
    drawTable();
}

function clearChart() {
    document.getElementById("table_div").style.display = "none";
    document.getElementById("chart_div").style.width = "100vw";
    if (chartId) clearInterval(chartId);
    data = google.visualization.arrayToDataTable([
        ["Time", "Customers"],
        [0, 0],
    ]);
    chart.draw(data, options);
    cust = 0;
    time = 0;
    av_cust_q = 0;
    av_cust_s = 0;
    av_time_s = 0;
    cust_total = 0;
    av_st = 0;
}