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
let ns;
let end_times;
let start_times;
let av_time_s;
let cust_total;
let av_st;
let busy_servers;

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
function factorial(n) {
    let answer = 1;
    if (n == 0 || n == 1) {
        return answer;
    } else {
        for (var i = n; i >= 1; i--) {
            answer = answer * i;
        }
        return answer;
    }
}

function check(a, b, c) {
    if (a == "" || b == "" || c == "") {
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
    if (parseFloat(c) != parseInt(c)) {
        alert("Maximum Servers should be an integer");
        return false;
    }
    if (parseFloat(c) <= 0) {
        alert("Maximum Servers should be positive");
        return false;
    }
    return true;
}

function startSimulation(arrival_rate, service_rate, num_servers, speed) {
    let valid = check(arrival_rate, service_rate, num_servers);
    if (!valid) return;
    clearChart();
    let sTime = Number.MAX_VALUE;
    let in_use = false;
    if (!arrival_rate) arrival_rate = 1.0;
    if (!service_rate) service_rate = 1.0;
    rho = parseFloat(arrival_rate) / (parseInt(ns) * parseFloat(service_rate));
    ar = parseFloat(arrival_rate);
    sr = parseFloat(service_rate);
    ns = parseInt(num_servers);
    busy_servers = 0;
    end_times = [];
    start_times = [];
    for (let i = 0; i < ns; i++) {
        end_times[i] = Number.MAX_VALUE;
        start_times[i] = Number.MAX_VALUE;
    }
    // Print number of servers
    console.log(num_servers);

    let U = Math.random();
    let nextTime = -Math.log(U) / ar;
    let q = new Queue();
    chartId = setInterval(function () {
        /* stime = service time end, nextTime  = next arrival time*/
        /*Departure*/
        if (sTime < nextTime) {
            av_cust_s += cust * (sTime - time);
            av_cust_q += Math.max(0, cust - ns) * (sTime - time);
            time = sTime;
            data.addRow([time, cust]);
            let idx = -1;
            for (let i = 0; i < ns; i++) {
                if (end_times[i] == sTime) {
                    idx = i;
                    break;
                }
            }
            av_time_s += time - start_times[idx];
            cust--;
            if (q.isEmpty) {
                start_times[idx] = Number.MAX_VALUE;
                end_times[idx] = Number.MAX_VALUE;
                busy_servers--;
            } else {
                start_times[idx] = q.dequeue();
                U = Math.random();
                end_times[idx] = time - Math.log(U) / sr;
                av_st -= Math.log(U) / sr;
            }
            // update service end time
            sTime = end_times[0];
            for (let i = 1; i < ns; i++) {
                sTime = Math.min(sTime, end_times[i]);
            }
        } else {
            // Arrival occurs here
            av_cust_s += cust * (nextTime - time);
            av_cust_q += Math.max(0, cust - ns) * (nextTime - time);
            time = nextTime;
            data.addRow([time, cust]);
            cust++;
            cust_total++;
            console.log("Arrival occured");
            console.log(busy_servers);
            console.log(sTime);
            console.log(end_times);

            if (busy_servers == ns) {
                q.enqueue(time);
            } else {
                let idx = -1;
                for (let i = 0; i < ns; i++) {
                    if (end_times[i] == Number.MAX_VALUE) {
                        idx = i;
                        break;
                    }
                }
                console.log(idx);
                start_times[idx] = time;
                U = Math.random();
                end_times[idx] = time - Math.log(U) / sr;
                av_st -= Math.log(U) / sr;
                busy_servers++;

                sTime = end_times[0];
                for (let i = 1; i < ns; i++) {
                    sTime = Math.min(sTime, end_times[i]);
                }
            }
            U = Math.random();
            nextTime = time - Math.log(U) / ar;
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
    let t0 = 0.0;
    for (let i = 0; i < ns; i++) {
        t0 += Math.pow(ar / sr, i) / factorial(i);
    }
    // console.log(t0);
    // let pow0 = 1;
    // for(let i = ns; i<100; i++) {
    //     pow0*=ns;
    // }
    console.log(t0);
    let pa1 =
        (Math.pow(ns, ns) / factorial(ns)) *
        (Math.pow(ar / (ns * sr), ns) / (1 - ar / (ns * sr)));
    console.log(Math.pow(ns, ns) / factorial(ns));
    console.log(Math.pow(ar / (ns * sr), ns) / (1 - ar / (ns * sr)));
    console.log(pa1);

    t0 += pa1;
    console.log(t0);

    let tmp1 = ar / (ns * sr);
    let P0 = 1 / t0;
    console.log(P0);
    let t1 = P0 * Math.pow(ar, ns) * tmp1;
    let t2 = factorial(ns) * (1 - tmp1) * (1 - tmp1) * Math.pow(sr, ns);
    console.log(Math.pow(ar, ns) * tmp1);
    console.log(t1);
    console.log(t2);
    let Lq = t1 / t2;
    console.log(Lq);
    // let Lq = t1/(factorial(ns)*Math.pow(1-rho, 2));
    let Tq = Lq / ar;
    let Ts = Tq + 1 / ar;
    let Ls = Lq + ar / sr;
    console.log(P0);
    console.log(Lq);

    let th_cs = Ls;
    let ex_cs = av_cust_s / time;
    let th_cq = Lq;
    let ex_cq = av_cust_q / time;
    let ex_st = av_st / (cust_total - cust + busy_servers);
    let th_ts = th_cs / ar;
    let ex_ts = av_time_s / cust_total;
    let th_st = 1 / sr;

    if (ar >= ns * sr) {
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
    busy_servers = 0;
    end_times = [];
    start_times = [];
    for (let i = 0; i < ns; i++) {
        end_times[i] = Number.MAX_VALUE;
        start_times[i] = Number.MAX_VALUE;
    }
}