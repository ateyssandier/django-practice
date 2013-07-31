from django.conf.urls import patterns, include, url
from django.views.generic.base import TemplateView
import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'budget.views.home', name='home'),
    # url(r'^budget/', include('budget.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'budgetapp.views.index', name='index'),
    (r'^index/$', 'budgetapp.views.index'),
    url(r'^uploadcsv/$', 'csvprocessor.views.uploadcsv', name='uploadcsv'),
    url(r'^fetch_transactions_ajax/$', 'csvprocessor.views.fetch_transactions', name='fetch_transactions_ajax'),
    (r'^fetch_transactions/$', TemplateView.as_view(template_name='fetch_transactions.html')),
    url(r'^addcategory/$', 'budgetapp.views.addcategory', name='addcategory'),
    url(r'^addpaycheck/$', 'budgetapp.views.addpaycheck', name='addpaycheck'),
    url(r'^addpurchase/$', 'budgetapp.views.addpurchase', name='addpurchase'),
    url(r'^getreport/$', 'budgetapp.views.getreport', name='getreport'),
    url(r'^getpurchasestable/$', 'budgetapp.views.getpurchasetable', name='getpurchasestable'),
    url(r'^get_budget_status/$', 'budgetapp.views.get_budget_status', name='get_budget_status'),
    url(r'^getpaycheckstable/$', 'budgetapp.views.getpaycheckstable', name='getpaycheckstable'),
    url(r'^getsubchart/$', 'budgetapp.views.getsubchart', name='getsubchart'),
)
