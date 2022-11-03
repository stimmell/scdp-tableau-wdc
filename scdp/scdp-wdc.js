(function () {
    var wdc = tableau.makeConnector();
    
    wdc.getSchema = function (schemaCallback) {    
        var data = JSON.parse(tableau.connectionData);

        $.ajax({
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "Bearer " + data.token);
            },
            dataType: "json",
            url: "https://dev.llama.ai/api/modeling/api/v3/Models/1e78b4dd-61c7-4ffe-affa-ba6de7bf7414/Table/sites/Columns",
            success: function(response) {
                var columns = [];
    
                for (var i = 0, len = response.length; i < len; i++) {
                    columns.push({
                        id: response[i].columnName,
                        alias: response[i].displayName,
                        dataType: tableau.dataTypeEnum.string
                    });
                }

                var scdpTable = {
                    id: "scdpTable",
                    alias: "SCDP Data",
                    columns: columns
                };

                // can pass multiple tables at once
                schemaCallback([scdpTable]);
            }
        });
    };

    wdc.getData = function (table, doneCallback) {
        var data = JSON.parse(tableau.connectionData);

        $.ajax({
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "Bearer " + data.token);
            },
            dataType: "json",
            url: "https://dev.llama.ai/api/modeling/api/v3/Models/1e78b4dd-61c7-4ffe-affa-ba6de7bf7414/Table/sites",
            success: function(response) {
                var rows = [];
                
                if (table.tableInfo.id == "scdpTable") {
                    for (i = 0, len = response.data.length; i < len; i++) {
                        var row = {};

                        // iterate over properties to extract name and value
                        for (const item of Object.entries(response.data[i])) {
                            row[item[0]] = response.data[i][item[0]].value;
                        }
                        
                        rows.push(row);
                    }
                }

                table.appendRows(rows);
                doneCallback();
            }
        });
    };

    tableau.registerConnector(wdc);
})();

$(document).ready(function () {
    $("#submit").click(function () {
        var data = { token: $("#token").val() };
        tableau.connectionData = JSON.stringify(data);
        tableau.connectionName = "SCDP";
        tableau.submit();
    });
});