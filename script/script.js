let askCurrency, bidCurrency, apiCurrency, effectiveDateCurrency, comment, deleteLink, changeLink, currencyFilter, id, jsonDoSortowania, jsonPosortowany;
let apiCode = undefined;
let dateFrom, dateTo;
let tablicaId, tablicaAsk, tablicaBid, tablicaDate, tablicaCurrencyQuantity = [];
const tablicaCurrency = [];


//ustawia aktualną datę
var date = new Date();
if (date.getMonth() + 1 < 10) {
    dataDodania = date.getFullYear() + "-" + "0" + (date.getMonth() + 1) + "-" + date.getDate();
}
else {
    dataDodania = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

// pobiera zapytanie z API
function query(currency) {
    $("#currencyTable").html('');
    $("#addCurrencyToBackend").html('');
    let url = "http://api.nbp.pl/api/exchangerates/rates/c/" + currency + "?format=json";
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        cache: false,
        success: function (data) {
            displayCurrency(data)
        }
    });
}

//wyświetla zapytanie z API
function displayCurrency(api) {

    $("#currencyTable").append(
        "<tr><th>waluta: </th><th>" + api.currency + "</th></tr>" +
        '<tr><th>kupno:</th><td class="buy">' + api.rates[0].bid + ' zł</td></tr>' +
        '<tr><th>sprzedaż:</th><td class="sell">' + api.rates[0].ask + " zł</td></tr>" +
        "<tr><td>data publikacji:</td><td>" + api.rates[0].effectiveDate + "</td>/tr>"
    );
    apiCurrency = api.currency;
    askCurrency = api.rates[0].ask;
    bidCurrency = api.rates[0].bid;
    effectiveDateCurrency = api.rates[0].effectiveDate;
    apiCode = api.code;

    if (apiCode == "SEK" || apiCode == "XDR") {
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:red">Nie można dodać tej waluty (nie jest obsługiwana przez Backend)</span>');
    }
    else {
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append(
            '<br><h5><button class="btn btn-secondary" onclick="addToBackend()">Dodaj walutę do Backendu</button></h5>'
        );
    }
}

//Dodawanie do backendu kursów z API NBP
function addToBackend() {
    let url = "http://localhost:8080/currencyRates"
    $.ajax({
        type: "POST",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({

            "ask": askCurrency,
            "bid": bidCurrency,
            "comment": "Dodano z API NBP",
            "createdDate": effectiveDateCurrency,
            "currency": apiCode

        }),
        url: url,
        cache: false,
        success: function (data) {
            console.log('data', data);
            console.log('Dodano');
        }
    });
    $('#addCurrencyToBackend').append('<br><span style="color:green">Dodano pomyślnie</span>');
}
//wybór waluty by dodać do backendu ręcznie
function selectCurrency(currency) {
    askCurrency = 0;
    bidCurrency = 0;
    comment = "Przykładowy komentarz";
    effectiveDateCurrency = dataDodania;
    apiCode = currency;
    $("#selectedCurrency").html('');
    $("#selectedCurrency").append(currency);
    $("#dataKursu").html('');
    $("#dataKursu").append('Data kursu: <input type="text" value="' + effectiveDateCurrency + '" id="courseDate">');
}

//Dodawanie ręczne do backendu
function handAddToBackend() {
    bidCurrency = document.getElementById("kupno").value;
    askCurrency = document.getElementById("sprzedaz").value;
    comment = document.getElementById("komentarz").value;
    effectiveDateCurrency = document.getElementById("courseDate").value;
    if (apiCode == undefined) {
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:red">Wystąpił błąd: wybierz walutę po lewej</span>');
    }
    else if (bidCurrency == 0) {
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:red">Wystąpił błąd: wpisz cenę kupna</span>');
    }
    else if (askCurrency == 0) {
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:red">Wystąpił błąd: wpisz cenę sprzedaży</span>');
    }
    else if (comment == "") {
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:red">Wystąpił błąd: wpisz jakiś komentarz</span>');
    }
    else {
        let url = "http://localhost:8080/currencyRates"
        $.ajax({
            type: "POST",
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify({

                "ask": askCurrency,
                "bid": bidCurrency,
                "comment": comment,
                "createdDate": effectiveDateCurrency,
                "currency": apiCode

            }),
            url: url,
            cache: false,
            success: function (data) {
                //  console.log('data', data);
                console.log('Dodano');
            }
        });
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:green">Dodano pomyślnie</span>');
    }
}

//wybór waluty do wyświetlenia
function selectCurrencyToFilter(currency) {
    apiCode = currency;
}

//wybór daty "od"
function selectDateFrom() {
    dateFrom = document.getElementById("dateFrom").value;
}
//wybór daty "do"
function selectDateTo() {
    dateTo = document.getElementById("dateTo").value;
}

//zaczytuje całą tabelę
function queryCurrencyTable() {
    let url;
    $("#formularzTablica").html('');
    if (apiCode == undefined) {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates/";
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo;
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom;
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo;
        }
    }
    else {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?currency=" + apiCode;
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo + "&currency=" + apiCode;
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&currency=" + apiCode;
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo + "&currency=" + apiCode;
        }
    }
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        cache: false,
        success: function (data) {
            showCurrencyTable(data);
        }
    });
}

//wyświetla całą tabelę
function showCurrencyTable(table) {
    tablicaId = [];
    for (let i = 0; i < table.length; i++) {
        tablicaId.push(table[i].id);
        $("#formularzTablica").append(
            '<section id="showCurrencyTable">' +
            '<div>Waluta: <input type="text" id="nameCurrency" value="' + table[i].name + '"></div><br>' +
            '<div>ID: <input type="text" id="id" value="' + table[i].id + '"></div><br>' +
            '<div>Cena kupna: <input type="number" id="kupno" step="0.000001" value="' + table[i].bid + '"></div><br>' +
            '<div>Cena sprzedaży: <input type="number" id="sprzedaz" step="0.000001" value="' + table[i].ask + '"></div><br>' +
            '<div>Data utworzenia: <input id="dataUtworzenia" type="text" value="' + table[i].createdDate + '"></div><br>' +
            '<div>Komentarz: <input type="text" id="komentarz" value="' + table[i].comment + '"></div>' +
            '</section><br>'
        );
    }
}

//zaczytuje tabelę do edycji pozycji
function queryCurrencyTableToEdit() {
    let url;
    $("#formularzTablica").html('');
    if (apiCode == undefined) {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates/";
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo;
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom;
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo;
        }
    }
    else {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?currency=" + apiCode;
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo + "&currency=" + apiCode;
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&currency=" + apiCode;
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo + "&currency=" + apiCode;
        }
    }
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        cache: false,
        success: function (data) {
            showCurrencyTableToEdit(data);
        }
    });
}

//wyświetla tablice do edycji pozycji
function showCurrencyTableToEdit(table) {
    tablicaId = [];
    for (let i = 0; i < table.length; i++) {
        console.log(table[i].name);
        tablicaId.push(table[i].id);
        $("#formularzTablica").append(
            '<section id="showCurrencyTable">' +
            '<button type="submit" id="deleteButton" onclick="deleteConfirm(' + i + ')">x</button>' +
            '<div>Waluta: <input type="text" id="nameCurrency' + i + '" value="' + table[i].name + '"></div><br>' +
            '<div>API CODE: <input type="text" id="apiCode' + i + '" value="' + table[i].currency + '"></div><br>' +
            '<div>ID: <input type="text" id="id' + i + '" value="' + table[i].id + '"></div><br>' +
            '<div>Cena kupna: <input type="number" id="kupno' + i + '" step="0.000001" value="' + table[i].bid + '"></div><br>' +
            '<div>Cena sprzedaży: <input type="number" id="sprzedaz' + i + '" step="0.000001" value="' + table[i].ask + '"></div><br>' +
            '<div>Data utworzenia: <input type="text" id="dataUtworzenia' + i + '" value="' + table[i].createdDate + '"></div><br>' +
            '<div>Komentarz: <input type="text" id="komentarz' + i + '" value="' + table[i].comment + '"></div><br>' +
            '<button type="submit" id="putCurrency" onclick="putToBackend(' + i + ')">Zapisz zmiany</button>' +
            '</section><br>'
        );
    }
}

// zapisuje zmiany w pozycji
function putToBackend(poz) {
    bidCurrency = document.getElementById("kupno" + poz).value;
    askCurrency = document.getElementById("sprzedaz" + poz).value;
    comment = document.getElementById("komentarz" + poz).value;
    effectiveDateCurrency = document.getElementById("dataUtworzenia" + poz).value;
    apiCode = document.getElementById("apiCode" + poz).value;
    id = document.getElementById("id" + poz).value;
    // console.log(askCurrency + " " + bidCurrency + " " + comment + " " + effectiveDateCurrency + " " + apiCode + " " + id);
    let url = "http://localhost:8080/currencyRates/" + id;
    $.ajax({
        type: "PUT",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({

            "ask": askCurrency,
            "bid": bidCurrency,
            "comment": comment,
            "createdDate": effectiveDateCurrency,
            "currency": apiCode,
            "id": id

        }),
        url: url,
        cache: false,
        success: function (data) {
            //  console.log('data', data);
            alert("data", data);
        }
    });
    alert("Pozycję zmieniono");
}

//zapytanie czy usunąć pozycję
function deleteConfirm(deleteId) {
    if (confirm('Czy na pewno usunąć pozycję?')) {
        alert("Pozycję usunięto");
        deleteCurrency(deleteId);
    } else {
        alert("Zrezygnowano z usunięcia pozycji");
    }
}

//Usuwanie pozycji po ID
function deleteCurrency(deleteId) {
    deleteLink = tablicaId[deleteId];
    let url = "http://localhost:8080/currencyRates/" + deleteLink;
    $.ajax({
        type: "DELETE",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({
            "id": deleteLink
        }),
        url: url,
        cache: false,
        success: function (data) {
            //     queryCurrencyTable();
            alert(data);
        }
    })
    queryCurrencyTableToEdit();
}


//wybiera waluty do wykresu
function queryCurrencyTableToChart() {

    let url;
    // $("#formularzTablica").html('');
    if (apiCode == undefined) {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates/";
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo;
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom;
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo;
        }
        showChartAllCurrency(url);
    }
    else {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?currency=" + apiCode;
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo + "&currency=" + apiCode;
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&currency=" + apiCode;
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo + "&currency=" + apiCode;
        }

        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: url,
            cache: false,
            success: function (data) {

                // funkcja sortowania po dacie
                jsonDoSortowania = data;
                jsonPosortowany = jsonDoSortowania.sort(function (a, b) {
                    if (a.createdDate > b.createdDate) {
                        return 1;
                    }
                    if (a.createdDate < b.createdDate) {
                        return -1;
                    }

                    return 0;
                });

                showCurrencyChart(data);
            },

        });
    }
}


//rysowanie wykresu liniowego
function showCurrencyChart(table) {
    // console.log(table.length);
    if (table.length == 0) {
        $('#doCzyszczeniaCanvas').html('').append('<h3 style="color:red">Baza danych jest pusta</h3>')
    }
    else {
        $('#waluta-wykres').html('').append(table[0].name);
        $('#doCzyszczeniaCanvas').html('').append('<canvas id="myChart" width="900px"></canvas>');

        tablicaAsk = [];
        for (let i = 0; i < table.length; i++) {
            tablicaAsk.push(table[i].ask);
        }
        tablicaBid = [];
        for (let i = 0; i < table.length; i++) {
            tablicaBid.push(table[i].bid);
        }
        tablicaDate = [];
        for (let i = 0; i < table.length; i++) {
            tablicaDate.push(table[i].createdDate);
        }

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: tablicaDate,
                datasets: [{
                    label: 'cena sprzedaży',
                    data: tablicaAsk,
                    borderWidth: 1,
                    borderColor: '#ff0000',
                    backgroundColor: '#ff0000'
                },
                {
                    label: 'cena kupna',
                    data: tablicaBid,
                    borderWidth: 1,
                    borderColor: '#00FF00',
                    backgroundColor: '#00FF00'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
}

//rysowanie wykresu kołowego
function showChartAllCurrency() {
    let tablicaCurrency = ['USD', 'AUD', 'CAD', 'EUR', 'HUF', 'CHF', 'GBP', 'JPY', 'CZK', 'DKK', 'NOK', 'UAH', 'CNY'];
    tablicaCurrencyQuantity = [];
    let url;

    $('#waluta-wykres').html('').append("Liczba kursów w bazie danych");
    $('#doCzyszczeniaCanvas').html('').append('<canvas id="myChart" width="500px"></canvas>');

    // wypełnienie tablicy
    for (let i = 0; i < tablicaCurrency.length; i++) {
        if (dateFrom == undefined && dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?currency=" + tablicaCurrency[i];
        }
        else if (dateFrom == undefined) {
            url = "http://localhost:8080/currencyRates?createdTo=" + dateTo + "&currency=" + tablicaCurrency[i];
        }
        else if (dateTo == undefined) {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&currency=" + tablicaCurrency[i];
        }
        else {
            url = "http://localhost:8080/currencyRates?createdFrom=" + dateFrom + "&createdTo=" + dateTo + "&currency=" + tablicaCurrency[i];
        }

        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: url,
            cache: false,
            success: function (data) {

                tablicaCurrencyQuantity[i] = data.length;

                if (i == tablicaCurrency.length - 1) {
                    showAllCurrencyChart(tablicaCurrencyQuantity);
                }
            }
        });
    }
}

//wyświetlanie wykresu
function showAllCurrencyChart(date) {

    const ctx = document.getElementById('myChart');
    let tab = []
    tab = date;
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['USD', 'AUD', 'CAD', 'EUR', 'HUF', 'CHF', 'GBP', 'JPY', 'CZK', 'DKK', 'NOK', 'UAH', 'CNY'],
            datasets: [{
                label: 'liczba kursów w bazie danych',
                data: tab,
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}