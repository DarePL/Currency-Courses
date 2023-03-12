let askCurrency, bidCurrency, apiCurrency, effectiveDateCurrency, comment, apiCode;
//ustawia aktualną datę
var date = new Date();
if (date.getMonth() + 1 < 10) {
    dataDodania = date.getFullYear() + "-" + "0" + (date.getMonth() + 1) + "-" + date.getDate();
}
else {
    dataDodania = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

// console.log(dataDodania);
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
    //  konsola();
}

function konsola() {
    console.log(apiCurrency + " " + askCurrency + " " + bidCurrency + " " + effectiveDateCurrency + " " + apiCode);
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
    $("#selectedCurrency").html('');
    $("#selectedCurrency").append(currency);
    $("#dataKursu").html('');
    $("#dataKursu").append('Data kursu: <input type="text" value="2023-03-12" id="courseDate">');
    $("#courseDate").append(dataDodania);
    askCurrency = 0;
    bidCurrency = 0;
    comment = "Przykładowy komentarz";
    effectiveDateCurrency = dataDodania;
    apiCode = currency;
}
//Dodawanie ręczne do backendu
function handAddToBackend() {
    bidCurrency = document.getElementById("kupno").value;
    askCurrency = document.getElementById("sprzedaz").value;
    comment = document.getElementById("komentarz").value;
    console.log("Waluta: " + apiCode + ", Cena kupna: " + bidCurrency + ", Cena sprzedaży: " + askCurrency + ", Komentarz: " + '"' + comment + '"' + ", Data kursu: " + dataDodania);
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
                "createdDate": dataDodania,
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
