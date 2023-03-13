let askCurrency, bidCurrency, apiCurrency, effectiveDateCurrency, comment, apiCode;
let tablicaId = [];

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
        success: function (data) {
            //  console.log('data', data);
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
            success: function (data) {
                //  console.log('data', data);
                console.log('Dodano');
            }
        });
        $('#addCurrencyToBackend').html('');
        $('#addCurrencyToBackend').append('<br><span style="color:green">Dodano pomyślnie</span>');
    }
}

//zaczytuje całą tabelę
function queryCurrencyTable() {
    $("#formularzTablica").html('');
    let url = "http://localhost:8080/currencyRates";
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        success: function (data) {
            showCurrencyTable(data)
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
            '<button type="submit" id="deleteButton" onclick="deleteConfirm(' + i + ')">x</button>' +
            '<div>Waluta: <input type="text" id="nameCurrency" value="' + table[i].name + '"></div><br>' +
            '<div>ID: <input type="text" id="id" value="' + table[i].id + '"></div><br>' +
            '<div>Cena kupna: <input type="number" id="kupno" step="0.000001" value="' + table[i].bid + '"></div><br>' +
            '<div>Cena sprzedaży: <input type="number" id="sprzedaz" step="0.000001" value="' + table[i].ask + '"></div><br>' +
            '<div>Data utworzenia: <input type="text" value="' + table[i].createdDate + '"></div><br>' +
            '<div>Komentarz: <input type="text" id="komentarz" value="' + table[i].comment + '"></div>' +
            '</section><br>'
        );
    }
}

//zapytanie czy usunąć pozycję
function deleteConfirm(deleteId) {
    if (confirm("Czy na pewno usunąć pozycję?")) {
        deleteCurrency(deleteId);
    } else {
        alert("Zrezygnowano z usunięcia pozycji");
    }
}

//Usuwanie pozycji po ID
function deleteCurrency(deleteId) {
    let deleteLink = tablicaId[deleteId];
    let url = "http://localhost:8080/currencyRates/" + deleteLink;
    $.ajax({
        type: "DELETE",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({
            "id": deleteLink
        }),
        url: url,
    })
    queryCurrencyTable();
}

