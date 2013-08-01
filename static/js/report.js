var superData;
var super_chart;
var subData;
var sub_chart;
var bdData;
var bd_chart;


function drawChart(gross_array) {
    "use strict";

    //gross_array
    /*[
     ['Car', 113.61 ],
     ['Clothing', 66.70 ],
     ['Food', 60.98 ],
     ['Gas', 194.00 ],
     ['Personal Care', -35.28 ],
     ['Shopping', 621.65 ],
     ['Student Loans', 1900.35 ],
     ['Tolls', 40.00 ],
     ['Savings' , 199.88],
     ]*/



    // Create the superData table.
        superData = new google.visualization.DataTable();
        superData.addColumn('string', 'categories');
        superData.addColumn('number', 'Dollars');
        superData.addRows(gross_array);
        // Set chart options
        var options = {'title':'General Expenses',
                     'width':600,
                     'height':450};


    // Create the subData table.
        //    subData = new google.visualization.DataTable();
        //    subData.addColumn('string', 'categories');
        //    subData.addColumn('number', 'Dollars');
        // Set chart options
        //var options2 = {'title':'Specific Expenses','width':600, 'height':450};



    // Create the bdData table.
        //    bdData = new google.visualization.DataTable();
        //    bdData.addColumn('string', 'categories');
        //    bdData.addColumn('number', 'Dollars');
        // Set chart options
        //  var options3 = {'title':'Paycheck Breakdown','width':600, 'height':450};

    // Instantiate and draw our chart, passing in some options.
    super_chart = new google.visualization.PieChart(document.getElementById('super_chart_div'));
    //sub_chart = new google.visualization.PieChart(document.getElementById('sub_chart_div'));
    //bd_chart = new google.visualization.PieChart(document.getElementById('bd_chart_div'));

    google.visualization.events.addListener(super_chart, 'select', superHandler);
    //google.visualization.events.addListener(sub_chart, 'select', subHandler);
    //google.visualization.events.addListener(bd_chart, 'select', bdHandler);

    super_chart.draw(superData, options);
    //sub_chart.draw(subData, options2);
    //bd_chart.draw(bdData, options3);
}

 function superHandler() {
     "use strict";

    var selectedItem = super_chart.getSelection()[0];
    var value = superData.getValue(selectedItem.row, 0);


     // Create the netSubData table.
    var netSubData = new google.visualization.DataTable();
    netSubData.addColumn('string', 'categories');
    netSubData.addColumn('number', 'Dollars');

    var sub_array = getSubArray(value);

    netSubData.addRows(sub_array);
    var options = {'title':value+' Breakdown', 'titleTextStyle':{fontSize: 20},'legend':'none', 'backgroundColor':'', 'width':400, 'height':300};
    var sub_net_chart = new google.visualization.PieChart(document.getElementById('sub_net_chart_div'));
    sub_net_chart.draw(netSubData, options);

    showSubChartDivPopup('net');
}

function subHandler() {
    "use strict";

    var selectedItem = net_chart.getSelection()[0];
    var value = subData.getValue(selectedItem.row, 0);


    // Create the netSubData table.
    var netSubData = new google.visualization.DataTable();
    netSubData.addColumn('string', 'categories');
    netSubData.addColumn('number', 'Dollars');

    var options = {'title':value+' Breakdown', 'titleTextStyle':{fontSize: 20},'legend':'none', 'backgroundColor':'', 'width':400, 'height':300};
    var sub_net_chart = new google.visualization.PieChart(document.getElementById('sub_net_chart_div'));
    sub_net_chart.draw(netSubData, options);

    showSubChartDivPopup('net');
}

function getSubArray(superCategory){
    "use strict";
    var newArray = new Array();

    var newurl = "/getsubchart/";
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value');


    $.ajax({
        type: "POST",
        url: newurl,
        async: false,
        data: { from: from, to: to, super_category: superCategory },
        success: function(data){
            var response = data;
            newArray = convertToArray(response.sub_transaction_array)
        },
        dataType: 'json',
        beforeSend: function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

    return newArray;

}

function drawChartSummary(summary_data){
    //summary_data
    /*[
     ['Gross Paycheck', 3161.89 ],
     ['Takehome Pay', 3161.89 ],
     ['Total Expenses' , -2962.01],
     ['Savings' , 199.88]
     ]
     */

    var formatter = new google.visualization.TableNumberFormat({prefix: '$', negativeColor: 'red', negativeParens: true});
    var sumData = new google.visualization.DataTable();
    sumData.addColumn('string', '');
    sumData.addColumn('number', 'Total');
    sumData.addRows(summary_data);
    var table = new google.visualization.Table(document.getElementById('piechartsummary'));

    formatter.format(sumData, 1);
    var options = {'title':'Net Paycheck Breakdown','width':200, 'height':450, allowHTML: true};
    table.draw(sumData, options);
}

function drawChartPurchases2(transaction_list){
    "use strict";
    var newurl = "/getpurchasestable/";
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value');

    $('#purchasesTable2').load('/getpurchasestable?from='+from+'&to='+to, function(){

        $('#purchases_table').dataTable( {
            'bPaginate': false,
            'bLengthChange': false,
            'bFilter': true,
            'bSort': true,
            'bInfo': false,
            'bAutoWidth': false,
            'aaSorting': [[ 0, 'desc' ]],
            'fnFooterCallback': function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                /* Calculate the total cost on this page */
                var iPageMarket = 0;
                for ( var i=iStart ; i<iEnd ; i++ ){
                    var temp = aaData[ aiDisplay[i] ][4];
                    temp = temp.substring(1);
                    temp = temp.replace(',','');
                    temp = parseFloat(temp);
                    var factor = Math.pow(10,2);
                    temp =  Math.floor(temp*factor+((temp*factor*10)%10>=5?1:0));
                    iPageMarket +=  temp;
                }

                /* Modify the footer row to match what we want */
                var nCells = nRow.getElementsByTagName('th');
                nCells[1].innerHTML = '$' + (iPageMarket/100).toFixed(2);
            }
        } );
    });
}

function drawChartPaycheck(){
    var newurl = "/getpaycheckstable/";
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value');

    $('#paycheckTable').load('/getpaycheckstable?from='+from+'&to='+to, function(){

        $('#paychecks_table').dataTable( {
                'bPaginate': false,
                'bLengthChange': false,
                'bFilter': false,
                'bSort': true,
                'bInfo': false,
                'bAutoWidth': false,
                'aaSorting': [[ 0, 'asc' ]],
                'fnFooterCallback': function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                    var gross = 0;
                    var tax = 0;
                    var healthcare = 0;
                    var fica = 0;
                    var k401 = 0;
                    var totalDeductions = 0;
                    var net = 0;
                    for ( var i=iStart ; i<iEnd ; i++ ){
                        var temp = aaData[ aiDisplay[i] ][1];
                        temp = temp.substring(1);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);


                        gross +=  temp;

                        temp = aaData[ aiDisplay[i] ][2];
                        temp = temp.substring(2);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);
                        tax +=  temp;

                        temp = aaData[ aiDisplay[i] ][3];
                        temp = temp.substring(2);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);
                        healthcare +=  temp;

                        temp = aaData[ aiDisplay[i] ][4];
                        temp = temp.substring(2);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);
                        fica +=  temp;

                        temp = aaData[ aiDisplay[i] ][5];
                        temp = temp.substring(2);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);
                        k401 +=  temp;

                        temp = aaData[ aiDisplay[i] ][6];
                        temp = temp.substring(2);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);
                        totalDeductions +=  temp;

                        temp = aaData[ aiDisplay[i] ][7];
                        temp = temp.substring(1);
                        temp = temp.replace(',','');
                        temp = parseFloat(temp);
                        net +=  temp;

                    }

                    /* Modify the footer row to match what we want */
                    var nCells = nRow.getElementsByTagName('th');
                    nCells[1].innerHTML = '$' + gross.toFixed(2);
                    nCells[2].innerHTML = '$' + tax.toFixed(2);
                    nCells[3].innerHTML = '$' + healthcare.toFixed(2);
                    nCells[4].innerHTML = '$' + fica.toFixed(2);
                    nCells[5].innerHTML = '$' + k401.toFixed(2);
                    nCells[6].innerHTML = '$' + totalDeductions.toFixed(2);
                    nCells[7].innerHTML = '$' + net.toFixed(2);
                }
        });

    });
}

function drawLargeSummary(income, expenses, savings){
    var savingsclass = 'income';
    if(savings < 0){
        savingsclass='expenses';
    }
    $('#income').html("$"+income);
    $('#expenses').html("$"+expenses);
    $('#savings').html("$"+parseFloat(savings).toFixed(2));
    $("#savings").attr('class', savingsclass);

}


function drawBudget(){
    "use strict";
    var newurl = "/get_budget_status/";
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value');

    $.ajax({
        type: "POST",
        url: newurl,
        async: false,
        data: { from: from, to: to },
        success: function(data){
            var response = data;
            var budget_map = response.budget_map;

            var animated_progress = function progress(percent, $element) {
                var progressBarWidth = percent * $element.width() / 100;
                $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "%&nbsp;");
            }

            for (var key in budget_map) {
                if (budget_map.hasOwnProperty(key)) {
                    var div_name = '#'+key+'_progressbar';
                    var max_val = $(div_name).attr("data-max");
                    $('#'+key+'_progressbar').html('$'+max_val)
                    var percentage = budget_map[key].toFixed(2);
                    animated_progress(percentage, $(div_name));
                }
            }

        },
        dataType: 'json',
        beforeSend: function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });
}

function showSubChartDivPopup(which){

    //hide the background by displaying the overlay
    var background_overlay = document.getElementById('background_overlay');
    background_overlay.style.display = 'inline';

    var addlabelpopup1;
    addlabelpopup1 = document.getElementById('sub_net_chart_div');



    // w is a width of the addlabelpopup1 panel
    w = 400;
    // h is a height of the addlabelpopup1 panel
    h = 300;
    // get the x and y coordinates to center the addlabelpopup1 panel

    xc = Math.round((window.innerWidth/2)-(w/2));
    yc = Math.round(($(window).scrollTop()+(window.innerHeight/2))-(h/2));
    // show the addlabelpopup1 panel
    addlabelpopup1.style.left = xc + 'px';
    addlabelpopup1.style.top = yc + 'px';
    addlabelpopup1.style.display = 'block';
}

/*$(document).ready( function(){
    $(document).bind('click', function(e) {
        var clicked = $(e.target);

        if (!clicked.parents().hasClass('subChart')){

            var background_overlay = document.getElementById('background_overlay');
            background_overlay.style.display = 'none';

            var addlabelpopup2 = document.getElementById('sub_net_chart_div');

            addlabelpopup2.style.display = 'none';

        }
    });
});*/
