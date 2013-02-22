var from, to;
var productCount = 1;
var totalProducts = 1;

var month;
var day;
var year;
var desc;
var category;
var add;
var remove;
var cost;

var originalInputReceiptDiv;

function launchSelect(clickednode){
    var parentCat = clickednode.parentNode.parentNode.id;
    $("#"+parentCat+" dd ul").toggle();
    $("#"+parentCat+" dd ul li ul.submenu").hide();
    var newvar = 0;
}


function tester(){

    $("a.subcategory").click(function() {
        $('ul.sf-menu').hideSuperfishUl();
        var selected = $(this).html();

        if(selected == 'Add Category'){
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
}

function trimNumber(s) {
    while (s.substr(0,1) == '0' && s.length>1) { s = s.substr(1,9999); }
    return s;
}

/**
 * Function will get element by id starting from specified node.
 * Author: Renato Bebić <renato.bebic@gmail.com>
 *
 */
function GetElementById( dNode, id ) {

    var dResult = null;

    if ( dNode.getAttribute('id') == id )
        return dNode;

    for ( var i = 0; i < dNode.childNodes.length; i++ ) {
        if ( dNode.childNodes[i].nodeType == 1 ) {
            dResult = GetElementById( dNode.childNodes[i], id );
            if ( dResult != null )
                break;
        }
    }
    return dResult;
}



function addReceipt(){

    var descArray  = new Array();
    var categoryArray  = new Array();
    var costArray  = new Array();
    var dateArray = new Array();

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
        category = GetElementById(category, "finalcatname");
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
            tester();
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

function addPaycheck(){

    var month = document.addpaycheck_form.month.value;
    var day = document.addpaycheck_form.day.value;
    var year = document.addpaycheck_form.year.value;
    var gross = document.addpaycheck_form.gross.value;
    var tax = document.addpaycheck_form.tax.value;
    var k401 = document.addpaycheck_form.k401.value;
    var healthcare = document.addpaycheck_form.healthcare.value;
    var fica = document.addpaycheck_form.fica.value;


    var fulldate = year+"\-"+month+"\-"+day;

    if(tax == ''){
        tax = 0;
    }
    if(k401 == ''){
        k401 = 0;
    }
    if(healthcare == ''){
        healthcare = 0;
    }
    if(fica == ''){
        fica = 0;
    }


    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else{// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            document.getElementById("addpaycheckresult").innerHTML=xmlhttp.responseText;
        }
    }

    xmlhttp.open("GET","addPaycheck.php?fulldate="+fulldate+"&gross="+gross+"&tax="+tax+"&k401="+k401+"&healthcare="+healthcare+"&fica="+fica);
    xmlhttp.send();


}

function    addProduct(){

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
    tester();
}

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
    tester();
}

function preload(){
    month = document.getElementById("month1").cloneNode(true);
    day = document.getElementById("day1").cloneNode(true);
    year = document.getElementById("year1").cloneNode(true);
    desc = document.getElementById("itemDescription1").cloneNode(true);
    category = document.getElementById("category1").cloneNode(true);
    add = document.getElementById("add1").cloneNode(true);
    remove = document.getElementById("remove1").cloneNode(true);
    cost = document.getElementById("cost1").cloneNode(true);

    originalInputReceiptDiv = document.getElementById("product_table").cloneNode(true);
}

function startCurrent(){
    //preload();

    var monthNames = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];

    var currentTime = new Date();

    var curmonth = currentTime.getMonth() + 1;
    var monthname = monthNames[currentTime.getMonth()];

    $('#cb-January').trigger('click');

    var curday = currentTime.getDate();
    var curyear = currentTime.getFullYear();

    //first day of today's month
    from = curyear+"\-"+curmonth+"\-"+1;
    //current day
    to = curyear+"\-"+curmonth+"\-"+curday;
    getReport();

}


function getReport(str){
    if(str == "standard"){
        processDate();
    }

    if(str == "custom"){
        var monthfrom = document.report_form.frommonth.value;
        monthfrom = trimNumber(monthfrom);
        var dayfrom = document.report_form.fromday.value;
        dayfrom = trimNumber(dayfrom);
        var yearfrom = document.report_form.fromyear.value;

        var monthto = document.report_form.tomonth.value;
        monthto = trimNumber(monthto);
        var dayto = document.report_form.today.value;
        dayto = trimNumber(dayto);
        var yearto = document.report_form.toyear.value;

        from = yearfrom+"\-"+monthfrom+"\-"+dayfrom;
        to = yearto+"\-"+monthto+"\-"+dayto;

    }
    $('#allreports').fadeOut(900, function() {
        // Animation complete
    });

    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else{// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var innerHTMLDoc = xmlhttp.responseText;
            //alert(innerHTMLDoc);
            eval(xmlhttp.responseText);
        }
    }

    //alert("From: "+from+"\nTo: "+to);
    xmlhttp.open("GET","getReport.php?&from="+from+"&to="+to,true);
    xmlhttp.send();

}


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

}

function closeCategoryPopup(){
    //show the background by hiding the overlay
    $('#background_overlay').hide();
    //fade out the panel
    $('#addlabelpopup').fadeOut('slow');

}

function addNewCategory(){
    var subCategory = $("#id_sub_category").val();
    var superCategory = $("#supercategoryspan").html()


    //if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
    //    xmlhttp=new XMLHttpRequest();
    //}
    //else{// code for IE6, IE5
    //    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    //}
    //xmlhttp.onreadystatechange=function(){
    //    if (xmlhttp.readyState==4 && xmlhttp.status==200){
    //        document.getElementById("addlabelresult").innerHTML=xmlhttp.responseText;
    //        closeCategoryPopup();
    //        refreshCategories(newCategory);
    //    }
    //}


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
            closeCategoryPopup();
            refreshCategories();
        },
        dataType: 'json',
        beforeSend: function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }

    });


    //if(newCategory == ""){
    //    document.getElementById("addlabelresult").innerHTML="Empty Field is not allowed";
    //    return;
    //}
    var patt1=/[^a-z0-9_\-\s]/gi;

    //if(newCategory.match(patt1)){
    //    document.getElementById("addlabelresult").innerHTML="Sorry, you have inserted invalid characters, please try again.";
    //    return;
    //}


}

function refreshCategories(){
    $('ul.sf-menu').superfish();
}

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

$(document).ready( function(){
    $(".cb-enable").click(function(){
        var parent = $(this).parents('.switch');
        $('.cb-enable',parent).removeClass('selected');
        $(this).addClass('selected');
        $('.checkbox',parent).attr('checked', true);
    });

    $("#categoryName").keyup(function(event){
        if(event.keyCode == 13){
            $("#add_category").click();
        }
    });
    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (! $clicked.parents().hasClass("dropdown"))
            $(".dropdown dd ul").hide();
    });

    tester();

});



