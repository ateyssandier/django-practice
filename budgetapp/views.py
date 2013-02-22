from django.template import Context, loader, RequestContext
from budgetapp.models import Purchases, Category, Paychecks
from django.http import HttpResponse, HttpResponseRedirect
from budgetapp.forms import AddCategoryForm, AddPaycheckForm, AddPurchaseForm, NavigationForm
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse
import json
import calendar
import datetime



def addcategory(request):

    # Handle file upload
    if request.method == 'POST':

        form = AddCategoryForm(request.POST, request.FILES)
        if request.is_ajax():

            if form.is_valid():
                print 'form is valid'
                superCategory = request.POST.get('super_category')
                subCategory = request.POST.get('sub_category')

                print superCategory
                print subCategory


                _addCategory(superCategory, subCategory)
                results = {'success':True, 'addedCategory': superCategory, 'addedSubCategory': subCategory}


            jsonResult = json.dumps(results)
            return HttpResponse(jsonResult, mimetype='application/json')
        else:
            return HttpResponse("nonajax")

def _addCategory(supercategory, subcategory):
    category = Category()

    category.superCategory = supercategory
    category.subCategory = subcategory


    category.save()


def addpaycheck(request):
    if request.method == 'POST':
        form = AddPaycheckForm(request.POST, request.FILES)


        if request.is_ajax():
            if form.is_valid():
                date = form.cleaned_data['date']
                gross = form.cleaned_data['gross']
                tax = form.cleaned_data['tax']
                healthcare = form.cleaned_data['healthcare']
                fica = form.cleaned_data['fica']
                k401 = form.cleaned_data['k401']

                netpay = gross - (tax + k401 + healthcare + fica);


                _addPaycheck(date, gross, tax, healthcare, fica, k401)
                results = {'success':True, 'netPay' : netpay}
                jsonResult = json.dumps(results)
            return HttpResponse(jsonResult, mimetype='application/json')
        else:
            return HttpResponse("nonajax")

def _addPaycheck(date, gross, tax, healthcare, fica, k401):

    paycheck = Paychecks()

    paycheck.date = date
    paycheck.gross = gross
    paycheck.healthcare = healthcare
    paycheck.fica = fica
    paycheck.k401 =k401

    paycheck.net = gross - (tax + k401 + healthcare + fica)

    paycheck.save()


def addpurchase(request):
    if request.method == 'POST':
        form = AddPaycheckForm(request.POST, request.FILES)
    if form.is_valid():
        _addPurchase()
        results = {'success':True}
        jsonResult = json.dumps(results)
    return HttpResponse(jsonResult, mimetype='application/json')

def _addPurchase():
    pass

def index(request):
    months_choices = []
    years_choices = []
    for i in range(1,13):
        months_choices.append(calendar.month_name[i])

    today = datetime.date.today()

    for i in range(2010,today.year+1):
        years_choices.append(i)

    transaction_list = Purchases.objects.all().order_by('-date')[:10]
    addCategoryForm = AddCategoryForm()
    inputPaycheck = AddPaycheckForm()
    navForm = NavigationForm()
    addPurchase = AddPurchaseForm(auto_id='%s_1')
    t = loader.get_template('../templates/index.html')
    c = RequestContext(request, {
        'transaction_list': transaction_list,
        'add_category_form': addCategoryForm,
        'input_paycheck': inputPaycheck,
        'add_purchase' : addPurchase,
        'category_dict': getCategories(),
        'months': months_choices,
        'years' : years_choices,
        'navigation_form': navForm
        })
    return HttpResponse(t.render(c))


def getCategories():
    new_dict = {}
    all_categories = Category.objects.values_list('superCategory', 'subCategory')

    #create array of super
    for super, sub in all_categories:
        if(super not in new_dict):
            subcategories = Category.objects.filter(superCategory=super).values_list('subCategory', flat=True).order_by('subCategory')
            new_dict[super] = subcategories

    return new_dict


def getreport(request):
# Handle file upload
    if request.method == 'POST':


        form = AddCategoryForm(request.POST, request.FILES)
        if request.is_ajax():

            if form.is_valid():
                print 'form is valid'
                superCategory = request.POST.get('super_category')
                subCategory = request.POST.get('sub_category')

                print superCategory
                print subCategory


                _addCategory(superCategory, subCategory)
                results = {'success':True, 'addedCategory': superCategory, 'addedSubCategory': subCategory}


            jsonResult = json.dumps(results)
            return HttpResponse(jsonResult, mimetype='application/json')
        else:
            return HttpResponse("nonajax")








