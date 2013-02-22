from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from budgetapp.models import Purchases, Paychecks, Category
import csv

import datetime


from csvprocessor.forms import UploadFileForm

def uploadcsv(request):
    # Handle file upload
    if request.method == 'POST':
        print 'Post method!'
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            print 'For is valid'
            handle_uploaded_file(request.FILES['file'])

            # Redirect to the document list after POST
            return HttpResponseRedirect(reverse('csvprocessor.views.uploadcsv'))
        else :
            print 'form is not valid'
            print form.as_table()

    else:
        form = UploadFileForm() # A empty, unbound form

    # Render list page with the documents and the form
    return render_to_response(
        'csvprocessor/uploadcsv.html',
        {
         'form': form},
        context_instance=RequestContext(request)
    )

def handle_uploaded_file(f):
    filename = 'transactions-'
    filename += datetime.datetime.now().strftime("%Y%m%d%H%M")
    filename += '.txt'

    with open(filename, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


    dataReader = csv.reader(open(filename), delimiter=',')


    Purchases.objects.all().delete()
    Paychecks.objects.all().delete()

    #create a purchases table

    #create a paychecks table


    for row in dataReader:
        if row[0] != 'Date': # Ignore the header row, import everything else


            date = row[0]
            description = row[1]
            amount = row[3]
            transaction_type = row[4]
            category = row[5]
            notes = row[8]

            #convert date to the proper format (from mm/dd/yyyy to yyyy-mm-dd)
            date = date.split("/")
            date = date[2]+'-'+date[0]+'-'+date[1]


            date = date
            amount = float(amount)



            if transaction_type == "credit":
                amount = -amount

            category =  category.lower()

            #concatenate "description - notes"
            if notes :
                description += " - "
                description += notes;



            if category == "coffee shops" :
                category = "coffee"
            elif category == "electronics & software" :
                category = "electronics"
            elif category == "gas & fuel":
                category = "gas"
            elif category == "mortgage & rent":
                category = "rent"
            elif category == "shopping":
                category = "miscellaneous"
            elif category == "dentist":
                category = "doctor"
            elif description.find("National Grid") >= 0:
                category = "heat";
            elif description.find("NSTAR") >= 0:
                category = "electric"
            elif category == "personal care":
                category = "general"
            elif category == "service & parts":
                category = "maintenance"
            elif category == "fast food":
                category = "restaurants"


            #skip categories
            if category == "credit card payment":
                category = "skip"
            elif category == "exclude from mint":
                category = "skip"
            elif category == "interest income":
                category = "skip"
            elif category == "loan payment":
                category = "skip"
            elif category == "transfer":
                category = "skip"
            elif description.find("Reimbursable") >= 0:
                category = "skip"
            elif category == "finance charge":
                category = "skip"
            elif category == "atm fee":
                category = "skip"
            elif category == "cash & atm":
                category = "skip"


            #if category == income
            if category == "income" or category == 'paycheck':
                #insert into paychecks
                paycheck = Paychecks()

                paycheck.amount = amount * -1
                paycheck.date = date

                paycheck.save()
            #else if category == skip
            elif category == "skip":
                pass
            else:
                #else add to purchases
                purchase = Purchases();

                try:
                    category_object = Category.objects.get(subCategory=category)
                except Category.DoesNotExist:
                    category_object = Category.objects.get(subCategory="unknown")


                purchase.date = date
                purchase.item_desc = description
                purchase.cost = amount
                purchase.category = category_object

                purchase.save()








