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
   $(".dropdown dt a").click(function() {      

    });
    $(".dropdown dd ul li a").hover(
        function() {
            var parentCat = this.parentNode.parentNode.parentNode.parentNode.id;            
            var superid = this.id;
            $(this).addClass("hover");
            var howmanydown = superid.substr(9);        
            superid = "submenu"+howmanydown
            var o1 = $("#"+parentCat+" dd ul#superul").offset();
            var o2 = $(this).offset();  

            var diff = o2.top - o1.top;
            diff = diff;
            //show the menu directly over the placeholder
            $("#"+parentCat+" dd ul li ul#"+superid).css( { "left": 200 + "px", "top": (diff) + "px" } );
//            $("#"+parentCat+"dd ul#"+superid).show();
            $("#"+parentCat+" dd ul li ul#"+superid).show();
        }, 
        function() {
            var parentCat = this.parentNode.parentNode.parentNode.parentNode.id;      
            var superid = this.id;        
            superid = "submenu"+superid.substr(9);
            $("#"+parentCat+" dd ul#"+superid).hide();
            $(this).removeClass("hover");
        });
    $(".dropdown dd ul li ul").hover(
        function() {
            var parentCat = this.parentNode.parentNode.parentNode.parentNode.id;
            var subid = this.id;
            subid = "supermenu"+subid.substr(7);
            $("ul#"+this.id).show();            
            $("a#"+subid).addClass("hover");            
        }, 
        function() {
            var parentCat = this.parentNode.parentNode.parentNode.parentNode.id;
            var subid = this.id;
            subid = "supermenu"+subid.substr(7);
            $("ul#"+this.id).hide();            
            $("a#"+subid).removeClass("hover");  
        });
    $(".dropdown dd ul li ul li a").click(function() {
        var text = $(this).html();
        if(text != "Add New"){
            var parentCat = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
            //alert(parentCat);
            $("#"+parentCat+" dd ul li ul li a span").html(text);
            text = text.substr(0, text.indexOf("<", 0));
            $("#"+parentCat+" dt a span").text(text);
        }
        $(".dropdown dd ul").hide();
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
        receiptDiv.style.height = newheight+"px";

        //date
        var product_div = $(".product_div").first().clone();

        //create a new product div
        productCount = productCount+1;
        totalProducts = totalProducts+1;


        $('#product_div_'+(productCount-1)).children().each(function () {
            alert($(this).text()); // "this" is the current element in the loop
        });
        
        //ad the jquery handlers
        tester();
}

function removeProduct(whocalled){
    //get the products parent element (the div enclosing the receipt
    //var  whocalled = whocalled;
    //create a new product div
    var whichToRemove = whocalled.charAt(6);
    if (totalProducts > 1){
        var removeelement = document.getElementById(whocalled);
        //get the paren tnode of removelement
        var parent = removeelement.parentNode;        
        parent.parentNode.removeChild(parent);
        
        removeelement = document.getElementById("cost"+whichToRemove);
        parent = removeelement.parentNode;        
        parent.parentNode.removeChild(parent);
        
        removeelement = document.getElementById("category"+whichToRemove);
        parent = removeelement.parentNode;        
        parent.parentNode.removeChild(parent);
        
        removeelement = document.getElementById("itemDescription"+whichToRemove);
        parent = removeelement.parentNode;        
        parent.parentNode.removeChild(parent);

        removeelement = document.getElementById("month"+whichToRemove);
        parent = removeelement.parentNode;        
        parent.parentNode.removeChild(parent);  
         

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
    preload();
    

    var currentTime = new Date()
    var curmonth = currentTime.getMonth() + 1
    var curday = currentTime.getDate()
    var curyear = currentTime.getFullYear()

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
    var background_overlay = document.getElementById('background_overlay');
    background_overlay.style.display = 'inline';

    var addlabelpopup = document.getElementById('addlabelpopup');
    document.getElementById('supercategoryspan').innerHTML = superCat;
    document.getElementById("categoryName").value = "";
    document.getElementById("addlabelresult").innerHTML="";
    // w is a width of the addlabelpopup panel
    w = 300;
    // h is a height of the addlabelpopup panel
    h = 100;
    // get the x and y coordinates to center the addlabelpopup panel
    xc = Math.round((window.innerWidth/2)-(w/2));
    yc = Math.round((window.innerHeight/2)-(h/2));
    // show the addlabelpopup panel
    addlabelpopup.style.left = xc + "px";
    addlabelpopup.style.top = yc + "px";
    addlabelpopup.style.display = 'block';
}

function closeCategoryPopup(){
    //show the background by hiding the overlay
        
    var background_overlay = document.getElementById('background_overlay');
    background_overlay.style.display = 'none';
    
    var addlabelpopup = document.getElementById('addlabelpopup');
    //clear the contents
    addlabelpopup.style.display = 'none';
}

function addNewCategory(){
    var newCategory = document.getElementById("categoryName").value;
    var superCategory = document.getElementById("supercategoryspan").innerHTML;
        
    
    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp=new XMLHttpRequest();
    }
    else{// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            document.getElementById("addlabelresult").innerHTML=xmlhttp.responseText;
            closeCategoryPopup();
            refreshCategories(newCategory);
        }
    }
    

    if(newCategory == ""){
        document.getElementById("addlabelresult").innerHTML="Empty Field is not allowed";
        return;
    }
    var patt1=/[^a-z0-9_\-\s]/gi;

    if(newCategory.match(patt1)){
        document.getElementById("addlabelresult").innerHTML="Sorry, you have inserted invalid characters, please try again.";
        return;
    }
    
    xmlhttp.open("GET","addCategory.php?subcategory="+newCategory+"&supercategory="+superCategory);
    xmlhttp.send();

}

function refreshCategories(newCat){
    var allElements = document.getElementsByClassName("categories");
    for (var k = 0, len = allElements.length; k < len; k++){
        var sel = allElements[k];
        var ary = [];
        
        for (var i = 0; i < sel.length; i++){
            ary.push(sel.options.item(i));
        }    
            
        
        var li = document.createElement("li");
//        var space = " ";
        li.innerHTML = "&nbsp;&nbsp;&nbsp;-&nbsp;"+newCat;
        li.innerHTML = "<a href='javascript:void(0);'>"+newCat+"<span class='value'>"+newCat+"</span></a>";
        
        ary.push(li);
        
        ary.sort(function(a,b){
            // or by "label"? (lexicographic comparison)
            return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
        });

      for (var i = 0; i < sel.length; i++)
        sel.remove(ary[i].index);
      // (re)add re-ordered OPTIONs to SELECT
      for (var i = 0; i < ary.length; i++)
      sel.add(ary[i], null);
    }
  
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



