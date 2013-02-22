<?php

$from=$_GET["from"];
$to=$_GET["to"];


#temporary for commandline teseting
#$from='2011-6-1';
#$to='2011-6-30';

$con = mysql_connect('localhost', 'budgeter', 'alwayspoor');
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }
mysql_select_db("budget", $con);



//$view = "(purchases.rcpt_no = receipt.rcpt_no)";
$catview = "(purchases.category = category.category_id)";
$datestring = "date BETWEEN '$from' and '$to'";
#use date, not receipt.date fo ruse in paycheck queries

#PURCHASES SECTION
$query = "SELECT date, item_desc as description, category.supercategory as supercategory, category.subcategory as subcategory, cost FROM purchases LEFT JOIN category ON $catview WHERE $datestring";
$result = mysql_query($query);

$tableHTML = '<table cellpadding="0" cellspacing="0" border="0" class="purchases_table" id="purchases_table">';
$tableHTML = $tableHTML.'<thead>';
$tableHTML = $tableHTML.'<tr>';
$tableHTML = $tableHTML.'<th>Date</th>';
$tableHTML = $tableHTML.'<th>Description</th>';
$tableHTML = $tableHTML.'<th class="category">Category</th>';
$tableHTML = $tableHTML.'<th class="category">Sub-category</th>';
$tableHTML = $tableHTML.'<th>Cost</th>';
$tableHTML = $tableHTML.'</tr>';
$tableHTML = $tableHTML.'</thead>';
$tableHTML = $tableHTML.'<tbody>';



while($row = mysql_fetch_array($result)){
    $tableHTML = $tableHTML.'<tr>';
    $date = $row['date'];
    $desc = $row['description'];
    $supercat = $row['supercategory'];
    $subcat = $row['subcategory'];
    $cost = '$'.$row['cost'];

    #replace ' with \' in description
    $desc = str_replace("'", "\'", $desc);

    $tableHTML=$tableHTML."<td>$date</td>";
    $tableHTML=$tableHTML."<td>$desc</td>";
    $tableHTML=$tableHTML."<td class=\"category\">$supercat</td>";
    $tableHTML=$tableHTML."<td class=\"category\">$subcat</td>";
    $tableHTML=$tableHTML."<td>$cost</td>";

    $tableHTML=$tableHTML."</tr>";

    }
$tableHTML=$tableHTML."</tbody><tfoot>";
$tableHTML=$tableHTML.'<tr><th style="text-align:right" colspan="4">Total:</th><th></th></tr>';
$tableHTML=$tableHTML."</tfoot></table>";







#PIE CHARTS SECTION
$subcategories = array();
$subcattotals = array();

$supercategories = array();
$supertotals = array();

$associativearray = array();

$takehomepay = 0;
$savings = 0;
$totalspent = 0;

$gross_sum = 0;
$tax_sum =  0;
$healthcare_sum =  0;
$fica_sum = 0;
$k401_sum = 0;



#query for paycheck deductions
$query = "SELECT SUM(gross) as gross, SUM(tax) as tax, SUM(healthcare) as healthcare, SUM(fica) as fica, SUM(k401) as k401 from paychecks where $datestring;";
$result = mysql_query($query);
while($row = mysql_fetch_array($result)){
    if(($gross_sum = $row['gross']) == ''){
    $gross_sum = 0;
    }
if(($tax_sum =  $row['tax']) == ''){
                $tax_sum = 0;
            }
            if(($healthcare_sum =  $row['healthcare']) == ''){
                $healthcare_sum = 0;
            }
            if(($fica_sum = $row['fica']) == ''){
                $fica_sum = 0;
            }
            if(($k401_sum = $row['k401']) == ''){
                $k401_sum = 0;
            }
        }




    #query purchases for category purchases
        $query = "SELECT SUM(cost) as cost, category.subcategory as category FROM purchases LEFT JOIN category ON $catview WHERE $datestring GROUP BY category.subcategory;";
        $result = mysql_query($query);
        while($row = mysql_fetch_array($result)){
            array_push($subcategories, $row['category']);
            array_push($subcattotals, $row['cost']);
        }

        $query = "SELECT SUM(cost) as cost, category.supercategory as category FROM purchases LEFT JOIN category ON $catview WHERE $datestring GROUP BY category.supercategory;";
        $result = mysql_query($query);
        while($row = mysql_fetch_array($result)){
            array_push($supercategories, $row['category']);
            array_push($supertotals, $row['cost']);
        }



        #create an supercategory array with supercateogry and substring
        #for each category in supercategories
        $counter =0;
        for($counter=0; $counter<count($supercategories); $counter++){
            #create an entry in the associative array entry with the supercategory name
            $supercategorykey = $supercategories[$counter];
            $supercategoryvalue = "netSubData.addRows([ ";

            #select all the subcategories with that supercategory
            $query = "SELECT subcategory from category WHERE supercategory = '$supercategorykey';";
            $result = mysql_query($query);
            while($row = mysql_fetch_array($result)){
                $tempsubcat = $row['subcategory'];
                $subcounter = 0;
                #go through the subcategories arrray
                for($subcounter = 0; $subcounter<count($subcategories); $subcounter++){
                    #if the subcategories name equals the supercategory
                    if($subcategories[$subcounter] == $tempsubcat){
                        #get the cost from the subcategories and build the string
                        $supercategoryvalue = $supercategoryvalue."['$tempsubcat', $subcattotals[$subcounter] ], ";
                    }
                }
            }
            $supercategoryvalue = $supercategoryvalue."])";


            #add the sting to the supercategories associative array
            $associativearray[$supercategorykey]=$supercategoryvalue;
            //print "$supercategorykey ::: $associativearray[$supercategorykey]\n\n\n\n";
        }
        $functionContents = "";
        $keys = array_keys($associativearray);
        foreach ($keys as $key){
            $functionContents = $functionContents."if(value == '$key'){\nreturn \"$associativearray[$key]\";\n}\n";
        }


    #get takehomepay
    $takehomepay = $gross_sum - ($tax_sum + $healthcare_sum + $fica_sum + $k401_sum);
    #totalspent: not used in any charts, but still useful;
    $totalspent = array_sum($supertotals);

    #get savings
    $savings = $takehomepay - $totalspent;

    #super piechart
        #401k, healthcare, fica, eachcategory, savings, , tax
        //build the  categories column string
        $categoriesString = "superData.addRows([\n";
        $counter =0;

        for($counter = 0; $counter<count($supercategories); $counter++){
            $temptotal = 0;
            if($supertotals[$counter] > 0){
  		$temptotal = $supertotals[$counter];
            }
            $categoriesString = $categoriesString."['$supercategories[$counter]', $temptotal ],\n";
        }
        if($savings > 0){
            $categoriesString = $categoriesString."['Savings' , $savings],\n";
        }

        //$categoriesString = $categoriesString."['401k' , $k401_sum],\n";
        //$categoriesString = $categoriesString."['Federal/State Taxes' , $tax_sum],\n";
        //$categoriesString = $categoriesString."['Healthcare' , $healthcare_sum],\n";
        //$categoriesString = $categoriesString."['FICA' , $fica_sum],\n";
        $categoriesString = $categoriesString."]);";

    #sub PIECHART
        #eachcategory, savings,
	$categoriesStringNet = "";
        #$categoriesStringNet = "subData.addRows([\n";
        #$counter =0;
        #for($counter = 0; $counter<count($subcategories); $counter++){
        #    $temptotal = 0;
        #    if($subcattotals[$counter] > 0){
	#	$temptotal = $subcattotals[$counter];
        #    }
        #    $categoriesStringNet = $categoriesStringNet."['$subcategories[$counter]', $temptotal ],\n";
        #}
        //if($savings >= 0){
        //    $categoriesStringNet = $categoriesStringNet."['Savings' , $savings]\n";
        //}
        #$categoriesStringNet = $categoriesStringNet."]);";

     #TODO: Paycheck breakdown piechart
     #   $categoriesStringBD = "bdData.addRows([\n";
        $categoriesStringBD = "";
     #   $counter =0;

	#breakdown into Clothing, Household Bills (plus gym), Food(), Housing, Auto and Transportation, loans, other, savings

     #   for($counter = 0; $counter<count($supercategories); $counter++){
     #       $temptotal = 0;
     #       if($supertotals[$counter] > 0){
     #           $temptotal = $supertotals[$counter];
     #       }
     #       $categoriesString = $categoriesString."['$supercategories[$counter]', $temptotal ],\n";
     #   }
     #   if($savings > 0){
     #       $categoriesString = $categoriesString."['Savings' , $savings],\n";
     #   }



#PAYCHECKS SECTION
    $query  = "SELECT date, gross, tax, healthcare, fica, k401 from paychecks WHERE $datestring;";
    $result = mysql_query($query);

    $tableHTMLpaycheck = '<table cellpadding="0" cellspacing="0" border="0" class="purchases_table" id="paychecks_table">';
$tableHTMLpaycheck = $tableHTMLpaycheck.'<thead>';
    $tableHTMLpaycheck = $tableHTMLpaycheck.'<tr>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="date">Date</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="gross">Gross</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="deductions">Tax</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="deductions">Healthcare</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="deductions">FICA</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="deductions">401K</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="total_deducts">Deductions</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<th class="net">Net</th>';
        $tableHTMLpaycheck = $tableHTMLpaycheck.'</tr>';
    $tableHTMLpaycheck = $tableHTMLpaycheck.'</thead>';
$tableHTMLpaycheck = $tableHTMLpaycheck.'<tbody>';



    while($row = mysql_fetch_array($result)){
        $tableHTMLpaycheck = $tableHTMLpaycheck.'<tr>';
        $date = $row['date'];
        $gross = $row['gross'];
        $gross = number_format($gross, 2, ".", "");
        $tax = $row['tax'];
        $tax = number_format($tax, 2, ".", "");
        $healthcare = $row['healthcare'];
        $healthcare = number_format($healthcare, 2, ".", "");
        $fica = $row['fica'];
        $fica = number_format($fica, 2, ".", "");
        $k401 = $row['k401'];
        $k401 = number_format($k401, 2, ".", "");



        $total_deducts = $tax+$healthcare+$fica+$k401;
        $net = $gross - $total_deducts;

        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="date">'.$date.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="gross">\$'.$gross.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="deductions">-\$'.$tax.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="deductions">-\$'.$healthcare.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="deductions">-\$'.$fica.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="deductions">-\$'.$k401.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="total_deducts">-$'.$total_deducts.'</td>';
        $tableHTMLpaycheck=$tableHTMLpaycheck.'<td class="net">\$'.$net.'</td>';

        $tableHTMLpaycheck=$tableHTMLpaycheck."</tr>";

        }
    $tableHTMLpaycheck=$tableHTMLpaycheck."</tbody><tfoot>";
    $tableHTMLpaycheck=$tableHTMLpaycheck.'<tr><th class="date" style="text-align:right">Totals:</th><th class="gross"></th><th class="deductions"></th><th class="deductions"></th><th class="deductions"></th><th class="deductions"></th><th class="total_deducts"></th><th class="net"></th></tr>';
    $tableHTMLpaycheck=$tableHTMLpaycheck."</tfoot></table>";




$hello = "alert('hello world');";
$response =  "
//<script id='testid' type='text/javascript'>
var superData;
var super_chart;
var subData;
var sub_chart;
var bdData;
var bd_chart;
var mouseXPos;
var mouseYPos;

function drawChart() {

    // Create the superData table.
    superData = new google.visualization.DataTable();
    superData.addColumn('string', 'categories');
    superData.addColumn('number', 'Dollars');
    $categoriesString
    // Set chart options
    var options = {'title':'General Expenses',
    'width':600,
    'height':450};


// Create the subData table.
//    subData = new google.visualization.DataTable();
//    subData.addColumn('string', 'categories');
//    subData.addColumn('number', 'Dollars');
$categoriesStringNet
// Set chart options
var options2 = {'title':'Specific Expenses','width':600, 'height':450};

// Create the bdData table.
//    bdData = new google.visualization.DataTable();
//    bdData.addColumn('string', 'categories');
//    bdData.addColumn('number', 'Dollars');
$categoriesStringBD //TODO: create categoriesStringBD
// Set chart options
//  var options3 = {'title':'Paycheck Breakdown','width':600, 'height':450};

// Instantiate and draw our chart, passing in some options.
super_chart = new google.visualization.PieChart(document.getElementById('super_chart_div'));
//        sub_chart = new google.visualization.PieChart(document.getElementById('sub_chart_div'));
//        bd_chart = new google.visualization.PieChart(document.getElementById('bd_chart_div'));

google.visualization.events.addListener(super_chart, 'select', superHandler);
//        google.visualization.events.addListener(sub_chart, 'select', subHandler);
//        google.visualization.events.addListener(bd_chart, 'select', bdHandler);

super_chart.draw(superData, options);
//        sub_chart.draw(subData, options2);
//        bd_chart.draw(bdData, options3);
}
function superHandler() {
    //$('#sub_net_chart_div').fadeOut(900, function() {
    // Animation complete
    //});

var selectedItem = super_chart.getSelection()[0];
var value = superData.getValue(selectedItem.row, 0);


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

function subHandler() {
    //$('#sub_net_chart_div').fadeOut(900, function() {
    // Animation complete
    //});

var selectedItem = net_chart.getSelection()[0];
var value = subData.getValue(selectedItem.row, 0);


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
    $functionContents
    }

function drawChartSummary(){
    var formatter = new google.visualization.TableNumberFormat({prefix: '$', negativeColor: 'red', negativeParens: true});
var sumData = new google.visualization.DataTable();
sumData.addColumn('string', '');
sumData.addColumn('number', 'Total');
sumData.addRows([
['Gross Paycheck', $gross_sum ],
['Takehome Pay', $takehomepay ],
['Total Expenses' , -$totalspent],
['Savings' , $savings]
]);
var table = new google.visualization.Table(document.getElementById('piechartsummary'));

formatter.format(sumData, 1);
var options = {'title':'Net Paycheck Breakdown','width':200, 'height':450, allowHTML: true};
table.draw(sumData, options);
}

function drawChartPurchases2(){
    document.getElementById('purchasesTable2').innerHTML = '$tableHTML';

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
nCells[1].innerHTML = '$' + (iPageMarket/100).toFixed(2);
}
} );
}

function drawChartPaycheck(){
    document.getElementById('paycheckTable').innerHTML = '$tableHTMLpaycheck';

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
nCells[1].innerHTML = '$' + gross.toFixed(2);
nCells[2].innerHTML = '$' + tax.toFixed(2);
nCells[3].innerHTML = '$' + healthcare.toFixed(2);
nCells[4].innerHTML = '$' + fica.toFixed(2);
nCells[5].innerHTML = '$' + k401.toFixed(2);
nCells[6].innerHTML = '$' + totalDeductions.toFixed(2);
nCells[7].innerHTML = '$' + net.toFixed(2);
}
});
}
function drawLargeSummary(){
    var savings = $savings;
    var theclass = 'income';
    if(savings < 0){
    theclass='expenses';
    }

var summaryHTML = 'INCOME:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"income\">$$takehomepay</span><br>EXPENSES:&nbsp;&nbsp;<span class=\"expenses\">$$totalspent</span><br>SAVINGS:&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"'+theclass+'\">$'+savings+'</span>';
    document.getElementById('finalSummaryDiv').innerHTML = summaryHTML;

    var frHeader = document.getElementById('reportResult');
    frHeader.innerHTML = '<h3>Report for $from to $to </h3>';

    }
    drawChart();
    drawChartSummary();
    drawChartPurchases2();
    drawChartPaycheck();
    drawLargeSummary();

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

    // </script>
    ";
    //$response = "you added $category and the result was $result;";
    //if($result == 1){
//    $response = "Net pay was:";
//}
    echo $response;

    ?>
