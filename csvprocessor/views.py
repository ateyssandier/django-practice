from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from budgetapp.models import Purchases, Paychecks, Category
from budgetapp.mcc import MintCloudClient
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


    for transaction in dataReader:
        if transaction[0] != 'Date': # Ignore the header row, import everything else

            date = transaction[0]
            new_date = datetime.datetime.strptime(date, "%m-%d%-Y").date()
            date = new_date.strftime("%Y-%m-%d")

            description = transaction[1]
            amount = transaction[3]
            transaction_type = transaction[4]
            category = transaction[5]
            notes = transaction[8]

            new_transaction = {'date': date, 'description': description, 'amount': amount, 'transaction_type': transaction_type, 'category':category, 'notes': notes}

            save_transaction(new_transaction)

def fetch_transactions(request):
    u = "atey188@gmail.com"
    p = "A131681012a"
    c = MintCloudClient()
    c.login(u, p)

    Purchases.objects.all().delete()
    Paychecks.objects.all().delete()

    transaction_list = []

    transactions = c.allTransactions()
    for transaction in transactions:

        #description_mmerchant = transaction["mmerchant"]
        #description-merchant = transaction["merchant"]
        #description-ruleMerchant = transaction["ruleMerchant"]

        #mcategory = transaction["mcategory"]
        #category = transaction["category"]
        #ruleCategory = transaction["ruleCategory"]

        date = transaction["date"]

        if len(date.split("/")) <= 1:
            date = date.split(' ')
            new_date = datetime.datetime.strptime(date[1]+date[0]+'2013', "%d%b%Y").date()
            date = new_date.strftime("%Y-%m-%d")
        else:
            new_date = datetime.datetime.strptime(date, "%m/%d/%y").date()
            date = new_date.strftime("%Y-%m-%d")



        if transaction["isLinkedToRule"]:
            description = transaction["ruleMerchant"]
            category =  transaction["ruleCategory"]
        else:
            description = transaction["merchant"]
            category = transaction["category"]

        if category == 'Cash &amp; ATM':
            #fixme: just manually change this for now
            category = 'Cash & ATM'

        #there's a weird transaction that I can't get out of mint, exclude it manually
        if description == 'Bamboo':
            category = 'Exclude From Mint'

        original_description = transaction["omerchant"]

        amount = transaction["amount"]
        amount = amount[1:]
        amount = amount.replace(",", "")

        transaction_type = "debit" if transaction["isDebit"] else "credit"
        account = transaction["account"]
        notes = transaction["note"]

        new_transaction = {'date': date, 'description': description, 'amount': amount, 'transaction_type': transaction_type, 'category':category, 'notes': notes}
        transaction_list.append(new_transaction)
        save_transaction(new_transaction)

    # Render list page with the documents and the form
    return render_to_response(
        'csvprocessor/fetch_transactions.html',
        {
            'transaction_list': transaction_list},
        context_instance=RequestContext(request)
    )

def save_transaction(transaction):
    date = transaction["date"]
    description = transaction["description"]
    amount = transaction["amount"]
    transaction_type = transaction["transaction_type"]
    category = transaction["category"]
    notes = transaction["notes"]

    #date needs to be passed in with the proper format (from mm/dd/yyyy to yyyy-mm-dd)
    #date = date.split("/")
    #date = date[2]+'-'+date[0]+'-'+date[1]
    #date = date


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
    elif category == "pharmacy":
        category = "general"
    elif category == "service & parts":
        category = "maintenance"
    elif category == "fast food":
        category = "restaurants"
    elif category == "miscellaneous fee":
        category = "misc fee"



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

        paycheck.net = amount * -1
        paycheck.gross = amount * -1
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
            import pdb; pdb.set_trace()
            category_object = Category.objects.get(subCategory="unknown")


        purchase.date = date
        purchase.item_desc = description
        purchase.cost = amount
        purchase.category = category_object

        purchase.save()








