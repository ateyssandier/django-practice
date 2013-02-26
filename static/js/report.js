var grossData;
var gross_chart;
var netData;
var net_chart;
var mouseXPos;
var mouseYPos;

function drawChart() {

    // Create the grossData table.
    grossData = new google.visualization.DataTable();
    grossData.addColumn('string', 'categories');
    grossData.addColumn('number', 'Dollars');
    grossData.addRows([
    ['Car', 113.61 ],
    ['Clothing', 66.70 ],
    ['Food', 60.98 ],
    ['Gas', 194.00 ],
    ['Personal Care', -35.28 ],
    ['Shopping', 621.65 ],
    ['Student Loans', 1900.35 ],
    ['Tolls', 40.00 ],
    ['Savings' , 199.88],
    ['401k' , 0.00],
    ['Federal/State Taxes' , 0.00],
    ['Healthcare' , 0.00],
    ['FICA' , 0.00]
    ]);
    // Set chart options
    var options = {'title':'Gross Paycheck Breakdown',
    'width':600,
    'height':450};


// Create the netData table.
netData = new google.visualization.DataTable();
netData.addColumn('string', 'categories');
netData.addColumn('number', 'Dollars');
netData.addRows([
['Car', 113.61 ],
['Clothing', 66.70 ],
['Food', 60.98 ],
['Gas', 194.00 ],
['Personal Care', -35.28 ],
['Shopping', 621.65 ],
['Student Loans', 1900.35 ],
['Tolls', 40.00 ],
['Savings' , 199.88]
]);
// Set chart options
var options2 = {'title':'Net Paychceck BreakDown','width':600, 'height':450};

// Instantiate and draw our chart, passing in some options.
gross_chart = new google.visualization.PieChart(document.getElementById('gross_chart_div'));
net_chart = new google.visualization.PieChart(document.getElementById('net_chart_div'));

google.visualization.events.addListener(gross_chart, 'select', grossHandler);
google.visualization.events.addListener(net_chart, 'select', netHandler);

gross_chart.draw(grossData, options);
net_chart.draw(netData, options2);
}
function grossHandler() {
    //$('#sub_net_chart_div').fadeOut(900, function() {
    // Animation complete
    //});

var selectedItem = gross_chart.getSelection()[0];
var value = grossData.getValue(selectedItem.row, 0);


// Create the netSubData table.
var netSubData = new google.visualization.DataTable();
netSubData.addColumn('string', 'categories');
netSubData.addColumn('number', 'Dollars');

eval(getWhatToAdd(value));
var options = {'title':value+' Breakdown', 'titleTextStyle':{fontSize: 20},'legend':'none', 'backgroundColor':'', 'width':400, 'height':300};
var sub_net_chart = new google.visualization.PieChart(document.getElementById('sub_net_chart_div'));
sub_net_chart.draw(netSubData, options);

//$('#sub_net_chart_div').fadeIn(900, function() {
    // Animation complete
    //});
showSubChartDivPopup('net');
}

function netHandler() {
    //$('#sub_net_chart_div').fadeOut(900, function() {
    // Animation complete
    //});

var selectedItem = net_chart.getSelection()[0];
var value = netData.getValue(selectedItem.row, 0);


// Create the netSubData table.
var netSubData = new google.visualization.DataTable();
netSubData.addColumn('string', 'categories');
netSubData.addColumn('number', 'Dollars');

eval(getWhatToAdd(value));
var options = {'title':value+' Breakdown', 'titleTextStyle':{fontSize: 20},'legend':'none', 'backgroundColor':'', 'width':400, 'height':300};
var sub_net_chart = new google.visualization.PieChart(document.getElementById('sub_net_chart_div'));
sub_net_chart.draw(netSubData, options);

//$('#sub_net_chart_div').fadeIn(900, function() {
    // Animation complete
    //});
showSubChartDivPopup('net');
}

function getWhatToAdd(value){
    if(value == 'Car'){
    return "netSubData.addRows([ ['auto insurance', 113.61 ], ])";
    }
if(value == 'Clothing'){
    return "netSubData.addRows([ ['clothing', 66.70 ], ])";
    }
if(value == 'Food'){
    return "netSubData.addRows([ ['coffee', 10.88 ], ['restaurants', 40.59 ], ['groceries', 9.51 ], ])";
    }
if(value == 'Gas'){
    return "netSubData.addRows([ ['gas', 194.00 ], ])";
    }
if(value == 'Personal Care'){
    return "netSubData.addRows([ ['hair', -35.28 ], ])";
    }
if(value == 'Shopping'){
    return "netSubData.addRows([ ['electronics', 154.75 ], ['miscellaneous', 441.27 ], ['books', 25.63 ], ])";
    }
if(value == 'Student Loans'){
    return "netSubData.addRows([ ['student loan', 1900.35 ], ])";
    }
if(value == 'Tolls'){
    return "netSubData.addRows([ ['tolls', 40.00 ], ])";
    }

}

function drawChartSummary(){
    var formatter = new google.visualization.TableNumberFormat({prefix: '$', negativeColor: 'red', negativeParens: true});
var sumData = new google.visualization.DataTable();
sumData.addColumn('string', '');
sumData.addColumn('number', 'Total');
sumData.addRows([
['Gross Paycheck', 3161.89 ],
['Takehome Pay', 3161.89 ],
['Total Expenses' , -2962.01],
['Savings' , 199.88]
]);

var table = new google.visualization.Table(document.getElementById('piechartsummary'));

formatter.format(sumData, 1);
var options = {'title':'Net Paycheck Breakdown','width':200, 'height':450, allowHTML: true};
table.draw(sumData, options);
}

function drawChartPurchases2(){
    document.getElementById('purchasesTable2').innerHTML = '<table cellpadding="0" cellspacing="0" border="0" class="purchases_table" id="purchases_table"><thead><tr><th>Date</th><th>Description</th><th class="category">Category</th><th class="category">Sub-category</th><th>Cost</th></tr></thead><tbody><tr><td>2011-06-28</td><td>SunPass</td><td class="category">Tolls</td><td class="category">tolls</td><td>$10.00</td></tr><tr><td>2011-06-28</td><td>McDonald\'s</td><td class="category">Food</td><td class="category">coffee</td><td>$1.06</td></tr><tr><td>2011-06-25</td><td>Cafe De France</td><td class="category">Food</td><td class="category">restaurants</td><td>$30.14</td></tr><tr><td>2011-06-23</td><td>Cumberland Farms - Gas</td><td class="category">Gas</td><td class="category">gas</td><td>$43.00</td></tr><tr><td>2011-06-22</td><td>McDonald\'s</td><td class="category">Food</td><td class="category">coffee</td><td>$1.06</td></tr><tr><td>2011-06-21</td><td>Educational Comp Des</td><td class="category">Student Loans</td><td class="category">student loan</td><td>$1533.25</td></tr><tr><td>2011-06-20</td><td>Barnes & Noble</td><td class="category">Food</td><td class="category">coffee</td><td>$2.98</td></tr><tr><td>2011-06-20</td><td>SunPass</td><td class="category">Tolls</td><td class="category">tolls</td><td>$10.00</td></tr><tr><td>2011-06-17</td><td>374.14</td><td class="category">Shopping</td><td class="category">miscellaneous</td><td>$374.14</td></tr><tr><td>2011-06-17</td><td>Vehicle Registration</td><td class="category">Car</td><td class="category">auto insurance</td><td>$58.35</td></tr><tr><td>2011-06-17</td><td>Car Insurance</td><td class="category">Car</td><td class="category">auto insurance</td><td>$55.26</td></tr><tr><td>2011-06-17</td><td>Tmobile</td><td class="category">Shopping</td><td class="category">miscellaneous</td><td>$41.82</td></tr><tr><td>2011-06-17</td><td>Wal-Mart</td><td class="category">Shopping</td><td class="category">miscellaneous</td><td>$25.31</td></tr><tr><td>2011-06-16</td><td>Chevron</td><td class="category">Gas</td><td class="category">gas</td><td>$40.00</td></tr><tr><td>2011-06-16</td><td>McDonald\'s - Coffee</td><td class="category">Food</td><td class="category">coffee</td><td>$1.06</td></tr><tr><td>2011-06-14</td><td>SunPass</td><td class="category">Tolls</td><td class="category">tolls</td><td>$10.00</td></tr><tr><td>2011-06-13</td><td>Exxon - Gas</td><td class="category">Gas</td><td class="category">gas</td><td>$40.00</td></tr><tr><td>2011-06-13</td><td>Sallie Mae</td><td class="category">Student Loans</td><td class="category">student loan</td><td>$82.28</td></tr><tr><td>2011-06-13</td><td>Sallie Mae</td><td class="category">Student Loans</td><td class="category">student loan</td><td>$84.82</td></tr><tr><td>2011-06-11</td><td>Rotelli Pizza & Pasta - Lunch with Velitas</td><td class="category">Food</td><td class="category">restaurants</td><td>$10.45</td></tr><tr><td>2011-06-10</td><td>Staples - Micro usb reader</td><td class="category">Shopping</td><td class="category">electronics</td><td>$7.41</td></tr><tr><td>2011-06-10</td><td>McDonald\'s</td><td class="category">Food</td><td class="category">coffee</td><td>$1.06</td></tr><tr><td>2011-06-09</td><td>Barnes & Noble - Nook</td><td class="category">Shopping</td><td class="category">electronics</td><td>$147.34</td></tr><tr><td>2011-06-08</td><td>Whole Foods</td><td class="category">Food</td><td class="category">groceries</td><td>$9.51</td></tr><tr><td>2011-06-07</td><td>Barnes & Noble</td><td class="category">Food</td><td class="category">coffee</td><td>$1.54</td></tr><tr><td>2011-06-07</td><td>Barnes & Noble</td><td class="category">Shopping</td><td class="category">books</td><td>$20.96</td></tr><tr><td>2011-06-07</td><td>Ross</td><td class="category">Clothing</td><td class="category">clothing</td><td>$26.46</td></tr><tr><td>2011-06-07</td><td>Collegiate Funding Svcs - Chase</td><td class="category">Student Loans</td><td class="category">student loan</td><td>$200.00</td></tr><tr><td>2011-06-06</td><td>Sunshine - Gas</td><td class="category">Gas</td><td class="category">gas</td><td>$43.00</td></tr><tr><td>2011-06-06</td><td>Barnes & Noble - Harry Potter and Philosophy</td><td class="category">Shopping</td><td class="category">books</td><td>$4.67</td></tr><tr><td>2011-06-03</td><td>SunPass</td><td class="category">Tolls</td><td class="category">tolls</td><td>$10.00</td></tr><tr><td>2011-06-02</td><td>McDonald\'s</td><td class="category">Food</td><td class="category">coffee</td><td>$1.06</td></tr><tr><td>2011-06-01</td><td>Ross</td><td class="category">Clothing</td><td class="category">clothing</td><td>$40.24</td></tr><tr><td>2011-06-01</td><td>CVS</td><td class="category">Personal Care</td><td class="category">hair</td><td>$-35.28</td></tr><tr><td>2011-06-01</td><td>Chevron - Gas</td><td class="category">Gas</td><td class="category">gas</td><td>$28.00</td></tr><tr><td>2011-06-01</td><td>McDonald\'s - Coffee</td><td class="category">Food</td><td class="category">coffee</td><td>$1.06</td></tr></tbody><tfoot><tr><th style="text-align:right" colspan="4">Total:</th><th></th></tr></tfoot></table>';

    $('#purchases_table').dataTable( {
    'bPaginate': false,
    'bLengthChange': false,
    'bFilter': true,
    'bSort': true,
    'bInfo': false,
    'bAutoWidth': false,
    'aaSorting': [[ 1, 'desc' ]],
    'fnFooterCallback': function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

    /* Calculate the market share for browsers on this page */
    var iPageMarket = 0;
    for ( var i=iStart ; i<iEnd ; i++ )
    {
    var temp = aaData[ aiDisplay[i] ][4];
    temp = temp.substring(1);
    temp = parseFloat(temp);

    var factor = Math.pow(10,2);
    temp =  Math.floor(temp*factor+((temp*factor*10)%10>=5?1:0));
    iPageMarket +=  temp;
    }

/* Modify the footer row to match what we want */
var nCells = nRow.getElementsByTagName('th');
nCells[1].innerHTML = '$' + iPageMarket/100;
}
} );
}

function drawChartPaycheck(){
    document.getElementById('paycheckTable').innerHTML = '<table cellpadding="0" cellspacing="0" border="0" class="purchases_table" id="paychecks_table"><thead><tr><th class="date">Date</th><th class="gross">Gross</th><th class="deductions">Tax</th><th class="deductions">Healthcare</th><th class="deductions">FICA</th><th class="deductions">401K</th><th class="total_deducts">Deductions</th><th class="net">Net</th></tr></thead><tbody><tr><td class="date">2011-06-24</td><td class="gross">\$1607.03</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="total_deducts">-$0</td><td class="net">\$1607.03</td></tr><tr><td class="date">2011-06-17</td><td class="gross">\$700.46</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="total_deducts">-$0</td><td class="net">\$700.46</td></tr><tr><td class="date">2011-06-10</td><td class="gross">\$854.40</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="deductions">-\$0.00</td><td class="total_deducts">-$0</td><td class="net">\$854.4</td></tr></tbody><tfoot><tr><th class="date" style="text-align:right">Totals:</th><th class="gross"></th><th class="deductions"></th><th class="deductions"></th><th class="deductions"></th><th class="deductions"></th><th class="total_deducts"></th><th class="net"></th></tr></tfoot></table>';

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
    for ( var i=iStart ; i<iEnd ; i++ )
    {
    var temp = aaData[ aiDisplay[i] ][1];
    temp = temp.substring(1);
    temp = parseFloat(temp);
    gross +=  temp;


    temp = aaData[ aiDisplay[i] ][2];
    temp = temp.substring(2);
    temp = parseFloat(temp);
    tax +=  temp;

    temp = aaData[ aiDisplay[i] ][3];
    temp = temp.substring(2);
    temp = parseFloat(temp);
    healthcare +=  temp;

    temp = aaData[ aiDisplay[i] ][4];
    temp = temp.substring(2);
    temp = parseFloat(temp);
    fica +=  temp;

    temp = aaData[ aiDisplay[i] ][5];
    temp = temp.substring(2);
    temp = parseFloat(temp);
    k401 +=  temp;

    temp = aaData[ aiDisplay[i] ][6];
    temp = temp.substring(2);
    temp = parseFloat(temp);
    totalDeductions +=  temp;

    temp = aaData[ aiDisplay[i] ][7];
    temp = temp.substring(1);
    temp = parseFloat(temp);
    net +=  temp;

    }

/* Modify the footer row to match what we want */
var nCells = nRow.getElementsByTagName('th');
nCells[1].innerHTML = '$' + gross;
nCells[2].innerHTML = '$' + tax;
nCells[3].innerHTML = '$' + healthcare;
nCells[4].innerHTML = '$' + fica;
nCells[5].innerHTML = '$' + k401;
nCells[6].innerHTML = '$' + totalDeductions;
nCells[7].innerHTML = '$' + net;
}
});
}
drawChart();
drawChartSummary();
drawChartPurchases2();
drawChartPaycheck();

$('#allreports').fadeIn(900, function() {
    // Animation complete
    });


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

$(document).ready( function(){
    $(document).bind('click', function(e) {
        var clicked = $(e.target);

        if (!clicked.parents().hasClass('subChart')){

            var background_overlay = document.getElementById('background_overlay');
            background_overlay.style.display = 'none';

            var addlabelpopup2 = document.getElementById('sub_net_chart_div');

            addlabelpopup2.style.display = 'none';

        }
});
});
