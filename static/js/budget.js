var from, to;
var productCount = 1;
var totalProducts = 1;

var transaction_list;


// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});
google.load('visualization', '1', {packages:['table']});

//not done, might not ever finish
function addReceipt(){

    var descArray  = [];
    var categoryArray  = [];
    var costArray  = [];
    var dateArray = [];


    //product_div

    $.each($(".product_div"), function() {
        var month = this.find('.month');
        var day = this.find('.day');
        var year = this.find('.year');
        var desc = this.find('.desc');

        var category = this.find('')

    });
        $("#" + this).text("Mine is " + this + ".");
        return (this != "three"); // will stop running after "three"

    $.each( $(".product_div"), function(i, l){
        alert( "Index #" + i + ": " + l );
    });


    var i;
    for(i=1;i<=productCount; i++){
        var month = document.getElementById("month_"+i).value;
        var day = document.getElementById("day_"+i).value;
        var year = document.getElementById("year_"+i).value;

        var desc = document.getElementById("itemDescription_"+i).value;
//        var category = document.getElementById("category"+i).value;
//       var category =  document.getElementById("category"+i);
//        category.dt.a.span.value.html();
        var category = document.getElementById("category_"+i);
        category = category.find("#finalcatname");
        category = category.innerHTML;

        var cost = document.getElementById("cost_"+i).value;
        if(typeof(month) != "undefined"){
            var date = year+"\-"+month+"\-"+day;
            dateArray.push(date);
            descArray.push(desc);
            categoryArray.push(category);
            costArray.push(cost);
        }
    }


    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else{// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            document.getElementById("addreceiptresult").innerHTML=xmlhttp.responseText;

            document.getElementById("product_table").innerHTML = originalInputReceiptDiv.innerHTML;


            var texts = document.receipt_form.getElementsByTagName('input');
            var i_tem = 0;
            for (i_tem = 0; i_tem < texts.length; i_tem++){
                if (texts[i_tem].type=='text'){
                    if(texts[i_tem].id.indexOf('month') != -1){
                        texts[i_tem].value='mm';
                    }
                    else if(texts[i_tem].id.indexOf('day') != -1){
                        texts[i_tem].value='dd';
                    }
                    else if(texts[i_tem].id.indexOf('year') != -1){
                        texts[i_tem].value='yyyy';
                    } else {
                        texts[i_tem].value='';
                    }
                }
            }

            var categories = document.receipt_form.getElementsByTagName('dl');
            var i_tem2 = 0;
            var text = "Select Category";
            for (i_tem2 = 0; i_tem2 < categories.length; i_tem2++){
                $("#"+categories[i_tem2].id+" dt a span").text(text);
            }
            addBindngs();
        }
    }
    var params = "total="+dateArray.length;
    var k=0;
    for(k=0; k<dateArray.length; k++){
        params = params+"&date[]="+dateArray[k]+"&desc[]="+descArray[k]+"&cat[]="+categoryArray[k]+"&cost[]="+costArray[k];
    }

    xmlhttp.open("GET","addReceipt.php?"+params);

    xmlhttp.send();


}

//done not tested
function addPaycheck(){
    var month = $("#addpaycheck_form .month").val();
    var day = $("#addpaycheck_form .day").val();
    var year = $("#addpaycheck_form .year").val();
    var gross = $("#addpaycheck_form .gross").val();
    var tax = $("#addpaycheck_form .tax").val();
    var k401 = $("#addpaycheck_form .k401").val();
    var healthcare = $("#addpaycheck_form .healthcare").val();
    var fica = $("#addpaycheck_form .fica").val();


    var fulldate = year+"\-"+month+"\-"+day;

    if(tax === ''){
        tax = 0;
    }
    if(k401 === ''){
        k401 = 0;
    }
    if(healthcare === ''){
        healthcare = 0;
    }
    if(fica === ''){
        fica = 0;
    }

    var newurl = $("#addpaycheck_form").attr( 'action' );
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value')
    var data = {date: date, gross: gross, tax: tax, healthcare: healthcare, fica: fica, k401: k401};

    $.ajax({
        type: "POST",
        url: newurl,
        data: data,
        success: function(data){
            var response = data;
            var message = "Net pay was: " + response['netpay'];

            $("#addpaycheckresult").html(message);


        },
        dataType: 'json',
        beforeSend: function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

}

//done
function addProduct(){

    var receiptDiv = $('#input_receipt');
    var theheight  = $('#input_receipt').height();
    var newheight = theheight + 57;
    $('#input_receipt').height(newheight);

    //date
    var product_div = $(".product_div").first().clone();


    //create a new product div
    productCount = productCount+1;
    totalProducts = totalProducts+1;

    product_div.attr('id', product_div.attr('id').slice(0, - 1)+productCount);


    product_div.find('*').each(function () {
        if($(this).is("label")){
            $(this).hide();
        } else {
            if(!($(this).hasClass("category_dropdown") ||  $(this).hasClass("subcategory_li") || $(this).hasClass("supercategory_li"))){
                $(this).attr('id', $(this).attr('id').slice(0, - 1)+productCount);
            }
        }
    });
    product_div.insertAfter("div.product_div:last");

    //reloadsuperfish
    jQuery('ul.sf-menu').superfish();

    //ad the jquery handlers
    addBindings();
}

//done
function removeProduct(whocalled){
    //get the products parent element (the div enclosing the receipt
    //var  whocalled = whocalled;
    //create a new product div
    var whichToRemove = whocalled.charAt(7);
    if (totalProducts > 1){
        var isFirst = $("#product_div_"+whichToRemove).find('label').is(':visible');
        $("#product_div_"+whichToRemove).remove();
        if(isFirst){
            var product_div = $(".product_div").first();
            product_div.find('label').show();
        }

        totalProducts = totalProducts-1;

        var receiptDiv = document.getElementById('input_receipt');
        var theheight  = $('#input_receipt').height();
        var newheight = theheight - 57;
        receiptDiv.style.height = newheight+"px";
    }
    //probably not necessary
    addBindings();
}


function getTransactions(){
    "use strict";

    $('#fetch_button').hide();
    $('#spinner_button').show();

    var newurl = '/fetch_transactions_ajax/';
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value');

    $.get('/fetch_transactions_ajax/', function(data) {
       $('.result').html(data);
       $('#spinner_button').hide()
       $('#fetch_button').show()
       getReport("current");
    });


}


//notDone
function getReport(str){
    "use strict";


    //standard month report, i.e. may, june, whatever
    if(str === "standard"){
        //var standard_month = $("#report_form").find("[id^='months'][checked='true']").attr("value");
        var standard_month = $("#months_switch").find("[class='cb-enable selected']").attr("for");
        standard_month = $("#months_switch").find("#"+standard_month).attr("value");

        //var standard_year = $("#report_form").find("[id^='years']");
        var standard_year = $("#years_switch").find("[class='cb-enable selected']").attr("for");
        standard_year = $("#years_switch").find("#"+standard_year).attr("value");

        var monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];

        var month_number = monthNames.indexOf(standard_month) + 1;

        var days_in_month = new Date(standard_year, month_number, 0).getDate();

        from = standard_year+"\-"+month_number+"\-"+1;
        to = standard_year+"\-"+month_number+"\-"+days_in_month;

    }

    //custo report, should be redone.
    if(str === "custom"){
        var monthfrom = document.report_form.frommonth.value;
        //monthfrom = trimNumber(monthfrom);
        var dayfrom = document.report_form.fromday.value;
        //dayfrom = trimNumber(dayfrom);
        var yearfrom = document.report_form.fromyear.value;

        var monthto = document.report_form.tomonth.value;
        //monthto = trimNumber(monthto);
        var dayto = document.report_form.today.value;
        //dayto = trimNumber(dayto);
        var yearto = document.report_form.toyear.value;

        from = yearfrom+"\-"+monthfrom+"\-"+dayfrom;
        to = yearto+"\-"+monthto+"\-"+dayto;
    }

    if(str == "initial"){

        var currentTime = new Date();

        var curmonth = currentTime.getMonth() + 1;
        var curday = currentTime.getDate();
        var curyear = currentTime.getFullYear();

        //first day of today's month
        from = curyear+"\-"+curmonth+"\-"+1;
        //current day
        to = curyear+"\-"+curmonth+"\-"+curday;

    }

    //test data
    if (str == "test"){
        from = "2012-03-15";
        to = "2015-04-15";
    }

    var newurl = $("#report_form").attr( 'action' );
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value');

    $.ajax({
        type: "POST",
        url: newurl,
        data: { from: from, to: to },
        success: function(data){
            var response = data;

            transaction_list = response.transaction_list;

            $('#from_date').html(from);
            $('#to_date').html(to);

            drawLargeSummary(response.income, response.expenses, response.savings);
            drawChart(convertToArray(response.gross_array));
            drawChartSummary(convertToArray(response.summary_data));
            drawChartPurchases2(transaction_list);
            drawChartPaycheck();

            $('#allreports').fadeIn(900, function() {
                // Animation complete
            });

            $(document).bind('click', function(e) {
                var clicked = $(e.target);

                if (!clicked.parents().hasClass('subChart')){

                    var background_overlay = document.getElementById('background_overlay');
                    background_overlay.style.display = 'none';

                    var addlabelpopup2 = document.getElementById('sub_net_chart_div');

                    addlabelpopup2.style.display = 'none';

                }
            });


        },
        dataType: 'json',
        beforeSend: function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

}

function convertToArray(data){
    var newArray = [];
    for (var key in data) {

        var keyvalue =  data[key];
        if(!isNaN(parseFloat(keyvalue))){
            keyvalue = parseFloat(keyvalue);
        }
        var newMiniArray = [key, keyvalue];
        newArray.push(newMiniArray);
    }
    return newArray;
}

//done
function showAddCategoryPanel(superCat){
    //hide the background by displaying the overlay
    $('#background_overlay').show();
    $('ul.sf-menu').hideSuperfishUl();


    $('#supercategoryspan').html(superCat);
    //document.getElementById("categoryName").value = "";
    $("#addlabelresult").innerHTML="";

    // w is a width of the addlabelpopup panel
    w = 300;
    // h is a height of the addlabelpopup panel
    h = 100;
    // get the x and y coordinates to center the addlabelpopup panel
    xc = Math.round((window.innerWidth/2)-(w/2));
    yc = Math.round((window.innerHeight/2)-(h/2));
    // show the addlabelpopup panel
    $('#addlabelpopup').css('left', xc);
    $('#addlabelpopup').css('top', yc);

    $('#addlabelpopup').show();

    $("#id_sub_category").focus();

}

//Done
function closeCategoryPopup(){
    //show the background by hiding the overlay
    $('#background_overlay').hide();
    //fade out the panel
    $('#addlabelpopup').fadeOut('slow');

}


//Done
function addNewCategory(){
    var subCategory = $("#id_sub_category").val();
    var superCategory = $("#supercategoryspan").html()

    var newurl = $("#addcategory_form").attr( 'action' );
    var csrftoken =  $('[name="csrfmiddlewaretoken"]').attr('value')

    $.ajax({
        type: "POST",
        url: newurl,
        data: { super_category: superCategory, sub_category: subCategory },
        success: function(data){
            var response = data;
            var message = "Successfully added " + response['addedSubCategory'] +  " into " +  response['addedCategory']+".";

             $("#addlabelresult").html(message);


            setTimeout(
                function() {
                    closeCategoryPopup();
                },
                5000
            );

            refreshCategories();
        },
        dataType: 'json',
        beforeSend: function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });
}

//Done
function refreshCategories(){
    $('ul.sf-menu').superfish();
    window.location.reload();
}

//not done, might noeed to be refactored
function processDate(){
    var startmonth="";
    var numdays="";
    var endmonth="";
    var year="";

    //get the months
    for (var i=0; i < document.report_form.months.length; i++){
        if (document.report_form.months[i].checked){
            var c_value = document.report_form.months[i].value;
            //c_value will be accurate i.e. 1=january, 2=february, etc
            if(startmonth == ""){
                startmonth = c_value;
                endmonth = startmonth;
            }
            else {
                endmonth = c_value;
            }
        }
    }

    //get the years
    for (var i=0; i < document.report_form.years.length; i++){
        if (document.report_form.years[i].checked){
            var c_value = document.report_form.years[i].value;
            year = c_value;
        }
    }

    from = year+"\-"+startmonth+"\-"+1;
    to = year + "\-"+endmonth+"\-"+daysInMonth(endmonth);
}


//notDone, might not be necessary
function daysInMonth(monthint){
    var months=new Array(12);
    var adjmonthint = monthint-1;
    months[0]=31;
    months[1]=28;
    months[2]=31;
    months[3]=30;
    months[4]=31;
    months[5]=30;
    months[6]=31;
    months[7]=31;
    months[8]=30;
    months[9]=31;
    months[10]=30;
    months[11]=31;

    return months[adjmonthint];
}


//notDonemight not be necessary.
function make_open_dialog(){
    $('#add-label-popup').dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "OK":function(){
                superCategory = $('option:selected').attr('value');
                subCategory = $('option:selected').attr('value');
                $(this).dialog('close');
            },
            "Cancel":function(){
                $(this).dialog('close');
            }
        }
    });
}

// done
$(document).ready( function(){
    //adds bindings to the supercategory and subcategory dropdown
    $("a.subcategory").click(function() {
        $('ul.sf-menu').hideSuperfishUl();
        var selected = $(this).html();

        if(selected === 'Add Category'){
            var superparent = $(this).parents(".supercategory_li").find("a").find('.category_content');
            superCat = superparent.html();
            showAddCategoryPanel(superCat);
        } else {
            //find the select box relevent to click
            var selectbox = $(this).parents("div").find("select");
            var number = (selectbox.attr('id')).substr(9,9);
            var hrefer = $('#category_span_'+number).find('.main_dropdown').find('.category_content');
            hrefer.html(selected);
        }
    });

    $(".cb-enable").click(function(){
        var parent = $(this).parents('.switch');
        var current_id = $(this).attr('for');
        $('.cb-enable',parent).removeClass('selected');
        $(this).addClass('selected');
        var radio_button = $('#'+current_id);
        radio_button.attr('checked', 'true');
    });


    $("#addcategory_form").submit(function(event) {
        event.preventDefault();

        setTimeout(
            function() {
                addNewCategory();
            },
            1
        );
    });

    //this might not be needed
    $("#report_form").submit(function(event) {
        event.preventDefault();
        alert("hello");
        setTimeout(
            function() {
                getReport();
            },
            1
        );
    });



    var currentTime = new Date();
    var monthname = currentTime.getMonth();
    var year = currentTime.getFullYear();

    $('#cb-'+monthname).addClass('selected');
    var current_id = $('#cb-'+monthname).attr('for');
    $('#'+current_id).attr("checked", true);
    $('#cb-'+year).addClass('selected');
    current_id = $('#cb-'+year).attr('for');
    $('#'+current_id).attr("checked", true);


    getReport("initial")

});



