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

class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    peek() {
        return this.elements[this.head];
    }
    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
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
    let q = new Queue();
    chartId = setInterval(function () {
        if (in_use && sTime < nextTime) {
            av_cust_s += cust * (sTime - time);
            av_cust_q += (cust - 1) * (sTime - time);
            time = sTime;
            data.addRow([time, cust]);
            av_time_s += time - q.dequeue();
            cust--;
            U = Math.random();
            if (cust) {
                sTime = time - Math.log(U) / sr;
                av_st -= Math.log(U) / sr;
            } else in_use = false;
        } else {
            av_cust_s += cust * (nextTime - time);
            if (cust) av_cust_q += (cust - 1) * (nextTime - time);
            time = nextTime;
            data.addRow([time, cust]);
            q.enqueue(time);
            cust++;
            cust_total++;
            U = Math.random();
            nextTime = time - Math.log(U) / ar;
            if (!in_use) {
                in_use = true;
                U = Math.random();
                sTime = time - Math.log(U) / sr;
                av_st -= Math.log(U) / sr;
            }
        }
        data.addRow([time, cust]);
        chart.draw(data, options);
    }, 2010 - speed);
}

function drawTable() {
    document.getElementById("table_div").style.width = "40vw";
    document.getElementById("chart_div").style.width = "40vw";
    chart.draw(data, options);
    document.getElementById("table_div").style.display = "block";

    console.log(ar);
    console.log(sr);
    let th_cs = rho / (1 - rho);
    console.log(th_cs);
    let ex_cs = av_cust_s / time;
    let th_cq = th_cs * rho;
    let ex_cq = av_cust_q / time;
    let ex_st = av_st / (cust_total - cust + 1);
    let th_ts = th_cs / ar;
    let ex_ts = av_time_s / cust_total;
    let th_st = 1 / sr;
    console.log(ar);
    console.log(sr);
    console.log({'ar':ar, 'sr':sr}, ar<sr, 'rho >= 1')
    if (ar >= sr) {
        console.log('Condition Wrong')
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