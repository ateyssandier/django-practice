from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from budgetapp.models import Purchases, Paychecks, Category
from budgetapp.mcc import MintCloudClient
import csv

import datetime


from csvprocessor.forms import UploadFileForm

CATEGORY_MAP = {
    "coffee shops" : "coffee",
    "electronics & software"  : "electronics",
    "gas & fuel" : "gas",
    "mortgage & rent" : "rent",
    "shopping" : "miscellaneous",
    "dentist" : "doctor",
    "pharmacy" : "personal care",
    "service & parts" : "maintenance",
    "fast food" : "restaurants",
    "miscellaneous fee" : "misc fee",
    "alcohol and bars" : "alcohol & bars",
    "finance charges" : "finance charge",
    "gym membership" : "gym",
    "home insurance bill" : "home insurance"
}

SKIP_MAP = ["credit card payment", 
            "exclude from mint", 
            "interest income", 
            "loan payment", 
            "transfer", 
            "atm fee", 
            "cash & atm"]

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
        'uploadcsv.html',
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
    skip_transaction_list = []

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

        #fixme: editing transactions with ampersands renders html code, not ampersand. 
        #just manually change this for now
        category = category.replace("&amp;", "&")

        original_description = transaction["omerchant"]

        amount = transaction["amount"]
        amount = amount[1:]
        amount = amount.replace(",", "")

        #there's afew weird split transaction that I can't get out of mint, exclude it manually
        if description == 'Bamboo' and amount == "193.76":
            category = 'Exclude From Mint'
        if description == 'Good Gas' and amount == "218.91":
            category = 'Exclude From Mint'

        #skip pending transaction
        if transaction['isPending']:
            category = 'Exclude From Mint'

        transaction_type = "debit" if transaction["isDebit"] else "credit"
        account = transaction["account"]
        notes = transaction["note"]

        new_transaction = {'date': date, 'description': description, 'amount': amount, 'transaction_type': transaction_type, 'category':category, 'notes': notes}
        if save_transaction(new_transaction):
            transaction_list.append(new_transaction)
        else:
            skip_transaction_list.append(new_transaction)

    # Render list page with the documents and the form
    return render_to_response(
        'fetch_transactions_ajax.html',
        {
            'transaction_list': transaction_list, 'skip_transaction_list' : skip_transaction_list},
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

    #remap mint categories to budgetapp categories
    if category in CATEGORY_MAP:
        category = CATEGORY_MAP[category]

    #the below isn't necessary, I made mint categories
    #if description.find("National Grid") >= 0:
    #    category = "heat";
    #if description.find("NSTAR") >= 0:
    #    category = "electric"


    #skip categories
    if category in SKIP_MAP:
        category = "skip"
    
    if description.find("Reimbursable") >= 0:
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
        return False
    else:
        #else add to purchases
        purchase = Purchases();

        try:
            category_object = Category.objects.get(subCategory=category)
        except Category.DoesNotExist:
            #import pdb; pdb.set_trace()
            category_object = Category.objects.get(subCategory="unknown")


        purchase.date = date
        purchase.item_desc = description
        purchase.cost = amount
        purchase.category = category_object

        purchase.save()

    return True







