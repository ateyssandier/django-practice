from django.template import Context, loader, RequestContext
from budgetapp.models import Purchases, SubCategory, Paychecks
from django.db.models import Sum
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, HttpResponseRedirect
from budgetapp.forms import AddCategoryForm, AddPaycheckForm, AddPurchaseForm, NavigationForm
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse
import json
import calendar
import datetime
from decimal import *
from csvprocessor.views import fetch_budget_for_month, fetch_categories




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

def _addCategory(supercategory, subcategory, mint_id=2):
    supercategory_object = SuperCategory()
    supercategory_object.name = supercategory
    supercategory_object.save()
    
    category = SubCategory()
    category.superCategory = supercategory_object
    category.subCategory = subcategory
    category.mint_id = mint_id
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
  


    transaction_list = Purchases.objects.all().order_by('-date')
    addCategoryForm = AddCategoryForm()
    inputPaycheck = AddPaycheckForm()
    navForm = NavigationForm(auto_id='%s')
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
        'navigation_form': navForm,
        })
    return HttpResponse(t.render(c))


def getCategories():
    new_dict = {}
    all_categories = SubCategory.objects.values_list('superCategory__name', 'subCategory')

    #create array of super
    for super, sub in all_categories:
        if(super not in new_dict):
            subcategories = SubCategory.objects.filter(superCategory__name=super).values_list('subCategory', flat=True).order_by('subCategory')
            new_dict[super] = subcategories

    return new_dict


def getreport(request):

    if request.method == 'POST':
        form = NavigationForm(request.POST, request.FILES)

        if request.is_ajax():
            if form.is_valid():

                from_date = request.POST.get('from')
                to_date = request.POST.get('to')

                #start_date = datetime.date(from_year, from_month, from_day)
                start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
                #end_date = datetime.date(to_year, to_month, to_day)
                end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')

                transaction_list = Purchases.objects.all().filter(date__range=(start_date, end_date)).order_by('-date')
                paychecks_list = Paychecks.objects.all().filter(date__range=(start_date, end_date)).exclude(excluded=True).order_by('-date')

                gross_array = {}
                gross_array_savings = 0
                total_expenses = 0

                serializable_transaction_list = []

                for transaction in transaction_list:
                    #here we will need to pass in all the data that the template and the javascript will need
                    category = transaction.category.superCategory.name
                    cost = transaction.cost

                    total_expenses = total_expenses + cost

                    if cost < 0:
                        gross_array_savings += abs(cost)
                    elif category in gross_array:
                        current_total = gross_array[category]
                        new_total = current_total + cost
                        gross_array[category] = new_total
                    else:
                        gross_array[category] = cost

                    serializable_transaction_list.append(transaction.to_dict())

                gross_paycheck = 0
                takehome_pay = 0

                for paycheck in paychecks_list:
                    gross_paycheck = gross_paycheck+paycheck.gross
                    takehome_pay = takehome_pay+paycheck.net


                savings = takehome_pay - total_expenses + gross_array_savings

                if savings > 0:
                    gross_array["Savings"] = savings

                summary_data =  {'Gross Paycheck': gross_paycheck,
                                 'Takehome Pay': takehome_pay,
                                 'Total Expenses' : total_expenses,
                                 'Savings' : savings}


                results = {'success':True, 'summary_data': summary_data, 'gross_array': gross_array, 'transaction_list': serializable_transaction_list, 'income':takehome_pay, 'expenses':total_expenses, 'savings': savings}




            jsonResult = json.dumps(results, cls=DjangoJSONEncoder)

            return HttpResponse(jsonResult, mimetype='application/json')
        else:
            return HttpResponse("nonajax")


def getpurchasetable(request):
    #do the purchase table template stuff
    purchases_template = "purchases_table.html"

    if request.is_ajax():
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')

        start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')

        transaction_list = Purchases.objects.all().filter(date__range=(start_date, end_date)).order_by('-date')

        sum = 0
        #get the sum:
        for transaction in transaction_list:
            sum+= transaction.cost


        data = {
            'success':True,
            'transaction_list': transaction_list,
            'total': sum
        }

        return render_to_response(purchases_template, data, context_instance = RequestContext(request))
    else:
        return HttpResponse("nonajax")


def getpaycheckstable(request):
    #do the purchase table template stuff
    purchases_template = "paychecks_table.html"

    if request.is_ajax():
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')

        start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')


        paychecks_list = Paychecks.objects.all().filter(date__range=(start_date, end_date)).order_by('-date')

        new_paychecks_list = []

        for paycheck in paychecks_list:
            new_paycheck = paycheck
            total_deductions = sum([paycheck.tax, paycheck.healthcare, paycheck.fica, paycheck.k401])
            new_paycheck.total_deductions = total_deductions
            new_paychecks_list.append(new_paycheck)


        data = {
            'success':True,
            'paychecks_list': new_paychecks_list,
            }

        return render_to_response(purchases_template, data, context_instance = RequestContext(request))
    else:
        return HttpResponse("nonajax")

def getsubchart(request):
    if request.is_ajax():
        from_date = request.POST.get('from')
        to_date = request.POST.get('to')
        super_category = request.POST.get('super_category')


        start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')

        category_list = SubCategory.objects.filter(superCategory__name=super_category)
        transaction_list = Purchases.objects.all().filter(date__range=(start_date, end_date)).filter(category__in=category_list).order_by('-date')

        sub_transaction_array =  {}

        for transaction in transaction_list:
            #here we will need to pass in all the data that the template and the javascript will need
            sub_category = transaction.category.subCategory
            cost = transaction.cost


            if cost > 0:
                if sub_category in sub_transaction_array:
                    current_total = sub_transaction_array[sub_category]
                    new_total = current_total + cost
                    sub_transaction_array[sub_category] = new_total
                else:
                    sub_transaction_array[sub_category] = cost

        results = {'success':True, 'sub_transaction_array': sub_transaction_array}

        jsonResult = json.dumps(results, cls=DjangoJSONEncoder)

        return HttpResponse(jsonResult, mimetype='application/json')
    else:
        return HttpResponse("nonajax")

def get_budget_status(request):
    budget_template = "budget_status.html"
    if request.is_ajax():
    #if True:
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')

        start_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        end_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')
        if start_date.year != end_date.year or start_date.month != end_date.month:
           message = "budgets can only be calculated for a single calendar month"
        
        total_spent = 0
        days_in_month = calendar.monthrange(start_date.year,start_date.month)
        if days_in_month == end_date.day:
            complete_month = True
        else:
            complete_month = False
        
        budget_map = {}
                
        categories = fetch_categories()
        mint_categories = []
        budget_list = fetch_budget_for_month(start_date, end_date)
               
        for budgetitem in budget_list['spending_budget']:
            budgeted = budgetitem['amount_budgeted']
            cat_id = budgetitem['category']
            category = SubCategory.objects.filter(mint_id=cat_id)
            if len(category) == 0:
                mint_categories.append((cat_id, categories[cat_id]))
                break
                                       
            category = category[0]
            spent = Purchases.objects.all().filter(date__range=(start_date, end_date), category=category).aggregate(Sum('cost'))
            if spent['cost__sum']:
                spent = float(spent['cost__sum'])
            else:
                spent = 0
            budget_item = {'subcategory':category, 'budgeted':budgeted, 'spent':spent, 'original_estimate': budgeted}
                
            #set your budget equal to what you spent at the end of the month, otherwise,later we will check if you're overbudget, so we can fix it in mint
            if spent > budgeted or complete_month:
                budget_item['budgeted']=spent
            if category.superCategory.name not in budget_map:
                budget_map[category.superCategory.name] = [budget_item]
            else:
                budget_map[category.superCategory.name].append(budget_item)
                                                            
            total_spent = total_spent+budget_item['budgeted']
                                            
        for cat_id in budget_list['unbudgeted_ids']:
           category = SubCategory.objects.filter(mint_id=cat_id)
           if len(category) == 0:
              mint_categories.append((cat_id, categories[cat_id]))
              break
                                                                                      
           category = category[0]
           spent = Purchases.objects.all().filter(date__range=(start_date, end_date), category=category).aggregate(Sum('cost'))
           if spent['cost__sum']:
               spent = float(spent['cost__sum'])
           else:
                spent = 0 
           budget_item = {'subcategory':str(category.subCategory).replace(' ', '_'), 'budgeted':spent, 'spent':spent, 'original_estimate': 0}
                                     
           if category.superCategory.name not in budget_map:
              budget_map[category.superCategory.name] = [budget_item]
           else:
              budget_map[category.superCategory.name].append(budget_item)
                                                                                    
           total_spent = total_spent+budget_item['budgeted']
        
                                                               
        income = Paychecks.objects.all().filter(date__range=(start_date, end_date)).exclude(excluded=True).aggregate(Sum('gross'))
        if income['gross__sum']:
           income = float(income['cost__sum'])
        else:
           income = 0
        income_estimate = budget_list['income']
        paycheck_item = {'subcategory':'income','budgeted': income_estimate, 'spent': income, 'original_estimate':income_estimate}
        
        if income > income_estimate or complete_month:
           paycheck_item['budgeted']=income
        budget_map['Income'] = [paycheck_item]
        
           
        #include total spent from budget
        #
        data = {
            'success':True,
            'budget_map': budget_map,
        }

        return render_to_response(budget_template, data, context_instance = RequestContext(request))

    else:
        return HttpResponse("nonajax")
                                                        

def excludepaycheck(request):
    if request.is_ajax():
        paycheck_id =  request.POST.get('paycheck_id', None)
        value = json.loads(request.POST.get('enabled', False))

        if paycheck_id:
            _excludepaycheck(paycheck_id, value)
          
            results = {'success':True, 'netPay' : paycheck_id}
            jsonResult = json.dumps(results)
            return HttpResponse(jsonResult, mimetype='application/json')
    else:
        return HttpResponse("nonajax")

def _excludepaycheck(paycheck_id, value):
    paycheck = Paychecks.objects.get(pk=paycheck_id)

    paycheck.excluded = value

    paycheck.save()
